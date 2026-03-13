import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

aqi_data = "../../training/data/processed/clean_air_quality.csv"
aqi_model = "../../models/aqi_model.pkl"
fc_model = "../../models/aqi_forecast_model.pkl"
noise_data = "../../training/data/processed/clean_noise_data.csv"
noise_model = "../../models/noise_model.pkl"

def eval_aqi():
    if not os.path.exists(aqi_data) or not os.path.exists(aqi_model): return "Missing file"
    df = pd.read_csv(aqi_data)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df["day"], df["month"], df["weekday"] = df["Datetime"].dt.day, df["Datetime"].dt.month, df["Datetime"].dt.weekday
    features = ["PM2.5", "PM10", "NO2", "CO", "SO2", "O3", "NH3", "hour", "day", "month", "weekday"]
    X, y = df[features], df["AQI"]
    _, Xt, _, yt = train_test_split(X, y, test_size=0.1, random_state=42)
    m = joblib.load(aqi_model)
    p = m.predict(Xt)
    return f"RMSE: {np.sqrt(mean_squared_error(yt, p)):.2f}, R2: {r2_score(yt, p):.4f}"

def eval_fc():
    if not os.path.exists(aqi_data) or not os.path.exists(fc_model): return "Missing file"
    df = pd.read_csv(aqi_data)
    df["Datetime"] = pd.to_datetime(df["Datetime"])
    df = df.sort_values(["StationId", "Datetime"])
    for l in [1, 2, 3, 6]: df[f"AQI_lag_{l}"] = df.groupby("StationId")["AQI"].shift(l)
    df = df.dropna()
    features = [f"AQI_lag_{l}" for l in [1, 2, 3, 6]]
    X, y = df[features], df["AQI"]
    s = int(len(X) * 0.9)
    Xt, yt = X[s:], y[s:]
    m = joblib.load(fc_model)
    p = m.predict(Xt)
    return f"RMSE: {np.sqrt(mean_squared_error(yt, p)):.2f}, R2: {r2_score(yt, p):.4f}"

def eval_noise():
    if not os.path.exists(noise_data) or not os.path.exists(noise_model): return "Missing file"
    df = pd.read_csv(noise_data)
    X, y = df.drop(columns=["decibel_level"]), df["decibel_level"]
    _, Xt, _, yt = train_test_split(X, y, test_size=0.2, random_state=42)
    m = joblib.load(noise_model)
    try: p = m.predict(Xt)
    except: return "Feature mismatch"
    return f"RMSE: {np.sqrt(mean_squared_error(yt, p)):.2f}, R2: {r2_score(yt, p):.4f}"

print("AQI Prediction Model: ", eval_aqi())
print("AQI Forecast Model:   ", eval_fc())
print("Noise Prediction Model:", eval_noise())
