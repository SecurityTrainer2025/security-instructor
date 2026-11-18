#!/usr/bin/env python3
"""Add original Arabic narration to the seven isolated SI Traffic pilot videos.

The script fails closed if any narration cannot be generated or verified.
Only the feat/self-study-traffic-course branch workflow may publish its output.
"""
import asyncio
import math
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "frontend/assets/traffic-videos"
VOICE = "ar-EG-ShakirNeural"

NARRATION = {
    "00_course_introduction.mp4": [
        "مرحبًا بكم في دورة إدارة حركة المرور. سلامة الأشخاص هي أولويتنا.",
        "عند البوابات، تحقق من التصاريح واتبع تعليمات الدخول والخروج.",
        "انتبه لعبور المشاة، واحرص على الفصل الآمن بينهم وبين المركبات.",
        "حافظ على مسارات الطوارئ مفتوحة، ونظم حركة المواقف بأمان.",
        "اختر موضعًا آمنًا وواضحًا للسائقين، والتزم بخطة الموقع.",
    ],
    "01_gate_access.mp4": ["تحقق من تصريح الدخول، وحافظ على وضوح مسارات المركبات عند البوابة."],
    "02_pedestrian_separation.mp4": ["أوقف حركة المركبات بأمان قبل السماح للمشاة بالعبور وفق خطة الموقع."],
    "03_parking_operations.mp4": ["نظم حركة المواقف، واترك طرق الطوارئ ومخارج المركبات مفتوحة دائمًا."],
    "04_incident_response.mp4": ["عند وقوع حادث، احم الأشخاص أولًا، وأبلغ غرفة التحكم، وسجل المعلومات بدقة."],
    "05_hand_signals.mp4": ["استخدم إشارات اليد المعتمدة بوضوح، وتوقف إذا لم يفهم السائق تعليماتك."],
    "06_risk_position.mp4": ["اختر مكانًا آمنًا ومرئيًا، وانتبه للنقاط العمياء ومسارات الهروب."],
}

def probe(file: Path, audio=False):
    args = ["ffprobe", "-v", "error", "-show_entries",
            "stream=codec_name" if audio else "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1"]
    if audio:
        args[3:3] = ["-select_streams", "a:0"]
    p = subprocess.run(args + [str(file)], capture_output=True, text=True, check=True)
    return p.stdout.strip()

def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *map(str, args)], check=True)

async def narrated_video(source: Path, lines: list[str], tmp: Path):
    duration = float(probe(source))
    slots = len(lines)
    slot_length = duration / slots
    segments = []
    for index, line in enumerate(lines):
        speech = tmp / f"{source.stem}-{index}.mp3"
        await edge_tts.Communicate(line, VOICE, rate="+15%").save(str(speech))
        speech_length = float(probe(speech))
        if not speech.exists() or speech.stat().st_size < 1000 or speech_length <= 0:
            raise RuntimeError(f"Speech generation failed for {source.name} segment {index}")
        target = slot_length * 0.88
        speed = max(1.0, speech_length / target)
        segment = tmp / f"{source.stem}-{index}.wav"
        ffmpeg("-i", speech, "-af", f"atempo={speed:.4f},apad",
               "-t", f"{slot_length:.5f}", "-ar", "48000", "-ac", "2", segment)
        segments.append(segment)
    manifest = tmp / f"{source.stem}-parts.txt"
    manifest.write_text("".join(f"file '{p}'\n" for p in segments), encoding="utf-8")
    wav = tmp / f"{source.stem}-all.wav"
    ffmpeg("-f", "concat", "-safe", "0", "-i", manifest, "-c:a", "pcm_s16le", wav)
    candidate = tmp / source.name
    ffmpeg("-i", source, "-i", wav, "-map", "0:v:0", "-map", "1:a:0",
           "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
           "-t", f"{duration:.3f}", "-movflags", "+faststart", candidate)
    if probe(candidate, audio=True) != "aac":
        raise RuntimeError(f"No AAC narration in {source.name}")
    actual_duration = float(probe(candidate))
    if abs(actual_duration - duration) > 0.5:
        raise RuntimeError(f"Video duration mismatch for {source.name}")
    return candidate

async def main():
    # Generate and validate all outputs before replacing any original video.
    with tempfile.TemporaryDirectory(prefix="si-traffic-audio-") as d:
        tmp = Path(d)
        candidates = {}
        for name, lines in NARRATION.items():
            source = MEDIA / name
            if not source.is_file():
                raise RuntimeError(f"Required Traffic video is missing: {name}")
            candidates[name] = await narrated_video(source, lines, tmp)
            print(f"Verified narration: {name}")
        for name, candidate in candidates.items():
            (MEDIA / name).write_bytes(candidate.read_bytes())
    print("SUCCESS: all seven Traffic preview videos have verified Arabic AAC narration.")

if __name__ == "__main__":
    asyncio.run(main())
