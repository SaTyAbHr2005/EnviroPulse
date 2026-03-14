export const getAQIColor = (aqi) => {
    if (aqi == null) return '#475569'; // Offline
    if (aqi <= 50) return '#16a34a'; // Good
    if (aqi <= 100) return '#65a30d'; // Satisfactory
    if (aqi <= 200) return '#ca8a04'; // Moderate
    if (aqi <= 300) return '#ea580c'; // Poor
    if (aqi <= 400) return '#dc2626'; // Very Poor
    return '#7f1d1d'; // Severe
};

export const getNoiseColor = (db) => {
    if (db == null) return '#475569'; // Offline
    if (db <= 40) return '#16a34a'; // Quiet
    if (db <= 55) return '#65a30d'; // Residential
    if (db <= 70) return '#ca8a04'; // Urban traffic
    if (db <= 85) return '#ea580c'; // Heavy traffic
    if (db <= 100) return '#dc2626'; // Very loud
    return '#7f1d1d'; // Dangerous
};

export const getStressColor = (score) => {
    if (score == null) return '#475569'; // Offline
    if (score <= 20) return '#16a34a'; // Low
    if (score <= 40) return '#ca8a04'; // Mild
    if (score <= 60) return '#ea580c'; // Moderate
    if (score <= 80) return '#dc2626'; // High
    return '#7f1d1d'; // Critical
};
