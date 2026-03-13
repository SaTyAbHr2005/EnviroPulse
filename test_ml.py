import sys
import os
import pandas as pd
import logging

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.ml.aqi_predictor import aqi_predictor
from backend.ml.noise_predictor import noise_predictor

def test_predictors():
    pollutants = {
        "pm25": 120.5,
        "pm10": 210.2,
        "no2": 45.3,
        "co": 0.8,
        "so2": 15.2,
        "o3": 85.0,
        "nh3": 35.1
    }
    
    print("Testing AQI Prediction...")
    aqi = aqi_predictor.predict_aqi(pollutants)
    print(f"AQI Result: {aqi}")
    
    print("\nTesting Noise Prediction...")
    noise = noise_predictor.predict_noise({"traffic_density": 75.0})
    print(f"Noise Result: {noise}")

if __name__ == "__main__":
    test_predictors()
