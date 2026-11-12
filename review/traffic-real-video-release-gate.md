# SI Traffic Hand Signals — Release gate and production handoff
**Status: BLOCKED — realistic demonstrator footage not yet produced.** Review-only. Never merge into main or change five existing courses/certificates.

## Verified from user-provided review ZIP (7), 10 Nov 2026
- 12 narrated MP4 training previews, six separate Arabic MP3 narration drafts, six AI-signal English VTT files and five extended lesson VTT files.
- The reviewed video examples use slides/schematic animations, not a real human demonstrating the six hand signals.
- The six Arabic MP3 narrations are separate audio assets; they are **not proof of six synchronized photorealistic demonstration videos**.
- A green GitHub workflow means the packaging and automated checks passed, **not** that hand gestures are operationally accurate.
- Do not present any of the current videos as the requested realistic instructor footage.

## Required six replacement video assets
| Asset filename | Signal | Figure | Mandatory on-screen check |
|---|---|---|---|
| 01-forward-real.mp4 | Slow forward | 71 | Both hands and palms visible throughout, motion toward head/chest |
| 02-reverse-real.mp4 | Reverse | 72 | Palm direction matches reference, marshal never behind reversing vehicle |
| 03-turn-real.mp4 | Turn left and right | 73,74 | Distinct left/right demonstrations, no mirrored footage mistakes |
| 04-exit-real.mp4 | Clear to leave | 75 | Driver attention phase separate from exit direction |
| 05-stop-real.mp4 | Normal stop | 76 | Crossed arms above head clearly held |
| 06-emergency-real.mp4 | Emergency stop | 77 | Clasp hands overhead then arms down/out, visually distinct from normal stop |

## Acceptance criteria
1. Realistic consenting human demonstrator, continuous anatomically plausible arm and finger movement, both hands visible in a wide shot.
2. Compare each gesture frame-by-frame with handbook reference and approved site traffic plan; qualified instructor signs off.
3. Keep instructor's uploaded face **unchanged**; if generator alters it, reject output or use original photograph as a static instructor introduction and a different demonstrator for live actions. Do not claim pixel-perfect preservation from image-to-video.
4. Approved SI logo, navy uniform plus high-visibility garment, private controlled checkpoint, safe position outside vehicle path, visible escape route.
5. Add natural Arabic voiceover and English captions; align to actual speech timestamps, not initial 12-second placeholder VTT cues.
6. Check sound audibility and peak, lips/hand synchronization as applicable, MP4 H.264/AAC, 16:9, mobile playback and no overlapping text.
7. Complete user review of **05-stop** before generating all six. Publish only after approval, final exam/lesson QA and explicit authorization.

## Immediate production blocker
The available GitHub Actions workflow can build schematic narrated previews but **cannot synthesize live-action video**. A connected video-generation provider with an enabled video model, or genuine recorded footage, is required. No such footage is attached to this review bundle. Do not imply that a script or a prompt produces it.

## Production order
- Produce 05-stop realistic proof of concept (front wide, hand close-up, driver POV).
- Confirm face identity policy, hand motion and safety with user.
- Produce other five; synchronize voice and captions using actual audio duration.
- Integrate in review branch, run media QA and training review, then request explicit production release approval.

## Approved editorial approach — 10 Nov 2026
User delegated choice of the most suitable production method. Default: keep the original unaltered instructor photo in the introduction, and use a separate realistic consenting demonstrator for hand movements if facial fidelity cannot be preserved. No implication that the demonstrator is the instructor. First proof-of-concept remains **05-stop**. This delegation does **not** override the production-release gate or authorize purchasing subscriptions.

### First video storyboard — 05-stop (target 60 seconds)
- 00:00–00:06 — SI title card and original instructor photograph (unaltered pixels), identify as course instructor; no synthetic talking face.
- 00:06–00:16 — wide establishing shot, trained demonstrator wearing reflective vest at controlled checkpoint, safe position and eye contact.
- 00:16–00:30 — full-body front view: cross arms above head as shown in Figure 76, hold clearly; never cut off hands.
- 00:30–00:40 — side view and driver's POV of the same signal, vehicle stops in controlled simulation.
- 00:40–00:50 — close-up replay of the correct gesture and safe positioning; no mirrored shots.
- 00:50–01:00 — short safety reminder: verify actual vehicle stop and halt operation if visual contact is lost.

### Generation prompt (single realistic demonstrator, NOT the course instructor)
Photorealistic safety training footage at a private industrial security checkpoint. A consenting adult traffic marshal demonstrator wearing navy security training clothes and a high-visibility vest stands to the side, outside the vehicle's swept path. Full body always visible, both arms and hands unobstructed. Demonstrate the **normal stop hand signal exactly as shown in the provided Security Operations Level 3 Figure 76: cross both arms overhead and hold**, without other gestures. One stationary camera wide shot; then a separate driver's point of view. A vehicle stops slowly in a controlled environment. Anatomically correct hands and elbows, realistic movement, no extra fingers, no camera mirroring, no police insignia, no invented SI emblem, no spoken words or on-screen captions. Generate separate short takes to be edited with approved Arabic narration. If gesture differs from reference, reject the clip.

### Explicit stop conditions
- If the provider cannot reproduce Figure 76 precisely, switch to a qualified filmed demonstrator rather than repeatedly accepting misleading AI gestures.
- Do not claim a video exists unless a real MP4 has been generated and visually inspected.
- Do not change main branch, existing five courses, course certificates, or live platform without explicit release approval.
