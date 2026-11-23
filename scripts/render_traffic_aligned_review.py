"""Review-only renderer: replace visuals, preserve original AAC and VTT.
Usage: python scripts/render_traffic_aligned_review.py MASTER.mp4 MASTER.en.vtt scenes.json OUTPUT.mp4
Manifest: [{"start":0,"end":2,"file":"opening.png"}, ...]
Use distinct, reviewed illustrations or clips for every narration segment.
No network, no deployment, no generated speech.
"""
import json, pathlib, re, subprocess, sys, tempfile, shutil

def run(*args):
    subprocess.run([str(x) for x in args], check=True)
def probe(path):
    return json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(path)]))
def seconds(s):
    parts = [float(v) for v in s.replace(",",".").split(":")]
    return sum(v*60**i for i,v in enumerate(reversed(parts)))
def main():
    master, vtt, manifest, output = map(pathlib.Path, sys.argv[1:])
    if output.exists() or output.resolve() == master.resolve():
        raise ValueError("Refusing to overwrite existing media")
    info = probe(master)
    audio = next(s for s in info["streams"] if s["codec_type"]=="audio")
    if audio["codec_name"] != "aac":
        raise ValueError("Expected approved AAC narration")
    duration = float(info["format"]["duration"])
    scenes = json.loads(manifest.read_text(encoding="utf-8"))
    end = 0.0
    for scene in scenes:
        a,b = float(scene["start"]),float(scene["end"])
        if abs(a-end)>0.025 or b<=a:
            raise ValueError("Scenes must cover timeline continuously")
        end=b
    if abs(end-duration)>0.08:
        raise ValueError("Scene timeline must match master duration")
    cues = re.findall(r"([\d:.]+)\s+-->\s+([\d:.]+)",vtt.read_text(encoding="utf-8"))
    if not cues:
        raise ValueError("Missing timed subtitle cues")
    for a,b in cues:
        if seconds(b)>duration+0.1 or seconds(a)>=seconds(b):
            raise ValueError("Invalid caption timing")
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp=pathlib.Path(tmp)
        clips=[]
        for i,s in enumerate(scenes):
            source=(manifest.parent / s["file"]).resolve()
            if not source.is_file(): raise FileNotFoundError(source)
            target=tmp / f"{i:04}.mp4"
            length=float(s["end"])-float(s["start"])
            options=["-loop","1","-framerate","25"] if source.suffix.lower() in {".png",".jpg",".jpeg",".webp"} else ["-stream_loop","-1"]
            run("ffmpeg","-v","error","-y",*options,"-i",source,"-t",str(length),"-an","-vf","scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25","-c:v","libx264","-pix_fmt","yuv420p","-preset","fast",target)
            clips.append(target)
        listing=tmp / "concat.txt"
        listing.write_text("".join("file '"+str(p)+"'\n" for p in clips))
        temp=tmp / "review.mp4"
        run("ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",listing,"-i",master,"-map","0:v:0","-map","1:a:0","-c","copy","-movflags","+faststart",temp)
        run("ffmpeg","-v","error","-xerror","-i",temp,"-f","null","-")
        result=probe(temp)
        if abs(float(result["format"]["duration"])-duration)>0.25:
            raise ValueError("Output duration drift")
        def audiohash(path):
            return subprocess.check_output(["ffmpeg","-v","error","-i",str(path),"-map","0:a:0","-c","copy","-f","hash","-hash","sha256","-"])
        if audiohash(master)!=audiohash(temp): raise ValueError("Audio changed")
        shutil.copyfile(temp,output)
        shutil.copyfile(vtt,output.with_suffix(".en.vtt"))
    print("Technical review passed; visual and instructor approval still required.")
if __name__=="__main__":
    main()
