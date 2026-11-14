const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createServer } = require('node:http');
const webpack = require('webpack');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const baselineCommit = '35751ce';
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'basisfly-calendar-test-'));
let browser, server;
let checks = 0;
function check(actual, expected, name) {
  assert.deepEqual(actual, expected, name);
  checks++;
}

async function build(source, name) {
  const entry = path.join(temp, name + '.js');
  fs.writeFileSync(entry, [
    `export { DatePicker } from ${JSON.stringify(path.join(source, 'src/components/DatePicker.ts'))};`,
    `export { default as Component } from ${JSON.stringify(path.join(source, 'src/components/BcComponent/BcDatePickerComponent.ts'))};`
  ].join('\n'));
  const config = require('../webpack.config.js');
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: 'development', devtool: false, context: root, entry,
      output: { path: temp, filename: name + '.bundle.js', library: 'CalendarTest', libraryTarget: 'var' },
      resolve: { extensions: config.resolve.extensions, modules: [path.join(root, 'node_modules')] },
      resolveLoader: { modules: [path.join(root, 'node_modules')] },
      module: { rules: config.module.rules.map(rule => rule.test.test('file.ts')
        ? { test: /\.ts$/, exclude: /\.d\.ts$/, use: { loader: require.resolve('ts-loader'), options: {
          transpileOnly: true, configFile: path.join(root, 'tsconfig.json')
        } } } : rule) }
    });
    compiler.run((error, stats) => compiler.close(() => {
      if (error || stats.hasErrors()) reject(error || new Error(stats.toString({ all: false, errors: true })));
      else resolve();
    }));
  });
}

