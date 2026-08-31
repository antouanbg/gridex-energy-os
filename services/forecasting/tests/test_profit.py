import unittest

from gridex_forecasting.profit import IntervalEconomics, compare_scenarios, forecast_profit


class ProfitForecastTest(unittest.TestCase):
    def test_costs_include_battery_wear_and_imbalance(self) -> None:
        result = forecast_profit(
            [
                IntervalEconomics(
                    baseline_import_kwh=100,
                    grid_import_kwh=40,
                    grid_export_kwh=20,
                    import_price_bgn_mwh=200,
                    export_price_bgn_mwh=180,
                    battery_charge_kwh=25,
                    battery_discharge_kwh=15,
                    degradation_bgn_kwh=0.05,
                    expected_imbalance_kwh=5,
                    imbalance_price_bgn_mwh=300,
                )
            ]
        )
        self.assertEqual(result.baseline_cost_bgn, 20.0)
        self.assertEqual(result.import_cost_bgn, 8.0)
        self.assertEqual(result.export_revenue_bgn, 3.6)
        self.assertEqual(result.degradation_cost_bgn, 2.0)
        self.assertEqual(result.imbalance_cost_bgn, 1.5)
        self.assertEqual(result.net_profit_bgn, 12.1)

    def test_selects_highest_profit_scenario(self) -> None:
        base = [IntervalEconomics(100, 80, 0, 200, 180)]
        optimised = [IntervalEconomics(100, 40, 20, 200, 180)]
        selected, results = compare_scenarios({"pv-surplus": base, "grid-charge": optimised})
        self.assertEqual(selected, "grid-charge")
        self.assertGreater(results["grid-charge"].net_profit_bgn, results["pv-surplus"].net_profit_bgn)


if __name__ == "__main__":
    unittest.main()

