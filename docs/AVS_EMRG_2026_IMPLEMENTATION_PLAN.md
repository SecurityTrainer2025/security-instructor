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
2. Build the 15 content screens and 15 associated quiz screens from the approved workshop material. Do not replace approved slide questions with newly invented questions.
3. Randomize final-question order and each question's option order per learner/access record. Keep the answer key server-side and grade against the exact order presented to that learner.
4. Validate submitted answers on the server. Never accept a browser-supplied score or correct-answer index as authoritative.
5. Keep training duration, access expiry and active-study duration as three separate configuration values.
6. Find and use the already-approved shared set of 10 feedback questions. Do not invent substitutes. Connect feedback to the final-slide QR/link flow after the approved question set is located.
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
- Email delivery, access recovery, mobile/desktop behavior, feedback flow and certificate verification pass end-to-end tests.

## Current blockers
- Airport workshop learner screens and dedicated assessment flow are not yet implemented as a complete, separate workflow.
- The approved 10-question feedback set must be located before feedback integration.
- Automated checks and end-to-end tests have not yet been confirmed.

## Release rule
Keep the related pull request in draft and do not merge or activate this workshop until the implementation and all release gates have been reviewed and verified.
