# Frontend login handoff

Repository / GitHub: `antouanbg/gridex-energy-os`

## Routes and session restoration / URL и възстановяване на сесия — 2026-09-20

Owner-approved navigation now uses real links and ordered child sections; Home
is Overview. Site-scoped paths, history and session-only selected Site context;
foreign Site links do not silently select another Site. Top-level Keycloak SSO
restores existing sessions without iframe cookies; only non-secret release and
return-path hints are stored, never tokens. A changed frontend release prompts
fresh login; API restart policy uses signed auth_time and requires fresh login.
Root callback remains unchanged to preserve the existing OIDC allowlist.
Automatic demo fallback is removed (explicit demo config remains for fixtures).
Pages emits static section index files plus a noindex 404 shell for dynamic
private Site URLs: direct deep links render but retain HTTP 404 on GitHub Pages.
Public indexable content needs dedicated static pages; private inventories are
not SEO content. Real Remember Me was disabled with 24h session lifetime.
Backend helper enables it from the single env, bounded to 365 days, with rollback.
Tests: 31 backend, 21 frontend unit/render, 19 browser fixtures; final visual
style parity correction needs rerun. Not deployed/owner-accepted yet. Outstanding:
real account refresh/new tab/logout, restart/release re-login; normal-DNS auth
reachability; optional future hosting rewrite for HTTP 200 dynamic routes.
ROCK temperature and sensor metrics remain a separate unfinished task.

Одобрената навигация използва линкове и групирани подраздели; Начало е Преглед.
Site URL, history и session-only избран Обект; чужд URL не избира мълчаливо друг
Обект. Top-level Keycloak SSO възстановява сесията без iframe cookies; пазим само
release/return-path подсказки, не токени. Нова frontend версия изисква пресен
вход; API restart политиката проверява подписания auth_time. Root callback е
запазен за съществуващия OIDC allowlist. Няма автоматичен демо fallback.
Pages генерира статични index файлове и noindex 404 shell за частните динамични
Site URL: екранът работи, HTTP статусът при директен вход остава 404 на Pages.
Публичното SEO съдържание изисква отделни статични страници, не частен inventory.
Реалното Remember Me е било изключено при 24h сесия. Backend helper го включва
от единния env с максимум 365 дни и rollback. Проверки: 31 backend, 21 frontend
unit/render, 19 browser fixtures; последната style parity поправка чака повторен
тест. Още не е внедрено/прието. Остават реален refresh/нов tab/изход, restart/
release re-login, normal-DNS auth и евентуален hosting rewrite за динамични 200.
Температурата и сензорите на ROCK остават отделна незавършена задача.

## Imported device status correction / Поправка на внесения статус — 2026-09-20

Validation: 21 unit/render tests (including EN/BG null-battery), 6 browser tests,
an additional automatic-poll regression and full GitHub CI pass. Lint has only
two pre-existing image warnings. PR #31 merged as 0dbffca; Pages run 35494308660
is the publication gate. Tests use fixtures; physical DB counter independently
advanced 15437 → 15977. Pages succeeded; public HTML serves main-Bvd6vg18.js
and the new device-information-CX4clWV1.js text was fetched successfully.
Owner browser acceptance and temperature remain pending.

Проверки: 21 unit/render теста (вкл. EN/BG без батерия), 6 browser теста,
допълнителен automatic-poll regression и целият GitHub CI минават. Lint има само
две стари image предупреждения. PR #31 е слят като 0dbffca; Pages run 35494308660
е проверката за публикация. Тестовете са с fixtures; реалният DB брояч отделно
нарасна 15437 → 15977. Pages приключи успешно; публичният HTML зарежда
main-Bvd6vg18.js, новият текст от device-information-CX4clWV1.js е проверен.
Owner browser приемането и температурата предстоят.

The imported-configuration panel hardcoded connectivity as unverified even while
the separate heartbeat panel received live data. It now shares the same polled
status, including empty, stale, denied and unavailable responses. No menu,
layout, authentication or hardware changes. Real database receipt at 06:20 UTC:
ROCK 06:20:47, ESP contact 06:20:53, counter 15437. This proves ingestion at that
instant, not owner-browser acceptance. Pages publication and owner acceptance
must be verified separately. Temperature/sensor metrics remain UNIMPLEMENTED;
next extend ROCK payload, backend storage/API and existing Devices display,
then deploy ROCK and verify actual readings. Never substitute sample values.

Панелът за внесена конфигурация показваше постоянно непотвърдена връзка дори
при живи heartbeat данни в отделния панел. Вече споделя същия обновяван статус,
включително празен/остарял/отказан/недостъпен отговор. Без меню, оформление,
auth или hardware промени. Реална база към 06:20 UTC: ROCK 06:20:47, ESP контакт
06:20:53, брояч 15437. Това доказва получаване тогава, не owner-browser приемане.
Публикация и приемане се проверяват отделно. Температурата/сензорите още НЕ СА
реализирани: следват ROCK payload, backend база/API, текущият Devices екран,
внедряване на ROCK и проверка на реални измервания. Без примерни заместители.

## Approved dual transport plan / Одобрен план за два транспорта — 2026-09-19

Owner approval recorded for per-Site WireGuard-private OR direct MQTT-mTLS.
Canonical execution checklist: backend docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md
on branch docs/per-site-transport. Twelve TODO items cover contract, persistence,
existing broker/worker, ingress, certificate lifecycle, first-boot claim, approved
configuration application, UI, signed firmware, ROCK-initiated ESP OTA, fleet
operations and end-to-end release acceptance. No new menu; no SSH requirement.
This change is documentation only: no listener, runtime env, migration, device
or router changed. Next: versioned transport contract, then persistence/worker.
Heartbeat implementation is merged; physical delivery still needs acceptance.

Записано е одобрение за избор по Обект: WireGuard-private ИЛИ direct MQTT-mTLS.
Каноничният план е backend docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md в branch
docs/per-site-transport. 12 TODO задачи: договор, база, broker/worker, входове,
сертификати, first-boot claim, одобрено прилагане, UI, подписан firmware, ESP OTA
от ROCK, управление на много обекти и end-to-end приемане. Без ново меню и SSH
зависимост. Само документация: без listener/env/миграция/device/router промени.
Следва versioned transport договор, после база/worker. Heartbeat кодът е слят;
физическата доставка още изисква приемане.

## Merge compatibility check / Проверка преди merge — 2026-09-19

Owner approved merging the current PRs. Added fail-closed handling of malformed
heartbeat responses and an explicit heartbeat fixture in the navigation suite.
The previous failing PR run is historical, not evidence of a live login outage.
New local results: 18 browser tests and 3 API-client tests pass; Pages build passes.
These are fixture tests, not physical MQTT receipt or owner-account acceptance.

Собственикът одобри актуалните PR-и. Добавени защитена обработка на невалиден
heartbeat отговор и изричен fixture в навигационния тест. Старият неуспешен PR
run не доказва текущ проблем с live входа. Нови локални резултати: 18 browser
и 3 API теста минават, Pages build минава. Това не е реален MQTT receipt или
приемане с акаунта на собственика.

## Device heartbeat display / Heartbeat в Устройства — 2026-09-19

Devices separately shows last backend-received ROCK message and last successful
ESP contact observed by ROCK, plus ESP counter. Authenticated Site-scoped polling
every 10s, cancelled on unmount/Site change; errors clear live status, no demo.
No navigation/login/CSS changes. API client tests (3) and Pages/Vinext builds pass.
Not published; needs backend device-heartbeats endpoint/migration and real MQTT
delivery first. Actual populated/empty/denied/unavailable browser flow and owner
account acceptance remain pending; API tests are fixtures, not real delivery.

Устройства показва отделно полученото в backend ROCK съобщение, последния
успешен ESP контакт през ROCK и ESP брояча. Удостоверен Site polling през 10s,
отменен при смяна/напускане; при грешка няма live статус или демо заместител.
Без промени по меню/вход/CSS. 3 API теста и Pages/Vinext builds минават.
Не е публикувано; нужни са backend endpoint/миграция и реален MQTT receipt.
Browser populated/empty/denied/unavailable и owner приемане предстоят.
## SRS implementation plan / Проверим план по спецификацията — 2026-09-19

