#!/usr/bin/env python3
"""Assemble licensed Traffic Marshal footage for review on Windows or Linux."""
import argparse
import ast
import base64
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FPS = 25
RATE = 48000
SIZE = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"
MEDIA_MAP = re.compile(r"(tm[1-5]s[12]): \{file: 'assets/traffic-videos/([^']+\.mp4)'")
CUE = re.compile(r"\*\*التعليق العربي\*\*[ \t]*\n([^\n]+)\n\*\*English subtitle\*\*[ \t]*\n([^\n]+)")


def run(*args, cwd=None):
    return subprocess.check_output([str(arg) for arg in args], cwd=cwd, stderr=subprocess.PIPE)


def probe(file):
    return json.loads(run("ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", file))


def inventory():
    media = dict(MEDIA_MAP.findall((ROOT / "frontend/traffic-staging-config.js").read_text(encoding="utf-8")))
    scripts = (DOCS / "TRAFFIC_VIDEO_BILINGUAL_REVIEW_SCRIPTS.md").read_text(encoding="utf-8")
    shotlist = json.loads((DOCS / "TRAFFIC_TEN_VIDEO_REPLACEMENT_SHOTLIST.json").read_text(encoding="utf-8"))
    result = {}
    for heading, section in re.findall(r"^## [^\n]*\((tm[1-5]s[12])\)[^\n]*\n(.*?)(?=^## |\Z)", scripts, re.M | re.S):
        shot = next(item for item in shotlist["screens"] if item["id"] == heading)
        cues = CUE.findall(section)
        if not cues:
            raise ValueError(f"{heading}: bilingual script has no cues")
        result[heading] = (media[heading], shot, cues)
    if len(result) != 10 or result.keys() != media.keys():
        raise ValueError("Expected ten matching Traffic scripts, shotlists and media mappings")
    return result


def template(lessons):
    return {
        screen: {
            "visual_brief": shot["visual_prompt_en"],
            "visual_gate": shot["visual_acceptance"],
            "shots": [
                {
                    "arabic": ar, "english": en, "clip": "", "start": 0, "tail": 0.5,
                    "source": "", "permission": "", "narration": "",
                }
                for ar, en in cues
            ],
        }
        for screen, (_, shot, cues) in lessons.items()
    }


def file_at(folder, value, label):
    path = (folder / value).resolve()
    if not value or not path.is_file():
        raise ValueError(f"Missing {label}: {value or '(empty)'}")
    return path


def timestamp(frames):
    milliseconds = frames * 1000 // FPS
    seconds, ms = divmod(milliseconds, 1000)
    minutes, sec = divmod(seconds, 60)
    hours, minute = divmod(minutes, 60)
    return f"{hours:02d}:{minute:02d}:{sec:02d}.{ms:03d}"


def audible(file):
    try:
        result = subprocess.run(
            ["ffmpeg", "-nostdin", "-hide_banner", "-i", str(file), "-vn",
             "-af", "volumedetect", "-f", "null", "-"],
            check=True, capture_output=True, text=True, encoding="utf-8", errors="replace",
        )
    except subprocess.CalledProcessError as exc:
        raise ValueError(f"Cannot decode narration {file}") from exc
    peak = re.search(r"max_volume:\s*(-?[\d.]+) dB", result.stderr)
    if not peak or float(peak[1]) < -35:
        raise ValueError(f"Narration is missing or too quiet: {file}")


def write_logo(file):
    # Read the owner-supplied title-card emblem from the earlier producer.
    source = (ROOT / "scripts/build_traffic_real_footage_intro.py").read_text(encoding="utf-8")
    for entry in ast.parse(source).body:
        if isinstance(entry, ast.Assign) and any(isinstance(item, ast.Name) and item.id == "LOGO_JPEG" for item in entry.targets):
            file.write_bytes(base64.b64decode(ast.literal_eval(entry.value), validate=True))
            return
    raise ValueError("Owner-supplied SI emblem not found")


