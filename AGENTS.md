# GrideX Energy OS — Working Rules

## Strategic invariant: OpenRemote-only inventory / Стратегическо правило — 2026-09-20

Owner-confirmed: OpenRemote is the ONLY authoritative place for all operational
inventory, Sites, devices, gateways, sensors and resource relationships. This
applies equally to user actions through the frontend and Codex/operator actions
under owner instructions: create/provision/update resources through supported
OpenRemote APIs, normally orchestrated by the authorized GrideX backend. Never
bypass OpenRemote by SQL, import, scripts, browser storage or a second registry.
Do not expose administrative credentials in the frontend. No local-only resource
may be presented as provisioned. Require verified OR identity, hierarchy,
owner/realm access and durable bindings before success; outages and partial
failures stay pending/failed and must reconcile idempotently.
Local drafts, delivery queues and disposable read projections are allowed ONLY
as workflow data referencing OR or a pending request, never independent inventory.
Device configuration/NVS and certificates are execution artifacts, not a registry.
Keycloak identity and business records are separate concerns. Anonymous demo
fixtures remain explicitly synthetic, never registered customer/live inventory.
This decision supersedes conflicting older local-only provisioning instructions.
Preserve existing data and safety locks; reconcile legacy orphans with backup,
not blind deletion. Canonical plan: backend docs/OPENREMOTE_PROVISIONING_AUTHORITY.md.
Documentation is not runtime enforcement; migration and acceptance remain pending.

Потвърдено от собственика: OpenRemote е ЕДИНСТВЕНОТО основно място за целия
оперативен инвентар, Обекти, устройства, шлюзове, сензори и ресурсните им връзки.
Правилото важи еднакво за потребителя през frontend и за Codex/оператор по
инструкции на собственика: създаване/провизиране/обновяване през поддържаните
OpenRemote API, обичайно чрез GrideX backend с проверени права. Без заобикаляне
чрез SQL, import, скриптове, browser storage или втори регистър. Без admin тайни
във frontend. Local-only ресурс не се показва като провизиран. Успех изисква
проверени OR идентичност, йерархия, собственик/realm права и устойчив binding;
отказите остават pending/failed и се съгласуват идемпотентно.
Локални чернови, опашки и възстановими проекции за четене са допустими САМО като
данни за процеса с връзка към OR или чакаща заявка, никога независим инвентар.
Device конфигурации/NVS и сертификати са изпълними настройки, не регистър.
Keycloak идентичности и бизнес записи са отделни. Анонимното демо остава ясно
синтетично, не регистриран клиентски/live инвентар.
Решението отменя противоречащи стари инструкции за local-only provisioning.
Пази данните и safety locks; съгласувай наследените записи с backup, без сляпо
изтриване. Каноничен план: backend docs/OPENREMOTE_PROVISIONING_AUTHORITY.md.
Документацията не е runtime защита; миграцията и приемането предстоят.


## Approved navigation presentation — 2026-09-20

Owner additionally approves a compact mobile rail with three visible sections,
native horizontal swipe through all existing destinations, and fixed Menu button.
Keep expanded hierarchy and desktop unchanged; preserve touch scroll and links.
Допълнително одобрено: долна мобилна лента с три видими раздела, хоризонтално
плъзгане между всички и фиксирано Меню. Пази desktop и разгънатата йерархия.

Preserve the approved menu labels, order and parent relationships. Desktop and
expanded phone menus show indented children with connector lines, a light-green
active child and subtle active parent. Page headings show clickable parent →
current section, with Site context below. Keep this consistent in BG/EN and
Demo/live; changes to menu structure still require explicit owner approval.

Запазвайте имената, реда и йерархията. Подменютата на desktop и в отвореното
телефонно меню са с отстъп/линия; активното дете е светлозелено, родителят —
леко подчертан. Заглавие: кликаем родител → раздел; Обектът е отдолу.
Промяна на структурата изисква изрично одобрение.

## Approved per-Site transports / Одобрени транспорти по Обект — 2026-09-19

