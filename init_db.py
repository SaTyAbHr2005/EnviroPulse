import sys
import os
import random

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.config.database import SessionLocal, engine
from backend.models.domain_models import Base, District, Sensor

def init_db():
    print("Initializing Database...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")

        db = SessionLocal()
        
        # Check if districts already exist
        if db.query(District).count() == 0:
            print("Seeding districts...")
            districts = [
                'Mumbai City', 'Pune', 'Nagpur', 'Nashik', 'Thane', 
                'Aurangabad', 'Kolhapur', 'Solapur', 'Amravati', 'Nanded'
            ]
            for name in districts:
                new_district = District(name=name, state='Maharashtra')
                db.add(new_district)
            db.commit()
            print(f"Successfully seeded {len(districts)} districts.")
        else:
            print("Districts already exist, skipping seeding.")

        db.close()
        print("Database Initialization Complete!")
    except Exception as e:
        print(f"Initialization Failed!")
        print(f"Error: {e}")

if __name__ == "__main__":
    init_db()
