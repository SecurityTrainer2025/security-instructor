#!/usr/bin/env python3
"""Generate an original four-minute narrated SI Traffic hand signals and driver communication lesson.
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
("SAFE SIGNALING","مقدمة الإشارات","Use site-approved signals and safe positioning.","مرحباً بكم في الوحدة الخامسة. سنطبق مبادئ التواصل الآمن مع السائقين باستخدام الإشارات المعتمدة بالموقع. تختلف بعض إشارات اليد بين المواقع، لذلك يجب مراجعة المرجع المعتمد قبل استخدامها."),
("SAFE POSITION","موضع الوقوف","Stay visible and outside vehicle paths.","قف في موضع آمن يتيح للسائق رؤيتك، بعيداً عن مسار المركبة والنقاط العمياء. حدد طريقاً آمناً للابتعاد، ولا تقترب من مركبة تتحرك."),
("STOP AND VERIFY","التوقف والتحقق","Use the approved stop instruction.","عندما يلزم إيقاف الحركة، استخدم إشارة التوقف المعتمدة بالموقع. تأكد من استجابة السائق وتوقف المركبة بالكامل قبل السماح لأي شخص بعبور المسار."),
("DRIVER VIEW","رؤية السائق","Confirm the driver can see you.","انظر إلى الموقف من منظور السائق. قد تحجب المرايا أو الحمولة أو زاوية المركبة رؤية منظم الحركة. إذا لم يكن التواصل واضحاً، أوقف العملية بأمان."),
("PROCEED CONTROL","السماح بالتقدم","Proceed only after authorization and clearance.","لا تسمح للمركبة بالتقدم إلا بعد التحقق من صلاحية المرور وخلو المسار من المشاة والعوائق. استخدم إشارة التقدم المعتمدة فقط، ولا تخترع حركة جديدة."),
("SPEED CONTROL","التحكم في السرعة","Use approved slow-speed cues.","في المناطق الضيقة، اتبع حدود السرعة وإشارات تخفيف السرعة المعتمدة. إذا لم يفهم السائق الإشارة، يجب إيقاف الحركة وتوضيح التعليمات بطريقة آمنة."),
("DIRECTION","التوجيه","Verify the approved directional signal.","قبل توجيه مركبة إلى اليمين أو اليسار، تأكد من وضوح المسار وعدم وجود أشخاص في منطقة المناورة. استخدم الإشارة المقررة في خطة الموقع."),
("PEDESTRIANS","حماية المشاة","Never wave vehicles through crossings.","عند وجود مشاة في نقطة عبور، تكون الأولوية لتأمين العبور وفق خطة الموقع. لا تعطِ إشارة تسمح للمركبة بالتحرك قبل التأكد من خلو منطقة التعارض."),
("REVERSING","الرجوع للخلف","Use approved spotter procedures.","تتطلب عمليات الرجوع للخلف ترتيبات خاصة، وقد تحتاج إلى مراقب حركة مؤهل. لا تقف خلف المركبة أو داخل النقاط العمياء، والتزم بإجراء الموقع المعتمد."),
("LOST CONTACT","فقدان التواصل","Stop when visual contact is lost.","إذا فقد السائق رؤية منظم الحركة أو ظهرت تعليمات متعارضة، يجب إيقاف المناورة بأمان وإعادة التواصل الواضح قبل استئناف الحركة."),
("PRACTICAL DECISION","نشاط اتخاذ القرار","A driver does not understand the signal.","تخيل أنك توجه مركبة داخل الموقع، لكن السائق لا يفهم الإشارة التي قدمتها. القرار الصحيح هو إيقاف الحركة بأمان، ثم توضيح التعليمات وفق الإجراء المعتمد."),
("REVIEW","مراجعة المهارة","Position, signal, verify, and stop if unsure.","تذكر أربع خطوات أساسية: اختر موضعاً آمناً، واستخدم الإشارة المعتمدة، وتحقق من استجابة السائق، وأوقف العملية عند أي شك. بعد الفيديو ستطبق القرار في نشاط قصير."),
]
def font(size,arabic=False):return ImageFont.truetype(AR if arabic else FONT,size)
def slide(i,title,ar,en):
 im=Image.new('RGB',(1280,720),'#0b1f33');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1280,112),fill='#102a43');d.rectangle((0,108,1280,115),fill='#c8a96b')
 d.text((56,25),'SI',font=font(57),fill='#c8a96b')
 d.text((175,35),'SECURITY INSTRUCTOR',font=font(30),fill='white')
 d.text((175,77),'TRAFFIC MANAGEMENT | MODULE 05',font=font(18),fill='#b6cbd9')
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
  output=OUT/'05_hand_signals_extended_narrated.mp4'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(output)],check=True)
  total=probe(output)
  if abs(total-240)>2:raise RuntimeError(f'Expected 240s, got {total}')
  vtt=['WEBVTT','']
  for i,(_,_,en,_) in enumerate(SCENES):
   start=i*20;end=(i+1)*20
   vtt.extend([f'{start//3600:02d}:{(start//60)%60:02d}:{start%60:02d}.000 --> {end//3600:02d}:{(end//60)%60:02d}:{end%60:02d}.000',en,''])
  (OUT/'05_hand_signals_extended_en.vtt').write_text('\n'.join(vtt),encoding='utf-8')
  print(f'PASS: 4-minute module: {total:.2f}s')
if __name__=='__main__':asyncio.run(main())
