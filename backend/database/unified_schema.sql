-- Unified Database Schema for NeetLogIQ
-- This schema consolidates all separate databases into one system
-- Designed for Cloudflare D1 with proper indexing and relationships

-- ========================================
-- CORE ENTITIES
-- ========================================

-- Colleges table (consolidated from all sources)
CREATE TABLE colleges (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    normalized_name TEXT,
    college_code TEXT UNIQUE,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    college_type TEXT NOT NULL, -- MEDICAL, DENTAL, DNB
    management_type TEXT NOT NULL, -- GOVERNMENT, PRIVATE, DEEMED
    university TEXT,
    establishment_year INTEGER,
    nirf_rank INTEGER,
    naac_grade TEXT,
    approvals TEXT, -- JSON array of approvals
    facilities TEXT, -- JSON array of facilities
    hostel_available BOOLEAN DEFAULT 0,
    transport_available BOOLEAN DEFAULT 0,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'active', -- active, inactive, pending
    source TEXT DEFAULT 'manual', -- manual, import, api
    verified_at DATETIME,
    verified_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Programs/Courses table
CREATE TABLE programs (
    id INTEGER PRIMARY KEY,
    college_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    normalized_name TEXT,
    course_type TEXT NOT NULL, -- UG, PG, DIPLOMA, FELLOWSHIP
    level TEXT NOT NULL, -- MBBS, MD, MS, BDS, MDS, DNB
    specialization TEXT,
    duration INTEGER, -- in months
    entrance_exam TEXT, -- NEET, NEET-PG, etc.
    total_seats INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);

-- ========================================
-- CUTOFFS & RANKS
-- ========================================

-- Main cutoffs table (unified for KEA, AIQ, and other authorities)
CREATE TABLE cutoffs (
    id INTEGER PRIMARY KEY,
    college_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    round TEXT NOT NULL, -- r1, r2, r3, etc.
    round_name TEXT, -- Round 1, Round 2, etc.
    authority TEXT NOT NULL, -- KEA, AIQ, MCC, etc.
    quota TEXT NOT NULL, -- state, aiq, all_india, etc.
    category TEXT NOT NULL, -- GM, SC, ST, OBC, etc.
    opening_rank INTEGER,
    closing_rank INTEGER,
    opening_score REAL,
    closing_score REAL,
    score_type TEXT, -- rank, percentile, marks
    score_unit TEXT, -- rank, percentile, percentage
    seats_available INTEGER DEFAULT 0,
    seats_filled INTEGER DEFAULT 0,
    seat_type TEXT, -- open, reserved, etc.
    source_url TEXT,
    confidence_score REAL DEFAULT 1.0, -- 0.0 to 1.0
    notes TEXT,
    status TEXT DEFAULT 'active', -- active, draft, archived
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- Seat matrix snapshots
CREATE TABLE seat_matrix (
    id INTEGER PRIMARY KEY,
    college_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    round TEXT NOT NULL,
    authority TEXT NOT NULL,
    quota TEXT NOT NULL,
    category_breakdown TEXT NOT NULL, -- JSON: {"GM": 50, "SC": 15, "ST": 7}
    total_seats INTEGER NOT NULL,
    source_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- ========================================
-- FEES & FINANCIAL
-- ========================================

-- Fees structure
CREATE TABLE fees (
    id INTEGER PRIMARY KEY,
    college_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    tuition_fee INTEGER,
    hostel_fee INTEGER,
    other_fees INTEGER,
    total_fee INTEGER,
    currency TEXT DEFAULT 'INR',
    fee_type TEXT, -- annual, semester, monthly
    source_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- ========================================
-- PLACEMENTS & STATISTICS
-- ========================================

-- Placement statistics
CREATE TABLE placements (
    id INTEGER PRIMARY KEY,
    college_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    avg_ctc INTEGER,
    median_ctc INTEGER,
    highest_ctc INTEGER,
    placement_percentage REAL,
    recruiters TEXT, -- JSON array
    source_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);

-- ========================================
-- REFERENCE DATA & TAXONOMIES
-- ========================================

-- States and regions
CREATE TABLE states (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    region TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories and reservations
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- GM, SC, ST, OBC, etc.
    name TEXT NOT NULL,
    description TEXT,
    reservation_percentage REAL,
    is_general BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quota types
CREATE TABLE quotas (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- state, aiq, all_india, etc.
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Authorities (KEA, AIQ, MCC, etc.)
CREATE TABLE authorities (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ADMIN & WORKFLOW
-- ========================================

-- Users and roles
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL, -- super_admin, admin, editor, viewer
    permissions TEXT, -- JSON object of permissions
    status TEXT DEFAULT 'active',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Import jobs and tracking
CREATE TABLE import_jobs (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL, -- colleges, cutoffs, fees, etc.
    filename TEXT NOT NULL,
    status TEXT NOT NULL, -- pending, processing, completed, failed
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    success_records INTEGER DEFAULT 0,
    error_records INTEGER DEFAULT 0,
    errors TEXT, -- JSON array of errors
    warnings TEXT, -- JSON array of warnings
    mapping_preset TEXT, -- saved field mapping
    created_by INTEGER NOT NULL,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit trail
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    entity_type TEXT NOT NULL, -- colleges, cutoffs, users, etc.
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- create, update, delete, import
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    user_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    source_job_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_job_id) REFERENCES import_jobs(id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Colleges indexes
CREATE INDEX idx_colleges_name ON colleges(name);
CREATE INDEX idx_colleges_city ON colleges(city);
CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_type ON colleges(college_type);
CREATE INDEX idx_colleges_management ON colleges(management_type);
CREATE INDEX idx_colleges_status ON colleges(status);

-- Programs indexes
CREATE INDEX idx_programs_college ON programs(college_id);
CREATE INDEX idx_programs_name ON programs(name);
CREATE INDEX idx_programs_type ON programs(course_type);
CREATE INDEX idx_programs_level ON programs(level);

-- Cutoffs indexes
CREATE INDEX idx_cutoffs_college ON cutoffs(college_id);
CREATE INDEX idx_cutoffs_program ON cutoffs(program_id);
CREATE INDEX idx_cutoffs_year ON cutoffs(year);
CREATE INDEX idx_cutoffs_round ON cutoffs(round);
CREATE INDEX idx_cutoffs_authority ON cutoffs(authority);
CREATE INDEX idx_cutoffs_quota ON cutoffs(quota);
CREATE INDEX idx_cutoffs_category ON cutoffs(category);
CREATE INDEX idx_cutoffs_rank ON cutoffs(opening_rank, closing_rank);
CREATE INDEX idx_cutoffs_status ON cutoffs(status);

-- Composite indexes for common queries
CREATE INDEX idx_cutoffs_composite ON cutoffs(year, authority, quota, category);
CREATE INDEX idx_cutoffs_search ON cutoffs(college_id, program_id, year, round);

-- Seat matrix indexes
CREATE INDEX idx_seat_matrix_college ON seat_matrix(college_id);
CREATE INDEX idx_seat_matrix_program ON seat_matrix(program_id);
CREATE INDEX idx_seat_matrix_year ON seat_matrix(year);

-- Fees indexes
CREATE INDEX idx_fees_college ON fees(college_id);
CREATE INDEX idx_fees_program ON fees(program_id);
CREATE INDEX idx_fees_year ON fees(year);

-- Users and audit indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Import jobs indexes
CREATE INDEX idx_import_jobs_type ON import_jobs(type);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_created_by ON import_jobs(created_by);

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default states
INSERT INTO states (name, code, region) VALUES 
('Karnataka', 'KA', 'South'),
('Delhi', 'DL', 'North'),
('Maharashtra', 'MH', 'West'),
('Tamil Nadu', 'TN', 'South'),
('Uttar Pradesh', 'UP', 'North'),
('West Bengal', 'WB', 'East'),
('Telangana', 'TS', 'South'),
('Andhra Pradesh', 'AP', 'South'),
('Gujarat', 'GJ', 'West'),
('Rajasthan', 'RJ', 'North');

-- Insert default categories
INSERT INTO categories (code, name, description, reservation_percentage, is_general) VALUES
('GM', 'General Merit', 'General category', 0, 1),
('SC', 'Scheduled Caste', 'Scheduled Caste category', 15, 0),
('ST', 'Scheduled Tribe', 'Scheduled Tribe category', 7.5, 0),
('OBC', 'Other Backward Classes', 'OBC category', 27, 0),
('EWS', 'Economically Weaker Section', 'EWS category', 10, 0),
('PWD', 'Persons with Disability', 'PWD category', 5, 0);

-- Insert default quotas
INSERT INTO quotas (code, name, description) VALUES
('state', 'State Quota', 'State-level counseling'),
('aiq', 'All India Quota', 'All India level counseling'),
('all_india', 'All India', 'All India level'),
('central', 'Central Quota', 'Central government quota'),
('deemed', 'Deemed University', 'Deemed university quota');

-- Insert default authorities
INSERT INTO authorities (code, name, description, website) VALUES
('KEA', 'Karnataka Examinations Authority', 'Karnataka state counseling authority', 'https://cetonline.karnataka.gov.in'),
('AIQ', 'All India Quota', 'All India counseling authority', 'https://mcc.nic.in'),
('MCC', 'Medical Counselling Committee', 'Central counseling authority', 'https://mcc.nic.in'),
('NEET', 'National Eligibility cum Entrance Test', 'National medical entrance exam', 'https://neet.nta.nic.in');

-- Insert default admin user
INSERT INTO users (username, email, password_hash, role, permissions) VALUES
('admin', 'admin@neetlogiq.com', '$2b$10$default_hash_placeholder', 'super_admin', '{"all": true}');

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- View for college summary with program count
CREATE VIEW college_summary AS
SELECT 
    c.id,
    c.name,
    c.city,
    c.state,
    c.college_type,
    c.management_type,
    c.status,
    COUNT(p.id) as program_count,
    SUM(p.total_seats) as total_seats,
    c.created_at,
    c.updated_at
FROM colleges c
LEFT JOIN programs p ON c.id = p.college_id AND p.status = 'active'
GROUP BY c.id;

-- View for cutoff summary
CREATE VIEW cutoff_summary AS
SELECT 
    c.id,
    c.college_name,
    c.city,
    c.state,
    p.name as program_name,
    p.level,
    co.year,
    co.round,
    co.authority,
    co.quota,
    co.category,
    co.opening_rank,
    co.closing_rank,
    co.seats_available,
    co.status
FROM cutoffs co
JOIN colleges c ON co.college_id = c.id
JOIN programs p ON co.program_id = p.id
WHERE co.status = 'active';

-- ========================================
-- TRIGGERS FOR AUTOMATION
-- ========================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_colleges_timestamp 
    AFTER UPDATE ON colleges
    FOR EACH ROW
BEGIN
    UPDATE colleges SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_programs_timestamp 
    AFTER UPDATE ON programs
    FOR EACH ROW
BEGIN
    UPDATE programs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_cutoffs_timestamp 
    AFTER UPDATE ON cutoffs
    FOR EACH ROW
BEGIN
    UPDATE cutoffs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update audit log
CREATE TRIGGER audit_colleges_changes
    AFTER UPDATE ON colleges
    FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (entity_type, entity_id, action, field_name, old_value, new_value, user_id, ip_address)
    VALUES ('colleges', NEW.id, 'update', 'general', OLD.name, NEW.name, 1, 'system');
END;
