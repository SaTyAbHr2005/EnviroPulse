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

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Ensure tables exist (we rely on schema.sql but this is a fallback)
Base.metadata.create_all(bind=engine)

def initialize_sensors(db: Session):
    """Ensure each district has at least 2 sensors."""
    districts = db.query(District).all()
    if not districts:
        logger.warning("No districts found. Please run database/schema.sql first.")
        return []

    active_sensors = []
    
    for district in districts:
        existing_sensors = db.query(Sensor).filter(Sensor.district_id == district.id).all()
        
        # If district has no sensors, create 2 mock sensors
        if len(existing_sensors) < 2:
            for i in range(1, 3):
                sensor_name = f"{district.name.replace(' ', '_')}_Sensor_{i}"
                
                # Check if sensor exists
                if not db.query(Sensor).filter(Sensor.sensor_name == sensor_name).first():
                    new_sensor = Sensor(
                        sensor_name=sensor_name,
                        district_id=district.id,
                        latitude=random.uniform(15.0, 22.0), # Approx Maharashtra lat bounds
                        longitude=random.uniform(72.0, 80.0), # Approx Maharashtra lon bounds
                        status='active'
                    )
                    db.add(new_sensor)
            db.commit()
            
        existing_sensors = db.query(Sensor).filter(Sensor.district_id == district.id).all()
        active_sensors.extend(existing_sensors)
        
    return active_sensors

def generate_pollution_data() -> dict:
    """Generate mock but realistic bounds for environmental data."""
    # Simulating a Gaussian-like distribution with random.uniform
    return {
        "pm25": round(random.uniform(20.0, 180.0), 2),
        "pm10": round(random.uniform(40.0, 250.0), 2),
        "no2": round(random.uniform(10.0, 90.0), 2),
        "co": round(random.uniform(0.2, 2.5), 2),
        "so2": round(random.uniform(5.0, 60.0), 2),
        "o3": round(random.uniform(10.0, 120.0), 2),
        "nh3": round(random.uniform(5.0, 70.0), 2),
        "traffic_density": round(random.uniform(10.0, 100.0), 2),
        "noise_db": round(random.uniform(40.0, 110.0), 2)
    }

def run_simulation(interval_seconds=30):
    logger.info("Initializing Sensor Simulator Engine...")
    db = SessionLocal()
    
    try:
        sensors = initialize_sensors(db)
        if not sensors:
            logger.error("Simulation aborted: No sensors available.")
            return

        logger.info(f"Loaded {len(sensors)} active sensors across districts.")
        logger.info(f"Starting continuous telemetry stream... (Tick interval: {interval_seconds}s)")

        while True:
            readings_count = 0
            for sensor in sensors:
                if sensor.status != 'active':
                    continue
                    
                data = generate_pollution_data()
                new_reading = Reading(
                    sensor_id=sensor.id,
                    **data
                )
                db.add(new_reading)
                readings_count += 1
                
            db.commit()
            logger.info(f"Generated and pushed {readings_count} telemetry packets to PostgreSQL.")
            
            time.sleep(interval_seconds)
            
    except KeyboardInterrupt:
        logger.info("Simulation engine gracefully stopped by user.")
    except Exception as e:
        logger.error(f"Simulation engine crashed: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    # You can change the interval if 30s is too fast
    run_simulation(interval_seconds=30)
