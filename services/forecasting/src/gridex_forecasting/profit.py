"""Transparent scenario-profit calculation used after time-series forecasting."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Mapping


@dataclass(frozen=True)
class IntervalEconomics:
    """Expected energy and costs for one 15-minute dispatch interval."""

    baseline_import_kwh: float
    grid_import_kwh: float
    grid_export_kwh: float
    import_price_eur_mwh: float
    export_price_eur_mwh: float
    battery_charge_kwh: float = 0.0
    battery_discharge_kwh: float = 0.0
    degradation_eur_kwh: float = 0.0
    expected_imbalance_kwh: float = 0.0
    imbalance_price_eur_mwh: float = 0.0


@dataclass(frozen=True)
class ProfitForecast:
    baseline_cost_eur: float
    import_cost_eur: float
    export_revenue_eur: float
    degradation_cost_eur: float
    imbalance_cost_eur: float
    net_profit_eur: float


def forecast_profit(intervals: Iterable[IntervalEconomics]) -> ProfitForecast:
    """Return the forecast economic benefit relative to uncontrolled import."""

    baseline_cost = 0.0
    import_cost = 0.0
    export_revenue = 0.0
    degradation_cost = 0.0
    imbalance_cost = 0.0

    for item in intervals:
        _validate_non_negative(item)
        baseline_cost += item.baseline_import_kwh * item.import_price_eur_mwh / 1000
        import_cost += item.grid_import_kwh * item.import_price_eur_mwh / 1000
        export_revenue += item.grid_export_kwh * item.export_price_eur_mwh / 1000
        throughput = item.battery_charge_kwh + item.battery_discharge_kwh
        degradation_cost += throughput * item.degradation_eur_kwh
        imbalance_cost += item.expected_imbalance_kwh * item.imbalance_price_eur_mwh / 1000

    net_profit = baseline_cost - import_cost + export_revenue - degradation_cost - imbalance_cost
    return ProfitForecast(
        baseline_cost_eur=round(baseline_cost, 2),
        import_cost_eur=round(import_cost, 2),
        export_revenue_eur=round(export_revenue, 2),
        degradation_cost_eur=round(degradation_cost, 2),
        imbalance_cost_eur=round(imbalance_cost, 2),
        net_profit_eur=round(net_profit, 2),
    )


def compare_scenarios(scenarios: Mapping[str, Iterable[IntervalEconomics]]) -> tuple[str, dict[str, ProfitForecast]]:
    """Calculate every scenario and return the name with highest net profit."""

    if not scenarios:
        raise ValueError("At least one dispatch scenario is required")
    results = {name: forecast_profit(intervals) for name, intervals in scenarios.items()}
    selected = max(results, key=lambda name: results[name].net_profit_eur)
    return selected, results


def _validate_non_negative(item: IntervalEconomics) -> None:
    non_negative = (
        item.baseline_import_kwh,
        item.grid_import_kwh,
        item.grid_export_kwh,
        item.battery_charge_kwh,
        item.battery_discharge_kwh,
        item.degradation_eur_kwh,
        item.expected_imbalance_kwh,
        item.imbalance_price_eur_mwh,
    )
    if any(value < 0 for value in non_negative):
        raise ValueError("Energy quantities and cost coefficients cannot be negative")
