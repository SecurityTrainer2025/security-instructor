"""Audit recovered review media and exercise the current Traffic player with browser-only fixtures."""
import base64
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

from build_traffic_real_footage_intro import LOGO_JPEG

ROOT = Path(__file__).resolve().parents[1]
MEDIA = Path(sys.argv[1]).resolve()
REPORT = MEDIA / "QA"
REPORT.mkdir(exist_ok=True)
REVIEW_NAMES = {"tm1s1": "SI_Traffic_Marshal_Real_Footage_Intro_REVIEW.mp4"}
REVIEW_NAMES.update({row["id"]: row["file"]
                     for row in json.loads((MEDIA / "BATCH_REVIEW_INVENTORY.json").read_text())})
SCREENS = json.loads(subprocess.check_output(
    ["node", "-e", "console.log(JSON.stringify(require('./backend/self-study-traffic-config').TRAFFIC_SCREENS))"],
    cwd=ROOT, text=True))
assert set(REVIEW_NAMES) == {screen["id"] for screen in SCREENS}
assert len(list(MEDIA.glob("*.mp4"))) == len(list(MEDIA.glob("*.en.vtt"))) == 10

def run(*args, input_bytes=None):
    return subprocess.run(args, input=input_bytes, capture_output=True, check=True)

def seconds(value):
    h, m, s = value.split(":")
    return int(h)*3600 + int(m)*60 + float(s)

def inspect(screen):
    id = screen["id"]
    media = MEDIA / REVIEW_NAMES[id]
    vtt = media.with_suffix(".en.vtt").read_text(encoding="utf-8-sig")
    assert vtt.startswith("WEBVTT")
    cues = [(seconds(a), seconds(b)) for a, b in re.findall(
        r"^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})$", vtt, re.M)]
    previous = 0
    info = json.loads(run("ffprobe", "-v", "error", "-show_streams", "-show_format",
                          "-of", "json", str(media)).stdout)
    length = float(info["format"]["duration"])
    for start, end in cues:
        assert previous <= start < end <= length + .05, (id, start, end, length)
        previous = end
    assert cues, id
    video = next(s for s in info["streams"] if s["codec_type"] == "video")
    audio = next(s for s in info["streams"] if s["codec_type"] == "audio")
    assert (video["codec_name"], video["width"], video["height"]) == ("h264", 1920, 1080)
    assert audio["codec_name"] == "aac"
    run("ffmpeg", "-v", "error", "-xerror", "-i", str(media), "-f", "null", "-")
    stats = run("ffmpeg", "-hide_banner", "-i", str(media), "-vn", "-af", "volumedetect",
                "-f", "null", "-").stderr.decode()
    max_volume = float(re.search(r"max_volume: (-?[\d.]+) dB", stats)[1])
    assert max_volume > -30, (id, max_volume)
    flash = run("ffmpeg", "-v", "error", "-ss", "0.5", "-i", str(media), "-frames:v", "1",
                "-vf", f"crop=192:192:864:{354 if id=='tm1s1' else 339},format=rgb24",
                "-c:v", "rawvideo", "-threads", "1", "-f", "rawvideo", "-").stdout
    logo = run("ffmpeg", "-v", "error", "-f", "mjpeg", "-i", "pipe:0", "-frames:v", "1",
               "-pix_fmt", "rgb24", "-c:v", "rawvideo", "-threads", "1", "-f", "rawvideo", "-",
               input_bytes=base64.b64decode(LOGO_JPEG)).stdout
    assert len(logo) == len(flash) == 192*192*3
    logo_difference = sum(abs(a-b) for a,b in zip(logo,flash)) / len(logo)
    assert logo_difference < 15, (id, logo_difference)
    # Copy each slate and an actual scene frame into the QA package for visual sign-off.
    for label, at in (("title", 0.5), ("scene", 4)):
        run("ffmpeg", "-v", "error", "-y", "-ss", str(at), "-i", str(media),
            "-frames:v", "1", "-vf", "scale=640:-2", str(REPORT / f"{id}-{label}.jpg"))
    return {"id": id, "file": media.name, "seconds": length, "cues": cues, "peak_dBFS": max_volume,
            "logo_rgb_mean_error": round(logo_difference, 2), "passes_final_runtime": 30 <= length <= 600}

