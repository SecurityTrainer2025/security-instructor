#!/usr/bin/env python3
"""Validate AI production brief and English VTT draft assets; review-only."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
brief = root / "review/traffic-ai-video-production-brief.md"
assert brief.is_file() and brief.stat().st_size > 1500, "Missing production brief"
text = brief.read_text(encoding="utf-8")
ids = ("01-forward", "02-reverse", "03-turn", "04-exit", "05-stop", "06-emergency")
for item in ids:
    assert item in text, f"Missing production instructions: {item}"
for term in ("Figure 71", "Figure 72", "Figures 73", "Figure 75", "Figure 76", "Figure 77"):
    assert term in text, f"Missing handbook reference: {term}"
stamp = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}$")
for item in ids:
    p = root / f"review/traffic-ai-captions/{item}.en.vtt"
    assert p.is_file(), f"Missing caption file: {p}"
    raw = p.read_text(encoding="utf-8").strip()
    assert raw.startswith("WEBVTT\n"), f"Invalid VTT header: {p}"
    blocks = raw.split("\n\n")[1:]
    assert len(blocks) >= 3, f"Expected at least three caption cues: {p}"
    previous = ""
    for block in blocks:
        lines = block.splitlines()
        assert len(lines) >= 2 and " --> " in lines[0], f"Invalid cue: {p}"
        start, end = lines[0].split(" --> ")
        assert stamp.match(start) and stamp.match(end), f"Invalid timestamp: {p}"
        assert start < end and (not previous or start >= previous), f"Overlapping/out-of-order cue: {p}"
        assert " ".join(lines[1:]).strip(), f"Empty subtitle: {p}"
        previous = end
print("PASS: six review-only video scripts and six valid English subtitle files.")
