-- Add FTS5 virtual tables for fast full-text search
-- This migration creates FTS5 indexes for colleges and courses

-- Create FTS5 virtual table for colleges
CREATE VIRTUAL TABLE colleges_fts USING fts5(
    name,
    college_type,
    management_type,
    city,
    state,
    university,
    content='colleges',
    content_rowid='id'
);

-- Create FTS5 virtual table for courses
CREATE VIRTUAL TABLE courses_fts USING fts5(
    course_name,
    stream,
    program,
    content='courses',
    content_rowid='id'
);

-- Populate colleges_fts with existing data
INSERT INTO colleges_fts(rowid, name, college_type, management_type, city, state, university)
SELECT id, name, college_type, management_type, city, state, university FROM colleges;

-- Populate courses_fts with existing data
INSERT INTO courses_fts(rowid, course_name, stream, program)
SELECT id, course_name, stream, program FROM courses;

-- Create triggers to keep FTS5 tables in sync with main tables

-- Trigger for colleges table
CREATE TRIGGER colleges_ai AFTER INSERT ON colleges BEGIN
    INSERT INTO colleges_fts(rowid, name, college_type, management_type, city, state, university)
    VALUES (NEW.id, NEW.name, NEW.college_type, NEW.management_type, NEW.city, NEW.state, NEW.university);
END;

CREATE TRIGGER colleges_ad AFTER DELETE ON colleges BEGIN
    INSERT INTO colleges_fts(colleges_fts, rowid, name, college_type, management_type, city, state, university)
    VALUES ('delete', OLD.id, OLD.name, OLD.college_type, OLD.management_type, OLD.city, OLD.state, OLD.university);
END;

CREATE TRIGGER colleges_au AFTER UPDATE ON colleges BEGIN
    INSERT INTO colleges_fts(colleges_fts, rowid, name, college_type, management_type, city, state, university)
    VALUES ('delete', OLD.id, OLD.name, OLD.college_type, OLD.management_type, OLD.city, OLD.state, OLD.university);
    INSERT INTO colleges_fts(rowid, name, college_type, management_type, city, state, university)
    VALUES (NEW.id, NEW.name, NEW.college_type, NEW.management_type, NEW.city, NEW.state, NEW.university);
END;

-- Trigger for courses table
CREATE TRIGGER courses_ai AFTER INSERT ON courses BEGIN
    INSERT INTO courses_fts(rowid, course_name, stream, program)
    VALUES (NEW.id, NEW.course_name, NEW.stream, NEW.program);
END;

CREATE TRIGGER courses_ad AFTER DELETE ON courses BEGIN
    INSERT INTO courses_fts(courses_fts, rowid, course_name, stream, program)
    VALUES ('delete', OLD.id, OLD.course_name, OLD.stream, OLD.program);
END;

CREATE TRIGGER courses_au AFTER UPDATE ON courses BEGIN
    INSERT INTO courses_fts(courses_fts, rowid, course_name, stream, program)
    VALUES ('delete', OLD.id, OLD.course_name, OLD.stream, OLD.program);
    INSERT INTO courses_fts(rowid, course_name, stream, program)
    VALUES (NEW.id, NEW.course_name, NEW.stream, NEW.program);
END;
