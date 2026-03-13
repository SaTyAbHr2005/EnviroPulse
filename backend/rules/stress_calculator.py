def calculate_stress_index(aqi: float, noise_db: float, traffic_density: float) -> dict:
    """
    Calculates the Environmental Stress Index (ESI) based on normalized inputs.
    Returns score (0-100) and category.
    """
    # Normalize inputs (based on common environmental bounds)
    # AQI range: 0-500
    # Noise range: 40-120 dB
    # Traffic density range: 0-100%
    
    aqi_norm = min(aqi / 500.0, 1.0)
    
    # Noise below 40 represents silence/no stress
    noise_norm = max(0, (noise_db - 40.0) / 80.0) 
    noise_norm = min(noise_norm, 1.0)
    
    traffic_norm = min(traffic_density / 100.0, 1.0)
    
    # Weighted calculation
    # 40% AQI, 35% Noise, 25% Traffic
    stress_score = (0.4 * aqi_norm) + (0.35 * noise_norm) + (0.25 * traffic_norm)
    stress_score = round(stress_score * 100, 2)
    
    category = "Low"
    action = "Safe for outdoor activities."
    
    if stress_score > 60:
        category = "High"
        action = "Avoid prolonged outdoor activity."
    elif stress_score > 30:
        category = "Moderate"
        action = "Sensitive groups should limit exposure."
        
    return {
        "score": stress_score,
        "category": category,
        "action": action
    }
