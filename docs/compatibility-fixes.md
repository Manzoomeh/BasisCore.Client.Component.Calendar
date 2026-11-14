# Backward-compatible DatePicker fixes

Baseline: `35751ce` on `main`. Candidate branch: `basisfly/calendar-compatible-fixes`.
The UX v2 download was used as a reference, not copied over the legacy implementation.

## Contract

Existing pages need only the rebuilt component file. No new option, theme name,
markup, stylesheet, callback, source ID, or per-page migration is required.
`theme: "basic"` remains the default. The existing `switchType`, `yearsList`,
`todayButton`, `culture`, `lid`, separators, selection modes and schema API remain.
Existing attribute selectors and the single/range clear-on-reopen behavior remain.
No production dependency or date-table change is included.

## Fixes

- Today and the previous-month guard use the active calendar, including Gregorian.
- Months obtained from the table are converted to numbers at the Today/switch
  boundary, avoiding string concatenation during subsequent navigation.
- The existing header switch works without a parent `DateRange`; attached pickers
  still refresh their parent once. Both original switch controls remain.
- Switch and Today buttons cannot accidentally submit the enclosing form.
- The previous button is found inside the picker rather than by fragile siblings.
- With `yearsList: true`, the existing year selector now has visible text and
  keyboard activation. The Jalali list remains 1369–1420. The built-in provider's
  Gregorian list uses complete years 1991–2041, avoiding the partial 1990 table.
- Starting a new range clears the previous endpoints and visual decorations;
  only that picker's month title is changed when multiple pickers coexist.
- `Month.ts` casing matches all existing imports on case-sensitive filesystems.

The existing mock server now listens on 8000 only when run directly. Importing
the webpack configuration no longer opens an unrelated port during build/dev.

## Deliberately excluded

UX v2 styling, new calendarType/locale/allowCalendarSwitch options, Gregorian-only
theme, new keyboard date grid, and selection persistence on reopening were not
ported: they would change existing configurations or default interaction.
The alternative `persianCalendar` provider's incomplete methods, legacy mobile
wheel defaults, existing schema serialization quirks, and the finite date-table
coverage are not fixed or certified by this patch. Keeping a baseline behavior
in a parity test is not a claim that the behavior is correct.

## Verification

Use Node 22 (Node 18+ is required by the browser test dependency).

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm run pub
npm run dev -- --host 127.0.0.1 --port 18478 --no-open
```

`pub` is the existing production build command; it does not publish to npm.
Preview: `http://localhost:18478/datePicker/compatibility.html`.

The presentation page exposes existing single/range/multiple selection,
Persian/Gregorian culture, Today, year/month selectors, calendar switching,
secondary calendar numbers and separators. Applying the settings reloads only
the sample with validated query parameters; it does not alter the component or
existing consuming pages. The active configuration can be inspected as JSON.
Multiple selection uses the existing `isModalPicker`/`data-modal-input-dates`
output contract, not a simulated selection implementation.

The `secondCulture` toggle is exposed only for secondary day numbers in single
selection. Range selection already renders secondary day numbers regardless of
that option, and multiple selection does not render them. The demo disables this
toggle outside single selection rather than implying general visibility control.

**Important:** `disabledPrevButton` restricts the Previous-month button at the
current month. It is not a minimum-date validation rule: earlier days in the
current month can still be selected, and a year/month selector can jump back.
The sample labels it as a Previous-button restriction, not a ban on past dates.
No new past-date validation or redefinition of this legacy option is included.

In another terminal, while the preview server is running:

```sh
npm run test:preview
npm run test:presentation
```

When the browser download is unavailable, use an installed Chrome executable:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm test
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm run test:preview
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/google/chrome/chrome npm run test:presentation
```

The compatibility test builds baseline and current code in a temporary directory;
only the baseline's filename casing is corrected so it can compile on Linux.
It compares defaults, Persian/English single/range/multiple selections, separators,
source calls, input attributes, reopening, native mobile wheel markup/callbacks,
and schema methods. Separate assertions reproduce old bugs and check the fixes.
All browser requests are restricted to the local test server. Temporary bundles
are removed in `finally`; no baseline or tracked output is overwritten.

The preview test mounts through the actual local BasisCore runtime and supplies
the production component bundle, with legacy options, at desktop/390px/320px.
It checks switching, selection, reopening, bounds and browser/network errors.
Screenshots are written to the OS temporary directory.

Local validation on 2026-11-14: type checking and the production build passed;
87 comparison/regression checks passed against `35751ce`. Native BasisCore plus
the production bundle passed at 1280px, 390px and 320px with no page errors,
failed responses or external requests. Installed Google Chrome was used because
the Playwright browser download returned a location-restriction HTTP 403.
Webpack's existing large-bundle warnings remain (the embedded date table was
not changed). Original CRLF source endings are retained; use
`git -c core.whitespace=cr-at-eol diff --check` for the whitespace check.

Presentation validation also passed against both live ports (18478 and 18479),
including native selection modes, separators, actual secondary-number rendering
by mode, Previous-button restriction, GET configuration reload and mobile controls
at 320px. The demo HTML is identical on both ports; the baseline component source
is unchanged. These presentation controls introduce no component implementation
or configuration-contract changes.

Neither these tests nor this document certify every consuming page, custom host
CSS, live backend, physical device, Firefox or Safari. Release tagging, npm
publishing and deployment are separate maintainer actions; the build and test
scripts do not perform them.
