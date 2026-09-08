# GrideX frontend-to-backend implementation plan

Status: frontend integration baseline implemented; backend endpoints and deployment configuration still require commissioning.

## English

### 1. Mandatory product behaviour

The public frontend has one automatic runtime state machine:

| Backend | OIDC session | UI data mode | User experience |
|---|---|---|---|
| Checking | Unknown | Demo | Show `CONNECTING · DEMO`; never block the public demonstration. |
| Offline | Any | Demo | Show `This is Demo mode` and a backend connection error on the sign-in page. |
| Online | Anonymous | Demo | Show `This is Demo mode. Please sign in.` and enable the Keycloak sign-in action. |
| Online | Authenticated | Live | Load authorised sites and live OpenRemote-derived data through the GrideX API. |
| Online | Expired/revoked session | Demo | Clear live data immediately, show the sign-in action and require a new session. |

Demo and live values must never be mixed. In live mode, a missing field is displayed as unavailable (`—`), not replaced with a representative demo value.

### 2. Trust boundary and communication route

```text
Browser / GrideX frontend
  -> HTTPS JSON and authenticated SSE
GrideX API / Backend-for-Frontend
  -> REST and OpenRemote AttributeEvents adapter
OpenRemote
  -> site-router VPN paths only
ROCK Pi E / site devices
```

The browser must never receive OpenRemote service-user secrets, MQTT credentials, Modbus registers, WireGuard configuration, site inventory or direct device routes.

### 3. Public runtime configuration

`public/gridex-config.js` is loaded before the application. It contains public metadata only:

| Variable | Type | Required | Meaning |
|---|---|---:|---|
| `mode` | `auto \| demo \| live` | yes | `auto` is recommended. `demo` disables all backend/auth calls. `live` and `auto` both fall back safely to labelled demo mode. |
| `apiBaseUrl` | HTTPS URL | yes outside forced demo | GrideX API origin; never an OpenRemote or device URL. |
| `realm` | string | yes | OpenRemote/Keycloak realm name. |
| `oidcIssuer` | HTTPS URL | yes | Exact realm issuer ending in `/realms/{realm}`. |
| `oidcClientId` | string | yes | Public SPA client identifier; no client secret. |
| `defaultSiteId` | string | yes | Initial canonical GrideX site identifier. |
| `backendTimeoutMs` | integer | yes | Public health-check timeout; recommended `5000`. |
| `backendHealthRefreshMs` | integer | yes | Continuous backend health probe interval; recommended `30000`. |
| `snapshotRefreshMs` | integer | yes | Polling fallback when live events are unavailable; recommended `5000`. |
| `authEnabled` | boolean | yes | Enables OIDC only after the backend health check succeeds. |

### 4. Authentication requirements

- OpenID Connect Authorization Code flow with PKCE `S256`.
- Keycloak client type: public SPA; client authentication disabled.
- Exact frontend origins in Web Origins/CORS.
- Exact login, silent-check and post-logout redirect URIs.
- Short-lived access token; refresh through `updateToken(30)` before API calls.
- Access and refresh tokens stay in memory. They are never written to localStorage, sessionStorage, cookies managed by JavaScript, logs or URLs.
- Backend verifies signature, issuer, audience, expiry and tenant/site authorisation on every protected request.
- UI roles are presentational only. The API and OpenRemote remain authoritative.

### 5. Implemented frontend calls

| Method and path | Authentication | Frontend use |
|---|---|---|
| `GET /health` | public | Backend/OpenRemote readiness and write-lock status. |
| `GET /api/v1/me` | bearer | Current user identity and effective roles. |
| `GET /api/v1/sites` | bearer | Only sites authorised for the current subject. |
| `GET /api/v1/sites/{siteId}/snapshot` | bearer | Canonical current dashboard snapshot. |
| `POST /api/v1/sites/{siteId}/commands/power` | bearer + role | Atomic requested-power command. |
| `GET /api/v1/sites/{siteId}/history` | bearer | Historical values for charts and reports. |
| `GET /api/v1/sites/{siteId}/forecast` | bearer | Weather, PV, load, price and economic forecast horizon. |
| `GET /api/v1/strategies/catalog` | bearer | Modes enabled by role, subscription and site capabilities. |
| `GET /api/v1/sites/{siteId}/strategy` | bearer | Current versioned site strategy. |
| `POST/PUT /api/v1/sites/{siteId}/strategy/drafts...` | bearer + role + revision | Create and edit a strategy draft without changing live operation. |
| `POST .../validate`, `POST .../simulate` | bearer + role | Validate and forecast profit, cost, cycles and violations. |
| `POST .../activate` | energy-manager role + idempotency key | Request audited activation in OpenRemote. |
| `GET /api/v1/sites/{siteId}/strategy/status` | bearer | Desired versus actually applied OpenRemote revision. |
| `GET/PUT /api/v1/me/preferences` | bearer + revision | Personal display and notification preferences only. |
| `GET /api/v1/sites/{siteId}/alarms` | bearer | Current and historical alarms. |
| `POST /api/v1/sites/{siteId}/alarms/{alarmId}/acknowledge` | bearer + role | Audited acknowledgement. |
| `PUT /api/v1/sites/{siteId}/configurations/{section}` | bearer + role + revision | Versioned settings and operating modes. |
| `GET /api/v1/sites/{siteId}/events` | bearer | Authenticated SSE stream; polling remains the fallback. |

