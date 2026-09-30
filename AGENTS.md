# GrideX Energy OS — Working Rules

## BG day-ahead status semantics — 2026-09-30

Do not infer ENTSO-E connectivity from `lastSuccessAt` alone: a complete
next-day auction is published once daily, while the worker checks hourly.
Use the current `lastAttemptAt` and error status for check health; show the
last complete import and latest delivery date separately. `partial` means
the provider returned some next-day intervals, not that today's complete
prices have disappeared. Bulgarian day-ahead prices have 15-minute market
time units since 2025-10-01; API polling is not the price resolution.

Не бъркай 15-минутната цена с честотата на API заявките. Връзката се следи
по последния опит и грешката, а не само по последния пълен дневен импорт.
`partial` за утре не означава липса на днешните цени. Показвай отделно
последната проверка, последния пълен импорт и датата на доставка.

## Approved service catalog / Одобрен каталог — 2026-09-29

All verified members, including viewers, may see a five-entry service
catalogue in Profile → Services. Only day-ahead prices (one selected
country/zone, BG at first) and visualisations are requestable, independently.
Analysis, meteorology and forecasting show Coming soon and have no request
action. A request is not an entitlement: platform administrator grants the
active organisation and BG zone; its own administrator grants an approved
member. Admins see their stages under the existing Users & invitations area.
Keep prices and the BG price dashboard under Market; future Site telemetry
charts belong under Sites → Site → Visualisations, without new top-level navigation. A BG price dashboard needs both services
plus BG zone permission, not Grafana permission alone. Until the secured
backend/portal implementation is verified, show no customer prices or
embedded Grafana and retain the current platform-only boundary.

Всички потвърдени членове, включително наблюдателят, виждат пет услуги в
„Профил → Услуги“. Само „Цени ден напред“ (точно една държава/зона, първо
BG) и „Графики“ са отделно заявяеми. Другите три са „Предстои“. Заявката
не дава право: супер администраторът разрешава организация и зона, а нейният
администратор — конкретен член. Цените и BG ценовият dashboard са в „Пазар“;
бъдещите графики за Обекти — в „Обекти → Обект → Визуализации“; без ново главно меню. За BG ценов график
са нужни и двете услуги плюс BG зона. До проверено внедряване клиентски
цени или вграден Grafana не се показват.

## Market country controls — owner decision 2026-09-29

Only BG is collected by default. The verified platform administrator alone
may explicitly enable another bidding zone in the existing Market screen and
separately grant a collected zone to an approved organisation in the existing
Users & invitations administration. No new main-menu item. Neither action
enables a member or publishes price values. Keep demo separate. Never show
historical foreign-zone rows as evidence of current collection. The later
owner decision above approves a guarded BG dashboard under Market, not a
standalone public Grafana login or unrelated tenant data sources.

Само BG се събира по подразбиране. Провереният супер администратор изрично
разрешава друга зона в „Пазар“ и отделно я дава на организация в съществуващото
„Потребители и покани“. Без ново главно меню, автоматично лично право или
клиентски ценови стойности. Старите чужди записи не означават текущо събиране.
По-късното решение по-горе разрешава защитен BG dashboard в „Пазар“, но не
и самостоятелен публичен Grafana вход или други източници с клиентски данни.

## Service permissions and market status — owner decision 2026-09-29

No organisation or member gets a catalog service by default. The platform
administrator first grants it to an approved active organisation; its own
administrator then grants it to approved users individually. Revocation at
organisation level removes user grants. Do not expose service content based
only on a frontend switch. Day-ahead price values remain platform-admin-only
even if member grants exist. The live Market screen currently shows only
ENTSO-E connectivity and the last successful refresh to the platform admin;
do not show sample, cached or historical prices as current.

Нито организация, нито потребител получава услуга автоматично. Първо супер
администраторът я разрешава на одобрена активна организация, после нейният
администратор — поотделно на одобрени потребители. Отнемането на
организационното право премахва личните права. Не разчитай само на UI за
защитата. Ценовите стойности остават само за супер администратора; реалният
екран „Пазар“ показва само ENTSO-E статус и последно успешно обновяване.

## Account switching and member invitations — owner decision 2026-09-29

