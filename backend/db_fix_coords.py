import os
import sys
import random
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Add the root directory to the python path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config.database import SQLALCHEMY_DATABASE_URL
from backend.models.domain_models import District, Sensor

DISTRICT_COORDS = {
    'Mumbai City': (19.0188, 72.8553),
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

engine = create_engine(SQLALCHEMY_DATABASE_URL)

def fix_coordinates():
    with Session(engine) as session:
        sensors = session.query(Sensor).all()
        updated = 0
        for sensor in sensors:
            district_name = sensor.district.name
            if district_name in DISTRICT_COORDS:
                base_lat, base_lon = DISTRICT_COORDS[district_name]
                sensor.latitude = base_lat + random.uniform(-0.02, 0.02)
                sensor.longitude = base_lon + random.uniform(-0.02, 0.02)
                updated += 1
            else:
                print(f"Unknown district {district_name}")
        
        session.commit()
        print(f"Successfully updated coordinates for {updated} physical sensors.")

if __name__ == "__main__":
    fix_coordinates()
