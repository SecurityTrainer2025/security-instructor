# SI Workshops and Certificate Verification — Implementation Plan

## Goal
Add a distinct Workshops area without removing or overwriting Case Studies, support workshop completion certificates through the existing certificate verification system, and collect course/workshop feedback in the existing Admin Feedback tab.

## Current architecture findings (2026-10-13)
- `frontend/verify.html` verifies training certificates through `GET /api/verify/training-certificate?id=...`.
- `backend/training-certificate-routes.js` owns the TrainingCertificate model and direct certificate verification/issuance routes.
- Certificate records are linked to an enrollment using a unique `enrollmentId`; issuance is currently built around course enrollment and course completion.
- `frontend/certificates-center.js` manages course certificates in the admin panel.
- `frontend/case-studies.html` is a public knowledge page with a case-analysis framework; do not replace or delete it in the first release.
- The standalone 8-hour AVS workshop PDF is only a template and is not yet registered in the database or integrated with QR verification.
- Backend currently has `CourseFeedback` records and an admin-only `GET /api/admin/feedback` endpoint. Existing feedback uses a course slug and a short note; it is not yet a complete bilingual workshop/course feedback questionnaire.

## Feedback QR decision (approved)
1. The second slide/screen in every course and workshop will be a dedicated **Feedback & Questions / التقييم والملاحظات والأسئلة** screen.
2. Show a QR code and a short, readable URL. Scanning it opens a mobile-friendly feedback form prefilled with the course/workshop identifier and context; do not encode personal data in the QR.
3. The form should support a quick rating, structured feedback, and an optional question for the instructor/team. Provide Arabic and English labels.
4. Submissions must be stored in the existing feedback system and visible from the existing Admin > Feedback/Notes tab, with the source type (course/workshop), source code/title, submission time, rating, comment/question, and status. Keep the existing feedback records and course feedback flow compatible.
5. Add basic validation, length limits, rate limiting/spam controls, and safe output escaping. Do not expose admin feedback records publicly.
6. Do not display a fake/non-working QR. Generate the final QR only after the public feedback route and persistence endpoint are implemented and tested. The QR target must be a stable HTTPS URL and work on phones, tablets, and desktop (desktop users can click the URL).
7. Feedback is not a required assessment and must not affect course progress, pass/fail, attendance, or certificate eligibility.

## Safety requirements
1. Do not alter the existing course certificate issuance path or its database records.
2. Do not make the workshop publicly registrable until admin management, eligibility/completion rules, and backend validation are implemented and tested.
3. A workshop certificate must be backed by a persisted record and unique certificate ID. The QR must point to the existing verification page with the certificate ID.
4. Keep course and workshop document types distinguishable in both admin and verification output.
5. Escape user-supplied fields in all verification and admin UI output; avoid injecting raw database strings into `innerHTML`.
6. Preserve the existing Case Studies page and its content.
7. Do not issue claims of accreditation or airport operational authorization. The 8-hour workshop certificate is a completion record only.

## Proposed data model
Create a separate `Workshop` record/catalog and `WorkshopEnrollment` (or an explicit workshop type on the existing enrollment model only if compatibility is demonstrated). Do not overload course slugs or silently treat workshop attendance as course completion.

Workshop fields: `workshopId`, `slug`, bilingual title/description, `durationHours`, delivery mode, dates, instructor, status (draft/open/closed/archived), completion requirements, created/updated timestamps.
Workshop participant/completion fields: unique enrollment/participant ID, workshop ID, trainee identity reference, status, attendance/completion evidence, completion date.
Certificate fields: unique certificate ID, document type = workshop completion, workshop ID/title in both languages, duration hours, recipient, issue date, valid/revoked status, verification URL.

## Implementation sequence
1. Audit existing certificate issuance and verification routes, admin course/enrollment models, feedback routes and test coverage. (Initial audit started)
2. Add the public Workshops information/catalog page; keep registration disabled until backend flow is ready.
3. Implement the shared bilingual feedback page/API and safely route course/workshop feedback into the existing Admin Feedback tab.
4. Place the functional feedback QR/URL on the second screen of courses and workshops; validate scanning on mobile and click-through on desktop.
5. Add isolated workshop models and admin endpoints; do not modify course enrollment semantics.
6. Add admin Workshops tab for creation, status, participant/completion management, and certificate issuance.
7. Extend verification endpoint/UI to resolve course certificates and workshop certificates safely, preserving legacy response fields.
8. Create workshop certificate rendering from the SI certificate design, with 8-hour duration and QR verification URL.
9. Add tests for feedback source attribution, invalid submissions, rate limiting, escaping, valid/revoked/unknown certificates, duplicate issuance, wrong workshop, incomplete attendance, and course-verification regression.
10. Run CI and staging verification; only then request review/merge and deploy.

## Initial workshop
- Code: AVS-EMRG-2026
- English: Safety, Emergency & Evacuation in Civil Airports
- Arabic: إدارة السلامة والطوارئ والإخلاء في المطارات المدنية
- Duration: 8 hours
- Certificate type: Workshop Completion Certificate
- Public registration/availability: not yet approved or enabled.
