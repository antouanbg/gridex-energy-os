# Current task

## Global admin invitation implementation / Покана от глобален администратор — 2026-09-24

BG: Подготвена е формата в одобреното `/customers/users/` и приемането в
Профил с избор на отделен realm в URL. `gridex` остава пилотният realm и
глобалният администратор не се премества. Chromium тестовете са 41/41
(включително три fixture теста за покани);
реално изпращане/вход и публикуване не са потвърдени. Backend setup е opt-in
и изисква отделен master client, SMTP, миграция 012 и owner subject.

EN: The approved submenu now stages a first-admin invitation form and Profile
acceptance with an explicit realm URL. The platform admin remains in pilot
`gridex`. Chromium checks are 41/41 (including three mocked invitation
checks), but real delivery/sign-in and
publication are unverified. Backend activation is opt-in and requires a
dedicated master client, SMTP, migration 012 and verified owner subject.

## Mandatory menu documentation / Задължителна документация за меню — 2026-09-24

BG: Собственикът изисква всяка промяна на меню/подменю да върви с BG/EN
потребителско ръководство и записано решение в HANDOFF, в същия клон.
Правилото е в AGENTS.md; чернова за „Потребители и покани“ е в
`docs/USERS_AND_INVITATIONS_GUIDE.md`. При публикуване остава да се свърже
от помощта в портала и да се валидира спрямо реалния UI/API.

EN: Every menu/submenu change requires a same-change BG/EN user guide and
HANDOFF decision. The staged invitation menu has a draft guide; portal-help
linking and live UI/API validation remain for publication.

## Owner realm decision / Решение за realm — 2026-09-24

BG: ВСЯКА нова клиентска организация има отделен OpenRemote realm; `gridex`
остава пилотен. Без промяна без изрично одобрение. Глобалната покана и
multi-realm входът още не са реализирани.

EN: Each new customer organisation gets its own OpenRemote realm. `gridex` is
the pilot only. Do not change this without explicit owner approval. Global
invitation and multi-realm login remain outstanding.

## Invitations / Покани — 2026-09-24

BG: Подготвено е изрично одобреното подменю „Клиенти и договори → Потребители
и покани“ (`/customers/users/`) за администратори на организация. Поканата
избира роля и разрешени Обекти; приемането остава в Профил. Build и 2 fixture
Playwright теста минават. НЕ е публикувано; не е тествано с реален акаунт.
Поканата за първи администратор на нова организация още няма работещ поток;
чака реализацията на отделен OpenRemote realm и backend API.

EN: Approved invitation submenu and member role/Site selection are staged;
build and two mocked browser tests pass. Not published or owner-tested. The
global new-organisation invitation needs per-realm provisioning and backend API.

Next: implement the approved per-organisation realm model and prove the global workflow,
then real-session/mobile acceptance and publication. Do not treat mocked tests
as a production result.

## Profile help and documentation coverage / Помощ и документация — 2026-09-24

Owner requested polished Profile, contextual explanations and a Documentation
entry inside the account button. Initial first-party guide: `/help/`.
Complete documentation for each existing menu/submenu is tracked in
`docs/USER_DOCUMENTATION_PLAN.md`; external docs domain is not live. Preserve
main navigation. Do not report visual/browser acceptance without testing.

Собственикът поиска подобрен Профил, обяснения и „Документация“ в бутона на
профила. Първо ръководство: `/help/`. Покритието на всяко съществуващо
меню/подменю е задача в `docs/USER_DOCUMENTATION_PLAN.md`; външният домейн
още не е активен. Пази главното меню и не обявявай визуално приемане без тест.

## Devices heartbeat warning / Предупреждение за устройства — 2026-09-24

EN update: Added one persistent future ALL-event email opt-in checkbox to the
authenticated Profile, off by default and absent from demo. Only heartbeat
outages are wired today; future producers must honor the same consent. Backend
PR #33 is merged/deployed; frontend PR #45 merged and Pages deployment passed.
Real owner-browser opt-in remains unverified.

BG обновяване: Добавен е постоянен checkbox в удостоверения Профил за ВСИЧКИ
бъдещи видове събития, изключен по подразбиране и скрит в демото. Засега
реално е свързан само heartbeat; бъдещите източници трябва да ползват същото
съгласие. Backend PR #33 е слят/внедрен, frontend PR #45 е слят и Pages е
публикуван. Реалната проверка с вход на собственика остава.

