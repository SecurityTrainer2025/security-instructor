# AVS-EMRG-2026 — next implementation tasks

This document records the next engineering tasks after adding the bilingual curriculum, video storyboard plan, responsive preview, and device QA checklist.

## Current deliverables on this branch
- `docs/courses/AVS-EMRG-2026-curriculum.json`
- `docs/courses/AVS-EMRG-2026-video-production-plan.md`
- `docs/courses/AVS-EMRG-2026-implementation-checklist.md`
- `docs/courses/SI-cross-device-qa-AVS-EMRG-2026.md`
- `frontend/civil-airport-safety-preview.html`

## Next engineering tasks
1. Refactor the Fire Safety-specific self-study routes into shared course-configured handlers while preserving the current Fire Safety behavior.
2. Add AVS-specific course metadata, screen rendering, progress storage, and access authorization.
3. Implement a separate final assessment bank and server-side scoring, attempt limits, and randomized answer order.
4. Connect certificate generation to the AVS course enrollment and correct course title.
5. Replace video placeholders only after approved MP4 assets, caption files, transcripts, and stable hosting URLs exist.
6. Add AVS to the public catalogue only after the complete learner flow passes tests.
7. Test the learner flow on physical Android and iOS devices, tablets, and desktop browsers. A responsive HTML preview or CI smoke check is not a substitute for end-to-end testing.

## Release blockers
- Course-specific backend and registration flow not yet implemented.
- Video assets are planned but not produced/hosted.
- Fee/free status has not been confirmed.
- Real-device testing has not yet been completed.
- Fire Safety regression testing for the integrated build is still required.

Do not describe the course as published or production-ready until these blockers are resolved.