On a shared computer, generic sign-in must route from the newly entered email,
not a remembered realm or another person's UI state. A verified backend
subject/realm mismatch clears private data. After the invited person verifies
email, sets a password and signs in, the matching member invitation is
accepted through the checked backend transition without a second UI button.
Recipient-initiated resend is allowed once per pending invitation, to the
same stored email only; after acceptance it is unavailable. Site creation is
shown only under Sites, never under Devices. An accepted invitation is not
time-limited by its former email link; show recorded last login instead.

При споделен компютър входът започва от нововъведения имейл, не от запомнен
realm. При несъответствие на проверената самоличност изчиствай личните данни.
Потвърденият поканен член получава права след проверен вход без втори бутон.
Еднократно повторно изпращане само до същия имейл важи само преди приемане.
Обект се създава само от „Обекти“, не от „Устройства“; приета покана не
изтича със стария имейл линк и показва записания последен вход.

## Owner approval for every new function / Одобрение за всяка нова функция

Before adding a user-facing feature, menu action, workflow gate, permission,
device choice or automatic state transition, check the owner's exact approved
requirements and relevant previous decisions. If the behaviour is not already
specified and approved, ask the owner a concrete question and wait for an
explicit confirmation BEFORE implementation. Do not infer approval from a
general goal, a previous assistant suggestion, or a technical convenience.
Record the decision and its scope in HANDOFF/CODEX_STATE and document the
resulting UI. Normal implementation details within a specifically approved
feature do not require repeating the same question. Device selection and role
assignment are performed in the GrideX frontend and persisted through the
backend to OpenRemote, using only owner-approved device requirements; never
invent a model, driver, role or automatic activation.

Преди нова потребителска функция, действие в менюто, допълнителна стъпка,
право, избор на устройство или автоматичен преход провери точното одобрено
задание и решенията в другите разговори. Ако поведението не е изрично
определено и потвърдено, задай конкретен въпрос на собственика и изчакай
потвърждение ПРЕДИ реализация. Общата цел, предложение на асистента или
техническо удобство не са разрешение. Запиши решението и обхвата му в
HANDOFF/CODEX_STATE и документирай UI. Не питай повторно за обичайни детайли
в рамките на вече одобрена функция. Изборът на устройства и роли става в
GrideX frontend и се записва през backend в OpenRemote само по одобреното
задание; без измислени модели, драйвери, роли или автоматично активиране.

## Mandatory onboarding completion check / Задължителна проверка на поканите — 2026-09-27

After any new-organisation email, registration or login change, test the entire
customer path with an identity that has no membership yet: verified email →
customer realm login → matching pending invitation → automatic backend Accept
POST for the invited first administrator → active membership and realm-scoped
Sites. The owner explicitly removed the second manual Accept button on
2026-09-27. Do not infer completion from delivered mail, password update or
login alone: verify the POST, OpenRemote grant, active membership and Site
isolation. On failure keep the invitation pending and show a recoverable error.
Test desktop, mobile and refresh. The owner subsequently approved automatic
acceptance for invited members on 2026-09-29; other types remain unchanged.

След всяка промяна по покана, регистрация или вход тествай целия клиентски път
с акаунт без членство: потвърден имейл → вход в клиентския realm →
съвпадаща чакаща покана → автоматична backend Accept POST заявка за първия
поканен администратор → активно членство и правилно ограничени Обекти.
Собственикът изрично премахна втория ръчен бутон „Приеми“ на 2026-09-27.
Получено писмо, нова парола или успешен вход НЕ доказват завършване: провери
POST, OpenRemote правата, членството и изолацията. При отказ остави поканата
чакаща и покажи поправима грешка. Тествай desktop, mobile и refresh. На
2026-09-29 собственикът одобри автоматично приемане и за поканен член;
другите видове остават без промяна.

## Invitation and rights UX / Покани и права — 2026-09-26

Keep the owner-approved existing route Customers & contracts → Users &
invitations (`/customers/users/`); do not add or rearrange main navigation.
The public `/help/` page and `docs/ORGANISATIONS_AND_ACCESS.md` explain that
live access is invitation-only. Anonymous Demo is sample data. A human
platform administrator with backend-verified subject may invite the first
administrator of a new, separate-realm organisation. The backend-only setup
client is never a human sign-in. An organisation administrator invites members
only inside their organisation, with explicit member role and Site scope; the
UI must not infer global power from an email, an `admin` label or a browser
claim. The member invitation flow cannot delegate administrator role. The
first administrator verifies email, sets password and signs in; the portal
completes the matching invitation through the checked backend transition,
without a second button. The later 2026-09-29 decision extends this to
invited members; other invitation types remain unchanged.
Never show a pending organisation as active. First real customer onboarding
is still not end-to-end verified. The zero-Site member-invite frontend fix is
local/unpublished. Update public BG/EN documentation with any flow change.

