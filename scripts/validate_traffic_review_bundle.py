#!/usr/bin/env python3
"""Fail-closed checks for the isolated SI Traffic review ZIP."""
from pathlib import Path
import subprocess
root=Path('/tmp/si-traffic-review')
for page,vid,cap in [
 ('module-01.html','01_foundations_extended_narrated.mp4','01_foundations_extended_en.vtt'),
 ('module-02.html','02_gate_access_extended_narrated.mp4','02_gate_access_extended_en.vtt'),
 ('module-03.html','03_pedestrian_safety_extended_narrated.mp4','03_pedestrian_safety_extended_en.vtt'),
 ('module-04.html','04_parking_emergency_extended_narrated.mp4','04_parking_emergency_extended_en.vtt'),
 ('module-05.html','05_hand_signals_extended_narrated.mp4','05_hand_signals_extended_en.vtt')
]:
 html=(root/page).read_text(encoding='utf-8')
 for needle in [vid,cap,'const options=[','const bank=[','score>=4','/']:
  assert needle in html,(page,needle)
 assert ' / ' in html, f'{page} must include bilingual UI text'
 for asset in [vid,cap]:
  assert (root/asset).is_file() and (root/asset).stat().st_size>0,asset
 vtt=(root/cap).read_text(encoding='utf-8')
 assert vtt.startswith('WEBVTT') and '-->' in vtt,cap
 result=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(root/vid)],capture_output=True,text=True,check=True)
 duration=float(result.stdout.strip())
 assert 238<=duration<=242,(vid,duration)
 print(f'PASS {page}: video {duration:.2f}s, captions, bilingual learning and quiz')
assert 'module-02.html' in (root/'module-01.html').read_text(encoding='utf-8')
assert 'module-03.html' in (root/'module-02.html').read_text(encoding='utf-8')
assert 'module-04.html' in (root/'module-03.html').read_text(encoding='utf-8')
assert 'module-05.html' in (root/'module-04.html').read_text(encoding='utf-8')
hand_demo=root/'traffic-module-05-hand-signals-demo.html'
assert hand_demo.is_file() and hand_demo.stat().st_size>0
assert 'traffic-module-05-hand-signals-demo.html' in (root/'module-05.html').read_text(encoding='utf-8')
demo=hand_demo.read_text(encoding='utf-8')
for signal in ['forward','back','turn','leave','stop','emergency']:
 assert signal in demo, f'Missing practical signal: {signal}'
assert 'const poses=' in demo and 'phase=' in demo, 'Missing distinct motion sequences'
assert 'const drills=' in demo and 'showDrill()' in demo, 'Missing bilingual signal recognition practice'
assert 'id="practiceChoices"' in demo and 'id="practiceFeedback"' in demo, 'Missing accessible practice controls'
assert len(list(root.glob('*_narrated.mp4')))==12,'Expected seven short videos and five extended modules'
print('PASS: offline Traffic pilot review bundle')
