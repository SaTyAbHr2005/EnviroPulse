from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import logging

from backend.config.database import get_db
from backend.models.domain_models import Sensor, Reading, District
from backend.ml.aqi_predictor import aqi_predictor
from backend.ml.noise_predictor import noise_predictor
from backend.rules.stress_calculator import calculate_stress_index
from backend.rules.cause_detector import detect_pollution_cause
from backend.rules.health_advisory import get_health_advisory

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/latest")
def get_latest_analytics(db: Session = Depends(get_db)):
    """
    Main polling endpoint. Aggregates live data, predictions, and rules
    for all active sensors across districts.
    """
    # 1. Get all active sensors
    sensors = db.query(Sensor).filter(Sensor.status == 'active').all()
    results = []

    for sensor in sensors:
        # 2. Get the very latest reading for this sensor
        latest_reading = db.query(Reading).filter(Reading.sensor_id == sensor.id).order_by(Reading.timestamp.desc()).first()
        
        if not latest_reading:
            continue

        # 3. Perform ML Predictions
        pollutants = {
            "pm25": latest_reading.pm25,
            "pm10": latest_reading.pm10,
            "no2": latest_reading.no2,
            "co": latest_reading.co,
            "so2": latest_reading.so2,
            "o3": latest_reading.o3,
            "nh3": latest_reading.nh3
        }
        
        predicted_aqi = aqi_predictor.predict_aqi(pollutants)
        
        traffic_data = {
            "traffic_density": latest_reading.traffic_density
        }
        predicted_noise = noise_predictor.predict_noise(traffic_data)

        # 4. Derive Insights via Rules Engine
        stress = calculate_stress_index(predicted_aqi, predicted_noise, latest_reading.traffic_density)
        cause = detect_pollution_cause(
            latest_reading.pm25, 
            latest_reading.pm10, 
            latest_reading.so2, 
            latest_reading.traffic_density
        )
        advisory = get_health_advisory(predicted_aqi)

        # 5. Get District Name
        district_name = sensor.district.name

        results.append({
            "sensor_id": sensor.id,
            "sensor_name": sensor.sensor_name,
            "district": district_name,
            "latitude": sensor.latitude,
            "longitude": sensor.longitude,
            "aqi": predicted_aqi,
            "noise_db": predicted_noise,
            "stress_score": stress["score"],
            "stress_category": stress["category"],
            "stress_action": stress["action"],
            "cause": cause,
            "health_index": advisory["index"],
            "health_color": advisory["color"],
            "health_advice": advisory["advice"],
            "timestamp": latest_reading.timestamp
        })

    return results

@router.get("/forecast")
def get_aqi_forecast(db: Session = Depends(get_db)):
    """
    Returns 6-hour AQI forecast for all active sensors.
    """
    sensors = db.query(Sensor).filter(Sensor.status == 'active').all()
    forecasts = []

    for sensor in sensors:
        latest_reading = db.query(Reading).filter(Reading.sensor_id == sensor.id).order_by(Reading.timestamp.desc()).first()
        
        if not latest_reading:
            continue

        # Simple prediction of current AQI to use as base for forecast
        pollutants = {
            "pm25": latest_reading.pm25,
            "pm10": latest_reading.pm10,
            "no2": latest_reading.no2,
            "co": latest_reading.co,
            "so2": latest_reading.so2,
            "o3": latest_reading.o3,
            "nh3": latest_reading.nh3
        }
        current_aqi = aqi_predictor.predict_aqi(pollutants)
        
        # Get simulated 6-hour forecast
        future_aqis = aqi_predictor.predict_forecast(current_aqi, [])

        forecasts.append({
            "sensor_name": sensor.sensor_name,
            "district": sensor.district.name,
            "current_aqi": current_aqi,
            "forecast": future_aqis,
            "timestamp": latest_reading.timestamp
        })

    return forecasts