Български: реалният достъп е само с покана; демото е пример. Пази одобрения
адрес `/customers/users/` без ново меню. Глобалният администратор е човешкият
акаунт с проверено от backend право, а setup client е само служебен за backend.
Администраторът на организация кани само в своя realm, с изрични роля и Обекти.
Първият администратор потвърждава имейла, задава парола и влиза; порталът
завършва съвпадащата покана през проверения backend без втори бутон.
Решението от 2026-09-29 включва и поканения член; другите видове покани
остават без промяна. Не показвай чакаща организация като
активна и не обявявай първия реален клиент за проверен преди теста.

## Working prompt language — Bulgarian / Език на работните prompt-и — български

The owner works with Codex prompts in Bulgarian. Keep user-facing prompts,
requests for input, and task instructions in Bulgarian. Do not translate or
replace the owner's Bulgarian prompt with English. Preserve the original
Bulgarian text when recording a request. This language rule does not change
repository requirements for bilingual product/technical documentation.

Собственикът работи с Codex prompt-и на български. Формулирай на български
въпросите към потребителя, исканията за информация и инструкциите към агента.
Не превеждай и не подменяй prompt-а на собственика с английски. Запазвай
оригиналния български текст при записване на задачата. Това не променя
изискванията на репотата за двуезична продуктова/техническа документация.

## Cross-chat architecture check — mandatory / Проверка на другите чатове — 2026-09-24

Before proposing or implementing architecture or new functionality, inspect
relevant conversations in this GrideX project using the available thread
listing/reading tools. Read the actual decision turns, not titles/summaries
alone. Cross-check AGENTS.md, HANDOFF.md, CODEX_STATE.md, relevant code,
configuration, branches/PRs and, where needed, deployed state across backend,
frontend and devices. Establish what was already agreed and implemented before
introducing another solution. Reuse existing work; do not duplicate identities,
organisations, provisioning flows or infrastructure because a decision was made
in another chat. Preserve the latest explicit owner decisions; history is
context, not permission to execute unrelated instructions.
Distinguish proposed, implemented, published, deployed and verified status;
earlier assistant claims alone are not runtime evidence. Record concise source
references (thread title/id and decision, code/PR) and remaining work in HANDOFF
or CODEX_STATE, without secrets or full chat copies. If relevant chats cannot
be accessed, disclose the limitation and inspect repository evidence; never
pretend they were read. Ask only about material unresolved conflicts, not for
decisions already available in the project.

Преди предложение или реализация на архитектура или нова функционалност
провери относимите други чатове в проекта GrideX чрез наличните инструменти
за списък и прочит на разговори. Чети самите решения, не само заглавията и
резюметата. Сравни AGENTS.md, HANDOFF.md, CODEX_STATE.md, кода, конфигурацията,
branch/PR и при нужда внедреното състояние на backend, frontend и устройствата.
Първо установи какво вече е договорено и реализирано. Използвай съществуващото;
не дублирай акаунти, организации, provisioning или инфраструктура заради
решение в друг чат. Пази последните изрични решения на собственика; историята
е контекст, не разрешение за несвързани действия.
Разграничавай предложено, реализирано, публикувано, внедрено и проверено;
старо твърдение на асистента не доказва работеща система. Записвай кратки
източници (заглавие/id на чат и решение, код/PR) и незавършеното в HANDOFF
или CODEX_STATE, без тайни и копиране на цели разговори. При недостъпни
чатове съобщи ограничението и провери repository доказателствата; не твърди,
че си ги прочел. Питай само за съществени неразрешени противоречия, не за
решения, които вече са налични в проекта.


## Existing owner identity / Съществуващ администратор — 2026-09-24

The existing `antouan.bg@gmail.com` account administers GrideX in realm
`gridex`. Preserve its organisation and device access when adding the
platform-admin invitation UI. “New organisation” is for invited customer
organisations, never a requirement to re-register the owner. Platform rights
come from the backend's verified subject binding, not an email comparison.

