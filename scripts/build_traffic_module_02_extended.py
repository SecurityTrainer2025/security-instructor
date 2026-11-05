#!/usr/bin/env python3
"""Generate an original four-minute narrated SI Traffic gate-access lesson.
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
('ACCESS CONTROL','التحكم في الدخول','Verify authorization before allowing entry.','مرحباً بكم في وحدة تنظيم الدخول عند البوابات. البوابة نقطة مهمة لحماية الأشخاص والممتلكات. لا تسمح بدخول أي مركبة قبل استكمال إجراءات التحقق المعتمدة في الموقع.'),
('SITE PROCEDURES','إجراءات الموقع','Follow approved access procedures.','ابدأ بمراجعة خطة الدخول والخروج، وقائمة التصاريح، وطريقة التواصل مع غرفة التحكم. اتبع التعليمات المعتمدة، ولا تستبدلها بتقدير شخصي.'),
('APPROACH SAFELY','الاقتراب الآمن','Keep the approach lane clear.','راقب مسار اقتراب المركبات من مكان آمن. وجّه السائق إلى نقطة التوقف المحددة، وتأكد من أن طابور الانتظار لا يعوق المشاة أو مداخل الطوارئ.'),
('VERIFY PERMITS','التحقق من التصريح','Check vehicle and driver authorization.','تحقق من تصريح المركبة وهوية السائق وفق سياسة المنشأة. طابق البيانات المطلوبة مع سجل الدخول، وانتبه للتصاريح المنتهية أو غير الواضحة.'),
('UNAUTHORIZED ENTRY','دخول غير مصرح','Do not bypass verification.','إذا لم يكن التصريح صالحاً، لا تسمح بالمرور. اطلب من السائق الانتظار في مكان آمن، ثم تواصل مع الجهة المختصة لتحديد الإجراء الصحيح.'),
('PEDESTRIAN CROSSING','عبور المشاة','Separate pedestrians from vehicles.','انتبه إلى المشاة بالقرب من البوابة. أوقف حركة المركبات عند نقطة العبور وفق خطة الموقع، ولا تسمح بوجود أشخاص داخل مسار مركبة متحركة.'),
('DELIVERY VEHICLES','مركبات التوصيل','Direct deliveries to approved areas.','قد تحتاج مركبات التوصيل إلى مسار أو منطقة فحص مخصصة. وجّه السائق إلى المكان المعتمد، وتأكد من عدم إغلاق المخرج أو إعاقة الحركة أثناء الانتظار.'),
('EMERGENCY ACCESS','مسار الطوارئ','Keep emergency routes open.','يجب أن تبقى مسارات سيارات الإسعاف والإطفاء مفتوحة دائماً. إذا ظهرت مركبة تعوق المسار، أبلغ المسؤول واتبع إجراء إزالة العائق بطريقة آمنة.'),
('CLEAR SIGNALS','الإشارات الواضحة','Use approved traffic signals.','استخدم إشارات مرور معتمدة وواضحة للسائقين. لا تعطِ تعليمات متعارضة، وإذا لم يفهم السائق توجيهك، أوقف الحركة بأمان قبل توضيح المطلوب.'),
('REPORT INCIDENTS','الإبلاغ عن الحوادث','Report suspicious or unsafe situations.','إذا لاحظت محاولة دخول غير مصرح بها أو سلوكاً يعرض الآخرين للخطر، حافظ على سلامتك، وسجل المعلومات المؤكدة، وأبلغ غرفة التحكم حسب الإجراءات.'),
('PRACTICAL SCENARIO','سيناريو تطبيقي','A driver presents an expired permit.','وصلت مركبة تحمل تصريحاً منتهي الصلاحية، والسائق يطلب الدخول بسرعة، بينما ينتظر خلفه عدد من المركبات. القرار الآمن هو إيقاف الدخول، وتنظيم الانتظار، وطلب التحقق من المسؤول المختص.'),
('REVIEW','المراجعة','Verify, direct, communicate, and document.','تذكر الخطوات الأساسية: تحقق من التصريح، ووجّه المركبة للمسار الصحيح، واحمِ المشاة، وأبقِ الطوارئ مفتوحة، وأبلغ عن أي مخالفة. بعد الفيديو ستطبق هذه المبادئ في نشاط واختبار.'),
]
def font(size,arabic=False):return ImageFont.truetype(AR if arabic else FONT,size)
def slide(i,title,ar,en):
 im=Image.new('RGB',(1280,720),'#0b1f33');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1280,112),fill='#102a43');d.rectangle((0,108,1280,115),fill='#c8a96b')
 d.text((56,25),'SI',font=font(57),fill='#c8a96b')
 d.text((175,35),'SECURITY INSTRUCTOR',font=font(30),fill='white')
 d.text((175,77),'TRAFFIC MANAGEMENT | MODULE 02',font=font(18),fill='#b6cbd9')
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
  output=OUT/'02_gate_access_extended_narrated.mp4'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(output)],check=True)
  total=probe(output)
  if abs(total-240)>2:raise RuntimeError(f'Expected 240s, got {total}')
  vtt=['WEBVTT','']
  for i,(_,_,en,_) in enumerate(SCENES):
   start=i*20;end=(i+1)*20
   vtt.extend([f'{start//3600:02d}:{(start//60)%60:02d}:{start%60:02d}.000 --> {end//3600:02d}:{(end//60)%60:02d}:{end%60:02d}.000',en,''])
  (OUT/'02_gate_access_extended_en.vtt').write_text('\n'.join(vtt),encoding='utf-8')
  print(f'PASS: 4-minute module: {total:.2f}s')
if __name__=='__main__':asyncio.run(main())
