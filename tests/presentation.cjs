const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const url = new URL(process.env.CALENDAR_PREVIEW_URL || 'http://localhost:18478/datePicker/compatibility.html');

(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 1000}});
    const errors = [], failed = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === url.origin) return route.continue();
      external.push(route.request().url()); return route.abort();
    });
    await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
    const picker = page.locator('#basis-datepicker');
    const input = page.locator('input.date-picker-input');
    const days = picker.locator('[data-datepicker-id]');
    async function load(search) {
      const target = new URL(url); target.search = search;
      await page.goto(target.href);
      await picker.waitFor({state: 'visible'});
      assert.equal(await picker.count(), 1);
      assert.deepEqual(await page.evaluate(() => mySetting), JSON.parse(await page.locator('#active-config').textContent()));
      const compare = new URL(await page.locator('#compare-link').getAttribute('href'));
      assert.equal(compare.search, target.search);
      assert.equal(compare.port, url.port === '18479' ? '18478' : '18479');
    }
    await load('selection=single&culture=fa&restriction=1&today=1');
    assert.equal(await page.evaluate(() => mySetting.disabledPrevButton), true);
    assert.equal(await picker.locator('[data-datepicker-second-culture-day]').evaluateAll(nodes => nodes.every(node => node.textContent === '')), true);
    await picker.locator('[data-datepicker-today-btn]').click();
    const heading = await picker.locator('[data-datepicker-month-main]').textContent();
    await picker.locator('[data-datepicker-prev]').click();
    assert.equal(await picker.locator('[data-datepicker-month-main]').textContent(), heading);
    // This legacy flag guards the Previous button, not past days in this month.
    await days.first().click();
    assert.notEqual(await input.inputValue(), '');

    await load('selection=single&culture=en&separator=.&second=1');
    assert.equal(await page.evaluate(() => mySetting.secondCulture), 'fa');
    assert.match(await days.nth(2).locator('[data-datepicker-second-culture-day]').textContent(), /^\d{1,2}$/);
    assert.equal(await picker.locator('[data-datepicker-today-btn]').count(), 0);
    assert.equal(await picker.locator('[data-datepicker-chaneType-btn]').count(), 0);
    assert.equal(await picker.locator('[data-datepicker-yearnumber-select]').count(), 0);
    await days.nth(2).click();
    assert.match(await input.inputValue(), /^2026\.11\.3$/);

    await load('selection=range&culture=fa&separator=-&rangeSeparator=tilde');
    assert.equal(await page.locator('input[name="second"]').isDisabled(), true);
    assert.match(await days.nth(2).locator('[data-datepicker-second-culture-day]').textContent(), /^\d{1,2}$/);
    await days.nth(2).click(); await days.nth(7).click();
    assert.match(await input.inputValue(), /^1405-8-3 ~ 1405-8-8$/);
    await load('selection=range&culture=fa&rangeSeparator=space');
    await days.nth(2).click(); await days.nth(7).click();
    assert.equal(await input.inputValue(), '1405/8/3 1405/8/8');

    await load('selection=multiple&culture=fa&separator=-');
    assert.equal(await page.evaluate(() => mySetting.isModalPicker), true);
    assert.equal(await picker.locator('[data-datepicker-second-culture-day]').count(), 0);
    assert.equal(await page.locator('input[name="second"]').isDisabled(), true);
    assert.equal(await page.locator('#rangeSeparator').isDisabled(), true);
    await days.nth(2).click(); await days.nth(7).click();
    assert.equal(await page.locator('[data-modal-input-dates]').inputValue(), '1405-8-3,1405-8-8');
    await days.nth(2).click();
    assert.equal(await page.locator('[data-modal-input-dates]').inputValue(), '1405-8-8');

    await page.locator('input[name="selection"][value="range"] + span').click();
    await page.locator('#culture').selectOption('en');
    await page.locator('input[name="restriction"]').check();
    await page.locator('input[name="year"]').check();
    await Promise.all([page.waitForNavigation(), page.getByRole('button', {name: 'اعمال تنظیمات'}).click()]);
    await picker.waitFor({state: 'visible'});
    assert.deepEqual(await page.evaluate(() => [mySetting.culture, mySetting.rangeDates, mySetting.disabledPrevButton, mySetting.yearsList]), ['en', true, true, true]);
    assert.equal(await picker.count(), 1);
    assert.equal(await page.locator('.multiple-output').isVisible(), false);
    assert.equal(await page.locator('#rangeSeparator').isDisabled(), false);
    await page.setViewportSize({width: 320, height: 900});
    await load('selection=single&culture=fa');
    assert.equal(await page.locator('#settings').getAttribute('open'), null);
    await page.locator('#settings > summary').click();
    await page.locator('input[name="selection"][value="range"] + span').click();
    await Promise.all([page.waitForNavigation(), page.getByRole('button', {name: 'اعمال تنظیمات'}).click()]);
    await picker.waitFor({state: 'visible'});
    assert.equal(await page.evaluate(() => mySetting.rangeDates), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    assert.deepEqual(external, []);
    console.log(`Presentation controls and native single/range/multiple selections passed: ${url.origin}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
