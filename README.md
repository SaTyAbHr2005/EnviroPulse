# EnviroPulse: Urban Environmental Intelligence Grid

EnviroPulse is a full-stack smart-city intelligence platform that simulates decentralized sensor infrastructure, predicts air-quality dynamics with machine learning, and delivers actionable environmental insights through a real-time analytics dashboard.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688.svg)
![React](https://img.shields.io/badge/React-19.x-61dafb.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)

## Overview

EnviroPulse models a city as a living environmental system. Virtual district sensors continuously stream pollutant, traffic, and acoustic telemetry into a relational backend. The platform then combines ML inference, aggregation logic, and rule-based intelligence to produce:

- Live AQI and noise signals
- Environmental Stress Index (ESI)
- Source/cause diagnostics
- Health advisory guidance
- District-level and sensor-level geospatial intelligence

It is built for both citizen awareness and administrative operations.

## Core Features

### 1) Decentralized Sensor Simulation Layer

- Synthetic telemetry generation for multiple districts and zone types.
- Sensor identity strategy (district prefixes + numbered nodes).
- Event-driven anomaly bursts (traffic surge, industrial events, dust conditions).
- Start/stop/reset simulator controls via API and admin UI.

### 2) Real-Time Environmental Analytics Engine

- Latest district-wide aggregation endpoint.
- District-specific analytics endpoint with fallback behavior when telemetry is missing.
- Rich per-sensor telemetry endpoint for map and popup intelligence.
- Top-polluted regional ranking endpoint.
- District history timeline endpoint optimized for chart rendering.

### 3) Machine Learning Prediction Stack

- AQI prediction pipeline using pretrained model artifacts when present.
- Noise prediction pipeline using traffic-aware model inputs.
- AQI forecast capability for forward trend projection.
- Graceful fallback heuristics if model files are unavailable.

### 4) Environmental Rules and Decision Layer

- Environmental Stress Index computation from AQI, noise, and traffic.
- Cause detection for likely pollution sources.
- Health advisory mapping based on severity thresholds.
- Combined ML + rules response payloads for frontend consumption.

### 5) Secure Admin and Access Control

- JWT-based authentication for protected actions.
- First-user bootstrap convenience with admin role assignment.
- Protected administrative sensor operations.
- Secure simulator control endpoints restricted to admin users.

### 6) Intelligent Admin Operations Console

- Deploy new hardware-style nodes into districts.
- Toggle node status (active/inactive).
- Remove decommissioned nodes.
- View node-level status and geolocation details.
- Control telemetry simulation lifecycle in real time.

### 7) Interactive Frontend Intelligence Experience

- Public landing flow and region selection.
- Main dashboard with AQI/noise/stress KPI cards.
- Top-polluted district leaderboard.
- Pollutant concentration snapshots.
- Manual stress prediction interface for custom scenario analysis.
- Trends and map visualization modules powered by API telemetry.

### 8) Data and Infrastructure Foundation

- PostgreSQL relational schema for users, districts, sensors, readings.
- SQLAlchemy ORM model layer with entity relationships.
- Docker Compose support for backend + database orchestration.
- Local and containerized run modes.

## Architecture and Data Flow

1. Edge Telemetry Simulation
   Virtual sensors generate district-level atmospheric and traffic data.
2. Ingestion and Persistence
   FastAPI writes readings to PostgreSQL via SQLAlchemy models.
3. Intelligence Computation
   Aggregation + ML inference + rules engine derive environmental risk signals.
4. API Distribution
   Structured JSON endpoints expose latest state, history, rankings, and forecasts.
5. Client Visualization
   React UI renders maps, dashboards, trends, and advisory intelligence.

```text
Sensor Simulator / Hardware Deploy
               |
               v
        PostgreSQL (readings)
               |
               v
      FastAPI Analytics Layer
       |        |          |
       |        |          +-> Rules (stress, cause, advisory)
       |        +-> ML (AQI, noise, forecast)
       +-> Auth/Admin controls
               |
               v
        React Intelligence UI
```

## Full Feature Inventory

### Backend API capabilities

- Health and root status endpoints.
- Authentication endpoints (register/login).
- Sensor CRUD and status control endpoints.
- Hardware deployment and district lookup endpoints.
- Simulator lifecycle and telemetry tail endpoints.
- Analytics suite:
  - Latest district analytics
  - District analytics by name
  - District history
  - Sensor-level telemetry
  - Top polluted districts
  - AQI forecast
  - Manual stress prediction
  - Debug sensor aggregation endpoint

### Frontend modules present

- Landing page
- Region selector
- Main dashboard
- Map widget/dashboard
- Trends dashboard
- Stress prediction page
- Admin login flow
- Admin control panel
- Admin simulator controls
- Layout, sidebar, header, protected route, and context providers

### Intelligence models and scripts

- AQI predictor
- Noise predictor
- Forecast support in AQI predictor
- Training/validation scripts for data checks and model training workflows

## Technology Stack

- Frontend: React 19, Vite, Tailwind CSS, Axios, React Router, Recharts, Leaflet, Lucide
- Backend: Python, FastAPI, SQLAlchemy, Pydantic
- Authentication: OAuth2 password flow, JWT, Passlib bcrypt
- ML/Data: CatBoost, XGBoost, scikit-learn, pandas
- Database: PostgreSQL, psycopg2-binary
- Runtime/Infra: Docker Compose, Uvicorn

## Repository Map

```text
EnviroPulse/
|- backend/
|  |- api/                  # analytics_routes, auth_routes, simulator_routes, hardware_routes, sensor_routes
|  |- auth/                 # jwt_handler
|  |- config/               # database connection and session factory
|  |- ml/                   # aqi_predictor, noise_predictor
|  |- models/               # SQLAlchemy entities
|  |- rules/                # stress_calculator, cause_detector, health_advisory
|  |- simulator/            # region profiles and sensor simulator engine
|  |- training/scripts/     # training, cleaning, and validation scripts
|  |- main.py               # FastAPI app bootstrap
|- database/schema.sql      # relational schema + district seed
|- init_db.py               # bootstrap helper
|- frontend/
|  |- src/components/       # UI screens and dashboards
|  |- src/context/          # auth and region context
|  |- src/hooks/            # telemetry data hook
|- docker-compose.yml
|- test_ml.py
|- test_integration.py
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- PostgreSQL 13+ (for local non-Docker mode)
- Docker + Docker Compose (recommended)

### Environment Variables

Create .env in project root:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/enviropulse
JWT_SECRET_KEY=replace_with_a_long_random_secret
VITE_API_URL=http://localhost:8000
POSTGRES_PASSWORD=your_password
```

### Option A: Docker (Backend + DB)

```bash
docker compose up --build
python init_db.py
```

### Option B: Local Runtime

Backend:

```bash
pip install -r backend/requirements.txt
python init_db.py
uvicorn backend.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API Surface

Base URL: http://localhost:8000

### General

- GET /
- GET /health

### Auth

- POST /auth/register
- POST /auth/login

### Sensors

- GET /sensors/
- POST /sensors/ (admin)
- GET /sensors/{sensor_id}
- DELETE /sensors/{sensor_id} (admin)
- PUT /sensors/{sensor_id}/status (admin)

### Hardware

- POST /hardware/deploy
- GET /hardware/districts

### Simulator

- POST /simulator/start (admin)
- POST /simulator/stop (admin)
- GET /simulator/status (admin)
- GET /simulator/telemetry (admin)
- DELETE /simulator/reset (admin)

### Analytics

- GET /analytics/latest
- GET /analytics/district/{district_name}
- GET /analytics/history/{district_name}
- GET /analytics/sensors-telemetry
- GET /analytics/top-polluted
- GET /analytics/forecast
- POST /analytics/predict-stress
- GET /analytics/debug/sensors/{district_name}

## Validation and Testing

Run from repository root:

```bash
python test_ml.py
python test_integration.py
```

Note: test_integration.py points to port 8080 by default.

## Operational Notes

- First registered user is auto-assigned admin role.
- Model files are optional for development; fallback inference keeps workflows functional.
- If local frontend requests fail due to browser CORS restrictions, update allow_origins in backend/main.py for your local frontend origin.

## Future Expansion Paths

1. Real IoT sensor ingestion pipeline (ESP32/edge devices).
2. Alert broadcasting (email/SMS/push) on critical thresholds.
3. Advanced anomaly detection for atypical emission signatures.
4. Mobile client applications for wider citizen reach.
5. Multi-state expansion with broader meteorological fusion.

## License

Licensed under MIT. See LICENSE for details.
