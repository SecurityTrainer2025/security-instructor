# AVS-EMRG-2026 implementation and release checklist

**Current state:** curriculum and video-production brief are drafts in PR #17. This checklist is not proof of deployed functionality.

## Non-negotiable isolation
- Keep `fire-safety-emergency-response` behavior unchanged.
- Add a distinct slug: `civil-airport-safety-emergency-evacuation`.
- Use a course-specific configuration object for metadata, screens, assessments, video assets, and certificate course name.
- Do not reuse Fire-specific constants such as `FIRE_SCREEN_LIST`, `FINAL_FIRE_ASSESSMENT`, or `FIRE_SLUG` for AVS content.
- Existing enrollment and self-study access records must retain the course slug/course ID, and every API lookup must authorize against that same course.
- Avoid enabling the AVS course in the public catalog until its routes and front-end exist.

## Proposed implementation stages
1. **Content and media manifest:** approve bilingual scripts; create a stable manifest with screen IDs, video IDs, durations, captions/transcripts, and final hosted URLs. Empty or placeholder video URLs must not be rendered as playable.
2. **Backend course configuration:** refactor shared self-study handlers to resolve a course configuration by slug, keeping Fire Safety as the default-compatible existing configuration. Scope screens, scores, access, and assessment submissions to the learner's course.
3. **AVS screens and media player:** create a dedicated learner page with bilingual navigation, responsive video player, captions/transcripts, lesson checks, progress indicators, and clear return-to-study behavior.
4. **Assessment:** implement a separate bilingual final question bank; randomize question and option order; score on the server; enforce lesson completion, pass score, and attempt limits server-side.
5. **Certificate:** issue the existing certificate template with the AVS course title and the right enrollment ID only after the AVS final assessment passes. Do not alter the Fire Safety certificate path.
6. **Catalog and registration:** add the new course to the public catalog only after backend and front-end checks pass. Confirm the course fee/free status before opening registration.
7. **Deployment verification:** test staging or preview first, then verify the deployed front end and API end-to-end.

## Proposed release acceptance tests
- [ ] Fire Safety course metadata and screen count are unchanged.
- [ ] AVS course metadata and screen list return AVS content, never Fire content.
- [ ] Unknown slug returns 404.
- [ ] AVS enrollment and email access links open only AVS course sessions.
- [ ] Learner can resume on the same browser and sees saved AVS progress.
- [ ] A different course's access token cannot read or update AVS progress.
- [ ] Lesson assessments validate answers server-side and persist scores to the correct course.
- [ ] Final questions and options are randomized without breaking answer scoring.
- [ ] Final assessment enforces prerequisite lesson checks, pass score, and attempt limit.
- [ ] Certificate is not available before passing and names the AVS course correctly.
- [ ] Every video URL is approved, stable, playable on iOS and desktop, and has checked captions/transcripts.
- [ ] Broken video links fail gracefully without falsely marking the lesson complete.
- [ ] Registration emails arrive and the access link expiry/session behavior is verified.
- [ ] Current Fire Safety end-to-end flow passes regression tests.
- [ ] Mobile layout, keyboard navigation, bilingual text direction, and accessibility are checked.

## Operational review
The training is educational and must not replace the airport's approved emergency plan, local law, or direction of the competent authority. Verify the applicable edition of ICAO Doc 9137 and have airport safety/emergency subject-matter experts review the course before launch.

## Release gate
Do not publish or enable learner registration until the course-specific backend, front-end, media hosting, assessments, certificates, and regression checks are complete.