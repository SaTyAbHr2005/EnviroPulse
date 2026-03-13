from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import sensor_routes, analytics_routes

app = FastAPI(title="EnviroPulse API", version="1.0.0")

# Configure CORS for localhost React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(sensor_routes.router)
app.include_router(analytics_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EnviroPulse API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