def subtitle(start, end, english):
    wrapped = textwrap.wrap(english, width=69, break_long_words=False)
    if len(wrapped) > 3 or "-->" in english or "\n" in english:
        raise ValueError("English subtitle needs a shorter single-paragraph cue")
    return f"{timestamp(start)} --> {timestamp(end)}\n" + "\n".join(wrapped) + "\n\n"


def render(screen, lesson, shots, source_dir, build, output, voice):
    filename, _, cues = lesson
    if len(shots) != len(cues):
        raise ValueError(f"{screen}: expected {len(cues)} distinct narration shots")
    write_logo(build / "logo.jpg")
    cursor = 0
    captions = []
    source_records = []
    used_ranges = set()
    for index, (shot, (arabic, english)) in enumerate(zip(shots, cues), 1):
        prefix = f"{screen} cue {index}"
        if shot.get("arabic") != arabic or shot.get("english") != english:
            raise ValueError(f"{prefix}: use the text in the current bilingual script")
        if not all(isinstance(shot.get(key), str) and shot[key].strip() for key in ("source", "permission")):
            raise ValueError(f"{prefix}: source and permission evidence are required")
        clip = file_at(source_dir, shot["clip"], "licensed motion footage")
        start, tail = float(shot["start"]), float(shot["tail"])
        if not math.isfinite(start) or not math.isfinite(tail) or start < 0 or not 0 <= tail <= 8:
            raise ValueError(f"{prefix}: invalid source start or visual tail")
        if (clip, start) in used_ranges:
            raise ValueError(f"{prefix}: repeated shot")
        used_ranges.add((clip, start))

        audio = build / f"narration-{index:02}.mp3"
        if shot["narration"]:
            audio = file_at(source_dir, shot["narration"], "Arabic recording")
        elif voice:
            text_file = build / f"narration-{index:02}.txt"
            text_file.write_text(arabic, encoding="utf-8")
            run(sys.executable, "-m", "edge_tts", "--voice", voice, "--file", text_file, "--write-media", audio)
        else:
            raise ValueError(f"{prefix}: provide an Arabic recording or opt in to Edge TTS")
        audible(audio)
        info = probe(audio)
        duration = float(info["format"]["duration"])
        speech_frames = math.ceil(duration * FPS)
        clip_frames = math.ceil((duration + tail) * FPS)
        video = next((item for item in probe(clip)["streams"] if item["codec_type"] == "video"), {})
        if int(video.get("width", 0)) < 640 or int(video.get("height", 0)) < 360:
            raise ValueError(f"{prefix}: expected moving video at 640×360 or higher")
        if video.get("disposition", {}).get("attached_pic") or float(video.get("duration", 0)) < start + clip_frames / FPS:
            raise ValueError(f"{prefix}: source shot must cover the entire narration and visual tail")

        cue = subtitle(0, speech_frames, english)
        (build / "cue.vtt").write_text("WEBVTT\n\n" + cue, encoding="utf-8")
        captions.append(subtitle(cursor, cursor + speech_frames, english))
        cursor += clip_frames
        sizing = f"[0:v]{SIZE},setsar=1,fps={FPS}[shot];[1:v]scale=128:-1[logo];[shot][logo]overlay=W-w-48:40[branded]"
        subtitle_filter = (
            "[branded]subtitles=cue.vtt:force_style='FontName=Arial,FontSize=23,"
            "Alignment=2,MarginV=22,BorderStyle=3,Outline=2,Shadow=0'[out]"
        )
        run(
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", start, "-i", clip,
            "-i", "logo.jpg", "-filter_complex_threads", 1,
            "-filter_complex", f"{sizing};{subtitle_filter}", "-map", "[out]",
            "-frames:v", clip_frames, "-an", "-c:v", "libx264", "-preset", "fast",
            "-threads", "2", "-pix_fmt", "yuv420p", f"video-{index:02}.mp4", cwd=build,
        )
        samples = clip_frames * RATE // FPS
        run(
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", audio, "-vn", "-ac", 1,
            "-af", f"aresample={RATE},apad=whole_len={samples},atrim=end_sample={samples}",
            "-c:a", "pcm_s16le", f"audio-{index:02}.wav", cwd=build,
        )
        source_records.append({
            "cue": index, "clip": shot["clip"], "source": shot["source"],
            "permission": shot["permission"], "start": start, "duration": clip_frames / FPS,
            "narration": shot["narration"] or voice,
        })
    if not 30 <= cursor / FPS <= 600:
        raise ValueError(f"{screen}: expected 30–600 seconds, got {cursor / FPS:.2f}")

    for kind, extension in (("video", "mp4"), ("audio", "wav")):
        listing = "".join(f"file '{kind}-{index:02}.{extension}'\n" for index in range(1, len(cues) + 1))
        (build / f"{kind}.ffconcat").write_text(listing, encoding="ascii")
    movie = output / filename
    run(
        "ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-i", "video.ffconcat",
        "-f", "concat", "-i", "audio.ffconcat", "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
        movie, cwd=build,
    )
    run("ffmpeg", "-nostdin", "-v", "error", "-xerror", "-threads", 2, "-i", movie, "-f", "null", "-")
    audible(movie)
    info = probe(movie)
    if abs(float(info["format"]["duration"]) - cursor / FPS) > 0.1:
        raise ValueError(f"{screen}: output and subtitle timeline drifted")
    movie.with_suffix(".en.vtt").write_text("WEBVTT\n\n" + "".join(captions), encoding="utf-8")
    movie.with_suffix(".review.json").write_text(json.dumps({
        "screen": screen, "status": "REVIEW_ONLY", "visual_review": "PENDING",
        "instructor_review": "PENDING", "sources": source_records,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{screen}: rendered and decoded {filename} ({cursor / FPS:.2f}s)", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", type=Path, help="Write a new shot manifest with the existing bilingual scripts")
    parser.add_argument("--manifest", type=Path, help="Completed shot manifest")
    parser.add_argument("--output", type=Path, help="New review directory outside the learner frontend")
    parser.add_argument("--screen", action="append", help="Render a single screen; repeat for more")
    parser.add_argument("--edge-voice", help="Opt in to Edge TTS for shots without a supplied recording")
    args = parser.parse_args()
    lessons = inventory()
    if args.template:
        with args.template.open("x", encoding="utf-8") as file:
            json.dump(template(lessons), file, ensure_ascii=False, indent=2)
            file.write("\n")
        return
    if not args.manifest or not args.output:
        parser.error("Use --template or supply --manifest and --output")
    output = args.output.resolve()
    frontend = ROOT / "frontend"
    if output == frontend or frontend in output.parents:
        parser.error("Review output must be outside the learner frontend")
    if output.exists():
        parser.error("Review output directory already exists")
    manifest = json.loads(args.manifest.read_text(encoding="utf-8-sig"))
    selected = list(dict.fromkeys(args.screen or lessons))
    if any(screen not in lessons or screen not in manifest for screen in selected):
        parser.error("Every selected screen must be in the manifest and course inventory")
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            parser.error(f"{tool} must be available on PATH")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as temp:
        staging = Path(temp) / "review"
        staging.mkdir()
        for screen in selected:
            with tempfile.TemporaryDirectory(dir=temp) as build:
                render(screen, lessons[screen], manifest[screen]["shots"], args.manifest.resolve().parent,
                       Path(build), staging, args.edge_voice)
        if output.exists():
            raise FileExistsError(output)
        staging.rename(output)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(error.stderr.decode("utf-8", errors="replace").strip())
    except (KeyError, OSError, ValueError) as error:
        sys.exit(str(error))
