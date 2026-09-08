# GrideX strategy and settings contract

Status: API contract v1, ready for backend implementation. English is canonical; the Bulgarian section is its product translation.

## English

### 1. Ownership model

| Scope | Examples | Source of truth | May affect control |
|---|---|---|---:|
| User preferences | language, display timezone, dashboard layout, notification channels | GrideX PostgreSQL, keyed by OIDC subject | No |
| Organisation defaults | market, tariff defaults, roles, approvals, retention and subscription | GrideX PostgreSQL | Indirectly, after site validation |
| Site strategy | operating mode, price/SOC/forecast/grid/load parameters and schedule reference | Versioned GrideX PostgreSQL record | Yes |
| OpenRemote execution state | desired/applied revision, live decision, rule state, alarms and datapoints | OpenRemote Strategy and Control Assets | Yes |
| Edge safety | BMS limits, software fuse, watchdog, heartbeat and safe state | Commissioned Edge configuration and live device telemetry | Always authoritative |

A physical strategy is shared by a site. It is never stored as a private user preference. A permitted user creates a draft, but activation changes the site for every authorised operator and is fully audited.

### 2. Supported strategy catalogue

| Stable code | Purpose | Required configuration |
|---|---|---|
| `intelligent_hybrid` | Optimise net value using price, weather, PV, load, ERP demand, imbalance, battery cost and constraints. | Forecast, battery, grid, market, economics |
| `price_arbitrage` | Charge below a buy threshold and discharge above a sell threshold only when the net spread covers tariffs, losses and degradation. | Market, battery, forecast, economics |
| `self_consumption` | Use PV locally, charge from surplus and discharge against site import. | Battery, grid, self-consumption priorities |
| `zero_export` | Hold point-of-connection export at or below the configured limit using BESS, flexible load and PV curtailment. | Grid limit/tolerance and curtailment priority |
| `peak_shaving` | Pre-charge and discharge to keep import under a target peak. | Peak target, warning margin, pre-charge horizon, hysteresis |
| `schedule_following` | Follow the approved 96 × 15-minute trader/day-ahead schedule and track deviation. | Schedule ID, adherence value and deviation tolerance |
| `backup_reserve` | Preserve energy for outages or a planned critical-load window. | Reserve SOC and validity window |
| `manual` | Time-limited operator command mode. It does not disable any safety layer. | Operator role, command TTL and audit reason |

The catalogue endpoint returns only strategies enabled by the customer plan, site capabilities and effective user role.

### 3. Parameter groups

- Common control: strategy code, enabled state, validity interval, site timezone, control interval, re-optimisation interval, ramp request and fallback mode.
- Battery: minimum/maximum/target SOC, emergency reserve, requested charge/discharge caps, grid-charge and grid-discharge permissions.
- Grid: import/export contractual limits, software-fuse margin and zero-export tolerance.
- Forecast: 1–168 hour horizon, maximum data age, minimum confidence and switches for weather, PV, load, price, imbalance and ERP demand. The low-solar rule can preserve, for example, 80% SOC tomorrow and allow grid charging below the economic threshold.
- Market: IBEX market code, buy/sell thresholds, minimum net spread, negative-price export stop, minimum daily net profit and tariff configuration reference.
- Economics: battery asset/depreciation reference, efficiency/losses through the tariff/asset model and minimum margin after battery degradation.
- Flexible loads: asset, priority, power window, energy target and deadline for EVSE or industrial loads.
- Mode-specific fields: PV-surplus priority, peak-shaving target/hysteresis or day-ahead schedule reference.

Factory/BMS limits are intentionally absent from editable strategy fields. The API can expose them as read-only effective constraints; neither a user nor OpenRemote strategy may increase them.

### 4. API workflow

| Method and path | Purpose |
|---|---|
| `GET /api/v1/strategies/catalog` | Strategies and parameter capabilities allowed for this user/site plan. |
| `GET /api/v1/sites/{siteId}/strategy` | Current canonical site configuration and revision. |
| `POST /api/v1/sites/{siteId}/strategy/drafts` | Create a draft from an explicit base revision. |
| `PUT /api/v1/sites/{siteId}/strategy/drafts/{draftId}` | Update the draft using `If-Match`. |
| `POST .../{draftId}/validate` | Validate schema, permissions, device capabilities, tariff references and safety relationships. |
| `POST .../{draftId}/simulate` | Backtest/forecast the requested horizon and return profit, costs, cycles and violations. |
| `POST .../{draftId}/activate` | Activate a validated and simulated draft with an idempotency key. |
| `GET /api/v1/sites/{siteId}/strategy/status` | Compare desired and actually applied revisions. |
| `GET /api/v1/sites/{siteId}/strategy/versions` | Audited configuration history. |
| `GET/PUT /api/v1/me/preferences` | Read/update non-operational personal preferences. |
| `GET/PUT /api/v1/sites/{siteId}/configurations/{section}` | Versioned battery-asset, tariff, forecast, grid, EVSE, trader, balancing and notification settings. |

Activation returns `202 Accepted`; it does not claim that OpenRemote or Edge has applied the change. The UI remains in `activating` until `appliedRevision == desiredRevision`. A timeout or rejected OpenRemote validation produces a visible reason and preserves the last active revision.