EN: Existing Devices navigation item now shows an offline heartbeat badge
only in authenticated live mode. Published through PR #45; not yet
real-owner/mobile accepted. Next: verify live account + phone.

BG: Съществуващото меню „Устройства“ вече показва знак за offline heartbeat
само в удостоверен реален режим. Публикувано през PR #45; приемането от
реалния собственик/телефон остава. Следва live проверка.

## CPU temperature data available / Има данни за CPU температура — 2026-09-24

Supersedes CPU-pending status below. Physical ROCK CPU data are fresh in
OpenRemote TimescaleDB and readable through the datapoint API (21/hour,
latest 52.083 °C at check). Published Devices UI can render the sixth metric;
real owner-browser visual acceptance remains unverified. See HANDOFF.

Заменя по-стария CPU-pending статус. Реални ROCK CPU данни са пресни в
OpenRemote TimescaleDB и се четат през datapoint API (21/час, последно
52.083 °C при проверката). Публикуваният екран „Устройства“ може да покаже
шестия показател; реалната owner browser проверка остава непотвърдена.

## ROCK telemetry frontend / ROCK телеметрия на сайта — 2026-09-24

Publication verified: PR #42 CI passed (36 browser tests), merged as
`085076190eec05f8dad04638aea5ab8dd3c85b55`; Pages run `35923639360`
succeeded and public release.json matched that commit. Physical backend
Timescale counts reached 56 each for five ROCK metrics. Authenticated owner
Devices acceptance and CPU temperature remain open, not implied by deployment.

Публикацията е проверена: PR #42 CI мина (36 browser теста), merge commit
`085076190eec05f8dad04638aea5ab8dd3c85b55`; Pages run `35923639360`
успя и публичният release.json съвпадна. В Timescale има по 56 реални записа
за пет ROCK показателя. Реалният owner екран „Устройства“ и CPU температурата
остават непотвърдени от самата публикация.

Backend Timescale receives five physical ROCK metrics. Devices UI code for
authenticated Site-scoped history was published through PR #42. Local builds,
lint and tests pass, including populated/empty/denied/unavailable API fixture
coverage. Public Pages release is verified above; real owner browser acceptance
remains separate. CPU temperature is missing. See newest HANDOFF entry.

Timescale получава пет реални ROCK показателя. Кодът на „Устройства“ за
автентикирана история по Обект е публикуван през PR #42. Локални build/lint/
тестове минават, включително сценарии с налични, празни, отказани и недостъпни
данни. Публичната Pages версия е проверена по-горе; реалният собственически
browser тест остава отделен. CPU температура липсва.

## Publication gate / Публикационен блокер — 2026-09-20

Backend a58aebf is pushed in PR #32 and deployed (381dee9a89bb); existing frontend
already receives OR-backed /sites and /hardware without requiring a new bundle.
Frontend 38295b4 is pushed in PR #40. Pages run 35535292127 built successfully
but environment protection REJECTED deployment from feat/routes-session-restoration.
No protection settings changed; no merge performed. New frontend validation/error
messages are NOT public yet. Need owner merge approval for PR #40, then verify
main Pages deployment and public revision. Real owner browser acceptance pending.

Backend a58aebf е в PR #32 и е внедрен (381dee9a89bb); текущият frontend вече
получава OR данни от /sites и /hardware и без нов bundle.
Frontend 38295b4 е в PR #40. Pages run 35535292127 build мина, но environment
защитата ОТКАЗА deployment от feat/routes-session-restoration. Защитата не е
променяна; няма merge. Новите frontend проверки/съобщения още НЕ са публични.
Нужно е owner одобрение за merge на PR #40, после проверка на main Pages
deployment и публичната ревизия. Реалното owner browser приемане предстои.


## OpenRemote-backed frontend inventory / Инвентар за frontend от OpenRemote — 2026-09-20

