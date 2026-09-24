# User documentation coverage / Покритие на потребителската документация

Status: planned, except the first in-portal Profile guide at `/help/`. This is
the checklist for the later documentation portal (`doc.gridex.tech` is a
proposal, not an active destination). Do not link users to an unpublished
domain. Preserve the owner-approved navigation; documentation does not add
items to the main menu.

Статус: планирано, с изключение на първото ръководство за Профил в `/help/`.
Бъдещият портал за документация още не е активен. Не насочвай потребителя към
несъществуващ домейн и не променяй одобреното главно меню заради документация.

For every existing section, document: purpose and intended audience; every
visible field/control and its effect; data source and whether values are demo,
live or not yet integrated; roles/Site scope; refresh and history semantics;
empty/loading/offline/error states; safety constraints; and a short worked
example. Keep BG/EN aligned, then add other supported locales. Review the
guide against the actual shipped UI and API before marking it complete.

За всеки съществуващ раздел опиши: цел и аудитория; всяко поле/бутон и ефект;
източник и статус на данните (демо, реални, предстои); права и обхват по Обект;
обновяване/история; празно, зареждане, липса на връзка и грешки; ограничения
за безопасност; кратък пример. Първо BG/EN, после останалите езици. Приемане
само след сравнение с публикуваните UI и API.

| Section / Раздел | URL | Guide status |
| --- | --- | --- |
| Преглед | `/` | Pending |
| Клиенти и договори | `/customers/` | Pending |
| Потребители и покани / Users & invitations | `/customers/users/` | Pending; explain organisation-admin role/Site grants, recipient acceptance, and the not-yet-active global new-organisation flow |
| Обекти | `/sites/` | Pending |
| Енергийни активи | `/assets/` | Pending |
| Батерия | `/battery/` | Pending |
| Управляеми товари | `/loads/` | Pending |
| Пазар | `/market/` | Pending |
| Тарифи и сетълмент | `/market/settlement/` | Pending |
| Балансиране | `/market/balancing/` | Pending |
| Логика и режими | `/automation/` | Pending |
| Графици | `/automation/schedules/` | Pending |
| Устройства | `/devices/` | Pending |
| Поддържани устройства | `/devices/supported/` | Pending |
| Аларми | `/alarms/` | Pending |
| Отчети и икономика | `/reports/` | Pending |
| Настройки | `/settings/` | Pending |
| Планове и абонамент | `/settings/subscription/` | Pending |
| За нас | `/about/` | Pending |
| Потребителски профил | `/profile/` | Initial guide at `/help/`; review after redesign |
| Вход в портала | `/login/` | Pending |

The anonymous Demo has separate `/demo/*` paths and must be documented as
sample data, never as customer inventory. Future device-level help should
explain telemetry provenance, last contact, configuration draft/activation,
transport choice and command safety without exposing secrets.
