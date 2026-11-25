"""Render a bilingual course from a lesson plan, local stills and cue-sized Arabic audio."""
import argparse
from contextlib import contextmanager
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap

ROOT = Path(__file__).resolve().parent
FPS = 25
RATE = 48000


def command(*args, cwd=None, timeout=180):
    result = subprocess.run([str(arg) for arg in args], cwd=cwd, capture_output=True,
                            text=True, encoding="utf-8", errors="replace", timeout=timeout)
    if result.returncode:
        raise ValueError(result.stderr.strip() or f"{args[0]} exited {result.returncode}")
    return result.stdout


def prerequisites():
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise ValueError(f"Install {tool} and add its bin directory to PATH.")
    if " subtitles " not in command("ffmpeg", "-hide_banner", "-filters"):
        raise ValueError("Install an FFmpeg build with the subtitles (libass) filter.")
    if " libx264 " not in command("ffmpeg", "-hide_banner", "-encoders"):
        raise ValueError("Install an FFmpeg build with the libx264 encoder.")


@contextmanager
def scene_context(id, number):
    try:
        yield
    except (OSError, ValueError, subprocess.TimeoutExpired) as error:
        raise ValueError(f"{id}, scene {number:02}: {error}") from error


def source(root, name):
    file = (root / name).resolve()
    if not file.is_relative_to(root) or not file.is_file():
        raise ValueError(f"Missing bundled visual: {name}")
    return file


def narration(scene, number, lesson, audio_dir, temp, voice):
    stem = f"{lesson}-{number:02}"
    for suffix in (".wav", ".mp3", ".m4a"):
        recording = audio_dir / (stem + suffix)
        if recording.is_file():
            return recording.resolve()
    if not voice:
        raise ValueError(f"Place {stem}.wav, .mp3 or .m4a in {audio_dir} or enable Edge TTS.")
    output = temp / f"{stem}.mp3"
    script = temp / "narration.txt"
    script.write_text(scene["ar"], encoding="utf-8")
    command(sys.executable, "-m", "edge_tts", "--voice", voice, "--file", script,
            "--write-media", output, timeout=70)
    return output


def audio_frames(file, pcm):
    # Count decoded PCM samples. Container metadata may include AAC/MP3 encoder padding.
    command("ffmpeg", "-nostdin", "-v", "error", "-y", "-i", file, "-vn",
            "-map", "0:a:0", "-ac", 1, "-ar", RATE, "-f", "s16le", pcm)
    samples = pcm.stat().st_size // 2
    frames = math.ceil(samples * FPS / RATE)
    if not 1 <= frames <= 120 * FPS:
        raise ValueError("Narration must contain up to 120 seconds of audio per scene.")
    stats = subprocess.run(
        ["ffmpeg", "-nostdin", "-hide_banner", "-i", str(file), "-vn", "-af", "volumedetect", "-f", "null", "-"],
        check=True, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60,
    ).stderr
    peak = re.search(r"max_volume:\s*(-?[\d.]+) dB", stats)
    if not peak or float(peak[1]) < -35:
        raise ValueError("Narration is silent or too quiet.")
    return frames


