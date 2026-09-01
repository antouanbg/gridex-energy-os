# GrideX Energy OS

## English

**Open-source EMS demonstration for industrial PV, battery storage and flexible loads.**

GrideX Energy OS is a bilingual Bulgarian/English product demonstration of an industrial Energy Management System. It presents portfolio monitoring, BESS control, day-ahead scheduling, IBEX price logic, weather and production forecasting, imbalance reduction, industrial load planning, SCADA/device integration and edge safety.

## Live demo

The public GitHub Pages demo is deployed automatically from the `main` branch:

**https://gridex.tech/**

The interface uses representative demonstration data. It is not connected to a live power installation and must not be used as a production control system without project-specific engineering, testing and safety validation.

The same build is prepared for a protected live mode. `public/gridex-config.js` selects `demo` or `live`; live data and commands go through `api.gridex.tech`, never directly from the browser to OpenRemote or a field device.

## Product scope

- PV, BESS, grid, load and EV charging dashboards
- battery SOC, SOH, limits, cycles and daily depreciation accounting
- IBEX day-ahead prices, historical data and forecast scenarios
- weather-aware three-day PV and load forecasts
- automated operating modes for arbitrage, self-consumption, zero export and peak shaving
- trader schedules, 15-minute imbalance monitoring and settlement views
- ERP/MES production-load inputs and industrial flexible-load control
- device and driver catalogue for Deye, Sungrow, Huawei, Growatt and other vendors
- OpenRemote asset architecture and local Modbus edge-gateway concept
- safety envelope, BMS limit enforcement, software fuse, heartbeat and safe mode
- Free, Pro and Enterprise capability tiers

## Architecture

The production concept separates strategy from safety:

1. The optimisation layer calculates schedules and desired power.
2. OpenRemote represents sites and devices as assets and coordinates telemetry and commands.
3. The safety layer clamps every command to current BMS and site limits.
4. The local edge gateway normalises vendor-specific Modbus maps and maintains time-critical behaviour even when the cloud connection is unavailable.

The production cloud runs as Docker services. OpenRemote Manager, its Keycloak
image and its supported PostgreSQL service remain one operational stack.
GrideX adds a private API and a separate open-source PostgreSQL database for
organisations, tariffs, configurations, incidents and audit data. OpenRemote's
built-in MQTTS API is used for Edge communication, so the first deployment does
not add a second MQTT broker. The complete boundary is documented in
[DOCKER_CLOUD_TOPOLOGY.md](docs/architecture/DOCKER_CLOUD_TOPOLOGY.md).

The optional Waveshare 2-CH CAN TO ETH transport and the protocol-reference
validation rules are documented in
[WAVESHARE_AND_PROTOCOL_REFERENCES.md](docs/edge/WAVESHARE_AND_PROTOCOL_REFERENCES.md).

The manufacturer-confirmed Suntech STE-261L / SunStorage Pro 261 Modbus profile
is documented in [SUNTECH_STE261L_MODBUS.md](docs/edge/SUNTECH_STE261L_MODBUS.md).
Its standard-library C++ driver and tests live in [edge/rock-pi-e](edge/rock-pi-e).

## Forecasting and scenario economics

The independent [forecasting service](services/forecasting/README.md) contains
the first implementation contract for 72-hour PV, load and IBEX price forecasts.
It uses LightGBM for the tabular time-series model and a transparent scenario
calculator for import cost, export revenue, battery degradation and imbalance.
Forecasting remains in the cloud strategy layer; safety enforcement remains on
the edge gateway.

## Development

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Build the full Sites/Cloudflare version:

```bash
npm run build
```

Build the static GitHub Pages version:

```bash
npm run build:pages
```

## Open source

This repository is open source under the [MIT License](LICENSE). Contributions and technical discussion are welcome. Product names and trademarks remain the property of their respective owners.

External protocol projects are references, not bundled dependencies. In
particular, `ai-republic/bms-to-inverter` uses CC BY-NC-SA 4.0; its source code
is not copied into GrideX. Commercial driver implementations require original
code based on manufacturer specifications and validated laboratory traces.

## Author

