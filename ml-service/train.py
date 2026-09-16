"""Train FoodWise demand model from MongoDB Atlas service logs.

Run with: python train.py
Requires MONGODB_URI in the process environment or ml-service/.env.
"""
import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).parent
MODEL_PATH = ROOT / 'foodwise_model.joblib'

def feature_frame(records):
    frame = pd.DataFrame(records)
    if len(frame) < 10:
        raise ValueError('At least 10 service logs are required to train the model.')
    frame['date'] = pd.to_datetime(frame['date'])
    frame['weekday'] = frame['date'].dt.dayofweek
    frame['month'] = frame['date'].dt.month
    frame['event_flag'] = (~frame['event'].fillna('None').str.lower().isin(['none', 'holiday'])).astype(int)
    frame['holiday_flag'] = (frame['event'].fillna('None').str.lower() == 'holiday').astype(int)
    frame['weather_rain'] = (frame['weather'].fillna('Clear').str.lower() == 'rain').astype(int)
    frame = frame.sort_values('date')
    frame['lag_7'] = frame['consumed'].shift(7).bfill()
    return frame

def train(mongo_uri=None):
    uri = mongo_uri or os.getenv('MONGODB_URI')
    if not uri:
        raise ValueError('MONGODB_URI is required to train the FoodWise model.')
    records = list(MongoClient(uri).get_default_database()['servicelogs'].find({}, {'_id': 0}))
    frame = feature_frame(records)
    features = ['weekday', 'month', 'studentCount', 'event_flag', 'holiday_flag', 'weather_rain', 'lag_7']
    x, y = frame[features].fillna(0), frame['consumed']
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=.25, random_state=42)
    model = RandomForestRegressor(n_estimators=250, min_samples_leaf=2, random_state=42).fit(x_train, y_train)
    test_pred = model.predict(x_test)
    metrics = {'mae': round(float(mean_absolute_error(y_test, test_pred)), 2), 'rmse': round(float(root_mean_squared_error(y_test, test_pred)), 2), 'trainingRows': int(len(frame)), 'features': features}
    joblib.dump({'model': model, 'features': features, 'metrics': metrics, 'targetMean': float(y.mean())}, MODEL_PATH)
    return metrics

if __name__ == '__main__':
    print(train())