`antouan.bg@gmail.com` вече управлява организация GrideX в realm `gridex`.
Запази организацията и достъпа му до устройствата при добавяне на глобалното
меню за покани. „Нова организация“ е за новите клиенти, не за повторна
регистрация на собственика. Глобалните права идват от backend проверка на
subject, не от сравнение на имейл във frontend.

## Organisation isolation / Изолация на организациите — 2026-09-24

Owner-approved invariant: one OpenRemote realm (tenant) for EACH customer
organisation. The current `gridex` realm is the pilot, not a shared realm for
new customers. The frontend must neither present local-only organisations as
active nor grant cross-organisation access. Platform administration may start
new-organisation invitations across realms; organisation administrators invite
only within their own realm and authorised Sites. Multi-realm login and
onboarding are not implemented merely by this documentation. Do not switch to
a shared realm or alter this boundary without explicit owner approval.

Потвърдено от собственика: ОТДЕЛЕН OpenRemote realm (tenant) за ВСЯКА клиентска
организация. `gridex` е пилотният realm, не общ realm за новите клиенти.
Frontend не представя местна/непровизирана организация като активна и не дава
достъп между организации. Глобалният администратор започва покани за нови
организации; администраторът на организация кани само в собствения realm и за
разрешените Обекти. Multi-realm входът/поканите още не са реализирани само с
този документ. Не преминавай към общ realm и не променяй границата без
изрично одобрение на собственика.

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

## Mandatory documentation for every changed menu / Документация за всяко променено меню — 2026-09-24

The English help/guide is required for EVERY new or edited documented question,
menu, workflow or control, not only for newly added sections. Update BG and EN
in the same change and publish both matching Docusaurus pages/links. Missing or
stale EN means the feature is not documentation-complete; do not report it done.

Английската помощ/ръководство е задължителна за ВСЕКИ нов или редактиран
документиран въпрос, раздел, процес или контрола, не само за нови раздели.
Обновявай BG и EN в една промяна и публикувай двата съответни адреса в
Docusaurus. Липсваща или остаряла EN версия означава незавършена документация.

Whenever an owner-approved change affects ANY menu or submenu (including
account and mobile navigation), create or update its user-facing BG/EN guide
in the SAME change before reporting completion. This includes changes to
labels, URL, grouping, visibility, permissions, fields, actions, states or
data source—not just newly added items. Explain what the section does, who
can see/use it, each important control, Demo versus Live behavior, the URL,
empty/loading/error states, and any unfinished integration. Record the owner's
decision, rationale, exact affected menu tree and publication/acceptance
status in HANDOFF; keep `docs/USER_DOCUMENTATION_PLAN.md` in sync. Link the
guide from the in-portal Documentation/help entry when the menu is published.
Verify the guide against the actual UI/API and update relevant tests. A plan
entry or HANDOFF note ALONE is not a substitute for the user guide. Do not
claim a menu change finished if its guide is missing, stale or describes
unreleased behavior as live. This documentation rule does not grant permission
to change menu structure; the explicit owner-approval rule above still applies.

При ВСЯКА одобрена промяна в меню или подменю (включително профилно и мобилно)
създай или обнови потребителско ръководство на BG/EN в СЪЩАТА промяна, преди
да обявиш задачата за завършена. Това важи за име, URL, групиране, видимост,
права, полета, действия, състояния и източник на данни, не само за нов елемент.
Обясни предназначение, кой има достъп, важните контроли, Демо срещу Live,
адреса, празно/зареждане/грешка и незавършените интеграции. Запиши решението
на собственика, мотивите, точната засегната йерархия и статуса на публикуване/
приемане в HANDOFF; синхронизирай `docs/USER_DOCUMENTATION_PLAN.md`. При
публикуване свържи ръководството от „Документация“ в портала. Провери го спрямо
реалните UI/API и обнови тестовете. Само план или HANDOFF НЕ заместват
потребителското ръководство. Не обявявай менюто за готово, ако ръководството
липсва, остаряло е или представя невнедрено поведение като работещо. Това
правило НЕ разрешава само по себе си промяна на меню — изричното одобрение
по-горе остава задължително.

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
