# GrideX Forecasting Service

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

