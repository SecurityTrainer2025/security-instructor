# SI Workshops and Certificate Verification — Implementation Plan

## Goal
Add a distinct Workshops area without removing or overwriting Case Studies, and support workshop completion certificates through the existing certificate verification system.

## Current architecture findings (2026-10-13)
- `frontend/verify.html` verifies training certificates through `GET /api/verify/training-certificate?id=...`.
- `backend/training-certificate-routes.js` owns the TrainingCertificate model and direct certificate verification/issuance routes.
- Certificate records are linked to an enrollment using a unique `enrollmentId`; issuance is currently built around course enrollment and course completion.
- `frontend/certificates-center.js` manages course certificates in the admin panel.
- `frontend/case-studies.html` is a public knowledge page with a case-analysis framework; do not replace or delete it in the first release.
- The standalone 8-hour AVS workshop PDF is only a template and is not yet registered in the database or integrated with QR verification.

## Safety requirements
1. Do not alter the existing course certificate issuance path or its database records.
2. Do not make the workshop publicly registrable until admin management, eligibility/completion rules, and backend validation are implemented and tested.
3. A workshop certificate must be backed by a persisted record and unique certificate ID. The QR must point to the existing verification page with the certificate ID.
4. Keep course and workshop document types distinguishable in both admin and verification output.
5. Escape user-supplied fields in all verification UI output; avoid injecting raw database strings into `innerHTML`.
6. Preserve the existing Case Studies page and its content.
7. Do not issue claims of accreditation or airport operational authorization. The 8-hour workshop certificate is a completion record only.

## Proposed data model
Create a separate `Workshop` record/catalog and `WorkshopEnrollment` (or an explicit workshop type on the existing enrollment model only if compatibility is demonstrated). Do not overload course slugs or silently treat workshop attendance as course completion.

Workshop fields: `workshopId`, `slug`, bilingual title/description, `durationHours`, delivery mode, dates, instructor, status (draft/open/closed/archived), completion requirements, created/updated timestamps.
Workshop participant/completion fields: unique enrollment/participant ID, workshop ID, trainee identity reference, status, attendance/completion evidence, completion date.
Certificate fields: unique certificate ID, document type = workshop completion, workshop ID/title in both languages, duration hours, recipient, issue date, valid/revoked status, verification URL.

## Implementation sequence
1. Audit existing certificate issuance and verification routes, admin course/enrollment models, and test coverage. (In progress)
2. Add the public Workshops information/catalog page; keep registration disabled until backend flow is ready.
3. Add isolated workshop models and admin endpoints; do not modify course enrollment semantics.
4. Add admin Workshops tab for creation, status, participant/completion management, and certificate issuance.
5. Extend verification endpoint/UI to resolve course certificates and workshop certificates safely, preserving legacy response fields.
6. Create workshop certificate rendering from the SI certificate design, with 8-hour duration and QR verification URL.
7. Add tests for valid, revoked, unknown ID, duplicate issuance, wrong workshop, incomplete attendance, escaping, and regression of course verification.
8. Run CI and staging verification; only then request review/merge and deploy.

## Initial workshop
- Code: AVS-EMRG-2026
- English: Safety, Emergency & Evacuation in Civil Airports
- Arabic: إدارة السلامة والطوارئ والإخلاء في المطارات المدنية
- Duration: 8 hours
- Certificate type: Workshop Completion Certificate
- Public registration/availability: not yet approved or enabled.
