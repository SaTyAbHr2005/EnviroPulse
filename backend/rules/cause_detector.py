def detect_pollution_cause(pm25: float, pm10: float, so2: float, traffic_density: float) -> str:
    """
    Identifies the likely source of pollution based on pollutant ratios
    and environmental conditions.
    """
    if pm25 > 100 and traffic_density > 70:
        return "Heavy Vehicle Emissions"
    
    if pm10 > 150 and traffic_density < 40:
        return "Construction / Road Dust"
    
    if so2 > 40:
        return "Industrial Emissions / Power Plants"
    
    if pm25 > 80 and traffic_density > 40:
        return "Urban Mobility Congestion"
        
    return "Mixed Urban Background"
