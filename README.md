# BasisCore Calendar Component

Calendar and date-selection components for BasisCore applications, written in
TypeScript and bundled with webpack.

**Version: 1.0.2.** This is a compatibility-focused patch release, not the UX v2
redesign. Existing option names, the `basic` default theme and legacy integration
contracts are retained. See the [changelog](CHANGELOG.md) and
[compatibility notes](docs/compatibility-fixes.md) for scope and verification limits.

## Components

| BasisCore component | Purpose |
| --- | --- |
| `component.calendar.datepicker` | Single-date, date-range and multiple-date selection. The standard DatePicker example needs no application backend. |
| `component.calendar.calendar` | Calendar with notes, reminders, categories, sharing and service/user views. Requires the hosting application's backend configuration. |

The built-in `basisCalendar` provider uses a bundled date table for Jalali and
Gregorian dates. Use `culture: "fa", lid: 1` for Persian/Jalali or
`culture: "en", lid: 2` for English/Gregorian.

## Local Development

Use Node.js 22 and npm. Browser-test tooling requires Node.js 18 or newer.
Run these commands from the repository root:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 18478 --no-open
```

Open the [interactive presentation](http://localhost:18478/datePicker/compatibility.html).
It mounts the actual BasisCore component and exposes selection modes, existing
options and the active configuration as JSON. Applying settings reloads only the
sample; it does not modify the library or consumer pages.

The development server serves `wwwroot`, local BasisCore assets from
`node_modules/bclib/dist`, and the component bundles. The default port without
CLI overrides is `3001`; use another free port if necessary.

The presentation's comparison link uses ports `18478` and `18479` with the same
query parameters. The old-version server on `18479` is a separately prepared
snapshot, **not** started automatically by `npm run dev`.

## DatePicker Quick Start

The following page works with the local development server. For deployment,
replace the runtime, repository and stylesheet URLs with your hosted asset URLs.
If the application already loads BasisCore, reuse that runtime and extend its
existing repository mapping instead of loading a second runtime.

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DatePicker Example</title>
  <script src="/bclib.js"></script>
  <script>
    const host = {
      repositories: {
        "calendar.calendar": "/basiscore.calendar.component.js",
        "calendar.datepicker": "/basiscore.calendar.component.js"
      }
    };

    var datePickerOptions = {
      dateProvider: "basisCalendar",
      culture: "fa",
      lid: 1,
      theme: "basic",
      mode: "desktop",
      type: "click",
      pickerType: "action",
      rangeDates: false,
      todayButton: true,
      yearsList: true,
      monthList: true,
      switchType: true,
      style: "/css/datepicker-style-1.0.0.css"
    };
  </script>
</head>
<body>
  <basis core="component.calendar.datepicker"
         name="departureDate"
         run="atclient"
         options="datePickerOptions"></basis>
</body>
</html>
```

The component creates a read-only input with the supplied `name`. Read its value
when submitting the surrounding form:

```js
const input = document.querySelector('input[name="departureDate"]');
const selectedValue = input.value;
const selectedDateId = input.getAttribute('data-datepicker-dateid');
```

Do not assume that selection dispatches native `input` or `change` events.
Legacy attribute/source/schema contracts differ by selection mode; keep existing
consumers intact rather than inferring a new payload contract from this example.

The optional `from` and `to` attributes initialize the displayed period; they
are **not** minimum/maximum allowed dates. Supply both as `year/month/day` using
the selected calendar, or omit both to start at today. This slash-based input
format is independent of the output `seperator` option.

`options` is resolved as a JavaScript expression by the existing component.
Define configuration before BasisCore initializes the element and keep that
expression under application control. Do not pass untrusted executable input.
Mutating the options object after mounting is not a documented live-update API.

## Selection Modes

These examples reuse the runtime and repository mapping above. Define each
options variable before its corresponding BasisCore element is initialized.

### Date Range

```html
<script>
  var rangeOptions = {
    ...datePickerOptions,
    pickerType: "range",
    rangeDates: true,
    seperator: "-",
    rangeDatesSeperator: " ~ "
  };
</script>
<basis core="component.calendar.datepicker" name="travelDates"
       run="atclient" options="rangeOptions"></basis>
```

