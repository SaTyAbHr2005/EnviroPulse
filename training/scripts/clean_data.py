import pandas as pd
import numpy as np
import os

# =====================================
# Paths
# =====================================
INPUT_PATH = "data/raw/station_hour.csv"
OUTPUT_DIR = "data/processed"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "clean_air_quality.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Loading raw dataset...")
df = pd.read_csv(INPUT_PATH)

print("Original shape:", df.shape)

# =====================================
# Required Columns (Improved)
# =====================================
required_columns = [
    "StationId",
    "Datetime",
    "PM2.5",
    "PM10",
    "NO2",
    "CO",
    "SO2",
    "O3",
    "NH3",
    "AQI"
]

# Keep only required columns
df = df[required_columns]

print("After column selection:", df.shape)

# =====================================
# Datetime Cleaning
# =====================================
df["Datetime"] = pd.to_datetime(df["Datetime"], errors="coerce")

# Remove invalid datetime rows
df = df.dropna(subset=["Datetime"])

# Extract hour
df["hour"] = df["Datetime"].dt.hour

# =====================================
# Convert numeric columns
# =====================================
numeric_cols = [
    "PM2.5",
    "PM10",
    "NO2",
    "CO",
    "SO2",
    "O3",
    "NH3",
    "AQI"
]

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Remove rows with missing values
df = df.dropna()

print("After removing missing values:", df.shape)

# =====================================
# Remove unrealistic values (Outliers)
# =====================================
df = df[
    (df["PM2.5"] >= 0) & (df["PM2.5"] < 500) &
    (df["PM10"] >= 0) & (df["PM10"] < 800) &
    (df["NO2"] >= 0) & (df["NO2"] < 300) &
    (df["CO"] >= 0) & (df["CO"] < 10) &
    (df["SO2"] >= 0) & (df["SO2"] < 200) &
    (df["O3"] >= 0) & (df["O3"] < 300) &
    (df["NH3"] >= 0) & (df["NH3"] < 200) &
    (df["AQI"] >= 0) & (df["AQI"] < 600)
]

print("After outlier removal:", df.shape)

# =====================================
# Sort Data
# =====================================
df = df.sort_values(by="Datetime")

# =====================================
# Save Clean File
# =====================================
df.to_csv(OUTPUT_PATH, index=False)

print("\nClean dataset saved at:", OUTPUT_PATH)
print("Final shape:", df.shape)

print("\nColumns:")
print(df.columns)