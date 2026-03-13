def calculate_stress_index(aqi: float, noise_db: float, traffic_density: float) -> dict:
    """
    Calculates the Environmental Stress Index (ESI) based on a scaled weighted model.
    Returns score (0-100) and category.
    """
    aqi_score = min(aqi / 3.0, 100.0)
    noise_score = min(noise_db, 100.0)
    traffic_score = min(traffic_density, 100.0)

    stress_score = (
        0.5 * aqi_score +
        0.3 * noise_score +
        0.2 * traffic_score
    )
    
    stress_score = round(min(stress_score, 100.0), 2)
    
    category = "Low"
    action = "Safe for outdoor activities."
    
    if stress_score >= 71:
        category = "Extreme"
        action = "Hazardous conditions. Stay inside with windows closed."
    elif stress_score >= 51:
        category = "High"
        action = "Avoid prolonged outdoor activity."
    elif stress_score >= 31:
        category = "Moderate"
        action = "Unusually sensitive groups should stay indoors."
        
    return {
        "score": stress_score,
        "category": category,
        "action": action
    }
