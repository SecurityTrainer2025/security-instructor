#!/usr/bin/env python3
"""Generate an original four-minute narrated SI Traffic foundations lesson.
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
('01 | OUR PRIORITY','سلامة الأشخاص أولاً','Welcome to Traffic Management and Vehicle Control.','مرحباً بكم في الوحدة الأولى من إدارة حركة المرور والتحكم في المركبات. هدفنا الأساسي هو حماية الأشخاص، سواء كانوا مشاة أو سائقين أو عاملين بالموقع. تنظيم المرور ليس مجرد تسهيل حركة المركبات، لكنه إجراء مهم لمنع الحوادث.'),
('02 | SITE TRAFFIC PLAN','خطة المرور المعتمدة','Follow the approved site traffic plan.','كل موقع له طبيعة مختلفة. قبل أن تبدأ تنظيم الحركة، يجب تعرف خطة المرور المعتمدة، ومسارات الدخول والخروج، ومناطق الانتظار، ونقاط عبور المشاة. لا تعتمد على الاجتهاد الشخصي، وارجع للمشرف عند وجود أي تعارض.'),
('03 | SPOT THE HAZARDS','تحديد المخاطر','Identify where vehicles and people may conflict.','لنتخيل بوابة منشأة فيها شاحنات وسيارات وعمال يسيرون على الأقدام. هنا قد تحصل مخاطر بسبب السرعة أو ضعف الرؤية أو تقاطع المسارات. دورك إنك تلاحظ المخاطر قبل ما تتحول إلى حادث.'),
('04 | PEDESTRIAN SAFETY','حماية المشاة','Stop vehicles before pedestrian crossings.','المشاة من أكثر الفئات تعرضاً للخطر داخل المواقع. عند نقاط العبور، يجب تتأكد إن حركة المركبات اتوقفت بشكل آمن قبل السماح بالعبور. استخدم نقاط العبور المحددة، ولا تسمح بعبور عشوائي وسط المركبات.'),
('05 | ACCESS CONTROL','التحكم في الدخول','Verify authorization at the gate.','عند البوابات، لا يكفي إن المركبة تكون معروفة أو مستعجلة. يجب تتبع إجراءات التحقق من التصاريح المعتمدة، وتوجه السائق للمسار الصحيح. خليك حريص إن طابور الانتظار لا يسد المداخل أو المخارج.'),
('06 | BLIND SPOTS','النقاط العمياء','Avoid areas the driver cannot see.','النقطة العمياء هي مكان السائق قد ما يشوفش فيه الشخص اللي واقف بالقرب من المركبة، خصوصاً الشاحنات والمعدات الكبيرة. تجنب الوقوف خلف مركبة بترجع للخلف، وخليك دايماً في موضع واضح للسائق.'),
('07 | SAFE POSITION','التمركز الآمن','Stay visible and keep an escape route.','قبل ما توجه أي مركبة، اختار مكان آمن للوقوف. يجب السائق يقدر يشوفك، وتكون بعيد عن مسار الحركة المباشر، وعندك طريق آمن تبتعد منه إذا وقع خطر. لا تقف بين مركبتين متحركتين.'),
('08 | EMERGENCY ACCESS','مسارات الطوارئ','Keep emergency access unobstructed.','مسارات الطوارئ يجب تفضل مفتوحة في كل وقت. لا تسمح بالانتظار أو الوقوف في طريق سيارات الإسعاف أو الإطفاء أو الاستجابة. لو فيه عائق، اتبع إجراء الموقع للإبلاغ عنه ومعالجته بأمان.'),
('09 | CLEAR COMMUNICATION','التواصل الواضح','Use approved and unambiguous signals.','التواصل مع السائقين يجب يكون واضح وبإشارات معتمدة ومفهومة. تجنب إعطاء تعليمات متعارضة. لو السائق مش فاهم الإشارة، أوقف الحركة بشكل آمن ووضح التعليمات قبل ما تسمح له يكمل.'),
('10 | INCIDENT RESPONSE','الاستجابة للحوادث','Protect people and notify control.','إذا وقع حادث مروري داخل الموقع، الأولوية هي سلامة الناس وسلامتك أنت كمان. ما تدخلش في منطقة خطر من غير حماية مناسبة. بلغ غرفة التحكم بالمعلومات المؤكدة، واتبع خطة الطوارئ وإجراءات الاستجابة المعتمدة.'),
('11 | PRACTICAL SCENARIO','موقف تطبيقي','A delivery vehicle approaches a pedestrian crossing.','تخيل مركبة توصيل وصلت البوابة، وفي نفس الوقت عامل بيستعد يعبر الطريق، ومركبة ثانية واقفة بالقرب من مسار الطوارئ. إيه أول قرار آمن؟ أوقف حركة المركبات عند العبور، وتحقق من التصريح، وبلغ عن العائق حسب الإجراءات.'),
('12 | REVIEW AND APPLY','مراجعة وتطبيق','Identify hazards, choose controls, then verify.','في نهاية الوحدة، افتكر ثلاث خطوات: حدد المخاطر، اختار إجراءات التحكم المناسبة، وتأكد إن حركة الأشخاص والمركبات آمنة. بعد الفيديو ستشارك في نشاط لاتخاذ القرار، وبعده خمسة أسئلة. يجب تحقق ثمانين في المية للنجاح.')
]
def font(size,arabic=False):return ImageFont.truetype(AR if arabic else FONT,size)
def slide(i,title,ar,en):
 im=Image.new('RGB',(1280,720),'#0b1f33');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1280,112),fill='#102a43');d.rectangle((0,108,1280,115),fill='#c8a96b')
 d.text((56,25),'SI',font=font(57),fill='#c8a96b')
 d.text((175,35),'SECURITY INSTRUCTOR',font=font(30),fill='white')
 d.text((175,77),'TRAFFIC MANAGEMENT | MODULE 01',font=font(18),fill='#b6cbd9')
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
  output=OUT/'01_foundations_extended_narrated.mp4'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(output)],check=True)
  total=probe(output)
  if abs(total-240)>2:raise RuntimeError(f'Expected 240s, got {total}')
  vtt=['WEBVTT','']
  for i,(_,_,en,_) in enumerate(SCENES):
   start=i*20;end=(i+1)*20
   vtt.extend([f'{start//3600:02d}:{(start//60)%60:02d}:{start%60:02d}.000 --> {end//3600:02d}:{(end//60)%60:02d}:{end%60:02d}.000',en,''])
  (OUT/'01_foundations_extended_en.vtt').write_text('\n'.join(vtt),encoding='utf-8')
  print(f'PASS: 4-minute module: {total:.2f}s')
if __name__=='__main__':asyncio.run(main())
