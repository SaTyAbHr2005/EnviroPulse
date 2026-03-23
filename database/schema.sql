-- EnviroPulse Database Schema
-- Run this file in your PostgreSQL instance to initialize the database.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer', -- 'admin' or 'viewer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra'
);

CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    sensor_name VARCHAR(100) UNIQUE NOT NULL,
    district_id INT REFERENCES districts(id) ON DELETE CASCADE,
    latitude FLOAT,
    longitude FLOAT,
    coverage_radius INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- 'active' or 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    sensor_id INT REFERENCES sensors(id) ON DELETE CASCADE,
    pm25 FLOAT,
    pm10 FLOAT,
    no2 FLOAT,
    co FLOAT,
    so2 FLOAT,
    o3 FLOAT,
    nh3 FLOAT,
    traffic_density FLOAT,
    noise_db FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 10 initial districts for Maharashtra
INSERT INTO districts (name, state) VALUES
('Mumbai City', 'Maharashtra'),
('Pune', 'Maharashtra'),
('Nagpur', 'Maharashtra'),
('Nashik', 'Maharashtra'),
('Thane', 'Maharashtra'),
('Aurangabad', 'Maharashtra'),
('Kolhapur', 'Maharashtra'),
('Solapur', 'Maharashtra'),
('Amravati', 'Maharashtra'),
('Nanded', 'Maharashtra')
ON CONFLICT (name) DO NOTHING;
