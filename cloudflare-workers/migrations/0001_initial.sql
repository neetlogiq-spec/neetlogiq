-- Initial migration for NEET Logiq D1 Database
-- Simplified schema for Cloudflare D1

-- Colleges table
CREATE TABLE colleges (
    id INTEGER PRIMARY KEY,
    college_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    college_type TEXT NOT NULL, -- MEDICAL, DENTAL, DNB
    management_type TEXT NOT NULL, -- GOVERNMENT, PRIVATE, DEEMED
    university TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses table (simplified from programs)
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    college_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    stream TEXT NOT NULL, -- MEDICAL, DENTAL, DNB
    level TEXT NOT NULL, -- MBBS, MD, MS, BDS, MDS, DNB
    total_seats INTEGER DEFAULT 0,
    management_type TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cutoffs table
CREATE TABLE cutoffs (
    id INTEGER PRIMARY KEY,
    college_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    round TEXT NOT NULL,
    authority TEXT NOT NULL, -- KEA, AIQ, MCC
    quota TEXT NOT NULL, -- state, aiq, all_india
    category TEXT NOT NULL, -- GM, SC, ST, OBC
    opening_rank INTEGER,
    closing_rank INTEGER,
    opening_score REAL,
    closing_score REAL,
    seats_available INTEGER DEFAULT 0,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_colleges_name ON colleges(college_name);
CREATE INDEX idx_colleges_city ON colleges(city);
CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_type ON colleges(college_type);
CREATE INDEX idx_colleges_management ON colleges(management_type);

CREATE INDEX idx_courses_college ON courses(college_name);
CREATE INDEX idx_courses_name ON courses(course_name);
CREATE INDEX idx_courses_stream ON courses(stream);
CREATE INDEX idx_courses_city ON courses(city);
CREATE INDEX idx_courses_state ON courses(state);

CREATE INDEX idx_cutoffs_college ON cutoffs(college_name);
CREATE INDEX idx_cutoffs_course ON cutoffs(course_name);
CREATE INDEX idx_cutoffs_year ON cutoffs(year);
CREATE INDEX idx_cutoffs_authority ON cutoffs(authority);
CREATE INDEX idx_cutoffs_quota ON cutoffs(quota);
CREATE INDEX idx_cutoffs_category ON cutoffs(category);
CREATE INDEX idx_cutoffs_rank ON cutoffs(opening_rank, closing_rank);