Owner-requested point-by-point comparison is in
[SRS_VERIFIABLE_PLAN.md](docs/integration/SRS_VERIFIABLE_PLAN.md).
All 32 source subsections plus chapter 12 commissioning are mapped: 33 items,
each with evidence, gap and acceptance gate. G0–G7 define dependencies and
DOC-01 follows verified features. No complete SRS requirement is accepted by
this review; existing component work is explicitly retained as partial evidence.
Local source revisions and dirty changes are recorded; remote main/runtime were
not revalidated. Backend activation adapter/migration remain uncommitted WIP,
not deployed proof. Next: G0 reconcile the SRS with approved architecture, then
G1 read-only end-to-end telemetry acceptance before physical control.
Validation: section coverage, EN/BG parity, evidence paths and diff check.
No source document, product UI, backend runtime, device or network changes.

По искане на собственика е добавено сравнение точка по точка в свързания план.
Всички 32 подраздела и commissioning от глава 12: 33 позиции с доказателство,
липса и приемателен тест. G0–G7 описват зависимости, DOC-01 следва проверените
функции. Няма прието изцяло SRS изискване от този преглед; съществуващата работа
е запазена като частично доказателство. Записани са локални ревизии и dirty
промени; remote main/runtime не са проверявани отново. Backend адаптерът и
миграцията за активация остават непубликуван WIP, не доказано внедряване.
Следва G0 съгласуване с архитектурата, после G1 read-only телеметрия от край
до край преди физическо управление. Проверки: покритие, EN/BG, evidence пътища
и diff check. Без промяна на Word документа, UI, runtime, устройства или мрежа.

## DOC-01 — Documentation portal / Портал за документация — 2026-09-19

### Owner-selected structure reference / Избран структурен пример

Reference inspected on 2026-09-19:
https://docs.eniris.com/en/Controller/External%20Signals/DSO/poland
The rendered HTML exposes a nested topic tree, search and language controls,
breadcrumbs, article contents, previous/next pages and a last-updated date.
Use these navigation patterns for the DOCUMENTATION portal, not the product
menu. This is structural inspiration, not permission to copy articles, images,
branding or assume Eniris capabilities/compliance exist in GrideX. Docusaurus
remains our proposed implementation; the reference's underlying engine is not
an architectural requirement.

Proposed GrideX documentation hierarchy (EN / BG):

```text
Start here / Първи стъпки
  Quick start; demo vs live; commissioning checklist / Бърз старт; демо и реални данни; приемателен списък
Portal and accounts / Портал и акаунти
  Invitations and login; organisations and roles; Sites / Покани и вход; организации и роли; Обекти
Controller and devices / Контролер и устройства
  Architecture and safety / Архитектура и безопасност
  Installation → wiring, network, prerequisites / Инсталация → свързване, мрежа, изисквания
  Configuration → discovery/import, roles, draft, approval, acknowledgement, rollback / Конфигурация → откриване/импорт, роли, чернова, одобрение, потвърждение, връщане
  Devices → ROCK Pi, ESP32, supported drivers / Устройства → ROCK Pi, ESP32, поддържани драйвери
  External signals → market prices; DSO → country → operator / Външни сигнали → пазарни цени; DSO → държава → оператор
Telemetry and monitoring / Телеметрия и наблюдение
  Heartbeat; offline; journal and recovery; alarms / Heartbeat; офлайн; журнал и възстановяване; аларми
Energy strategies / Енергийни стратегии
  Day-ahead prices; battery cycle cost; operating limits / Цени ден напред; цена на цикъла; работни ограничения
Integrations and API / Интеграции и API
  Authentication; contracts; MQTT/TLS; WireGuard boundaries / Удостоверяване; договори; MQTT/TLS; граници на WireGuard
Diagnostics and support / Диагностика и поддръжка
  Symptoms; safe checks; test results; support checklist / Симптоми; безопасни проверки; резултати; данни за поддръжка
Releases and reference / Издания и справочници
  Changelog; compatibility matrix; glossary / Промени; матрица за съвместимост; речник
```

Article template: purpose and feature status → supported models/firmware and
required role → prerequisites and safety → data/control path → numbered setup
steps → expected result and verification → failure/timeout behaviour → rollback
→ troubleshooting → authoritative references, owner and last verification date.
Use GrideX-specific diagrams/tables and clearly distinguish warnings from notes.
Every device/driver page records tested model, firmware, protocol, read/write
support and actual acceptance evidence. Unknown compatibility is not support.
Country/DSO branches are future scaffolding: publish technical requirements only
after checking the relevant operator's primary specification and project approval;
do not import the Polish example's claims or activate physical control.

Implementation acceptance: stable /en/ and /bg/ paths; nested sidebar, breadcrumbs,
in-page contents and previous/next links; searchable public pages; accessible
mobile navigation. No product-menu changes. Preserve private-content boundaries
below. Next action: approve platform/repository, then implement this docs skeleton
and the first verified onboarding/device guides. Status remains planned only.

Примерът е прегледан на 2026-09-19 чрез HTML: тематично дърво, търсене, език,
път до страницата, съдържание, предишна/следваща страница и дата на обновяване.
Тези модели са за ДОКУМЕНТАЦИЯТА, не за менюто на продукта. Не копираме статии,
изображения или марка и не приемаме възможностите/съответствието на Eniris за
налични в GrideX. Docusaurus остава предложението; технологията на примера не е
изискване. Двуезичното дърво по-горе е предложената адаптация за GrideX.

Шаблон на статия: цел и статус → модели/firmware и необходима роля → изисквания
и безопасност → път на данни/команди → номерирани стъпки → очакван резултат и
проверка → поведение при отказ/timeout → връщане назад → диагностика → първични
източници, отговорник и дата на проверка. Собствени диаграми/таблици, ясно отделени
предупреждения. За драйвер: тестван модел, firmware, протокол, четене/запис и
доказателства от приемане. Неизвестна съвместимост не означава поддръжка.
Държава/DSO е бъдеща структура: технически изисквания се публикуват след проверка
на първичната спецификация на оператора и проектно одобрение. Не пренасяме
твърденията от полския пример и не активираме управление на оборудване.

Приемане: стабилни /en/ и /bg/ адреси; вложено меню, път до страницата, съдържание
и предишна/следваща; търсене само в публичните страници; достъпна мобилна навигация.
Без промени в продуктовото меню и без нарушаване на частните граници по-долу.
Следва одобряване на платформата/хранилището, после реализация на тази структура
и първите проверени ръководства за начало/устройства. Статус: само планирано.

Status: planned, not implemented. Owner requests a separate documentation site
at `doc.gridex.tech` (explicitly approved public hostname). Recommendation:
**Docusaurus**, an open-source docs-as-code platform, with Markdown/MDX in Git,
reviewed PRs and a separate GitHub Pages deployment. No new backend container,
database or router port is needed for this static public documentation.

Next steps and acceptance criteria:
1. Confirm Docusaurus and a separate documentation repository (proposed name:
   `gridex-docs`); pin a supported release and dependencies when implementing.
2. Write matching EN/BG guides: quick start; demo versus signed-in mode; email
   invitations, registration and recovery; organisations, roles and site access;
   Sites/Devices; ROCK Pi → ESP32 provisioning and draft → approval → device
   acknowledgement; telemetry/offline states; troubleshooting and support.
   Describe only verified behaviour as available; label planned features clearly.
3. Add public architecture/API reference with sanitised examples. Keep internal
   runbooks, real device inventories/addresses, backups and secrets out of public
   source, generated assets and search indexes. Private docs need separate access
   control; hiding navigation or using robots.txt is NOT protection.
4. Implement GrideX styling, responsive reading, language navigation and search
   (evaluate a maintained local search integration). Add release versions when
   stable product releases exist, plus last-reviewed revision and page ownership.
5. Publish separately through CI: build, broken-link checks, secret/content
   review and desktop/mobile reading/search tests. Configure the custom domain,
   DNS and trusted HTTPS only during the approved implementation. Do not change
   the existing product Pages domain or add product menu items without approval.
6. Accept only after external HTTPS access, EN/BG navigation/search, onboarding
   walkthrough and absence of private data are checked. Record deployment SHA,
   evidence, rollback and unfinished chapters in HANDOFF. Future feature PRs
   must update their affected documentation or explicitly track the missing work.

