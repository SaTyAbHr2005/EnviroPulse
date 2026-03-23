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

@router.get("/history/{district_name}")
def get_district_history(district_name: str, db: Session = Depends(get_db)):
    """
    Returns the last 24 hours of aggregated environmental trajectory for a specific district.
    """
    district = db.query(District).filter(func.lower(District.name) == district_name.lower()).first()
    if not district:
        print(f"DEBUG: History lookup failed - District not found: {district_name}")
        raise HTTPException(status_code=404, detail="District not found")
        
    sensors = db.query(Sensor).filter(Sensor.district_id == district.id, Sensor.status == 'active').all()
    if not sensors:
        return []
        
    sensor_ids = [s.id for s in sensors]
    
    from datetime import datetime
    
    # We aggregate by time buckets to avoid overwhelming the graph
    readings = db.query(Reading).filter(
        Reading.sensor_id.in_(sensor_ids)
    ).order_by(Reading.timestamp.desc()).limit(100).all()
    
    timeline = {}
    for r in readings:
        ts_str = r.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        if ts_str not in timeline:
            timeline[ts_str] = {
                "pm25": 0, "pm10": 0, "no2": 0, "co": 0, "so2": 0, "o3": 0, "nh3": 0,
                "traffic_density": 0, "noise_db": 0, "count": 0, "timestamp": ts_str
            }
        
        t = timeline[ts_str]
        t["pm25"] += r.pm25
        t["pm10"] += r.pm10
        t["no2"] += r.no2
        t["co"] += r.co
        t["so2"] += r.so2
        t["o3"] += r.o3
        t["nh3"] += r.nh3
        t["traffic_density"] += r.traffic_density
        t["noise_db"] += r.noise_db
        t["count"] += 1
        
    history_data = []
    for ts, data in sorted(timeline.items()):
        count = data["count"]
        pollutants = {
            "pm25": data["pm25"] / count, "pm10": data["pm10"] / count, "no2": data["no2"] / count,
            "co": data["co"] / count, "so2": data["so2"] / count, "o3": data["o3"] / count, "nh3": data["nh3"] / count
        }
        avg_traffic = data["traffic_density"] / count
        avg_noise = data["noise_db"] / count
        
        predicted_aqi = aqi_predictor.predict_aqi(pollutants)
        stress = calculate_stress_index(predicted_aqi, avg_noise, avg_traffic)
        
        history_data.append({
            "time": datetime.strptime(ts, "%Y-%m-%d %H:%M:%S").strftime("%I:%M %p"),
            "aqi": round(predicted_aqi),
            "stress": round(stress["score"]),
            "noise": round(avg_noise),
            "pm25": round(pollutants["pm25"]),
            "pm10": round(pollutants["pm10"])
        })
        
    return history_data
 

