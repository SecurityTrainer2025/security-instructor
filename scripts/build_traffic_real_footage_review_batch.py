"""Render short review cuts with licensed context footage and measured caption timing."""
import asyncio
import base64
import json
import re
import shutil
import tempfile
import time
import urllib.request
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
ITEMS = json.loads(r'''[{"id":"tm1s2","number":2,"title":"Traffic management plan and risk assessment","lines":[["راجع خطة المرور مع المشرف قبل بدء العمل. حدد المداخل والمخارج، واتجاهات السير، ومسارات المشاة والطوارئ.","Review the traffic plan with your supervisor before starting. Locate entrances, exits, travel directions, and pedestrian and emergency routes."],["افحص خطوط الرؤية والنقاط العمياء ومسار التفاف المركبات. عند تراجع الرؤية أبلغ غرفة التحكم وطبّق القيود المحددة في الخطة.","Check sightlines, blind spots and vehicle turning paths. If visibility drops, notify control and apply the restrictions in the plan."]],"page":"https://www.pexels.com/video/a-man-and-woman-holding-a-blueprint-while-looking-at-construction-site-8964796/","fallback":null,"context":"Site planning context"},{"id":"tm2s1","number":3,"title":"Access and inspection traffic","lines":[["استخدم حارة الانتظار المعتمدة وأبقِ مسار الطوارئ مفتوحًا. يتولى فريق الأمن المخوّل فحص التصاريح.","Use the designated holding lane and keep emergency access clear. Authorised security staff check permits."],["تمتلئ حارات التفتيش أحيانًا. أبقِ المركبة في نقطة انتظار آمنة إلى أن يؤكد مسؤول التفتيش جاهزية الحارة.","Inspection lanes may fill up. Hold the vehicle in an approved safe area until the inspection lead confirms the bay is ready."]],"page":"https://www.pexels.com/video/aerial-view-of-industrial-warehouse-facility-35911111/","fallback":"https://videos.pexels.com/video-files/4848327/4848327-uhd_4096_2160_24fps.mp4","context":"Access and industrial traffic context"},{"id":"tm2s2","number":4,"title":"Driver briefing and noncompliance","lines":[["اشرح للسائق المتوقف المسار المعتمد وحد السرعة وأماكن الوقوف والتحميل ومعابر المشاة. اطلب منه تأكيد فهم التعليمات.","Brief the stopped driver on the route, speed limit, parking, loading areas and crossings. Ask them to confirm the instructions."],["إذا رفض السائق التوجيه، حافظ على مسافة آمنة وصعّد الموقف للمشرف المخوّل وفق إجراءات الموقع.","If the driver refuses a direction, keep a safe distance and escalate to the authorised supervisor under site procedures."]],"page":"https://www.pexels.com/video/a-woman-and-a-man-talking-at-a-construction-site-8964769/","fallback":null,"context":"Site conversation context"},{"id":"tm3s1","number":5,"title":"Pedestrian separation and traffic calming","lines":[["حدد الممرات المخصصة للمشاة والمعابر المحمية والمسارات الميسّرة. حافظ على وضوح الرؤية عند المعبر.","Identify designated walkways, protected crossings and accessible routes. Maintain clear sightlines at crossings."],["إذا حجبت مركبة المعبر، أمّن الحركة ونسق إزالة العائق قبل إعادة فتحه. تُضبط الحواجز ووسائل التهدئة وفق الخطة المعتمدة.","If a vehicle blocks the crossing, secure movement and arrange for the obstruction to be removed before reopening it. Follow the approved plan for barriers and traffic calming."]],"page":"https://www.pexels.com/video/cars-stopping-at-a-pedestrian-crossing-2863232/","fallback":"https://videos.pexels.com/video-files/7259509/7259509-uhd_4096_2160_30fps.mp4","context":"Pedestrian and vehicle context"},{"id":"tm3s2","number":6,"title":"Parking and safe reversing","lines":[["حافظ على خلو مسارات التحميل والطوارئ واتبع تخصيص أماكن الوقوف. اختر مسارًا يقلل الحاجة إلى الرجوع كلما أمكن.","Keep loading and emergency routes clear and follow parking allocations. Use routes that minimise reversing where possible."],["عندما تتطلب الخطة استخدام موجّه مدرّب، يبقى خارج مسار المركبة وفي مجال رؤية السائق. إذا فقد السائق رؤية الموجّه، يتوقف فورًا.","Where the plan requires a trained signaller, they stay clear of the vehicle path and in the driver's view. The driver stops immediately on losing sight of the signaller."]],"page":"https://www.pexels.com/video/loading-a-truck-with-construction-products-9856371/","fallback":null,"context":"Loading area context; no reversing demonstration"},{"id":"tm4s1","number":7,"title":"PPE, weather and emergency access","lines":[["ارتدِ معدات الوقاية المحددة للعمل، وتحقق من وضوح ملابس الرؤية. اتبع ترتيبات الماء والظل وفترات الراحة أثناء الحر.","Wear the PPE required for the task and check that high-visibility clothing is visible. Follow the site's water, shade and rest arrangements in hot weather."],["أبلغ عن تراجع الرؤية أو تغير سطح الطريق، وطبّق إجراء الموقع لتقييد الحركة. أبقِ مسار الطوارئ متاحًا.","Report reduced visibility or changes in the road surface and follow the site's procedure for restricting movement. Keep the emergency route available."]],"page":"https://www.pexels.com/video/two-men-in-hard-hats-and-safety-vests-are-working-on-a-truck-27514738/","fallback":"https://videos.pexels.com/video-files/8486788/8486788-uhd_3840_2160_30fps.mp4","context":"Visible PPE context"},{"id":"tm4s2","number":8,"title":"Incident reporting","lines":[["بعد اتخاذ إجراءات السلامة والإبلاغ الأولي، سجّل الوقت والمكان وتسلسل ما شاهدته. ميّز بين ملاحظاتك المباشرة وأقوال الشهود.","After taking safety measures and making the initial report, record the time, location and sequence of what you observed. Distinguish direct observations from witness accounts."],["أرسل التقرير عبر القناة المعتمدة واحفظ البيانات الشخصية وفق إجراءات الموقع.","Submit the report through the approved channel and protect personal information under site procedures."]],"page":"https://www.pexels.com/video/a-man-writing-on-a-paper-while-checking-the-drainage-8293298/","fallback":null,"context":"Documentation context"},{"id":"tm5s1","number":9,"title":"Six hand signals - safety briefing","lines":[["اتفق مع السائق على الإشارات المعتمدة قبل أي حركة. عند غموض الإشارة أو فقد الاتصال البصري، يتوقف السائق.","Agree on the approved signals with the driver before moving. The driver stops if a signal is unclear or visual contact is lost."],["يراجع المدرب إشارات التقدم والرجوع والانعطاف والخروج والتوقف العادي والتوقف الطارئ. تدرّب في منطقة مغلقة تحت الإشراف.","The instructor reviews forward, reverse, turn, exit, normal stop and emergency stop. Practise in a closed area under supervision."],["هذا الفيديو للإحاطة. شاهد التطبيق العملي مع المدرب المعتمد قبل توجيه أي مركبة.","This is a safety briefing. Observe the practical demonstration with an approved instructor before directing vehicles."]],"page":"https://www.pexels.com/video/workers-walking-in-construction-site-5434223/","fallback":null,"context":"Workplace context only - no signal demonstration"},{"id":"tm5s2","number":10,"title":"Radio and shift handover","lines":[["ابدأ بنداء الجهة المعنية، ثم اذكر موقعك والموقف والطلب. اطلب تأكيد الرسالة عبر القناة المعتمدة.","Call the intended recipient, then state your location, the situation and your request. Ask for acknowledgement on the approved channel."],["عند تسليم الوردية، وضّح حالة الحارات والمخاطر القائمة ومسار الطوارئ. أكّد انتقال المهمة قبل مغادرة موقعك.","At handover, explain lane conditions, current hazards and the emergency route. Confirm the transfer of responsibility before leaving your post."]],"page":"https://www.pexels.com/video/a-man-in-a-construction-site-using-walkie-talkie-8963859/","fallback":null,"context":"Radio use context"}]''')
LICENSE = "https://www.pexels.com/license/"
WIDTH = 1920
HEIGHT = 1080


