# Changelog

## 1.0.2 - 2026-11-14

Backward-compatible DatePicker fixes, compared with baseline `35751ce` (1.0.1).
This patch does not introduce UX v2 themes or require consuming-page migration.

### Fixed

- Handle the existing calendar switch in standalone pickers without requiring a
  parent calendar; keep parent refresh behavior for attached pickers.
- Use the active calendar for Today and previous-month guards, and normalize
  date-table values before subsequent month navigation.
- Fix the previous-button lookup and prevent Today/switch buttons from
  submitting an enclosing form.
- Restore visible, keyboard-accessible year selection with the existing option.
  Preserve Jalali years 1369-1420; use complete Gregorian years 1991-2041.
- Clear stale range endpoints and visual markers before a new range, and scope
  month-title updates to the owning picker.
- Match `Month.ts` filename casing to imports on case-sensitive filesystems.
- Avoid opening the mock server's standalone port when webpack imports it.

### Added

- A native BasisCore presentation page for existing selection modes and options,
  with inspectable configuration and comparison links.
- Compatibility documentation and 87 baseline/regression checks, plus native
  production-bundle and presentation browser tests for desktop/mobile viewports.
- A development-only Playwright dependency and repeatable verification scripts.

### Compatibility and Verification

- Keep `basic` as the default theme, existing option names and source/schema
  contracts, legacy mobile markup, selectors, and clear-on-reopen behavior.
- No new production dependency or date-table change.
- Type checking, production build, compatibility checks, native previews at
  1280/390/320px and presentation scenarios passed locally with Chrome.
- `disabledPrevButton` remains a Previous-button restriction, not minimum-date
  validation. UX v2, incomplete alternative-provider methods, legacy mobile
  defaults and existing schema quirks are outside this patch.
- Live backends, every consuming page, physical devices, Firefox and Safari
  are not certified. See [compatibility details](docs/compatibility-fixes.md).
