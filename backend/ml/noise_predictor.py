import os
import pickle
import pandas as pd
import logging
import random

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "noise_model.pkl")

class NoisePredictor:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(MODEL_PATH):
                with open(MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Noise Model loaded successfully.")
            else:
                logger.warning(f"Noise Model file not found at {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Error loading Noise model: {e}")

    def predict_noise(self, traffic_data: dict) -> float:
        """
        Predicts noise Level (dBA) based on traffic metrics.
        Input contains: traffic_density, vehicle_count (optional)
        """
        if not self.model:
            # Fallback heuristic: Base 40dB + density weight
            density = traffic_data.get("traffic_density", 50)
            return round(40 + (density * 0.7), 2)
            
        try:
            from datetime import datetime
            now = datetime.now()
            
            # Expanding inputs to match model's expected 19 features
            full_data = {
                'traffic_density': traffic_data.get('traffic_density', 50.0),
                'vehicle_count': traffic_data.get('vehicle_count', traffic_data.get('traffic_density', 50.0) * 2),
                'honking_events': random.uniform(5, 30),
                'near_highway': 0,
                'population_density': 1000,
                'near_airport': 0,
                'near_construction': 0,
                'industrial_zone': 0,
                'school_zone': 0,
                'park_proximity': 0,
                'temperature_c': 28.0,
                'humidity_%': 65.0,
                'wind_speed_kmh': 12.0,
                'precipitation_mm': 0.0,
                'hour': now.hour,
                'day_of_week': now.weekday(),
                'is_weekend': 1 if now.weekday() >= 5 else 0,
                'holiday': 0,
                'public_event': 0
            }
            
            # Ensure order matches what XGBoost expects if it's sensitive to it
            # though DataFrame columns usually handle it if named
            input_df = pd.DataFrame([full_data])
            prediction = self.model.predict(input_df)
            return round(float(prediction[0]), 2)
        except Exception as e:
            logger.error(f"Noise Prediction error: {e}")
            return 45.0 # baseline

# Singleton instance
noise_predictor = NoisePredictor()