Blocker: platform/repository choice and implementation remain to be approved;
this task only records the proposal. No DNS, deployment or menu changes made.
Sources: https://docusaurus.io/docs/deployment,
https://docusaurus.io/docs/i18n/introduction,
https://docusaurus.io/docs/versioning.

Статус: планирано, не е реализирано. Собственикът иска отделен сайт за
документация на `doc.gridex.tech` (изрично одобрен публичен адрес). Предложение:
**Docusaurus** — open-source документация с Markdown/MDX в Git, преглед през PR
и отделна публикация в GitHub Pages. За статичната публична документация не
трябват нов backend контейнер, база или отворен порт на рутера.

Следващи стъпки и критерии за приемане:
1. Одобряване на Docusaurus и отделно хранилище (предложено име `gridex-docs`);
   фиксиране на поддържана версия и зависимости при реализацията.
2. Еднакви EN/BG ръководства: първи стъпки; демо спрямо реален вход; покани по
   имейл, регистрация и възстановяване; организации, роли и достъп до обекти;
   Обекти/Устройства; провизиране ROCK Pi → ESP32 и чернова → одобрение →
   потвърждение от устройството; телеметрия/офлайн; проблеми и поддръжка.
   Само провереното се описва като налично; бъдещите функции се маркират ясно.
3. Публична архитектура/API справочник с обезличени примери. Вътрешни инструкции,
   реални устройства/адреси, архиви и тайни не попадат в публичния код, генерираните
   файлове или индекса за търсене. Частната документация изисква отделна защита;
   скрито меню или robots.txt НЕ ограничават достъпа.
4. Стил на GrideX, четене на телефон, езиков избор и търсене (оценка на поддържана
   локална интеграция). Версии при стабилни продуктови издания, последна проверена
   ревизия и отговорник за всяка страница.
5. Отделна CI публикация: build, невалидни връзки, проверка за тайни/съдържание и
   тестове на четене/търсене на компютър и телефон. Домейнът, DNS и доверен HTTPS
   се настройват при одобрената реализация. Без промяна на текущия продуктов
   Pages домейн или добавяне на меню в продукта без разрешение.
6. Приемане след външен HTTPS тест, EN/BG навигация/търсене, преминаване на първите
   стъпки и проверка за липса на частни данни. Запис на deployment SHA,
   доказателства, rollback и незавършени глави в HANDOFF. Бъдещите feature PR-и
   обновяват засегнатата документация или изрично записват липсващата работа.

Пречка: изборът на платформа/хранилище и реализацията чакат одобрение; текущата
задача записва предложението. Няма промени по DNS, публикацията или менюто.

## Sidebar controls and anonymous demo / Меню и анонимно демо — 2026-09-19

Owner explicitly removes ALL upper-right controls, including language, login
progress, site selector, bell and mobile account shortcut. Language is below
the sidebar sign-in/profile; mobile exposes both in the expanded Menu. Anonymous
profile button launches PKCE login directly. Site selection remains in Sites
cards, not a global dropdown. Menu titles/tooltips are restored without added
setup labels; setup explanations remain inside the unfinished screens only.
Anonymous visits render demo immediately. Only OIDC callback visits initially
wait for identity; signed-in/API-error paths still never substitute demo data.
Removed blocking optional account-profile request (verified token claims used),
bounded Keycloak initialization and API fetch with backendTimeoutMs. Callback
timeout resets the failed adapter for retry; no password/PKCE/TLS weakening.
Clean public anonymous-browser reproduction worked on previous deployment; the
owner's exact stuck session was not available. Regression tests simulate hung
token exchange and hung API, plus mobile/desktop login, language position,
short labels and absent header controls. Real-owner acceptance remains pending.
No runtime, backend configuration, router or hardware changes.
Validation: 18 Chromium tests and 20 Node tests pass; Pages and Vinext builds
pass, lint has two pre-existing About image warnings and no errors. Anonymous
demo, stalled callback retry and 403/503/hung API paths verified with fixtures.
Local master auth probes pass. Normal-DNS public probes from Mac still fail;
this is not evidence of a completed external owner login.

Собственикът изрично премахва ВСИЧКИ горни десни контроли: език, прогрес на входа,
избор на обект, камбанка и мобилен профил. Езикът е под входа/профила в менюто;
на телефон са в разгънатото „Меню“. Анонимният бутон стартира PKCE вход директно.
Изборът на обект остава в картите в „Обекти“, не в глобален списък. Възстановени
кратки имена/tooltip без добавки; обясненията за настройка са само вътре в раздела.
Анонимният посетител вижда демо веднага; начална проверка има само при OIDC
callback. След вход/API грешка демо заместители няма. Премахната е блокираща
незадължителна заявка за профил (ползват се проверените token claims); init/API
чакането е ограничено с backendTimeoutMs. Timeout освобождава неуспешния adapter
за нов опит, без отслабване на парола/PKCE/TLS. Чист публичен анонимен браузър
работеше и на предходната версия; точната заседнала сесия не е възпроизведена.
Тестове симулират зависнали token/API заявки, вход на телефон/компютър, позиция
на езика, кратки менюта и празна горна лента. Реалното приемане предстои.
Без runtime, backend конфигурационни, рутерни или хардуерни промени.
Проверки: 18 Chromium и 20 Node теста минават; Pages/Vinext build минават,
lint без грешки и с две стари About image предупреждения. Анонимно демо,
повторен вход след зависнал callback и 403/503/зависнал API са fixture тестове.
Local master auth минава; публичните normal-DNS проби от Mac още отказват.
Това не доказва завършен външен вход с реалния акаунт.

## Authenticated data only / Само реални данни след вход — 2026-09-19

Demo is now allowed only for confirmed anonymous visitors. Session checking and
identity/API errors never fall back to sample sites, metrics, alarms or profile
history. Header names resolve from the authorised site list, not the demo default.
Unintegrated menu sections are marked "Setup & data" without changing menu
structure; their screens explain that data provisioning AND backend integration
are prerequisites. Existing Devices/Sites remain available. Missing telemetry
shows a connection/setup explanation, not an instruction to reprovision working
devices. Unknown grid power/balance remains unknown, never a fabricated zero.
No device, database, network or backend changes. Mocked tests cover successful
identity with API 403/503, all authenticated navigation, imported devices,
refresh outage/recovery, null battery and missing metrics in BG/EN. Real-owner
acceptance and heartbeat remain pending. Next: complete missing backend data
contracts and live edge telemetry; do not mark sections ready from demo fixtures.
Prior design PR #25 was deployed at b308b75, Pages run 35458931893 succeeded.
Validation: 16 browser tests and 20 Node tests pass. Both production builds pass;
lint has no errors (two existing About image warnings). Local master auth probes
pass; public normal-DNS reachability from Mac remains separately unverified.

Демо има само за потвърден анонимен посетител. Проверка на сесията и identity/API
грешки не връщат примерни обекти, показатели, аларми или история на профила.
Името в лентата идва от разрешените обекти, не от демо стойността по подразбиране.
Несвързаните раздели са означени „Настройка и данни“, без структурни промени;
екраните уточняват нуждата от провизирани данни И backend интеграция. Обекти и
Устройства остават достъпни. При липсваща телеметрия се обясняват връзката и
настройката, без повторно провизиране на работещи устройства. Неизвестните
мрежови мощност/баланс не се заменят с измислена нула. Без промени в устройства,
база, мрежа или backend. Mock тестове: вход с API 403/503, навигация след вход,
внесени устройства, refresh отказ/възстановяване, липсваща батерия/показатели в
BG/EN. Реално приемане и heartbeat предстоят. Следва: липсващи backend договори
и жива edge телеметрия; демо fixtures не доказват готовност. Предходният дизайн
PR #25 е публикуван при b308b75, успешен Pages run 35458931893.
Проверки: 16 браузърни и 20 Node теста минават; двата production build минават.
Lint без грешки (две стари About image предупреждения). Local master auth пробите
минават; публичният маршрут през normal DNS от Mac остава отделно непотвърден.

## Design publication and four-language suggestion — 2026-09-19

