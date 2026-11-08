#!/usr/bin/env python3
"""Generate an original four-minute narrated SI Traffic parking and emergency access lesson.
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
("PARKING MANAGEMENT","إدارة المواقف","Safe parking protects people and access.","مرحباً بكم في وحدة إدارة المواقف ومسارات الطوارئ. تنظيم الوقوف لا يهدف إلى ترتيب المركبات فقط، بل يحمي المشاة ويساعد فرق الاستجابة على الوصول بسرعة وأمان عند الحاجة."),
("APPROVED PARKING","المواقف المخصصة","Use designated parking areas.","يجب توجيه المركبات إلى المواقف المحددة في خطة الموقع. لا تسمح بالوقوف العشوائي عند البوابات أو المنعطفات أو الممرات التي تحتاج إلى رؤية واضحة وحركة آمنة."),
("EMERGENCY LANES","مسارات الطوارئ","Keep emergency access clear at all times.","يجب أن تبقى مسارات سيارات الإسعاف والإطفاء خالية من العوائق في جميع الأوقات. لا يجوز استخدامها للانتظار المؤقت حتى عندما يبدو الموقع هادئاً."),
("LOADING ZONES","مناطق التحميل","Keep deliveries in approved loading areas.","تحتاج الشاحنات ومركبات التوصيل إلى مناطق تحميل مخصصة. تحقق من أن عمليات التحميل لا تعيق المشاة أو حركة المركبات أو الوصول إلى معدات الطوارئ."),
("PEDESTRIAN ROUTES","ممرات المشاة","Never block pedestrian walkways.","لا تسمح بوقوف المركبات فوق ممرات المشاة أو أمام مخارج المباني. إذا لاحظت عائقاً، اتبع إجراء الموقع لإزالته مع الحفاظ على سلامتك وسلامة الآخرين."),
("VISIBILITY","الرؤية عند المنعطفات","Protect sight lines at junctions.","قد تحجب المركبات المتوقفة الرؤية عند التقاطعات والمنعطفات. تأكد من الالتزام بمناطق منع الوقوف المعتمدة، ولا توجه مركبة إلى مكان يقلل قدرة السائقين على رؤية المشاة."),
("SAFE QUEUES","طوابير الانتظار","Manage queues without blocking access.","عند ازدحام المواقف، وجه المركبات إلى مناطق الانتظار المعتمدة. لا تسمح بامتداد الطابور إلى مسارات الطوارئ أو الطرق العامة أو نقاط عبور المشاة."),
("REPORT OBSTRUCTIONS","الإبلاغ عن العوائق","Escalate blocked emergency routes.","إذا وجدت مركبة تغلق مسار الطوارئ، حدد موقعها وأبلغ المسؤول المختص فوراً. اتبع آلية الموقع لمعالجة العائق، ولا تحاول تحريك مركبة دون صلاحية أو إجراء آمن."),
("RESPONSE ARRIVAL","وصول فرق الاستجابة","Protect routes for emergency responders.","عند وصول مركبات الاستجابة، التزم بخطة الطوارئ وتعليمات غرفة التحكم. حافظ على خلو المسار، وابتعد عن مناطق المناورة، ولا تعطل فرق الإسعاف أو الإطفاء."),
("COMMUNICATION","التواصل مع السائق","Give clear, respectful directions.","استخدم تعليمات واضحة ومحترمة عند توجيه السائق إلى موقف بديل. إذا رفض الامتثال، لا تدخل في مواجهة تعرضك للخطر، بل صعد الموقف حسب إجراءات المنشأة."),
("DECISION SCENARIO","سيناريو تطبيقي","An ambulance route is blocked by a delivery van.","تخيل مركبة توصيل متوقفة أمام مسار الإسعاف، وسائقها يقول إنه سيغادر بعد دقائق. القرار الآمن هو عدم السماح باستمرار العائق، وإبلاغ المسؤول وتوجيه المركبة وفق إجراءات الموقع."),
("REVIEW","مراجعة الوحدة","Keep access open and follow approved procedures.","تذكر أن المواقف الآمنة تعني ممرات مشاة واضحة ومسارات طوارئ مفتوحة ومناطق تحميل منظمة. بعد الفيديو ستختار القرار المناسب في موقف عملي، ثم تجيب عن خمسة أسئلة."),
]
def font(size,arabic=False):return ImageFont.truetype(AR if arabic else FONT,size)
def slide(i,title,ar,en):
 im=Image.new('RGB',(1280,720),'#0b1f33');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1280,112),fill='#102a43');d.rectangle((0,108,1280,115),fill='#c8a96b')
 d.text((56,25),'SI',font=font(57),fill='#c8a96b')
 d.text((175,35),'SECURITY INSTRUCTOR',font=font(30),fill='white')
 d.text((175,77),'TRAFFIC MANAGEMENT | MODULE 04',font=font(18),fill='#b6cbd9')
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
  output=OUT/'04_parking_emergency_extended_narrated.mp4'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(output)],check=True)
  total=probe(output)
  if abs(total-240)>2:raise RuntimeError(f'Expected 240s, got {total}')
  vtt=['WEBVTT','']
  for i,(_,_,en,_) in enumerate(SCENES):
   start=i*20;end=(i+1)*20
   vtt.extend([f'{start//3600:02d}:{(start//60)%60:02d}:{start%60:02d}.000 --> {end//3600:02d}:{(end//60)%60:02d}:{end%60:02d}.000',en,''])
  (OUT/'04_parking_emergency_extended_en.vtt').write_text('\n'.join(vtt),encoding='utf-8')
  print(f'PASS: 4-minute module: {total:.2f}s')
if __name__=='__main__':asyncio.run(main())
