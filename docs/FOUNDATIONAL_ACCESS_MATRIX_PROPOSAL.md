# Foundational access matrix — proposal / Основополагаща матрица — предложение

Historical proposal. Navigation is superseded by [the 2026-10-03 owner contract](NAVIGATION_CONTRACT_2026_10_03.md).
Историческо предложение. По-късният договор заменя навигацията; не внедрявай старите имена/групиране.

Status / Статус: DRAFT for owner review, 2026-10-02. No runtime changes.
This proposal does not supersede approved permissions until explicitly approved.
Layout implementation remains on hold. Source inspection is not live-account acceptance.

## Evidence / Източници

- Owner-selected potential-service source: `Suggestions/User_manual_smartelectrosystem.pdf`,
  especially sections 2–4 and 10–15, printed pages 5–77. It supplies candidate
  capabilities, NOT permission to activate services, adopt its fees, expose other
  customers, introduce supported hardware or copy its safety behaviour.
- `Suggestions/Gridex_SmartgridOne_Specification.docx`, sections 9–10: visibility,
  control, administration, and separate licensing. Its proposed sub-organisations
  and device licensing are reference material, not new GrideX authorisation.
- `sample_other_system/01В_Екранни_снимки_тестови_сесии/`: inspected
  `02_CRM/05_crm_plant.png`, `06_API_AppStore/19_appstore_install.png`, and
  `05_Notification/17_notif_rules.png`, plus manifest. These show resource context,
  separate service plans/statuses and inherited/personal settings. Screenshots do
  not establish that product's complete backend permission model.
