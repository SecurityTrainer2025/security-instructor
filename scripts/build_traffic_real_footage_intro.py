#!/usr/bin/env python3
"""Build a REAL-FOOTAGE Traffic Marshal intro MP4 as a review artifact, not a deployed lesson.
Sources: four actual Pexels stock videos under https://www.pexels.com/license/.
Do not imply these actors endorse SI or their gestures demonstrate a mandated signal.
The supplied SI emblem appears on a separate title card.
"""
import asyncio
import base64
import json
import subprocess
import tempfile
import time
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
# Small title-card image derived from the supplied SI emblem.
LOGO_JPEG = (
 "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMU"
 "FRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU"
 "FBQUFBQUFBT/wAARCADAAMADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUF"
 "BAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVW"
 "V1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi"
 "4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAEC"
 "AxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVm"
 "Z2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq"
 "8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9Oo028n7xp5YKCT0oqMHzW/2R+tYgKgJO49e1PJwOaWoyfMbH8I60ACZdtx/Cn9KKY58x"
 "to6DqaABR5jbj0HSpKQDAxUNzcRwoTI6xoPvOxwBQ2krsNyQDzHz/CP1qWubvPG1haZSAPdMP7vyr+Z/wrBvPHmoTZEKR247EDcf"
 "14/SvJq5rhaWnNd+Wv8AwDshhK09bW9Tvj+8fH8I6+9SDivJp/EGoyg776ZR32vtH6VmTa3GP9bfp/wOb/69efLPKa+GD+//AIc6"
 "ll8nvI9pf522jp3NPGAK8PTW7bPy30Wf9mYf41ft9bukw0F9Lj/YlOP51Kz2PWH4/wDAG8vktpfgevOckKKcAFGK8xtfGuqWrczL"
 "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"
)
VOICE="ar-EG-ShakirNeural"
SEGMENTS = [
 ("راجع خطة المرور ومسارات المشاة والطوارئ قبل بدء العمل.",
  "Review the traffic plan and pedestrian and emergency routes before work starts."),
 ("اختر موضعًا آمنًا يراك فيه السائق. استخدم إشارات الموقع المعتمدة.",
  "Choose a safe position where the driver can see you. Use the approved site signals."),
 ("نظّم حركة المركبات وفق تفويض الموقع، ونسّق مع فريق البوابة.",
  "Manage vehicle movement within your site authority and coordinate with the gate team."),
 ("أعطِ الأولوية لسلامة المشاة. هذه اللقطات تعرض أمثلة من مواقع العمل.",
  "Prioritise pedestrian safety. This footage shows examples from workplaces."),
]

def timestamp(seconds):
 ms=round(seconds*1000)
 return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

def sh(*args):
 subprocess.run(list(map(str,args)),check=True)
def probe_duration(path):
 p=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(path)],capture_output=True,text=True,check=True)
 return float(p.stdout.strip())