Range selection is enabled by `rangeDates: true` or `pickerType: "range"`.
The first selection is the start and the second is the end. Setting
`rangeDatesSeparated: true` joins the dates with a space; it does not create two
separate inputs and takes precedence over `rangeDatesSeperator`.

### Multiple Dates

```html
<script>
  var multipleOptions = {
    ...datePickerOptions,
    pickerType: "multiple",
    rangeDates: false,
    isModalPicker: true
  };
</script>
<basis core="component.calendar.datepicker" name="calendarSelection"
       run="atclient" options="multipleOptions"></basis>
<label for="selectedDates">Selected dates</label>
<input id="selectedDates" name="selectedDates" data-modal-input-dates readonly>
```

The legacy multiple-selection implementation writes comma-separated dates to
`[data-modal-input-dates]` when `isModalPicker` is enabled. That selector is
document-wide: do not expect multiple output targets to be isolated per picker.
The presentation uses this native contract, not a replacement selection engine.

### English / Gregorian

Use the same DatePicker element with an options variable containing:

```js
var englishOptions = {
  ...datePickerOptions,
  culture: "en",
  lid: 2
};
```

Set the element's `options` attribute to `englishOptions`.

## DatePicker Options

Names below intentionally retain legacy spelling. Do not rename `seperator` or
`rangeDatesSeperator` in existing configurations.

| Option | Default | Behavior |
| --- | --- | --- |
| `dateProvider` | `"basisCalendar"` | Bundled date-table provider. The alternate `persianCalendar` implementation has incomplete methods. |
| `culture` | `"fa"` | Active calendar: `"fa"` or `"en"`. |
| `lid` | `1` | Label language: `1` or `2`; pair it explicitly with the intended culture. |
| `theme` | `"basic"` | Existing theme. UX v2 theme names are not part of this release. |
| `mode` | `"desktop"` | Existing desktop or legacy `"mobile"` rendering path. |
| `type` | `"click"` | Popup input; `"load"` creates the legacy inline control instead of a form input. |
| `pickerType` | `"action"` | Single selection; also accepts `"range"` or `"multiple"`. |
| `rangeDates` | Not set | Enables range selection when `true`. Set explicitly to `false` for the single-date example above. |
| `todayButton` | `false` | Show the Today control. |
| `yearsList` / `monthList` | `false` | Enable the existing year/month selectors. |
| `switchType` | `false` | Show the existing calendar-switch controls. |
| `secondCulture` | Not set | Secondary-calendar data; rendering differs between selection modes. |
| `disabledPrevButton` | `false` | Stop the Previous-month button at the current month; not a date-validation rule. |
| `seperator` | `"/"` fallback | Separator within an output date. |
| `rangeDatesSeperator` | `" - "` fallback | Separator between the two output dates. |
| `rangeDatesSeparated` | `false` | Use a space between range dates. |
| `isModalPicker` | `false` | Enables the legacy multiple-date output target described above. |
| `style` | Legacy relative URL | Stylesheet URL. Supply a valid host-specific URL explicitly. |

`sourceid`, `isFilter` and `action` are legacy integration options, not a generic
selection-event API. `isFilter`/`action` participate in the parent-calendar flow;
do not enable them on a standalone picker expecting a universal change callback.
See [the option types](src/components/Interface/Interface.ts),
[DatePicker integration](src/components/BcComponent/BcDatePickerComponent.ts) and
[selection/source handling](src/components/UiDatePicker/UiDatePicker.ts).

## Full Calendar Integration

The `component.calendar.calendar` export is separate from the DatePicker. It uses
`options`, date attributes, `sourceid`, an optional `rkey`, and the legacy
`ResetSourceId`/trigger mechanism. Configure it against the hosting application's
service contracts before enabling note/reminder/sharing workflows.

`baseUrl` must provide the endpoints consumed by the enabled view and features.
Initialization reads templates and holiday data even when notes are disabled;
note/category, event and sharing workflows require their corresponding endpoints.
The selected `level` (`"user"` or `"service"`) affects which services are used.