Owner approved publishing PR #25. Includes desktop provisioning cards, removal
of Edge gateway navigation, Devices-only management, header cleanup and direct
sign-in. No new menu items, hardware commands or backend configuration changes.
Implemented optional FR/ES/DE/IT browser-translation guidance before login,
chosen from navigator.languages, not IP. Dismissal and explicit BG/EN choices
are remembered; /en takes precedence. Other browser languages use English.
No translation widget, GeoIP service or automatic text transmission is installed.
This is guidance, NOT four complete translated application catalogues. Native
reviewed FR/ES/DE/IT catalogues remain backlog; authenticated data translation
is not automated. Mobile provisioning redesign remains separately unapproved.
Tests include all four suggestions, dismissal, saved BG preference, /en,
navigation, mocked login/session expiry and imported devices. Real owner-session
acceptance and live device heartbeat remain pending; mocks do not prove these.
Publication evidence is recorded on PR #25 after the deployment workflow.
Validation: 14 Chromium tests and 20 Node tests pass; six translation tests
rerun with screenshots, visually reviewed. Pages and Vinext builds pass. Lint:
zero errors, two existing About image warnings. Local master auth probes pass;
normal-DNS public issuer from Mac still fails (known network-path limitation).

Собственикът одобри публикуването на PR #25: desktop provisioning карти,
премахнат Edge шлюз, управление през Устройства, изчистена лента и директен вход.
Без нови менюта, хардуерни команди или backend настройки. Добавени са инструкции
по желание за браузърен превод на FR/ES/DE/IT преди вход според navigator.languages,
не IP. Отказът и изричният BG/EN избор се пазят; /en има предимство. За други
езици основата е английски. Без външен widget, GeoIP или автоматично изпращане
на текст. Това са предложения/инструкции, НЕ четири пълни превода на приложението.
Прегледаните FR/ES/DE/IT речници остават задача; няма автоматичен превод на
удостоверени данни. Mobile provisioning редизайнът чака отделно одобрение.
Тестовете покриват четирите предложения, отказ, запазен BG, /en, навигация,
симулиран вход/изтичане и внесени устройства. Реално приемане с акаунта и жив
heartbeat остават непотвърдени. Публикацията се документира в PR #25 след workflow.
Проверки: 14 Chromium и 20 Node теста минават; шестте езикови са повторени със
снимки и визуален преглед. Pages/Vinext build минават; lint без грешки, две стари
About image предупреждения. Local master пробите минават; public issuer през
normal DNS от Mac още не се достига (известно ограничение на мрежовия път).

## Language suggestions / Езикови предложения — 2026-09-19

Owner requests translation suggestions for visitors outside Bulgaria, including
French and Spanish. Existing unmerged PR #12 uses browser time zone, NOT GeoIP.
Proposed implementation, not enabled: saved explicit choice first, explicit
language route next, browser navigator.languages next; optional country-only
server GeoIP may suggest a language only when the preferred language is unknown.
Never equate nationality/country with language or override a saved choice.
Keep BG/EN; add reviewed static FR/ES translation catalogues incrementally with
English fallback, including login/invitation/error strings and number/date units.
Suggest once, allow dismissal and remember choice. Use the existing language
control, not a new navigation item. GeoIP provider and privacy/storage policy
must be selected before adding any external IP lookup; no browser GPS required.
Interim option: user-initiated browser translation guidance (Chrome Translate),
not an injected third-party widget and not an automatic external proxy of the
authenticated portal. Do not send customer/device data, credentials, tokens or
private runtime text to translation providers. Machine assistance may translate
public static catalogues offline, with review of technical/safety terminology.
Tests: French/Spanish browsers, BG user abroad, country/language conflict, VPN,
unavailable GeoIP, explicit /en, dismissed suggestion and saved preference;
no session reset or menu changes. This is a proposal/backlog, not delivered FR/ES.

Собственикът иска предложения за превод извън България, включително френски и
испански. Неслетият PR #12 използва часова зона, НЕ GeoIP. Предложение, още
неактивно: запазен изричен избор, после изричен езиков маршрут, после
navigator.languages; опционално GeoIP само за държава може да предложи език,
ако предпочитаният е неизвестен. Държавата не определя езика и не отменя избора.
BG/EN остават; постепенно се добавят прегледани статични FR/ES речници с EN
fallback, включително вход/покани/грешки и формати на числа/дати/единици.
Еднократно предложение с отказ и запомняне. Използва се текущият езиков контрол,
не нов елемент в менюто. GeoIP доставчик и политика за поверителност/съхранение
се избират преди външна IP заявка; без GPS. Временна опция: инструкции за
превод от браузъра по желание (Chrome Translate), без външен widget или
автоматичен proxy на удостоверения портал. Клиентски/device данни, credentials,
tokens и частен runtime текст не се изпращат към преводачи. Машинен превод може
да помага за публични статични речници офлайн, с техническа/безопасностна редакция.
Тестове: FR/ES браузър, българин в чужбина, конфликт държава/език, VPN, отказал
GeoIP, /en, отказано предложение и запазен избор; без рестарт на сесия/промяна
на менюто. Това е предложение/backlog, не внедрен FR/ES превод.

## Menu governance / Правило за менюто — 2026-09-19

AGENTS.md now requires explicit owner permission for any menu structure change
and an explicit owner request for each new menu item, across desktop/mobile and
submenus. Documentation only; EN/BG reviewed and git diff --check passed.

AGENTS.md изисква изрично разрешение за всяка структурна промяна на менюто
и изрично искане от собственика за нов елемент, включително mobile/подменюта.
Само документация; EN/BG са проверени и git diff --check минава.

## Header and direct login / Лента и директен вход — 2026-09-19

Moved live/demo context into Devices with explicit separation from heartbeat.
Open-source links remain in About, now available in authenticated mode too.
Removed global role selection (server authorization unchanged) and unused global
period state: existing section-local time selectors remain, no fictitious filter.
Header and demo notice sign-in now start existing OIDC/PKCE directly; failure
opens the login error/retry screen. No new auth provider or backend changes.
Tests: 20 Node tests; 7 full Chromium tests plus two one-click login viewport
tests (390/1280px) pass. Both builds pass; lint has two existing image warnings.
Local master issuer/admin URL/login form pass; forced-local public discovery 200,
admin 404. Normal-DNS public auth regression probes still fail from Mac; not
external acceptance. Added to PR #25, not published. Full real-owner login,
logout and expiry acceptance remains unverified.

LIVE/DEMO контекстът е в Устройства, отделен от heartbeat. Open-source връзките
остават в За нас, вече достъпен и след вход. Премахнати са общият избор на роля
(backend правата са непроменени) и неизползваният общ период; локалните избори
на период се запазват, без фиктивен филтър. Входът от лентата и демо съобщението
стартира OIDC/PKCE директно; при грешка се показва екранът за повторен опит.
Без нов auth provider или backend промени. Минават 20 Node, 7 пълни Chromium
теста и два теста за еднократен вход на 390/1280px. Двата build-а минават;
lint има две стари image предупреждения. Local master issuer/admin URL/login
форма минават; forced-local public discovery 200, admin 404. Normal-DNS public
auth пробите от Mac още не минават; това не е външно приемане. Към PR #25,
непубликувано. Реален вход/изход/изтекла сесия със собственика остават непроверени.

## Single device entry / Един вход за устройства — 2026-09-19

Owner requested removal of Edge gateway from desktop/mobile navigation.
Devices remains the single entry for existing ROCK Pi/ESP32 inventory and setup.
Removed the unrelated hardcoded sidebar "online 8 sec ago" card as well.
Legacy navigation requests for gateway resolve to Devices. No device records,
API permissions or hardware configuration removed. The old demo module remains
in source but is no longer loaded. Navigation coverage now has 18 sections.
Included in design PR #25; publication pending.
Validation: 20 Node and all 7 Chromium tests pass, including 18-section mobile
navigation at 360/390/430px and imported-pair/session regression. Both builds pass.

По искане на собственика Edge шлюз е премахнат от desktop/mobile менюто.
Устройства е единственият вход за наличните ROCK Pi/ESP32 и настройките им.
Премахната е и фиксираната sidebar карта „онлайн преди 8 сек.“. Старите
навигационни заявки gateway водят към Устройства. Не са изтрити устройства,
API права или хардуерни настройки. Старият демо модул остава в кода, но не
се зарежда. Навигационните тестове вече обхващат 18 раздела.
Промяната е към design PR #25; публикацията предстои.
Проверки: 20 Node и всичките 7 Chromium теста минават, включително 18 раздела
на 360/390/430px и внесена двойка/сесия. Двата build-а минават.

