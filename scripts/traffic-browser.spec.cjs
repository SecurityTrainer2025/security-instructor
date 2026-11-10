// Browser-level checks for isolated SI Traffic review pages.
// No production URLs, accounts, enrollment APIs, certificates or live trainee data.
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.join(__dirname, '..', 'review');
const pageUrl = filename => pathToFileURL(path.join(root, filename)).href;
const viewports = [
  { name: 'desktop', width: 1366, height: 850 },
  { name: 'mobile', width: 390, height: 844 }
];

async function answerQuiz(page, correct) {
  for (let q = 0; q < 5; q++) {
    const value = q < correct ? '0' : '1';
    await page.locator(`#quiz input[name="q${q}"][value="${value}"]`).check();
  }
}
for (const size of viewports) {
  test.describe(size.name, () => {
    test.use({viewport:{width:size.width,height:size.height}});
    test('seven-lesson pilot: incomplete, fail, pass, progress, finish', async ({ page }) => {
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pageUrl('traffic-interactive-pilot.html'));
      await expect(page.locator('#counter')).toContainText('الدرس 1 من 7');
      await expect(page.locator('#quiz fieldset')).toHaveCount(5);
      await page.locator('#check').click();
      await expect(page.locator('#status')).toContainText('جميع الأسئلة');
      await answerQuiz(page,3);
      await page.locator('#check').click();
      await expect(page.locator('#status')).toContainText('60%');
      await expect(page.locator('#next')).toBeHidden();
      await answerQuiz(page,4);
      await page.locator('#check').click();
      await expect(page.locator('#status')).toContainText('80%');
      await expect(page.locator('#next')).toBeVisible();
      for(let i=2;i<=7;i++){
        await page.locator('#next').click();
        await expect(page.locator('#counter')).toContainText(`الدرس ${i} من 7`);
        await expect(page.locator('#quiz fieldset')).toHaveCount(5);
        await answerQuiz(page,5);
        await page.locator('#check').click();
        await expect(page.locator('#status')).toContainText('100%');
      }
      await page.locator('#next').click();
      await expect(page.locator('#status')).toContainText('أكملت النموذج');
      expect(errors).toEqual([]);
    });
    for(let i=1;i<=5;i++){
      test(`module ${i}: scenario decision, 60% fail, retry and 80% pass`, async ({page}) => {
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(pageUrl(`traffic-module-0${i}-enhanced.html`));
        await expect(page.locator('#learning')).toBeVisible();
        await expect(page.locator('#toQuiz')).toBeDisabled();
        await page.locator('#toActivity').click();
        await expect(page.locator('#activity')).toBeVisible();
        const answerIndex=await page.evaluate(()=>options.findIndex(o=>o.right===true));
        expect(answerIndex).toBeGreaterThanOrEqual(0);
        await page.locator('#decisions .choice').nth(answerIndex).click();
        await expect(page.locator('#toQuiz')).toBeEnabled();
        await page.locator('#toQuiz').click();
        await expect(page.locator('#quiz fieldset')).toHaveCount(5);
        await page.locator('#grade').click();
        await expect(page.locator('#score')).toContainText('Please answer all questions first');
        await answerQuiz(page,3);
        await page.locator('#grade').click();
        await expect(page.locator('#score')).toContainText('60%');
        await expect(page.locator('#retry')).toBeVisible();
        await page.locator('#retry').click();
        await answerQuiz(page,4);
        await page.locator('#grade').click();
        await expect(page.locator('#score')).toContainText('80%');
        await expect(page.locator('#finish')).toBeVisible();
        await page.locator('#finish').click();
        await expect(page.locator('#complete')).toBeVisible();
        expect(errors).toEqual([]);
      });
    }
  });
}
