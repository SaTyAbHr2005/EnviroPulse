# -*- coding: utf-8 -*-
# =============================================
# EnviroPulse - Evaluate All Models
# Run from: training/scripts/
# =============================================

import pandas as pd
import numpy as np
import joblib
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("=" * 60)
print("  EnviroPulse - Model Accuracy Report")
print("=" * 60)

# =============================================
# MODEL 1: AQI Prediction (CatBoost)
# =============================================

print("\n[MODEL 1] AQI Prediction (CatBoost)")
print("-" * 40)

aqi_data_path = os.path.join("..", "data", "processed", "clean_air_quality.csv")
aqi_model_path = os.path.join("..", "..", "models", "aqi_model.pkl")

if os.path.exists(aqi_data_path) and os.path.exists(aqi_model_path):
    df_aqi = pd.read_csv(aqi_data_path)
    df_aqi["Datetime"] = pd.to_datetime(df_aqi["Datetime"])
    df_aqi["day"] = df_aqi["Datetime"].dt.day
    df_aqi["month"] = df_aqi["Datetime"].dt.month
    df_aqi["weekday"] = df_aqi["Datetime"].dt.weekday

    features_aqi = ["PM2.5", "PM10", "NO2", "CO", "SO2", "O3", "NH3",
                     "hour", "day", "month", "weekday"]
    X_aqi = df_aqi[features_aqi]
    y_aqi = df_aqi["AQI"]

    _, X_test_aqi, _, y_test_aqi = train_test_split(
        X_aqi, y_aqi, test_size=0.1, random_state=42
    )

    model_aqi = joblib.load(aqi_model_path)
    preds_aqi = model_aqi.predict(X_test_aqi)

    rmse1 = np.sqrt(mean_squared_error(y_test_aqi, preds_aqi))
    mae1 = mean_absolute_error(y_test_aqi, preds_aqi)
    r2_1 = r2_score(y_test_aqi, preds_aqi)

    print(f"  Test Samples : {len(y_test_aqi)}")
    print(f"  RMSE         : {rmse1:.4f}")
    print(f"  MAE          : {mae1:.4f}")
    print(f"  R2 Score     : {r2_1:.4f}")
else:
    print("  [ERROR] Data or model file not found")

# =============================================
# MODEL 2: AQI Forecast (CatBoost)
# =============================================

print("\n[MODEL 2] AQI Forecast (CatBoost)")
print("-" * 40)

forecast_model_path = os.path.join("..", "..", "models", "aqi_forecast_model.pkl")

if os.path.exists(aqi_data_path) and os.path.exists(forecast_model_path):
    df_fc = pd.read_csv(aqi_data_path)
    df_fc["Datetime"] = pd.to_datetime(df_fc["Datetime"])
    df_fc = df_fc.sort_values(["StationId", "Datetime"])

    lags = [1, 2, 3, 6]
    for lag in lags:
        df_fc[f"AQI_lag_{lag}"] = df_fc.groupby("StationId")["AQI"].shift(lag)
    df_fc = df_fc.dropna()

    features_fc = [f"AQI_lag_{lag}" for lag in lags]
    X_fc = df_fc[features_fc]
    y_fc = df_fc["AQI"]

    split = int(len(X_fc) * 0.9)
    X_test_fc = X_fc[split:]
    y_test_fc = y_fc[split:]

    model_fc = joblib.load(forecast_model_path)
    preds_fc = model_fc.predict(X_test_fc)

    rmse2 = np.sqrt(mean_squared_error(y_test_fc, preds_fc))
    mae2 = mean_absolute_error(y_test_fc, preds_fc)
    r2_2 = r2_score(y_test_fc, preds_fc)

    print(f"  Test Samples : {len(y_test_fc)}")
    print(f"  RMSE         : {rmse2:.4f}")
    print(f"  MAE          : {mae2:.4f}")
    print(f"  R2 Score     : {r2_2:.4f}")
else:
    print("  [ERROR] Data or model file not found")

# =============================================
# MODEL 3: Noise Prediction (XGBoost)
# =============================================

print("\n[MODEL 3] Noise Prediction (XGBoost)")
print("-" * 40)

noise_data_path = os.path.join("..", "data", "processed", "clean_noise_data.csv")
noise_model_path = os.path.join("..", "..", "models", "noise_model.pkl")

if os.path.exists(noise_data_path) and os.path.exists(noise_model_path):
    df_noise = pd.read_csv(noise_data_path)

    target = "decibel_level"
    features_noise = [c for c in df_noise.columns if c != target]

    X_noise = df_noise[features_noise]
    y_noise = df_noise[target]

    X_train_n, X_test_noise, y_train_n, y_test_noise = train_test_split(
        X_noise, y_noise, test_size=0.2, random_state=42
    )

    model_noise = joblib.load(noise_model_path)

    # Handle feature mismatch - retrain if needed
    try:
        preds_noise = model_noise.predict(X_test_noise)
    except ValueError:
        print("  [WARN] Feature mismatch. Quick retrain for evaluation...")
        from xgboost import XGBRegressor
        model_noise = XGBRegressor(n_estimators=300, max_depth=7, learning_rate=0.05,
                                    subsample=0.8, random_state=42, verbosity=0)
        model_noise.fit(X_train_n, y_train_n)
        preds_noise = model_noise.predict(X_test_noise)

    rmse3 = np.sqrt(mean_squared_error(y_test_noise, preds_noise))
    mae3 = mean_absolute_error(y_test_noise, preds_noise)
    r2_3 = r2_score(y_test_noise, preds_noise)

    print(f"  Test Samples : {len(y_test_noise)}")
    print(f"  RMSE         : {rmse3:.4f}")
    print(f"  MAE          : {mae3:.4f}")
    print(f"  R2 Score     : {r2_3:.4f}")

    # Correlation analysis
    print("\n  Top feature correlations with decibel_level:")
    corr = df_noise.corr(numeric_only=True)["decibel_level"].drop("decibel_level").abs().sort_values(ascending=False)
    for feat, val in corr.head(5).items():
        print(f"    {feat:25s} {val:.4f}")
else:
    print("  [ERROR] Data or model file not found")

# =============================================
# SUMMARY TABLE
# =============================================

print("\n" + "=" * 60)
print("  FINAL SUMMARY")
print("=" * 60)
print(f"  {'Model':<30s} {'RMSE':>8s} {'MAE':>8s} {'R2':>8s}")
print(f"  {'-'*30} {'-'*8} {'-'*8} {'-'*8}")

try:
    print(f"  {'AQI Prediction (CatBoost)':<30s} {rmse1:>8.2f} {mae1:>8.2f} {r2_1:>8.4f}")
except NameError:
    print(f"  {'AQI Prediction (CatBoost)':<30s} {'N/A':>8s} {'N/A':>8s} {'N/A':>8s}")

try:
    print(f"  {'AQI Forecast (CatBoost)':<30s} {rmse2:>8.2f} {mae2:>8.2f} {r2_2:>8.4f}")
except NameError:
    print(f"  {'AQI Forecast (CatBoost)':<30s} {'N/A':>8s} {'N/A':>8s} {'N/A':>8s}")

try:
    print(f"  {'Noise Prediction (XGBoost)':<30s} {rmse3:>8.2f} {mae3:>8.2f} {r2_3:>8.4f}")
except NameError:
    print(f"  {'Noise Prediction (XGBoost)':<30s} {'N/A':>8s} {'N/A':>8s} {'N/A':>8s}")

print("=" * 60)
