#!/usr/bin/env python3
"""Build a REAL-FOOTAGE Traffic Marshal intro MP4 as a review artifact, not a deployed lesson.
Sources: four actual Pexels stock videos under https://www.pexels.com/license/.
Do not imply these actors endorse SI or their gestures demonstrate a mandated signal.
The official SI emblem must be added from owner-approved original media before publishing.
"""
import asyncio
import json
import subprocess
import tempfile
import urllib.request
from pathlib import Path
import edge_tts

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"traffic-intro-build"
OUT.mkdir(exist_ok=True)
SOURCE=[
("Aerial view, context","https://videos.pexels.com/video-files/33931078/14399048_3840_2160_24fps.mp4",7.5,"https://www.pexels.com/video/aerial-view-of-highway-and-construction-site-33931078/"),
("Real flagger at work","https://videos.pexels.com/video-files/8486788/8486788-uhd_3840_2160_30fps.mp4",8.0,"https://www.pexels.com/video/pull-out-shot-of-a-flagman-8486788/"),
("Roadside traffic context","https://videos.pexels.com/video-files/4848327/4848327-uhd_4096_2160_24fps.mp4",9.0,"https://www.pexels.com/video/a-person-standing-near-a-roadblock-4848327/"),
("Pedestrians and construction","https://videos.pexels.com/video-files/7259509/7259509-uhd_4096_2160_30fps.mp4",9.0,"https://www.pexels.com/video/construction-workers-waiting-cars-to-pass-by-to-cross-street-7259509/")
]
VOICE="ar-EG-ShakirNeural"
NARRATION=(
"مرحباً بكم في دورة التحكم بحركة المرور من منصة سيكيوريتي إنستركتور. "
"يتولى منظم حركة المرور، أو ترافك مارشال، المساعدة في توجيه المركبات والمشاة داخل الموقع. "
"تبدأ المهمة بقراءة خطة المرور، وتحديد المداخل والمخارج ومسارات الطوارئ. "
"سلامة الأشخاص هي الأولوية دائماً. "
"يجب التمركز في مكان آمن ومرئي للسائقين، واستخدام الإشارات المعتمدة فقط، "
"والتنسيق مع فريق البوابة وغرفة التحكم عند وجود ازدحام أو خطر. "
"تذكر: سلامة الأشخاص أولاً، وخطة الموقع قبل أي اجتهاد."
)
SUBS=[
("00:00:00.000","00:00:06.000","Welcome to Traffic Control training from SECURITY INSTRUCTOR."),
("00:00:06.000","00:00:12.500","A Traffic Marshal supports safe movements of vehicles and pedestrians."),
("00:00:12.500","00:00:19.000","Start by reviewing the traffic plan, entrances, exits and emergency routes."),
("00:00:19.000","00:00:24.000","People's safety always comes first."),
("00:00:24.000","00:00:30.000","Stay visible and safe; use only approved signals and coordinate with the gate team."),
("00:00:30.000","00:00:33.500","People before speed. The approved site plan before improvisation.")
]

def sh(*args):
 subprocess.run(list(map(str,args)),check=True)
def probe_duration(path):
 p=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(path)],capture_output=True,text=True,check=True)
 return float(p.stdout.strip())

async def main():
 with tempfile.TemporaryDirectory(prefix="si-real-intro-") as td:
  wd=Path(td)
  clips=[]
  for i,(description,url,seconds,page) in enumerate(SOURCE):
   raw=wd/f"source_{i}.mp4"
   req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 SI-training-review/1.0"})
   with urllib.request.urlopen(req,timeout=150) as response,raw.open("wb") as target:
    while True:
     buf=response.read(2*1024*1024)
     if not buf:break
     target.write(buf)
   if raw.stat().st_size<100000:raise RuntimeError(f"Invalid stock footage {i}")
   duration=probe_duration(raw)
   if duration<seconds-0.4:raise RuntimeError(f"Source {i} too short: {duration}s")
   clip=wd/f"clip_{i}.mp4"
   vf=("scale=1280:720:force_original_aspect_ratio=increase,"
       "crop=1280:720,setsar=1,format=yuv420p,fps=24")
   sh("ffmpeg","-y","-loglevel","error","-i",raw,"-t",seconds,"-vf",vf,
      "-an","-c:v","libx264","-preset","veryfast","-crf","24",
      "-movflags","+faststart",clip)
   clips.append(clip)
  manifest=wd/"concat.txt"
  manifest.write_text("".join(f"file '{clip}'\n" for clip in clips),encoding="utf8")
  joined=wd/"joined.mp4"
  sh("ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",manifest,"-c","copy",joined)
  voice=wd/"voice.mp3"
  await edge_tts.Communicate(NARRATION,VOICE,rate="+18%").save(str(voice))
  total=probe_duration(joined)
  voice_length=probe_duration(voice)
  if voice_length>total+0.5:raise RuntimeError(f"Narration too long: {voice_length:.1f} vs {total:.1f}s")
  final=OUT/"SI_Traffic_Marshal_Real_Footage_Intro_REVIEW.mp4"
  sh("ffmpeg","-y","-loglevel","error","-i",joined,"-i",voice,
     "-filter_complex","[1:a]apad[a]","-map","0:v:0","-map","[a]",
     "-c:v","copy","-c:a","aac","-b:a","160k","-t",f"{total:.3f}",
     "-movflags","+faststart",final)
  vtt=OUT/"SI_Traffic_Marshal_Real_Footage_Intro_REVIEW.en.vtt"
  vtt.write_text("WEBVTT\n\n"+"\n\n".join(
   f"{i+1}\n{a} --> {b}\n{line}" for i,(a,b,line) in enumerate(SUBS)
  )+"\n",encoding="utf8")
  metadata={"status":"REVIEW ONLY - do NOT deploy", "sources":[{"description":s[0],"source_page":s[3],"license":"https://www.pexels.com/license/"} for s in SOURCE],
   "safety":"Real observational footage, not certified instruction. Signals need review by a competent traffic marshal trainer.",
   "logo":"Owner's official SI emblem not embedded yet; insert approved file before release.",
   "narration":"Arabic AI voice", "captions":"English VTT draft timings; final listening check required."}
  (OUT/"SOURCE_AND_REVIEW_NOTES.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding="utf8")
  sh("ffprobe","-v","error","-show_entries","format=duration:stream=codec_type,codec_name,width,height",
     "-of","json",final)
  print("CREATED",final,"duration",total,"narration",voice_length)
if __name__=="__main__":
 asyncio.run(main())
