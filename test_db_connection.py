import sys
import os
from sqlalchemy import text

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config.database import SessionLocal, engine

def test_connection():
    try:
        # Try to connect
        print("Testing database connection...")
        db = SessionLocal()
        
        # Run a simple query
        result = db.execute(text("SELECT name FROM districts LIMIT 5;")).fetchall()
        
        print("Connection Successful!")
        print("Initial districts found in DB:")
        for row in result:
            print(f" - {row[0]}")
            
        db.close()
    except Exception as e:
        print(f"Connection Failed!")
        print(f"Error: {e}")

if __name__ == "__main__":
    test_connection()
