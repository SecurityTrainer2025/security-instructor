#!/usr/bin/env python3
"""Generate an original four-minute narrated SI Traffic pedestrian-safety lesson.
Review artifact only; never deploys. Requires pillow, ffmpeg and edge-tts.
"""
import asyncio, subprocess, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import edge_tts
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'frontend/assets/traffic-videos'
OUT.mkdir(parents=True,exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
AR='/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf'
if not Path(AR).exists(): AR=FONT
# Each scene is exactly 20 seconds; narration must fit without clipping.
SCENES=[
("PEDESTRIAN SAFETY","حماية المشاة","People and vehicles must be separated.","مرحباً بكم في وحدة حماية المشاة وفصل المسارات. في المواقع التي تتحرك فيها المركبات والمشاة معاً، يمكن أن يؤدي أي تعارض إلى إصابات خطيرة. لذلك نبدأ دائماً بمنع تداخل المسارات كلما أمكن."),
("IDENTIFY CONFLICTS","تحديد نقاط التعارض","Identify crossing and reversing hazards.","افحص مواقع تقاطع طرق المشاة مع حركة المركبات. انتبه خصوصاً إلى البوابات ومناطق التحميل والمواقف ومناطق رجوع الشاحنات للخلف. سجل المخاطر وفق إجراءات الموقع."),
("DESIGNATED ROUTES","المسارات المحددة","Use marked pedestrian walkways.","استخدم الممرات المخصصة للمشاة، وحافظ على وضوح علاماتها. لا تسمح بتخزين المعدات داخل الممر، ولا تعتمد على خط مرسوم وحده إذا كانت المخاطر تتطلب حاجزاً أو فصلاً أقوى."),
("PHYSICAL SEPARATION","الفصل المادي","Use suitable barriers where required.","يقلل الفصل المادي المناسب من احتمال دخول المركبات إلى مناطق المشاة. يجب أن يتوافق نوع الحاجز وموقعه مع تقييم المخاطر وخطة الحركة المعتمدة، مع الحفاظ على مخارج الطوارئ."),
("SAFE CROSSINGS","العبور الآمن","Control vehicles before pedestrians cross.","عند نقاط العبور المشتركة، تأكد من وجود رؤية واضحة وإشارات مفهومة. أوقف المركبات بطريقة آمنة وفق إجراء الموقع، وتحقق من خلو المسار قبل السماح للمشاة بالعبور."),
("REVERSING VEHICLES","المركبات التي ترجع للخلف","Keep people outside reversing zones.","الرجوع إلى الخلف من أكثر الحركات خطورة، خاصة مع المركبات الكبيرة. أبق المشاة خارج منطقة المناورة، ولا تقف خلف المركبة أو داخل النقاط العمياء للسائق."),
("VISIBILITY","وضوح الرؤية","Check lighting and sight lines.","تؤثر الإضاءة الضعيفة والعوائق والمنعطفات في قدرة السائق والمشاة على رؤية بعضهم. راجع خطوط الرؤية، واستخدم وسائل التحذير والتحكم المعتمدة دون الاعتماد عليها وحدها."),
("SPEED CONTROL","التحكم في السرعة","Apply approved site speed limits.","تزداد خطورة التصادم مع ارتفاع السرعة. يجب الالتزام بحدود السرعة المقررة للموقع، واستخدام وسائل التهدئة المعتمدة، وعدم توجيه المركبات بسرعة قرب المشاة."),
("CONTRACTORS","الزوار والمقاولون","Explain safe walking routes to visitors.","قد لا يعرف الزوار والمقاولون مسارات الموقع. وضح لهم نقاط الدخول والممرات الآمنة ومناطق المنع قبل بدء الحركة، وتأكد من اتباع تعليمات السلامة المعتمدة."),
("NEAR MISSES","الحوادث الوشيكة","Report near misses and unsafe conditions.","إذا شاهدت حادثاً وشيكاً أو عبوراً غير آمن، تعامل مع الخطر وفق صلاحياتك، وأبلغ المسؤول. تساعد تقارير الحوادث الوشيكة على تحسين خطة المرور قبل وقوع إصابة."),
("DECISION SCENARIO","موقف لاتخاذ القرار","A worker crosses near a reversing truck.","تخيل عاملاً يريد عبور منطقة تحميل بينما تستعد شاحنة للرجوع إلى الخلف. القرار الصحيح هو منع العبور مؤقتاً، وتأمين منطقة المناورة، ثم توجيه العامل إلى مسار عبور آمن وفق خطة الموقع."),
("REVIEW","مراجعة الوحدة","Separate routes, control crossings, report hazards.","تذكر أن حماية المشاة تبدأ بتحديد نقاط التعارض، والفصل بين المسارات، وتأمين العبور، ومنع الدخول إلى مناطق الرجوع للخلف. بعد الفيديو ستطبق ما تعلمته في نشاط واختبار قصير."),
]
def font(size,arabic=False):return ImageFont.truetype(AR if arabic else FONT,size)
def slide(i,title,ar,en):
 im=Image.new('RGB',(1280,720),'#0b1f33');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1280,112),fill='#102a43');d.rectangle((0,108,1280,115),fill='#c8a96b')
 d.text((56,25),'SI',font=font(57),fill='#c8a96b')
 d.text((175,35),'SECURITY INSTRUCTOR',font=font(30),fill='white')
 d.text((175,77),'TRAFFIC MANAGEMENT | MODULE 03',font=font(18),fill='#b6cbd9')
 d.rounded_rectangle((65,156,1215,600),radius=24,fill='#17364c',outline='#5c7b8c',width=3)
 d.text((105,191),title,font=font(36),fill='#c8a96b')
 d.text((1160,292),ar,font=font(47,True),anchor='ra',direction='rtl',fill='white')
 d.line((110,383,1170,383),fill='#c8a96b',width=3)
 d.text((110,420),en,font=font(24),fill='#e0e9ee')
 d.text((108,556),'SITE PROCEDURES AND RISK ASSESSMENT ALWAYS APPLY',font=font(17),fill='#bbccd7')
 d.text((70,651),f'LESSON {i+1:02d} / 12',font=font(20),fill='#c8a96b')
 d.rectangle((70,687,1210,695),fill='#38566a')
 d.rectangle((70,687,70+int(1140*(i+1)/12),695),fill='#c8a96b')
 return im
