"""GrideX forecasting and dispatch-scenario economics."""

from .profit import IntervalEconomics, ProfitForecast, compare_scenarios, forecast_profit

__all__ = [
    "FEATURE_COLUMNS",
    "TARGET_COLUMNS",
    "IntervalEconomics",
    "LightGBMForecastModel",
    "ProfitForecast",
    "compare_scenarios",
    "forecast_profit",
]


def __getattr__(name: str):
    """Load the optional LightGBM runtime only when model classes are requested."""

    if name in {"FEATURE_COLUMNS", "TARGET_COLUMNS", "LightGBMForecastModel"}:
        from . import model

        return getattr(model, name)
    raise AttributeError(name)
