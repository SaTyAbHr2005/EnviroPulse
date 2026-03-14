# EnviroPulse: Technical Architecture

EnviroPulse is architected as an intelligence-driven urban monitoring platform that leverages causal data modeling to correlate mobility patterns with environmental well-being.

## System Overview
The platform operates on a **Causal Hub Model**. Instead of treating sensors and traffic as isolated data points, the system models traffic as an upstream driver of environmental change. The backend orchestrates data from synthetic district sensors, ML models, and rule-based derivation engines.

## Workflow Execution Mode
EnviroPulse operates primarily on a pull-based asynchronous architecture.

### Simulated Synthetic Mode (Current)
- Scans districts via synthetic sensor generator running internally.
- Pushes continuous reading streams to PostgreSQL.

### Real Hardware Polling (Future Scope)
- Actual IoT ESP32 nodes act directly as the data pipeline, dropping internal software generators.

---

## 🏗️ Technical Modules Breakdown

### Module 1 – Initialization & Database Setup ✅ (Completed)
This module acts as the foundation for storing simulated state and real-time telemetry.

**Architecture:**
- **State -> District -> Sensors** Relational Hierarchy.
- **Readings Table**: The time-series payload data point storage (`timestamp`, `pm25`, `no2`, etc.), linked via foreign key to Sensors. Indexed for fast range queries.
- Defined `schema.sql` mapped to local PostgreSQL database instance.

**Entity Relationships:**
```text
Districts(id, name, state)
   |
   +-- Sensors(id, sensor_name, district_id, status)
          |
          +-- Readings(id, sensor_id, pm25, aqi, timestamp)
```

---

### Module 2 – Sensor Simulation Engine ✅ (Completed)
This module generates continuous dynamic telemetry resembling active SOC environments.

**Workflow:**
```text
Digital Twin Engine
      │
      ▼
Target Active Districts (Pune, Mumbai)
      │
      ▼
Inject Gaussian Pollutant Variations
      │
      ▼
INSERT INTO PostgreSQL `readings` (every 30s)
```

**Features:**
- Asynchronous generator running indefinitely in an isolated background thread.
- Produces `pm25`, `pm10`, `no2`, `co`, `so2`, `o3`, `nh3`, and `traffic_density` per node.

---

### Module 3 – ML Prediction Engine ✅ (Completed)
Handles computational predictions asynchronously for AQI and Noise levels.

**Frameworks & Outputs:**
- **AQI Predictor (CatBoost)**: Multi-variate regression outputting unified AQI.
- **Noise Predictor (XGBoost)**: Translating `traffic_density` simulated ratios into active dBA levels.
- **AQI Forecasting (CatBoost)**: Providing future AQI insights leveraging dataset lags.

**Benefit:**
Reduces calculation loads from the Frontend mapping by solving regressions server-side immediately during Polling calls.

---

### Module 4 – Environmental Rules Engine ✅ (Completed)
Calculates causal metrics based on empirical pollution logic structures.

**Functions:**
- **Stress Calculator**: Computes *Environmental Stress Index* based on normalized AQI, Noise, and Traffic.
- **Cause Engine**: Identifies sources (High PM2.5 + High Traffic = Vehicle Emissions).
- **Health System**: Matches explicit limits (AQI > 150 = Sensitive groups risk).

**Benefits:**
Produces actionable semantic metadata instead of just numbers for the end-user.

---

### Module 5 – Backend Results API ✅ (Completed)
Serves structured data JSON bundles via lightweight RESTful endpoints.

**Endpoints:**
- `GET /analytics/latest`: Main polling aggregation point. Fetching the absolute newest reading row per sensor.
- `GET /sensors`: Initial configuration loading for District mapping.
- `GET /analytics/history`: Time-series extraction for Recharts.

**Benefits:**
Enables standard HTTP fetching methodologies eliminating stateful WebSocket tracking complexities.

---

### Module 6 – Data Fetching & Dashboard Controller ✅ (Completed)
The front-end client interface processing incoming backend payloads.

**Architecture:**
- **3-Zone Layout**: Orchestrated UI consisting of a persistent Sidebar, a 12-column Main Analytics Hub, and a dedicated Impact Intelligence Sidebar.
- **SWR Data Pattern**: Implemented "Stale-While-Revalidate" logic via `useCityTelemetry` hook, ensuring instant UI responses with background data synchronization.
- **Centralized Telemetry Store**: Global cache instance for persisting district data across navigation.

**Benefits:**
- Eliminates UI flicker during data updates.
- Decouples UI components from complex API orchestration.

---

### Module 7 – Geo-Spatial Visualization Layer ✅ (Completed)
Leaflet interactive map plotting dynamic sensory data over topological UI constraints.

**Components:**
- Leaflet map rendering regional sensor markers.
- Contextual status indicators reacting to local Environmental Stress levels.
- Real-time interactable popups loading deep insights dynamically.

---

### Module 8 – Advanced Analytics UI ✅ (Completed)
Data-dense React components converting complex metrics into readable structures.

**Features:**
- **Impact Intelligence Hub**: Visualization of environmental stress on Agriculture, Wildlife, and Economy.
- **Causal UI**: Dynamic iconography mapped to ML-detected pollution sources (Cars for traffic, Factories for industry).
- **Leaderboard System**: Top polluted regions tracker aggregated from the entire sensor network.

---

## Planned Tool Integrations

Future tools to extend capability:

| Integration | Purpose |
|------|---------|
| AWS RDS | Cloud PostgreSQL Deployment |
| Vercel | Instant edge frontend deployments |
| Sentinel-5P layers | Geo-Satellite imagery rendering via Leaflet overlay |
| WebSockets | High-frequency realtime upgrade patch |

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