def probe(p):
 return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(p)],capture_output=True,text=True,check=True).stdout.strip())
async def main():
 with tempfile.TemporaryDirectory() as t:
  tmp=Path(t);parts=[]
  for i,(title,ar,en,speech) in enumerate(SCENES):
   pic=tmp/f'{i:02d}.png';slide(i,title,ar,en).save(pic)
   voice=tmp/f'{i:02d}.mp3'
   await edge_tts.Communicate(speech,'ar-SA-HamedNeural',rate='+12%').save(str(voice))
   duration=probe(voice)
   if not (0.5 < duration <= 24.0):
    raise RuntimeError(f'Scene {i+1} narration duration {duration:.2f}s is outside safe adaptation range')
   # Adjust only when necessary; atempo preserves pitch and avoids clipping speech.
   tempo = max(1.0, duration / 18.5)
   print(f'Scene {i+1}: original narration {duration:.2f}s, tempo {tempo:.3f}x')
   part=tmp/f'part{i:02d}.mp4'
   subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-framerate','1','-i',str(pic),'-i',str(voice),'-filter_complex',f'[1:a]atempo={tempo:.5f},apad[a]','-map','0:v:0','-map','[a]','-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p','-r','2','-c:a','aac','-b:a','128k','-t','20','-movflags','+faststart',str(part)],check=True)
   parts.append(part);print(f'Scene {i+1}: narration {duration:.2f}s')
  listing=tmp/'concat.txt';listing.write_text(''.join(f"file '{p}'\n" for p in parts))
  output=OUT/'03_pedestrian_safety_extended_narrated.mp4'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(output)],check=True)
  total=probe(output)
  if abs(total-240)>2:raise RuntimeError(f'Expected 240s, got {total}')
  vtt=['WEBVTT','']
  for i,(_,_,en,_) in enumerate(SCENES):
   start=i*20;end=(i+1)*20
   vtt.extend([f'{start//3600:02d}:{(start//60)%60:02d}:{start%60:02d}.000 --> {end//3600:02d}:{(end//60)%60:02d}:{end%60:02d}.000',en,''])
  (OUT/'03_pedestrian_safety_extended_en.vtt').write_text('\n'.join(vtt),encoding='utf-8')
  print(f'PASS: 4-minute module: {total:.2f}s')
if __name__=='__main__':asyncio.run(main())
