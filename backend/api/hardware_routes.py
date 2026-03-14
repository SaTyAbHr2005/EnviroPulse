from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from backend.config.database import get_db
from backend.models.domain_models import Sensor, District, User
from backend.schemas.domain_schemas import SensorResponse
from backend.api.auth_routes import get_current_admin

router = APIRouter(
    prefix="/hardware",
    tags=["hardware"]
)

class DeployHardwareRequest(BaseModel):
    sensor_name: Optional[str] = None
    district_id: int
    latitude: float
    longitude: float
    coverage_radius: Optional[int] = 20

@router.post("/deploy", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
def deploy_hardware(data: DeployHardwareRequest, db: Session = Depends(get_db)): #, current_admin: User = Depends(get_current_admin)): # Admin protection can be added here
    # 1. Validation
    if not (-90 <= data.latitude <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    if not (-180 <= data.longitude <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    if data.coverage_radius <= 0:
        raise HTTPException(status_code=400, detail="Coverage radius must be positive")
    
    # 2. Check if district exists
    district = db.query(District).filter(District.id == data.district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
        
    # 3. Auto-generate sensor_name based on district name
    prefix = district.name[:3].upper()
    existing_sensors = db.query(Sensor).filter(Sensor.sensor_name.like(f"{prefix}%")).all()
    
    existing_numbers = []
    for s in existing_sensors:
        suffix = s.sensor_name[3:] # Get the part after the 3-letter prefix
        if suffix.isdigit():
            existing_numbers.append(int(suffix))
            
    next_number = max(existing_numbers) + 1 if existing_numbers else 1
    generated_sensor_name = f"{prefix}{next_number:03d}"
        
    # 4. Create and inject
    new_sensor = Sensor(
        sensor_name=generated_sensor_name,
        district_id=data.district_id,
        latitude=data.latitude,
        longitude=data.longitude,
        coverage_radius=data.coverage_radius,
        status="active"
    )
    
    db.add(new_sensor)
    db.commit()
    db.refresh(new_sensor)
    
    return new_sensor

@router.get("/districts")
def get_districts(db: Session = Depends(get_db)):
    # Returns just id and name for the dropdown
    districts = db.query(District).all()
    return [{"id": d.id, "name": d.name} for d in districts]
