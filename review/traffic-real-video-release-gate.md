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
