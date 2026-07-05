import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')

def train_model():
    rng = np.random.default_rng(42)
    X = np.column_stack([rng.uniform(0, 250, 5000), rng.uniform(10, 48, 5000), rng.uniform(20, 450, 5000), rng.uniform(0, 8, 5000)])
    rain, temp, aqi, water = X.T
    noise = lambda: rng.normal(0, 4, len(X))
    y = np.column_stack([
        np.clip(rain * .30 + water * 7 + noise(), 0, 100),
        np.clip((temp - 20) * 3.8 + noise(), 0, 100),
        np.clip(rain * .24 + water * 4 + noise(), 0, 100),
        np.clip(aqi * .25 + noise(), 0, 100)
    ])
    model = RandomForestRegressor(n_estimators=80, random_state=42, n_jobs=-1).fit(X, y)
    joblib.dump(model, MODEL_PATH)
    return model

model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else train_model()

@app.get('/health')
def health(): return jsonify(ok=True)

@app.post('/predict')
def predict():
    d = request.get_json(silent=True) or {}
    row = [[float(d.get('rainfall', 65)), float(d.get('temperature', 34)), float(d.get('aqi', 98)), float(d.get('waterLevel', 2.7))]]
    values = np.clip(model.predict(row)[0], 0, 100)
    return jsonify(dict(zip(['floodRisk','heatwaveRisk','stormRisk','airQualityRisk'], [round(float(x), 1) for x in values])))

if __name__ == '__main__': app.run(host='0.0.0.0', port=5001)