Owner explicitly approves implementation and publication of both selectable
modes: wireguard_private (ROCK → Site Router → VPN → MQTT) and mqtt_mtls_direct
(ROCK → Internet → controlled MQTT mTLS ingress). This supersedes older blanket
VPN-only/public-MQTT prohibitions for that scoped ingress only. Same identity,
topic ACLs, telemetry/heartbeat contract and Site permissions in both modes.
One active mode per ROCK; no automatic downgrade. Router remains the VPN peer;
ESP/OT/admin/DB remain non-public. No SSH dependency for the intended enrolment
or OTA process. Follow the canonical backend plan
[PER_SITE_TRANSPORT_AND_ENROLLMENT](https://github.com/antouanbg/gridex-openremote-backend/blob/docs/per-site-transport/docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md).
Do not confuse approval or Git publication with deployed, tested connectivity.
Activation follows its security and commissioning gates; preserve control locks.
UI selection belongs inside existing Site/Devices settings, not a new menu item.

Собственикът изрично одобрява реализация и публикуване на избираемите режими
wireguard_private (ROCK → рутер → VPN → MQTT) и mqtt_mtls_direct (ROCK → Интернет
→ контролиран MQTT mTLS вход). Старите общи VPN-only/public-MQTT забрани се
отменят само за този ограничен вход. Идентичност, topic ACL, heartbeat/telemetry
договор и Site права са еднакви. Един активен режим на ROCK, без автоматичен
downgrade. VPN peer остава рутерът; ESP/OT/admin/DB не стават публични. Целевият
provisioning/OTA процес не зависи от SSH. Следвай каноничния backend план по-горе.
Одобрение/Git публикация не означават внедрена/тествана връзка. Активиране след
security/commissioning gates; control locks се пазят. Изборът е вътре в текущите
настройки Обект/Устройства, не ново меню.


## Mandatory auth regression gate / Задължителна auth проверка

Session acceptance must cover two-tab logout, fresh identity/role/Site-scope
checks on resume, final 401, 403, expiry, offline recovery, stale in-flight
responses, and restart-required responses after a GET retry. Clear private UI
on confirmed session loss; never retry writes or persist tokens for convenience.
Distinguish browser fixture evidence from a real owner/Keycloak session. Never
promise instant cross-device JWT revocation without server-side enforcement.
Приемането на сесиите включва logout в два таба, identity/роли/Обекти при
връщане към таба, окончателен 401, 403, expiry, offline recovery, закъснели
отговори и restart-required след GET retry. Изчиствай частния UI при потвърдена
загуба на сесия; без повторение на записи или съхраняване на токени за удобство.
Отличавай browser fixtures от реална owner/Keycloak сесия. Не обещавай мигновено
отнемане на JWT между различни устройства без сървърно прилагане.

After proxy, Keycloak, OIDC, frontend login changes or restart: verify local
master discovery, admin console authServerUrl and a fresh login form all stay
on the configured local admin origin; verify public gridex issuer/callbacks
remain public, and master/admin/health/metrics stay blocked at public ingress.
Run backend scripts/check-auth-routing.mjs with the single private backend env.
Normal-DNS trusted-TLS probes and forced local/LAN probes are different evidence;
never claim external reachability from a local probe. Read the actual router
destination port before testing; do not assume host port 443.
HTTP 200 for a shell/form is NOT completed login. Require browser login,
logout and fresh login after session expiry before declaring authentication
accepted. Record untested steps, failures, rollback and deployment revision in
HANDOFF. Never weaken CORS/TLS or expose master to repair login. Do not print
passwords, tokens or session/action URLs. This gate is not a running monitor.

След proxy, Keycloak, OIDC, frontend login промени или рестарт: провери local
master discovery, authServerUrl на admin конзолата и нова login форма — всички
към конфигурирания локален admin адрес. Public gridex issuer/callbacks остават
публични, а master/admin/health/metrics — забранени на публичния ingress.
Изпълни backend scripts/check-auth-routing.mjs с единния частен backend env.
Normal-DNS/trusted-TLS и принудителните local/LAN проби са различни доказателства;
локален успех не доказва външен достъп. Чети реалния целеви порт на рутера,
не приемай host 443. HTTP 200 на shell/форма НЕ е завършен вход. Изисквай browser
вход, изход и нов вход след изтекла сесия преди приемане. Записвай непроверените
стъпки, грешки, rollback и deployment ревизия в HANDOFF. Не отслабвай CORS/TLS
и не излагай master за поправка. Без пароли, токени и session/action URL в логове.
Това е проверка при промени, не работещ постоянен монитор.

## Active host decision / Активен host

Owner decision 2026-09-14: active staging is Linux ARM64 under macOS/Colima.
Windows deployment statements below are historical. Keep Site Router VPN
boundaries unchanged; local login testing does not authorize public exposure.

Решение 2026-09-14: активният staging е Linux ARM64 под macOS/Colima.
Windows deployment текстовете по-долу са исторически. Site Router VPN
границите се запазват; local login тест не разрешава публично излагане.

## EMS architecture — mandatory

This repository is part of a distributed EMS based on OpenRemote and custom
site gateways. The central backend runs on **Windows 11** and hosts Docker
services, OpenRemote, the GrideX API, PostgreSQL, monitoring and logging.

Every physical site has its own dedicated **Site Router**. WireGuard terminates
only on the Windows backend and on that router. ROCK Pi, ESP/OLIMEX nodes,
inverters, BESS, meters and EV chargers are behind the Site Router; they do
not run WireGuard. Each site has an independent peer, key pair, configuration
and isolated control/telemetry networks. Site-to-site routing is prohibited by
default.

Normal path: `Windows backend ↔ WireGuard ↔ Site Router ↔ site devices`.

Never commit real addresses, VPN ranges, private keys, passwords, tokens,
customer inventories or deployment domains. Use placeholders and `.env.example`
files. Do not expose OT/BESS networks directly, and do not reintroduce public
MQTT port 8883 after the VPN-only migration.

Vendor-specific Modbus/CAN/RS mappings belong in drivers and mappings, never
in generic EMS logic. Commands to physical devices must be limited, logged,
validated and fail safe. Use the manufacturer protocol as authoritative.

## Menu structure — owner approval required / Структура на менюто — само с разрешение

Canonical approved menu/URL tree: HANDOFF.md, "Approved menu baseline and separate
Demo" (2026-09-20). Keep Demo as an explicit separate `/demo/*` section with demo
data and real hyperlinks, never an automatic live fallback. New anonymous Home
visitors enter Demo; remembered live sessions/callbacks restore Live. Check the
latest HANDOFF for implementation/publication evidence, not historical plans.
Канонично одобрено меню/URL: HANDOFF.md, „Approved menu baseline and separate
Demo“ (2026-09-20). Демо остава изричен отделен `/demo/*` раздел с демо данни
и истински линкове, никога автоматичен live fallback. Нови анонимни посетители
на Начало влизат в Демо; запомнени сесии/callback възстановяват Live. Виж
последния HANDOFF за реализация/публикация, не историческите планове.

2026-09-20 owner approval: Overview is Home. Every section/subsection needs a
real hyperlink and stable URL. Refresh/history/new tabs preserve section and
authorized Site context; recover SSO without password prompts on refresh.
Remember Me survives browser reopening within configured security lifetime.
Explicit logout/revocation ends access; frontend deployment/API restart requires
fresh authentication and returns to the prior URL. Never persist tokens in Web
Storage. No automatic demo fallback. Approved children: Sites→Assets/Battery/Loads;
Market→Settlement/Balancing; Automation→Schedules; Devices→Supported;
Settings→Subscription. About stays at the bottom. No new Edge gateway menu.

Одобрение 2026-09-20: Преглед е Начало. Всеки раздел/подраздел има истински линк
и постоянен URL. Refresh/history/нов tab пазят раздела и разрешения Обект; SSO
се възстановява без парола при refresh. Remember Me важи и след отваряне на
браузъра в конфигурирания защитен срок. Изход/отнемане прекратяват достъпа;
frontend deployment/API restart изискват пресен вход и връщат същия URL.
Без токени в Web Storage и автоматичен демо fallback. Одобрени подменюта:
Обекти→Активи/Батерия/Товари; Пазар→Сетълмент/Балансиране; Логика→Графици;
Устройства→Поддържани; Настройки→Абонамент. За нас е долу. Без Edge шлюз меню.

- Do not change menu structure, grouping, order, labels, hierarchy, visibility
  or navigation destinations without the project owner's explicit permission.
  This applies to desktop, mobile, account menus and submenus.
- Add a new menu item only when explicitly requested by the owner. Do not infer
  permission from a new feature, endpoint, design task or general cleanup.
- When a menu change seems necessary, describe the affected items and proposed
  change and obtain approval before implementation. Limit any approval to the
  requested change; preserve the rest of the navigation.
- Не променяй структурата, групирането, реда, имената, йерархията, видимостта
  или целевите екрани на менюто без изрично разрешение от собственика.
  Правилото важи за desktop, mobile, потребителско меню и подменюта.
- Добавяй нов елемент само по изрично искане на собственика. Нова функция,
  endpoint, дизайн задача или общо почистване НЕ означава разрешение.
- Ако промяна е необходима, опиши засегнатите елементи и предложението и
  получи одобрение преди изпълнение. Одобрението важи само за поисканата
  промяна; останалата навигация се запазва.

## Mobile layout approval / Одобрение за мобилното оформление

Before changing any mobile layout, responsive CSS, mobile navigation, font size,
touch target, or mobile-only component behavior:

1. Describe the observed issue to the project owner.
2. Identify the affected screen(s) and the proposed change.
3. Ask for explicit approval before editing, committing, or deploying the change.

Do not publish mobile frontend changes merely because an automated test or a
desktop emulation appears to pass. A user-reported mobile issue is authoritative.

## General safeguards

- Never fall back to demo values for an authenticated user, during session
  verification or after an identity/API error. Show a loading, denied,
  unavailable or setup-required state instead. Do not replace unknown telemetry
  with zero. Explain required setup/data INSIDE unfinished screens only; do not
  append status text to menu labels or tooltips. Distinguish
  missing backend integration from work the user can complete by provisioning.
- Никога не връщай демо стойности след вход, при проверка на сесията или при
  identity/API грешка. Показвай зареждане, отказ, недостъпност или необходима
  настройка. Не заменяй неизвестна телеметрия с нула. Обяснявай необходимата
  настройка/данни САМО вътре в раздела, без добавки към меню/tooltip. Отличавай липсваща backend интеграция
  от настройки, които потребителят може да завърши чрез провизиране.

- Before publishing login or live dashboard changes, render a successfully
  authenticated Site with no battery and null SOC/SOH, in both languages.
  HTTP 200/auth token success does not prove the post-login UI works.
- Преди публикация на login/live табло тествай успешно удостоверен Обект без
  батерия и с null SOC/SOH на двата езика. HTTP 200/token успех не доказва,
  че екранът след вход работи.

- Preserve unrelated work and inspect `git status` before changes.
- Do not commit secrets, credentials, private keys, or production-only settings.
- Keep product documentation bilingual where practical: English first, Bulgarian second.
- Update tests and documentation with material implementation changes.

## Bilingual synchronisation — mandatory

For every user-facing, architecture, configuration, safety or operational text:

1. English is the canonical section and Bulgarian is the matching section.
2. Update both versions in the same commit whenever meaning changes.
3. Keep figures, data paths, units, defaults, roles and safety conditions
   semantically identical; wording may differ only for correct translation.
4. Use `docs/i18n/GLOSSARY.md` as the binding terminology source. Do not
   translate code identifiers, API fields, protocol names or product brands.
5. Before commit, inspect the changed EN/BG sections and fix discrepancies;
   never leave a stale translation for a later task.

## Task recovery and Git workflow

- Before declaring completion, test the exact requested flow, including populated,
  empty, denied and unavailable states. Record mocked versus real-user evidence,
  tested revision, results and publication verification. CI or a demo shell alone
  does not establish real-account acceptance.
- Keep unfinished work in HANDOFF with status, blocker, next action and acceptance
  criteria. On resuming, review it and propose the highest-priority unfinished
  step without waiting to be reminded; do not expand hardware/network authority.
- Преди приключване тествай точния поток: налични/липсващи данни, отказ и
  недостъпност. Записвай mock спрямо реален вход, ревизия, резултати и проверена
  публикация. CI или демо екран не доказва приемане с реален акаунт.
- Незавършеното остава в HANDOFF със статус, пречка, следващо действие и критерий
  за приемане. При подновяване предложи най-важната незавършена стъпка без
  подсещане; не разширявай разрешенията за хардуер и мрежа.

- Start every task by reading this file, `CODEX_STATE.md`, relevant docs and
  `git status`; the repository is authoritative over remembered conversation.
- Preserve unrelated user changes and use small, logical commits.
- Update `CODEX_STATE.md` after meaningful milestones with completed work,
  remaining work, tests, known issues and the exact next action.
- Whenever incomplete work needs a `HANDOFF.md`, identify the repository
  directly below its title as `Repository / GitHub: <owner>/<repository>`.
  This is mandatory so a handoff is never ambiguous across GrideX repos.
- Keep architecture diagrams and core documentation in English and Bulgarian.
- Before a commit inspect `git diff` and `git status` for accidental secrets.
