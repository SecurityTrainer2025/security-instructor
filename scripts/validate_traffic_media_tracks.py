#!/usr/bin/env python3
"""Strict offline media QA for the SI Traffic pilot artifact. No production access."""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path('/tmp/si-traffic-review')
SHORT = [
    '00_course_introduction_narrated.mp4',
    '01_gate_access_narrated.mp4',
    '02_pedestrian_separation_narrated.mp4',
    '03_parking_operations_narrated.mp4',
    '04_incident_response_narrated.mp4',
    '05_hand_signals_narrated.mp4',
    '06_risk_position_narrated.mp4',
]
EXTENDED = [
    ('01_foundations_extended_narrated.mp4','01_foundations_extended_en.vtt'),
    ('02_gate_access_extended_narrated.mp4','02_gate_access_extended_en.vtt'),
    ('03_pedestrian_safety_extended_narrated.mp4','03_pedestrian_safety_extended_en.vtt'),
    ('04_parking_emergency_extended_narrated.mp4','04_parking_emergency_extended_en.vtt'),
    ('05_hand_signals_extended_narrated.mp4','05_hand_signals_extended_en.vtt'),
]
def probe(filepath):
    completed = subprocess.run(
        ['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height',
         '-of','json',str(filepath)],capture_output=True,text=True,check=True
    )
    return json.loads(completed.stdout)
def timestamp(t):
    h,m,rest=t.split(':')
    return int(h)*3600+int(m)*60+float(rest.replace(',','.'))
def captions(path,duration):
    raw=path.read_text(encoding='utf-8-sig')
    assert raw.startswith('WEBVTT'),f'Not a VTT: {path.name}'
    cues=re.findall(r'(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})',raw)
    assert cues,f'No timed captions: {path.name}'
    last=0
    for start,end in cues:
        a,b=timestamp(start),timestamp(end)
        assert a>=last-0.02 and b>a,f'Invalid or overlapping cues: {path.name}: {start} --> {end}'
        assert b<=duration+1.5,f'Captions exceed video length: {path.name}: {b:.1f}s > {duration:.1f}s'
        last=b
    return len(cues)
total=0
for filename in SHORT+[name for name,_ in EXTENDED]:
    path=ROOT/filename
    assert path.is_file() and path.stat().st_size>1000,f'Missing or empty video: {filename}'
    info=probe(path)
    streams=info.get('streams',[])
    video=[s for s in streams if s.get('codec_type')=='video']
    audio=[s for s in streams if s.get('codec_type')=='audio']
    assert video and audio,f'Missing video/audio tracks: {filename}'
    assert video[0].get('codec_name')=='h264',f'Unexpected video codec: {filename}'
    assert audio[0].get('codec_name')=='aac',f'Unexpected audio codec: {filename}'
    assert video[0].get('width',0)>=640 and video[0].get('height',0)>=360,f'Low resolution: {filename}'
    duration=float(info['format']['duration'])
    assert duration>2,f'Unusable duration: {filename}'
    if filename.endswith('_extended_narrated.mp4'):
        assert 238<=duration<=242,f'Expected four-minute module: {filename} {duration:.1f}s'
    print(f'PASS {filename}: {duration:.2f}s H.264/AAC {video[0]["width"]}x{video[0]["height"]}')
    total+=1
for filename,subtitle in EXTENDED:
    d=float(probe(ROOT/filename)['format']['duration'])
    n=captions(ROOT/subtitle,d)
    print(f'PASS {subtitle}: {n} ordered, in-range cues')
assert total==12,'Expected 12 videos'
print('PASS 12 video/audio tracks and 5 time-bounded extended subtitle files')
print('LIMITATION: probe and captions metadata do not prove natural speech, exact synchronization or accurate human gestures')
