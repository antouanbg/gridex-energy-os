# Current task

## Public OIDC runtime readiness / Публична OIDC runtime готовност — 2026-09-18

Updated public OIDC defaults to `auth.gridex.tech` and removed the unauthenticated
`/health` preflight that blocked the login button behind the restricted proxy.
`npm run lint`, `npm run build:pages` and 11 Node tests pass; lint retains only
two existing image warnings. No mobile UI/design change. Backend public issuer
is verified, but exact Keycloak callbacks and a real ordinary-user browser test
are now configured and verified. Real ordinary-user browser login and
authorization are still pending; do not claim production login before those
checks.

Обновени са public OIDC defaults към `auth.gridex.tech` и е премахнат
неудостовереният `/health` preflight, който блокираше бутона за вход зад
ограничения proxy. `npm run lint`, `npm run build:pages` и 11 Node теста
минават; lint пази само две стари image предупреждения. Няма mobile UI/design
промяна. Public issuer на backend е проверен и точните Keycloak callbacks са
конфигурирани/проверени, но реалният browser тест с обикновен user и
authorization предстоят; не заявявай production login преди тези проверки.

## Merge review / Преглед за merge — 2026-09-15

PR #15 merged; PR #16 reviewed for merge. Corrected stale SMTP UI copy to
Mailgun in both languages. Lint: 0 errors, 2 existing image warnings; build and
11 tests passed. Public HTTPS/login commissioning remains incomplete; runtime
URLs and mobile CSS unchanged. No claim of working real email invitations.

PR #15 е merged; PR #16 е прегледан за merge. Старият SMTP UI текст е заменен
с Mailgun на двата езика. Lint: 0 грешки, 2 стари image предупреждения; build
и 11 теста минаха. Публичният HTTPS/вход предстои; runtime URLs и mobile CSS
са непроменени. Реални имейл покани не са доказани.

## Access planning checkpoint / План за управление на достъпа — 2026-09-15

Completed this task: coordinated EN/BG ACCESS_MANAGEMENT_PLAN.md and HANDOFF update.
Mailgun REST supersedes SMTP next-actions. 0/8 complete-workflow milestones accepted;
existing implementation remains foundation only. No runtime/UI changes or email sent.
Next: BE-01 Mailgun provider compatibility, private region/domain/sender configuration;
BE-03 admin list contracts and FE-01 screens may proceed without credentials.
Validation: identical plan copies, Markdown diff/secret review; no runtime tests needed.

Готово в тази задача: общ EN/BG ACCESS_MANAGEMENT_PLAN.md и HANDOFF. Mailgun REST
заменя SMTP задачите. 0/8 пълни етапа приети; кодът остава основа. Без runtime/UI
промени или изпратен имейл. Следва BE-01 съвместимост, регион/домейн/подател;
BE-03 договори и FE-01 екрани могат без ключове. Проверки: идентични копия,
Markdown diff и secrets; не са нужни runtime тестове за тази документация.

2026-09-15: invitation forms added to profile and sign-in for authenticated users.
Email, organisation, role, explicit sites, acceptance and immediate cancellation
use GrideX API; 503 disables sending honestly. Display roles use /me membership.
No CSS/mobile navigation or public configuration changed. Lint passed with two
existing image warnings; both builds and 11 tests passed. Typecheck still has
pre-existing gateway/overview/supported/worker errors; no invitation errors.
Next: configure SMTP/enable backend enrollment, real invited-user browser QA.

2026-09-15: форми за покани в профила/входа за автентикирани потребители.
Имейл, организация, роля, обекти, приемане и отмяна през GrideX API; 503 спира
изпращането. Ролите за показване идват от /me. Без промени по CSS/мобилна
навигация/публична конфигурация. Lint мина с две стари image предупреждения;
двата build-а и 11 теста минаха. Typecheck има стари gateway/overview/supported/
worker грешки, без грешки в поканите. Следва SMTP/активиране и реален browser QA.

## Previous checkpoint / Предходно състояние

2026-09-14 checkpoint: local frontend/backend login preparation on
feat/local-backend-login. vite.local.config.ts serves local config only;
frontend HTTP 200 and proxied backend health ready verified. Browser user
login not verified; callback/CORS provisioning and a real user remain pending.
See HANDOFF.md for invitation/RBAC gaps and deferred backend restore.
npm ci reports 25 vulnerabilities (18 high); no force upgrade performed.

2026-09-14: подготовка на local frontend/backend вход във feat/local-backend-login.
vite.local.config.ts подава само локална конфигурация; frontend HTTP 200 и
backend health ready през proxy са проверени. Browser user вход не е проверен;
callbacks/CORS и реален потребител предстоят. Виж HANDOFF.md за invitation/RBAC
пропуски и отложения backend restore. npm ci: 25 уязвимости, 18 high; без force upgrade.

## Historical task / Историческа задача

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
