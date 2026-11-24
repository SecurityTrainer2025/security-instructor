#!/usr/bin/env python3
"""Read-only acceptance gate for SI Traffic Marshal final training media.

Check a review output directory or the media on the staging branch.
It never renames or publishes media; exit code 1 means DO NOT release.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--media-dir", type=Path, default=ROOT / "frontend/assets/traffic-videos",
                    help="Optional review output directory")
MEDIA = parser.parse_args().media_dir
# One distinct, topic-matched human-action video per current screen.
SCREEN_FILES={
 "tm1s1":"01_where_traffic_marshal_works.mp4",
 "tm1s2":"02_tmp_and_risk_assessment.mp4",
 "tm2s1":"03_access_control_points.mp4",
 "tm2s2":"04_driver_induction.mp4",
 "tm3s1":"05_pedestrian_safety.mp4",
 "tm3s2":"06_parking_and_reversing.mp4",
 "tm4s1":"07_ppe_heat_weather.mp4",
 "tm4s2":"08_incident_reporting.mp4",
 "tm5s1":"09_six_hand_signals.mp4",
 "tm5s2":"10_radios_and_shift_handover.mp4",
}
errors=[]
def inspect(path):
 p=subprocess.run(
  ["ffprobe","-v","error","-show_entries",
   "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate",
   "-of","json",str(path)],capture_output=True,text=True)
 if p.returncode:raise ValueError("ffprobe failed: "+p.stderr[:180])
 return json.loads(p.stdout)
def clock(value):
    hours, minutes, seconds = value.split(":")
    return 3600 * int(hours) + 60 * int(minutes) + float(seconds)


def check_captions(path, duration):
    text = path.read_text("utf-8-sig")
    if not text.startswith("WEBVTT"):
        raise ValueError("Invalid WebVTT header")
    times = re.findall(r"^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})[^\n]*\n([^\n]+)", text, re.M)
    if not times or len(times) != text.count("-->"):
        raise ValueError("Missing or invalid English subtitle cues")
    previous_end = 0
    for start, end, _ in times:
        begin, finish = clock(start), clock(end)
        if not previous_end <= begin < finish <= duration + 0.05:
            raise ValueError("English subtitle cues overlap or fall outside the video")
        previous_end = finish


for screen,file in SCREEN_FILES.items():
 path=MEDIA/file
 if not path.is_file():errors.append(f"{screen}: missing final MP4 {file}");continue
 try:
  data=inspect(path)
  streams=data.get("streams",[])
  video=next((s for s in streams if s.get("codec_type")=="video"),None)
  audio=next((s for s in streams if s.get("codec_type")=="audio"),None)
  seconds=float(data.get("format",{}).get("duration",0))
  if not video or video.get("codec_name")!="h264":errors.append(f"{screen}: requires H.264 video")
  if video and (video.get("width"), video.get("height"), video.get("r_frame_rate")) != (1920, 1080, "25/1"):
   errors.append(f"{screen}: requires 1920×1080 at 25 fps")
  if not audio or audio.get("codec_name")!="aac":errors.append(f"{screen}: requires audible AAC track")
  if not 30<=seconds<=600:errors.append(f"{screen}: unexpected runtime {seconds:.1f} seconds")
  check_captions(path.with_suffix(".en.vtt"), seconds)
  subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-threads", "2",
                  "-i", str(path), "-f", "null", "-"], check=True)
 except (ValueError,OSError,KeyError,subprocess.CalledProcessError) as exc: errors.append(f"{screen}: {exc}")
print(f"SI Traffic final media: {len(SCREEN_FILES)} unique files checked")
if errors:
 for error in errors:print("FAIL:",error)
 print("BLOCKED: Final realistic-motion content not certified; existing pilot stays unchanged.")
 sys.exit(1)
print("TECHNICAL MEDIA CHECKS PASSED, but human action/signal safety approval remains mandatory.")