## Provisioning appearance / Оформление на provisioning — 2026-09-19

Matched live inventory, role setup and protected-access forms to existing GrideX
settings/Edge cards, colors, borders and controls. Only scoped desktop styles
(min-width 681px); mobile styling awaits explicit owner approval. No auth, API,
device configuration, credential handling or hardware behavior changes.
Build, 20 Node tests and initial Chromium regression pass; desktop fixture
screenshot inspected. Expanded role-edit regression also passed (1.1 min);
both desktop screenshots reviewed. Publication awaits review/mobile decision.
Do not call this hardware commissioning.

Уеднаквени са live inventory, роли и защитен достъп с картите, цветовете,
рамките и контролите на GrideX настройки/Edge. Само desktop стилове от 681px;
мобилното оформление чака изрично одобрение. Няма промени по auth, API,
конфигурации, тайни или хардуерна логика. Build, 20 Node теста и първият Chromium
тест минават. Разширеният тест за редакция също мина (1.1 мин); двете desktop
снимки с фиктивни данни са прегледани. Публикацията чака преглед/мобилно решение.
Това не е hardware commissioning.

## Imported pair visibility / Видимост на внесената двойка — 2026-09-19

Runtime read-only DB inspection confirms two registered gateways and an active
device-import revision with two entries. Hardware inventory revision remains
draft; an active import is NOT hardware activation. Devices now shows imported
inventory immediately, before selecting a unit. Pending modules provide an
explicit action to Devices, including the Assets screen reported by the owner.
No duplicate registration, backend deployment, hardware commands or mobile CSS.
Browser regression covers both imported units, selecting each without repeat
provisioning, and Assets → Devices; OIDC/API fixtures are mocked, not actual
owner-session acceptance. Real account acceptance and heartbeat remain pending.
Next: owner-session verification of the published Devices screen; then finish
ROCK-initiated approved-revision execution and real heartbeat separately.

Validation: 20 Node tests pass; extended Chromium imported-pair/navigation and
refresh regression passes (1.1 min); Pages and Vinext builds pass; lint has only
two pre-existing image warnings. Initial browser attempt exposed a missing
explicit selector accessible name; fixed and rerun passed. Publication pending.

Read-only проверка в реалната база потвърди два шлюза и активна device-import
ревизия с два записа. Hardware ревизията остава чернова; активен импорт НЕ е
активиране на хардуера. Устройства показва внесената двойка веднага, преди избор.
Незавършените раздели имат преход към Устройства, включително докладвания Активи.
Без дублиране, backend deployment, хардуерни команди или mobile CSS промени.
Browser regression проверява двата уреда, избор без повторен provisioning и
Активи → Устройства; OIDC/API са mock, не приемане с реалния акаунт.
Реалното приемане и heartbeat предстоят. Следва проверка с акаунта на собственика
в публикувания екран; после отделно ROCK-инициирано прилагане и реален heartbeat.

Проверки: 20 Node теста и разширеният Chromium тест за двойката/навигацията и
refresh минават (1.1 мин); Pages/Vinext build минават; lint има само две стари
image предупреждения. Първият browser опит откри липсващо изрично достъпно име
на избора; поправено и повторно проверено. Публикацията предстои.

## Live navigation/session repair / Поправка на навигация и сесия — 2026-09-19

Found: Sites was routed to a placeholder despite the existing sites API; header
count and profile statistics were demo constants. Refresh transport errors were
converted to 401 and the periodic verifier logged users out on every error.
Fixed: real authorized Site list/ID selection and Devices action; no demo sites,
alarm counts, profile statistics, power flow or forecast when live data is absent.
Read-only API 401 gets one forced-refresh retry; writes are never replayed.
Refresh network/5xx errors preserve the session and show temporary failure;
actual rejected refresh still expires it. Aborted snapshot results are ignored.
Other operational menu modules remain explicitly unfinished, not falsely live.

Tests: authenticated mocked-OIDC browser traversal of 19 sections plus 503
refresh outage, recovery and invalid_grant expiry passed; eight EN/BG render
tests passed. Lint: two existing image warnings. Local master issuer, console
URL and login form passed. Normal-DNS public probes from Mac timed out; forced
local trusted-TLS public discovery returned 200. This is not external reachability
or real-account login/logout acceptance. Publication pending this branch CI.
Device pull/update implementation is paused; incomplete backend files are not
deployed and must not be reported as an active device update mechanism.

Открито: Обекти отиваше към заглушка въпреки наличния API; броят и статистиката
в профила бяха демо константи. Мрежова refresh грешка ставаше 401, а периодичната
проверка отписваше при всяка грешка. Поправено: реален списък/избор по ID и
бутон Устройства; без демо обекти, аларми, профилна статистика, поток и прогноза
при липсващи live данни. Read-only 401 има един refresh retry, без повторение
на записи. Мрежови/5xx откази пазят сесията; отхвърлен refresh я прекратява.
Прекратени snapshot заявки не обновяват екрана. Останалите оперативни раздели
остават изрично незавършени, не фиктивно live.

Тестове: browser обход на 19 раздела с тестов OIDC, refresh 503, възстановяване
и invalid_grant — успешен; осем EN/BG render теста — успешни. Lint: две стари
image предупреждения. Local master issuer/console URL/login форма минават.
Публичните normal-DNS проби от Mac изтичат; forced local trusted-TLS discovery
връща 200. Това не доказва външен достъп или вход/изход с реален акаунт.
Публикацията чака CI. Device pull/update работата е спряна; незавършените backend
файлове не са внедрени и не са действащ механизъм за обновяване.

## ROCK Pi initiated activation — work plan / План за активиране от ROCK Pi

Owner decision: only ROCK Pi initiates provisioning/update communication.
Browser approval queues an immutable revision; backend never opens an inbound
connection to ROCK Pi/ESP32. Receiving a job is not successful application.

- [ ] Durable approved revision queue, scoped device identity, idempotent receipt.
- [ ] ROCK Pi outbound pull, bounded validation, local backup/recovery and health proof.
- [ ] UI draft, explicit approval, pending/active/failed/unconfirmed status.
- [ ] ESP32 provisioning through ROCK Pi with verified readback; no direct backend path.
- [ ] Firmware update adapters and rollback verified separately from configuration.
- [ ] Negative tests, deployment commissioning and Git push/PR.

Решение: само ROCK Pi започва provisioning/update комуникацията. Одобрението
в сайта поставя неизменяема версия в опашка; backend не отваря входяща връзка
към ROCK Pi/ESP32. Получена задача не означава успешно прилагане.

- [ ] Устойчива опашка, отделна идентичност, повторяемо потвърждение без дублиране.
- [ ] Изходящо изтегляне от ROCK Pi, проверки, локален backup/recovery и health проверка.
- [ ] UI чернова, изрично одобрение, чака/активна/грешка/непотвърдено.
- [ ] ESP32 provisioning през ROCK Pi с проверка чрез прочит, без пряк backend достъп.
- [ ] Firmware адаптери и rollback се проверяват отделно от конфигурацията.
- [ ] Отрицателни тестове, проверка при внедряване и Git push/PR.

## Existing test config import / Импорт на съществуваща тестова конфигурация

Owner-supplied private ROCK Pi env imported into the existing owning Site.
Exactly two registered gateways matched, no new inventory or hardware writes.
Original encrypted AES-256-GCM in external vault imports with Site/hash AAD;
SQL stores only provenance and sanitized polling/DHCP/commissioning summary.
Repeated import verified idempotent. No SSH credential, Deye driver validation
or live telemetry established. Source proves intended ROCK Pi settings, not
current ESP firmware or physical health. Device UI skips repeat provisioning
for imported pair, offers a separate draft for changes. Private export remains
0600 outside Git; key backup is necessary for encrypted source recovery.
Migration 005 expands configuration section constraint for device-setup/import;
prior memory tests missed this real PostgreSQL restriction. Applied successfully.
Frontend publication/real user acceptance must be verified separately.

