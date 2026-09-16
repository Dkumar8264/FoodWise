from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from train import MODEL_PATH, train
from features import build_feature_row, scale_prediction

app = FastAPI(title='FoodWise ML Service')

class PredictionRequest(BaseModel):
    date: str = str(date.today())
    studentCount: int = 1240
    event: str = 'None'
    weather: str = 'Clear'
    dishes: list[dict] = [{"dish": "Vegetable pulao", "meal": "Lunch", "base": 180}]

def train_demo_model(base):
    """Replace generated sample with MongoDB-exported service logs in production."""
    rng = np.random.default_rng(42)
    features = rng.uniform(0, 1, (180, 6))
    target = base * (.76 + .34 * features[:, 0] + .08 * features[:, 1] - .1 * features[:, 2]) + rng.normal(0, base * .035, 180)
    split = 145
    model = RandomForestRegressor(n_estimators=120, max_depth=7, random_state=42).fit(features[:split], target[:split])
    prediction = model.predict(features[split:])
    return model, round(mean_absolute_error(target[split:], prediction), 2), round(root_mean_squared_error(target[split:], prediction), 2)

def real_model_prediction(payload, dish):
    """Predict with the persisted Atlas-trained model, scaled to the requested dish baseline."""
    artifact = joblib.load(MODEL_PATH)
    feature_row = build_feature_row(payload.date, payload.studentCount, payload.event, payload.weather, dish.get('lag7', dish.get('base', 120)))
    base_quantity = dish.get('base', artifact['targetMean'])
    quantity = scale_prediction(artifact['model'].predict(feature_row)[0], base_quantity, artifact['targetMean'])
    return quantity, artifact['metrics']

@app.get('/health')
def health():
    return {'status': 'ok', 'model': 'RandomForestRegressor', 'trainedModelAvailable': MODEL_PATH.exists()}

@app.post('/train')
def train_model():
    try:
        return {'status': 'trained', 'metrics': train()}
    except ValueError as error:
        return {'status': 'not-trained', 'message': str(error)}

@app.post('/predict')
def predict(payload: PredictionRequest):
    weekday = date.fromisoformat(payload.date).weekday()
    event_flag = int(payload.event.lower() not in ['none', 'holiday'])
    holiday_flag = int(payload.event.lower() == 'holiday')
    predictions, maes, rmses = [], [], []
    for dish in payload.dishes:
        base = dish.get('base', 120)
        if MODEL_PATH.exists():
            quantity, metrics = real_model_prediction(payload, dish); mae, rmse = metrics['mae'], metrics['rmse']; source = 'Atlas-trained Random Forest'
        else:
            model, mae, rmse = train_demo_model(base)
            features = np.array([[weekday / 6, min(payload.studentCount / 1800, 1), event_flag, holiday_flag, .55, .48]])
            quantity = max(0, round(float(model.predict(features)[0]))); source = 'Demo Random Forest fallback'
        predictions.append({'date': payload.date, 'dish': dish['dish'], 'meal': dish['meal'], 'predictedQuantity': quantity, 'unit': dish.get('unit', 'plates'), 'confidence': round(max(80, 97 - mae / base * 100), 1), 'features': {'weekday': weekday, 'studentCount': payload.studentCount, 'event': payload.event}})
        maes.append(mae); rmses.append(rmse)
    return {'predictions': predictions, 'metrics': {'mae': round(float(np.mean(maes)), 2), 'rmse': round(float(np.mean(rmses)), 2), 'model': source, 'trainedModelAvailable': MODEL_PATH.exists()}}
