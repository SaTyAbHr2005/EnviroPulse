from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import logging
from pydantic import BaseModel

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
    
    district_data = {}

    for sensor in sensors:
        # 2. Get the very latest reading for this specific sensor
        latest_reading = db.query(Reading).filter(Reading.sensor_id == sensor.id).order_by(Reading.timestamp.desc()).first()
        
        if not latest_reading:
            continue

        district_name = sensor.district.name

        if district_name not in district_data:
            district_data[district_name] = {
                "count": 0,
                "pm25": 0.0, "pm10": 0.0, "no2": 0.0, "co": 0.0, "so2": 0.0, "o3": 0.0, "nh3": 0.0,
                "traffic_density": 0.0,
                "latitude": 0.0,
                "longitude": 0.0,
                "timestamp": latest_reading.timestamp
            }
            
        d = district_data[district_name]
        d["count"] += 1
        d["pm25"] += latest_reading.pm25
        d["pm10"] += latest_reading.pm10
        d["no2"] += latest_reading.no2
        d["co"] += latest_reading.co
        d["so2"] += latest_reading.so2
        d["o3"] += latest_reading.o3
        d["nh3"] += latest_reading.nh3
        d["traffic_density"] += latest_reading.traffic_density
        d["latitude"] += sensor.latitude
        d["longitude"] += sensor.longitude
        
        # Use latest timestamp
        if latest_reading.timestamp > d["timestamp"]:
            d["timestamp"] = latest_reading.timestamp

    results = []
    
    # 3. Compute Averages and send through ML and Rules Engine
    for district_name, data in district_data.items():
        count = data["count"]
        
        pollutants = {
            "pm25": data["pm25"] / count,
            "pm10": data["pm10"] / count,
            "no2": data["no2"] / count,
            "co": data["co"] / count,
            "so2": data["so2"] / count,
            "o3": data["o3"] / count,
            "nh3": data["nh3"] / count
        }
        
        avg_traffic_density = data["traffic_density"] / count
        avg_latitude = data["latitude"] / count
        avg_longitude = data["longitude"] / count

        # 4. Perform ML Predictions on Aggregated Data
        predicted_aqi = aqi_predictor.predict_aqi(pollutants)
        
        traffic_req = { "traffic_density": avg_traffic_density }
        predicted_noise = noise_predictor.predict_noise(traffic_req)

        # 5. Derive Insights via Rules Engine
        stress = calculate_stress_index(predicted_aqi, predicted_noise, avg_traffic_density)
        cause = detect_pollution_cause(pollutants["pm25"], pollutants["pm10"], pollutants["so2"], avg_traffic_density)
        advisory = get_health_advisory(predicted_aqi)

        results.append({
            "district": district_name,
            "latitude": avg_latitude,
            "longitude": avg_longitude,
            "aqi": predicted_aqi,
            "noise_db": predicted_noise,
            "stress_score": stress["score"],
            "stress_category": stress["category"],
            "stress_action": stress["action"],
            "cause": cause,
            "health_index": advisory["index"],
            "health_color": advisory["color"],
            "health_advice": advisory["advice"],
            "timestamp": data["timestamp"],
            "pollutants": pollutants
        })

    return results

