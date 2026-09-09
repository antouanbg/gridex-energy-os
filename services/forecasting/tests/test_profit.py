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
                    import_price_eur_mwh=100,
                    export_price_eur_mwh=90,
                    battery_charge_kwh=25,
                    battery_discharge_kwh=15,
                    degradation_eur_kwh=0.025,
                    expected_imbalance_kwh=5,
                    imbalance_price_eur_mwh=150,
                )
            ]
        )
        self.assertEqual(result.baseline_cost_eur, 10.0)
        self.assertEqual(result.import_cost_eur, 4.0)
        self.assertEqual(result.export_revenue_eur, 1.8)
        self.assertEqual(result.degradation_cost_eur, 1.0)
        self.assertEqual(result.imbalance_cost_eur, 0.75)
        self.assertEqual(result.net_profit_eur, 6.05)

    def test_selects_highest_profit_scenario(self) -> None:
        base = [IntervalEconomics(100, 80, 0, 100, 90)]
        optimised = [IntervalEconomics(100, 40, 20, 100, 90)]
        selected, results = compare_scenarios({"pv-surplus": base, "grid-charge": optimised})
        self.assertEqual(selected, "grid-charge")
        self.assertGreater(results["grid-charge"].net_profit_eur, results["pv-surplus"].net_profit_eur)


if __name__ == "__main__":
    unittest.main()
