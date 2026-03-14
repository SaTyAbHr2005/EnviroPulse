from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), default="viewer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    state = Column(String(100), default="Maharashtra")
    
    sensors = relationship("Sensor", back_populates="district", cascade="all, delete-orphan")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_name = Column(String(100), unique=True, index=True, nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    coverage_radius = Column(Integer, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    district = relationship("District", back_populates="sensors")
    readings = relationship("Reading", back_populates="sensor", cascade="all, delete-orphan")

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id", ondelete="CASCADE"))
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    co = Column(Float)
    so2 = Column(Float)
    o3 = Column(Float)
    nh3 = Column(Float)
    traffic_density = Column(Float)
    noise_db = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    sensor = relationship("Sensor", back_populates="readings")
