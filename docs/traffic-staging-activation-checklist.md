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

## Restored isolated Render preview — 12 November 2026
- Confirmed Render workspace `My Workspace` hosts **two separate Traffic staging services**:
  - Static website: `si-staging-ui`, branch `feat/self-study-traffic-course`, published from `frontend/`.
  - Backend: `si-avs-staging-test`, branch `feat/self-study-traffic-course`, published from `backend/`.
- Root cause of previous **404**: old static-host branch lacked `traffic-self-study-register.html`, `traffic-self-study.html`, and `traffic-staging-config.js`. The three independent pages were selectively copied from the tested isolated branch to the static-host branch only, in commits ending at `99220ffd1f79fdb4bb3717a13e6edad4525bf732`.
- Confirmed static-site Render deploy `dep-dbqssjpah35c73fsfe80` finished **live**. No changes were made to production `main`, Render production service, existing Fire Safety site files or course certificates.
- Fresh GitHub read-only probe [run #43238878812](https://github.com/SecurityTrainer2025/security-instructor/actions/runs/43238878812) confirmed:
  - Backend catalog GET **HTTP 200**;
  - Traffic learner page **HTTP 200** and expected isolated learner HTML;
  - Traffic registration page **HTTP 200** and expected isolated registration HTML;
  - Traffic config file **HTTP 200**, containing an **empty staging API**, so actual registration remains disabled.
- A prior backend HTTP 503 was followed by Render runtime messages `Training API listening` and `MongoDB connected`. This indicates startup after the probe, **not proof of a separately isolated staging MongoDB**.
- Do not turn on registration until staging database identity and safe service branch have been verified. Backend is still deploying the older Traffic branch, not the new fail-closed isolated integration.

## Staging connectivity probe — 12 November 2026
- GitHub Actions [run #43237807938](https://github.com/SecurityTrainer2025/security-instructor/actions/runs/43237807938) **completed** a read-only, allowlisted HTTP GET probe.
- `si-avs-staging-test.onrender.com/api/self-study/courses/traffic-management-vehicle-control` returned **HTTP 503**; availability not confirmed.
- `si-staging-ui.onrender.com/traffic-self-study.html` returned **HTTP 404**; learner page is not deployed at this assumed URL.
- This is a **release blocker**; do not fill in the empty Traffic staging frontend config or set activation flags based on guessed hostnames.
- No POST, registration, email, database modification, certificate issue, or production deployment was executed.
- Access to Render application-management actions is not currently exposed via the available account tools, even though Render was connected; confirm the actual staging service and deployment configuration through an available management interface before any rollout.

## Live Render staging readiness — 12 November 2026 (follow-up)
- Render service `si-avs-staging-test` is a **separate service** from production `security-instructor`. Its private runtime log reports the connected MongoDB database name as `security_instructor_staging`. This proves the connected database **name**; the actual production MongoDB database name and connection details were not independently compared, so do not claim complete credential/cluster isolation.
- The QA-tested self-study routes were selectively deployed to staging branch `feat/self-study-traffic-course` (commit `9ca44d4baeb91206c329f3f4590be8e03e4a143f`), without modifying `main`.
- Dedicated staging environment keys were set with `SI_DEPLOYMENT_ENV=staging`, `SI_TRAFFIC_STAGING_DB_NAME=security_instructor_staging`, `TRAFFIC_PILOT_ENABLED=false`, `TRAFFIC_CERTIFICATES_ENABLED=false`. These safeguards are **OFF by default**, and UI config still has empty staging API.
- Render deploy `dep-dbqt435g1s2s73bc49qg` is `live`.
- [GitHub read-only run #43241446516](https://github.com/SecurityTrainer2025/security-instructor/actions/runs/43241446516) **passed**: backend health **HTTP 200**, Traffic catalog **HTTP 404** (correctly hidden), Traffic registration and learner HTML **HTTP 200**, and disabled configuration **HTTP 200**.
- The learner page now displays a clearly labeled safe preview rather than the confusing 'Access unavailable' message.
- **No real trainee registration, email, QR or certificate test has been completed.** Do not enable enrollment or launch the course until real staged end-to-end and qualified hand-signal safety review are complete.

## Ten-question Traffic course feedback gate — 12 November 2026
- Added a dedicated **Traffic-only, bilingual ten-item course feedback questionnaire** (1–5 rating for each), available after completing the ten learning screens at >=80% each.
- Traffic final questions and final submission are blocked at the backend until feedback is submitted. Fire Safety's existing assessment and certificate flows are not changed.
- Feedback is held in the staging-only `selfstudytrafficfeedback` collection and `progress.feedbackSubmittedAt` on the student's Traffic access record.
- GitHub server contract and mocked route tests **passed**: [run #43242516790](https://github.com/SecurityTrainer2025/security-instructor/actions/runs/43242516790). Validation includes rejecting fewer than ten responses, accepting all ten, and checking the final-exam gate.
- Desktop/mobile Chromium browser tests **passed** after correcting mock fixture data: [run #43243183501](https://github.com/SecurityTrainer2025/security-instructor/actions/runs/43243183501). Eight tests passed with mocked API calls and no live trainee data.
- Confirmed Render staging deploys `dep-dbqt7qfavr4c73fvs300` (backend) and `dep-dbqt80tbedkc73c4c0rg` (frontend) were **live** for the feedback changes. The staging registration connection remains empty and Traffic activation remains OFF.
- **Not yet tested:** real staging database writes through a full learner journey, live transactional email deliverability, issued certificate and QR scanning, independent validation of hand-signal realism, or publication to learners.

## Existing risks kept blocked
- The staging branch modifies `backend/self-study-routes.js`; do not squash/merge into production until full staging regression and deployment isolation have been verified.
- Do not assume the existing Fire Safety certificate flow automatically supports the new course code or QR.
- Do not turn the Traffic flags on in the production Render service.
- Do not publish demo hand-signal MP4s as training footage.
