-- Clean Database Schema for College Management System
-- This schema is designed to work with standardized Excel data
-- Cutoff structure is ready for official quota data

-- Enable foreign keys and WAL mode
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ========================================
-- CORE TABLES
-- ========================================

-- Colleges table - stable information
CREATE TABLE colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE, -- College code if available
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Programs/Courses table - stable course information
CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- MBBS, BDS, MD, MS, DNB, etc.
    level TEXT NOT NULL, -- UG, PG, DIPLOMA, FELLOWSHIP
    course_type TEXT NOT NULL, -- MEDICAL, DENTAL, DNB, PARAMEDICAL
    specialization TEXT, -- General Medicine, Surgery, etc.
    duration INTEGER, -- Duration in months
    entrance_exam TEXT, -- NEET, NEET-PG, AIIMS, JIPMER, etc.
    total_seats INTEGER DEFAULT 0, -- Total capacity (stable number)
    fee_structure TEXT, -- Fee information if available
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- ========================================
-- CUTOFF STRUCTURE (Ready for Official Data)
-- ========================================

-- Cutoffs table - for official quota-wise data
CREATE TABLE cutoffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    year INTEGER NOT NULL, -- 2024, 2023, etc.
    round TEXT NOT NULL, -- r1, r2, r3, etc.
    authority TEXT NOT NULL, -- NEET, NEET-PG, AIIMS, etc.
    quota TEXT NOT NULL, -- GENERAL, OBC, SC, ST, EWS, PWD
    category TEXT NOT NULL, -- GENERAL, OBC, SC, ST, EWS, PWD
    opening_rank INTEGER,
    closing_rank INTEGER,
    opening_score DECIMAL(8,2),
    closing_score DECIMAL(8,2),
    score_type TEXT, -- PERCENTILE, RAW_SCORE, etc.
    score_unit TEXT, -- PERCENTAGE, MARKS, etc.
    seats_available INTEGER,
    seats_filled INTEGER,
    seat_type TEXT, -- OPEN, RESERVED, etc.
    source_url TEXT, -- Official source URL
    confidence_score INTEGER DEFAULT 1 CHECK (confidence_score BETWEEN 1 AND 5),
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'provisional')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- ========================================
-- SUPPORTING TABLES
-- ========================================

-- States table - for standardization
CREATE TABLE states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE, -- State code like KA, MH, etc.
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cities table - for standardization
CREATE TABLE cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- College types table - for standardization
CREATE TABLE college_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- MEDICAL, DENTAL, DNB, MULTI
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Management types table - for standardization
CREATE TABLE management_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- GOVERNMENT, PRIVATE, TRUST, DEEMED
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Program levels table - for standardization
CREATE TABLE program_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- UG, PG, DIPLOMA, FELLOWSHIP
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entrance exams table - for standardization
CREATE TABLE entrance_exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- NEET, NEET-PG, AIIMS, JIPMER
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- College indexes
CREATE INDEX idx_colleges_name ON colleges(name);
CREATE INDEX idx_colleges_city ON colleges(city);
CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_type ON colleges(college_type);
CREATE INDEX idx_colleges_management ON colleges(management_type);

-- Program indexes
CREATE INDEX idx_programs_college_id ON programs(college_id);
CREATE INDEX idx_programs_name ON programs(name);
CREATE INDEX idx_programs_level ON programs(level);
CREATE INDEX idx_programs_course_type ON programs(course_type);

-- Cutoff indexes
CREATE INDEX idx_cutoffs_college_id ON cutoffs(college_id);
CREATE INDEX idx_cutoffs_program_id ON cutoffs(program_id);
CREATE INDEX idx_cutoffs_year ON cutoffs(year);
CREATE INDEX idx_cutoffs_quota ON cutoffs(quota);
CREATE INDEX idx_cutoffs_category ON cutoffs(category);
CREATE INDEX idx_cutoffs_authority ON cutoffs(authority);

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- College summary view
CREATE VIEW college_summary AS
SELECT 
    c.id,
    c.name,
    c.city,
    c.state,
    c.college_type,
    c.management_type,
    c.establishment_year,
    COUNT(p.id) as total_programs,
    SUM(p.total_seats) as total_seats
FROM colleges c
LEFT JOIN programs p ON c.id = p.college_id
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.city, c.state, c.college_type, c.management_type, c.establishment_year;

-- Program summary view
CREATE VIEW program_summary AS
SELECT 
    p.id,
    p.name,
    p.level,
    p.course_type,
    p.specialization,
    p.duration,
    p.entrance_exam,
    p.total_seats,
    c.name as college_name,
    c.city,
    c.state,
    c.college_type
FROM programs p
JOIN colleges c ON p.college_id = c.id
WHERE p.status = 'active' AND c.status = 'active';

-- ========================================
-- INITIAL DATA (Standardized Values)
-- ========================================

-- Insert standard states
INSERT INTO states (name, code) VALUES 
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CG'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OD'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TS'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Delhi', 'DL'),
('Jammu and Kashmir', 'JK'),
('Ladakh', 'LA'),
('Chandigarh', 'CH'),
('Dadra and Nagar Haveli and Daman and Diu', 'DN'),
('Lakshadweep', 'LD'),
('Puducherry', 'PY'),
('Andaman and Nicobar Islands', 'AN');

-- Insert standard college types
INSERT INTO college_types (name, description) VALUES
('MEDICAL', 'Medical colleges offering MBBS and MD/MS programs'),
('DENTAL', 'Dental colleges offering BDS programs'),
('DNB', 'Diplomate of National Board training centers'),
('MULTI', 'Colleges offering multiple types of programs'),
('PARAMEDICAL', 'Paramedical and allied health sciences colleges');

-- Insert standard management types
INSERT INTO management_types (name, description) VALUES
('GOVERNMENT', 'Government owned and managed'),
('PRIVATE', 'Privately owned and managed'),
('TRUST', 'Trust managed institutions'),
('DEEMED', 'Deemed to be universities'),
('AUTONOMOUS', 'Autonomous institutions');

-- Insert standard program levels
INSERT INTO program_levels (name, description) VALUES
('UG', 'Undergraduate programs'),
('PG', 'Postgraduate programs'),
('DIPLOMA', 'Diploma programs'),
('FELLOWSHIP', 'Fellowship programs'),
('CERTIFICATE', 'Certificate programs');

-- Insert standard entrance exams
INSERT INTO entrance_exams (name, description) VALUES
('NEET', 'National Eligibility cum Entrance Test'),
('NEET-PG', 'National Eligibility cum Entrance Test for Postgraduates'),
('AIIMS', 'All India Institute of Medical Sciences entrance'),
('JIPMER', 'Jawaharlal Institute of Postgraduate Medical Education and Research'),
('AIIMS-PG', 'AIIMS Postgraduate entrance'),
('JIPMER-PG', 'JIPMER Postgraduate entrance');