The machine-readable contract is in [`frontend-backend-contract.yaml`](frontend-backend-contract.yaml). Strategy ownership, lifecycle and every parameter group are defined in [`STRATEGY_AND_SETTINGS_CONTRACT.md`](STRATEGY_AND_SETTINGS_CONTRACT.md).

### 6. Canonical snapshot fields

| Group | Fields | Unit/convention |
|---|---|---|
| Identity | `assetId`, `siteId`, `siteName`, `timestamp`, `quality` | ISO-8601 UTC timestamp; quality is `GOOD`, `STALE`, `INVALID` or `FAULT`. |
| Battery | `socPct`, `sohPct`, `maxChargeKw`, `maxDischargeKw`, `limitsValid`, `controlReady` | Limits are positive; zero means prohibited. |
| Power | `actualKw`, `requestedKw`, `appliedKw`, `dcKw`, `reactiveKvar` | Canonical battery polarity: positive discharge, negative charge. |
| Site flow | `pvKw`, `siteLoadKw`, `gridKw`, `evKw` | `gridKw`: positive import, negative export. Loads/generation are positive magnitudes. |
| Strategy | `mode`, `targetSocPct` | Stable backend enum plus display labels supplied by the frontend. |

### 7. Command contract

`POST /api/v1/sites/{siteId}/commands/power` sends one atomic JSON object:

```json
{
  "sequence": 42,
  "requestedPowerKw": -50.0,
  "enable": true,
  "source": "operator",
  "ttlSeconds": 15
}
```

Rules:

- positive power means discharge; negative power means charge;
- the frontend never sends vendor register values or scaling;
- `sequence` is monotonically increasing per control session;
- `ttlSeconds` is mandatory for operator commands in production;
- the API validates role, site membership, revision, limits and write lock;
- OpenRemote and Edge independently enforce safety; a frontend validation is never authoritative;
- the API returns an audit/command identifier and final acceptance state.

### 8. Additional backend endpoints required by screens

Before a screen may be marked fully live, the backend must implement:

- organisation, user-statistics and role endpoints;
- configurations for battery, modes, schedules, tariffs, gateways and notification rules;
- incidents and notification inbox;
- reports/settlement exports using asynchronous job IDs;
- schedules and 15-minute balancing data;
- driver/gateway deployment status without exposing site secrets;
- 72-hour forecasts and projected profit with model/version/confidence metadata;
- command history and audit trail;
- optimistic concurrency through `ETag`/`If-Match` or an explicit `revision` field.

Strategy configuration is no longer handled by the generic configuration endpoint. It uses a dedicated draft -> validation -> simulation -> activation lifecycle. A site strategy is shared operational state; only language, visual layout and notification choices belong to an individual user.

### 9. Error contract

All errors use a stable body:

```json
{
  "error": "stable_machine_code",
  "message": "Safe user-facing summary",
  "requestId": "opaque-correlation-id",
  "details": {}
}
```

Expected statuses: `400` validation, `401` missing/expired session, `403` role/site denied, `404` unknown resource, `409` conflicting state, `412` stale configuration revision, `423` write lock, `429` rate limit, `502/503` upstream unavailable. Internal secrets and raw OpenRemote/vendor responses must not be returned to the browser.

### 10. Implementation sequence

1. Provision the public Keycloak SPA client and exact redirect/web origins.
2. Deploy `/health`, token validation, `/me` and authorised `/sites`.
3. Map canonical Site/Battery/Control/Strategy/Meter assets to `/snapshot`.
4. Verify login, logout, refresh, key rollover, revoked sessions and tenant isolation.
5. Enable read-only live mode and compare dashboard values with OpenRemote.
6. Add authenticated events with polling/reconnect fallback.
7. Implement history, forecasts, alarms, incidents, tariffs and personal preferences.
8. Implement the dedicated strategy catalogue, drafts, validation, simulation, activation and applied-revision status.
9. Keep `GRIDEX_WRITES_ENABLED=false`; validate every safety layer and command audit.
10. Enable strategy activation and commands per site and role only after commissioning acceptance tests pass.

### 11. Frontend acceptance criteria

- Offline backend never produces an unlabelled or broken screen.
- Anonymous visitors always see the exact Demo-mode notice and a sign-in action.
- The sign-in page explicitly reports backend unavailability.
- Authenticated live mode contains no representative demo values.
- A `401` clears live state and returns to labelled demo/sign-in.
- A `403` never reveals an unauthorised site or asset.
- Token refresh, logout and revocation work without persistent tokens.
- Live stream reconnect uses capped exponential backoff and polling fallback.
- All write controls expose pending, accepted, applied, rejected and timeout states.
- Desktop and mobile builds pass; no secret is present in the generated bundle.

---

## Български

### 1. Задължително поведение

