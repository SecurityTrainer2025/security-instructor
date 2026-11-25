#!/usr/bin/env python3
"""Original bilingual 60-second introduction for SI Traffic, staging pilot.
Visual captions only: no synthetic voiceover is represented as present.
"""
from pathlib import Path
import subprocess, tempfile, math
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"frontend/assets/traffic-videos/00_course_introduction.mp4"
OUT.parent.mkdir(parents=True,exist_ok=True)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
AR="/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf"
if not Path(AR).exists(): AR=FONT
SCENES=[
("WHY TRAFFIC MANAGEMENT MATTERS","لماذا ننظم حركة المرور؟",
 "Protect people first; keep movement predictable.",
 "سلامة الأشخاص أولاً، ثم انتظام حركة المركبات.",
 "overview"),
("GATES AND VEHICLE ACCESS","البوابات والتحكم في الدخول",
 "Confirm authorization and keep the approach clear.",
 "تحقق من تصريح الدخول وحافظ على خلو مسار الاقتراب.",
 "gate"),
("PEDESTRIANS AND VEHICLES","حماية المشاة والمركبات",
 "Separate routes and stop vehicles before crossings.",
 "افصل المسارات وأوقف المركبات قبل عبور المشاة.",
 "crossing"),
("PARKING AND EMERGENCY ROUTES","المواقف ومسارات الطوارئ",
 "Guide parking and never obstruct emergency access.",
 "نظّم المواقف ولا تعطل مسارات مركبات الطوارئ.",
 "parking"),
("OFFICER SAFETY AND COMMUNICATION","سلامة رجل الأمن والتواصل",
 "Stay visible, avoid blind spots, follow the site plan.",
 "تمركز بوضوح وتجنب النقاط العمياء واتبع خطة الموقع.",
 "safety"),
]
def ft(size,arabic=False):return ImageFont.truetype(AR if arabic else FONT,size)
def car(d,x,y,color="#53a9c7"):
 x=int(x);y=int(y)
 d.rounded_rectangle((x,y,x+124,y+53),radius=11,fill=color,outline="white",width=3)
 d.rounded_rectangle((x+22,y+9,x+97,y+42),radius=6,fill="#183b4c")
 for xx in (x+18,x+105):d.ellipse((xx-8,y+46,xx+8,y+62),fill="#091726",outline="#c7d3da",width=2)
def person(d,x,y):
 d.ellipse((x-11,y-48,x+11,y-26),fill="#e3bb8c")
 d.line((x,y-25,x,y+25),fill="#e2e9ed",width=11)
 d.line((x,y+22,x-21,y+58),fill="#e2e9ed",width=9)
 d.line((x,y+22,x+21,y+58),fill="#e2e9ed",width=9)
def make(scene_index,phase,total):
 title,ar,en_desc,ar_desc,mode=SCENES[scene_index]
 im=Image.new("RGB",(960,540),"#0b1f33");d=ImageDraw.Draw(im)
 d.rectangle((0,0,960,78),fill="#102a43")
 d.rectangle((0,75,960,80),fill="#c8a96b")
 d.text((32,12),"SI",font=ft(40),fill="#c8a96b")
 d.text((110,18),"SECURITY INSTRUCTOR",font=ft(22),fill="#ffffff")
 d.text((110,50),"TRAFFIC MANAGEMENT | LEARNING VIDEO 01",font=ft(12),fill="#bfd1dc")
 d.text((34,101),title,font=ft(23),fill="#ffffff")
 d.text((928,102),ar,font=ft(24,True),anchor="ra",direction="rtl",fill="#c8a96b")
 d.rounded_rectangle((35,151,925,378),radius=15,fill="#263f50",outline="#79909d",width=2)
 d.rounded_rectangle((57,170,902,356),radius=9,fill="#385467")
 d.line((57,271,902,271),fill="#f4d59a",width=4)
 for x in range(80,895,100):d.line((x,271,x+38,271),fill="#e2e9ed",width=3)
 if mode=="overview":
  car(d,110+phase*250,219)
  person(d,680,235)
  d.rounded_rectangle((560,181,858,216),radius=7,fill="#1a5148")
  d.text((573,189),"PEOPLE BEFORE SPEED",font=ft(17),fill="#dcf8e7")
 elif mode=="gate":
  car(d,120+phase*410,218)
  d.rectangle((705,177,715,353),fill="#d6af6c")
  d.line((710,220,850,220),fill="#f58d7b",width=10)
  d.rounded_rectangle((460,181,668,216),radius=7,fill="#1a5148")
  d.text((473,189),"CHECK ACCESS",font=ft(18),fill="#dcf8e7")
 elif mode=="crossing":
  for j in range(7):d.rectangle((525+j*22,176,536+j*22,349),fill="#d8e2e6")
  car(d,120+min(phase*2,1)*260,219)
  person(d,640,230+int(phase*30))
  d.rounded_rectangle((95,182,300,216),radius=7,fill="#1a5148")
  d.text((109,190),"STOP FOR PEOPLE",font=ft(17),fill="#dcf8e7")
 elif mode=="parking":
  for j in range(5):
   x=95+j*150;d.rectangle((x,178,x+115,233),outline="#f1ddac",width=3)
  car(d,125+phase*370,244)
  d.rounded_rectangle((135,314,825,347),radius=5,fill="#614b3d")
  d.text((205,320),"EMERGENCY ACCESS — KEEP CLEAR",font=ft(17),fill="#ffddbc")
 else:
  car(d,120+phase*360,218)
  person(d,700,244)
  d.rounded_rectangle((623,178,865,215),radius=7,fill="#1a5148")
  d.text((636,186),"VISIBLE SAFE POSITION",font=ft(16),fill="#dcf8e7")
 d.text((35,393),en_desc,font=ft(20),fill="#ffffff")
 d.text((925,429),ar_desc,font=ft(21,True),anchor="ra",direction="rtl",fill="#c8a96b")
 d.text((35,475),"Illustrative training | Apply your approved site traffic plan",font=ft(14),fill="#bfd1dc")
 d.text((925,475),f"SCENE {scene_index+1}/5",font=ft(14),anchor="ra",fill="#bfd1dc")
 d.rectangle((35,516,925,522),fill="#294c60")
 d.rectangle((35,516,35+int(890*total),522),fill="#c8a96b")
 return im

FPS=8
SECONDS_PER_SCENE=12
with tempfile.TemporaryDirectory() as tmp:
 tmp=Path(tmp)
 for i in range(5*FPS*SECONDS_PER_SCENE):
  scene=i//(FPS*SECONDS_PER_SCENE)
  phase=(i%(FPS*SECONDS_PER_SCENE))/(FPS*SECONDS_PER_SCENE-1)
  make(scene,phase,i/(5*FPS*SECONDS_PER_SCENE-1)).save(tmp/f"{i:04d}.png")
 subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(FPS),"-i",str(tmp/"%04d.png"),"-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","25","-movflags","+faststart",str(OUT)],check=True)
 print("Created",OUT,"bytes",OUT.stat().st_size)
