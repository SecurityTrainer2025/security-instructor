#!/usr/bin/env python3
"""Create original bilingual training diagrams and a supervised signaling simulation."""
from pathlib import Path
import math
import subprocess
import tempfile
import wave
from array import array

from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / 'frontend/assets/traffic-practice'
OUTPUT.mkdir(parents=True, exist_ok=True)
NAVY, PANEL, GOLD, WHITE = '#0b1f33', '#17354e', '#e0bf79', '#ffffff'
TEAL, CORAL = '#60e3c4', '#ffad94'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
SIZE = (960, 540)
FPS = 12


def text(draw, x, y, value, size=24, color=WHITE, rtl=False):
    draw.text((x, y), value, font=ImageFont.truetype(FONT, size), fill=color,
              anchor='mt', direction='rtl' if rtl else 'ltr')


def canvas(title, ar):
    image = Image.new('RGB', SIZE, NAVY)
    draw = ImageDraw.Draw(image)
    text(draw, 480, 20, title, 31, GOLD)
    text(draw, 480, 62, ar, 28, GOLD, True)
    return image, draw


def arrow(draw, points, color):
    draw.line(points, fill=color, width=12)
    x, y = points[-1]
    px, py = points[-2]
    angle = math.atan2(y-py, x-px)
    draw.polygon([(x, y), (x-25*math.cos(angle-.53), y-25*math.sin(angle-.53)),
                  (x-25*math.cos(angle+.53), y-25*math.sin(angle+.53))], fill=color)


def map_diagrams():
    venues = [
        ('protected-crossing', 'Protected crossing', 'معبر محمي', 'Crossing approach', 'مدخل المعبر', 580, False),
        ('airport-dropoff', 'Airport terminal drop-off', 'إنزال الركاب في المطار', 'Accessible drop-off', 'نقطة إنزال ميسّرة', 690, True),
        ('stadium-arrivals', 'Stadium arrival flows', 'تدفقات الوصول إلى الاستاد', 'Spectator approach', 'مدخل الجمهور', 380, False),
        ('festival-diversion', 'Festival diversion', 'تحويلة الفعالية', 'Temporary decision point', 'نقطة قرار مؤقتة', 510, True),
        ('retail-parking', 'Retail car park', 'موقف المجمع التجاري', 'Shop entrance', 'مدخل المجمع', 635, False),
        ('industrial-yard', 'Industrial yard segregation', 'فصل الحركة في الساحة الصناعية', 'Staff door', 'باب الموظفين', 460, True),
    ]
    for name, en, ar, end_en, end_ar, junction, alternate in venues:
        image, draw = canvas(en, ar)
        draw.rounded_rectangle((35, 103, 925, 449), 24, fill=PANEL)
        draw.rectangle((65, 260, 895, 402), fill='#273846')
        draw.rectangle((65, 165, 895, 222), fill='#194e50')
        for x in range(75, 875, 50):
            if abs(x-junction)>30:
                draw.line((x, 239, x+31, 239), fill=WHITE, width=6)
        arrow(draw, [(101, 196), (junction, 196), (junction, 255)], TEAL)
        for y in range(265, 380, 17):
            draw.rectangle((junction-16, y, junction+16, y+8), fill=WHITE)
        draw.line((junction-55, 274, junction-55, 386), fill=CORAL, width=8)
        arrow(draw, [(103, 327), (junction-76, 327)], CORAL)
        if alternate:
            arrow(draw, [(junction+48, 345), (835, 345), (835, 416)], GOLD)
        text(draw, min(junction+85, 800), 116, end_en, 20)
        text(draw, min(junction+85, 800), 140, end_ar, 19, WHITE, True)
        text(draw, 272, 414, 'Hold before crossing', 19, CORAL)
        text(draw, 272, 438, 'توقّف قبل المعبر', 19, CORAL, True)
        text(draw, 237, 468, 'Protected pedestrian route', 20, TEAL)
        text(draw, 237, 495, 'مسار مشاة محمي', 21, TEAL, True)
        text(draw, 713, 468, 'Vehicle movement / hold line', 20, CORAL)
        text(draw, 713, 495, 'حركة المركبات وخط التوقف', 21, CORAL, True)
        image.save(OUTPUT / (name+'.png'), optimize=True)


