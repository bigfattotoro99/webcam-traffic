-- Traffic Management System Database Schema

-- 1. CCTV Cameras & Coordinates
CREATE TABLE cctv_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_code VARCHAR(50) UNIQUE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    resolution VARCHAR(20) DEFAULT '4K',
    last_signal_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Traffic Congestion Logs (Historical Data)
CREATE TABLE traffic_logs (
    id BIGSERIAL PRIMARY KEY,
    road_segment_id VARCHAR(100) NOT NULL,
    camera_id UUID REFERENCES cctv_cameras(id),
    density_percentage INTEGER CHECK (density_percentage BETWEEN 0 AND 100),
    vehicle_count INTEGER DEFAULT 0,
    average_speed_kmh DECIMAL(5, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Accident Records
CREATE TABLE accidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(50) NOT NULL, -- crash, breakdown, fire, etc.
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    severity VARCHAR(20) DEFAULT 'minor', -- minor, major, critical
    description TEXT,
    reported_by VARCHAR(100), -- ai_detection, user_call, patrol
    status VARCHAR(20) DEFAULT 'open', -- open, processing, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. Traffic Light Status
CREATE TABLE traffic_lights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    junction_name VARCHAR(255) NOT NULL,
    current_state VARCHAR(20) NOT NULL, -- green, yellow, red, blinking_red
    mode VARCHAR(20) DEFAULT 'ai_optimized', -- manual, fixed_timer, ai_optimized
    current_phase_duration_sec INTEGER,
    next_planned_state VARCHAR(20),
    last_update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_traffic_logs_road_timestamp ON traffic_logs(road_segment_id, timestamp);
CREATE INDEX idx_accidents_status ON accidents(status);
CREATE INDEX idx_cctv_location ON cctv_cameras(latitude, longitude);