Start with the [calendar examples](wwwroot/calendar),
[calendar implementation](src/components/calendar.ts) and
[configuration interfaces](src/components/Interface/Interface.ts).
Treat old sample service URLs, domain IDs and credentials as environment-specific
legacy examples, not deployable production configuration. Supply your own values;
never commit production access keys to examples.

The development mock routes are test/demo helpers, not a production backend.

## Build and Deployment

```sh
npm run typecheck
npm run pub
```

`pub` is the existing **production build command**, not `npm publish`.

| Output | Entry / use |
| --- | --- |
| `dist/basiscore.calendar.component.js` | `src/BcComponentLoader.ts`; BasisCore repository bundle exporting `calendar` and `datepicker`. Use this for the integration above. |
| `dist/basiscore.calendar.js` | `src/loader.ts`; legacy standalone/demo bootstrap, not a generic DatePicker import API. |

Serve the component bundle and the chosen CSS/font assets, then update the
application's repository mapping and `style`/`datepickerStyle` URLs. The documented
integration is browser/BasisCore based, not a Node.js package-import API.
Build artifacts in `dist/` are ignored by Git. Tagging, npm publishing and
deployment are separate maintainer actions.

## Tests

```sh
npx playwright install chromium
npm run typecheck
npm test
npm run pub
```

`npm test` builds the baseline and current code in temporary directories and runs
87 compatibility/regression checks without real-backend requests. It requires
Git history containing baseline commit `35751ce`; a source archive or shallow
clone without that commit is insufficient. Only the baseline's filename casing
is corrected so it can compile on Linux.

With the development server running on `18478`, run these in another terminal:

```sh
npm run test:preview
npm run test:presentation
```

Preview tests use the production component bundle with the actual BasisCore
runtime at desktop and 390px/320px viewports. Presentation tests exercise native
selection modes, option controls and configuration reload. Screenshots and
temporary test artifacts are written outside tracked source files.

For a different preview server, set `CALENDAR_PREVIEW_URL` to its complete page URL.
If downloading Chromium is unavailable, point Playwright at an installed Chrome:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm test
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm run test:preview
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm run test:presentation
```

The executable path is machine-specific; use the equivalent path on your system.

## Compatibility and Known Limits

- `1.0.2` fixes existing DatePicker paths; it does not add UX v2 styling or the
  `calendarType`, `locale`, `allowCalendarSwitch` or Gregorian-only theme APIs.
- `disabledPrevButton` does not reject earlier days in the current month, and
  year/month selectors can jump back. `from`/`to` are not min/max validators.
- Legacy reopening can clear an existing selection. Do not assume persistent
  selection or reinterpret that behavior when upgrading consumers.
- Secondary day numbers honor `secondCulture` in single selection. Range
  selection already renders secondary numbers independently; multiple selection
  does not render them. The presentation limits its toggle accordingly.
- The date table is finite (Jalali `1369-01-01` through `1423-10-01`, Gregorian
  `1990-03-21` through `2044-12-21`); boundary months can be partial. The year list
  preserves Jalali 1369-1420 and uses complete Gregorian years 1991-2041.
- The alternate date provider, legacy mobile wheel defaults and existing schema
  serialization quirks are not repaired or certified by this patch. Responsive
  preview coverage is not a redesign of the `mode: "mobile"` implementation.
- Old examples can reference missing CSS paths or environment-specific services.
  Prefer the interactive presentation as the self-contained DatePicker sample.
- Live backends, every consuming page, physical devices, Firefox and Safari have
  not been certified. Large-bundle warnings from the embedded date table remain.

For detailed verification and migration boundaries, read
[compatibility-fixes.md](docs/compatibility-fixes.md).

## Project Layout

```text
src/components/   DatePicker, calendar, date utilities and BasisCore adapters
src/asset/        Bundled styles and UI assets
wwwroot/          Browser examples, local styles and fonts
server/           Development mock routes
tests/            Compatibility, native-preview and presentation checks
docs/             Compatibility and verification notes
CHANGELOG.md      Release history
webpack.config.js Build entries and local development server
```

## License

The package declares ISC in [package.json](package.json). Third-party packages,
fonts and other assets retain their respective licenses.
