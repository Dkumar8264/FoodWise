import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from features import build_feature_row, scale_prediction


class FeatureEngineeringTests(unittest.TestCase):
    def test_build_feature_row_uses_expected_order_and_flags(self):
        row = build_feature_row('2026-09-17', 1240, 'Cultural Fest', 'Rain', 180)
        self.assertEqual(row, [[3, 9, 1240, 1, 0, 1, 180]])

    def test_holiday_is_not_counted_as_special_event(self):
        row = build_feature_row('2026-01-01', 500, 'Holiday', 'Clear', 90)
        self.assertEqual(row[0][3:6], [0, 1, 0])

    def test_scale_prediction_handles_quantity_and_invalid_mean(self):
        self.assertEqual(scale_prediction(200, 150, 100), 300)
        self.assertEqual(scale_prediction(-10, 150, 100), 0)
        with self.assertRaises(ValueError):
            scale_prediction(100, 150, 0)


if __name__ == '__main__':
    unittest.main()
