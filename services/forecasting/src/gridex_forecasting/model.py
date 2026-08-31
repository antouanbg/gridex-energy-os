"""LightGBM model contract for 15-minute PV, load and price forecasts."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import pandas as pd
from lightgbm import LGBMRegressor

TARGET_COLUMNS = ("pv_kw", "load_kw", "price_bgn_mwh")
FEATURE_COLUMNS = (
    "horizon_steps",
    "hour_sin",
    "hour_cos",
    "weekday_sin",
    "weekday_cos",
    "month_sin",
    "month_cos",
    "irradiance_w_m2",
    "cloud_cover_pct",
    "temperature_c",
    "wind_speed_m_s",
    "pv_lag_1",
    "pv_lag_4",
    "pv_lag_96",
    "pv_lag_672",
    "pv_mean_4",
    "pv_mean_96",
    "load_lag_1",
    "load_lag_4",
    "load_lag_96",
    "load_lag_672",
    "load_mean_4",
    "load_mean_96",
    "price_lag_1",
    "price_lag_4",
    "price_lag_96",
    "price_lag_672",
    "price_mean_4",
    "price_mean_96",
    "soc_pct",
    "max_charge_kw",
    "max_discharge_kw",
    "erp_planned_load_kw",
)


@dataclass(frozen=True)
class ModelConfig:
    n_estimators: int = 600
    learning_rate: float = 0.035
    num_leaves: int = 31
    max_depth: int = 8
    min_child_samples: int = 48
    subsample: float = 0.85
    colsample_bytree: float = 0.85
    random_state: int = 42


@dataclass
class LightGBMForecastModel:
    """Train one deterministic regressor per forecast target.

    The caller owns feature generation and must provide time-ordered training
    rows. Each future row uses weather forecasts and lag values available at its
    forecast origin; target data from the future must never be used as features.
    """

    config: ModelConfig = field(default_factory=ModelConfig)
    models: dict[str, LGBMRegressor] = field(default_factory=dict, init=False)

    def fit(self, frame: pd.DataFrame) -> "LightGBMForecastModel":
        self._validate(frame, require_targets=True)
        clean = frame.dropna(subset=[*FEATURE_COLUMNS, *TARGET_COLUMNS])
        if clean.empty:
            raise ValueError("No complete time-ordered training rows are available")

        features = clean.loc[:, FEATURE_COLUMNS]
        parameters = {
            "objective": "regression_l1",
            "n_estimators": self.config.n_estimators,
            "learning_rate": self.config.learning_rate,
            "num_leaves": self.config.num_leaves,
            "max_depth": self.config.max_depth,
            "min_child_samples": self.config.min_child_samples,
            "subsample": self.config.subsample,
            "colsample_bytree": self.config.colsample_bytree,
            "random_state": self.config.random_state,
            "n_jobs": -1,
            "verbosity": -1,
        }
        self.models = {}
        for target in TARGET_COLUMNS:
            model = LGBMRegressor(**parameters)
            model.fit(features, clean[target])
            self.models[target] = model
        return self

    def predict(self, future_features: pd.DataFrame) -> pd.DataFrame:
        self._validate(future_features, require_targets=False)
        if set(self.models) != set(TARGET_COLUMNS):
            raise RuntimeError("The LightGBM forecast model has not been fitted")

        result = pd.DataFrame(index=future_features.index)
        if "timestamp" in future_features:
            result["timestamp"] = future_features["timestamp"]
        for target, model in self.models.items():
            predicted = model.predict(future_features.loc[:, FEATURE_COLUMNS])
            result[target] = predicted.clip(0, None) if target != "price_bgn_mwh" else predicted
        return result

    def feature_importance(self, target: str) -> dict[str, int]:
        if target not in self.models:
            raise ValueError(f"Unknown or unfitted target: {target}")
        values = self.models[target].feature_importances_
        return dict(sorted(zip(FEATURE_COLUMNS, values, strict=True), key=lambda item: item[1], reverse=True))

    @staticmethod
    def _validate(frame: pd.DataFrame, *, require_targets: bool) -> None:
        required = set(FEATURE_COLUMNS)
        if require_targets:
            required.update(TARGET_COLUMNS)
        missing = sorted(required.difference(frame.columns))
        if missing:
            raise ValueError(f"Missing forecast columns: {', '.join(missing)}")
