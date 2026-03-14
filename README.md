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

### Module 2 – Sensor Simulation Engine ✅ (Completed)
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

### Module 3 – ML Prediction Engine ✅ (Completed)
Handles predictions for AQI and Noise levels using pre-trained regression models.

**Outputs:**
- CatBoost multi-variate AQI inference.
- XGBoost inference logic for Noise generation based on simulated traffic density.
- CatBoost Forecast for the next 1-6 hour AQI trend.

---

### Module 4 – Environmental Rules Engine ✅ (Completed)
Calculates causal metrics based on pollution logic.

**Functions:**
- **Stress Calculator**: Computes *Environmental Stress Index* based on normalized AQI, Noise, and Traffic.
- **Pollution Causal Detector**: Matches specific conditions to environmental causes (e.g. High PM2.5 + Traffic = Vehicle Emissions).
- **Health Advisory**: Triggers actionable recommendations based on CPCB threshold maps.

---

### Module 5 – Backend Results API ✅ (Completed)
The gateway providing near real-time data back to the frontend without WebSockets.

**Endpoints:**
- `GET /analytics/latest`: Core polling endpoint returning the latest district-wise sensor states, predictions, and health advisories.
- `GET /sensors`: Initial mapping configuration.
- `GET /health`: Standard sanity check endpoint.

---

### Module 6 – Data Fetching & Dashboard Controller ✅ (Completed)
The React controller governing constant state updates.

**Features:**
- Professional 3-zone layout (Sidebar, Analytics Hub, Impact Intelligence).
- Centralized telemetry store using Stale-While-Revalidate (SWR) pattern.
- High-frequency polling (every 3 seconds) for real-time sensor updates.
- Responsive 12-column grid system for modular analytics cards.

---

### Module 7 – Geo-Spatial Visualization Layer ✅ (Completed)
The interactive map plotting sensor metadata.

**Features:**
- Leaflet + OpenStreetMap engine integration.
- Contextual Markers that react to local AQI limits (Green/Yellow/Red).
- Real-time tooltips providing live reading insights on user interaction.

---

### Module 8 – Advanced Analytics UI ✅ (Completed)
The statistical visualization dashboard components.

**Features:**
- **Impact Intelligence**: Sector-level impact derivation (Agriculture, Tourism, Wildlife, Health, Economy).
- **Dynamic Source Detection**: ML-driven identification of pollution sources (Traffic, Industrial, etc.) with high-fidelity iconography.
- **Regional Rankings**: Real-time "Top Polluted Regions" leaderboard across Maharashtra.
- **Health Advisories**: Dynamic atmospheric alerts and safety recommendations.

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
| Module 2 – Sensor Simulation Engine | ✅ Completed |
| Module 3 – ML Prediction Engine | ✅ Completed |
| Module 4 – Environmental Rules Engine | ✅ Completed |
| Module 5 – Backend Results API | ✅ Completed |
| Module 6 – Data Fetching & UI Controller | ✅ Completed |
| Module 7 – Geo-Spatial Visualization Layer | ✅ Completed |
| Module 8 – Advanced Analytics UI | ✅ Completed |

---

## Example Usage Pipeline
1. `sensor_simulator.py` initializes virtual sensors for Maharashtra districts.
2. Every few seconds it drops new pollutant data into the PostgreSQL `readings` table.
3. A user visits the React dashboard.
4. The dashboard makes an automatic fetch every 3s via `useCityTelemetry`.
5. FastAPI triggers ML predictions & Rules calculating Stress levels and identifying pollution causes.
6. The user visualizes the results through a modern, 3-zone intelligence interface.

## License
Distributed under the MIT License.
