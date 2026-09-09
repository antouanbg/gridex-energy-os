# Current task

Merge and publish the `fix/i18n-mobile` frontend improvements.

## Completed

- Replaced the DOM translation observer and phrase list with keyed shell messages.
- Added EUR formatting helper and converted demo finance displays.
- Added final mobile flow and overflow guards; checked core phone layouts at
  360, 390 and 430 px without horizontal overflow.
- Recorded the site-router WireGuard architecture in `AGENTS.md`.

## Remaining

- Complete remaining component-level translation keys and Playwright coverage.
- Add full 19-section Playwright coverage and split portal sections into lazy
  modules in a separate follow-up.

## Modified files

- `app/i18n/messages.ts`
- `app/lib/currency.ts`
- `app/page.tsx`
- `app/globals.css`
- `tests/rendered-html.test.mjs`
- `AGENTS.md`
- GitHub contribution and review workflow files (from `main`).

## Tests

- `npm run lint` — passes with two existing image optimisation warnings.
- `npm test` — passes (9 tests).
- Browser inspection of primary mobile sections at 360/390/430 px — no
  document-level horizontal overflow observed.
- `npm run build:pages` — passes; `/` and `/en/` entries emitted and `og.jpg`
  is 176 KB.

## Known issues

- The current test suite retains server-render checks; a full 19-section
  Playwright suite remains to be added.
- The large portal page is still one client module, so code splitting requires
  component extraction rather than a configuration-only change.

## Next action

Resolve the pull request merge, then monitor GitHub Pages deployment.

## Last updated

2026-09-10
