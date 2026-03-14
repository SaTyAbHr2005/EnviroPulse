import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost/enviropulse")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
with engine.connect() as con:
    try:
        con.execute(text('ALTER TABLE sensors ADD COLUMN coverage_radius INTEGER;'))
        con.commit()
        print("Successfully added coverage_radius column.")
    except Exception as e:
        print("Column might already exist or error occurred:", e)