API DEPLOYED image 381dee9a89bb, private rollback api-inventory-8YeBtP.
GET /sites intersects current GrideX membership with OR user-linked Site assets;
names come from OR. GET /hardware verifies Site/gateway bindings, realm, parent
hierarchy and user-linked assets on every request; gateway name/model/role come
from OR. Local port/configuration data remain execution settings only.
No OR response -> 503; incomplete binding/ownership -> 409; no local-only fallback.
Existing heartbeat transport and configuration editing are unchanged.
Actual owner membership/OR data handler probe returns one accessible pilot and
two verified gateways. Identity was injected into an isolated local handler:
this is NOT a real owner browser/JWT login. No customer data published.
Frontend requires inventorySource=openremote; unavailable/unprovisioned states
hide stale inventory while preserving the session. No menu/layout changes.
Tests: 48 API, 22 frontend unit/render, 4 browser fixture flows PASS. Includes
deep link/refresh/expiry, ownership, no-battery BG/EN, inventory outage/recovery.
Lint has zero errors (two pre-existing image warnings); Pages/RSC builds pass.
Local master auth gate passes; forced-local trusted TLS public issuer/master
denial pass. Normal-DNS external ingress probes from Mac time out; external
owner browser login/expiry and physical temperature remain NOT verified.
Frontend publication result will be recorded after Pages deployment; backend
runtime already serves the compatible OR inventory contract to existing clients.
Next: owner browser acceptance, then generic provisioning/import/update guards;
do not treat this read integration as completion of all legacy write-path debt.

API е ВНЕДРЕН: 381dee9a89bb; частен rollback api-inventory-8YeBtP.
GET /sites пресича текущото GrideX членство с OR Site assets, свързани към
потребителя; имената идват от OR. GET /hardware проверява Site/gateway bindings,
realm, родителите и потребителските връзки при всяка заявка; имена/модели/роли
идват от OR. Локалните портове/конфигурация са само изпълними настройки.
OR отказ -> 503; непълен binding/собственост -> 409; без local-only fallback.
Heartbeat транспортът и редакцията на конфигурации са непроменени.
Пробата с реалните членство/OR данни връща пилотния Обект и два проверени шлюза.
Идентичността е подадена в изолиран локален handler — НЕ е реален owner browser/
JWT вход. Няма публикувани клиентски данни.
Frontend изисква inventorySource=openremote; при отказ/непровизиран ресурс
скрива стария инвентар, без да прекратява сесията. Без промени в меню/оформление.
Минават: 48 API, 22 frontend unit/render и 4 browser fixture сценария, включително
deep link/refresh/expiry, права, BG/EN без батерия и OR отказ/възстановяване.
Lint е без грешки (две стари image предупреждения); Pages/RSC build минава.
Local master auth проверките минават; forced-local trusted TLS public issuer и
забраната за master минават. Normal-DNS ingress от Mac е timeout; външен owner
browser вход/expiry и физическа температура НЕ са потвърдени.
Frontend публикацията ще се запише след Pages deployment; backend вече обслужва
съвместимия OR inventory договор и за текущите клиенти.
Следва owner browser приемане, после общи provisioning/import/update защити.
Това read интегриране не приключва дълга по старите write пътища.


## Pilot inventory reconciled / Пилотен инвентар съгласуван — 2026-09-20

DEPLOYED via supported OpenRemote APIs: pilot Site -> ROCK -> ESP, with the
existing temperature asset reparented under ROCK (same ID/history writer).
All four assets have verified owner links. Owner lacked OR read:assets: granted
that role with restricted_user, NOT unrestricted asset/admin writes. Existing
GrideX administrator membership unchanged. New tokens may be needed to see roles.
Site binding and two gateway bindings are projections of verified OR resources
(migration 009), not independently provisioned inventory. No physical activation,
Ethernet, certificates, MQTT configuration or BESS control changes.
Private backups: inventory-or-XXk1AE before asset creation; inventory-or-ypRcM2
before owner role assignment. Both database dumps passed pg_restore --list;
OR/owner snapshots are private. Final read-back: inventory-or-dHQvbb.
A partial SQL audit failure was corrected; retry reused the same OR IDs.
Eight verification tests + 37 API regression tests PASS; live snapshot validates
hierarchy, owner links, bindings and history writer restricted to its one asset.
Sandbox HTTP tests initially failed EPERM; approved local-port rerun passed.
NOT claimed: owner browser acceptance, physical temperature receipt, or generic
UI/import provisioning enforcement. Those remain pending under the canonical
backend plan. Do not resume local-only bootstrap scripts. Documentation rules
published in backend PR #32, frontend PR #40 and edge PR #20; not merged here.

