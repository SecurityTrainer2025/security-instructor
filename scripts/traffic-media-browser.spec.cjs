// Real Chromium playback checks against the *generated* offline review bundle.
// Unlike ffprobe, these ensure the learner browser can load videos and caption tracks.
// Test server is an isolated localhost server; no production platform access.
const { test, expect } = require('@playwright/test');

const base = 'http://127.0.0.1:8765';
const sizes = [
  { name: 'desktop', viewport: { width: 1366, height: 850 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];
const clips = [
  '00_course_introduction_narrated.mp4',
  '01_gate_access_narrated.mp4',
  '02_pedestrian_separation_narrated.mp4',
  '03_parking_operations_narrated.mp4',
  '04_incident_response_narrated.mp4',
  '05_hand_signals_narrated.mp4',
  '06_risk_position_narrated.mp4'
];
const modules = [
  ['module-01.html', '01_foundations_extended_narrated.mp4', '01_foundations_extended_en.vtt'],
  ['module-02.html', '02_gate_access_extended_narrated.mp4', '02_gate_access_extended_en.vtt'],
  ['module-03.html', '03_pedestrian_safety_extended_narrated.mp4', '03_pedestrian_safety_extended_en.vtt'],
  ['module-04.html', '04_parking_emergency_extended_narrated.mp4', '04_parking_emergency_extended_en.vtt'],
  ['module-05.html', '05_hand_signals_extended_narrated.mp4', '05_hand_signals_extended_en.vtt']
];

async function videoMetadata(page, selector) {
  const result = await page.locator(selector).evaluate(async video => {
    video.preload = 'metadata';
    video.load();
    if (video.readyState < 1 && !video.error) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { cleanup(); reject(new Error('Media metadata timeout')); }, 20000);
        function cleanup() { clearTimeout(timer); video.removeEventListener('loadedmetadata', good); video.removeEventListener('error', bad); }
        function good() { cleanup(); resolve(); }
        function bad() { cleanup(); reject(new Error('Media element error: '+(video.error && video.error.code))); }
        video.addEventListener('loadedmetadata', good);
        video.addEventListener('error', bad);
      });
    }
    return {
      error: video.error ? video.error.code : null,
      duration: video.duration, width: video.videoWidth, height: video.videoHeight,
      source: new URL(video.currentSrc).pathname.split('/').pop()
    };
  });
  expect(result.error).toBeNull();
  expect(Number.isFinite(result.duration)).toBeTruthy();
  expect(result.duration).toBeGreaterThan(2);
  expect(result.width).toBeGreaterThanOrEqual(640);
  expect(result.height).toBeGreaterThanOrEqual(360);
  return result;
}

for (const device of sizes) {
  test.describe(device.name, () => {
    test.use({ viewport: device.viewport });
    test('all seven introductory video elements decode metadata in Chromium', async ({page}) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base+'/index.html');
      await expect(page.locator('article video')).toHaveCount(clips.length);
      for(let i=0;i<clips.length;i++){
        const result=await videoMetadata(page,'article video:nth-of-type(1)'.replace('article video:nth-of-type(1)',`article:nth-of-type(${i+1}) video`));
        expect(result.source).toBe(clips[i]);
      }
      expect(errors).toEqual([]);
    });

    for (const [filename, videoFilename, captionFilename] of modules) {
      test(filename+': video metadata and captions playable/loaded', async ({ page }) => {
        const errors=[];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(base+'/'+filename);
        const metadata = await videoMetadata(page, '#video');
        expect(metadata.source).toBe(videoFilename);
        const caption = await page.locator('#video track').evaluate(async track => {
          const video=track.parentElement;
          track.track.mode='hidden';
          if(track.readyState!==2 && track.readyState!==3){
            await new Promise(resolve => {
              const timer=setTimeout(resolve,10000);
              track.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});
              track.addEventListener('error',()=>{clearTimeout(timer);resolve();},{once:true});
            });
          }
          return {
            name:new URL(track.src).pathname.split('/').pop(),
            readyState:track.readyState,
            cueCount:track.track.cues?track.track.cues.length:0,
            duration:video.duration
          };
        });
        expect(caption.name).toBe(captionFilename);
        expect(caption.readyState).toBe(2); // LOADED
        expect(caption.cueCount).toBeGreaterThan(0);
        expect(errors).toEqual([]);
      });
    }
  });
}