@router.get("/latest")
def get_latest_analytics(db: Session = Depends(get_db)):
    """
    Main polling endpoint. Aggregates live data, predictions, and rules
    for all active sensors across districts.
    """
    # 1. Get all active sensors
    sensors = db.query(Sensor).filter(Sensor.status == 'active').all()
    
    # 2. Optimized Fetch: Get the single latest reading for EVERY sensor in one go
    # using a subquery to avoid N+1 issues
    from sqlalchemy import and_
    
    subquery = db.query(
        Reading.sensor_id,
        func.max(Reading.timestamp).label('max_ts')
    ).group_by(Reading.sensor_id).subquery()

    latest_readings = db.query(Reading).join(
        subquery,
        and_(
            Reading.sensor_id == subquery.c.sensor_id,
            Reading.timestamp == subquery.c.max_ts
        )
    ).all()

    # Map for easy lookup
    reading_map = {r.sensor_id: r for r in latest_readings}
    
    district_data = {}

    for sensor in sensors:
        latest_reading = reading_map.get(sensor.id)
        
        if not latest_reading:
            continue

        district_name = sensor.district.name

        if district_name not in district_data:
            district_data[district_name] = {
                "count": 0,
                "pm25": 0.0, "pm10": 0.0, "no2": 0.0, "co": 0.0, "so2": 0.0, "o3": 0.0, "nh3": 0.0,
                "traffic_density": 0.0,
                "noise_db": 0.0,
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
        d["noise_db"] += latest_reading.noise_db
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
        avg_noise_db = data["noise_db"] / count
        avg_latitude = data["latitude"] / count
        avg_longitude = data["longitude"] / count

        # 4. Perform ML Predictions on Aggregated Data
        predicted_aqi = aqi_predictor.predict_aqi(pollutants)
        
        # We now use the actual aggregated noise records from the sensor network
        # instead of a purely traffic-based prediction for better realism.
        final_noise = round(avg_noise_db, 2)

        # 5. Derive Insights via Rules Engine
        stress = calculate_stress_index(predicted_aqi, final_noise, avg_traffic_density)
        cause = detect_pollution_cause(pollutants["pm25"], pollutants["pm10"], pollutants["so2"], avg_traffic_density)
        advisory = get_health_advisory(predicted_aqi)

        results.append({
            "district": district_name,
            "latitude": avg_latitude,
            "longitude": avg_longitude,
            "aqi": predicted_aqi,
            "noise_db": final_noise,
            "stress_score": stress["score"],
            "stress_category": stress["category"],
            "stress_action": stress["action"],
            "cause": cause,
            "health_index": advisory["index"],
            "health_color": advisory["color"],
            "health_advice": advisory["advice"],
            "timestamp": data["timestamp"],
            "pollutants": pollutants,
            "traffic_density": round(avg_traffic_density, 2)
        })

    return results

@router.get("/sensors-telemetry")
def get_sensors_telemetry(db: Session = Depends(get_db)):
    """
    Returns detailed real-time telemetry and predictions for EVERY unique sensor node.
    Used for rich map popups.
    """
    sensors = db.query(Sensor).filter(Sensor.status == 'active').all()
    results = []

    for sensor in sensors:
        latest_reading = db.query(Reading).filter(Reading.sensor_id == sensor.id).order_by(Reading.timestamp.desc()).first()
        
        if not latest_reading:
            continue

        pollutants = {
            "pm25": latest_reading.pm25,
            "pm10": latest_reading.pm10,
            "no2": latest_reading.no2,
            "co": latest_reading.co,
            "so2": latest_reading.so2,
            "o3": latest_reading.o3,
            "nh3": latest_reading.nh3
        }
        
        # ML Predictions for this specific sensor
        predicted_aqi = aqi_predictor.predict_aqi(pollutants)
        sensor_noise = latest_reading.noise_db
        
        # Rules Engine for this specific sensor
        stress = calculate_stress_index(predicted_aqi, sensor_noise, latest_reading.traffic_density)
        cause = detect_pollution_cause(latest_reading.pm25, latest_reading.pm10, latest_reading.so2, latest_reading.traffic_density)
        advisory = get_health_advisory(predicted_aqi)

        results.append({
            "id": sensor.id,
            "sensor_name": sensor.sensor_name,
            "district": sensor.district.name,
            "latitude": sensor.latitude,
            "longitude": sensor.longitude,
            "aqi": predicted_aqi,
            "noise_db": sensor_noise,
            "stress_score": stress["score"],
            "stress_category": stress["category"],
            "cause": cause,
            "health_advice": advisory["advice"],
            "pollutants": pollutants,
            "traffic_density": latest_reading.traffic_density,
            "timestamp": latest_reading.timestamp
        })

    return results

@router.get("/district/{district_name}")
def get_district_analytics(district_name: str, db: Session = Depends(get_db)):
    """
    Returns the aggregated real-time analytics for a specific district.
    """
    print(f"DEBUG: Looking up district: '{district_name}'")
    district = db.query(District).filter(func.lower(District.name) == district_name.lower()).first()
    if not district:
        print(f"DEBUG: District NOT FOUND: '{district_name}'")
        raise HTTPException(status_code=404, detail="District not found")
        
    sensors = db.query(Sensor).filter(Sensor.district_id == district.id, Sensor.status == 'active').all()
    
    fallback_response = {
        "district": district.name,
        "timestamp": None,
        "aqi": 0,
        "noise_db": 0,
        "stress_score": 0,
        "stress_category": "Offline",
        "cause": "Network Offline",
        "health_advice": "No telemetry data available for this region.",
        "pollutants": { "pm25": 0, "pm10": 0, "no2": 0, "co": 0, "so2": 0, "o3": 0, "nh3": 0 }
    }

    if not sensors:
        return fallback_response
        
    count = 0
    pm25, pm10, no2, co, so2, o3, nh3, traffic_density, noise_db = 0, 0, 0, 0, 0, 0, 0, 0, 0
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
        noise_db += reading.noise_db
        if not latest_ts or reading.timestamp > latest_ts:
            latest_ts = reading.timestamp
            
    if count == 0:
        return fallback_response
        
    pollutants = {
        "pm25": pm25 / count, "pm10": pm10 / count, "no2": no2 / count,
        "co": co / count, "so2": so2 / count, "o3": o3 / count, "nh3": nh3 / count
    }
    avg_traffic = traffic_density / count
    avg_noise = noise_db / count
    
    predicted_aqi = aqi_predictor.predict_aqi(pollutants)
    stress = calculate_stress_index(predicted_aqi, avg_noise, avg_traffic)
    cause = detect_pollution_cause(pollutants["pm25"], pollutants["pm10"], pollutants["so2"], avg_traffic)
    advisory = get_health_advisory(predicted_aqi)
    
    return {
        "district": district.name,
        "timestamp": latest_ts,
        "aqi": predicted_aqi,
        "noise_db": round(avg_noise, 2),
        "stress_score": stress["score"],
        "stress_category": stress["category"],
        "cause": cause,
        "health_advice": advisory["advice"],
        "pollutants": pollutants,
        "traffic_density": round(avg_traffic, 2)
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
        "stress_action": stress["action"]
    }

@router.get("/debug/sensors/{district_name}")
def get_sensor_debug_telemetry(district_name: str, db: Session = Depends(get_db)):
    """
    Diagnostic endpoint to verify exact mathematical aggregation.
    Returns every raw active sensor in the district and the resulting average.
    """
    district = db.query(District).filter(func.lower(District.name) == district_name.lower()).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
        
    sensors = db.query(Sensor).filter(Sensor.district_id == district.id, Sensor.status == 'active').all()
    
    sensor_data = []
    total_aqi = 0
    total_noise = 0
    
    for sensor in sensors:
        reading = db.query(Reading).filter(Reading.sensor_id == sensor.id).order_by(Reading.timestamp.desc()).first()
        if not reading: continue
        
        # Predict AQI for this specific sensor instance
        pollutants = {
            "pm25": reading.pm25, "pm10": reading.pm10, "no2": reading.no2,
            "co": reading.co, "so2": reading.so2, "o3": reading.o3, "nh3": reading.nh3
        }
        sensor_aqi = aqi_predictor.predict_aqi(pollutants)
        
        # Predict Noise for this specific sensor instance
        sensor_noise = noise_predictor.predict_noise({"traffic_density": reading.traffic_density})
        
        sensor_data.append({
            "id": sensor.sensor_id,
            "aqi": round(sensor_aqi),
            "noise": round(sensor_noise)
        })
        
        total_aqi += sensor_aqi
        total_noise += sensor_noise
        
    count = len(sensor_data)
    
    return {
        "city": district.name,
        "sensors": sensor_data,
        "aggregated": {
            "aqi": round(total_aqi / count) if count > 0 else 0,
            "noise": round(total_noise / count) if count > 0 else 0
        }
    }

