import requests
import json
import time

BASE_URL = "http://127.0.0.1:8080"

def test_integration():
    print("--- STARTING FULL SYSTEM INTEGRATION TEST ---")
    
    # 1. Health Check
    try:
        print("\n1. Testing Backend Health...")
        health = requests.get(f"{BASE_URL}/health").json()
        print(f"Result: {health}")
    except Exception:
        print("FAILED: Is the server running? Run 'uvicorn backend.main:app --reload --port 8080'")
        return

    # 2. Check Sensors
    print("\n2. Fetching Configured Sensors...")
    sensors = requests.get(f"{BASE_URL}/sensors").json()
    print(f"Found {len(sensors)} sensors in the system.")
    if len(sensors) > 0:
        print(f"Example: {sensors[0]['sensor_name']} in {sensors[0]['district_id']}")

    # 3. Fetch Latest Analytics (The Core Integration Endpoint)
    print("\n3. Testing Integrated Analytics (Predictions + Rules)...")
    analytics = requests.get(f"{BASE_URL}/analytics/latest").json()
    
    if not analytics:
        print("Empty results! Is the simulator running? Run 'python backend/simulator/sensor_simulator.py'")
    else:
        print(f"Successfully fetched {len(analytics)} analytics packets.")
        # Print a sample
        sample = analytics[0]
        print("\n--- SAMPLE DATA PACKET ---")
        print(json.dumps(sample, indent=2))
        
        # Verify ML integration
        if sample['aqi'] > 0 and sample['noise_db'] > 0:
            print("\n✅ ML INTEGRATION VERIFIED: Valid AQI and Noise predictions found.")
        else:
            print("\n❌ ML WARNING: Predictions are zero. Check model loader logs.")

        # Verify Rules integration
        if sample['stress_category'] and sample['cause']:
             print("✅ RULES ENGINE VERIFIED: Stress index and cause detection present.")
        else:
             print("❌ RULES WARNING: Derived fields are missing.")

    # 4. Testing Admin Capability (Optional Test)
    print("\n4. Testing Sensor Forecast...")
    forecast = requests.get(f"{BASE_URL}/analytics/forecast").json()
    print(f"Forecast entries found: {len(forecast)}")

if __name__ == "__main__":
    test_integration()
