-- This is the definitive initial schema for the NeetLogIQ database.
-- It creates the necessary tables for colleges, courses, and analytics.

DROP TABLE IF EXISTS colleges;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS courses; -- Explicitly drop courses if it exists from old schemas
DROP TABLE IF EXISTS performance_metrics;
DROP TABLE IF EXISTS security_logs;
DROP TABLE IF EXISTS search_analytics;

CREATE TABLE IF NOT EXISTS colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT, -- Removed UNIQUE constraint since many are empty or null
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    address TEXT,
    pincode TEXT,
    college_type TEXT NOT NULL, -- e.g., MEDICAL, DENTAL
    management_type TEXT NOT NULL, -- e.g., GOVERNMENT, PRIVATE
    establishment_year INTEGER,
    university TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    accreditation TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    college_type_category TEXT
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_id INTEGER,
    course_name TEXT NOT NULL,
    stream TEXT,
    program TEXT, -- Replaces 'level' and 'branch' for simplicity
    duration_years INTEGER,
    total_seats INTEGER,
    entrance_exam TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- BMAD Analytics Tables (as before)
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    avg_response_time REAL,
    error_rate REAL,
    throughput INTEGER,
    search_accuracy REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    threat_level REAL,
    threats TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    query TEXT,
    result_count INTEGER,
    response_time REAL,
    user_satisfaction REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);
CREATE INDEX IF NOT EXISTS idx_colleges_city ON colleges(city);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_name ON courses(course_name);

-- BMAD Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
