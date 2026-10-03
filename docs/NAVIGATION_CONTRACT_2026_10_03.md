# Approved navigation contract / Одобрена навигация

Owner instruction, 2026-10-03: implement and publish the revised navigation,
existing service/member/Site workflows and matching BG/EN documentation. This
contract supersedes the navigation proposal of 2026-10-02. Approval is not proof
of deployment. See HANDOFF for acceptance and remaining work.

## English

Preserve the current GrideX shell and responsive navigation. Use the approved
five-column member register (name/email, role, Sites, services, actions) and
collapsed access details. The following hierarchy is binding:

- Overview
- Sites
- Energy assets: Battery; Inverter; Charging station; Consumer and load
- Infrastructure (one page, including supported catalogue; router, edge
  controller, ESP/OLIMEX node, smart meter, controller, gateway, sensor, cloud connector)
- Services: Day-ahead prices; Graphs and visualisations; Analysis; Meteorology; Forecasting
- Mode: Logic; Schedule; Alarm
- Settings: Users; Plan and subscription; Market (Tariff and settlement;
  Balancing); Profile (Documentation)
- About us

Users is ONE page for organisations, people, invitations, roles, Site links and
service decisions, scoped by platform/organisation authority. Services shows the
personal catalogue, requests and entitlements. Administrators may grant without
a prior request; organisation grants do not automatically grant every member.
Platform administrators do not request their own services. Plans define scope,
not automatic personal grants. Do not invent a new billing or plan-edit API.

Live asset navigation requires registered, authorised assets, not fresh telemetry:
offline assets remain visible. Demo shows all four asset categories. Meters are
infrastructure. PV installations and thermal systems are removed as destinations.
A Site with energy assets needs at least one infrastructure component. Do not
invent compatibility for router/cloud connector merely to satisfy that condition.
OpenRemote remains inventory authority; do not recreate existing resources.

Role permissions remain distinct from service grants. Preserve backend checks,
realm isolation, Site links and physical safety locks. Human Manager is read-only.
Tariff/ERP contract entry is approved for platform and organisation administrators
(own organisation only); member read access, balancing privileges and alarm write
actions remain unresolved and must not be broadened. The tariff form/schema itself
still needs a complete field/validation contract before adding new financial writes.

Prices and graphs are independently requestable; analysis, meteorology and
forecasting remain Coming soon. A price graph requires prices, graphs and zone
permission. A Site chart requires authorised source data and graph permission.
No service grant activates an unfinished function. Graphs may appear within a
Site/asset; there is no separate Site-visualisations menu. Existing URLs need
compatibility; identity, logout and callback behaviour must remain unchanged.

Acceptance: demo/live, three account types and five member roles, no Sites,
no energy assets, offline assets, denied/error service APIs, direct URLs,
existing bookmarks, personal grants including org admin, desktop/mobile,
BG/EN and actual deployment. Source tests and owner acceptance are separate.

## Български

Запазваме текущия GrideX облик и адаптивно меню. Одобрената таблица за хора е
Име/имейл, Роля, Обекти, Услуги, Действия; подробностите за достъпа са сгънати.
Задължителна йерархия:

- Преглед
- Обекти
- Енергийни активи: Батерия; Инвертор; Зарядна станция; Консуматор и товар
- Инфраструктура (една страница с каталог; рутер, edge контролер, ESP/OLIMEX
  възел, смарт електромер, контролер, шлюз, сензор, cloud конектор)
- Услуги: Цени ден напред; Графики и визуализации; Анализ; Метеорология; Прогнозиране
- Режим: Логика; График; Аларма
- Настройки: Потребители; План и абонамент; Пазар (Тарифа и сетълмент;
  Балансиране); Профил (Документация)
- За нас

Потребители е ЕДНА страница за организации, хора, покани, роли, Обекти и
разрешения за услуги, според глобалните/организационните права. Услуги показва
личния каталог, заявки и разрешения. Админ може да разрешава и без заявка;
организационно разрешение не дава автоматично достъп на всички членове.
Супер админ не заявява за себе си. Планът задава обхват, не лични права.
Не измисляме нов API за плащания или редакция на планове.

След вход активните категории зависят от заведени разрешени активи, не от
прясна телеметрия: offline актив остава видим. В демото са четирите категории.
Електромерът е инфраструктура. PV инсталация и Топлинна система отпадат като
раздели. Обект с енергийни активи изисква поне един инфраструктурен компонент.
Не измисляме поддръжка на рутер/cloud конектор, за да изпълним условието.
OpenRemote остава единствен инвентар; без повторно създаване на ресурсите.

Роля и услуга са отделни проверки. Пазим backend, realm изолация, връзки към
Обекти и физически защити. Човешкият Manager е само за четене. Въвеждането
на тарифи/договор с ЕРП е одобрено за супер/организационен админ (само своя
организация); четене от член, права за балансиране и редакция на аларми остават
неуточнени. Самата тарифна форма/схема изисква пълен договор за полета и
валидация преди добавяне на нови финансови записи.

Цени и Графики са отделно заявяеми; Анализ, Метеорология, Прогнозиране остават
„Предстои“. Ценова графика изисква Цени + Графики + зона. Графика за Обект
изисква разрешени данни и Графики. Право не активира невнедрена функция.
Графики може да има в Обект/актив, но не отделно меню Визуализации на Обект.
Старите адреси се запазват съвместими; без промяна на сесии, изход и callback.

Приемане: демо/реално, три типа акаунти и пет роли, нула Обекти/активи, offline
активи, отказ/грешка на услуги, директни URL и запазени линкове, лични услуги
на админ, desktop/mobile, BG/EN и реално внедряване. Кодови тестове не заменят
приемането от собственика.