@router.get("/district/{district_name}")
def get_district_analytics(district_name: str, db: Session = Depends(get_db)):
    """
    Returns the aggregated real-time analytics for a specific district.
    """
    district = db.query(District).filter(func.lower(District.name) == district_name.lower()).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
        
    sensors = db.query(Sensor).filter(Sensor.district_id == district.id, Sensor.status == 'active').all()
    if not sensors:
        raise HTTPException(status_code=404, detail="No active sensors in this district")
        
    count = 0
    pm25, pm10, no2, co, so2, o3, nh3, traffic_density = 0, 0, 0, 0, 0, 0, 0, 0
    latest_ts = None
    
    for sensor in sensors:
        reading = db.query(Reading).filter(Reading.sensor_id == sensor.id).order_by(Reading.timestamp.desc()).first()
        if not reading:
            continue
        count += 1
        pm25 += reading.pm25
        pm10 += reading.pm10
        no2 += reading.no2
        co += reading.co
        so2 += reading.so2
        o3 += reading.o3
        nh3 += reading.nh3
        traffic_density += reading.traffic_density
        if not latest_ts or reading.timestamp > latest_ts:
            latest_ts = reading.timestamp
            
    if count == 0:
        raise HTTPException(status_code=404, detail="No readings available for this district")
        
    pollutants = {
        "pm25": pm25 / count, "pm10": pm10 / count, "no2": no2 / count,
        "co": co / count, "so2": so2 / count, "o3": o3 / count, "nh3": nh3 / count
    }
    avg_traffic = traffic_density / count
    
    predicted_aqi = aqi_predictor.predict_aqi(pollutants)
    predicted_noise = noise_predictor.predict_noise({"traffic_density": avg_traffic})
    stress = calculate_stress_index(predicted_aqi, predicted_noise, avg_traffic)
    cause = detect_pollution_cause(pollutants["pm25"], pollutants["pm10"], pollutants["so2"], avg_traffic)
    advisory = get_health_advisory(predicted_aqi)
    
    return {
        "district": district.name,
        "timestamp": latest_ts,
        "aqi": predicted_aqi,
        "noise_db": predicted_noise,
        "stress_score": stress["score"],
        "stress_category": stress["category"],
        "cause": cause,
        "health_advice": advisory["advice"],
        "pollutants": pollutants
    }

@router.get("/top-polluted")
def get_top_polluted(db: Session = Depends(get_db)):
    """
    Returns the top 5 most polluted districts in real-time.
    """
    # Reuse the logic from 'latest' to get all aggregated district AQIs
    all_districts_data = get_latest_analytics(db)
    
    # Sort descending by AQI
    sorted_districts = sorted(all_districts_data, key=lambda x: x["aqi"], reverse=True)
    
    # Return top 5 in the exact format the frontend expects
    top_5 = []
    for d in sorted_districts[:5]:
        top_5.append({
            "name": d["district"],
            "val": round(d["aqi"]),
            "cat": d["health_advice"].split(" ")[0] if d["health_advice"] else "Unknown" # fallback category string
        })
        
    # Standardize the category names slightly to match the UI expectations ('Severe', 'Poor', etc)
    for t in top_5:
        if t["val"] > 200: t["cat"] = "Severe"
        elif t["val"] > 100: t["cat"] = "Poor"
        elif t["val"] > 50: t["cat"] = "Moderate"
        else: t["cat"] = "Good"
        
    return top_5


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

class StressPredictionRequest(BaseModel):
    pm25: float
    pm10: float
    no2: float
    co: float
    so2: float
    o3: float
    nh3: float
    traffic_density: float
    avg_vehicle_speed: float = 0.0
    vehicle_count: int = 0
    noise_level: float = 0.0

@router.post("/predict-stress")
def predict_stress_custom(data: StressPredictionRequest):
    """
    Takes 7 custom pollutant values + traffic density from the frontend
    and manually runs them through the ML and Stress rules engine.
    """
    pollutants = {
        "pm25": data.pm25,
        "pm10": data.pm10,
        "no2": data.no2,
        "co": data.co,
        "so2": data.so2,
        "o3": data.o3,
        "nh3": data.nh3
    }
    
    # 1. Predict raw AQI
    predicted_aqi = aqi_predictor.predict_aqi(pollutants)
    
    # 2. Predict Noise based on manual Traffic Density
    predicted_noise = noise_predictor.predict_noise({"traffic_density": data.traffic_density})
    
    # 3. Calculate final Environmental Stress Index
    stress = calculate_stress_index(predicted_aqi, predicted_noise, data.traffic_density)
    
    return {
        "aqi_prediction": predicted_aqi,
        "noise_prediction": predicted_noise,
        "stress_score": stress["score"],
        "stress_category": stress["category"],
        "stress_action": stress["action"]
    }
