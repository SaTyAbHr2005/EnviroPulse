from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

from backend.config.database import get_db
from backend.models.domain_models import Sensor, District, User
from backend.schemas.domain_schemas import SensorCreate, SensorResponse
from backend.api.auth_routes import get_current_admin

router = APIRouter(
    prefix="/sensors",
    tags=["sensors"]
)

@router.get("/", response_model=List[SensorResponse])
def get_sensors(db: Session = Depends(get_db)):
    return db.query(Sensor).all()

@router.post("/", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
def create_sensor(sensor: SensorCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    # Check if district exists
    district = db.query(District).filter(District.id == sensor.district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    
    # Check if sensor_name already exists
    db_sensor = db.query(Sensor).filter(Sensor.sensor_name == sensor.sensor_name).first()
    if db_sensor:
        raise HTTPException(status_code=400, detail="Sensor name already registered")
    
    # If lat/lon not provided, generate random ones for Maharashtra
    lat = sensor.latitude if sensor.latitude is not None else random.uniform(15.0, 22.0)
    lon = sensor.longitude if sensor.longitude is not None else random.uniform(72.0, 80.0)
    
    new_sensor = Sensor(
        sensor_name=sensor.sensor_name,
        district_id=sensor.district_id,
        latitude=lat,
        longitude=lon,
        status=sensor.status or "active"
    )
    
    db.add(new_sensor)
    db.commit()
    db.refresh(new_sensor)
    return new_sensor

@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor(sensor_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    db_sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    db.delete(db_sensor)
    db.commit()
    return None

@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    db_sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return db_sensor

@router.put("/{sensor_id}/status", response_model=SensorResponse)
def toggle_sensor_status(sensor_id: int, status_update: dict, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    db_sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
        
    new_status = status_update.get("status")
    if new_status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'active' or 'inactive'")
        
    db_sensor.status = new_status
    db.commit()
    db.refresh(db_sensor)
    return db_sensor
