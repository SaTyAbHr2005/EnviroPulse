from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from backend.config.database import get_db
from backend.models.domain_models import Reading
from backend.simulator import sensor_simulator

router = APIRouter(
    prefix="/simulator",
    tags=["simulator"]
)

@router.post("/start")
def start_simulation(background_tasks: BackgroundTasks):
    """
    Starts the global synthetic sensor telemetry simulation loop in the background.
    """
    if sensor_simulator.is_running():
        return {"status": "Already running", "state": "Running"}
        
    sensor_simulator.start_simulation()
    
    # Fire and forget the loop in a background thread
    background_tasks.add_task(sensor_simulator.run_simulation_loop)
    
    return {"status": "Simulation started", "state": "Running"}

@router.post("/stop")
def stop_simulation():
    """
    Gracefully halts the telemetry generation loop.
    """
    if not sensor_simulator.is_running():
        return {"status": "Already stopped", "state": "Stopped"}
        
    sensor_simulator.stop_simulation()
    return {"status": "Simulation stopping gracefully...", "state": "Stopped"}

@router.get("/status")
def get_simulation_status():
    """
    Returns Idle, Running, or Stopped.
    """
    state_str = "Running" if sensor_simulator.is_running() else "Stopped"
    return {"state": state_str}

@router.get("/telemetry")
def get_telemetry_stream(limit: int = 50, db: Session = Depends(get_db)):
    """
    Fetches the live tail of the telemetry readings table for the dashboard.
    """
    # Fetch latest readings
    readings = db.query(Reading).order_by(Reading.timestamp.desc()).limit(limit).all()
    
    stream = []
    for r in readings:
        sensor = r.sensor
        if not sensor: continue
        stream.append({
            "id": r.id,
            "timestamp": r.timestamp,
            "node": sensor.sensor_name,
            "region": sensor.district.name,
            "pm25": r.pm25,
            "pm10": r.pm10,
            "no2": r.no2,
            "traffic": r.traffic_density,
            "noise": r.noise_db
        })
        
    return stream

@router.delete("/reset")
def reset_database(db: Session = Depends(get_db)):
    """
    DANGER: Wipes all historical sensor telemetry data.
    Keeps the exact physical sensor nodes intact, just deletes the generated readings.
    """
    sensor_simulator.stop_simulation()
    
    try:
        db.query(Reading).delete()
        db.commit()
        return {"status": "Sensor data cleared", "message": "All telemetry readings have been permanently wiped."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reset DB: {str(e)}")
