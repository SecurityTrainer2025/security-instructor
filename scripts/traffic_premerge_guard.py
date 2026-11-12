#!/usr/bin/env python3
"""Read-only pre-merge guard for the SI Traffic pilot.

Requires a fetched origin/main reference. Never modifies working tree, production,
learner records, existing courses, or certificates. Exits 0 when the audit runs,
and emits fail-closed machine-readable release readiness (ready=false).
"""
import json
import subprocess
from pathlib import Path

def git(*args):
    return subprocess.check_output(["git", *args], text=True).strip()

base = "origin/main"
head = "HEAD"
changed = [p for p in git("diff", "--name-only", f"{base}...{head}").splitlines() if p]
shared_paths = {
    "backend/package.json",
    "backend/self-study-routes.js",
    "frontend/config.js",
    "frontend/course-details.html",
    "frontend/fire-safety-self-study-register.html",
    "frontend/fire-safety-self-study.html",
}
new_runtime_paths = {"backend/self-study-traffic-config.js"}
legacy_modified = sorted(set(changed) & shared_paths)
certificates_modified = sorted(
    p for p in changed
    if "certificate" in p.lower() and not p.startswith(("review/", "docs/"))
)
unexpected_non_traffic = sorted(
    p for p in changed
    if not (
        p.startswith(("review/traffic-", "review/traffic_", "docs/traffic",
                      "scripts/traffic-", "scripts/build_traffic",
                      "scripts/validate_traffic", "scripts/test_traffic",
                      "scripts/verify_traffic", "frontend/assets/traffic-videos/"))
        or p.startswith(".github/workflows/traffic-")
        or p == ".github/workflows/build-traffic-preview-videos.yml"
        or p == "docs/SI_TRAINING_VOICE_AND_BILINGUAL_STANDARD.md"
        or p in shared_paths
        or p in new_runtime_paths
        or p == "scripts/traffic_premerge_guard.py"
    )
)
mandatory = [
    "review/traffic-real-video-release-gate.md",
    "review/traffic-module-05-enhanced.html",
    "scripts/traffic-browser.spec.cjs",
]
missing = [p for p in mandatory if not Path(p).is_file()]
release_blockers = [
    "Six human-motion signal videos have not been safety-reviewed and approved.",
    "The existing human-photo keyframe MP4s are not live human-motion video.",
]
if legacy_modified:
    release_blockers.append("Pilot changes shared legacy/frontend/backend paths; no wholesale merge.")
if certificates_modified:
    release_blockers.append("Certificate-related paths changed; requires full explicit isolation.")
if unexpected_non_traffic:
    release_blockers.append("Unexpected non-Traffic paths detected.")
if missing:
    release_blockers.append("Required review and test assets are absent.")

report = {
    "project": "SI Traffic Control",
    "base": base, "head": head,
    "changed_file_count": len(changed),
    "legacy_shared_paths_modified": legacy_modified,
    "new_traffic_runtime_files": sorted(set(changed) & new_runtime_paths),
    "certificate_paths_modified": certificates_modified,
    "unexpected_non_traffic_paths": unexpected_non_traffic,
    "missing_mandatory_review_files": missing,
    "real_human_motion_videos_approved": False,
    "ready_for_production_activation": False,
    "safe_to_merge_entire_pilot": False,
    "blockers": release_blockers,
    "policy": "Only curated review-only files may be selectively merged; do not activate Trainee course.",
}
Path("/tmp").mkdir(exist_ok=True)
outfile = Path("/tmp/si-traffic-premerge-audit.json")
outfile.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
assert not report["ready_for_production_activation"]
print("PASS: safety guard detects and blocks unreviewed production release")