ВНЕДРЕНО през OpenRemote API: пилотен Обект -> ROCK -> ESP; съществуващият
температурен asset е преместен под ROCK със същия ID/history writer.
Проверени са връзките на четирите assets към собственика. Липсващото OR
read:assets право е добавено с restricted_user, БЕЗ неограничени asset/admin
записи. GrideX администраторското членство е запазено. За новите роли може да
е нужен нов token. Site binding и двата gateway bindings (миграция 009) са
проекции на потвърдени OR ресурси, не отделно провизиран инвентар.
Без физическо активиране, Ethernet, сертификати, MQTT настройки или BESS промени.
Частни backups: inventory-or-XXk1AE преди assets и inventory-or-ypRcM2 преди
owner ролите; двата database dump-а са проверени с pg_restore --list.
OR/owner snapshots са частни; последна проверка inventory-or-dHQvbb.
Поправен е частичен SQL audit отказ; повторението използва същите OR IDs.
8 verification + 37 API regression теста МИНАВАТ; реалният snapshot потвърждава
йерархия, owner links, bindings и writer само до неговия температурен asset.
Първият HTTP тест е блокиран от sandbox EPERM; разрешеното повторение минава.
НЕ са потвърдени: owner browser приемане, физическа температура и универсална
UI/import защита. Те остават задачи по backend плана. Без local-only bootstrap.
Правилата са публикувани в backend PR #32, frontend PR #40 и edge PR #20;
тук не са merge-вани.


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


2026-09-20: I18N-01 and consolidated remaining tasks recorded in
docs/CURRENT_BACKLOG.md. Planning only; ten-language implementation not started.
2026-09-20: I18N-01 и оставащите задачи са в docs/CURRENT_BACKLOG.md.
Само планиране; реализацията на десет езика не е започната.

2026-09-20: owner accepted mobile swipe. Removed repeated heading Demo badge
and demo overview switch; restored visible mobile banner Sign in. Eight BG/EN
CTA tests + 22 unit/render pass; publication evidence in PR, owner check remains.
2026-09-20: плъзгането е прието. Махнати горен Демо етикет и демо превключвател;
Вход в банера е видим на телефон. 8 BG/EN + 22 unit/render теста минават.

2026-09-20: owner-approved three-tile mobile swipe rail implemented for all
existing sections, fixed Menu and automatic active-route visibility. Touch tests
at 360/390/430; physical phone acceptance remains. See HANDOFF/implementation PR.
2026-09-20: одобрена мобилна лента с три видими раздела и плъзгане между всички,
фиксирано Меню и показване на активния раздел. Остава приемане на реален телефон.

2026-09-20: approved submenu hierarchy and breadcrumb implemented, desktop +
expanded phone. Menu structure and session logic unchanged. New 390/1280 visual
and navigation tests; publication evidence in PR. Owner acceptance remains.
2026-09-20: одобреният дизайн на подменюта и пълен път е реализиран за desktop
и телефон. Структурата/сесиите са непроменени; тестове 390/1280 px, приемане предстои.

2026-09-20: session audit hardening: cross-tab logout/private-state cleanup,
bounded refresh, periodic/resume identity and Site checks, role remount,
restart-on-retry handling. See newest HANDOFF for evidence/remaining gates.
2026-09-20: session audit: logout между табове/изчистване на частно състояние,
ограничено refresh изчакване, периодична/resume identity/Обект проверка,
role remount и restart-after-retry. Доказателства/оставащи проверки в HANDOFF.

2026-09-20: separate public Demo implemented, anonymous Home enters `/demo/`;
remembered sessions/callbacks stay live. 21 browser + 21 unit/render pass;
publication verification and owner acceptance tracked in newest HANDOFF.
2026-09-20: отделното публично Демо е реализирано, анонимно Начало влиза в
`/demo/`; запомнени сесии/callback остават live. 21 browser + 21 unit/render
минават; публикацията/owner приемането са в последния HANDOFF.

2026-09-20: complete approved menu/URL tree recorded in HANDOFF. Owner retains
Demo as separate `/demo/*`, hyperlinks + demo data, isolated from live sessions
and writes. Documentation only; implementation/acceptance is the next task.
2026-09-20: пълната одобрена меню/URL схема е записана в HANDOFF. Демо остава
отделно `/demo/*`, с линкове и демо данни, изолирано от live сесии/записи.
Само документация; следва реализация и приемателни проверки.

