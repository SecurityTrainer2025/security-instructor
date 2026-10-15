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

## Project boundary
- Fire Safety is a separate, complete course. It is not an airport workshop.
- AVS-EMRG-2026 is the active airport workshop (8 hours). Reuse only suitable presentation/assessment/feedback/results patterns; do not merge content, question banks, handlers, progress, or certificates across the two projects.
- Any change in this branch must preserve Fire Safety course behavior and certificates.

## Required implementation
1. Create a separate airport-workshop manifest, content sequence, question bank and server-side assessment route. Do not repurpose or alter the Fire Safety course's question bank or assessment handlers.
2. Build the 15 content screens and 15 associated quiz screens from the approved workshop material. The current 75-question bilingual formative bank is a draft mapped to the 15 screens and requires subject-matter review before integration.
3. Randomize final-question order and each question's option order per learner/access record. Keep the answer key server-side and grade against the exact order presented to that learner.
4. Validate submitted answers on the server. Never accept a browser-supplied score or correct-answer index as authoritative.
5. Keep training duration, access expiry and active-study duration as three separate configuration values.
6. A separate 10-question bilingual post-workshop feedback survey is integrated into the AVS development learner journey. It is opinion-only, unscored, and does not affect certificates. Its wording remains a draft pending explicit owner/content approval; keep it behind the eligibility checks and do not treat integration as approval.
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
- Email delivery, access recovery, mobile/desktop behavior, and certificate verification still need end-to-end tests. Earlier CI results are not evidence for the latest PR head. No fresh workflow result has been confirmed for the latest commit. These CI results, when available, do not replace live API, MongoDB, email, browser, or device testing. The learner page has not yet been browser-tested against the live API.

## Release gate implemented on the draft branch
- Added a fail-closed route middleware for every `/api/avs-emrg-2026` and `/api/admin/avs-emrg-2026` endpoint. Requests receive HTTP 503 with reason `workshop-disabled` unless the runtime environment variable `AVS_WORKSHOP_ENABLED` is exactly `true`.
- The default is disabled when the variable is missing, empty, `false`, `TRUE`, or any other value. The gate covers learner routes, admin access creation/revocation, and public certificate verification.
- Added a unit test for the fail-closed environment-flag predicate and included it in the AVS CI workflow. This is not yet proof of a live deployed API response; the route-level behavior must still be checked in a non-production runtime.
- **Keep `AVS_WORKSHOP_ENABLED` unset or set to `false` in every deployment until explicit owner approval. Do not set it to `true` as part of this change.**

## Current blockers
- Latest branch updates added server-side certificate-eligibility checks to feedback GET/POST and prevent a second feedback submission for the same access. These changes still need automated and end-to-end validation on the current head.
- Added 15 bilingual draft lesson screens in `backend/avs-emrg-2026-lessons.js`, with objectives and lesson points, and a token-protected, sequentially gated lesson API. The learner page now opens lesson content before the corresponding formative check. The lesson content is a draft for qualified airport-emergency subject-matter review, not an operational procedure.
- Runtime inspection confirmed the deployed startup path is `backend/package.json` → `backend/start.js` → `backend/server.js`. The existing Fire Safety self-study handlers are registered from `backend/self-study-routes.js`; AVS must be added as a separate module and must not change the Fire Safety constants or handlers.
- Added `backend/avs-emrg-2026-persistence.js` with isolated MongoDB access and attempt schemas, 256-bit random access-token generation, SHA-256 token hashing, 120-hour expiry calculation, and a safe learner-progress view.
- Added `backend/avs-emrg-2026-routes.js` and registered it in the actual `backend/server.js` runtime. The isolated routes now cover admin-issued access, access/session/progress, randomized formative start/submit, randomized final start/submit, randomized initial diagnostic start/submit, and feedback retrieval/submission. Per-attempt question/option order is persisted server-side, answer keys are omitted from public quiz payloads, scores are server-graded, and progress is saved in separate AVS MongoDB collections.
- This is a first integration pass, not release-ready: no production MongoDB/API smoke test has been run from this environment; email delivery and learner-facing frontend integration need end-to-end verification; certificate issuance/QR verification has been added but remains unverified end-to-end; survey wording remains a draft pending owner approval; feedback retrieval/submission is integrated on the development branch but has not been end-to-end tested.
- AVS certificate support now includes a separate MongoDB record, eligibility-gated issuance after all 15 checks and a passing final exam, an 8-hour bilingual certificate view, locally generated QR data, and a public valid/revoked/not-found verification endpoint/page. A landscape A4 print/save-to-PDF layout was added to the learner certificate view. Validate issuance, QR scanning, public status checks and the final certificate layout before release.
- The 10-question bilingual feedback survey is wired into the AVS development learner journey, but its wording still needs owner/content approval and its end-to-end save/reload behavior must be verified.
- Automated CI is green: the latest AVS unit-test workflow and SI daily smoke-check workflow both succeeded on the current PR head. This validates automated checks only; route, database, email and device end-to-end tests remain outstanding.

## Release rule
Keep the related pull request in draft and do not merge or activate this workshop until the implementation and all release gates have been reviewed and verified.


## Manual acceptance checklist — required before release

Run only in a non-production environment with test accounts and a test MongoDB database. Record the result and evidence for each item; do not enable learner access during this checklist.

| Area | Acceptance test | Expected result |
| --- | --- | --- |
| Access creation | Admin issues a link to a test learner | Email arrives once; raw token is not returned in admin API JSON or stored in plaintext |
| Link validity | Open a valid link, then test expired and revoked links | Valid link opens; expired/revoked links are rejected |
| Study duration | Leave active-study limit unset, then test a separately configured limit | Unset stays null; configured active-study limit is enforced independently of the 120-hour link |
| Formative checks | Try to open a later check early; then pass each check with 4/5 | Early access is blocked; only passed checks unlock the next screen |
| Final assessment | Submit 21/30, then 22/30 on separate test accesses | 21/30 fails; 22/30 passes; no more than three attempts can start |
| Randomization | Start multiple attempts with controlled test data | Question and option order can vary; grading still follows the persisted server-side snapshot |
| Answer-key privacy | Inspect learner API responses and browser network payloads | No correctOptionId, answer key, or server-only grading data is exposed |
| Certificate issuance | Complete all 15 checks and pass the final assessment | Exactly one certificate record is associated with the access; certificate shows 8 workshop hours |
| Certificate recovery | In test only, simulate a certificate-write failure after a passing final result, then request the certificate again | Certificate can be recovered from the persisted passing attempt without client-supplied score |
| Certificate eligibility | Try certificate retrieval before completing checks or passing final | Request is denied |
| Verification and revocation | Scan QR on iPhone and Android; verify valid, revoked and unknown IDs | Correct public status is displayed without exposing learner email or access token |
| Print layout | Print/save certificate to PDF on desktop and mobile browsers | Landscape layout remains readable, complete, and QR is scannable |
| Feedback survey | Confirm owner approval state and route behavior | Survey remains disabled until written approval; no effect on score or certificate |
| Fire Safety regression | Run existing Fire Safety smoke checks and a representative self-study path | Existing access durations, progress, assessment, and certificate behavior remain unchanged |

For each test, capture the environment/build SHA, steps, expected result, actual result, and pass/fail. Any failure blocks release until fixed and re-tested.
