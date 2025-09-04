-- Clean Unified Database Schema for NEET Logiq
-- This migration creates the clean-unified database structure

-- Colleges table
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    college_type_category TEXT
);

-- Programs table
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

-- Cutoffs table
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

-- States table
CREATE TABLE states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE, -- State code like KA, MH, etc.
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- College types table
CREATE TABLE college_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- MEDICAL, DENTAL, DNB, MULTI
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Management types table
CREATE TABLE management_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- GOVERNMENT, PRIVATE, TRUST, DEEMED
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Program levels table
CREATE TABLE program_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- UG, PG, DIPLOMA, FELLOWSHIP
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entrance exams table
CREATE TABLE entrance_exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- NEET, NEET-PG, AIIMS, JIPMER
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_colleges_name ON colleges(name);
CREATE INDEX idx_colleges_city ON colleges(city);
CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_type ON colleges(college_type);
CREATE INDEX idx_colleges_management ON colleges(management_type);
CREATE INDEX idx_programs_college_id ON programs(college_id);
CREATE INDEX idx_programs_name ON programs(name);
CREATE INDEX idx_programs_level ON programs(level);
CREATE INDEX idx_programs_course_type ON programs(course_type);
CREATE INDEX idx_cutoffs_college_id ON cutoffs(college_id);
CREATE INDEX idx_cutoffs_program_id ON cutoffs(program_id);
CREATE INDEX idx_cutoffs_year ON cutoffs(year);
CREATE INDEX idx_cutoffs_quota ON cutoffs(quota);
CREATE INDEX idx_cutoffs_category ON cutoffs(category);
CREATE INDEX idx_cutoffs_authority ON cutoffs(authority);
CREATE INDEX idx_cutoffs_round ON cutoffs(round);
CREATE INDEX idx_cutoffs_status ON cutoffs(status);

-- Views for easier querying
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
