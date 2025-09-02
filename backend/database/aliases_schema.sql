-- ========================================
-- ALIASES SYSTEM SCHEMA
-- ========================================
-- Comprehensive aliases system for colleges, programs, and other entities
-- Supports multiple alias types, confidence scoring, and automatic generation

-- Main aliases table
CREATE TABLE aliases (
    id INTEGER PRIMARY KEY,
    entity_type TEXT NOT NULL, -- 'college', 'program', 'city', 'state', 'university'
    entity_id INTEGER NOT NULL, -- ID of the referenced entity
    alias_text TEXT NOT NULL, -- The alias/alternative name
    normalized_alias TEXT NOT NULL, -- Normalized version for searching
    alias_type TEXT NOT NULL, -- 'abbreviation', 'acronym', 'nickname', 'misspelling', 'alternative', 'short_form', 'common_name'
    confidence_score REAL DEFAULT 1.0, -- 0.0 to 1.0 confidence in this alias
    usage_frequency INTEGER DEFAULT 0, -- How often this alias is used
    is_primary BOOLEAN DEFAULT 0, -- Is this the primary/preferred alias
    is_auto_generated BOOLEAN DEFAULT 0, -- Was this alias auto-generated
    source TEXT DEFAULT 'manual', -- 'manual', 'auto_generated', 'import', 'user_suggestion'
    context TEXT, -- Additional context about when/where this alias is used
    notes TEXT, -- Additional notes about this alias
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'pending_review', 'rejected'
    verified_at DATETIME,
    verified_by INTEGER, -- User ID who verified this alias
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER, -- User ID who created this alias
    FOREIGN KEY (verified_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Alias patterns table for automatic generation rules
CREATE TABLE alias_patterns (
    id INTEGER PRIMARY KEY,
    pattern_name TEXT NOT NULL UNIQUE,
    pattern_type TEXT NOT NULL, -- 'abbreviation', 'acronym', 'short_form', 'nickname'
    regex_pattern TEXT NOT NULL, -- Regex pattern to match
    replacement_rule TEXT NOT NULL, -- How to generate alias from match
    confidence_score REAL DEFAULT 0.8, -- Default confidence for this pattern
    is_active BOOLEAN DEFAULT 1,
    description TEXT,
    examples TEXT, -- JSON array of examples
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alias suggestions from users
CREATE TABLE alias_suggestions (
    id INTEGER PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    suggested_alias TEXT NOT NULL,
    alias_type TEXT NOT NULL,
    confidence_score REAL DEFAULT 0.5,
    user_id INTEGER, -- User who suggested (can be null for anonymous)
    user_email TEXT, -- Email for anonymous suggestions
    justification TEXT, -- Why this alias should be added
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'duplicate'
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    review_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Alias usage tracking
CREATE TABLE alias_usage_logs (
    id INTEGER PRIMARY KEY,
    alias_id INTEGER NOT NULL,
    search_query TEXT NOT NULL,
    search_context TEXT, -- Where the search was performed
    user_id INTEGER, -- User who used the alias (can be null)
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT 1, -- Did the search succeed
    result_count INTEGER DEFAULT 0, -- Number of results returned
    response_time_ms INTEGER, -- How long the search took
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alias_id) REFERENCES aliases(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Alias relationships (for complex aliases that relate to multiple entities)
CREATE TABLE alias_relationships (
    id INTEGER PRIMARY KEY,
    primary_alias_id INTEGER NOT NULL,
    related_alias_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL, -- 'synonym', 'abbreviation_of', 'nickname_for', 'misspelling_of'
    confidence_score REAL DEFAULT 1.0,
    is_bidirectional BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_alias_id) REFERENCES aliases(id),
    FOREIGN KEY (related_alias_id) REFERENCES aliases(id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Primary search indexes
CREATE INDEX idx_aliases_entity ON aliases(entity_type, entity_id);
CREATE INDEX idx_aliases_text ON aliases(alias_text);
CREATE INDEX idx_aliases_normalized ON aliases(normalized_alias);
CREATE INDEX idx_aliases_type ON aliases(alias_type);
CREATE INDEX idx_aliases_status ON aliases(status);
CREATE INDEX idx_aliases_confidence ON aliases(confidence_score);

-- Composite indexes for common queries
CREATE INDEX idx_aliases_search ON aliases(entity_type, normalized_alias, status);
CREATE INDEX idx_aliases_entity_status ON aliases(entity_type, entity_id, status);
CREATE INDEX idx_aliases_primary ON aliases(entity_type, entity_id, is_primary);

-- Pattern matching indexes
CREATE INDEX idx_alias_patterns_type ON alias_patterns(pattern_type);
CREATE INDEX idx_alias_patterns_active ON alias_patterns(is_active);

-- Suggestion indexes
CREATE INDEX idx_alias_suggestions_entity ON alias_suggestions(entity_type, entity_id);
CREATE INDEX idx_alias_suggestions_status ON alias_suggestions(status);
CREATE INDEX idx_alias_suggestions_user ON alias_suggestions(user_id);

-- Usage tracking indexes
CREATE INDEX idx_alias_usage_alias ON alias_usage_logs(alias_id);
CREATE INDEX idx_alias_usage_created ON alias_usage_logs(created_at);
CREATE INDEX idx_alias_usage_success ON alias_usage_logs(success);

-- Relationship indexes
CREATE INDEX idx_alias_relationships_primary ON alias_relationships(primary_alias_id);
CREATE INDEX idx_alias_relationships_related ON alias_relationships(related_alias_id);
CREATE INDEX idx_alias_relationships_type ON alias_relationships(relationship_type);

-- ========================================
-- TRIGGERS FOR AUTOMATION
-- ========================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_aliases_timestamp 
    AFTER UPDATE ON aliases
    FOR EACH ROW
BEGIN
    UPDATE aliases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_alias_patterns_timestamp 
    AFTER UPDATE ON alias_patterns
    FOR EACH ROW
BEGIN
    UPDATE alias_patterns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update usage frequency
CREATE TRIGGER update_alias_usage_frequency
    AFTER INSERT ON alias_usage_logs
    FOR EACH ROW
BEGIN
    UPDATE aliases 
    SET usage_frequency = usage_frequency + 1 
    WHERE id = NEW.alias_id;
END;

-- Trigger to ensure only one primary alias per entity
CREATE TRIGGER ensure_single_primary_alias
    AFTER UPDATE OF is_primary ON aliases
    FOR EACH ROW
    WHEN NEW.is_primary = 1
BEGIN
    UPDATE aliases 
    SET is_primary = 0 
    WHERE entity_type = NEW.entity_type 
      AND entity_id = NEW.entity_id 
      AND id != NEW.id 
      AND is_primary = 1;
END;

-- ========================================
-- INITIAL ALIAS PATTERNS
-- ========================================

-- Common abbreviation patterns
INSERT INTO alias_patterns (pattern_name, pattern_type, regex_pattern, replacement_rule, confidence_score, description, examples) VALUES
('dot_separated_abbreviation', 'abbreviation', '([A-Z])\.([A-Z])\.([A-Z])', '$1 $2 $3', 0.9, 'Convert A.B.C. to A B C', '["A.B.C.", "M.S.R.", "K.V.G."]'),
('space_separated_abbreviation', 'abbreviation', '([A-Z]) ([A-Z]) ([A-Z])', '$1.$2.$3', 0.9, 'Convert A B C to A.B.C.', '["A B C", "M S R", "K V G"]'),
('two_letter_abbreviation', 'abbreviation', '([A-Z])\.([A-Z])', '$1 $2', 0.8, 'Convert A.J. to A J', '["A.J.", "M.S.", "K.V."]'),
('two_letter_space', 'abbreviation', '([A-Z]) ([A-Z])', '$1.$2', 0.8, 'Convert A J to A.J.', '["A J", "M S", "K V"]'),
('single_letter_abbreviation', 'abbreviation', '([A-Z])\.', '$1', 0.7, 'Convert A. to A', '["A.", "B.", "C."]'),
('medical_college_suffix', 'short_form', 'MEDICAL COLLEGE', 'MC', 0.8, 'Short form for Medical College', '["MEDICAL COLLEGE"]'),
('dental_college_suffix', 'short_form', 'DENTAL COLLEGE', 'DC', 0.8, 'Short form for Dental College', '["DENTAL COLLEGE"]'),
('institute_suffix', 'short_form', 'INSTITUTE', 'INST', 0.7, 'Short form for Institute', '["INSTITUTE"]'),
('university_suffix', 'short_form', 'UNIVERSITY', 'UNIV', 0.7, 'Short form for University', '["UNIVERSITY"]'),
('hospital_suffix', 'short_form', 'HOSPITAL', 'HOSP', 0.7, 'Short form for Hospital', '["HOSPITAL"]'),
('common_misspellings', 'misspelling', 'BANGALORE', 'BANGALURU', 0.9, 'Common misspelling correction', '["BANGALORE"]'),
('state_abbreviations', 'abbreviation', 'KARNATAKA', 'KA', 0.8, 'State abbreviation', '["KARNATAKA"]');

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- View for active aliases with entity information
CREATE VIEW active_aliases AS
SELECT 
    a.id,
    a.entity_type,
    a.entity_id,
    a.alias_text,
    a.normalized_alias,
    a.alias_type,
    a.confidence_score,
    a.usage_frequency,
    a.is_primary,
    a.is_auto_generated,
    a.source,
    a.context,
    a.status,
    a.created_at,
    a.updated_at,
    CASE 
        WHEN a.entity_type = 'college' THEN c.name
        WHEN a.entity_type = 'program' THEN p.name
        ELSE NULL
    END as entity_name
FROM aliases a
LEFT JOIN colleges c ON a.entity_type = 'college' AND a.entity_id = c.id
LEFT JOIN programs p ON a.entity_type = 'program' AND a.entity_id = p.id
WHERE a.status = 'active';

-- View for alias statistics
CREATE VIEW alias_statistics AS
SELECT 
    entity_type,
    alias_type,
    COUNT(*) as total_aliases,
    COUNT(CASE WHEN is_primary = 1 THEN 1 END) as primary_aliases,
    COUNT(CASE WHEN is_auto_generated = 1 THEN 1 END) as auto_generated,
    COUNT(CASE WHEN is_auto_generated = 0 THEN 1 END) as manual,
    AVG(confidence_score) as avg_confidence,
    SUM(usage_frequency) as total_usage,
    MAX(updated_at) as last_updated
FROM aliases
WHERE status = 'active'
GROUP BY entity_type, alias_type;

-- View for top used aliases
CREATE VIEW top_used_aliases AS
SELECT 
    a.id,
    a.entity_type,
    a.entity_id,
    a.alias_text,
    a.alias_type,
    a.usage_frequency,
    a.confidence_score,
    CASE 
        WHEN a.entity_type = 'college' THEN c.name
        WHEN a.entity_type = 'program' THEN p.name
        ELSE NULL
    END as entity_name
FROM aliases a
LEFT JOIN colleges c ON a.entity_type = 'college' AND a.entity_id = c.id
LEFT JOIN programs p ON a.entity_type = 'program' AND a.entity_id = p.id
WHERE a.status = 'active' AND a.usage_frequency > 0
ORDER BY a.usage_frequency DESC, a.confidence_score DESC;

-- ========================================
-- FUNCTIONS FOR ALIAS OPERATIONS
-- ========================================

-- Function to get all aliases for an entity
-- This would be implemented as a stored procedure in a real database
-- For SQLite, we'll use views and queries instead

-- Example query to get all aliases for a college:
-- SELECT * FROM active_aliases WHERE entity_type = 'college' AND entity_id = ?;

-- Example query to search using aliases:
-- SELECT DISTINCT entity_id, entity_name FROM active_aliases 
-- WHERE entity_type = 'college' AND normalized_alias LIKE ?;

-- Example query to get alias suggestions:
-- SELECT * FROM alias_suggestions WHERE status = 'pending' ORDER BY created_at DESC;
