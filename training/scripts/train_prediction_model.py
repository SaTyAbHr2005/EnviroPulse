import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from catboost import CatBoostRegressor

# Paths (run from training/scripts/)
DATA_PATH = os.path.join("..", "data", "processed", "clean_air_quality.csv")
MODEL_DIR = os.path.join("..", "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "aqi_model.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

print("Dataset shape:", df.shape)

# =====================================
# Datetime Features
# =====================================
df["Datetime"] = pd.to_datetime(df["Datetime"])

df["day"] = df["Datetime"].dt.day
df["month"] = df["Datetime"].dt.month
df["weekday"] = df["Datetime"].dt.weekday

# =====================================
# Feature Selection
# =====================================
features = [
    "PM2.5",
    "PM10",
    "NO2",
    "CO",
    "SO2",
    "O3",
    "NH3",
    "hour",
    "day",
    "month",
    "weekday"
]

target = "AQI"

X = df[features]
y = df[target]

print("Feature matrix shape:", X.shape)

# =====================================
# Train/Test Split
# =====================================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.1,
    random_state=42
)

print("Train size:", X_train.shape)
print("Test size:", X_test.shape)

# =====================================
# Model Training (High Accuracy Config)
# =====================================
print("\nTraining CatBoost...")

model = CatBoostRegressor(
    iterations=1500,
    depth=8,
    learning_rate=0.03,
    l2_leaf_reg=5,
    loss_function="RMSE",
    random_seed=42,
    verbose=100
)

model.fit(X_train, y_train)

# =====================================
# Evaluation
# =====================================
print("\nEvaluating...")

y_pred = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\nPerformance")
print("RMSE:", rmse)
print("R2:", r2)

# =====================================
# Save Model
# =====================================
joblib.dump(model, MODEL_PATH)

print("\nModel saved at:", MODEL_PATH)

# Feature Importance
print("\nFeature Importance:")
importance = model.get_feature_importance()
for f, imp in zip(features, importance):
    print(f"{f}: {imp:.2f}")