STEPS = [
    ('Brief the drill', 'إحاطة قبل التمرين', 'Closed area • qualified instructor • approved site chart',
     'منطقة مغلقة ومدرب مؤهل وجدول إشارات معتمد', 'brief'),
    ('Confirm the movement', 'تأكيد الحركة', 'One guide • clear route • driver sees the protected post',
     'موجّه واحد ومسار خالٍ ورؤية واضحة لنقطة العمل المحمية', 'brief'),
    ('Roadway stop', 'إيقاف حركة الطريق', 'Palm to driver + one long whistle if authorized',
     'راحة اليد نحو السائق ونفخة طويلة إذا كانت معتمدة', 'stop'),
    ('Start only when clear', 'بدء الحركة بعد خلو المسار', 'Approved visual start + two short whistles if authorized',
     'إشارة البدء البصرية ونفختان قصيرتان إذا كانتا معتمدتين', 'go'),
    ('Visual contact lost', 'انقطاع التواصل البصري', 'Stop safely. Keep the vehicle held.',
     'أوقِف المركبة بأمان وأبقِها متوقفة', 'hold'),
    ('Radio call', 'بلاغ لاسلكي', 'Control, Post 2: crossing occupied. Keep Bay B closed.',
     'التحكم، النقطة ٢: المعبر مشغول. أبقوا الباحة ب مغلقة.', 'radio'),
    ('Read-back and correction', 'إعادة التأكيد والتصحيح', 'Bay B closed. Confirm the correct location before release.',
     'الباحة ب مغلقة. أكّد الموقع الصحيح قبل السماح بالحركة.', 'radio'),
    ('Verify before restarting', 'تحقق قبل الاستئناف', 'Clear crossing + confirmed contact + authorized release.',
     'معبر خالٍ وتواصل مؤكد وإذن معتمد بالحركة.', 'resume'),
]
SECONDS = 7


def draw_step(index, frame):
    en, ar, instruction, arabic, action = STEPS[index]
    image, draw = canvas(en, ar)
    draw.rounded_rectangle((42, 111, 918, 407), 20, fill=PANEL)
    draw.rectangle((66, 247, 894, 368), fill='#294357')
    for y in range(254, 359, 17):
        draw.rectangle((601, y, 629, y+7), fill=WHITE)
    draw.line((561, 250, 561, 360), fill=CORAL, width=8)
    draw.rounded_rectangle((127, 143, 435, 228), 13, outline=TEAL, width=4)
    text(draw, 297, 149, 'Protected marshal position', 18, TEAL)
    text(draw, 297, 174, 'موضع المنظم المحمي', 18, TEAL, True)
    draw.ellipse((154, 161, 174, 181), fill=GOLD)
    draw.line((164, 182, 164, 206), fill=GOLD, width=7)
    draw.line((164, 188, 151, 201), fill=GOLD, width=5)
    end = (200, 163) if action=='stop' else (190, 202-round(15*abs(math.sin(frame/7)))) if action=='go' else (183, 200)
    draw.line((164, 189, *end), fill=GOLD, width=6)
    draw.line((164, 204, 153, 220), fill=GOLD, width=5)
    draw.line((164, 204, 174, 220), fill=GOLD, width=5)
    x = 379+min(frame, 62)*4 if action in ('go','resume') else 379
    draw.rounded_rectangle((x, 280, x+95, 328), radius=11, fill=CORAL)
    draw.rectangle((x+38, 286, x+77, 319), fill='#397291')
    text(draw, 481, 383, 'SIMULATION • NO LIVE TRAFFIC / محاكاة تدريبية', 19, GOLD)
    text(draw, 480, 434, instruction, 23)
    text(draw, 480, 479, arabic, 24, WHITE, True)
    return image


def video():
    rate = 24000
    patterns = [(2*SECONDS+.8, .7), (3*SECONDS+.8, .17), (3*SECONDS+1.18, .17)]
    with tempfile.TemporaryDirectory() as temp:
        audio = Path(temp) / 'whistle.wav'
        with wave.open(str(audio), 'wb') as source:
            source.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
            sound = array('h', [0]) * (len(STEPS)*SECONDS*rate)
            for start, duration in patterns:
                begin = int(rate*start)
                for offset in range(int(rate*duration)):
                    envelope=min(1,offset/250,(rate*duration-offset)/250)
                    sound[begin+offset]=int(6900*envelope*math.sin(2*math.pi*1400*offset/rate))
            source.writeframes(sound.tobytes())
        command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
                 '-s','960x540','-r',str(FPS),'-i','pipe:0','-i',str(audio),'-c:v','libx264',
                 '-pix_fmt','yuv420p','-preset','fast','-c:a','aac','-movflags','+faststart',
                 str(OUTPUT/'signals-and-radio.mp4')]
        with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
            for index in range(len(STEPS)):
                for frame in range(SECONDS*FPS):
                    encoder.stdin.write(draw_step(index, frame).tobytes())
            encoder.stdin.close()
            if encoder.wait():
                raise RuntimeError('FFmpeg failed')
    def cue(seconds):
        return f'00:{seconds//60:02}:{seconds%60:02}.000'
    with (OUTPUT/'signals-and-radio.vtt').open('w', encoding='utf-8') as captions:
        captions.write('WEBVTT\n\n')
        cues = [f'{cue(index*SECONDS)} --> {cue((index+1)*SECONDS)}\n{en}\n{ar}'
                for index, (_, _, en, ar, _) in enumerate(STEPS)]
        captions.write('\n\n'.join(cues)+'\n')


if __name__ == '__main__':
    map_diagrams()
    video()
