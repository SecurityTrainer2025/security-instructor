// Real-browser QA of the offline human-signal reviewer. No production writes or publishing.
const {test,expect}=require('@playwright/test');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const reviewUrl=pathToFileURL(path.join(root,'review','traffic-real-video-review.html')).href;
const testFixture=path.join(root,'frontend','assets','traffic-videos','00_course_introduction.mp4');
const sizes=[{name:'desktop',width:1366,height:850},{name:'mobile',width:390,height:844}];
for(const size of sizes){
 test.describe('Real video local reviewer '+size.name,()=>{
  test.use({viewport:{width:size.width,height:size.height}});
  test('missing footage is blocked; file and human checklist required; export and reset',async({page})=>{
   const errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   await page.goto(reviewUrl);
   await expect(page.locator('#cards article')).toHaveCount(6);
   await expect(page.locator('#summary')).toContainText('0 / 6');
   const card=page.locator('#cards article').first();
   await expect(card.locator('.status')).toContainText('BLOCKED');
   for(const box of await card.locator('input[type=checkbox]').all())await box.check();
   await expect(page.locator('#summary')).toContainText('0 / 6');
   await card.locator('input[type=file]').setInputFiles(testFixture);
   await expect.poll(()=>card.locator('video').evaluate(v=>v.readyState>=1&&v.videoWidth>=320),{timeout:25000}).toBe(true);
   await expect(page.locator('#summary')).toContainText('1 / 6');
   await expect(card.locator('.status')).toContainText('Ready');
   const downloadPromise=page.waitForEvent('download');
   await page.locator('#export').click();
   const download=await downloadPromise;
   expect(download.suggestedFilename()).toBe('SI_Traffic_Real_Video_Review.json');
   // Completing this local form never means approval or publication.
   await page.locator('#reset').click();
   await expect(page.locator('#summary')).toContainText('0 / 6');
   await expect(card.locator('.status')).toContainText('BLOCKED');
   expect(errors).toEqual([]);
  });
 });
}
