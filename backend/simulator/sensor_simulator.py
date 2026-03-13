import time
import random
import logging
import sys
import os

# Add the root directory to the python path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from backend.config.database import SessionLocal, engine
from backend.models.domain_models import Base, District, Sensor, Reading
from backend.simulator.region_profiles import REGION_PROFILES

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DISTRICT_COORDS = {
    'Mumbai City': (19.0188, 72.8553), # Shifted slightly East / inland away from coast
    'Pune': (18.5204, 73.8567),
    'Nagpur': (21.1458, 79.0882),
    'Nashik': (19.9975, 73.7898),
    'Thane': (19.2183, 72.9781),
    'Aurangabad': (19.8762, 75.3433),
    'Kolhapur': (16.7050, 74.2433),
    'Solapur': (17.6599, 75.9064),
    'Amravati': (20.9320, 77.7523),
    'Nanded': (19.1383, 77.3210)
}

# Ensure tables exist (we rely on schema.sql but this is a fallback)
Base.metadata.create_all(bind=engine)

def initialize_sensors(db: Session):
    """Ensure each district has 4 specific zone sensors."""
    districts = db.query(District).all()
    if not districts:
        logger.warning("No districts found. Please run database/schema.sql first.")
        return []

    active_sensors = []
    zone_types = ['Traffic_Junction', 'Industrial_Area', 'Residential_Zone', 'Highway_Zone']
    
    for district in districts:
        existing_sensors = db.query(Sensor).filter(Sensor.district_id == district.id).all()
        
        # We need to guarantee exactly these 4 sensors per district exist. 
        # For simplicity, if they have less than 4, we spawn the missing ones.
        existing_names = [s.sensor_name for s in existing_sensors]
        
        for z_name in zone_types:
            sensor_name = f"{district.name.replace(' ', '_')}_{z_name}"
            if sensor_name not in existing_names:
                new_sensor = Sensor(
                    sensor_name=sensor_name,
                    district_id=district.id,
                    latitude=DISTRICT_COORDS.get(district.name, (19.0, 75.0))[0] + random.uniform(-0.02, 0.02),
                    longitude=DISTRICT_COORDS.get(district.name, (19.0, 75.0))[1] + random.uniform(-0.02, 0.02),
                    status='active'
                )
                db.add(new_sensor)
        
        db.commit()
            
        existing_sensors = db.query(Sensor).filter(Sensor.district_id == district.id).all()
        active_sensors.extend(existing_sensors)
        
    return active_sensors

def generate_pollution_data(sensor_name: str, district_name: str) -> dict:
    """Generate mock but realistic bounds based on exact geographic region and sensor zone type."""
    is_traffic = 'Traffic' in sensor_name or 'Highway' in sensor_name
    is_industrial = 'Industrial' in sensor_name
    
    # Grab geographic baseline or fallback to a moderate profile
    profile = REGION_PROFILES.get(district_name, REGION_PROFILES["Pune"])
    
    # Base multipliers for zone type variation within the same city
    pm_mult = 1.3 if is_industrial else (1.1 if is_traffic else 0.9)
    noise_boost = 10 if is_traffic else (5 if is_industrial else 0)
    traffic_boost = 15 if is_traffic else 0
    
    # 5% Chance of a Massive Pollution Anomaly Event
    event_chance = random.random()
    if event_chance < 0.05:
        event_type = random.choice(["Industrial Accident", "Severe Traffic Surge", "Dust Storm"])
        if event_type == "Industrial Accident":
            pm_mult *= 3.5
            noise_boost += 15
        elif event_type == "Severe Traffic Surge":
            traffic_boost += 40
            noise_boost += 25
        elif event_type == "Dust Storm":
            pm_mult *= 4.0

    return {
        "pm25": round(random.uniform(*profile["pm25"]) * pm_mult, 2),
        "pm10": round(random.uniform(*profile["pm10"]) * pm_mult, 2),
        "no2": round(random.uniform(*profile["no2"]) * (1.5 if is_traffic else 1.0), 2),
        "co": round(random.uniform(*profile["co"]) * pm_mult, 2),
        "so2": round(random.uniform(*profile["so2"]) * (1.6 if is_industrial else 1.0), 2),
        "o3": round(random.uniform(*profile["o3"]), 2),
        "nh3": round(random.uniform(*profile["nh3"]) * (1.4 if is_industrial else 1.0), 2),
        "traffic_density": min(round(random.uniform(*profile["traffic_density"]) + traffic_boost, 2), 100),
        "noise_db": min(round(random.uniform(*profile["noise_db"]) + noise_boost, 2), 120)
    }

SIMULATION_ACTIVE = False

def start_simulation():
    global SIMULATION_ACTIVE
    SIMULATION_ACTIVE = True

def stop_simulation():
    global SIMULATION_ACTIVE
    SIMULATION_ACTIVE = False
    
def is_running():
    return SIMULATION_ACTIVE

def run_simulation_loop(interval_seconds=30):
    """
    Designed to be fired asynchronously by FastAPI BackgroundTasks.
    It monitors the SIMULATION_ACTIVE flag to break cleanly.
    """
    logger.info("Initializing Sensor Simulator Engine Thread...")
    db = SessionLocal()
    
    try:
        sensors = initialize_sensors(db)
        if not sensors:
            logger.error("Simulation aborted: No sensors available.")
            return

        logger.info(f"Loaded {len(sensors)} active sensors across districts.")
        logger.info(f"Listening for telemetry ticks... (Interval: {interval_seconds}s)")

        while SIMULATION_ACTIVE:
            readings_count = 0
            
            # Re-fetch sensors from DB every tick to immediately catch Admin "inactive" toggles
            current_sensors = db.query(Sensor).all()
            
            for sensor in current_sensors:
                if sensor.status != 'active' or not sensor.district:
                    continue
                    
                data = generate_pollution_data(sensor.sensor_name, sensor.district.name)
                new_reading = Reading(
                    sensor_id=sensor.id,
                    **data
                )
                db.add(new_reading)
                readings_count += 1
                
            db.commit()
            logger.info(f"Generated and pushed {readings_count} telemetry packets to PostgreSQL.")
            
            # Sleep in small chunks to allow the interrupt flag to break early without waiting 30s
            for _ in range(interval_seconds):
                if not SIMULATION_ACTIVE: break
                time.sleep(1)
            
    except Exception as e:
        logger.error(f"Simulation engine thread crashed: {str(e)}")
    finally:
        logger.info("Simulation engine thread cleanly exited.")
        db.close()

if __name__ == "__main__":
    # For manual CLI testing
    start_simulation()
    try:
        run_simulation_loop(interval_seconds=30)
    except KeyboardInterrupt:
        stop_simulation()
        logger.info("Simulation graceful shutdown via CLI.")