- [SmartgridX user management](https://docs.eniris.com/en/Monitoring/Web%20portal/management/user-management):
  role membership, resource authority and page settings combine to derive access.
- [OpenRemote asset security](https://docs.openremote.io/docs/user-guide/identity-and-security/asset-security/):
  roles, asset links and attribute metadata constrain access. Parent links do not
  automatically confer child links. Check deployed-version behaviour during implementation.
- Current GrideX source: `app/page.tsx` navigation filters and `liveViews`,
  `app/lib/routes.ts`, `app/sections/organisation-members.tsx`; backend
  `auth.mjs`, `app.mjs`, `ACCESS_RIGHTS_MATRIX_DRAFT.md`.

## English — proposed contract

Effective access requires an active verified identity/membership, allowed role
action, authorised organisation/resource scope and, for an optional service,
organisation AND personal grants plus required country/zone. A market-only
service does not require a Site. A grant cannot activate an unfinished feature.
The API enforces every data/action request; the same evaluated policy supplies
the portal menu, direct-route guards and the member access explanation.

Existing roles remain: organisation administrator, viewer, operator, energy
manager and integrator. Platform administration is separate verified authority.
No automatic personal service grant for an organisation administrator. No new
commissioning menu: commissioning is an existing device/Site action.

| Existing section | Proposed visibility and scope | Proposed action boundary |
| --- | --- | --- |
| Overview | All authenticated members; authorised Sites only | Read; an empty account shows onboarding, no sample data |
| Customers & contracts → Users & invitations | Platform/organisation administrators | Platform: organisations and organisation service grants; org admin: own members, roles, Sites and personal service grants |
| Sites | All members; org admin sees own organisation, others explicit links | Only administrators create Sites; scoped members read |
| Energy assets | Assigned Site, feature released | Read for all scoped roles; only already supported role-authorised configuration |
| Battery | Assigned Site containing a battery, feature released | Read; approved controls only for operator/energy manager/admin |
| Flexible loads | Assigned Site containing supported loads, feature released | Same control boundary; no invented command |
| Market | Organisation + personal day-ahead service and approved zone; platform exception | Proposed customer day table independent of Grafana; full historical archive/platform analysis stays platform-only |
| Tariffs & settlement | Not released/fully specified | Hold from customer live menu pending separate scope; day-ahead grant must not unlock it |
| Balancing | Not released/fully specified | Same; no inferred balancing service approval |
| Logic & modes → Schedules | Assigned Site and strategy:read; feature released | Viewer reads; operator drafts/simulates; energy manager/admin activates; integrator has no strategy permission by default |
| Devices | Assigned Site | Read; administrator provisions approved hardware; integrator configuration only where endpoint and approved contract exist; commissioning admin-only |
| Supported devices | Read-only catalogue, when live implementation exists | Does not grant device creation/configuration |
| Alarms | Assigned Site, feature released | Read for scoped members; alarm-rule editing/acknowledgement requires separate specified action rights |
| Reports & economics | Feature not yet fully specified | Basic operational reports vs optional Analysis scope remains unresolved; hide unavailable live functionality |
| Settings | Administrator, energy manager; integrator only supported hardware settings | Scope each control by existing permission and Site; personal settings stay in Profile |
| Plans & subscription | Organisation/platform administrator when functional | Commercial administration only; no default member visibility |
| About, Profile, Help, enquiry | All members | Own profile/preferences; existing public content |
| Site → Visualisations (existing destination) | Graphs service at organisation and person + assigned Site + supported dashboard | Site datasource scoped server-side; market graphs additionally need day-ahead and zone |

Visibility recommendation: unavailable services remain discoverable in the
existing Profile → Services catalogue with Not approved / Request pending /
Coming soon. Working navigation contains authorised, released destinations.
Organisation admins additionally keep Sites and user administration when empty.
Site-specific sections follow the selected authorised Site's capabilities;
telemetry loss must not hide an already provisioned device or battery section.
No service/data request during unverified session state. Transient errors show
Checking/Unavailable, not fabricated denial or Demo data. Confirmed expiry keeps
the approved Demo-return flow. Revocation invalidates effective access and cached
private content; explicit logout is required before another account signs in.

Member table keeps five approved columns: Name/email, Role, Sites, Services,
Actions. Expanding a person shows effective read/write rights, existing menu
destinations and a reason per unavailable destination. Reasons distinguish
missing organisation grant, missing personal grant, no Site link, wrong role,
feature not released and verification unavailable. Draft edits are labelled
separately from saved/verified state. Mobile displays the same fields as a
stacked row with the same expansion. Ordinary users see only their own access.

Storage: reuse memberships, member/organisation service grants, market zones,
OpenRemote inventory and checked user-Asset links. Keep a versioned menu/action
policy and compute an effective per-user projection; do not create an independent
per-user inventory or manually editable menu grants. Audit source changes with
actor/time and policy revision. A computed menu cache is not an authority.

Approval choices: (1) authorised released destinations only in live navigation,
with all five services retained in the catalogue; (2) customer day-ahead table
with price permission alone, Grafana separately approved; (3) retain existing five
roles and defer unfinished settlement/balancing/report action policies rather
than granting them through prices or graphs. These are proposals, not approvals.

Acceptance after approval: all role/Site/service combinations, zero Sites,
administrator personal grants, service revocation, two organisations, direct
URLs/API denial, stale responses/account changes, unavailable prerequisites,
desktop/mobile and BG/EN. A permitted menu must lead to a usable authorised page.

## Български — предложен договор

Достъпът изисква активна проверена самоличност/членство, разрешено от ролята
действие, правилна организация и Обект, а за допълнителна услуга — едновременно
организационно и лично разрешение плюс съответната държава/зона. Самостоятелният
достъп до пазарни цени не изисква Обект. Право не активира незавършена функция.
Backend проверява всяка заявка; същата оценена политика определя менюто,
директните адреси и обяснението за достъпа на потребителя.

Пазим ролите администратор на организация, наблюдател, оператор, енергиен
мениджър и интегратор. Супер администрацията е отделно проверено право.
Администраторът на организация няма автоматично лично право за услуга.
Комисионирането е действие в Обект/Устройства, не нов раздел.

| Съществуващ раздел | Предложена видимост и обхват | Граница на действията |
| --- | --- | --- |
| Преглед | Всички влезли; само разрешени Обекти | Четене; празен акаунт показва необходимата настройка, не демо данни |
| Клиенти и договори → Потребители и покани | Супер/организационен админ | Супер: организации и организационни услуги; организационен: свои хора, роли, Обекти, лични услуги |
| Обекти | Всички; админът вижда организацията, другите — изричните връзки | Само администратори създават; останалите четат разрешеното |
| Енергийни активи | Разрешен Обект и внедрен екран | Четене; само вече поддържани и разрешени настройки |
| Батерия | Разрешен Обект с батерия и внедрен екран | Четене; одобрени команди само оператор/енергиен мениджър/админ |
| Управляеми товари | Разрешен Обект с поддържани товари и внедрен екран | Същата граница за управление; без нови команди |
| Пазар | Организационна и лична услуга Цени + зона; изключение за супер админа | Предложение: дневна таблица без задължителна Grafana; пълният архив/анализ остава за супер админ |
| Тарифи и сетълмент | Невнедрен/неуточнен обхват | Изчаква отделна спецификация; цените не го отключват |
| Балансиране | Невнедрен/неуточнен обхват | Същото; няма подразбиращо се одобрение за балансираща услуга |
| Логика и режими → Графици | Обект + право strategy:read + внедрен екран | Наблюдател чете; оператор подготвя/симулира; енергиен мениджър/админ активира; интегратор няма това право по подразбиране |
| Устройства | Разрешен Обект | Четене; админ провизира одобрения хардуер; интегратор настройва само при наличен одобрен API; пускане само админ |
| Поддържани устройства | Каталог за четене при реална наличност | Не дава право за добавяне/настройка |
| Аларми | Разрешен Обект и внедрен екран | Четене; редакция на правила/потвърждение на аларма изискват уточнени отделни права |
| Отчети и икономика | Неизяснен пълен обхват | Основни отчети спрямо допълнителен Анализ предстои да се уточни; недостъпната функция не е активна в живото меню |
| Настройки | Админ, енергиен мениджър; интегратор само хардуерната част | Всяко действие според текущо право/Обект; личните настройки остават в Профил |
| Планове и абонамент | Организационен/супер админ при налична функция | Търговска администрация, без видимост за обикновен член по подразбиране |
| За нас, Профил, Помощ, запитване | Всички | Собствен профил/предпочитания; текущо публично съдържание |
| Обект → Визуализации (съществуващ адрес) | Организационна и лична услуга Графики + Обект + поддържан dashboard | Източникът е ограничен от сървъра; ценовите графики изискват и Цени + зона |

Препоръка: в работното меню са разрешените и внедрени раздели. В текущия
каталог Профил → Услуги остават всичките пет услуги със статус Не е одобрена,
Заявена или Предстои. Админът запазва Обекти и управление на хора и при празна
организация. Контекстните раздели следват оборудването в избрания разрешен
Обект; отпаднала телеметрия не скрива съществуващото устройство/батерия.
При проверка на сесия няма частни заявки преди удостоверяване; временна грешка
се показва като Проверяваме/Недостъпно. Потвърдено изтичане връща одобреното
демо. Отнемане преоценява достъпа и изчиства частния кеш. Друг акаунт се ползва
след изричен изход.

Таблицата остава с одобрените пет колони: Име/имейл, Роля, Обекти, Услуги,
Действия. Разгънатият човек показва права за четене/промяна и реалните раздели
с причина за недостъпност: организационна услуга, лично право, Обект, роля,
невнедрена функция или непроверено състояние. Чернова на редакция се отличава
от записаното и потвърдено право. На мобилен полетата са вертикални със същото
разгъване. Обикновеният потребител вижда само собствения си достъп.

Съхранение: използваме съществуващите членства, организационни/лични услуги,
зони, OpenRemote инвентар и проверени връзки към Assets. Матрицата на
менюта/действия е версионирана; ефективният достъп е изчислен запис за човека,
без втори инвентар или независими ръчни права за менюта. Одитът пази кой,
кога и по коя версия е променил изходните разрешения. Кешът не дава права.

За одобрение: (1) само разрешени внедрени раздели в живото меню и петте услуги
в каталога; (2) дневни цени за клиента с право Цени, Grafana отделно;
(3) запазени роли и отложено уточняване на сетълмент/балансиране/отчети.
Това са предложения, не получени одобрения.

Приемане след одобрение: комбинации от роли/Обекти/услуги, нула Обекти,
лични услуги на админа, отнемане, две организации, директен URL/API,
закъснели отговори/друг акаунт, недостъпни предпоставки, desktop/mobile и BG/EN.
Разрешеното меню трябва да отваря действително работещ и разрешен екран.

## Potential service catalogue — English supplement, pending approval

The owner-selected PDF supersedes earlier reference material for identifying
potential services. Existing role permissions remain unchanged. Group capabilities
into services; do not turn every device setting or report into a separate service.
The following mapping proposes panels in EXISTING destinations, not new menu items.
“Approved catalogue” is not proof of a verified production implementation.

| Service/capability | Existing destination | Prerequisites beyond role | Status; PDF pages |
| --- | --- | --- | --- |
| Live monitoring, health, heartbeat, alarms | Overview, Devices, Alarms | Authorised Site and provisioned telemetry; email preference for notifications | Core capabilities, not a proposed extra subscription; 47–49, 73, 76–77 |
| Day-ahead prices | Market | Organisation + personal price grant; explicitly allowed country/zone; no Site required | Approved requestable catalogue; BG only initially; 29–32, 48 |
| Graphs and visualisations | Market for prices; Site → Visualisations for telemetry | Organisation + personal graph grant AND permission for the underlying data; price graph additionally needs prices/zone | Approved requestable catalogue; graph rendering is GrideX/Grafana choice, not PDF technology; 49–64 |
| Analysis: consumption, costs, savings, losses | Reports & economics | Analysis grant, authorised Sites, valid measurements and tariffs for financial results | Existing Coming soon service; 49–60, 64 |
| Meteorology | Overview, inside selected Site | Weather grant and Site location/provider integration | Existing Coming soon service; 65 |
| Forecasting: PV, consumption, import/export, prices, imbalance | Energy assets for PV; Logic & modes → Schedules for Site plans; Market for price forecasts | Forecast grant, appropriate model/data; weather for weather-based PV forecasts; prices only for price-dependent predictions | Existing Coming soon service; sub-capabilities require specification; 38, 62–65 |
| PV optimisation, including negative-price export control | Energy assets; Logic & modes → Schedules | Site, approved controllable inverter/driver, safety limits; price grant for price-based modes | New candidate; 36–39 |
| Battery optimisation | Battery; Logic & modes → Schedules | Site, supported BESS, SOC/limits and approved control; price grant only for market-based operation | New candidate; 39–45, 57–61 |
| Flexible-load optimisation | Flexible loads; Logic & modes → Schedules | Site, supported metering/control and limits; prices when price-driven | New candidate; 28–32, 64 |
| Hot-water/heating optimisation, including solar thermal | Flexible loads and Energy assets; Logic & modes → Schedules | Site, temperature/energy sensors, approved thermal controls and safety constraints | New candidate or configurable flexible-load capability; 18–27, 45–47, 61–64 |
| Smart EV charging | Flexible loads; Logic & modes → Schedules | Site, supported charger, connection capacity and safe control; applicable tariff | New candidate; 33–35, 56–57 |
| Balancing and trader schedules | Market → Balancing; Logic & modes → Schedules | Separate service grant, Site metering, commercial arrangement and approved trader/dispatch integration | New candidate, NOT unlocked by price grant; 14–18, 66–72 |
| Tariffs and settlement | Market → Tariffs & settlement | Separate service grant, applicable contract/tariffs, validated measurements | New candidate; configuration/financial action rights require approval; 7–13, 68–72 |
| Occupancy/reservation integration | Within relevant Site/load configuration | Approved external integration and dependent optimisation service; credentials backend-only | Optional integration candidate, not a main menu; 47 |

Payment processing, vendor commissions, public participant rankings, self-registration,
brand-specific hardware and behaviour after connection loss in the reference are
NOT adopted. Billing remains administrative; system health/alarms are cross-cutting.
Forecasts must be labelled separately from official published prices. No estimated
saving is a guaranteed result. Unknown/stale telemetry cannot enable unsafe control.

### Rights and presentation

Effective access = verified identity + active organisation + role action + authorised
resource scope + service prerequisites + released implementation. Site-independent
market data does not acquire an artificial Site prerequisite. A denied or unknown
predicate never grants access. Backend and UI use the same policy result.

| Existing role | Action boundary; all rows remain scoped |
| --- | --- |
| Viewer | Read granted data/services; request a service from own administrator; no resource creation or commands |
| Operator | Viewer plus approved operational commands and strategy draft/simulation; no service/role grants |
| Energy manager | Operator plus permitted configuration and strategy activation; no member administration |
| Integrator | Authorised device/asset technical configuration where implemented; no automatic strategy/financial or member-administration rights |
| Organisation administrator | Own organisation, Sites, members, roles and individual services within platform grants; may explicitly grant own personal service |
| Platform administrator | Verified platform administration, organisation service/zone approval and audit; no bypass of physical safety locks |

Creation of Sites and commissioning stay administrator-only. Human OpenRemote
Manager remains read-only under the approved GrideX policy; business writes use
the scoped backend. Service grants never confer an action missing from the role.
OpenRemote resource links and attribute permissions must match the effective scope,
including children: linking a parent alone is not evidence of child access.

Three presentations, one design:
- Platform: organisation selector; service rows/grants; organisation administrators and audit.
- Organisation admin: own service catalogue (including unapproved rows); all approved
  members with Name/email | Role | Sites | Services | Actions. Invitations remain a separate list.
- Member: own Sites/services and access details only; request buttons for requestable
  services, no other people's records or grant buttons.

Expanded member row shows exact Site names, service statuses and derived menu/read/write
permissions with reasons. Menus are derived, not independently assigned checkboxes.
Use text labels as well as colour. Mobile uses the same five fields stacked; technical
details stay collapsed. Missing grants do not hide catalogue rows; unavailable APIs do
not erase independent member lists. Candidate services in this document are not yet
added to the live five-service catalogue. Approval must cover catalogue expansion.

## Потенциални услуги — българско допълнение, за одобрение

Посоченият от собственика PDF е водещ за потенциалните услуги. Запазваме ролите
и правата. Групираме възможностите в услуги, а не превръщаме всяка настройка
или справка в отделна услуга. Местата по-долу са панели в СЪЩЕСТВУВАЩИ раздели,
не нови менюта. „Одобрен каталог“ не доказва проверено внедряване на живо.

| Услуга/възможност | Съществуващ раздел | Предпоставки освен ролята | Статус; страници в PDF |
| --- | --- | --- | --- |
| Наблюдение, състояние, heartbeat, аларми | Преглед, Устройства, Аларми | Разрешен Обект и провизирана телеметрия; предпочитание за имейл уведомления | Основни възможности, не предложен допълнителен абонамент; 47–49, 73, 76–77 |
| Цени ден напред | Пазар | Организационно + лично право Цени и разрешена държава/зона; без задължителен Обект | Одобрена заявяема услуга; първоначално само BG; 29–32, 48 |
| Графики и визуализации | Пазар за цени; Обект → Визуализации за телеметрия | Организационно + лично право Графики И право за показаните данни; за ценова графика и Цени/зона | Одобрена заявяема услуга; Grafana е избор на GrideX, не технология от PDF; 49–64 |
| Анализ: потребление, разходи, икономии, загуби | Отчети и икономика | Анализ, разрешени Обекти, валидни измервания и тарифи за финансовите резултати | Съществуваща услуга „Предстои“; 49–60, 64 |
| Метеорология | Преглед, в избрания Обект | Метеорология, местоположение на Обекта и интеграция с доставчик | Съществуваща „Предстои“; 65 |
| Прогнозиране: PV, потребление, внос/износ, цени, небаланс | Енергийни активи за PV; Логика и режими → Графици за планове; Пазар за ценови прогнози | Прогнозиране, подходящ модел/данни; метеорология за прогноза по времето; Цени само за зависимите от цени прогнози | Съществуваща „Предстои“; отделните възможности се специфицират; 38, 62–65 |
| PV оптимизация, включително ограничаване при отрицателна цена | Енергийни активи; Логика и режими → Графици | Обект, одобрен управляем инвертор/драйвер, безопасни лимити; Цени за ценови режими | Нов кандидат; 36–39 |
| Оптимизация на батерия | Батерия; Логика и режими → Графици | Обект, поддържана BESS, SOC/лимити и одобрено управление; Цени само за пазарен режим | Нов кандидат; 39–45, 57–61 |
| Оптимизация на управляеми товари | Управляеми товари; Логика и режими → Графици | Обект, поддържано измерване/управление и лимити; Цени при ценова оптимизация | Нов кандидат; 28–32, 64 |
| Топла вода/отопление, включително соларна топлина | Управляеми товари и Енергийни активи; Логика и режими → Графици | Обект, температурни/енергийни сензори, одобрено термично управление и защити | Нов кандидат или настройваема възможност на товарите; 18–27, 45–47, 61–64 |
| Интелигентно EV зареждане | Управляеми товари; Логика и режими → Графици | Обект, поддържана станция, мощност на присъединяване, безопасно управление и тарифа | Нов кандидат; 33–35, 56–57 |
| Балансиране и графици към търговец | Пазар → Балансиране; Логика и режими → Графици | Отделна услуга, измерване на Обекта, търговски условия и одобрена интеграция | Нов кандидат; Цени НЕ го отключва; 14–18, 66–72 |
| Тарифи и сетълмент | Пазар → Тарифи и сетълмент | Отделна услуга, приложими договор/тарифи и валидирани измервания | Нов кандидат; права за финансови настройки/действия изискват одобрение; 7–13, 68–72 |
| Заетост/резервационна система | В настройките на съответния Обект/товар | Одобрена външна интеграция и зависима оптимизация; тайни само в backend | Кандидат за интеграция, не главно меню; 47 |

НЕ пренасяме автоматично плащанията, комисионните, публичните класации с чужди
участници, саморегистрацията, марките хардуер или поведението при отпаднала
връзка от източника. Абонаментът е административен; състоянието/алармите са
общи функции. Прогнозите се отличават от официално публикуваните цени.
Прогнозна икономия не е гарантиран резултат. Неизвестна/стара телеметрия не
разрешава опасно управление.

### Права и представяне

Ефективен достъп = проверена самоличност + активна организация + действие от
ролята + разрешен ресурс + предпоставки на услугата + внедрена функция.
Самостоятелните пазарни данни не изискват изкуствено Обект. Отказ или непроверено
условие не дава право. Backend и интерфейсът използват един и същ резултат.

| Съществуваща роля | Граница на действията; винаги в разрешения обхват |
| --- | --- |
| Наблюдател | Чете разрешени данни/услуги; заявява услуга към своя админ; не създава ресурси и не подава команди |
| Оператор | Наблюдател + одобрени оперативни команди и подготовка/симулация на стратегии; без даване на услуги/роли |
| Енергиен мениджър | Оператор + разрешени настройки и активиране на стратегии; без управление на членове |
| Интегратор | Технически настройки на разрешени устройства/активи при налична реализация; без автоматични права за стратегии, финанси или хора |
| Администратор на организация | Своята организация, Обекти, хора, роли и лични услуги в рамките на даденото от супер админа; може изрично да разреши услуга и на себе си |
| Супер администратор | Проверено глобално управление, разрешения за организации/зони и одит; без заобикаляне на физическите защити |

Създаването на Обекти и пускането остават само за администратори. Човешкият
OpenRemote Manager остава само за четене по одобрената GrideX политика;
промените минават през ограничения backend. Услуга не дава липсващо действие
от ролята. OpenRemote връзките/атрибутите трябва да съответстват на обхвата,
включително децата: връзка към родителя не доказва достъп до всички деца.

Три представяния, един дизайн:
- Супер админ: избор на организация; услуги/разрешения; организационни админи и одит.
- Организационен админ: свои услуги, включително неодобрените; всички одобрени
  хора с Име/имейл | Роля | Обекти | Услуги | Действия. Поканите са отделен списък.
- Потребител: само свои Обекти/услуги и подробности за достъпа; заявяване на
  заявяемите услуги, без чужди профили или бутони за даване на права.

Разгънатият ред показва имената на Обектите, статусите на услугите и изчислените
менюта/четене/промяна с причина. Менютата НЕ са независими ръчни чекове.
Статусите имат текст, не само цвят. На мобилен същите пет полета са вертикални;
техническите детайли остават сгънати. Липсващо право не скрива ред от каталога;
недостъпно API не заличава независимия списък с хора. Новите кандидати тук НЕ
са добавени към живия каталог от пет услуги. Разширяването изисква одобрение.

## Device/service correspondence — proposal / Устройства и услуги — предложение

### English

Owner also requested the PDF's device list. These are device classes and named
examples, not a validated GrideX compatibility list. Do not infer protocol, model,
write capability or production support from the third-party manual. ROCK Pi/ESP
remain the separately approved GrideX hardware baseline; no new provisioning
option is authorised by this catalogue. SunStorage PRO remains subject to its
existing project specification, not a claim sourced from this PDF.

| Device/asset class | Reference example and pages | Capability to validate | Corresponding service/destination |
| --- | --- | --- | --- |
| Smart meter / power sensor | Smart meter, Power Sensor; 28, 37, 64 | Measured power, energy, import/export; exact available fields per driver | Monitoring, analysis, control prerequisites; Devices / Energy assets |
| PV inverter/system | Huawei example; 36–39 | Generation/history; export control only if supported and commissioned | PV optimisation, forecasts; Energy assets |
| Battery/BESS | Battery class; 39–45 | SOC, charge/discharge power/energy, limits and command feedback | Battery optimisation; Battery |
| EV charging station | EV Point example; 33–35 | Charging power/energy, status, available current and supported tariff/control interface | Smart charging; Flexible loads |
| Wi-Fi controller | BBoil, Shelly families, no exact model; 24–26 | Connectivity, sensor channels, output/command state | Thermal/flexible-load control; Devices |
| Temperature sensor | Hot water, cold water, ambient; 25–27 | Temperature, observation time and quality; actual supported sensor model required | Monitoring/thermal optimisation; Devices / Flexible loads |
| Water heater / thermal store | Boiler system; 18–22 | Temperature, capacity, connected heaters; distinguish measured from calculated thermal energy | Thermal optimisation; Flexible loads |
| Electric heating element | Heater; 22–23 | Rated power, actual switching state, temperature limits and independent protections | Thermal optimisation; Flexible loads |
| Solar thermal installation | Hot-water collectors/system; 45–47, 63 | Heat contribution; distinguish measured and estimated quantities | Thermal optimisation/analysis; Energy assets |
| Other electrical consumer | Consumer with smart meter; 28–29, 64 | Consumption; control only with a separately supported actuator | Load optimisation; Flexible loads |

Huawei, KStar and Deye also occur in the source's balancing restrictions (p18).
Those statements neither establish GrideX support nor blacklist a manufacturer.
Reservations/PMS, weather APIs and market APIs are integrations, NOT physical devices.
An energy installation may contain multiple devices; do not create duplicate inventory
entries merely because it appears in both Devices and an operational screen.

Proposed expandable device record: name, class, exact model, OpenRemote ID, Site,
gateway/parent, read/control capabilities, integration status, last contact,
measurement freshness, dependent services and supported actions. Credentials never
appear in the list. Unknown readings stay unknown, not zero. Commissioning and Site
creation retain their existing administrator boundary. Compatibility approval must
precede selectable models; all provisioning uses OpenRemote.

### Български

Собственикът поиска и устройствата от PDF. Това са класове и посочени примери,
не проверен списък за съвместимост с GrideX. Не извеждаме протокол, точен модел,
възможност за запис или реална поддръжка само от чуждото ръководство. ROCK Pi/ESP
остават отделно одобрената GrideX основа; каталогът не разрешава нов избор за
провизиране. SunStorage PRO следва съществуващото задание, не този PDF.

| Клас устройство/актив | Пример и страници от източника | Какво трябва да проверим | Услуга/екран |
| --- | --- | --- | --- |
| Смарт електромер / измервател на мощност | Smart meter, Power Sensor; 28, 37, 64 | Мощност, енергия, внос/износ; точните полета според драйвера | Наблюдение, анализ, предпоставка за управление; Устройства / Енергийни активи |
| PV инвертор/инсталация | Huawei като пример; 36–39 | Производство/история; управление на износа само при поддръжка и пускане | PV оптимизация, прогнози; Енергийни активи |
| Батерия/BESS | Клас батерии; 39–45 | SOC, заряд/разряд, мощност/енергия, лимити и потвърждение на команди | Оптимизация на батерия; Батерия |
| EV зарядна станция | EV Point като пример; 33–35 | Мощност/енергия, статус, допустим ток и поддържан интерфейс за тарифа/управление | Интелигентно зареждане; Управляеми товари |
| Wi-Fi контролер | Семейства BBoil, Shelly, без точен модел; 24–26 | Свързаност, сензорни канали, изходи и статус на команда | Термично управление/товари; Устройства |
| Температурен сензор | Топла вода, студена вода, въздух; 25–27 | Температура, време и качество; нужен точен поддържан модел | Наблюдение/топла вода; Устройства / Управляеми товари |
| Бойлер / топлинен акумулатор | Бойлерна система; 18–22 | Температура, обем, нагреватели; измерена срещу изчислена топлинна енергия | Термична оптимизация; Управляеми товари |
| Електрически нагревател | Нагревател; 22–23 | Номинална мощност, реално включване, температурни лимити и независими защити | Термична оптимизация; Управляеми товари |
| Соларна топлинна инсталация | Колектори/система за топла вода; 45–47, 63 | Топлинен принос; разграничаване на измерени и прогнозни стойности | Топла вода/анализ; Енергийни активи |
| Друг електрически консуматор | Консуматор със смарт електромер; 28–29, 64 | Потребление; управление само чрез отделно поддържан изпълнителен елемент | Оптимизация на товари; Управляеми товари |

Huawei, KStar и Deye се споменават и при ограниченията за балансиране (стр.18).
Това не доказва GrideX поддръжка и не е основание да забраним производител.
PMS/резервации, метеорологичният API и пазарният API са интеграции, не устройства.
Една инсталация може да съдържа много устройства; показването в Устройства и
оперативен екран не трябва да създава два записа за едно оборудване.

Предложени подробности в разгънат ред: име, клас, точен модел, OpenRemote ID,
Обект, шлюз/родител, възможности за четене/управление, статус на интеграцията,
последен контакт, актуалност на измерванията, зависими услуги и позволени действия.
Без тайни в таблицата. Неизвестни измервания не се заменят с нула. Пускането и
създаването на Обекти запазват администраторската граница. Нов модел става
избираем след одобрена съвместимост; всяко провизиране минава през OpenRemote.