async def main():
 with tempfile.TemporaryDirectory(prefix="si-real-intro-") as td:
  wd=Path(td)
  logo=wd/"si.jpg"
  logo.write_bytes(base64.b64decode(LOGO_JPEG))
  title=wd/"title.mp4"
  sh("ffmpeg","-y","-loglevel","error","-loop","1","-framerate","25","-i",logo,
     "-vf","scale=192:192,pad=1920:1080:(ow-iw)/2:(oh-ih)/2-90:color=0x0B1F33,setsar=1,format=yuv420p,"
     "drawtext=text='TRAFFIC MARSHAL':fontcolor=0xC8A96B:fontsize=62:x=(w-tw)/2:y=h/2+45,"
     "drawtext=text='01 / REVIEW COPY':fontcolor=white:fontsize=34:x=(w-tw)/2:y=h/2+135",
     "-t","2.52","-c:v","libx264","-preset","veryfast","-crf","23",title)
  clips=[title]
  for i,(description,url,seconds,page) in enumerate(SOURCE):
   raw=wd/f"source_{i}.mp4"
   req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 SI-training-review/1.0"})
   last_error=None
   for attempt in range(3):
    try:
     deadline=time.monotonic()+40
     with urllib.request.urlopen(req,timeout=15) as response,raw.open("wb") as target:
      while True:
       buf=response.read(2*1024*1024)
       if not buf:break
       target.write(buf)
     last_error=None
     break
    except Exception as error:
     last_error=error
     print(f"STOCK FETCH failed on attempt {attempt+1}/3 for {page}: {error}",flush=True)
     await asyncio.sleep(2*(attempt+1))
   if last_error is not None:raise RuntimeError(f"Unable to download source after retries: {page}") from last_error
   if raw.stat().st_size<100000:raise RuntimeError(f"Invalid stock footage {i}")
   duration=probe_duration(raw)
   if duration<seconds-0.4:raise RuntimeError(f"Source {i} too short: {duration}s")
   clip=wd/f"clip_{i}.mp4"
   vf=("scale=1920:1080:force_original_aspect_ratio=decrease,"
       "pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p,fps=25,"
       "drawtext=text='REVIEW COPY / WORKPLACE FOOTAGE':"
       "fontsize=34:fontcolor=white:box=1:boxcolor=black@0.82:boxborderw=14:x=32:y=32")
   sh("ffmpeg","-y","-loglevel","error","-i",raw,"-t",seconds,"-vf",vf,
      "-an","-c:v","libx264","-preset","veryfast","-crf","24",
      "-movflags","+faststart",clip)
   clips.append(clip)
  manifest=wd/"concat.txt"
  manifest.write_text("".join(f"file '{clip}'\n" for clip in clips),encoding="utf8")
  joined=wd/"joined.mp4"
  sh("ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",manifest,"-c","copy",joined)
  audio=[]
  subs=[]
  offset=probe_duration(title)
  silence=wd/"title.wav"
  sh("ffmpeg","-y","-loglevel","error","-f","lavfi","-i","anullsrc=r=48000:cl=stereo",
     "-t",offset,"-c:a","pcm_s16le",silence)
  audio.append(silence)
  for index, ((ar,en),clip) in enumerate(zip(SEGMENTS,clips[1:],strict=True)):
   voice=wd/f"voice_{index}.mp3"
   for attempt in range(3):
    try:
     await asyncio.wait_for(edge_tts.Communicate(ar,VOICE,rate="+8%").save(str(voice)),timeout=22)
     break
    except Exception:
     if attempt==2:raise
     await asyncio.sleep(2*(attempt+1))
   duration=probe_duration(clip)
   spoken=probe_duration(voice)
   lead=0.25
   tempo=max(1,spoken/(duration-lead-0.2))
   if tempo>1.35:
    raise RuntimeError(f"Speech too long for clip {index}: {spoken:.2f}s")
   segment=wd/f"voice_{index}.wav"
   sh("ffmpeg","-y","-loglevel","error","-i",voice,
      "-af",f"atempo={tempo:.5f},adelay=250:all=1,apad",
      "-t",duration,"-ac","2","-ar","48000","-c:a","pcm_s16le",segment)
   audio.append(segment)
   subs.append((timestamp(offset+lead),timestamp(offset+lead+spoken/tempo),en))
   offset+=duration
  audio_list=wd/"audio.txt"
  audio_list.write_text("".join(f"file '{track}'\n" for track in audio),encoding="utf8")
  total=probe_duration(joined)
  final=OUT/"SI_Traffic_Marshal_Real_Footage_Intro_REVIEW.mp4"
  sh("ffmpeg","-y","-loglevel","error","-i",joined,"-f","concat","-safe","0","-i",audio_list,
     "-map","0:v:0","-map","1:a:0",
     "-c:v","copy","-c:a","aac","-b:a","160k","-t",f"{total:.3f}",
     "-movflags","+faststart",final)
  vtt=OUT/"SI_Traffic_Marshal_Real_Footage_Intro_REVIEW.en.vtt"
  vtt.write_text("WEBVTT\n\n"+"\n\n".join(
   f"{i+1}\n{a} --> {b}\n{line}" for i,(a,b,line) in enumerate(subs)
  )+"\n",encoding="utf8")
  metadata={"status":"REVIEW ONLY - do NOT deploy", "sources":[{"description":s[0],"source_page":s[3],"license":"https://www.pexels.com/license/"} for s in SOURCE],
   "safety":"Real observational footage, not certified instruction. Signals need review by a competent traffic marshal trainer.",
   "logo":"Supplied SI emblem on the separate title card.",
   "narration":"Arabic AI voice", "captions":"English VTT measured from speech segments; listening check required."}
  (OUT/"SOURCE_AND_REVIEW_NOTES.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding="utf8")
  sh("ffprobe","-v","error","-show_entries","format=duration:stream=codec_type,codec_name,width,height",
     "-of","json",final)
  sh("ffmpeg","-v","error","-xerror","-i",final,"-f","null","-")
  print("CREATED",final,"duration",total,"captions",len(subs))
if __name__=="__main__":
 async def run_review_exports():
  from build_traffic_real_footage_review_batch import build_batch
  await main()
  await build_batch(OUT,LOGO_JPEG,VOICE,sh,probe_duration,timestamp)

 asyncio.run(run_review_exports())
