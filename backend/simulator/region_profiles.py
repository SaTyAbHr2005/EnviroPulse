# backend/simulator/region_profiles.py

# These profiles dictate the baseline raw telemetry ranges for each district.
# When the DB thread runs, sensors will first pull these geographic baselines
# before applying any Industrial (x1.5) or Traffic (x1.2) multiplier, allowing
# the ML models downstream to naturally calculate accurate localized Stress Scores.

REGION_PROFILES = {
    # Severe Baselines
    "Mumbai City": {
        "pm25": (120, 200),
        "pm10": (200, 350),
        "no2": (60, 110),
        "co": (2.0, 5.0),
        "so2": (40, 90),
        "o3": (80, 150),
        "nh3": (30, 80),
        "noise_db": (75, 95),
        "traffic_density": (70, 95)
    },
    "Solapur": {
        "pm25": (140, 220),
        "pm10": (250, 380),
        "no2": (70, 120),
        "co": (2.5, 5.5),
        "so2": (50, 100),
        "o3": (90, 160),
        "nh3": (40, 90),
        "noise_db": (80, 100),
        "traffic_density": (65, 90)
    },

    # Moderate Baselines
    "Pune": {
        "pm25": (90, 160),
        "pm10": (150, 280),
        "no2": (40, 80),
        "co": (1.0, 3.0),
        "so2": (20, 60),
        "o3": (50, 110),
        "nh3": (15, 50),
        "noise_db": (70, 90),
        "traffic_density": (60, 85)
    },
    "Nashik": {
        "pm25": (70, 130),
        "pm10": (120, 230),
        "no2": (30, 70),
        "co": (0.8, 2.5),
        "so2": (15, 50),
        "o3": (40, 90),
        "nh3": (10, 40),
        "noise_db": (65, 85),
        "traffic_density": (50, 75)
    },
    "Aurangabad": {
        "pm25": (100, 170),
        "pm10": (180, 290),
        "no2": (50, 90),
        "co": (1.5, 3.5),
        "so2": (25, 65),
        "o3": (60, 120),
        "nh3": (20, 60),
        "noise_db": (70, 90),
        "traffic_density": (60, 80)
    },

    # Poor / Intermediate Baselines
    "Nagpur": {
        "pm25": (70, 140),
        "pm10": (120, 220),
        "no2": (35, 75),
        "co": (1.0, 3.0),
        "so2": (20, 55),
        "o3": (45, 100),
        "nh3": (15, 45),
        "noise_db": (65, 85),
        "traffic_density": (55, 75)
    },
    "Amravati": {
        "pm25": (50, 110),
        "pm10": (100, 180),
        "no2": (25, 60),
        "co": (0.6, 2.0),
        "so2": (10, 40),
        "o3": (30, 80),
        "nh3": (10, 35),
        "noise_db": (60, 80),
        "traffic_density": (50, 70)
    },
    "Nanded": {
        "pm25": (60, 120),
        "pm10": (110, 200),
        "no2": (30, 65),
        "co": (0.8, 2.2),
        "so2": (15, 45),
        "o3": (35, 85),
        "nh3": (12, 40),
        "noise_db": (60, 85),
        "traffic_density": (55, 75)
    },

    # Low / Good Baselines
    "Thane": {
        "pm25": (80, 150),
        "pm10": (130, 250),
        "no2": (35, 75),
        "co": (1.2, 3.2),
        "so2": (20, 60),
        "o3": (45, 105),
        "nh3": (15, 50),
        "noise_db": (65, 85),
        "traffic_density": (55, 75)
    },
    "Kolhapur": {
        "pm25": (20, 70),
        "pm10": (40, 120),
        "no2": (10, 40),
        "co": (0.2, 1.2),
        "so2": (5, 25),
        "o3": (10, 50),
        "nh3": (5, 20),
        "noise_db": (50, 70),
        "traffic_density": (40, 60)
    }
}