2026-09-20: Remember Me 365 days now owner-approved/APPLIED; API restart gate
deployed healthy. Routes/session frontend already live. Only follow-up docs
pending main publication; owner browser acceptance and normal-DNS auth remain
open, see HANDOFF. Older blocked notes below are historical.
2026-09-20: Remember Me 365 дни е одобрен/ПРИЛОЖЕН; API restart gate внедрен
healthy. Frontend URL/SSO вече live. Следва main публикация на документацията;
owner browser приемането и normal-DNS auth остават отворени. По-старите blocked
бележки по-долу са исторически; виж HANDOFF.

2026-09-20 LIVE: PR #32, release 1f24bad published; section HTTP 200 verified.
Refresh SSO tested with fixtures. Remember Me 365-day activation blocked before
execution pending explicit duration approval; backend restart gate not deployed.
2026-09-20 LIVE: PR #32, release 1f24bad е публикуван; section HTTP 200 проверен.
Refresh SSO е тестван с fixtures. 365-day Remember Me е спрян преди изпълнение
до изрично одобрение на срока; backend restart gate не е внедрен.

2026-09-20: approved URL navigation/session restoration implemented, not deployed.
See newest HANDOFF for tests, Pages 404-shell caveat and real-account gates.
2026-09-20: одобрени URL/SSO промени са реализирани, още не внедрени.
Последният HANDOFF описва тестове, Pages 404 shell и real-account проверки.

2026-09-20: Fix misleading static imported-device connectivity text by sharing
the live heartbeat status. Real MQTT receipt reconfirmed; temperature remains
unimplemented. Tests/publication/owner acceptance tracked in HANDOFF.
2026-09-20: Статичният статус във внесените устройства е заменен със споделения
heartbeat статус. Реален MQTT receipt е потвърден; температурата предстои.
Проверките/публикацията/приемането са в HANDOFF.

2026-09-19: per-Site private WireGuard and direct MQTT-mTLS explicitly approved.
Execution plan recorded in backend docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md;
12 TODO items, documentation-only publication, no live activation. See HANDOFF.

2026-09-19: изрично одобрени WireGuard-private и direct MQTT-mTLS по Обект.
Планът е в backend docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md; 12 TODO задачи,
само документална публикация, без live активиране. Виж HANDOFF.

Latest: feat/device-heartbeat prepares separate ROCK backend receipt / ESP
successful-contact display in Devices. Three API tests and both builds pass.
Not published: backend/physical delivery and owner browser acceptance pending.

Последно: feat/device-heartbeat подготвя отделни ROCK backend receipt / ESP
успешен контакт в Устройства. 3 API теста и двата build-а минават. Не е
публикувано: backend/реална доставка и owner browser приемане предстоят.
SRS point-by-point acceptance plan added: 33 mapped items, evidence baseline
across frontend/backend/edge, gaps, G0–G7 gates and acceptance-record template.
See docs/integration/SRS_VERIFIABLE_PLAN.md and latest HANDOFF. Review only;
uncommitted backend activation remains WIP. Next G0 reconciliation, then G1
read-only live telemetry acceptance. No runtime or hardware actions.

Добавен проверим SRS план: 33 позиции, доказателства от трите хранилища,
липси, етапи G0–G7 и шаблон за приемане. Виж плана и последния HANDOFF.
Само преглед; backend активацията е непубликуван WIP. Следва G0 съгласуване,
после G1 приемане на read-only телеметрия. Без runtime/хардуерни действия.

DOC-01 expanded with the owner-selected Eniris reference: inspected nested docs
navigation and article patterns, mapped to a bilingual GrideX hierarchy and
verification-first article template in HANDOFF. Planning only; no product menu,
runtime or DNS changes, no copied vendor content or claimed DSO compatibility.

DOC-01 е допълнена с избрания пример Eniris: прегледана структура и навигация,
адаптирани в двуезично дърво и шаблон с проверими резултати в HANDOFF. Само план;
без промени в продуктовото меню/runtime/DNS, копирано съдържание или заявена DSO поддръжка.

Documentation backlog DOC-01 recorded in HANDOFF: proposed Docusaurus portal
at owner-requested doc.gridex.tech, separate Git/Pages deployment, matching
EN/BG guides and strict public/private content separation. Planning only;
platform/repository approval and implementation pending. No runtime/UI changes.

Задача DOC-01 е записана в HANDOFF: предложение за Docusaurus на поисканото
doc.gridex.tech, отделен Git/Pages сайт, EN/BG ръководства и разделяне на публично
и частно съдържание. Само план; изборът и реализацията чакат одобрение.
Без runtime/UI промени.

