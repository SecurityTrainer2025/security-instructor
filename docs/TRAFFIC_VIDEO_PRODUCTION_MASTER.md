# SI Traffic Marshal — single production master (staging branch only)

This is a production plan for replacing the **current Traffic course's video assets in place**, not a separate course or release.

## Confirmed inputs and exclusions

- Course: **التحكم بحركة المرور / Traffic Control**, instructor role **منظم حركة المرور / Traffic Marshal**.
- Same learner journey: 5 modules, 10 screens, 50 in-lesson questions, 30 final questions, existing progress and enrollment.
- Approved site colours: navy #0B1F33, dark navy #081725, gold #C8A96B. Use the official owner-provided SI logo; never reconstruct a different logo.
- The two supplied `SI_Traffic_No_Subscription_Review_Package*.zip` archives contain equivalent assets: 3 photographic still frames, a 22.58-second **UNAPPROVED** normal-stop reference MP4, 6 Arabic speech MP3s and 6 English VTTs.
- **Do not publish** the photographic-still sequence as a realistic human-motion demonstration. It is a *reference only*, NOT the finished training footage.
- The existing geometric-vehicle videos and the 37.5-second slideshow introduction are **not accepted final imagery**.
- Preserve the Traffic certificate gate until safety, quality, assessment and QR checks pass. Do not deploy to production or alter existing five courses.

## Delivery criteria (each video)

Human motion must be continuous and physically plausible, the traffic marshal should stay identical and visible in all shots, the car must obey a plausible movement command, and roads/pedestrians must stay in a safe controlled training area. No unsafe position behind moving vehicles. The AI-generated signal is a reenactment, not evidence of a national legal standard. A competent practical instructor must approve each signal before it becomes training guidance.

Export MP4 H.264 + AAC, Full HD 1920×1080, 16:9, 25fps; Arabic narration as an intelligible mix, English VTT as an optional track, safe mobile layout, SI title and end slate. Prefer natural location sound quieter than narration; no unlicensed footage/music. Show the badge 'SIMULATED TRAINING SCENARIO / مشهد تدريبي محاكى' where scenes are AI-generated. Test video start, sound, controls, subtitles and duration on iPhone/Android/desktop.

## Video-to-screen plan

| Screen | New title | Required continuous live-action style scene | Suggested run time |
|---|---|---|---|
| tm1s1 | Traffic Control and the Traffic Marshal Role | Training site establishing shot, realistic Traffic Marshal in high-vis PPE, visible safe standing position; safely hold vehicle queue for protected pedestrian crossing; communicate to gate staff | 2–3 min |
| tm1s2 | Traffic Management Plan and Risk Assessment | Marshal reviews TMP with supervisor; animated *overlay* of actual paths/entry, restricted routes and escape point; supervised weather-visibility adjustment (no unsafe live demonstration) | 3 min |
| tm2s1 | Access Control Points and Inspection Traffic | Two vehicle lanes at controlled access point; inspection team confirms bay ready; marshal signals one vehicle forward and leaves emergency lane clear | 3 min |
| tm2s2 | Driver Induction and Noncompliance | Respectful marshal-to-driver briefing near a stopped parked vehicle; driver takes assigned lane; refusal is escalated without confrontation in live lane | 3 min |
| tm3s1 | Pedestrian Separation and Traffic Calming | Controlled crossing, barriers and designated accessible walkway; marshal holds vehicle until pedestrians safely clear | 3 min |
| tm3s2 | Parking and Reversing Operations | Accessible/VIP/loading parking labels; barriers/occupancy; a *trained authorised* guide positions safely, outside reversing path and in full sight; stops if visual contact lost | 3 min |
| tm4s1 | PPE, Heat Stress, Weather and Emergency Routes | High-vis vest and escape route close-up; water/shade/break; hazard reporting; protected emergency lane and ambulance access | 3 min |
| tm4s2 | Objective Incident Reporting | Marshal writes only observed time, lane, vehicle identifiers; SCRIM used strictly as memory aid; reports to supervisor while keeping traffic safe | 3 min |
| tm5s1 | Hand Signals and Field Communication | 6 individually reviewed signal clips using the **same human actor**; front three-quarter and side cameras, vehicle response in controlled area: forward, reverse, turn, exit, normal stop, emergency stop | 4–5 min |
| tm5s2 | Radio Calls, Shift Handover and Practice | Clear call sign/report/acknowledgment; replace marshal after handover; instructor-led short exercise controlling gate queue, pedestrians and emergency lane | 3–4 min |