def fetch_stock(item, path, probe_duration):
    number = re.search(r"-(\d+)/$", item["page"]).group(1)
    candidates = [(f"https://www.pexels.com/download/video/{number}/", item["page"])]
    if item["fallback"]:
        candidates.append((item["fallback"], {
            "4848327": "https://www.pexels.com/video/a-person-standing-near-a-roadblock-4848327/",
            "7259509": "https://www.pexels.com/video/construction-workers-waiting-cars-to-pass-by-to-cross-street-7259509/",
            "8486788": "https://www.pexels.com/video/pull-out-shot-of-a-flagman-8486788/",
        }[item["fallback"].split("/")[4]]))
    for url, page in candidates:
        deadline = time.monotonic() + 22
        try:
            request = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0",
                "Referer": page,
            })
            with urllib.request.urlopen(request, timeout=10) as response, path.open("wb") as output:
                while chunk := response.read(256 * 1024):
                    if time.monotonic() > deadline:
                        raise TimeoutError("Stock download exceeded 22 seconds")
                    output.write(chunk)
            if probe_duration(path) >= 3:
                return page
        except Exception as error:
            print(f"{item['id']} stock unavailable at {page}: {error}", flush=True)
    raise RuntimeError("No stock source was downloadable and decodable")


async def build_lesson(item, out, logo_data, voice, sh, probe_duration, timestamp):
    with tempfile.TemporaryDirectory(prefix="si-traffic-review-") as name:
        folder = Path(name)
        raw = folder / "stock.mp4"
        source = await asyncio.to_thread(fetch_stock, item, raw, probe_duration)
        logo = folder / "logo.jpg"
        logo.write_bytes(base64.b64decode(logo_data))
        voiced = []
        cues = []
        offset = 2.0
        for index, (ar, en) in enumerate(item["lines"]):
            mp3 = folder / f"line{index}.mp3"
            for attempt in range(3):
                try:
                    await asyncio.wait_for(edge_tts.Communicate(ar, voice, rate="+5%").save(str(mp3)), timeout=22)
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(1 + attempt)
            duration = probe_duration(mp3)
            wav = folder / f"line{index}.wav"
            sh("ffmpeg", "-y", "-v", "error", "-i", mp3, "-af", "apad=pad_dur=0.45",
               "-ar", "48000", "-ac", "2", wav)
            cues.append((timestamp(offset), timestamp(offset+duration), en))
            offset += probe_duration(wav)
            voiced.append(wav)

        slate_text = folder / "slate.txt"
        slate_text.write_text(f"{item['number']:02} | {item['title']}", encoding="utf-8")
        takeaway = folder / "takeaway.txt"
        takeaway.write_text("Follow your approved site procedures", encoding="utf-8")
        clips = []
        settings = ["-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "25"]
        for name, text_file, length in [
            ("title", slate_text, 2.0),
            ("closing", takeaway, max(0.4, offset - 2 - min(15, probe_duration(raw)))),
        ]:
            clip = folder / f"{name}.mp4"
            sh("ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", "25", "-i", logo, "-vf",
               f"scale=192:192,pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2-105:color=0x0B1F33,setsar=1,"
               f"drawtext=textfile={text_file}:fontsize=49:fontcolor=0xC8A96B:x=(w-tw)/2:y=h/2+55,"
               "drawtext=text='TRAFFIC MARSHAL / REVIEW COPY':fontsize=32:fontcolor=white:x=(w-tw)/2:y=h/2+144",
               "-t", length, *settings, clip)
            clips.append(clip)
        footage = folder / "footage.mp4"
        context_file = folder / "context.txt"
        context_file.write_text("REVIEW ONLY | " + item["context"].upper(), encoding="utf-8")
        sh("ffmpeg", "-y", "-v", "error", "-i", raw, "-vf",
           f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease,"
           f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25,"
           f"drawtext=textfile={context_file}:fontsize=32:fontcolor=white:box=1:"
           "boxcolor=black@0.82:boxborderw=14:x=32:y=32",
           "-t", min(15, probe_duration(raw)), *settings, footage)
        picture_list = folder / "picture.txt"
        picture_list.write_text("".join(f"file '{clip}'\n" for clip in (clips[0], footage, clips[1])))
        silence = folder / "silence.wav"
        sh("ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "2", silence)
        audio_list = folder / "audio.txt"
        audio_list.write_text("".join(f"file '{clip}'\n" for clip in (silence, *voiced)))
        # The review cut ends when the narration track ends (the tail contains a short planned pause).
        stem = f"SI_Traffic_{item['number']:02}_{item['id']}_REVIEW"
        temp_output = folder / (stem + ".mp4")
        sh("ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", picture_list,
           "-f", "concat", "-safe", "0", "-i", audio_list, "-map", "0:v:0", "-map", "1:a:0",
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "25", "-c:a", "aac",
           "-b:a", "144k", "-shortest", "-movflags", "+faststart", temp_output)
        sh("ffmpeg", "-v", "error", "-xerror", "-i", temp_output, "-f", "null", "-")
        seconds = probe_duration(temp_output)
        if seconds < offset - 0.4:
            raise RuntimeError("Video ended before its complete narration")
        shutil.copyfile(temp_output, out / (stem + ".mp4"))
        (out / (stem + ".en.vtt")).write_text("WEBVTT\n\n" + "\n\n".join(
            f"{i}\n{start} --> {end}\n{content}" for i, (start, end, content) in enumerate(cues, 1)
        ) + "\n", encoding="utf-8")
        return {"id": item["id"], "file": stem + ".mp4", "seconds": seconds,
                "audio": "Arabic AAC narration", "caption_cues": len(cues),
                "source": source, "license": LICENSE, "status": "UNAPPROVED REVIEW"}


async def build_batch(out, logo_data, voice, sh, probe_duration, timestamp):
    slots = asyncio.Semaphore(3)

    async def export(item):
        async with slots:
            try:
                result = await build_lesson(item, out, logo_data, voice, sh, probe_duration, timestamp)
            except Exception as error:
                result = {"id": item["id"], "status": "NO MP4", "reason": f"{type(error).__name__}: {error}"}
            print("SI_BATCH_RESULT", json.dumps(result, ensure_ascii=False), flush=True)
            return result

    report = await asyncio.gather(*(export(item) for item in ITEMS))
    (out / "BATCH_REVIEW_INVENTORY.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
