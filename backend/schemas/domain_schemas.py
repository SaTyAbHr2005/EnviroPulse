from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ReadingBase(BaseModel):
    pm25: float
    pm10: float
    no2: float
    co: float
    so2: float
    o3: float
    nh3: float
    traffic_density: float
    noise_db: float

class ReadingCreate(ReadingBase):
    pass

class ReadingResponse(ReadingBase):
    id: int
    sensor_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class SensorBase(BaseModel):
    sensor_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = "active"

class SensorCreate(SensorBase):
    district_id: int

class SensorResponse(SensorBase):
    id: int
    district_id: int
    created_at: datetime
    readings: List[ReadingResponse] = []

    class Config:
        from_attributes = True

class DistrictBase(BaseModel):
    name: str
    state: Optional[str] = "Maharashtra"

class DistrictCreate(DistrictBase):
    pass

class DistrictResponse(DistrictBase):
    id: int
    sensors: List[SensorResponse] = []

    class Config:
        from_attributes = True
