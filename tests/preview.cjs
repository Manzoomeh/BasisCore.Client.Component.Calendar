const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require('playwright');

const url = process.env.CALENDAR_PREVIEW_URL || 'http://localhost:18478/datePicker/compatibility.html';
const origin = new URL(url).origin;
const bundle = fs.readFileSync(path.join(__dirname, '../dist/basiscore.calendar.component.js'));

(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  try {
    for (const width of [1280, 390, 320]) {
      const page = await browser.newPage({viewport: {width, height: 900}});
      const errors = [], failed = [], external = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) failed.push([r.status(), r.url()]); });
      await page.route('**/*', route => {
        const request = new URL(route.request().url());
        if (request.origin !== origin) { external.push(request.href); return route.abort(); }
        if (request.pathname === '/basiscore.calendar.component.js')
          return route.fulfill({contentType: 'application/javascript', body: bundle});
        return route.continue();
      });
      await page.goto(url);
      const input = page.locator('input.date-picker-input');
      const picker = page.locator('#basis-datepicker');
      await picker.waitFor({state: 'visible'});
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => mySetting.theme), 'basic');
      const bounds = await picker.boundingBox();
      assert(bounds.width > 200 && bounds.x >= 0 && bounds.x + bounds.width <= width);
      assert.match(await page.locator('[data-datepicker-yearnumber-select]').innerText(), /^\d{4}$/);
      for (let index = 0; index < 2; index++) {
        await picker.locator('[data-datepicker-chaneType-btn]').first().click();
        assert((await picker.locator('[data-datepicker-yearnumber-select]').innerText()).length === 4);
        const days = picker.locator('[data-datepicker-id]');
        assert(await days.count() >= 28);
      }
      await picker.locator('[data-datepicker-today-btn]').click();
      const days = picker.locator('[data-datepicker-id]');
      await days.nth(2).click();
      await days.nth(7).click();
      assert((await input.inputValue()).includes(' - '));
      await input.click();
      assert.equal(await input.inputValue(), '', 'legacy clear-on-reopen remains unchanged');
      await days.nth(4).click();
      assert.equal(await picker.locator('[data-datepicker-end-day]').count(), 0);
      assert.equal(await picker.locator('[data-datepicker-hover]').count(), 0);
      const screenshot = path.join(os.tmpdir(), `basisfly-calendar-${width}.png`);
      await page.screenshot({path: screenshot, fullPage: true});
      assert.deepEqual(errors, []);
      assert.deepEqual(failed, []);
      assert.deepEqual(external, []);
      console.log(`BasisCore native + production bundle: ${width}px passed; ${screenshot}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
