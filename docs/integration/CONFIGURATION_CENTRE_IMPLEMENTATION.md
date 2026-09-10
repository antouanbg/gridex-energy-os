# Configuration Centre implementation / Реализация на центъра за конфигурация

## English

### Boundary and ownership

The browser communicates only with the authenticated GrideX API. It never uses
OpenRemote credentials and never writes an Asset directly.

| Configuration | PostgreSQL (canonical) | OpenRemote (operational) |
|---|---|---|
| Site | organisation, name/code, coordinates, timezone, market, contracts, revision | Site Asset ID, location attributes, live status |
| PV | arrays, orientation profile, mounting/tracking/layout, DC kWp, tilt, azimuth, PR, losses, inverter relation | one `SolarPVAsset` per array; active physical inputs and forecasts |
| Battery/PCS | type, AC/DC coupling, make/model, capacity, PCS rating, SOC policy, efficiencies, asset value, useful life, tariff permissions | Battery/PCS Assets, live SOC/SOH, BMS charge/discharge limits, alarms and applied setpoint |
| Metering/grid | measurement-point role, meter relation, sign convention, CT/VT, contractual import/export limits and fuse margin | meter Assets, live power/energy, quality and device limits |
| Market/tariffs | versioned price components, validity, fees, trader schedule settings | derived current all-in prices and active schedule attributes |
| Forecast | selected models/providers, horizon, confidence, age and fallback policy | forecast series, quality flags, model/version timestamps |
| Strategy | versioned user intent, economics, permissions and simulation approval | active Control Asset desired values; actual/applied values remain read-only |
| Loads/EV | priorities, windows, energy targets, ERP mapping and tariffs | live load/EVSE state, availability and bounded commands |
| Edge/devices | topology, driver key/version, port role, device relationship and deployment state | connectivity, capabilities, last seen and diagnostic attributes |
| Notifications/access | preferences, escalation, approval policy and audit | alarms/events are read; identity and roles come from Keycloak |

Manufacturer/BMS safety limits are device truth. They are read-only in the UI,
may be copied to PostgreSQL only as an audit snapshot, and can never be
overridden by strategy configuration. Passwords, API tokens, private keys and
device credentials belong in a secret store, not in configuration payloads.

### Lifecycle

1. `PUT .../configurations/{scope}` writes a draft with `If-Match` revision.
2. `validate` checks JSON Schema, RBAC, references, device capabilities,
   conditional required fields and safety invariants.
3. `simulate` calculates the 96 × 15-minute economic and technical result.
4. `activate` requires an idempotency key and an approved simulation.
5. The same PostgreSQL transaction marks the desired revision and writes an
   outbox message.
6. The synchronisation worker maps the approved subset to OpenRemote Assets.
7. PostgreSQL records applied revision, time, OpenRemote event ID and errors.
   Rollback creates a new revision; history is never overwritten.

### Required and conditional PV fields

Required: array name, enabled state, orientation profile, mounting type,
tracking type, DC kWp, tilt, numeric azimuth, performance ratio and inverter
relation. `moduleLayout` is required for tracked arrays.
`eastWestSplitPct` is required for the east-west profile and must total 100%.
For accurate forecasting, physically different east and west planes should be
stored as separate arrays with their own azimuth and capacity. “2P tracker” is
not a single value: it is `trackingType` plus `moduleLayout=2P`.

### Frontend readiness

The Settings screen presents ten scopes, required/conditional/read-only field
markers, draft state, validation, simulation and activation controls. The API
client exposes typed draft, validate, simulate and activate calls. Demo actions
remain local; live mode must use the GrideX API and display backend validation
paths next to their matching fields.

## Български

Frontend-ът комуникира единствено с удостоверения GrideX API и никога директно
с OpenRemote. PostgreSQL е каноничният източник за конфигурации, версии,
отношения между обекти, тарифи, права, одобрения и одит. OpenRemote е
оперативният източник за Assets, телеметрия, качество, аларми, моментни BMS
лимити и приложени команди.

Жизненият цикъл е: **Чернова → Валидация → Симулация → Активиране → Outbox →
OpenRemote → Потвърдена приложена версия**. Записването на чернова не променя
оборудването. Връщането назад създава нова версия и не изтрива историята.

За PV масив са задължителни: име, активност, ориентационен профил, вид монтаж,
вид проследяване, DC kWp, наклон, числов азимут, PR и връзка към инвертор.
`moduleLayout` е задължително за тракер. При изток–запад делът трябва да е 100%,
но за точна прогноза двата физически ската се пазят като отделни масиви. „2P
tracker“ се описва с две полета: тип проследяване и разположение `2P`.

BMS лимитите са само за четене и стратегията не може да ги заобиколи. Пароли,
токени, VPN ключове и device credentials не се пазят в конфигурационните
payload-и, а в отделно хранилище за тайни.