## Detailed first video: screen tm1s1

**Training purpose:** Explain the marshal's role and limits; show that protecting people takes priority over moving vehicles quickly.

**Scene 1 (0–20 s):** Wide establishing view of a controlled industrial/commercial site. Human marshal in navy uniform, gold SI-branded high-visibility vest, PPE visible. Title `التحكم بحركة المرور | Traffic Control`, secondary `منظم حركة المرور | Traffic Marshal`. Camera motion natural and stable, no animated cars.

**Scene 2 (20–55 s):** Medium shot: worker checks site traffic route on an approved TMP with supervisor. Overlay (not substituted image) shows entrance, exit, footpath and emergency lane. Narration identifies permitted duties and the limit of police powers.

**Scene 3 (55–100 s):** Controlled pedestrian crossing near site entrance: marshal stands out of the lane in an assessed safe position, gives an *approved site stop command* to waiting vehicle. Pedestrians clear the marked area. Vehicle only proceeds after safe coordinated release.

**Scene 4 (100–135 s):** Marshal uses radio calmly to coordinate with gate team; nearby queue remains ordered, emergency access unobstructed. Do not depict confrontation, moving into traffic or directing two conflicting flows at once.

**Scene 5 (135–155 s):** Key takeaway on real footage: `سلامة الأشخاص أولاً / People before speed`, SI approved logo and training video identifier `01/10`.

**Arabic voice-over master (draft for final recording):**

مرحبًا بكم في دورة التحكم بحركة المرور من منصة سيكيوريتي إنستركتور. نتعرف في هذه الدورة على دور منظم حركة المرور، أو ترافك مارشال، في حماية الأشخاص وتنظيم حركة المركبات داخل المواقع.

يعمل منظم حركة المرور وفق خطة الموقع وتعليمات المشرف المختص، ولا يحل محل السلطات المرورية. تبدأ المهمة بفهم مسارات الدخول والخروج، وممرات المشاة، وحدود السرعة ومسارات الطوارئ.

عند وصول المركبات إلى المعابر أو البوابات، يختار المنظم موضعًا آمنًا وواضحًا للسائقين، ويستخدم الإشارات المعتمدة، ويتأكد من خلو مسار الحركة قبل السماح بالمرور.

إذا ظهرت مخاطر أو ازدحام، ينسق المنظم مع فريق البوابة وغرفة التحكم. لا يجوز تقديم سرعة حركة المركبات على سلامة المشاة والعاملين.

تذكر دائمًا: سلامة الأشخاص أولًا، وخطة الموقع قبل أي اجتهاد.

**English subtitles:** Translate the final *approved and recorded* Arabic narration. Timing must be aligned to the actual produced audio, not proportional placeholder timings.

## Signal footage already partially sourced

Audio review inputs supplied by owner:
- `01-forward.ar.mp3` + `01-forward.en.vtt`
- `02-reverse.ar.mp3` + `02-reverse.en.vtt`
- `03-turn.ar.mp3` + `03-turn.en.vtt`
- `04-exit.ar.mp3` + `04-exit.en.vtt`
- `05-stop.ar.mp3` + `05-stop.en.vtt`
- `06-emergency.ar.mp3` + `06-emergency.en.vtt`

These are review materials only and do not establish safe live-motion footage. Verify against an authoritative local operational guide and competent trainer before final use.

## Production blocker and safe handoff

Generation of actual continuous human-action video requires video generation access or licensed footage; **still images, audio files, and ffmpeg alone cannot create a verified realistic continuous demonstration**. Do not replace the current in-course MP4 URLs until the finished replacements pass a human safety/visual QA check. When finished, replace the *same* asset paths in `frontend/assets/traffic-videos/` on `feat/self-study-traffic-course`, test in isolated Staging, and leave the `main` branch untouched until owner approves release.

## Acceptance checklist

- [ ] 10 screen-specific human-motion films, with no repeated unrelated scene.
- [ ] Six signal motions verified by a competent instructor, no risk-inducing mistakes.
- [ ] Correct official SI logo, original navy/gold style, role/title consistent.
- [ ] Narration audible; English VTT properly timed; captions easy to toggle.
- [ ] Content and final questions match each newly shot video.
- [ ] Video fully tested in mobile/desktop browser on staging, with same progress retained.
- [ ] Certificate/QR independently tested and owner-approved before enabling issuance.