Внесен е частният ROCK Pi env към съществуващия Обект на собственика. Намерени
точно два регистрирани gateway записа; без нов inventory/hardware writes.
Оригиналът е AES-256-GCM криптиран във външния vault imports със Site/hash AAD;
SQL съдържа само произход и обезличени polling/DHCP/commissioning данни.
Повторният импорт е проверен без дублиране. Не са добавени SSH credentials,
проверен Deye драйвер или live телеметрия. Файлът доказва ROCK Pi настройки,
не ESP firmware/физическо здраве. UI пропуска повторния provisioning на двойката
и предлага отделна чернова за промени. Частният експорт остава 0600 извън Git;
за възстановяване на криптирания оригинал е нужен backup на ключа.
Миграция 005 разширява section constraint за device-setup/import; предишните
memory тестове са пропуснали това PostgreSQL ограничение. Приложена успешно.
Frontend публикацията и приемането от реалния потребител се проверяват отделно.

## Device setup flow / Настройки на устройства — 2026-09-19

Owner requested all device configuration under Devices, not Profile. Implemented
registered-device dropdown, one/two communication roles, peer selection (backend,
Deye 100 kW, Suntech 261) and transport. Backend enforces verified Site admin,
known gateway, max two roles, no duplicate peer and no direct ESP-to-backend role.
Versioned device-setup configuration is persisted in PostgreSQL with draft
lifecycle, optimistic revision and audit; no new env files or hardware commands.
Only after confirmed save is the controller's protected provisioning/access form
shown. ESP stays DHCP via ROCK Pi; reservation/driver deployment is not implemented.
Equipment labels are planning choices, not proof of compatible drivers or exact
vendor model; commissioning remains required. Existing inventory IDs are reused.
No migration, battery Modbus activation, VPN or credential changes.
Tests: 25 API tests pass, including HTTP admin/scope/revision protection.
Frontend lint/build and null-battery regression pass. API deployment initiated;
UI CI/publication and real browser acceptance must be checked before claiming live.

Настройките са преместени от Профил в Устройства: падащо меню със заведени
устройства, една/две комуникационни роли, партньор (backend, Deye 100 kW,
Suntech 261) и транспорт. Backend проверява потвърден admin на Обекта,
познат gateway, максимум две роли, без дублиран партньор и без директна ESP-backend
роля. Versioned device-setup е в PostgreSQL с draft lifecycle, revision check
и одит; без нов env файл или hardware команди. Едва след потвърден запис се
показва защитената форма за provisioning/достъп на контролера. ESP остава DHCP
през ROCK Pi; прилагане на резервация/driver не е реализирано. Етикетите са
план, не доказан съвместим драйвер/точен модел; commissioning предстои.
Запазени са inventory ID. Без миграции, battery Modbus, VPN или credentials промени.
25 API теста минават, включително HTTP admin/scope/revision защити. Frontend
lint/build и null-battery regression минават. API deployment е стартиран;
UI CI/публикация и реалният browser тест трябва да се проверят преди live твърдение.

## Local admin login repair / Поправка на локалния admin вход — 2026-09-19

Applied master realm frontendUrl from GRIDEX_ADMIN_AUTH_BASE in the single
private env, preserving other realm attributes and public gridex issuer.
Rollback metadata saved privately. No password, proxy ACL, TLS trust or router
change. Verified local discovery, admin authServerUrl and fresh PKCE login form
all use the local admin origin; forced restricted-proxy master probe remains 404.
Actual LAN forwarding target is host port 14443, not 443; LAN TLS probe passed.
Public-domain access from this Mac still times out: external/mobile reachability
and LAN hairpin routing are not proven by these local checks. Earlier diagnosis
based on host port 443 refusal was not valid for this router mapping.
Backend check-auth-routing.mjs provides a read-only regression gate; both AGENTS
require login/logout/expired-session browser acceptance, not just HTTP 200.
Actual password submission and browser session-expiry acceptance remain pending;
no continuous monitoring has been installed.

Приложен master realm frontendUrl от GRIDEX_ADMIN_AUTH_BASE в единния частен env,
със запазени останалите realm attributes и public gridex issuer. Частен rollback
е записан. Без промяна на пароли, proxy ACL, TLS доверие или рутер. Local discovery,
admin authServerUrl и новата PKCE login форма вече ползват локалния admin адрес;
принудителната проба през ограничения proxy за master остава 404.
Реалната LAN цел е host порт 14443, не 443; LAN TLS пробата мина. Публичният домейн
от този Mac още изтича: външен/mobile достъп и LAN hairpin не са доказани с тези
локални проверки. Предишният извод от отказ на host 443 не е валиден за този NAT.
Backend check-auth-routing.mjs е read-only regression проверка; двата AGENTS
изискват browser вход/изход/изтекла сесия, не само HTTP 200. Реално подаване на
парола и browser приемане след изтекла сесия предстоят; няма постоянен монитор.

## UI publication and device inventory / UI публикация и устройства — 2026-09-19

PR #19 merged; GitHub Pages run 35442969353 succeeded. Protected access form
and sanitized demo example are published. New device-information implementation
uses the existing administrator-only hardware API in live Devices/Gateway views.
Shows model, role, ID, interfaces, configuration revision and attached-device
drivers; never renders connection settings or credentials. Site changes unmount
old data, requests are aborted on cleanup, denied/error states never use demo
fallback. No live gateway heartbeat claim: configuration is not telemetry.
No backend, hardware, CSS/mobile layout, VPN or battery Modbus changes.
New inventory publication and real authenticated browser acceptance remain pending;
heartbeat ingestion remains a separate unfinished task.

PR #19 е слят; GitHub Pages run 35442969353 завърши успешно. Публикувани са
формата за защитен достъп и обезличеният демо пример. Новата информация за
устройства ползва съществуващия admin-only hardware API в live Устройства/Gateway.
Показва модел, роля, ID, интерфейси, конфигурационна ревизия и драйвери на свързани
устройства; не показва connection настройки или credentials. Смяна на Обект
премахва старите данни, заявките се прекратяват при cleanup, отказ/грешка не
замества данните с демо. Няма твърдение за live heartbeat: конфигурацията не е
телеметрия. Без промени по backend, хардуер, CSS/mobile layout, VPN или Modbus.
Публикацията на новия inventory и реален browser тест с вход предстоят;
heartbeat ingestion остава отделна незавършена задача.

## Blank screen after login / Празен екран след вход — 2026-09-19

Proxy logs show successful token, identity and Site snapshot responses. Found
an unconditional battery.sohPct.toFixed call in live Overview: a commissioned
inventory without battery telemetry can return battery=null and crash rendering.
Guard missing battery/SOH and show a dash, never demo SOH. Six EN/BG render
regressions cover absent battery, null metrics and populated metrics; included
in npm test. Pages build passes. No auth, network or hardware setting changed.
Actual external browser acceptance remains required after publication.

Proxy логовете показват успешни token, identity и Site snapshot отговори.
Открито е безусловно battery.sohPct.toFixed в live Overview: Обект без батерийна
телеметрия може да върне battery=null и да срине визуализацията. Добавена защита
за липсваща батерия/SOH с тире, не демо SOH. Шест EN/BG render теста покриват
липсваща батерия, null и налични стойности; включени в npm test. Pages build
минава. Без auth, мрежови или hardware промени. Реален външен browser тест
след публикацията остава необходим.

## Planned: day-ahead net-profit arbitrage / Планирано: арбитраж „ден напред“ — 2026-09-19

Status: requirement recorded, not implemented or activated by this task.
Extend the existing `price_arbitrage` strategy rather than introducing a duplicate.

### English

- [ ] Select/configure the strategy per Site in the frontend, persist a versioned
  configuration in the backend, enforce Site administrator permissions and audit
  approval. Deployment settings remain in the single backend configuration file;
  no hard-coded operational settings or secrets in frontend/Git.
- [ ] Backend jointly optimizes next-day charging and later discharging windows
  for maximum expected **net profit**, not merely the lowest/highest spot price.
  Use published day-ahead intervals, currency/energy units, timezone and DST;
  distinguish actual published prices from forecasts and validate source freshness.
- [ ] Net profit = export revenue minus purchased energy, applicable grid/market
  fees and taxes, and battery degradation cost. Model charge/discharge efficiency
  in the energy balance, without charging losses twice.
