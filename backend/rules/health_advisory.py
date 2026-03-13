def get_health_advisory(aqi: float) -> dict:
    """
    Returns health advisories based on CPCB (India) AQI standard brackets.
    """
    if aqi <= 50:
        return {
            "index": "Good",
            "color": "Green",
            "advice": "Minimal impact. Clean air for everyone."
        }
    elif aqi <= 100:
        return {
            "index": "Satisfactory",
            "color": "Light Green",
            "advice": "May cause minor breathing discomfort to sensitive people."
        }
    elif aqi <= 200:
        return {
            "index": "Moderate",
            "color": "Yellow",
            "advice": "May cause breathing discomfort to people with lungs, asthma and heart diseases."
        }
    elif aqi <= 300:
        return {
            "index": "Poor",
            "color": "Orange",
            "advice": "May cause breathing discomfort to most people on prolonged exposure."
        }
    elif aqi <= 400:
        return {
            "index": "Very Poor",
            "color": "Red",
            "advice": "May cause respiratory illness to the people on prolonged exposure."
        }
    else:
        return {
            "index": "Severe",
            "color": "Maroon",
            "advice": "Affects healthy people and seriously impacts those with existing diseases."
        }
