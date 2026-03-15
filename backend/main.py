from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import sensor_routes, analytics_routes, auth_routes, simulator_routes, hardware_routes
from backend.config.database import engine, Base
import backend.models.domain_models # Ensure models are loaded before create_all

# Create database tables (if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EnviroPulse API", version="1.0.0")

# Configure CORS for localhost React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(sensor_routes.router)
app.include_router(analytics_routes.router)
app.include_router(auth_routes.router)
app.include_router(simulator_routes.router)
app.include_router(hardware_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EnviroPulse API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