def browsers(results):
    local = "http://traffic-review.test"
    fixture_api = "https://si-avs-staging-test.onrender.com"
    course = "/api/self-study"
    mime = {".mp4": "video/mp4", ".vtt": "text/vtt"}
    qa = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", args=["--autoplay-policy=no-user-gesture-required"])
        for label, options in (
            ("desktop Chrome", {"viewport": {"width": 1440, "height": 900}}),
            ("mobile Chrome emulation", p.devices["Pixel 7"]),
        ):
            context = browser.new_context(**options)
            for index, screen in enumerate(SCREENS):
                expected = REVIEW_NAMES[screen["id"]]
                expected_vtt = expected.replace(".mp4", ".en.vtt")
                page = context.new_page()
                page.add_init_script(f"""
                    localStorage.setItem('siTrafficStagingSelfStudySession', 'fixture-only');
                    sessionStorage.setItem('siTrafficStagingSelfStudyIndex', '{index}');
                """)
                rejected = []
                def serve(route):
                    request = route.request
                    url = urlparse(request.url)
                    if request.url.startswith(fixture_api + "/"):
                        payload = {
                            course+"/me": {"course":{"code":"CRS-TRAFFIC-001"},"progress":{},
                                          "certificateEnabled":False},
                            course+"/heartbeat": {"activeStudySeconds":0},
                            course+"/courses/traffic-management-vehicle-control/screens": {"screens":SCREENS},
                            course+"/screens/"+screen["id"]: {
                                **screen, "videoUrl": "assets/traffic-videos/" + expected,
                                "questions": [{"q": q["q"], "options": q["a"]} for q in screen["questions"]]
                            },
                        }.get(url.path)
                        if payload is not None:
                            return route.fulfill(json=payload,headers={"access-control-allow-origin":"*"})
                    elif request.url.startswith(local+"/"):
                        name = url.path.rsplit("/",1)[-1]
                        if name in (expected,expected_vtt):
                            return route.fulfill(path=MEDIA/name,content_type=mime[Path(name).suffix])
                        if name in ("traffic-staging-config.js","traffic-self-study.html"):
                            return route.fulfill(path=ROOT/"frontend"/name)
                        return route.fulfill(status=404)
                    rejected.append(request.url)
                    route.abort()
                page.route("**/*", serve)
                page.goto(local + "/traffic-self-study.html")
                video = page.locator("#content video")
                video.wait_for()
                assert page.locator("#content h1").inner_text() == screen["titleEn"]
                assert video.locator("source").get_attribute("src").endswith("/"+expected)
                assert video.get_attribute("playsinline") is not None
                assert video.get_attribute("controls") is not None
                assert page.get_by_role("note").count() > 0
                video.evaluate("""async video => {
                    video.textTracks[0].mode = 'showing';
                    await video.play();
                }""")
                page.wait_for_function("""() => {
                    const video=document.querySelector('#content video');
                    return video.currentTime > .2 && video.textTracks[0].cues?.length > 0;
                }""", timeout=12000)
                assert not rejected, rejected
                assert video.evaluate("v => v.textTracks[0].cues.length") == len(results[index]["cues"])
                qa.append({"id": screen["id"], "profile": label, "playback": "passed", "captions": "loaded"})
                page.close()
            context.close()
        browser.close()
    return qa

results = [inspect(screen) for screen in SCREENS]
print("SI_TECHNICAL_QA", json.dumps(results), flush=True)
(REPORT / "technical.json").write_text(json.dumps(results, indent=2))
checks = browsers(results)
print("SI_BROWSER_QA", json.dumps(checks), flush=True)
(REPORT / "browser.json").write_text(json.dumps(checks, indent=2))