Concept and system architecture: **Antouan Anguelov**
[Digital profile](https://linkmy.cards/en/antouan-anguelov/) · [LinkedIn](https://www.linkedin.com/in/antouan/)

---

## Български

**Open-source EMS демонстрация за индустриални фотоволтаици, батерийни системи и управляеми товари.**

GrideX Energy OS е двуезична продуктова демонстрация на индустриална система за енергиен мениджмънт. Тя включва наблюдение на портфолио, управление на BESS, графици „ден напред“, логика по цени на IBEX, прогнози за времето и производството, намаляване на небаланса, планиране на индустриални товари, SCADA интеграция и Edge защити.

### Демонстрация

Публичната GitHub Pages версия се публикува автоматично от клона `main`:

**https://gridex.tech/**

Интерфейсът използва представителни демонстрационни данни. Той не е свързан с реална енергийна инсталация и не трябва да се използва за производствено управление без специфично инженерно проектиране, тестове и валидиране на безопасността.

Същият build е подготвен за защитен live режим. `public/gridex-config.js` избира `demo` или `live`; реалните данни и команди преминават през `api.gridex.tech`, никога директно от браузъра към OpenRemote или полево устройство.

### Функционален обхват

- табла за PV, BESS, мрежа, товари и EV зарядни станции;
- SOC, SOH, лимити, цикли и дневна амортизация на батерията;
- IBEX цени „ден напред“, исторически данни и прогнозни сценарии;
- тридневни прогнози за PV и товар, свързани с времето;
- режими за арбитраж, собствено потребление, zero export и peak shaving;
- графици към търговец, 15-минутен небаланс и сетълмент;
- ERP/MES входове и управление на гъвкави индустриални товари;
- каталог на устройства и драйвери за Deye, Sungrow, Huawei, Growatt и други;
- OpenRemote Asset архитектура и локален Modbus Edge Gateway;
- safety envelope, BMS лимити, software fuse, heartbeat и safe mode;
- Free, Pro и Enterprise функционални планове.

### Архитектура

Производствената концепция разделя стратегията от безопасността:

1. Оптимизационният слой изчислява графици и желана мощност.
2. OpenRemote представя обектите и устройствата като Assets и координира телеметрията и командите.
3. Защитният слой ограничава всяка команда спрямо текущите BMS и обектови лимити.
4. Локалният Edge Gateway нормализира различните Modbus карти и поддържа времекритичните функции при отпадане на облака.

Облачната част работи като Docker услуги. OpenRemote Manager, Keycloak и поддържаната PostgreSQL услуга остават един оперативен stack. GrideX добавя частен API и отделна open-source PostgreSQL база за организации, тарифи, конфигурации, инциденти и одит. За Edge комуникация се използва вграденият MQTTS API на OpenRemote, без втори MQTT broker в първата версия. Подробностите са в [DOCKER_CLOUD_TOPOLOGY.md](docs/architecture/DOCKER_CLOUD_TOPOLOGY.md).

Опционалният Waveshare 2-CH CAN TO ETH транспорт и правилата за валидиране са описани в [WAVESHARE_AND_PROTOCOL_REFERENCES.md](docs/edge/WAVESHARE_AND_PROTOCOL_REFERENCES.md). Потвърденият от производителя Suntech STE-261L / SunStorage Pro 261 профил е в [SUNTECH_STE261L_MODBUS.md](docs/edge/SUNTECH_STE261L_MODBUS.md), а C++ драйверът и тестовете са в [edge/rock-pi-e](edge/rock-pi-e).

### Прогнози и икономика на сценариите

Самостоятелната [услуга за прогнозиране](services/forecasting/README.md) дефинира 72-часови прогнози за PV, товар и IBEX цени. Използва LightGBM и прозрачен калкулатор за разход за внос, приход от износ, деградация на батерията и небаланс. Прогнозирането остава в облачния стратегически слой, а защитите се изпълняват в Edge Gateway.

### Разработка

Изисква се Node.js 22.13 или по-нова версия.

```bash
npm ci
npm run dev
```

Build за Sites/Cloudflare:

```bash
npm run build
```

Статичен build за GitHub Pages:

```bash
npm run build:pages
```

### Open source

Хранилището е open source под [MIT License](LICENSE). Приносът и техническите дискусии са добре дошли. Имената на продукти и търговските марки са собственост на съответните им притежатели.

Външните протоколни проекти са само референции. Кодът на `ai-republic/bms-to-inverter`, лицензиран под CC BY-NC-SA 4.0, не се копира в GrideX. Комерсиалните драйвери трябва да са оригинални реализации по производителски спецификации и валидирани лабораторни записи.

### Автор

Концепция и системна архитектура: **Антоан Ангелов**
[Дигитален профил](https://linkmy.cards/en/antouan-anguelov/) · [LinkedIn](https://www.linkedin.com/in/antouan/)