Owner correction: no upper-right controls; sidebar language below direct login;
site selection in Sites; short unchanged menu titles. Anonymous demo immediate,
bounded callback/API wait, retryable failed init, no blocking profile fetch.
Latest HANDOFF supersedes earlier menu-label instructions. Real-owner acceptance
still required; do not infer it from browser fixtures.

Корекция: без горни десни контроли; език под директния вход в менюто; обект от
„Обекти“; кратки имена без добавки. Демо веднага за анонимен посетител, ограничено
callback/API чакане, повторим вход без блокираща profile заявка. Последният
HANDOFF отменя предходните указания за етикети. Реалното приемане предстои.

Signed-in/no-demo follow-up: fail-closed UI during session checks/API errors;
unfinished menus marked Setup & data; no fabricated profile history, site name
or zero power/balance. See latest HANDOFF. Prior PR #25 is deployed (b308b75).

След вход без демо: защитен екран при проверка/API грешка; несвързаните менюта
са означени „Настройка и данни“. Без измислена история, име на обект или нулева
мощност/баланс. Виж HANDOFF. Предходният PR #25 е публикуван (b308b75).

Owner approved PR #25 deployment. Four optional pre-login translation suggestions
(FR/ES/DE/IT) implemented using browser language, with persistent dismissal and
BG/EN preference. No GeoIP or external translation requests; native dictionaries
remain backlog. See latest HANDOFF and PR deployment evidence for final status.

Собственикът одобри публикация на PR #25. Предложения преди вход за FR/ES/DE/IT
според браузъра, запазен отказ и BG/EN избор. Без GeoIP/външни заявки за превод;
пълните речници остават задача. Актуалният статус е в HANDOFF и PR доказателствата.

Header cleanup and one-click OIDC sign-in added to PR #25. LIVE context now in
Devices; About holds GitHub links; global role/unused period removed. Tests pass,
publication and real-owner acceptance pending. Public route from Mac still fails.

Изчистена лента и директен OIDC вход към PR #25. LIVE е в Устройства; GitHub е
в За нас; обща роля/неработещ период са премахнати. Тестовете минават; чакат
публикация и реално приемане. Публичният маршрут от Mac още не работи.

Owner-requested removal of Edge gateway navigation and static online card:
Devices is the only device-management menu entry on desktop and phone.
Included in PR #25; no device/API data deleted. Publication pending.

По искане на собственика Edge шлюз и статичната online карта са премахнати.
Устройства е единственият device-management вход на компютър и телефон.
Към PR #25; без изтрити устройства/API данни. Публикацията предстои.

Provisioning visual alignment with existing GrideX design: desktop scoped CSS
only, no behavior changes. Mobile owner approval and publication pending;
see latest HANDOFF for tests and remaining work.

Визуално уеднаквяване на provisioning с GrideX: само desktop CSS, без промени
в поведението. Чакат мобилно одобрение и публикация; тестове/остатък в HANDOFF.

2026-09-19: imported-device visibility follow-up. Real DB confirms two gateways
and two matching imported IDs, with one administrator membership. Devices shows
the imported pair before selection; unfinished modules link directly to Devices.
No runtime/backend/hardware change. Build and 20 Node tests pass; browser and
publication result recorded in HANDOFF. Real owner-session acceptance and
heartbeat are still distinct unfinished tasks, not implied by the imported data.

2026-09-19: видимост на внесената двойка. Реалната база потвърди два шлюза,
два съвпадащи внесени ID и една администраторска принадлежност. Устройства показва
двойката преди избор; незавършените раздели водят директно към Устройства.
Без runtime/backend/хардуерни промени. Build и 20 Node теста минават; browser и
публикация са в HANDOFF. Реално приемане с акаунта и heartbeat остават отделни
незавършени задачи; импортът не ги доказва.

Live Site navigation and transient-refresh logout bug fixed on
`fix/live-sites-navigation`. See latest HANDOFF for tests and network caveat.
Device activation is paused until the user-visible login/navigation repair is
published and accepted. No new device jobs/migrations deployed.

Поправени реална навигация към Обекти и погрешно отписване при временен refresh
отказ в `fix/live-sites-navigation`. Тестове и network ограничение: HANDOFF.
Активирането на устройства е на пауза до публикация и приемане на поправката.
Няма внедрени нови device задачи/миграции.

