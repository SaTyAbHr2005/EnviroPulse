# EnviroPulse – Urban Environmental Intelligence Platform

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python: 3.9+](https://img.shields.io/badge/Python-3.9+-green.svg)
![React: 18+](https://img.shields.io/badge/React-18+-61dafb.svg)

## Project Introduction
**EnviroPulse** is a professional-grade full-stack environmental intelligence platform. It simulates district-wise environmental sensors continuously streaming telemetry data (PM2.5, NO2, traffic noise, etc.). A predictive analytical backend infers actionable Health Action Advisories and a customized *Environmental Stress Index (ESI)*, which is dynamically fetched by a React dashboard periodically.

---

## 🏗️ Modules Breakdown

### Module 1 – Initialization & Database Setup ✅ (Completed)
This module acts as the foundation for storing simulated state and real-time telemetry.

**Features:**
- Define hierarchical schema (State -> District -> Sensors)
- Define Readings schema
- Setup FastAPI and React Vite Boilerplates
- Provide initial `schema.sql` template

**Outcome Structure:**
PostgreSQL instance running with structured normalized tables ready for injection.

---

### Module 2 – Sensor Simulation Engine 🔜 (Next)
This module generates continuous dynamic telemetry.

**Purpose:**
A standalone script that behaves like hardware IoT district-nodes. It operates on a timer and continuously injects records directly into the local database instance.

**Example Payload Structure:**
```json
{
   "district": "Pune",
   "sensor_id": 2,
   "pm25": 140.2,
   "traffic_density": 65,
   "timestamp": "2023-08-14T10:00:00Z"
}
```

---

### Module 3 – ML Prediction Engine (Planned)
Handles predictions for AQI and Noise levels using pre-trained regression models.

**Outputs:**
- CatBoost multi-variate AQI inference.
- XGBoost inference logic for Noise generation based on simulated traffic density.
- CatBoost Forecast for the next 1-6 hour AQI trend.

---

### Module 4 – Environmental Rules Engine (Planned)
Calculates causal metrics based on pollution logic.

**Functions:**
- **Stress Calculator**: Computes *Environmental Stress Index* based on normalized AQI, Noise, and Traffic.
- **Pollution Causal Detector**: Matches specific conditions to environmental causes (e.g. High PM2.5 + Traffic = Vehicle Emissions).
- **Health Advisory**: Triggers actionable recommendations based on CPCB threshold maps.

---

### Module 5 – Backend Results API (Planned)
The gateway providing near real-time data back to the frontend without WebSockets.

**Endpoints:**
- `GET /analytics/latest`: Core polling endpoint returning the latest district-wise sensor states, predictions, and health advisories.
- `GET /sensors`: Initial mapping configuration.
- `GET /health`: Standard sanity check endpoint.

---

### Module 6 – Data Fetching & Dashboard Controller (Planned)
The React controller governing constant state updates.

**Features:**
- Initial layout definitions using Tailwind CSS.
- Periodic polling utility (`setInterval` calling API every 3–5 seconds).
- Distributes polling results into reusable React component contexts.

---

### Module 7 – Geo-Spatial Visualization Layer (Planned)
The interactive map plotting sensor metadata.

**Features:**
- Leaflet + OpenStreetMap engine.
- District specific mapped boundaries for Maharashtra.
- Contextual Markers that react to local AQI limits (Green/Yellow/Red).
- Real-time tooltips providing live reading insights on user click interactability.

---

### Module 8 – Advanced Analytics UI (Planned)
The statistical visualization dashboard components.

**Features:**
- Uses Recharts for advanced pollution progression graphs.
- Stress Level Gauges displaying ESI out of 100.
- Summary Cards tracking the AQI forecasting outputs for the next immediate hours.

---

## Execution Modes
EnviroPulse operates primarily on a pull-based asynchronous architecture.
### Simulated Synthetic Mode (Current)
- Scans districts via synthetic sensor generator running internally.
- Pushes continuous reading streams to PostgreSQL.

### Real Hardware Polling (Future Scope)
- Actual IoT ESP32 nodes act directly as the data pipeline, dropping internal software generators.

---

## Current Project Status

| Module | Status |
|--------|--------|
| Module 1 – Initialization & Database Setup | ✅ Completed |
| Module 2 – Sensor Simulation Engine | 🔜 Next |
| Module 3 – ML Prediction Engine | Planned |
| Module 4 – Environmental Rules Engine | Planned |
| Module 5 – Backend Results API | Planned |
| Module 6 – Data Fetching & UI Controller | Planned |
| Module 7 – Geo-Spatial Visualization Layer | Planned |
| Module 8 – Advanced Analytics UI | Planned |

---

## Example Usage Pipeline
1. `sensor_simulator.py` initializes virtual sensors for Mumbai and Pune.
2. Every 30s it drops new pollutant strings into the PostgreSQL `readings` table.
3. A user visits the React dashboard.
4. The dashboard makes an automatic fetch every 5s to `GET /analytics/latest`.
5. FastAPI triggers ML predictions & Rules calculating Stress levels against the newest SQL records dynamically based on the polling fetch.
6. The user immediately visualizes the live state update.

## License
Distributed under the MIT License.