### 5. OpenRemote mapping

The GrideX API is the browser boundary and PostgreSQL stores the desired versioned strategy. After activation, the backend writes one immutable strategy document/revision to the site Strategy Asset. OpenRemote rules validate the site capability state, copy the accepted revision into operational attributes and emit requested power into the Control Asset. Live status, history and forecast are read from attributes, datapoints and predicted datapoints.

Recommended Strategy Asset attributes:

```text
strategyCode             intelligent_hybrid
strategyDesiredRevision  17
strategyAppliedRevision  17
strategyLifecycle        active
strategyDocument         { canonical JSON object }
strategyDecision         { timestamp, horizon, requestedPowerKw, reasonCodes }
strategyLastError         { code, safeMessage }
```

OpenRemote acceptance is still not device execution. The Control Asset and Edge return a separate command sequence/applied value. Edge safety remains the final authority.

### 6. Roles and audit

- `viewer`: read current strategy, simulation and status.
- `operator`: create/edit drafts and run validation/simulation.
- `energy_manager`: activate or roll back an operational strategy.
- `administrator`: manage organisation defaults, tariff references and role policy.

Every mutation records subject, organisation, site, old/new revision, timestamp, reason, request ID and result. Two-person approval can be required by organisation policy for high-power or manual operation.

The machine-readable configuration schemas are in [`schemas/strategy-configuration.schema.json`](schemas/strategy-configuration.schema.json) and [`schemas/user-preferences.schema.json`](schemas/user-preferences.schema.json).

---

## Български

### 1. Кой държи настройките

| Обхват | Примери | Източник на истина | Влияе на управлението |
|---|---|---|---:|
| Лични настройки | език, визуална часова зона, подредба, канали за известяване | GrideX PostgreSQL по OIDC потребител | Не |
| Организационни правила | пазар, тарифни defaults, роли, одобрения, retention и абонамент | GrideX PostgreSQL | Косвено, след проверка за обекта |
| Стратегия на обекта | режим, цена, SOC, прогноза, мрежови/товарови параметри и график | Версиониран запис в GrideX PostgreSQL | Да |
| Изпълнение | желана/приложена версия, решение, правила, аларми и datapoints | OpenRemote Strategy и Control Assets | Да |
| Локални защити | BMS лимити, software fuse, watchdog, heartbeat и safe state | Edge конфигурация и реална телеметрия | Винаги са с приоритет |

Стратегията е обща за конкретния енергиен обект, а не лична настройка. Упълномощен потребител създава чернова, но активирането променя поведението на обекта за всички оператори и се записва в audit log.

### 2. Режими

- `intelligent_hybrid` — обща икономическа оптимизация по цена, време, PV, товар, ERP очаквано натоварване, небаланс, разход на батерията и ограничения.
- `price_arbitrage` — заряд при ниска и разряд при висока цена само ако нетният спред покрива тарифи, загуби и ДМА/деградация.
- `self_consumption` — максимална собствена консумация.
- `zero_export` — ограничаване на износа в точката на присъединяване чрез BESS, гъвкави товари и PV curtailment.
- `peak_shaving` — предварителен заряд и покриване на товарни пикове.
- `schedule_following` — изпълнение на одобрените 96 × 15-минутни позиции към търговеца.
- `backup_reserve` — запазване на резерв за авария или критичен период.
- `manual` — временно операторско управление с TTL; не изключва защитите.

### 3. Какво се задава

Договорът включва общите control параметри; минимален, максимален и целеви SOC; разрешения за заряд/разряд от мрежата; лимити за внос/износ и software-fuse margin; 1–168 часа прогнозен хоризонт; максимална възраст и минимална увереност на прогнозата; weather/PV/load/price/imbalance/ERP сигнали; IBEX прагове и минимална нетна печалба; цена на деградацията; приоритети и срокове на EV/индустриални товари; peak-shaving, zero-export и schedule-specific параметри.

Така правилото „утре няма слънце — запази 80% SOC и купувай от мрежата само под прага“ е изрично конфигурируемо. Фабричните BMS граници са само за четене и не могат да се увеличават от frontend, API или стратегия.

### 4. Безопасен жизнен цикъл

```text
Чернова -> Проверка -> Симулация -> Одобрение -> Активиране
                                                |
                                                v
                                 OpenRemote appliedRevision
                                                |
                                                v
                                 Control Asset -> Edge safety
```

Frontend-ът не показва „Активна“, само защото API е приел заявката. Статусът става активен едва когато `appliedRevision` съвпадне с `desiredRevision`. При отказ остава последната работеща версия и се показва безопасна причина.

### 5. Права

- `viewer` вижда конфигурация, симулация и статус;
- `operator` редактира чернова и стартира проверка/симулация;
- `energy_manager` активира или връща версия;
- `administrator` управлява организационни defaults, тарифи и правила за права.

Всеки запис пази потребител, организация, обект, стара/нова версия, време, причина, request ID и резултат. При нужда организацията може да изисква двойно одобрение.

Точните API операции са в [`frontend-backend-contract.yaml`](frontend-backend-contract.yaml), а JSON схемите са в [`schemas/`](schemas/).
