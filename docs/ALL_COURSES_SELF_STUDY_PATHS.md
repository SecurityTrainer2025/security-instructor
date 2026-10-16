# SECURITY INSTRUCTOR — Multi-Course Self-Study Paths

## Objective
Build one reusable self-study engine and five independent course paths. Each course must have its own reviewed content, learning sequence, question bank, progress record, final assessment and certificate eligibility rules. Shared code is preferred; course content and grading data must never be mixed between courses.

## Courses currently listed in SI
1. Traffic Management & Vehicle Control — `traffic-management-vehicle-control` / `CRS-TRAFFIC-001`
2. Crowd Management & Event Security — `crowd-management-event-security` / `CRS-CROWD-001`
3. Fire Safety & Emergency Response — `fire-safety-emergency-response` / `CRS-FIRE-001`
4. Vehicle Search & Security Inspection — `vehicle-search-security-inspection` / `CRS-VEHICLE-001`
5. Person Search & Security Screening — `person-search-security-screening` / `CRS-PERSON-001`

The Airport Safety, Emergency & Evacuation workshop (`AVS-EMRG-2026`) is a separate workshop path and should use the same reusable engine only after its dedicated content and workflow are reviewed.

## Shared learner journey
Course selection → course-specific registration/enrollment → secure email access link → authenticated learner session → course overview and objectives → progressive content screens → knowledge check after each required section → saved progress and cumulative score → final assessment → server-side pass decision → certificate eligibility and verification.

## Shared rules (unless an approved course specification explicitly overrides them)
- Each required knowledge check has five questions and requires at least 4/5 correct (80%) to unlock the next section.
- Learners can resume from saved progress while their access and active-study windows remain valid.
- Final assessment has 30 questions, with question order and option order randomized per learner.
- Final pass rule is strictly greater than 70%; for 30 equally weighted questions, at least 22 correct.
- Initial attempt plus two free retakes (three total attempts), unless the approved course policy says otherwise.
- All scoring, progression gates, attempt counts and certificate eligibility are verified server-side.
- Never expose answer keys or accept a browser-provided score as authoritative.
- Training duration, access-link duration and active-study duration are separate settings.
- Course completion certificates state the completed course and do not imply a professional license or operational authorization.
- Existing Fire Safety learner records and certificates must remain compatible during the refactor.

## Course-specific learning-path blueprint

### 1. Traffic Management & Vehicle Control
- Module 1: traffic risks, site layout and vehicle/pedestrian interaction
- Module 2: traffic control zones, signs and barriers
- Module 3: directing vehicle movement and safe positioning
- Module 4: incidents, breakdowns, emergency access and escalation
- Module 5: practical scenarios, reporting and final review

### 2. Crowd Management & Event Security
- Module 1: crowd behavior, density and early warning signs
- Module 2: access control, entry/exit flow and screening interfaces
- Module 3: communication, queue management and coordination
- Module 4: crowd incidents, emergency routes and escalation
- Module 5: scenario practice, reporting and final review

### 3. Fire Safety & Emergency Response
- Preserve the existing Fire Safety course workflow and content while moving toward the reusable engine.
- Modules: fire science and building hazards; fire classifications and portable extinguishing agents; detection, alarms and suppression; tactical response and facility fire plans; evacuation and incident command.
- Do not change its existing assessment or certificate behavior without a separately reviewed change.

### 4. Vehicle Search & Security Inspection
- Module 1: purpose, authority, safety and inspection boundaries
- Module 2: approach, positioning and systematic external inspection
- Module 3: interior/compartment inspection principles and prohibited-item awareness
- Module 4: suspicious findings, scene safety, reporting and escalation
- Module 5: scenario practice, documentation and final review

### 5. Person Search & Security Screening
- Module 1: lawful authority, consent/policy boundaries, dignity and communication
- Module 2: preparation, positioning and systematic screening principles
- Module 3: screening equipment awareness and safe use within training
- Module 4: prohibited/suspicious items, escalation and privacy
- Module 5: scenario practice, reporting and final review

The module headings above are a planning structure, not approved training content. Final screen text, images/videos and question banks must be reviewed against the actual SI course materials and applicable local procedures before a course is enabled. Content must not instruct learners to exceed their legal authority or training.

## Course manifest requirements
Every path must declare:
- stable course slug and code
- course title and language support
- path status (`planned`, `content-review`, `testing`, `active`)
- module/screen IDs and ordering
- approved media references and text fallbacks
- question-bank version and answer-key location (server-side only)
- formative pass rule, final exam rule and attempt policy
- training duration, access-link duration and active-study duration independently
- certificate template/issuer and eligibility conditions
- release-test status

## Rollout sequence
1. Establish and test the shared engine with no behavior changes to the existing Fire Safety path.
2. Complete and validate the five course manifests against existing source materials.
3. Implement one path at a time, with server-side progress and grading.
4. Test each path independently, including randomized option grading, expiry, retakes, resume, mobile/desktop, email delivery and certificate verification.
5. Enable a path only after content approval and end-to-end checks pass.

## Current status
This document defines the intended multi-course architecture and topic-level path blueprints. It does not mean the five learner-facing paths have already been implemented or enabled. Keep new paths disabled until each is fully built and tested. Do not merge or activate the work based on documentation alone.