- [ ] Configure battery cost per equivalent full cycle (EFC), or an equivalent
  throughput cost with an explicit kWh basis. Allocate partial-cycle wear to each
  dispatch interval and show hourly costs; cycle cost is not an arbitrary fixed
  cost per clock hour. Document the conversion and avoid double-counting wear.
- [ ] Respect initial/final SOC, reserve, usable capacity, charge/discharge power,
  grid import/export limits, cycle budget, availability and the Edge safety
  envelope. Prevent simultaneous charge/discharge; do not schedule trades below
  the configured minimum net margin. Missing/stale prices or telemetry must
  block new automatic dispatch and follow an approved safe fallback.
- [ ] UI displays buy/sell windows, kWh, prices, losses, fees, cycle cost and
  expected net profit by interval and total. Support preview/simulation, explicit
  administrator approval and an audited plan/configuration revision. Compare
  forecasts with actual metered results; predicted profit is not guaranteed.
- [ ] Acceptance: tests for low spread, negative prices, efficiency/degradation,
  partial cycles, SOC/power/reserve limits, DST/missing intervals, stale inputs
  and unauthorized changes; then read-only simulation with real price data.
  Physical battery dispatch remains disabled until separate commissioning and
  approval. No Suntech 261 Modbus activation is authorized by this task.

Next: agree the versioned strategy inputs, cost units and plan API contract,
then implement backend optimization and frontend selection/preview together.

### Български

- [ ] Избор/настройка на стратегията по Обект през frontend, versioned конфигурация
  в backend, права на администратор на Обекта и одит на одобрението. Deployment
  настройките остават в единния backend конфигурационен файл; без hard-coded
  оперативни настройки или тайни във frontend/Git.
- [ ] Backend оптимизира съвместно прозорците за зареждане и последващо разреждане
  за следващия ден за максимална очаквана **нетна печалба**, не само най-ниска/
  най-висока борсова цена. Ползва публикуваните интервали „ден напред“, валута,
  енергийни единици, часова зона и лятно/зимно време; различава реалните публикувани
  цени от прогнози и проверява актуалността на източника.
- [ ] Нетна печалба = приход от продажба минус закупена енергия, приложими
  мрежови/пазарни такси и данъци и износване на батерията. КПД при заряд/разряд
  се отчита в енергийния баланс, без двойно начисляване на загубите.
- [ ] Настройва се цена на еквивалентен пълен цикъл (EFC) или еквивалентна цена
  за преминала енергия с изрична kWh база. Износването от частичните цикли се
  разпределя по интервали и се показва по часове; цената на цикъла не е произволна
  фиксирана такса на астрономически час. Документирана конверсия, без двойно
  начисляване на износването.
- [ ] Спазват се начален/краен SOC, резерв, използваем капацитет, мощности на
  заряд/разряд, мрежови лимити за внос/износ, бюджет цикли, наличност и безопасният
  работен диапазон на Edge. Без едновременен заряд/разряд и сделки под зададения
  минимален нетен марж. Липсващи/стари цени или телеметрия блокират новото
  автоматично управление и задействат предварително одобрено безопасно поведение.
- [ ] UI показва прозорци за покупка/продажба, kWh, цени, загуби, такси, цена на
  цикъла и очаквана нетна печалба по интервал и общо. Преглед/симулация, изрично
  одобрение от администратор и одит на ревизията на плана/конфигурацията.
  Сравнение с реално измерения резултат; прогнозната печалба не е гаранция.
- [ ] Приемане: тестове за малък спред, отрицателни цени, КПД/износване, частични
  цикли, SOC/мощност/резерв, смяна на часа/липсващи интервали, стари входни данни
  и неразрешени промени; после read-only симулация с реални цени. Физическото
  управление остава изключено до отделно commissioning и одобрение. Тази задача
  не разрешава активиране на Modbus към Suntech 261.

Следва: договор за versioned входни параметри, единици за разходите и plan API,
после съвместна реализация на backend оптимизацията и frontend избора/прегледа.

## Protected device access / Защитен достъп до устройства — 2026-09-19

Backend deployed: GET/PUT site gateway access metadata/replacement endpoints.
Verified current site administrator required; foreign Sites rejected, ESP direct
access rejected. Hardware topology/config administration is now admin-only.
Full SSH connection material encrypted AES-256-GCM with Site/gateway/version/time
AAD, stored outside SQL. Separate 0400 master-key volume, read-only API mount;
data directory 0700/files 0600. Single backend .env holds vault path settings.
No secret read HTTP endpoint. Explicit confirmation, optimistic version check,
no-store response and secret-free replacement audit. API tests: 22 pass.

Frontend Profile form implemented, lint/Pages build pass; publication and real
browser acceptance remain pending. Full tsc is blocked by existing gateway,
overview, supported-device, worker and service dependency errors, not new form.
No actual device credential has been saved; no SSH execution, heartbeat worker,
OTA queue or fresh-auth/MFA approval flow exists yet. Key fingerprint is required
as input but not verified against a connection yet; key input is structurally
validated only. Current vault supports one API process (not distributed writers).
Master-key offline encrypted backup/rotation and recovery drill remain mandatory
before production; SQL backup alone cannot restore credentials. Host/API takeover
can expose decrypt capability; this protects database-only leakage, not host
compromise. Demo must never reuse this endpoint or store.

Backend е внедрен: GET/PUT за статус/замяна на достъп по Обект/gateway. Изисква
потвърден текущ администратор; чужд Обект и директен ESP достъп се отказват.
Hardware topology/config администрацията е само за администратор. Целият SSH
достъп е криптиран AES-256-GCM с Site/gateway/version/time AAD извън SQL. Master
ключът е в отделен volume с 0400 и read-only API mount; данни 0700/0600. Пътищата
са в единния .env. Няма secret-read HTTP endpoint. Има изрично потвърждение,
version check, no-store и audit без тайни. 22 API теста минават.

Profile формата е реализирана; lint/Pages build минават, публикация и реален
browser тест предстоят. Пълният tsc е блокиран от съществуващи gateway/overview/
supported/worker/dependency грешки, не от новата форма. Реален credential още не
е записан; няма SSH изпълнение, heartbeat worker, OTA queue или fresh-auth/MFA
одобрение. Fingerprint се изисква, но не е проверен с връзка; key input се
валидира само структурно. Vault е за един API процес, не distributed writers.
Отделен криптиран offline backup/rotation на master key и restore тренировка
са задължителни преди production; SQL backup не възстановява ключовете.
Превзет host/API може да дешифрира; защитата е срещу database-only изтичане.
Демото никога не ползва този endpoint/store.

## Local test inventory / Локален тестов inventory — 2026-09-19

Owner approved a local-only test Site with one ROCK Pi E controller and one
OLIMEX ESP32-EVB lab node, owned through the organization's administrator.
Inventory registered transactionally as commissioning/draft; repeat registration
does not duplicate it. No hardware commands, IP/MAC reassignment, VPN activation,
battery Modbus or physical configuration changes were performed. RS485 battery
port is marked disabled in inventory; this is NOT proof of firmware state.
Demo uses a sanitized illustrative pair, not private inventory IDs or telemetry.
Remaining: publish frontend example, verify authorized topology UI, reconcile
physical identities/config files, ingest heartbeat, then separately implement
opt-in sanitized live demo projection. Other demo simulations are not live data.

Одобрен е локален тестов Обект с един ROCK Pi E контролер и OLIMEX ESP32-EVB
lab нод, собственост чрез администратора на организацията. Inventory е записан
транзакционно като commissioning/draft; повторният старт не го дублира. Няма
хардуерни команди, IP/MAC промени, VPN активация, battery Modbus или физически
конфигурационни промени. RS485 battery портът е disabled в inventory — това НЕ
доказва firmware състоянието. Демото използва обезличена примерна двойка, не
частни ID или телеметрия. Остават публикуване на frontend примера, проверка на
удостоверения topology UI, сверяване на физически identity/config файлове,
heartbeat приемане и отделна opt-in обезличена live demo проекция. Останалите
демо симулации не са реални данни.

## Login recovery / Възстановяване на входа — 2026-09-18

