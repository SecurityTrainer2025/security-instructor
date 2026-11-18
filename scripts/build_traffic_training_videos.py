#!/usr/bin/env python3
"""Generate original, silent, bilingual SI Traffic training MP4 previews.
Requires Pillow and ffmpeg; no third-party footage or external downloads.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess, math, tempfile

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"frontend/assets/traffic-videos"
OUT.mkdir(parents=True,exist_ok=True)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
AR="/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf"
if not Path(AR).exists(): AR=FONT
SCENES=[
("01_gate_access","GATE ACCESS CONTROL","تنظيم الدخول عند البوابات","Verify access and confirm the route is clear","gate"),
("02_pedestrian_separation","PEDESTRIAN SAFETY","حماية المشاة وفصل المسارات","Stop vehicles before releasing pedestrians","crossing"),
("03_parking_operations","PARKING MANAGEMENT","إدارة المواقف ومسارات الطوارئ","Keep emergency routes unobstructed","parking"),
("04_incident_response","TRAFFIC INCIDENT RESPONSE","الاستجابة الآمنة للحوادث","Protect people, notify control, record facts","incident"),
("05_hand_signals","HAND SIGNALS","إشارات اليد والتواصل","Use approved signals; stop if misunderstood","signals"),
("06_risk_position","SAFE POSITIONING","التمركز الآمن وتقييم المخاطر","Check blind spots and escape routes","risk"),
]
def font(n,arabic=False): return ImageFont.truetype(AR if arabic else FONT,n)
def car(d,x,y,color="#45afcc"):
 d.rounded_rectangle((x,y,x+115,y+53),radius=12,fill=color,outline="white",width=3)
 d.rounded_rectangle((x+25,y+9,x+90,y+42),radius=6,fill="#17364b")
 for xx in (x+18,x+98): d.ellipse((xx-9,y+45,xx+9,y+62),fill="#081725",outline="#b8c9d2",width=2)
def frame(scene,t):
 name,en,ar,subtitle,mode=scene
 im=Image.new("RGB",(960,540),"#0b1f33");d=ImageDraw.Draw(im)
 d.rectangle((0,0,960,80),fill="#102a43");d.rectangle((0,77,960,81),fill="#c8a96b")
 d.text((30,14),"SI",font=font(39),fill="#c8a96b")
 d.text((105,17),"SECURITY INSTRUCTOR",font=font(23),fill="white")
 d.text((105,49),"SELF-STUDY | TRAINING SCENARIO",font=font(13),fill="#b6cbd9")
 d.text((32,100),en,font=font(24),fill="white")
 d.text((926,102),ar,font=font(25,True),direction="rtl",anchor="ra",fill="#c8a96b")
 d.rounded_rectangle((28,154,932,427),radius=13,fill="#233d50",outline="#617482",width=2)
 d.rounded_rectangle((60,177,900,405),radius=8,fill="#354f5f")
 d.line((60,293,900,293),fill="#f4e8b5",width=4)
 for x in range(90,875,95):d.line((x,293,x+38,293),fill="#dbe5e8",width=4)
 p=min(1,t/7.9)
 if mode=="gate":
  d.rectangle((704,178,715,405),fill="#c8a96b")
  d.line((710,237,847,237),fill="#f07972",width=10)
  car(d,125+450*p,233)
  d.rounded_rectangle((430,186,635,224),radius=7,fill="#164b45")
  d.text((444,194),"CHECK ACCESS",font=font(17),fill="#b8f5cf")
 elif mode=="crossing":
  for j in range(7):d.rectangle((523+j*22,179,535+j*22,401),fill="#dbe3e5")
  car(d,100+min(1,t/4)*305,230)
  y=210+min(1,max(0,t-3)/4)*125
  d.ellipse((620,y-36,640,y-16),fill="#e9c08b")
  d.line((630,y-15,630,y+34),fill="#f0e5d0",width=8)
  d.rounded_rectangle((95,183,310,221),radius=7,fill="#164b45")
  d.text((108,192),"STOP VEHICLES",font=font(17),fill="#b8f5cf")
 elif mode=="parking":
  for j in range(5):
   x=95+j*155;d.rectangle((x,183,x+115,247),outline="#e9dbb2",width=3)
  d.rectangle((95,342,860,390),outline="#e9a46d",width=3)
  d.text((175,354),"EMERGENCY ACCESS — KEEP CLEAR",font=font(19),fill="#ffdab4")
  car(d,130+460*p,260)
 elif mode=="incident":
  car(d,315,233,"#d18a60");car(d,466,233,"#67b5d6")
  d.polygon([(450,219),(468,251),(432,251)],fill="#ffd46b")
  d.rounded_rectangle((91,184,292,223),radius=7,fill="#593b37")
  d.text((105,192),"SECURE THE AREA",font=font(16),fill="#ffe4be")
  d.rounded_rectangle((685,346,870,384),radius=7,fill="#18434b")
  d.text((701,355),"REPORT FACTS",font=font(17),fill="#d5f2f6")
 elif mode=="signals":
  d.ellipse((455,208,485,238),fill="#e4b884")
  d.line((470,237,470,315),fill="#e1e9ed",width=12)
  d.line((470,255,540,205+math.sin(t)*10),fill="#e1e9ed",width=9)
  d.line((470,314,445,361),fill="#e1e9ed",width=10)
  d.line((470,314,495,361),fill="#e1e9ed",width=10)
  car(d,140+min(1,t/4)*160,247)
  d.rounded_rectangle((635,190,866,230),radius=7,fill="#164b45")
  d.text((650,198),"VISIBLE SIGNAL",font=font(18),fill="#b8f5cf")
 else:
  car(d,140+430*p,233)
  d.ellipse((675,216,697,238),fill="#e4b884")
  d.line((686,237,686,313),fill="#e1e9ed",width=10)
  d.line((686,313,664,355),fill="#e1e9ed",width=9)
  d.line((686,313,705,355),fill="#e1e9ed",width=9)
  d.rounded_rectangle((678,182,875,219),radius=7,fill="#164b45")
  d.text((690,190),"SAFE POSITION",font=font(16),fill="#b8f5cf")
 d.text((32,452),subtitle,font=font(20),fill="white")
 d.text((32,490),"Illustrative scenario | Follow the approved site procedure",font=font(14),fill="#b9cbd5")
 d.rectangle((30,518,930,522),fill="#2e4d60")
 d.rectangle((30,518,30+900*p,522),fill="#c8a96b")
 return im

for scene in SCENES:
 name=scene[0]
 with tempfile.TemporaryDirectory() as tmp:
  tmp=Path(tmp)
  for j in range(96):frame(scene,j/12).save(tmp/f"{j:03d}.png")
  output=OUT/(name+".mp4")
  subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate","12","-i",str(tmp/"%03d.png"),"-c:v","libx264","-pix_fmt","yuv420p","-crf","24","-movflags","+faststart",str(output)],check=True)
  print(f"Created {output.relative_to(ROOT)}: {output.stat().st_size} bytes")
