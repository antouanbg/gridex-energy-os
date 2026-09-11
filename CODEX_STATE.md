# Current task

Remove Bulgarian labels that remained in the English portal locale, without
changing the mobile layout or runtime backend communication.

## Completed

- Replaced the DOM translation observer and phrase list with keyed shell messages.
- Added EUR formatting helper and converted demo finance displays.
- Added final mobile flow and overflow guards; checked core phone layouts at
  360, 390 and 430 px without horizontal overflow.
- Recorded the site-router WireGuard architecture in `AGENTS.md`.
- Reduced `app/page.tsx` to the portal shell and moved all 19 feature screens
  into independently loaded section modules plus shared UI/data modules.
- Added Playwright coverage for all 19 sections at 360, 390 and 430 px.
- Added heading/language, interactive range and browser-error checks.
- Added a Pull Request quality workflow for lint, build and browser tests.
- Corrected the Edge gateway screen so it no longer claims direct node MQTT;
  it now shows ROCK Pi polling over OT Modbus TCP and publishing private MQTT.
- Added durable project-creator attribution in `README.md` and `CREDITS.md`.
- Added a repository-identity requirement for any future `HANDOFF.md`.
- Strengthened `AGENTS.md` so corresponding English and Bulgarian texts must
  remain semantically synchronized in the same commit.
- Converted shared role, period and tariff controls to language-neutral IDs
  with locale-specific labels.
- Added locale support to Customers, Sites, Schedule and Settlement.
- Converted alarm severity/filter and connector-state values to neutral IDs;
  visible demo tables and incident details now follow the selected language.

## Remaining

- Review and publish the current English-locale correction.
- Continue the full migration from two-argument helpers to keyed messages as
  a separate follow-up.

## Modified files

- `app/i18n/messages.ts`
- `app/lib/currency.ts`
- `app/page.tsx`
- `app/globals.css`
- `tests/rendered-html.test.mjs`
- `AGENTS.md`
- GitHub contribution and review workflow files (from `main`).
- `README.md`
- `docs/architecture/DOCKER_CLOUD_TOPOLOGY.md`
- `github-pages/en/index.html`
- `public/og.jpg`
- `app/sections/*.tsx`
- `app/sections/data.ts`
- `app/sections/types.ts`
- `app/sections/gateway.tsx`
- `tests/e2e/portal-sections.spec.ts`
- `playwright.config.ts`
- `.github/workflows/frontend-quality.yml`
- `package.json`
- `package-lock.json`
- `.gitignore`
- `app/sections/customers.tsx`
- `app/sections/sites.tsx`
- `app/sections/schedule.tsx`
- `app/sections/settlement.tsx`
- `app/sections/alarms.tsx`
- `app/sections/devices.tsx`

## Tests

- `npm run lint` — passes with two existing image optimisation warnings.
- `npm test` — passes (9 tests).
- Browser inspection of primary mobile sections at 360/390/430 px — no
  document-level horizontal overflow observed.
- `npm run build:pages` — passes; `/` and `/en/` entries emitted and `og.jpg`
  is 176 KB.
- `npm test` — passes (10 tests).
- `npm run test:e2e` — passes (5 Playwright tests); all 19 sections pass at
  360, 390 and 430 px without page-level horizontal overflow.
- Static build emits a separate lazy chunk for each of the 19 portal sections,
  plus small shared UI/data chunks.
- `npm run lint` — passes with the same two existing image optimisation warnings.
- `npm run build:pages` — passes after the English-locale corrections.
- `npm run test:e2e` cannot run locally because the Playwright executable is
  not installed in this checkout (`playwright: command not found`).

## Known issues

- Existing image-element lint warnings remain in the Suntech About section;
  there are no lint errors.
- `npm install` reports inherited dependency audit findings; no automatic
  dependency upgrades were made in this task.

## Next action

Commit and publish the English-locale correction; provision the Playwright
browser dependency before the next full browser test run.

## Last updated

2026-09-11