Explicit PKCE login no longer depends on embedded SSO cookie checks. Failed
initialization resets the client so retry is possible. Anonymous API status is
unknown; only authenticated `/me` success marks it online. Identity failures
and API-access failures have separate messages and neither permanently disables
retry. Refresh now requires explicit login (the identity provider may reuse its
session); token refresh and server authorization remain enforced.
Chromium regression passed: login enabled without health/iframe requests and
redirect includes code, S256, state and nonce. Real credentials, site permissions
and public-network reachability still need end-to-end acceptance.

Изричният PKCE вход вече не зависи от скрити SSO cookie проверки. При неуспешна
инициализация клиентът се изчиства за повторен опит. API статусът преди вход е
неизвестен; само успешен удостоверен `/me` го маркира online. Грешките на
идентификацията и API достъпа са отделни и не блокират трайно повторния вход.
След refresh се натиска вход (identity provider може да използва своята сесия);
token refresh и сървърните права продължават да се проверяват.
Chromium regression мина: активен вход без health/iframe заявки и redirect с
code, S256, state и nonce. Реални credentials, права по обекти и публична
мрежова достъпност още изискват цялостен приемателен тест.

## Public OIDC handoff / Публичен OIDC handoff — 2026-09-18

The public runtime defaults now use `https://auth.gridex.tech/auth/realms/gridex`.
Startup no longer makes an unauthenticated request to the intentionally private
backend `/health` path before OIDC; that removed the former login/readiness
circular dependency. No CSS, mobile layout or navigation was changed.

Backend discovery and issuer now use the same public auth hostname. The exact
Keycloak callbacks for `https://gridex.tech` root, `/en/` and
`/silent-check-sso.html` are configured and verified; a foreign callback is
rejected. Next publish this frontend and verify real PKCE sign-in/sign-out. A
master administrator is not a normal portal member: accept only an ordinary
Gridex user with explicit organization/site membership and prove empty/foreign-
site denial. Invitation email delivery through Mailgun remains separately
disabled pending provider commissioning.

Публичните runtime defaults вече ползват
`https://auth.gridex.tech/auth/realms/gridex`. При стартиране вече няма заявка
без удостоверяване към умишлено частния backend `/health` преди OIDC; така е
премахнат предишният цикъл вход/готовност. Няма промяна по CSS, mobile layout
или навигация.

Backend discovery и issuer вече използват същото публично auth име. Точните
Keycloak callbacks за `https://gridex.tech` root, `/en/` и
`/silent-check-sso.html` са конфигурирани и проверени; чужд callback се отказва.
Следва публикуване на frontend и реален PKCE вход/изход. Master admin не е
нормален portal member: приеми само обикновен Gridex user с изрично членство в
организация/обект и докажи отказ при липсващо/чуждо членство. Поканите по
Mailgun остават отделно изключени до provider commissioning.

## Active access-management backlog / Активен план за достъп — 2026-09-15

Owner selected Mailgun REST API, not SMTP. Follow [the coordinated plan](docs/ACCESS_MANAGEMENT_PLAN.md):
BE-01 delivery integration, BE-02 delivery reliability, BE-03 admin lists,
BE-04 membership mutations, BE-05 invitation lifecycle, FE-01 menus/forms,
SEC-01 identity hardening, QA-01 end-to-end acceptance. 0/8 full milestones accepted.
Backend owns canonical plan; frontend carries an identical copy. Keep both in sync.
Existing foundation is not complete registration; keep enrollment disabled.
Next: Mailgun compatibility/provider work, then admin APIs and menus. SMTP next-actions
below are historical. No runtime, email, DNS or UI changes in this documentation task.

Избран е Mailgun REST API, не SMTP. Следвай [общия план](docs/ACCESS_MANAGEMENT_PLAN.md):
BE-01 интеграция, BE-02 надеждност, BE-03 списъци, BE-04 членства, BE-05 покани,
FE-01 менюта/форми, SEC-01 сигурност, QA-01 целият процес. 0/8 пълни етапа приети.
Backend е водещ, frontend пази идентично копие; обновявай и двете заедно.
Наличната основа не е готова регистрация; остава изключена. Следва Mailgun provider,
после admin API и менюта. Старите SMTP задачи са исторически. Тук няма промени
в runtime, имейли, DNS или интерфейс.

## Invitation forms / Форми за покани — 2026-09-15

Profile/sign-in now show invitation acceptance and organisation-admin invitation
forms. Uses database membership from /me, not token admin claims. Explicit site
selection and four non-admin roles; no password collection. Sending is disabled
on enrollment 503. A sent invitation can be revoked in the same session; persisted
sent-invitation listing is not yet provided by backend. Anonymous users see the
invite-only instructions. Backend PR #19 is merged/deployed; the old RBAC notes
below are historical. Keycloak setup belongs to antouanbg/gridex-openremote-backend.
SMTP, activation and real user browser tests remain. No mobile CSS/design changes.
Typecheck exposes existing unrelated errors; builds/lint and 11 tests pass.

Профилът/входът вече показват приемане и форма за покана от администратор на
организация. Използва membership от /me, не token admin claims. Изричен избор
на обекти и четири неадминистративни роли; без събиране на пароли. При 503
изпращането е спряно. Изпратена покана може да се отмени в същата сесия;
backend още няма постоянен списък с изпратени покани. Анонимните виждат указания.
Backend PR #19 е merged/внедрен; старите RBAC бележки са исторически. Keycloak
настройките са в antouanbg/gridex-openremote-backend. Остават SMTP, активиране
и реален browser тест. Без мобилни CSS/дизайн промени. Typecheck открива стари
несвързани грешки; builds/lint и 11 теста минават.

## English

Local integration uses vite.local.config.ts (loopback 4173), existing Keycloak
PKCE login and GrideX API proxy. Public runtime config and mobile layout are
unchanged. Before login, backend must allow this exact origin and Keycloak
portal callbacks; an actual test user/membership is still required. Do not
claim OpenRemote admin login proves frontend login. Registration/invitation UI
and backend invitation lifecycle are not implemented by this checkpoint.

Recommended onboarding: organization administrator invites email with expiry
and single-use acceptance; Keycloak handles identity/email verification/password;
GrideX stores membership, per-organization role and optional site grants with
audit. No organization access solely because an account was registered.
Current backend membership filters sites at organization level, while token
roles grant permissions globally. Per-organization role enforcement and
site-specific grants must be implemented/tested before claiming full RBAC.

Proposed roles: viewer (read), operator (approved operational actions),
energy_manager (strategies/configuration), integrator (hardware/device setup),
organization administrator (members/roles within own organization). Platform
administrator is separate; no self-assigned elevated role. All real control
still requires Edge commissioning gates. Next: local callback provisioning,
real browser login/logout and empty-membership UI; then invitation/RBAC API.
Deferred backup/restore belongs to `antouanbg/gridex-openremote-backend` PR #17:
row-content and application-volume/full-stack restore remain outstanding.

## Български

Локалната интеграция ползва vite.local.config.ts (loopback 4173), наличния
Keycloak PKCE вход и GrideX API proxy. Публичната конфигурация и мобилният
дизайн са непроменени. Преди вход backend трябва да разреши точния origin и
Keycloak callbacks; още е нужен реален test user/membership. OpenRemote admin
вход не доказва frontend вход. Регистрация/покани UI и invitation lifecycle
в backend не са реализирани с този checkpoint.

Препоръчано: администратор на организация кани email с еднократно приемане и
срок; Keycloak управлява identity/email verification/password; GrideX пази
membership, роля по организация и евентуални site grants с audit. Самата
регистрация не дава достъп до организация. Backend филтрира обектите по
организация, но token ролите дават глобални permissions. Роли по организация
и индивидуални site grants изискват реализация/тест преди заявяване на пълен RBAC.

Предложени роли: viewer (четене), operator (одобрени оперативни действия),
energy_manager (стратегии/конфигурация), integrator (хардуер/устройства),
администратор на организация (членове/роли само в своята организация).
Platform administrator е отделен; без самоназначаване на висока роля.
Реалното управление изисква Edge commissioning gates. Следва: local callbacks,
истински browser вход/изход и UI без membership; после invitation/RBAC API.
Отложеният restore е в `antouanbg/gridex-openremote-backend` PR #17:
row-content и app-volume/full-stack restore остават незавършени.
