import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add the root directory to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost/enviropulse")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

def standardize_sensor_names():
    with Session(engine) as session:
        # Get all districts
        districts = session.execute(text("SELECT id, name FROM districts")).fetchall()
        
        for district_id, district_name in districts:
            prefix = district_name[:3].upper()
            print(f"Standardizing sensors for {district_name} (Prefix: {prefix})...")
            
            # Get all sensors for this district, sorted by ID
            sensors = session.execute(
                text("SELECT id, sensor_name FROM sensors WHERE district_id = :d_id ORDER BY id"),
                {"d_id": district_id}
            ).fetchall()
            
            for i, (sensor_id, old_name) in enumerate(sensors, 1):
                new_name = f"{prefix}{i:03d}"
                if old_name != new_name:
                    print(f"  Renaming {old_name} -> {new_name}")
                    session.execute(
                        text("UPDATE sensors SET sensor_name = :new_name WHERE id = :s_id"),
                        {"new_name": new_name, "s_id": sensor_id}
                    )
        
        session.commit()
        print("Standardization complete.")

if __name__ == "__main__":
    standardize_sensor_names()
