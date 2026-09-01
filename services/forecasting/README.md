# GrideX Forecasting Service

## English

This directory is the independent forecasting and scenario-economics module for
GrideX Energy OS. It is separated from the web portal and from the safety-critical
edge controller.

## Recommended model: LightGBM

The first production model is **LightGBM gradient-boosted decision trees**. It is
a strong fit for 15-minute EMS data because it handles nonlinear relationships
between historical PV/load/price values, weather forecasts and calendar features,
trains quickly on tabular data and exposes feature importance for operational
review.

The model predicts three independent time series for the next 72 hours:

- `pv_kw` — site photovoltaic production;
- `load_kw` — site demand, including ERP/MES production-plan features;
- `price_bgn_mwh` — IBEX day-ahead or intraday price.

The predictions are not sent directly to equipment. They feed a separate
15-minute schedule optimiser. OpenRemote receives the selected schedule and the
forecast KPIs, while the edge safety envelope still clamps every requested power
setpoint against live BMS and site limits.

## Feature contract

Every feature row represents one future 15-minute interval and contains:

- time: `timestamp`, `horizon_steps`, hour/day/month cyclical features;
- weather: irradiance, cloud cover, temperature and wind forecast;
- history: PV, load and price lags for 15 min, 1 h, 24 h and 7 days;
- rolling context: 1 h and 24 h means;
- site context: current SOC, available charge/discharge limits and ERP load plan.

`model.py` validates this contract and trains one reproducible LightGBM regressor
per target. Production validation must use walk-forward splits only; random
train/test splitting would leak future information into the past.

## Profit calculation

`profit.py` calculates the expected value of every candidate dispatch scenario:

```text
baseline energy cost
- scheduled import cost
+ export revenue
- battery degradation cost
- expected imbalance cost
= forecast scenario profit
```

The degradation input is the battery throughput cost in BGN/kWh derived from the
asset value, residual value, expected lifetime throughput and configured
depreciation method. This keeps apparently profitable arbitrage from being chosen
when it does not cover battery wear.

## Integration contract

The future cloud service should expose:

- `POST /api/v1/forecast/run` — generate the 72-hour PV/load/price forecast;
- `GET /api/v1/sites/{siteId}/forecast` — forecast series and confidence bands;
- `GET /api/v1/sites/{siteId}/forecast/economics` — scenario profit comparison;
- `POST /api/v1/sites/{siteId}/schedule/select` — approve a proposed schedule.

OpenRemote asset attributes should receive `forecastPvKw`, `forecastLoadKw`,
`forecastPriceBgnMwh`, `forecastProfit24hBgn`, `forecastConfidencePct`,
`forecastModelVersion` and `selectedScenario`. MQTT carries telemetry from the
site; authenticated HTTPS is used for forecast and schedule APIs.

## Local development

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e .
python -m unittest discover -s tests
```

The module is an implementation foundation, not a calibrated production model.
Site-specific training data, walk-forward backtesting, monitoring and safety
acceptance are required before live dispatch.

## Primary references

- [LightGBM documentation](https://lightgbm.readthedocs.io/en/stable/)
- [LightGBM paper, NeurIPS 2017](https://papers.nips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html)
- [TimeSeriesSplit documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)

---

## Български

Тази директория съдържа самостоятелния модул за прогнози и икономическа оценка на сценариите в GrideX Energy OS. Той е отделен от уеб портала и от критичния за безопасността Edge контролер.

### Препоръчан модел: LightGBM

Първият production модел използва **LightGBM gradient-boosted decision trees**. Той е подходящ за 15-минутни EMS данни, защото моделира нелинейните зависимости между историческите PV/товар/ценови стойности, метеорологичните прогнози и календарните признаци, обучава се бързо върху таблични данни и предоставя feature importance за оперативен преглед.

Моделът прогнозира три независими времеви реда за следващите 72 часа:

- `pv_kw` — фотоволтаично производство на обекта;
- `load_kw` — товар на обекта, включително ERP/MES производствени признаци;
- `price_bgn_mwh` — IBEX цена „ден напред“ или intraday цена.

Прогнозите не се изпращат директно към оборудването. Те захранват отделен 15-минутен оптимизатор. OpenRemote получава избрания график и прогнозните KPI, а Edge safety envelope продължава да ограничава всяка заявена мощност спрямо текущите BMS и обектови лимити.

### Договор за входните признаци

Всеки ред представя бъдещ 15-минутен интервал и съдържа:

- време: `timestamp`, `horizon_steps` и циклични час/ден/месец признаци;
- време и климат: прогнози за радиация, облачност, температура и вятър;
- история: PV, товар и ценови lag стойности за 15 min, 1 h, 24 h и 7 дни;
- rolling контекст: средни стойности за 1 h и 24 h;
- обектов контекст: текущ SOC, достъпни лимити за заряд/разряд и ERP план.

`model.py` валидира договора и обучава по един възпроизводим LightGBM regressor за всяка цел. Production валидирането трябва да използва само walk-forward разделяне; случайно train/test разделяне би допуснало информация от бъдещето в миналото.

### Изчисляване на печалбата

`profit.py` изчислява очакваната стойност на всеки dispatch сценарий:

```text
базов разход за енергия
- планиран разход за внос
+ приход от износ
- разход за деградация на батерията
- очакван разход за небаланс
= прогнозна печалба на сценария
```

Разходът за деградация е throughput стойността в BGN/kWh, изведена от стойността на актива, остатъчната стойност, очаквания lifetime throughput и избрания метод за амортизация. Така арбитраж не се избира, когато привидната печалба не покрива износването на батерията.

### Интеграционен договор

Бъдещата облачна услуга предоставя:

- `POST /api/v1/forecast/run` — генериране на 72-часова PV/товар/ценова прогноза;
- `GET /api/v1/sites/{siteId}/forecast` — прогнозни редове и confidence bands;
- `GET /api/v1/sites/{siteId}/forecast/economics` — сравнение на печалбата по сценарии;
- `POST /api/v1/sites/{siteId}/schedule/select` — одобряване на предложен график.

OpenRemote Asset атрибутите получават `forecastPvKw`, `forecastLoadKw`, `forecastPriceBgnMwh`, `forecastProfit24hBgn`, `forecastConfidencePct`, `forecastModelVersion` и `selectedScenario`. MQTT пренася телеметрията от обекта, а удостоверен HTTPS се използва за прогнозните и графиковите API.

### Локална разработка

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e .
python -m unittest discover -s tests
```

Модулът е основа за реализация, а не калибриран production модел. Преди live dispatch са задължителни обектови данни за обучение, walk-forward backtesting, мониторинг и приемане на безопасността.

### Основни източници

- [LightGBM documentation](https://lightgbm.readthedocs.io/en/stable/)
- [LightGBM paper, NeurIPS 2017](https://papers.nips.cc/paper/2017/hash/6449f44a102fde848669bdd9eb6b76fa-Abstract.html)
- [TimeSeriesSplit documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
