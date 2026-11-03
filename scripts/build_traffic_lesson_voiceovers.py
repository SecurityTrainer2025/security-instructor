#!/usr/bin/env python3
"""Review-only Egyptian Arabic narration for six Traffic training previews.
Fails closed: no silent or overlong narrated files are accepted.
"""
import asyncio
import subprocess
import tempfile
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "frontend/assets/traffic-videos"
VOICE = "ar-EG-ShakirNeural"
ITEMS = [
    ("01_gate_access", "عند البوابة، راجع التصريح واتبع إجراءات الموقع. حافظ على مسار الدخول واضحًا."),
    ("02_pedestrian_separation", "أوقف المركبات قبل عبور المشاة. وافصل المسارات حسب خطة الموقع المعتمدة."),
    ("03_parking_operations", "نظّم الوقوف في الأماكن المحددة. واترك مسارات الطوارئ مفتوحة دائمًا."),
    ("04_incident_response", "عند وقوع حادث، أمّن المكان دون تعريض نفسك للخطر. وأبلغ غرفة التحكم فورًا."),
    ("05_hand_signals", "استخدم إشارات اليد المعتمدة والواضحة. وإذا لم يفهم السائق، أوقف الحركة."),
    ("06_risk_position", "قف في مكان يراك فيه السائق. وتجنب النقاط العمياء، وحدد طريقًا آمنًا للابتعاد."),
]

def probe(path, stream=None):
    cmd = ["ffprobe", "-v", "error"]
    if stream:
        cmd += ["-select_streams", stream, "-show_entries", "stream=codec_name", "-of", "default=noprint_wrappers=1:nokey=1"]
    else:
        cmd += ["-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1"]
    return subprocess.run(cmd + [str(path)], check=True, capture_output=True, text=True).stdout.strip()

async def main():
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        for name, script in ITEMS:
            source = DIR / (name + ".mp4")
            if not source.is_file():
                raise RuntimeError(f"Missing source video: {source}")
            video_duration = float(probe(source))
            if abs(video_duration - 8.0) > 0.2:
                raise RuntimeError(f"Unexpected source duration for {name}: {video_duration}")
            voice = tmp / (name + ".mp3")
            await edge_tts.Communicate(script, VOICE, rate="+15%").save(str(voice))
            voice_duration = float(probe(voice))
            if not (0.1 < voice_duration <= 7.7):
                raise RuntimeError(f"{name}: narration {voice_duration:.2f}s exceeds safe 8s scene budget")
            candidate = tmp / (name + ".mp4")
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(source),
                "-i", str(voice), "-filter_complex", "[1:a]apad[a]",
                "-map", "0:v:0", "-map", "[a]", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "128k", "-t", "8",
                "-movflags", "+faststart", str(candidate)
            ], check=True)
            if probe(candidate, "a:0") != "aac" or abs(float(probe(candidate)) - 8) > 0.2:
                raise RuntimeError(f"Audio validation failed for {name}")
            candidate.replace(DIR / (name + "_narrated.mp4"))
            print(f"PASS: {name}, speech {voice_duration:.2f}s, narrated preview 8s")

if __name__ == "__main__":
    asyncio.run(main())
