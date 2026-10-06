# SECURITY INSTRUCTOR — Self-Study LMS Roadmap

## Goal
Convert the five existing SECURITY INSTRUCTOR courses into a reusable interactive self-study format without creating a separate LMS architecture for each course.

## Reusable learner flow
Course registration → secure learner access → learning screen → media/visual explanation → knowledge check → 80% mastery gate → progress saved → cumulative score → all modules complete → final assessment → certificate eligibility → certificate/QR verification.

## Opening Fire Safety course
- Course: FIRE SAFETY & EMERGENCY RESPONSE
- Code: CRS-FIRE-001
- Opening model: free 72-hour self-study window
- Learning mastery: 80% per required knowledge check
- Final assessment: 30 questions
- Final pass mark: 70%
- Final attempts: 3 total (initial + 2 free retakes)
- Certificate: only after required learning mastery and final assessment pass
- Access: email-based secure access link, followed by a server session
- Progress: stored server-side against trainee + enrollment

## Content conversion
The current Fire Safety master presentation contains 70 slides and five modules:
1. Fundamentals of Fire Science & Building Hazards
2. Fire Classifications & Portable Extinguishing Agents
3. Fire Detection, Alarms & Suppression Systems
4. Tactical Response & Facility Fire Plans
5. Emergency Evacuation & Incident Command

The current implementation includes the reusable learning engine and a controlled prototype set of learning screens. The full 70-slide conversion, media selection, question-bank validation and final 30-question assessment remain content-production work and must be completed before public launch.

## Future courses
The same engine is intended for:
1. Traffic Management & Vehicle Control
2. Crowd Management & Event Security
3. Fire Safety & Emergency Response
4. Vehicle Search & Security Inspection
5. Person Search & Security Screening

Each future course should have its own:
- course manifest
- module/screen sequence
- licensed/official/SI-produced media
- server-side question bank
- 80% screen/module mastery rules
- cumulative learning record
- final assessment
- certificate eligibility rules

## Media policy
Use official, licensed, permission-cleared or SI-produced images/video. External videos should be embedded rather than copied to the repository unless the license permits redistribution. Media should have a fallback text/image explanation so learning is not blocked if an external video becomes unavailable.

## Security principles
- Never trust a browser-supplied score for certificate eligibility.
- Validate knowledge-check answers server-side.
- Use high-entropy, short-lived, single-use access tokens.
- Store token hashes rather than raw tokens.
- Use a short-lived learner session after token exchange.
- Keep self-study access separate from admin authentication.
- Do not expose answer keys in the learner frontend.
- Do not expose sensitive learner data through predictable URLs.

## Launch gate
Do not advertise the Fire Safety self-study as fully live until:
- the full 70-slide content has been converted and reviewed
- videos/images are checked
- all knowledge checks are validated
- the final 30-question bank is validated
- certificate eligibility is tested
- email delivery is tested on the production sender
- 72-hour expiration is tested
- mobile/desktop E2E testing is completed