async function pageFor(name) {
  const page = await browser.newPage();
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/${name}`);
  await page.waitForFunction(() => window.CalendarTest);
  // Freeze the clock, not timers: the shipped date table has a finite date range.
  await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
  return page;
}

async function mount(page, options = {}, parent = false) {
  return page.evaluate(async ({ options, parent }) => {
    document.body.innerHTML = '<form><input id="date" readonly></form>';
    window.errors = [];
    window.onerror = message => { errors.push(message); return true; };
    window.submits = 0;
    document.querySelector('form').onsubmit = event => { event.preventDefault(); submits++; };
    window.sources = [];
    window.$bc = { setSource: (...args) => sources.push(args) };
    const from = options.culture === 'en' ? {year: 2026, month: 8, day: 1} : {year: 1405, month: 5, day: 1};
    window.picker = new CalendarTest.DatePicker({...from}, {...from}, {
      style: '/style.css', ...options
    });
    if (parent) picker.range = { options: {...picker.options}, dateUtil: picker.dateUtil, activeIndex: 3,
      calls: 0, runAsync() { this.calls++; } };
    await picker.createUIAsync(document.querySelector('input'));
    document.querySelector('input').click();
    return JSON.parse(JSON.stringify(picker.options));
  }, { options, parent });
}

async function parity(page, options) {
  const defaults = await mount(page, options);
  return page.evaluate(defaults => {
    const day = index => picker.wrapper.querySelectorAll('[data-datepicker-id]')[index];
    const initialHTML = picker.wrapper.outerHTML;
    day(2).click();
    if (picker.options.rangeDates || picker.options.pickerType === 'range') day(7).click();
    const snapshot = () => ({value: picker.datePickerInput.value,
      attributes: Array.from(picker.datePickerInput.attributes, a => [a.name, a.value]),
      sources: JSON.parse(JSON.stringify(sources)), dates: JSON.parse(JSON.stringify(picker.datesArray)),
      data: picker.data, attached: picker.wrapper.isConnected});
    const selected = snapshot();
    picker.datePickerInput.click();
    return { defaults, initialHTML, selected, reopened: snapshot() };
  }, defaults);
}

async function run() {
  const oldRoot = path.join(temp, 'baseline');
  fs.mkdirSync(oldRoot);
  execFileSync('tar', ['-x', '-C', oldRoot], {
    input: execFileSync('git', ['archive', baselineCommit, 'src'], {cwd: root, maxBuffer: 30 * 1024 * 1024})
  });
  // Build-only correction: upstream imports use Month.ts but Git stored month.ts.
  fs.renameSync(path.join(oldRoot, 'src/components/Month/month.ts'), path.join(oldRoot, 'src/components/Month/Month.ts'));
  await build(oldRoot, 'baseline');
  await build(root, 'current');
  server = createServer((req, res) => {
    const bundle = req.url === '/baseline' ? 'baseline' : 'current';
    if (req.url.endsWith('.bundle.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.end(fs.readFileSync(path.join(temp, req.url === '/baseline.bundle.js' ? 'baseline.bundle.js' : 'current.bundle.js')));
      return;
    }
    res.setHeader('Content-Type', req.url === '/style.css' ? 'text/css' : 'text/html; charset=utf-8');
    res.end(req.url === '/style.css' ? '' : `<html><head><script src="/${bundle}.bundle.js"></script></head><body></body></html>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const oldPage = await pageFor('baseline');
  const page = await pageFor('current');

  for (const culture of ['fa', 'en']) {
    for (const mode of ['single', 'range', 'multiple']) {
      for (const separator of ['/', '-']) {
        const config = {culture, lid: culture === 'fa' ? 1 : 2, theme: 'basic',
          rangeDates: mode === 'range', pickerType: mode === 'multiple' ? 'multiple' : 'action',
          seperator: separator, rangeDatesSeperator: ' ~ ', sourceid: 'db.selected'};
        check(await parity(page, config), await parity(oldPage, config), `unchanged ${culture}/${mode}/${separator}`);
      }
    }
  }
  check(await parity(page, {}), await parity(oldPage, {}), 'zero config defaults and payload');
  for (const culture of ['fa', 'en']) {
    async function mobileContract(target) {
      await mount(target, {culture, lid: culture === 'fa' ? 1 : 2, mode: 'mobile', sourceid: 'db.mobile'});
      return target.evaluate(() => {
        const html = picker.wrapper.outerHTML;
        picker.wrapper.querySelector('[data-bc-datepicker-mobile-submit]').click();
        return {html, sources, errors};
      });
    }
    check(await mobileContract(page), await mobileContract(oldPage), `legacy mobile markup and callback ${culture}`);
  }

  for (const culture of ['fa', 'en']) {
    await mount(page, {culture, lid: culture === 'fa' ? 1 : 2, todayButton: true, disabledPrevButton: true});
    check(await page.evaluate(() => {
      picker.wrapper.querySelector('[data-datepicker-today-btn]').click();
      const today = picker.dateUtil.getCurrentDate(picker.options.culture);
      return [Number(picker.months[0].value.year) === Number(today.year), Number(picker.months[0].value.month) === Number(today.month)];
    }), [true, true], `today uses active ${culture} calendar`);
    check(await page.evaluate(() => {
      const before = JSON.stringify(picker.months[0].value);
      picker.wrapper.querySelector('[data-datepicker-prev]').click();
      const blocked = before === JSON.stringify(picker.months[0].value);
      picker.wrapper.querySelector('[data-datepicker-next]').click();
      picker.wrapper.querySelector('[data-datepicker-prev]').click();
      return {blocked, returned: before === JSON.stringify(picker.months[0].value), errors, submits};
    }), {blocked: true, returned: true, errors: [], submits: 0}, `previous/next controls and form safety ${culture}`);
  }

  for (const control of [0, 1]) {
    await mount(page, {switchType: true, secondCulture: 'en'});
    for (const expected of ['en', 'fa']) {
      check(await page.evaluate(index => {
        picker.wrapper.querySelectorAll('[data-datepicker-chaneType-btn]')[index].click();
        return {culture: picker.options.culture, errors, submits, attached: picker.wrapper.isConnected};
      }, control), {culture: expected, errors: [], submits: 0, attached: true}, `standalone switch ${control} to ${expected}`);
      check(await page.evaluate(() => {
        const month = picker.months[0].value;
        return typeof month.year === 'number' && typeof month.month === 'number';
      }), true, `switch ${control} produces navigable numeric months`);
    }
  }
  await mount(page, {switchType: true}, true);
  check(await page.evaluate(() => {
    picker.wrapper.querySelector('[data-datepicker-chaneType-btn]').click();
    return {culture: picker.range.options.culture, lid: picker.range.options.lid, calls: picker.range.calls,
      index: picker.range.activeIndex, owner: picker.range.months[0].range === picker.range, errors};
  }), {culture: 'en', lid: 2, calls: 1, index: 0, owner: true, errors: []}, 'parent calendar refreshed once');

  for (const culture of ['fa', 'en']) {
    await mount(page, {culture, lid: culture === 'fa' ? 1 : 2, yearsList: true});
    await page.locator('[data-datepicker-yearnumber-select]').focus();
    await page.keyboard.press('Enter');
    const years = await page.evaluate(() => {
      return Array.from(picker.wrapper.querySelectorAll('[year-number]'), node => Number(node.getAttribute('year-number')));
    });
    check([years[0], years.at(-1)], culture === 'fa' ? [1369, 1420] : [1991, 2041], `year bounds ${culture}`);
    for (const year of [years[0], years.at(-1)]) {
      for (let month = 1; month <= 12; month++) {
        check(await page.evaluate(({year, month}) => {
          const date = {year, month, day: 1};
          return picker.dateUtil.getDaysNumber(date, picker.options.culture) >= 28 &&
            !!picker.dateUtil.getBasisDayId(date);
        }, {year, month}), true, `complete ${culture} month ${year}/${month}`);
      }
    }
    await page.locator(`[year-number="${years.at(-1)}"]`).click();
    check(await page.evaluate(() => Number(picker.months[0].value.year)), years.at(-1), `select ${culture} year`);
  }

  await mount(page, {rangeDates: true, type: 'load'});
  check(await page.evaluate(() => {
    const day = index => picker.wrapper.querySelectorAll('[data-datepicker-id]')[index];
    day(2).click(); day(7).click(); day(4).click();
    return {ends: picker.wrapper.querySelectorAll('[data-datepicker-end-day]').length,
      hover: picker.wrapper.querySelectorAll('[data-datepicker-hover]').length,
      oldEnd: picker.datePickerInput.hasAttribute('data-datepicker-to-dateid'), starts: picker.wrapper.querySelectorAll('[data-datepicker-start-day]').length};
  }), {ends: 0, hover: 0, oldEnd: false, starts: 1}, 'fresh range removes previous end and highlights');
  check(await page.evaluate(async () => {
    const first = picker;
    const title = first.wrapper.querySelector('[data-datepicker-month-main]').textContent;
    const secondInput = document.createElement('input'); document.body.append(secondInput);
    const date = {year: 1405, month: 7, day: 1};
    const second = new CalendarTest.DatePicker({...date}, {...date}, {type: 'load', rangeDates: true, style: '/style.css'});
    await second.createUIAsync(secondInput);
    second.wrapper.querySelector('[data-datepicker-id]').click();
    return first.wrapper.querySelector('[data-datepicker-month-main]').textContent === title;
  }), true, 'range title only changes its own picker');

  async function componentContract(target) {
    return target.evaluate(async () => {
      document.body.innerHTML = '<div id="component"></div>';
      window.options = {culture: 'fa', rangeDates: false, style: '/style.css'};
      const attrs = {name: 'date', options: 'window.options', from: '1405/8/1', to: '1405/8/1'};
      const component = new CalendarTest.Component({getAttributeValueAsync: async key => attrs[key],
        addTrigger() {}, setContent: content => document.querySelector('#component').append(content)});
      await component.initializeAsync();
      const values = [{id: 42, value: {sstring: '1405/8/3', mstring: '2026/10/25'}}];
      component.setValues(values);
      const result = [component.getValuesForValidate(), component.getAddedValuesAsync(), component.getEditedValuesAsync(values), component.getDeletedValuesAsync(values)];
      document.querySelector('input').value = '';
      result.push(component.getDeletedValuesAsync(values));
      return result;
    });
  }
  check(await componentContract(page), await componentContract(oldPage), 'BasisCore schema API remains unchanged');

  // Prove the fixtures exercise bugs in the baseline, rather than passing both versions.
  await mount(oldPage, {switchType: true});
  check(await oldPage.evaluate(() => {
    picker.wrapper.querySelector('[data-datepicker-chaneType-btn]').click(); return errors.length > 0;
  }), true, 'baseline standalone header fails');
  await mount(oldPage, {culture: 'en', lid: 2, todayButton: true});
  check(await oldPage.evaluate(() => { picker.goToday(); return Number(picker.months[0].value.year) === 2026; }), false, 'baseline Gregorian today is wrong');
  await mount(oldPage, {rangeDates: true, type: 'load'});
  check(await oldPage.evaluate(() => {
    const days = picker.wrapper.querySelectorAll('[data-datepicker-id]');
    days[2].click(); days[7].click(); days[4].click();
    return !!picker.wrapper.querySelector('[data-datepicker-end-day]');
  }), true, 'baseline retains stale range end');
  await mount(oldPage, {culture: 'en', lid: 2, yearsList: true});
  check(await oldPage.evaluate(() => {
    const trigger = picker.wrapper.querySelector('[data-datepicker-yearnumber-select]');
    const empty = trigger.textContent === '';
    trigger.click();
    return {empty, first: picker.wrapper.querySelector('[year-number]').getAttribute('year-number')};
  }), {empty: true, first: '1369'}, 'baseline year control is empty and lists Jalali years in Gregorian mode');
  console.log(`${checks} compatibility/regression checks passed; baseline ${baselineCommit}; Chromium; all network local.`);
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  fs.rmSync(temp, {recursive: true, force: true});
});
