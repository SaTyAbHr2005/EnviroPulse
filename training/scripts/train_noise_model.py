# =============================================
# EnviroPulse – Noise Prediction Model Training
# Model: XGBoost Regressor
# Target: decibel_level
# Dataset: training/data/processed/clean_noise_data.csv
# =============================================

import pandas as pd
import numpy as np
import os
import joblib
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor

# =============================================
# PATHS (run from training/scripts/)
# =============================================

DATA_PATH = os.path.join("..", "data", "processed", "clean_noise_data.csv")
MODEL_PATH = os.path.join("..", "..", "models", "noise_model.pkl")

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

# =============================================
# LOAD PROCESSED DATASET
# =============================================

print("Loading processed noise dataset...")
df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# =============================================
# FEATURE SELECTION (19 features)
# =============================================

features = [
    # Traffic factors
    "traffic_density",
    "vehicle_count",
    "honking_events",
    "near_highway",

    # Urban environment
    "population_density",
    "near_airport",
    "near_construction",
    "industrial_zone",
    "school_zone",
    "park_proximity",

    # Weather impact
    "temperature_c",
    "humidity_%",
    "wind_speed_kmh",
    "precipitation_mm",

    # Temporal patterns
    "hour",
    "day_of_week",
    "is_weekend",
    "holiday",
    "public_event",
]

target = "decibel_level"

# Use only available features
available = [f for f in features if f in df.columns]
missing = [f for f in features if f not in df.columns]

if missing:
    print(f"\n⚠️  Missing columns (skipped): {missing}")

features = available

X = df[features]
y = df[target]

print(f"\nUsing {len(features)} features")
print(f"Feature matrix shape: {X.shape}")
print(f"Target shape: {y.shape}")
print(f"\nTarget stats:\n{y.describe()}")

# =============================================
# TRAIN / TEST SPLIT (80/20)
# =============================================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

print(f"\nTrain size: {X_train.shape}")
print(f"Test size:  {X_test.shape}")

# =============================================
# MODEL TRAINING
# =============================================

print("\nTraining XGBoost Noise Model...")

model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=7,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    verbosity=1
)

model.fit(X_train, y_train)

# =============================================
# EVALUATION
# =============================================

print("\nEvaluating...")

y_pred = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n" + "=" * 40)
print("  NOISE MODEL PERFORMANCE")
print("=" * 40)
print(f"  RMSE : {rmse:.4f}")
print(f"  MAE  : {mae:.4f}")
print(f"  R²   : {r2:.4f}")
print("=" * 40)

# =============================================
# FEATURE IMPORTANCE
# =============================================

print("\nFeature Importance:")
importance = model.feature_importances_

for f, imp in sorted(zip(features, importance), key=lambda x: x[1], reverse=True):
    bar = "█" * int(imp * 50)
    print(f"  {f:25s} {imp:.4f} {bar}")

# Plot feature importance
plt.figure(figsize=(12, 8))
sorted_idx = np.argsort(importance)
colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(features)))
plt.barh(
    [features[i] for i in sorted_idx],
    importance[sorted_idx],
    color=colors
)
plt.xlabel("Importance Score")
plt.title("EnviroPulse – Noise Model Feature Importance")
plt.tight_layout()

plot_path = os.path.join(os.path.dirname(MODEL_PATH), "noise_model_feature_importance.png")
plt.savefig(plot_path, dpi=150)
print(f"\nFeature importance plot saved at: {plot_path}")

# =============================================
# SAVE MODEL
# =============================================

joblib.dump(model, MODEL_PATH)
print(f"\n✅ Model saved at: {MODEL_PATH}")

# =============================================
# SAMPLE PREDICTION
# =============================================

sample = pd.DataFrame([{
    "traffic_density": 0.82,
    "vehicle_count": 420,
    "honking_events": 15,
    "near_highway": 1,
    "population_density": 11000,
    "near_airport": 0,
    "near_construction": 0,
    "industrial_zone": 0,
    "school_zone": 0,
    "park_proximity": 500,
    "temperature_c": 32,
    "humidity_%": 70,
    "wind_speed_kmh": 6,
    "precipitation_mm": 0,
    "hour": 18,
    "day_of_week": 3,
    "is_weekend": 0,
    "holiday": 0,
    "public_event": 0,
}])

sample = sample[features]
pred = model.predict(sample)[0]
print(f"\nSample Prediction:")
print(f"  Predicted Noise Level: {pred:.2f} dB")
