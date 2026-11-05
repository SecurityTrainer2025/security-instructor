# SI Training Content & Narration Standard / معيار المحتوى والصوت

Status: Approved by platform owner, 2026-11-05. Applies to future SI courses and new modules. This document is staged on the isolated Traffic pilot branch; it is not yet deployed to production.

## Voice / التعليق الصوتي
- Use natural-sounding, clear **Modern Standard Arabic (الفصحى المبسطة)** comprehensible across Arab countries. Avoid regional slang and excessive speed.
- Current approved pilot synthesis voice: `ar-SA-HamedNeural`. A specific provider or voice ID is an implementation choice, not a permanent requirement; any replacement requires an actual listening test.
- Preserve complete sentences, avoid clipped endings, and check pronunciation of technical/security terminology.
- Match spoken narration to on-screen content; provide synchronized **English captions** (WebVTT) for every narrated Arabic video.
- Do not assume technical encoding success proves naturalness: manually review voice quality and timing on desktop and mobile.
- Prefer meaningful 4–5 minute lessons over short decorative clips, with realistic decisions, hazards, controls and examples. Length should follow educational needs, not padding.

## Bilingual instruction / التدريب باللغتين
- Provide Arabic **and** English for lesson text, instructions, scenarios, choices, explanations, feedback, assessments and accessibility labels.
- Captions must translate the **actual narration**, not merely repeat slide titles.
- Review Arabic RTL and English LTR layout on desktop and mobile.

## Learning flow / رحلة التعلم
- Learning material → applied decision scenario → five-question knowledge check → feedback → next unit.
- Require at least 4/5 (80%) correct to advance; support retake, shuffle answer positions and test failure/retry paths.
- Use approved site procedures, risk assessment, pedestrian protection, emergency access and safe escalation as safety baseline.
- Preserve existing five production courses and their original certificates. No publishing or migration without separate review and explicit authorization.

## Exception / الاستثناء
- The previously agreed Civil Airports Safety, Emergency & Evacuation workshop has Arabic-only training content; do not silently alter that decision.

## QA checklist
1. Narration understandable and natural, without cut-off words.
2. English subtitles accurately cover full spoken narration.
3. Arabic/English learning, activity, quiz and feedback all present.
4. Activities teach decisions and consequences; not just passive watching.
5. Pass, fail, retry, progress and navigation tested.
6. Videos and subtitles play on desktop and common mobile browsers.
7. Isolated pilot branch only until approval; no changes to main, certificates or learner data.
