#!/usr/bin/env python3
"""Check isolated traffic audio review page and six audio script mappings."""
from pathlib import Path
import ast

root = Path(__file__).resolve().parents[1]
player = (root / "review/traffic-ai-audio-review.html").read_text(encoding="utf-8")
source = (root / "scripts/build_traffic_ai_signal_narration.py").read_text(encoding="utf-8")
tree = ast.parse(source)
assign = next(node for node in tree.body if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "SCRIPTS" for t in node.targets))
scripts = ast.literal_eval(assign.value)
expected = ["01-forward", "02-reverse", "03-turn", "04-exit", "05-stop", "06-emergency"]
assert list(scripts) == expected, "Audio generation IDs differ from expected"
for key in expected:
    assert len(scripts[key]) >= 100, f"Narration too short: {key}"
    assert f'ai-audio/{key}.ar.mp3' in player, f"Missing player audio link: {key}"
    assert f'ai-video-captions/{key}.en.vtt' in player, f"Missing subtitle link: {key}"
    assert (root / f"review/traffic-ai-captions/{key}.en.vtt").is_file(), f"Missing subtitle: {key}"
assert "<audio controls" in player
assert "viewport" in player
print("PASS: six Arabic narration scripts, player links, and subtitle references")
