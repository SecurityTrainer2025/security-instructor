#!/usr/bin/env python3
"""Build six photo-keyframe review MP4s with Arabic narration. NOT live-motion training video."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import subprocess,json,urllib.request,time,html

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'review/traffic-generated-photo-locators.temporary.json').read_text())
DEST=ROOT/'review/traffic-six-photo-preview-output'
DEST.mkdir(parents=True,exist_ok=True)
AUDIO=ROOT/'review/traffic-ai-audio'
CAPTIONS=ROOT/'review/traffic-ai-captions'
SPECS=[
('01-forward','التقدم ببطء','SLOW FORWARD','Fig 71'),
('02-reverse','الرجوع للخلف','REVERSE','Fig 72'),
('03-turn','الانعطاف يمينًا ويسارًا','TURN LEFT / RIGHT','Figs 73–74'),
('04-exit','مغادرة المنطقة','CLEAR TO LEAVE','Fig 75'),
('05-stop','التوقف العادي','NORMAL STOP','Fig 76'),
('06-emergency','التوقف الطارئ','EMERGENCY STOP','Fig 77')]
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
fbig=ImageFont.truetype(FONT,33)
fmid=ImageFont.truetype(FONT,24)
fsml=ImageFont.truetype(FONT,17)
photos={(p['signal'],p['phase']):p['url'] for p in DATA['photos']}
def run(args):
    subprocess.run(args,check=True,stdout=subprocess.DEVNULL)
def seconds(p):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(p)]).decode().strip())
def get_photo(key,phase):
    dest=DEST/(key+'-'+phase+'.jpg')
    if not dest.exists():
        req=urllib.request.Request(photos[key,phase],headers={'User-Agent':'Mozilla/5.0'})
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req,timeout=60) as r:
                    b=r.read()
                if len(b)<3000:raise ValueError('Photo too small')
                dest.write_bytes(b)
                break
            except Exception:
                if attempt==2:raise
                time.sleep(3)
    with Image.open(dest) as im:
        im.verify()
    return dest
def make_slide(src,key,title,phase,reference):
    im=Image.open(src).convert('RGB')
    im=ImageOps.fit(im,(1280,720),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
    d=ImageDraw.Draw(im,'RGBA')
    d.rectangle((0,0,1280,105),fill=(8,23,37,224))
    d.rectangle((0,620,1280,720),fill=(8,23,37,235))
    d.rectangle((0,99,1280,105),fill=(200,169,107,255))
    d.text((28,18),'SECURITY INSTRUCTOR  |  SI',font=fmid,fill='#f7e7c6')
    d.text((28,56),'REVIEW ONLY  •  STILL PHOTO KEYFRAMES  •  NOT APPROVED',font=fsml,fill='#ffffff')
    d.text((28,632),title+'  •  '+reference+'  •  Frame '+phase,font=fbig,fill='#f0d59a')
    d.text((30,680),'Human trainer review is required before any operational use',font=fsml,fill='#ffffff')
    name=DEST/(key+'-frame-'+phase+'.jpg')
    im.save(name,quality=92,optimize=True)
    return name
def make_vtt(src,target,dur):
    # The draft English cues are informational; never infer precise word synchronization.
    raw=src.read_text(encoding='utf-8')
    import re
    cues=list(re.finditer(r'(\d\d:\d\d:\d\d\.\d\d\d)\s*-->\s*(\d\d:\d\d:\d\d\.\d\d\d)',raw))
    def t(x):h,m,s=x.split(':');return int(h)*3600+int(m)*60+float(s)
    if not cues:raise RuntimeError('Missing caption cues '+str(src))
    original=max(t(m.group(2)) for m in cues)
    ratio=min(1.,max(.4,(dur-.15)/original))
    if original>dur-.15:
        def stamp(n):
            h=int(n//3600);m=int(n//60)%60;s=n%60
            return f'{h:02}:{m:02}:{s:06.3f}'
        raw=re.sub(r'(\d\d:\d\d:\d\d\.\d\d\d)\s*-->\s*(\d\d:\d\d:\d\d\.\d\d\d)',lambda m:stamp(t(m.group(1))*ratio)+' --> '+stamp(t(m.group(2))*ratio),raw)
    target.write_text(raw,encoding='utf-8')
def build(key,ar,en,reference):
    picA=get_photo(key,'A')
    picB=get_photo(key,'B')
    slidA=make_slide(picA,key,en,'A',reference)
    slidB=make_slide(picB,key,en,'B',reference)
    audio=AUDIO/(key+'.ar.mp3')
    if not audio.is_file():raise RuntimeError('Missing Arabic audio '+str(audio))
    duration=seconds(audio)
    # Static poses held independently: do not use morphing that could suggest anatomically verified motion.
    playlist=DEST/(key+'.concat')
    def q(x):return str(x.absolute()).replace("'","'\\''")
    playlist.write_text(f"file '{q(slidA)}'\nduration {duration*0.40:.3f}\nfile '{q(slidB)}'\nduration {duration*0.60:.3f}\nfile '{q(slidB)}'\n")
    movie=DEST/(key+'-PHOTO-REVIEW-UNAPPROVED.mp4')
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(playlist),'-i',str(audio),'-vf','fps=8,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','25','-c:a','aac','-b:a','128k','-t',f'{duration:.3f}','-movflags','+faststart',str(movie)])
    assert movie.stat().st_size>20000
    d=seconds(movie)
    assert abs(d-duration)<0.6,(key,d,duration)
    vtt=DEST/(key+'.en.vtt')
    make_vtt(CAPTIONS/(key+'.en.vtt'),vtt,d)
    print('PASS',key,'photo review',round(d,2),'s',movie.stat().st_size,flush=True)
    return movie
video_files=[]
for k,a,e,f in SPECS:video_files.append(build(k,a,e,f))
names='\n'.join(f'<article><h2>{i+1}. {html.escape(ar)} / {html.escape(en)}</h2><p>{html.escape(f)} – image-keyframe review, not verified live movement</p><video controls playsinline preload="metadata" src="{k}-PHOTO-REVIEW-UNAPPROVED.mp4"><track kind="captions" srclang="en" label="English captions" src="{k}.en.vtt"></video><audio controls src="ai-audio/{k}.ar.mp3"></audio></article>' for i,(k,ar,en,f) in enumerate(SPECS))
(DEST/'index.html').write_text('''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SI | Six hand signal photo reviews</title><style>body{background:#081725;color:#f4f7fb;font-family:Tahoma,Arial,sans-serif;margin:25px auto;max-width:1100px}h1,h2{color:#c8a96b}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:15px}article{background:#102a43;border:1px solid #5d7890;border-radius:12px;padding:14px}video,audio{width:100%}p{line-height:1.7}.warning{background:#463d2d;border-right:5px solid #e9bc68;padding:15px;margin:15px 0}</style><h1>SECURITY INSTRUCTOR | Six Hand-Signal Photo Previews</h1><p class="warning">مراجعة فقط — الصور الثابتة ليست فيديو لحركة بشرية متصلة ولا تعني صحة الإشارات أو اعتمادها للتدريب. NOT APPROVED FOR FIELD USE OR LIVE COURSE ACTIVATION.</p><main>'''+names+'''</main></html>''',encoding='utf-8')
(DEST/'ai-audio').mkdir(exist_ok=True)
import shutil
for key,_,_,_ in SPECS: shutil.copy2(AUDIO/(key+'.ar.mp3'),DEST/'ai-audio')
(DEST/'README_AR.txt').write_text('SECURITY INSTRUCTOR | REVIEW ONLY\nهذه ست معاينات لقطات فوتوغرافية ثابتة مع تعليق صوتي عربي والترجمة الإنجليزية، وليست تسجيلات بشرية فعلية للحركات. يُحظر استخدامها للتدريب التشغيلي قبل مراجعة مدرب مؤهل واعتماد المرجع وإجراءات الموقع. لم يتم نشرها على المنصة الرئيسية.\n',encoding='utf-8')
assert len(video_files)==6
