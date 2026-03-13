import os
import pickle
import pandas as pd
import logging
import random

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "aqi_model.pkl")
FORECAST_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "aqi_forecast_model.pkl")

class AQIPredictor:
    def __init__(self):
        self.model = None
        self.forecast_model = None
        self.load_models()

    def load_models(self):
        try:
            if os.path.exists(MODEL_PATH):
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("AQI Model loaded successfully.")
            else:
                logger.warning(f"AQI Model file not found at {MODEL_PATH}")

            if os.path.exists(FORECAST_MODEL_PATH):
                with open(FORECAST_MODEL_PATH, 'rb') as f:
                    self.forecast_model = pickle.load(f)
                logger.info("AQI Forecast Model loaded successfully.")
            else:
                logger.warning(f"AQI Forecast Model file not found at {FORECAST_MODEL_PATH}")
        except Exception as e:
            logger.error(f"Error loading AQI models: {e}")

    def predict_aqi(self, pollutants: dict) -> float:
        """
        Pollutants dict should contain: 
        pm25, pm10, no2, co, so2, o3, nh3
        """
        if not self.model:
            # Fallback for hackathon if model missing
            return round(sum(pollutants.values()) * 0.8, 2) 
            
        try:
            from datetime import datetime
            now = datetime.now()
            
            # Preparing input data as a DataFrame with expected feature names
            mapping = {
                "pm25": "PM2.5",
                "pm10": "PM10",
                "no2": "NO2",
                "co": "CO",
                "so2": "SO2",
                "o3": "O3",
                "nh3": "NH3"
            }
            mapped_pollutants = {mapping.get(k, k): v for k, v in pollutants.items()}
            
            # Adding temporal features that CatBoost expects
            mapped_pollutants["hour"] = now.hour
            mapped_pollutants["day"] = now.day
            mapped_pollutants["month"] = now.month
            mapped_pollutants["weekday"] = now.weekday()
            
            input_df = pd.DataFrame([mapped_pollutants])
            prediction = self.model.predict(input_df)
            return round(float(prediction[0]), 2)
        except Exception as e:
            logger.error(f"AQI Prediction error: {e}")
            return 0.0

    def predict_forecast(self, current_aqi: float, history: list) -> list:
        """
        Predicts next 1-6 hours.
        """
        if not self.forecast_model:
            # Mock forecast
            return [round(current_aqi + (random.uniform(-10, 10)), 2) for _ in range(6)]
            
        try:
            # This would normally take lags of current_aqi
            # For now simplified prediction logic
            return [round(current_aqi * (1 + (i * 0.05)), 2) for i in range(1, 4)]
        except Exception as e:
            logger.error(f"AQI Forecast error: {e}")
            return []

# Singleton instance
aqi_predictor = AQIPredictor()