Existing test configuration imported for both registered devices. Original source
encrypted outside PostgreSQL; safe import metadata shown in Devices without
repeat provisioning. Backend migration 005 applied and API healthy. PR #22
publishes this UI; see HANDOFF. Live telemetry and authenticated UI acceptance
remain unverified; no hardware writes performed.

Съществуващата тестова конфигурация е импортирана за двете устройства. Оригиналът
е криптиран извън PostgreSQL; безопасните метаданни се показват в Устройства без
повторно настройване. Миграция 005 е приложена и API е здрав. PR #22 публикува
екрана; виж HANDOFF. Живата телеметрия и приемането на екрана с реален вход
остават непроверени; няма записи към хардуера.

Device setup: selection → max two roles/peers → provisioning moved to Devices.
Admin-only versioned backend draft; no hardware activation. See latest HANDOFF.

Настройки: избор → до две роли/партньори → provisioning в Устройства.
Admin-only versioned backend чернова; без hardware активиране. Виж HANDOFF.

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

## Day-ahead strategy backlog / Задача за стратегия „ден напред“ — 2026-09-19

Recorded the owner requirement in both HANDOFF files: extend `price_arbitrage`
with frontend selection and backend net-profit optimization including cycle
wear, losses and fees. Planning only; no runtime or battery changes.
Next: agree cost units/versioned contract, implement and test in simulation.

Изискването е записано в двата HANDOFF файла: разширяване на `price_arbitrage`
с frontend избор и backend оптимизация на нетната печалба с износване,
загуби и такси. Само план, без runtime/батерийни промени.
Следва: единици за разходите/versioned договор, реализация и симулационни тестове.

## Device access protection / Защита на device достъпа

Implemented encrypted external vault, administrator-only API and write-only UI.
Backend deployed; frontend lint/build and 22 API tests pass. No real credential,
SSH or OTA operation performed. Browser publication/acceptance, master-key
backup/rotation, telemetry worker and OTA approval execution remain pending.
Full frontend tsc has existing unrelated errors; see HANDOFF.

Реализирани криптиран външен vault, admin-only API и write-only UI. Backend е
внедрен; frontend lint/build и 22 API теста минават. Няма реален credential,
SSH/OTA операция. Остават browser публикация/приемане, master-key backup/rotation,
telemetry worker и изпълнение на OTA одобрения. Пълният tsc има стари несвързани
грешки; виж HANDOFF.

## Test pair registration / Регистрация на тестовата двойка — 2026-09-19

Owner-authorized local test inventory now contains a commissioning Site and
two draft gateways (ROCK Pi E, ESP32 lab), assigned via organization admin.
Idempotent repeat verified. Sanitized demo example prepared; frontend lint/build
pass (two existing image warnings). No actual telemetry or device writes enabled.
See HANDOFF for remaining live integration and publication.

Одобреният локален тестов inventory съдържа commissioning Обект и два draft
gateway записа (ROCK Pi E, ESP32 lab) към администратора на организацията.
Повторният старт е проверен без дублиране. Обезличеният демо пример е подготвен;
frontend lint/build минават с две стари image предупреждения. Няма включени
реална телеметрия или device writes. Остатъчните стъпки са в HANDOFF.

## Login retry fix / Поправка на повторния вход — 2026-09-18

Removed hidden SSO initialization, enabled retry after auth errors, separated
unknown API state from identity errors, and fixed missing online transition after
authenticated `/me`. Lint/build and explicit-login Chromium regression pass.
Next: publish and verify real public user login; no full login claim yet.

Премахната е скритата SSO инициализация, разрешен е повторен вход след auth
грешка, неизвестният API статус е отделен от identity грешките и е поправен
липсващият online преход след удостоверен `/me`. Lint/build и Chromium regression
за изричен вход минават. Следва публикуване и реален public user login тест;
пълен вход още не е доказан.

## Public OIDC runtime readiness / Публична OIDC runtime готовност — 2026-09-18

Updated public OIDC defaults to `auth.gridex.tech` and removed the unauthenticated
`/health` preflight that blocked the login button behind the restricted proxy.
`npm run lint`, `npm run build:pages` and 11 Node tests pass; lint retains only
two existing image warnings. No mobile UI/design change. Backend public issuer
is verified, and exact Keycloak callbacks are configured and verified.
Real ordinary-user browser login and
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