Frontend-ът използва една автоматична state machine:

| Backend | OIDC сесия | Режим на данните | Поведение |
|---|---|---|---|
| Проверява се | Неизвестна | Демо | Показва `CONNECTING · DEMO`, без да блокира публичната демонстрация. |
| Недостъпен | Всяка | Демо | Показва `Това е Демо режим` и грешка за backend връзката в страницата за логване. |
| Достъпен | Няма вход | Демо | Показва `Това е Демо режим. Моля, логнете се.` и активира защитения Keycloak вход. |
| Достъпен | Валидна | Live | Зарежда само разрешените обекти и реални OpenRemote данни през GrideX API. |
| Достъпен | Изтекла/отнета | Демо | Изчиства live данните и изисква нов вход. |

Демо и реални стойности не се смесват. В live режим липсващото поле се показва като `—`, а не се заменя с демонстрационна стойност.

### 2. Комуникационна граница

```text
Браузър / GrideX frontend
  -> HTTPS JSON и удостоверен SSE
GrideX API / Backend-for-Frontend
  -> REST и адаптер за OpenRemote AttributeEvents
OpenRemote
  -> единствено през VPN пътищата на site router-а
ROCK Pi E / устройствата на обекта
```

Браузърът не получава OpenRemote service-user secret, MQTT credentials, Modbus регистри, WireGuard конфигурация, site inventory или директен маршрут към устройство.

### 3. Публична runtime конфигурация

`public/gridex-config.js` се зарежда преди приложението и съдържа само публични параметри: `mode`, `apiBaseUrl`, `realm`, `oidcIssuer`, `oidcClientId`, `defaultSiteId`, `backendTimeoutMs`, `backendHealthRefreshMs`, `snapshotRefreshMs` и `authEnabled`. Препоръчителният режим е `auto`. В този файл не се поставят ключове, пароли, токени, MQTT или VPN данни.

### 4. Вход и сигурност

- OpenID Connect Authorization Code + PKCE `S256`.
- Keycloak client: публичен SPA, без client secret.
- Точни frontend origins за CORS/Web Origins и точни login/logout redirect URI.
- Краткоживеещ access token; обновяване с `updateToken(30)` преди API заявка.
- Токените се пазят само в паметта и не се записват в browser storage, JavaScript cookies, логове или URL.
- Backend-ът проверява подпис, issuer, audience, срок, организация, обект и роля за всяка защитена заявка.
- Видимата frontend роля не е разрешение; backend/OpenRemote са авторитетни.

### 5. Данни и променливи

Реализираният frontend client има договори за health, текущ потребител, лични preferences, разрешени обекти, snapshot, history, 72-часова forecast, аларми, acknowledge, атомарна power команда, удостоверен SSE поток и пълния lifecycle на стратегията. Точните HTTP пътища са в английската таблица и в [`frontend-backend-contract.yaml`](frontend-backend-contract.yaml).

Стратегията е обща версияна конфигурация за обекта, не лична настройка. Променя се чрез чернова, проверка, симулация и одобрено активиране. Едва когато OpenRemote върне `appliedRevision == desiredRevision`, frontend-ът я показва като активна. Пълният договор е в [`STRATEGY_AND_SETTINGS_CONTRACT.md`](STRATEGY_AND_SETTINGS_CONTRACT.md).

Основната snapshot полярност е:

- батерия: положително = разряд, отрицателно = заряд;
- мрежа: положително = внос, отрицателно = износ;
- BMS charge/discharge лимитите са положителни; `0` забранява съответната посока;
- timestamp е ISO-8601 UTC, а frontend-ът визуализира в часовата зона на обекта.

### 6. План за свързване

1. Създаване на публичния Keycloak SPA client и точните origins/redirect URI.
2. Публикуване на `/health`, проверка на token, `/me` и разрешените `/sites`.
3. Mapping на Site/Battery/Control/Strategy/Meter Assets към каноничен `/snapshot`.
4. Тестове на login/logout/refresh, key rollover, revoke и tenant isolation.
5. Включване на read-only live режим и сравнение с OpenRemote.
6. Добавяне на удостоверен event stream с polling/reconnect fallback.
7. Свързване на history, forecasts, alarms, incidents, tariffs и лични preferences.
8. Реализиране на strategy catalog, чернови, проверка, симулация, активиране и applied status.
9. Запазване на `GRIDEX_WRITES_ENABLED=false` до приключване на commissioning тестовете.
10. Разрешаване на стратегии и команди по обект и роля само след приемане на всички safety тестове.

### 7. Критерии за приемане

- При липса на backend сайтът остава работещо и ясно означено демо.
- Без реален login винаги се вижда `Това е Демо режим. Моля, логнете се.`
- В страницата за логване се вижда конкретен проблем при липса на backend.
- В live режим не се използват скрити демо стойности.
- `401` премахва live състоянието и изисква нов вход; `403` не показва чужди обекти.
- Няма постоянни токени или secrets в bundle-а.
- Всяка команда има pending, accepted, applied, rejected и timeout визуално състояние.
- Мобилният и desktop build преминават автоматичните тестове.
