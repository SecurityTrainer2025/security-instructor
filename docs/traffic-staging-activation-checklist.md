# SI Traffic Control — Staging Integration & Activation Checklist
**Status: NOT LIVE — staging-only, fail-closed. Updated 2026-11-12.**

## Completed and verified
- Dedicated bilingual Traffic registration/recovery page: `frontend/traffic-self-study-register.html`.
- Dedicated bilingual learner page: `frontend/traffic-self-study.html`; Traffic session keys are separate from the existing Fire Safety session.
- Traffic content: 10 assessed screens with five questions each, 30 final questions, >=80% per screen, >=70% overall, maximum two final attempts (one retry).
- Route selectors: Traffic screens and final questions are selected from `backend/self-study-traffic-config.js` by the authenticated enrollment course slug. Fire Safety's original course content and attempt policy are preserved.
- Traffic certificate-issuance integration is covered by in-memory mocks; it is **not** a real certificate issue, delivery, or QR verification test.
- **Fail-closed certificate gate added:** Traffic passes and scores remain recorded, but neither the passing exam nor a certificate retry will issue a Traffic certificate until `TRAFFIC_CERTIFICATES_ENABLED=true` in the independently isolated staging environment. Default is OFF. Fire Safety certificate behavior remains unchanged. Verified with both blocked and mock-enabled scenarios in run #43237256785.
- Traffic final exam now shuffles **question order per trainee and per attempt**, as well as answer options. This was tested without changing Fire Safety exam ordering.
- GitHub Actions browser checks on desktop and mobile use intercepted staging API calls and no real trainee details.
- Current staging frontend config is empty: `window.SI_TRAFFIC_STAGING_API = ''`. This intentionally disables submission.
- Traffic routes are guarded behind **all** of:
  - `SI_DEPLOYMENT_ENV=staging`
  - `TRAFFIC_PILOT_ENABLED=true`
  - `TRAFFIC_STAGING_FRONTEND_URL=https://si-staging-ui.onrender.com/traffic-self-study.html`
  - `SI_TRAFFIC_STAGING_DB_NAME=<actual dedicated database name containing staging>`; must exactly match the connected MongoDB database name, never the production database.
  - `TRAFFIC_CERTIFICATES_ENABLED=false` while the independent certificate and QR pathway is unverified.
- Rejected on production when `SI_DEPLOYMENT_ENV` is not `staging`, even if `TRAFFIC_PILOT_ENABLED=true`.
- No learner-facing Traffic video is returned while the six hand-signals remain unapproved.
- **New 12 November 2026 automated checks:** fully mocked registration, outbound Brevo email payload and Traffic link, one-time token exchange, 120-hour access beginning at activation, correct session isolation, recovering access without extending the original window, and rejection when the connected MongoDB is not the dedicated staging database. GitHub Actions run #43235607916 passed. This does **not** certify live Brevo deliverability or real database connection.
- No merge or deploy to the public site or production backend; no changes to the five existing course frontend files or certificate templates.

## Next required verification (not yet complete)
1. Identify an independently provisioned **staging backend and isolated staging database**. Never connect staging to production MongoDB.
2. Deploy the isolated Traffic backend to staging only and confirm its environment flags and CORS restrictions.
3. Set `frontend/traffic-staging-config.js` to the approved **staging API URL only**, after it has passed a read-only health check. The registration page must stay unusable until then.
4. Test a disposable trainee registration through Brevo, link exchange, five-day access, 80% lesson progression, final exam attempts, feedback, Admin record, certificate issuance and QR verification. Use staging data only. Turn on the Traffic certificate flag only in that isolated environment after the certificate implementation has passed review.
5. Obtain a **qualified trainer's safety approval** for six real, continuous human-motion traffic signal videos. Current photorealistic-keyframe MP4s are not approved substitutes.
6. Review course metadata and course certificate configuration for `CRS-TRAFFIC-001` on staging, then run end-to-end regression for all five previous courses.
7. Seek explicit final launch approval before production deployment; activate course only after all gates are green.

## Independent integration not yet established
- A Render plugin connection was confirmed by the user, but Render service list, runtime environment details, deployment controls and staging MongoDB identity have not yet been verified through an available management interface. Do not interpret mock test success as a deployed staging backend.
- The learner-facing hand-signal media is not approved live human motion, and cannot be activated by code alone.

## Existing risks kept blocked
- The staging branch modifies `backend/self-study-routes.js`; do not squash/merge into production until full staging regression and deployment isolation have been verified.
- Do not assume the existing Fire Safety certificate flow automatically supports the new course code or QR.
- Do not turn the Traffic flags on in the production Render service.
- Do not publish demo hand-signal MP4s as training footage.
