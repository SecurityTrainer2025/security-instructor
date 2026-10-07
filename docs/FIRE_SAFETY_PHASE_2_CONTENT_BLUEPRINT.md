# Fire Safety Self-Study — Phase 2 Content Blueprint

Status: Working implementation document — NOT a certification/compliance statement.

## Phase 2 objective

Convert the existing 70-slide Fire Safety presentation into a reusable self-study learning experience while preserving the training intent and improving technical accuracy, learner interaction, and security-officer role boundaries.

The 70 source slides are the content baseline. They are **not** copied blindly into the LMS. Slides with unsupported statistics, jurisdiction-specific terminology, or overly broad operational claims must be rewritten before publication.

## Learning design

1. Five modules remain the main course structure.
2. Each learning screen has:
   - English content at approximately B1/B2 level.
   - Clear Modern Standard Arabic.
   - Source-slide reference.
   - A media slot for an official/licensed/SI-produced video or visual.
   - A knowledge check linked to the screen.
3. Required knowledge checks use an **80% mastery gate** before the learner can continue.
4. Review/title slides may be non-assessed screens where assessment would add no learning value.
5. The learner's results are accumulated across the course.
6. The final assessment remains separate:
   - 30 questions.
   - Minimum pass score: 70%.
   - Maximum total attempts: 3 (initial attempt + 2 free retakes).
7. Certificate eligibility requires completion of the learning path, required 80% mastery, and a passed final assessment.
8. The final assessment must remain disabled until its server-side question bank and answer key are independently validated.

## Source-slide map

### Opening
- 1 — Course title
- 2 — Course objectives and learning outcomes
- 3 — Course agenda and module structure

### Module 1 — Fundamentals of Fire Science & Building Hazards
- 4 — Module opening
- 5 — Module objectives
- 6 — Introduction to fire safety in facilities
- 7 — Fire triangle
- 8 — Fire tetrahedron
- 9 — Heat Release Rate (HRR) and fire growth
- 10 — Convection
- 11 — Conduction and radiation
- 12 — Direct burning and ignition
- 13 — Industrial and utility hazard areas
- 14 — Kitchens and laundries
- 15 — Housekeeping and clutter hazards
- 16 — Module 1 review

### Module 2 — Fire Classifications & Portable Extinguishing Agents
- 17 — Module opening
- 18 — Module objectives
- 19 — Fire classifications
- 20 — Class A
- 21 — Class B and Class C
- 22 — Class D and Class K
- 23 — Portable extinguisher role and limits
- 24 — Water and foam
- 25 — CO2
- 26 — Dry chemical powder
- 27 — Clean agents
- 28 — Extinguisher selection
- 29 — PASS
- 30 — Extinguisher inspection
- 31 — Fire blankets
- 32 — Stop, Drop, Roll
- 33 — Module 2 review

### Module 3 — Fire Detection, Alarms & Suppression Systems
- 34 — Module opening
- 35 — Module objectives
- 36 — Human vs electronic detection
- 37 — Heat detectors and flame sensors
- 38 — Smoke detectors
- 39 — Fire alarm control panels
- 40 — Manual fire alarm stations
- 41 — Automatic sprinklers
- 42 — Range-hood systems
- 43 — Compartmentation and fire doors
- 44 — Toxic smoke spread
- 45 — Module 3 review

### Module 4 — Tactical Response & Facility Fire Plans
- 46 — Module opening
- 47 — Module objectives
- 48 — Comprehensive fire plan
- 49 — RACE
- 50 — Arson prevention and observation
- 51 — Anti-looting / site security during emergencies
- 52 — Fire as a deliberate hostile threat
- 53 — NFPA 1600 reference review
- 54 — NFPA 3000 / active-threat context review
- 55 — Module 4 review

### Module 5 — Emergency Evacuation & Incident Command
- 56 — Module opening
- 57 — Module objectives
- 58 — Evacuation and means of egress
- 59 — Signs, markings and emergency lighting
- 60 — Evacuation warden and security roles
- 61 — Accountability and assembly points
- 62 — Incident Command System (ICS)
- 63 — ICS general staff
- 64 — Coordination with public emergency services
- 65 — Coordination with medical responders and triage
- 66 — Post-incident review and psychological support
- 67 — Module 5 review
- 68 — Practical drill
- 69 — Course summary
- 70 — Course close

## Mandatory technical corrections before publication

### Slide 9 — HRR
Do not state that HRR measures temperature increase, and do not publish the universal "fire doubles every 40 seconds" statement as a general rule. HRR is the rate at which a fire releases energy. Fire growth depends on fuel, ventilation, geometry and other conditions.

### Slide 12 — Smoking statistic
Remove the unsupported universal 25% statistic unless a current, authoritative source is specifically documented. Keep the practical prevention message: smoking materials can ignite combustible waste and must be controlled according to site rules.

### Slides 19–22 — Fire classes
Use the current NFPA 10 framework for the course's NFPA references: Class A, B, C, D and K. Class C refers to fires involving energized electrical equipment; it should not be presented as a universal synonym for flammable gases. Local systems may use different classification terminology, so local procedures and labels must take precedence.

### Slides 25–27 — Extinguishing agents
Avoid universal claims such as "safe for all A/B/C fires." Teach learners to read the extinguisher label and follow the applicable site procedure. Clean-agent suitability depends on the specific agent, equipment, hazard and application.

### Slides 29–32 — Hands-on actions
Operational actions must be framed as conditional: only when trained, authorized, the fire is small/incipient, an exit route is available, and conditions remain safe. The course is not a substitute for fire-service training.

### Slides 53–54 — Standards
References to NFPA 1600 and NFPA 3000 require edition and scope verification before publication. Do not imply that a security self-study course is certified or compliant with those standards merely because they are referenced.

### Slides 58–66 — Evacuation, ICS and medical response
Rewrite absolute role statements so that security personnel support the site emergency plan and follow directions from the competent incident/emergency authority. Avoid assigning medical, fire-service or command responsibilities beyond training and authorization.

## Media policy

Every applicable learning screen receives a media slot. Media may be:

- Official/public educational material where embedding is permitted.
- Licensed third-party material.
- Original SECURITY INSTRUCTOR visuals or videos.
- Diagrams/animations created for SI.

No copyrighted video should be downloaded or republished without the required rights.

## Publication gate for Phase 2

Phase 2 is not complete until:

- All 70 source slides have been reviewed.
- All learner-facing text has been rewritten where required.
- English and Arabic content are aligned.
- Learning checks are specific to the learning content.
- 80% mastery is enforced server-side.
- The 30-question final bank is validated server-side.
- Certificate eligibility is connected to verified completion and final assessment.
- Access expiry, mobile layout, email delivery and end-to-end flow are tested.

## Current implementation boundary

The feature branch remains a draft and must not be merged to `main` until the publication gate is passed.
