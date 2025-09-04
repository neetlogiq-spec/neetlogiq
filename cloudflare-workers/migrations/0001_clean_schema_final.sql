-- Clean College Database Schema (matching clean-unified.db exactly)
CREATE TABLE IF NOT EXISTS colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT, -- Removed UNIQUE constraint since many are empty
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    address TEXT,
    pincode TEXT,
    college_type TEXT NOT NULL, -- MEDICAL, DENTAL, DNB, MULTI
    management_type TEXT NOT NULL, -- GOVERNMENT, PRIVATE, TRUST, DEEMED
    establishment_year INTEGER,
    university TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    accreditation TEXT, -- MCI, DCI, NABH, etc.
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    college_type_category TEXT
);

CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_id INTEGER NOT NULL,
    course_name TEXT NOT NULL,
    stream TEXT,
    level TEXT,
    branch TEXT,
    duration TEXT,
    entrance_exam TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- BMAD Analytics Tables
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

-- Indexes for performance (matching clean-unified.db)
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);
CREATE INDEX IF NOT EXISTS idx_colleges_city ON colleges(city);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(college_type);
CREATE INDEX IF NOT EXISTS idx_colleges_management ON colleges(management_type);
CREATE INDEX IF NOT EXISTS idx_programs_college_id ON programs(college_id);
CREATE INDEX IF NOT EXISTS idx_programs_course_name ON programs(course_name);

-- BMAD Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
