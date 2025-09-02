// Migration script to export SQLite data for Cloudflare D1
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'backend', 'database', 'clean-unified.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('Database not found at:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

// Export functions
function exportColleges() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        name as college_name,
        city,
        state,
        college_type,
        management_type,
        university,
        address,
        phone,
        email,
        website,
        status
      FROM colleges 
      WHERE status = 'active'
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Convert to SQL INSERT statements
      const inserts = rows.map(row => {
        const values = Object.values(row).map(val => 
          val === null ? 'NULL' : `'${val.toString().replace(/'/g, "''")}'`
        ).join(', ');
        
        return `INSERT INTO colleges (college_name, city, state, college_type, management_type, university, address, phone, email, website, status) VALUES (${values});`;
      });
      
      fs.writeFileSync('migrations/colleges_data.sql', inserts.join('\n'));
      console.log(`Exported ${rows.length} colleges`);
      resolve(rows.length);
    });
  });
}

function exportCourses() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        c.name as college_name,
        p.name as course_name,
        p.level as stream,
        p.level,
        p.total_seats,
        c.management_type,
        c.city,
        c.state,
        p.status
      FROM programs p
      JOIN colleges c ON p.college_id = c.id
      WHERE p.status = 'active' AND c.status = 'active'
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const inserts = rows.map(row => {
        const values = Object.values(row).map(val => 
          val === null ? 'NULL' : `'${val.toString().replace(/'/g, "''")}'`
        ).join(', ');
        
        return `INSERT INTO courses (college_name, course_name, stream, level, total_seats, management_type, city, state, status) VALUES (${values});`;
      });
      
      fs.writeFileSync('migrations/courses_data.sql', inserts.join('\n'));
      console.log(`Exported ${rows.length} courses`);
      resolve(rows.length);
    });
  });
}

function exportCutoffs() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        c.name as college_name,
        p.name as course_name,
        co.year,
        co.round,
        co.authority,
        co.quota,
        co.category,
        co.opening_rank,
        co.closing_rank,
        co.opening_score,
        co.closing_score,
        co.seats_available,
        c.city,
        c.state,
        co.status
      FROM cutoffs co
      JOIN colleges c ON co.college_id = c.id
      JOIN programs p ON co.program_id = p.id
      WHERE co.status = 'active' AND c.status = 'active' AND p.status = 'active'
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const inserts = rows.map(row => {
        const values = Object.values(row).map(val => 
          val === null ? 'NULL' : `'${val.toString().replace(/'/g, "''")}'`
        ).join(', ');
        
        return `INSERT INTO cutoffs (college_name, course_name, year, round, authority, quota, category, opening_rank, closing_rank, opening_score, closing_score, seats_available, city, state, status) VALUES (${values});`;
      });
      
      fs.writeFileSync('migrations/cutoffs_data.sql', inserts.join('\n'));
      console.log(`Exported ${rows.length} cutoffs`);
      resolve(rows.length);
    });
  });
}

// Main migration function
async function migrate() {
  try {
    console.log('Starting migration to Cloudflare D1...');
    
    const collegesCount = await exportColleges();
    const coursesCount = await exportCourses();
    const cutoffsCount = await exportCutoffs();
    
    console.log('\nMigration completed successfully!');
    console.log(`- Colleges: ${collegesCount}`);
    console.log(`- Courses: ${coursesCount}`);
    console.log(`- Cutoffs: ${cutoffsCount}`);
    
    console.log('\nNext steps:');
    console.log('1. Create D1 database: wrangler d1 create neetlogiq-db');
    console.log('2. Run migrations: wrangler d1 migrations apply neetlogiq-db');
    console.log('3. Import data: wrangler d1 execute neetlogiq-db --file=./migrations/colleges_data.sql');
    console.log('4. Import data: wrangler d1 execute neetlogiq-db --file=./migrations/courses_data.sql');
    console.log('5. Import data: wrangler d1 execute neetlogiq-db --file=./migrations/cutoffs_data.sql');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
}

// Run migration
migrate();
