#!/usr/bin/env python3
"""Optional free Arabic TTS pilot; never publish silent audio as narrated.
Requires edge-tts (network access) and ffmpeg. Fails closed on TTS errors.
"""
import asyncio
import subprocess
import tempfile
from pathlib import Path
import edge_tts

ROOT=Path(__file__).resolve().parents[1]
VIDEO=ROOT/"frontend/assets/traffic-videos/00_course_introduction.mp4"
OUT=ROOT/"frontend/assets/traffic-videos/00_course_introduction_narrated.mp4"
VOICE="ar-SA-HamedNeural"
SCENES=[
"أهلاً بكم في دورة إدارة حركة المرور. هدفنا الأول حماية الأشخاص وتنظيم حركة المركبات بصورة آمنة وواضحة.",
"عند البوابات، تحقق من التصاريح وفق إجراءات الموقع المعتمدة، وحافظ على مسارات الدخول والخروج واضحة.",
"انتبه دائمًا لعبور المشاة. افصل مساراتهم عن المركبات، واتبع ترتيبات العبور الآمن المعتمدة بالموقع.",
"نظّم حركة المواقف، ولا تسمح بإغلاق مسارات الطوارئ أو إعاقة وصول مركبات الاستجابة.",
"احرص على وضوح رؤيتك للسائقين، وتجنب النقاط العمياء، ولا تعمل خارج خطة المرور وتقييم المخاطر المعتمدين.",
]

def duration(path):
    p=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)],capture_output=True,text=True,check=True)
    return float(p.stdout.strip())

async def main():
    if not VIDEO.exists(): raise RuntimeError("Source video missing")
    with tempfile.TemporaryDirectory() as td:
        tmp=Path(td)
        clips=[]
        for i,script in enumerate(SCENES):
            mp3=tmp/f"scene_{i}.mp3"
            await edge_tts.Communicate(script,VOICE,rate="+10%").save(str(mp3))
            d=duration(mp3)
            if not (0.1<d<=11.5):
                raise RuntimeError(f"Scene {i+1} narration is {d:.2f}s, must fit 12s. No narrated video will be published.")
            wav=tmp/f"scene_{i}.wav"
            subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(mp3),"-af","apad=pad_dur=12","-t","12","-ar","48000","-ac","2",str(wav)],check=True)
            clips.append(wav)
        manifest=tmp/"concat.txt"
        manifest.write_text("".join(f"file '{p}'\n" for p in clips),encoding="utf-8")
        audio=tmp/"narration.wav"
        subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",str(manifest),"-c:a","pcm_s16le",str(audio)],check=True)
        candidate=tmp/"narrated.mp4"
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(VIDEO),"-i",str(audio),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","128k","-t","60","-movflags","+faststart",str(candidate)],check=True)
        streams=subprocess.run(["ffprobe","-v","error","-select_streams","a:0","-show_entries","stream=codec_name","-of","default=noprint_wrappers=1:nokey=1",str(candidate)],capture_output=True,text=True,check=True).stdout.strip()
        if streams!="aac" or abs(duration(candidate)-60)>0.5:raise RuntimeError("Narrated video verification failed")
        candidate.replace(OUT)
        print(f"Created verified Arabic narration pilot: {OUT}")

if __name__=="__main__":
    asyncio.run(main())
