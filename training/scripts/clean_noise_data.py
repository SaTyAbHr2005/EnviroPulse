# =============================================
# EnviroPulse – Noise Data Preprocessing
# Input:  datasets/noise/urban_noise_levels.csv
# Output: training/data/processed/clean_noise_data.csv
# =============================================

import pandas as pd
import numpy as np
import os

# =============================================
# PATHS (run from training/scripts/)
# =============================================

RAW_PATH = os.path.join("..", "..", "datasets", "noise", "urban_noise_levels.csv")
OUTPUT_DIR = os.path.join("..", "data", "processed")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "clean_noise_data.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# =============================================
# LOAD RAW DATA
# =============================================

print("Loading raw noise dataset...")
df = pd.read_csv(RAW_PATH)

print(f"Raw dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# =============================================
# DROP IDENTIFIERS & METADATA
# =============================================

drop_cols = ["id", "latitude", "longitude", "sensor_id", "noise_complaints"]

existing_drops = [c for c in drop_cols if c in df.columns]
df = df.drop(columns=existing_drops)

print(f"\nDropped columns: {existing_drops}")

# =============================================
# DATETIME PROCESSING
# =============================================

if "datetime" in df.columns:
    df["datetime"] = pd.to_datetime(df["datetime"])

    # Extract time features if not already present
    if "hour" not in df.columns:
        df["hour"] = df["datetime"].dt.hour
    if "day_of_week" not in df.columns:
        df["day_of_week"] = df["datetime"].dt.dayofweek
    if "is_weekend" not in df.columns:
        df["is_weekend"] = (df["datetime"].dt.dayofweek >= 5).astype(int)

    # Drop raw datetime
    df = df.drop(columns=["datetime"])

print(f"After datetime processing: {df.shape}")

# =============================================
# BOOLEAN TO INT CONVERSION
# =============================================

bool_cols = [
    "near_highway", "near_airport", "near_construction",
    "industrial_zone", "school_zone", "is_weekend",
    "holiday", "public_event"
]

for col in bool_cols:
    if col in df.columns:
        df[col] = df[col].astype(int)

# =============================================
# HANDLE MISSING VALUES
# =============================================

before = len(df)
df = df.dropna()
after = len(df)

print(f"Removed {before - after} rows with missing values")

# =============================================
# FINAL COLUMN ORDER
# =============================================

# Target column
target = "decibel_level"

# Feature columns (19 features)
feature_cols = [
    "traffic_density",
    "vehicle_count",
    "honking_events",
    "population_density",
    "near_highway",
    "near_airport",
    "near_construction",
    "industrial_zone",
    "school_zone",
    "park_proximity",
    "temperature_c",
    "humidity_%",
    "wind_speed_kmh",
    "precipitation_mm",
    "hour",
    "day_of_week",
    "is_weekend",
    "holiday",
    "public_event"
]

# Keep only available features + target
available_features = [f for f in feature_cols if f in df.columns]
missing_features = [f for f in feature_cols if f not in df.columns]

if missing_features:
    print(f"\n⚠️  Missing features (skipped): {missing_features}")

final_cols = available_features + [target]
df = df[final_cols]

print(f"\nFinal dataset shape: {df.shape}")
print(f"Features: {available_features}")
print(f"Target: {target}")

# =============================================
# SAVE PROCESSED DATA
# =============================================

df.to_csv(OUTPUT_PATH, index=False)
print(f"\n✅ Clean noise data saved at: {OUTPUT_PATH}")
print(f"   Rows: {len(df)}")
print(f"   Columns: {len(df.columns)}")
