# AVS-EMRG-2026 Assessment Integration Contract

Status: implementation contract only; no production routes are registered by this document.

## Initial diagnostic assessment

Source of truth: `backend/avs-emrg-2026-initial-assessment.js`.

- Exactly 10 bilingual (English/Arabic) medium-difficulty questions.
- Diagnostic only: no pass/fail gate, no access restriction, and no certificate effect.
- Every attempt must call `createInitialAssessmentSnapshot()` on the server and persist its `attemptId`, `questionOrder`, and `optionOrderByQuestionId` before returning a quiz.
- Return only `buildPublicInitialAssessment()` output to the browser. Never serialize `correctOptionId`.
- Grade submissions using `gradeInitialAssessment()` against the persisted snapshot, not an order submitted by the browser.
- Persist the diagnostic score and timestamp against the authenticated/enrolled learner. Do not accept learner identity from a body field as authorization.
- Do not show answer keys to learners unless an explicit reviewed product requirement is approved.

## Required randomization behavior

Randomization must apply to both the order of the questions and the order of each question's answer options. The correct answer is identified by stable option ID, not its displayed position. A different order must never change the score for the same logical answers.

The server must validate that the submission contains exactly one allowed option for every question in the persisted attempt, reject extra/missing question IDs, and prevent reuse of a snapshot belonging to another learner or attempt.

## Release safety

- Keep the workshop disabled until the complete learner flow is implemented and tested.
- Do not register these handlers by importing them into `backend/server.js` until authentication, enrollment ownership, persistence, rate limiting, and duplicate-submission handling are reviewed.
- Do not modify the live Fire Safety self-study workflow as part of this workshop integration.
- Test on mobile and desktop, including Arabic RTL, refresh/resume, expired access, randomization, grading, and answer-key leakage.
- The final assessment remains separate: 30 questions, 22 correct required, at most 3 attempts; these rules do not apply to the initial diagnostic.

## Current blockers

The assessment module and unit tests exist on the isolated development branch, but no AVS learner API or UI is wired yet. The full 75-question formative bank, 30-question final bank, approved feedback survey, persistence tests, and end-to-end verification are still release blockers.
