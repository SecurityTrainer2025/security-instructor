# SI responsive and cross-device QA plan — AVS-EMRG-2026

The internal preview is available at `frontend/civil-airport-safety-preview.html` on this feature branch. It is not linked from the public course catalogue and does not register learners, save progress, play hosted video, issue certificates, or call the self-study API.

## Viewport coverage
Run responsive checks at minimum at these CSS viewport sizes:
- 320 × 568 — narrow small phone
- 360 × 800 — Android phone baseline
- 375 × 812 — iPhone baseline
- 390 × 844 — modern phone baseline
- 430 × 932 — large phone
- 768 × 1024 — tablet portrait
- 1024 × 768 — tablet landscape / small laptop
- 1280 × 800 — desktop
- 1440 × 900 — wide desktop

## Browser and device coverage
- iOS Safari on a physical iPhone.
- Android Chrome on a physical Android phone.
- Samsung Internet on a physical Samsung Android phone where available.
- iPadOS Safari and Android tablet browser where available.
- Desktop Chrome, Edge, Firefox and Safari where available.

Responsive viewport emulation is useful, but it does not replace tests on physical devices.

## Checks
- [ ] No horizontal page overflow at 320 px width.
- [ ] Header, course status and bilingual headings wrap without clipping.
- [ ] English text remains left-to-right and Arabic remains right-to-left.
- [ ] Screen navigation becomes a single-column list on narrow phones.
- [ ] All interactive controls have at least 44 px target height where possible.
- [ ] Text remains readable at 200% zoom and device text scaling.
- [ ] Keyboard focus is visible; screen navigation and answers work without a mouse.
- [ ] Reduced-motion preference is respected.
- [ ] Video player (once implemented) uses responsive width and aspect ratio; does not force full-screen; supports native playback and captions on iOS/Android.
- [ ] Captions can be enabled and transcripts are available.
- [ ] No autoplay with sound; playback requires user action where browser policy requires it.
- [ ] Network loss, slow connections, missing video URLs and unsupported media produce helpful messages.
- [ ] Forms, validation, email-link return, progress persistence, quiz submission and certificate screens are tested at phone widths.
- [ ] Course progress remains scoped to AVS and never displays or overwrites Fire Safety progress.
- [ ] Full learner flow is repeated on Android and iOS: registration → email link → lesson → video → check → exit/return → final assessment → certificate.
- [ ] No release claim is made based only on GitHub Actions or desktop browser emulation.

## Release decision
The internal preview is a responsive design scaffold. A green visual review alone is not enough to publish the course. Backend isolation, media hosting, real-device checks, and Fire Safety regression checks are required before registration is enabled.