def timecode(frames):
    seconds, ms = divmod(frames * 1000 // FPS, 1000)
    minutes, sec = divmod(seconds, 60)
    hours, minute = divmod(minutes, 60)
    return f"{hours:02}:{minute:02}:{sec:02}.{ms:03}"


def cue(start, end, english):
    lines = textwrap.wrap(english, width=65, break_long_words=False)
    if not lines or len(lines) > 3 or "-->" in english:
        raise ValueError("English subtitle must fit within three lines.")
    return f"{timecode(start)} --> {timecode(end)}\n" + "\n".join(lines) + "\n\n"


def render_lesson(lesson, root, audio_dir, output, voice):
    key = lesson["id"]
    cursor = 0
    timing = []
    captions = []
    with tempfile.TemporaryDirectory(dir=output) as folder:
        temp = Path(folder)
        for number, scene in enumerate(lesson["scenes"], 1):
            with scene_context(key, number):
                visual = source(root, scene["visual"])
                audio = narration(scene, number, key, audio_dir, temp, voice)
                pcm = temp / "narration.pcm"
                speech = audio_frames(audio, pcm)
                length = speech + round(0.6 * FPS)
                (temp / "cue.vtt").write_text("WEBVTT\n\n" + cue(0, speech, scene["en"]), encoding="utf-8")
                captions.append(cue(cursor, cursor + speech, scene["en"]))
                timing.append({**scene, "actual_start": timecode(cursor),
                               "actual_caption_end": timecode(cursor + speech),
                               "actual_scene_end": timecode(cursor + length)})
                cursor += length
                filters = (
                    "scale=1920:1080:force_original_aspect_ratio=decrease,"
                    "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0B1F33,setsar=1,"
                    "subtitles=cue.vtt:force_style='FontName=Arial,FontSize=23,"
                    "Alignment=2,MarginV=22,BorderStyle=3,Outline=2,Shadow=0'"
                )
                command("ffmpeg", "-nostdin", "-v", "error", "-y", "-loop", "1", "-framerate", FPS,
                        "-i", visual, "-vf", filters, "-filter_threads", 1, "-frames:v", length,
                        "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage",
                        "-threads", 2, "-pix_fmt", "yuv420p", f"video-{number:02}.mp4", cwd=temp)
                samples = length * RATE // FPS
                with (temp / "audio.pcm").open("ab") as joined:
                    content = pcm.read_bytes()
                    joined.write(content)
                    joined.write(bytes(samples * 2 - len(content)))
        listing = "".join(f"file 'video-{i:02}.mp4'\n" for i in range(1, len(timing) + 1))
        (temp / "clips.txt").write_text(listing, encoding="ascii")
        movie = temp / "review.mp4"
        command("ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-i", "clips.txt",
                "-f", "s16le", "-ar", RATE, "-ac", 1, "-i", "audio.pcm",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", movie, cwd=temp)
        command("ffmpeg", "-nostdin", "-v", "error", "-xerror", "-threads", 2, "-i", movie, "-f", "null", "-")
        info = json.loads(command("ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", movie))
        if abs(float(info["format"]["duration"]) - cursor / FPS) > 0.08:
            raise ValueError(f"{key}: media duration differs from generated subtitle timeline.")
        streams = {item["codec_type"]: item for item in info["streams"]}
        video = streams["video"]
        if (video["codec_name"], video["width"], video["height"], video["r_frame_rate"],
                streams["audio"]["codec_name"]) != ("h264", 1920, 1080, "25/1", "aac"):
            raise ValueError(f"{key}: unexpected video or audio format.")
        movie.replace(output / f"{key}.mp4")
        (output / f"{key}.en.vtt").write_text("WEBVTT\n\n" + "".join(captions), encoding="utf-8")
        (output / f"{key}.timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"PASS {key} {timecode(cursor)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=ROOT / "scene-plan.json")
    parser.add_argument("--audio-dir", type=Path, default=ROOT / "narration")
    parser.add_argument("--output", type=Path, default=ROOT / "review-output")
    parser.add_argument("--lesson", action="append")
    parser.add_argument("--edge-voice")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    if sys.version_info < (3, 10):
        raise ValueError("Python 3.10 or newer is required.")
    prerequisites()
    root = args.manifest.resolve().parent
    plan = json.loads(args.manifest.read_text(encoding="utf-8-sig"))
    lessons = {item["id"]: item for item in plan["lessons"]}
    if len(lessons) != len(plan["lessons"]) or not lessons:
        raise ValueError("The manifest needs unique lessons.")
    for key, item in lessons.items():
        if not re.fullmatch(r"[a-z0-9][a-z0-9_-]{0,40}", key) or not item["scenes"]:
            raise ValueError(f"Invalid lesson ID or empty scenes: {key}")
        for index, scene in enumerate(item["scenes"], 1):
            with scene_context(key, index):
                source(root, scene["visual"])
                if not scene["ar"].strip() or not scene["en"].strip():
                    raise ValueError("Arabic narration and English subtitles are required.")
                cue(0, 1, scene["en"])
    if args.validate:
        print(f"PASS: {len(lessons)} lessons, {sum(len(item['scenes']) for item in lessons.values())} scenes")
        return
    selected = args.lesson or list(lessons)
    if any(key not in lessons for key in selected):
        raise ValueError("Unknown lesson ID.")
    output = args.output.resolve()
    if output.exists():
        raise ValueError(f"Choose a new output directory: {output}")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as directory:
        staging = Path(directory) / "review"
        staging.mkdir()
        for key in dict.fromkeys(selected):
            render_lesson(lessons[key], root, args.audio_dir, staging, args.edge_voice)
        if output.exists():
            raise ValueError(f"Output appeared during rendering: {output}")
        staging.rename(output)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, subprocess.SubprocessError) as error:
        print(f"Production stopped: {error}", file=sys.stderr)
        sys.exit(1)
