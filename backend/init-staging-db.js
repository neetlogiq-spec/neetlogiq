const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🚀 Initializing staging database for intelligent cutoffs...');

const db = new sqlite3.Database(path.join(__dirname, 'database/staging_cutoffs.db'));

db.serialize(() => {
  // Create staging_cutoffs table
  db.run(`
    CREATE TABLE IF NOT EXISTS staging_cutoffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      all_india_rank INTEGER,
      quota TEXT,
      college_institute TEXT,
      course TEXT,
      category TEXT,
      round TEXT,
      year INTEGER,
      college_match_id INTEGER,
      course_match_id INTEGER,
      confidence_score REAL,
      status TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating staging_cutoffs table:', err);
    } else {
      console.log('✅ staging_cutoffs table created successfully');
    }
  });

  // Create cutoffs table in unified database
  const unifiedDb = new sqlite3.Database(path.join(__dirname, 'database/unified.db'));
  
  unifiedDb.run(`
    CREATE TABLE IF NOT EXISTS cutoffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER,
      course_id INTEGER,
      quota TEXT,
      category TEXT,
      round TEXT,
      year INTEGER,
      cutoff_rank INTEGER,
      total_records INTEGER,
      all_ranks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(college_id, course_id, quota, category, round, year)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating cutoffs table:', err);
    } else {
      console.log('✅ cutoffs table created successfully');
    }
    unifiedDb.close();
  });

  // Insert some sample data for testing
  db.run(`
    INSERT OR IGNORE INTO staging_cutoffs (
      all_india_rank, quota, college_institute, course, category, round, year,
      college_match_id, course_match_id, confidence_score, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    24096, 'STATE', 'A.J.INSTITUTE OF MEDICAL SCIENCES ,NH 17, KUNTIKANA,MANGALORE',
    'M.D. ANAESTHESIA', '2AG', 'KEA_R1', 2024, 1, 1, 0.95, 'matched'
  ], (err) => {
    if (err) {
      console.error('❌ Error inserting sample data:', err);
    } else {
      console.log('✅ Sample data inserted successfully');
    }
  });

  db.close(() => {
    console.log('🎉 Staging database initialization completed!');
  });
});
