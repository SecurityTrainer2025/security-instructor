# AVS-EMRG-2026 — Airport Emergency Workshop Implementation Plan

## Release status
**Not launch-ready. Do not enable learner access or certificate issuance for this workshop until the release gates below pass.**

## Fixed workshop settings
- Workshop: Safety, Emergency & Evacuation in Civil Airports
- Code: AVS-EMRG-2026
- Training duration: 8 hours
- Access-link duration: 120 hours
- Active-study duration: a separate configurable setting; never infer it from training duration or link expiry
- Learning structure: 15 content screens and 15 associated knowledge-check screens
- Formative question count: 75 total (5 per check)
- Formative pass gate: at least 4/5 correct (80%) on each required check
- Final assessment: 30 questions, independently randomized per learner
- Final pass rule: score strictly greater than 70%; for 30 equally weighted questions, at least 22 correct
- Certificate: eligible only after all required formative checks and the final assessment pass

## Required implementation
1. Create a separate airport-workshop manifest, content sequence, question bank and server-side assessment route. Do not repurpose or alter the Fire Safety course's question bank or assessment handlers.
2. Build the 15 content screens and 15 associated quiz screens from the approved workshop material. The current 75-question bilingual formative bank is a draft mapped to the 15 screens and requires subject-matter review before integration.
3. Randomize final-question order and each question's option order per learner/access record. Keep the answer key server-side and grade against the exact order presented to that learner.
4. Validate submitted answers on the server. Never accept a browser-supplied score or correct-answer index as authoritative.
5. Keep training duration, access expiry and active-study duration as three separate configuration values.
6. A separate 10-question bilingual post-workshop feedback survey has been drafted because no existing survey was available. It is opinion-only, unscored, and does not affect certificates. Review and approve it before connecting it to the final-slide QR/link flow.
7. Preserve existing Fire Safety behavior and certificates.

## Required automated and end-to-end checks
- Exactly 15 content screens, 15 checks and 75 formative questions.
- Each formative check has 5 valid questions and requires 4/5 or better.
- Final assessment contains exactly 30 valid questions with four distinct options each.
- Question and option shuffling changes presentation order while grading remains correct.
- Scores of 21/30 (70%) fail; 22/30 passes.
- Answer keys are not returned by learner-facing endpoints.
- A learner cannot skip required checks or obtain a certificate by posting a fabricated score.
- Access link expires after 120 hours; active-study expiry is tested independently.
- Email delivery, access recovery, mobile/desktop behavior, feedback flow and certificate verification still need end-to-end tests. The AVS unit-test workflow and SI daily smoke-check workflow passed on an earlier integration head. After the latest certificate print-layout and CI workflow edits, the new head SHA has not yet returned workflow runs; re-check these before merge. The learner page has not yet been browser-tested against the live API.

## Current blockers
- Added 15 bilingual draft lesson screens in `backend/avs-emrg-2026-lessons.js`, with objectives and lesson points, and a token-protected, sequentially gated lesson API. The learner page now opens lesson content before the corresponding formative check. The lesson content is a draft for qualified airport-emergency subject-matter review, not an operational procedure.
- Runtime inspection confirmed the deployed startup path is `backend/package.json` → `backend/start.js` → `backend/server.js`. The existing Fire Safety self-study handlers are registered from `backend/self-study-routes.js`; AVS must be added as a separate module and must not change the Fire Safety constants or handlers.
- Added `backend/avs-emrg-2026-persistence.js` with isolated MongoDB access and attempt schemas, 256-bit random access-token generation, SHA-256 token hashing, 120-hour expiry calculation, and a safe learner-progress view.
- Added `backend/avs-emrg-2026-routes.js` and registered it in the actual `backend/server.js` runtime. The isolated routes now cover admin-issued access, access/session/progress, randomized formative start/submit, randomized final start/submit, randomized initial diagnostic start/submit, and feedback retrieval/submission. Per-attempt question/option order is persisted server-side, answer keys are omitted from public quiz payloads, scores are server-graded, and progress is saved in separate AVS MongoDB collections.
- This is a first integration pass, not release-ready: no production MongoDB/API smoke test has been run from this environment; email delivery and learner-facing frontend integration need end-to-end verification; certificate issuance/QR verification has been added but remains unverified end-to-end; survey content is still a draft pending owner approval.
- AVS certificate support now includes a separate MongoDB record, eligibility-gated issuance after all 15 checks and a passing final exam, an 8-hour bilingual certificate view, locally generated QR data, and a public valid/revoked/not-found verification endpoint/page. A landscape A4 print/save-to-PDF layout was added to the learner certificate view. Validate issuance, QR scanning, public status checks and the final certificate layout before release.
- The newly drafted 10-question feedback survey needs owner/content approval before integration.
- Automated CI is green: the latest AVS unit-test workflow and SI daily smoke-check workflow both succeeded on the current PR head. This validates automated checks only; route, database, email and device end-to-end tests remain outstanding.

## Release rule
Keep the related pull request in draft and do not merge or activate this workshop until the implementation and all release gates have been reviewed and verified.
