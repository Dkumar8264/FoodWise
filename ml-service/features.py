from datetime import date


def build_feature_row(target_date: str, student_count: int, event: str, weather: str, lag7: float) -> list[list[float]]:
    """Build the exact feature order used by the persisted Random Forest model."""
    parsed_date = date.fromisoformat(target_date)
    normalized_event = event.lower()
    return [[
        parsed_date.weekday(), parsed_date.month, student_count,
        int(normalized_event not in ['none', 'holiday']),
        int(normalized_event == 'holiday'),
        int(weather.lower() == 'rain'), lag7
    ]]


def scale_prediction(raw_prediction: float, base_quantity: float, target_mean: float) -> int:
    if target_mean <= 0:
        raise ValueError('target_mean must be greater than zero')
    return max(0, round(float(raw_prediction) * (base_quantity / target_mean)))
