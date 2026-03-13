import pandas as pd

# =====================================
# Path
# =====================================
DATA_PATH = "data/processed/clean_air_quality.csv"

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

# =====================================
# Basic Info
# =====================================
print("\n===== BASIC INFORMATION =====")
print("Shape:", df.shape)

print("\nColumns:")
print(df.columns)

print("\nData Types:")
print(df.dtypes)

# =====================================
# Missing Values
# =====================================
print("\n===== MISSING VALUES =====")
missing = df.isnull().sum()
print(missing)

# =====================================
# Duplicate Check
# =====================================
print("\n===== DUPLICATES =====")
duplicates = df.duplicated().sum()
print("Duplicate rows:", duplicates)

# =====================================
# Datetime Check
# =====================================
if "Datetime" in df.columns:
    df["Datetime"] = pd.to_datetime(df["Datetime"], errors="coerce")
    
    print("\n===== DATETIME RANGE =====")
    print("Start:", df["Datetime"].min())
    print("End:", df["Datetime"].max())

# =====================================
# Basic Statistics
# =====================================
print("\n===== STATISTICS =====")
print(df.describe())

# =====================================
# Value Range Check (Important for AQI)
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

print("\n===== VALUE RANGES =====")
for col in numeric_cols:
    if col in df.columns:
        print(f"{col}: min={df[col].min()}, max={df[col].max()}")

# =====================================
# Hour Check
# =====================================
if "hour" in df.columns:
    print("\nHour unique values:")
    print(sorted(df["hour"].unique()))

print("\nData check completed.")