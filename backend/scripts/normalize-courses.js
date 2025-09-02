const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '../data/clean-unified.db');

// Course normalization rules based on Excel analysis
const normalizationRules = {
  // Degree level standardization
  'DOCTOR OF MEDICINE': 'MD',
  'M.D.': 'MD',
  'MASTER OF SURGERY': 'MS',
  'M.S.': 'MS',
  'MASTER OF CHIRURGIAE': 'M.CH',
  'M.CH': 'M.CH',
  'M CH': 'M.CH',
  'DOCTOR OF MEDICINE - SUPER SPECIALTY': 'DM',
  'DIPLOMA IN': 'DIPLOMA',
  'DIP.': 'DIPLOMA',
  
  // Specialty standardization
  'RADIO DIAGNOSIS': 'RADIOLOGY',
  'RADIO DIAGNOSIS/RADIOLOGY': 'RADIOLOGY',
  'GENERAL MEDICINE': 'MEDICINE',
  'GENERAL SURGERY': 'SURGERY',
  'OBSTETRICS & GYNAECOLOGY': 'OBSTETRICS & GYNAECOLOGY',
  'OBSTETRICS AND GYNAECOLOGY': 'OBSTETRICS & GYNAECOLOGY',
  'OPHTHALMOLOGY': 'OPHTHALMOLOGY',
  'ENT': 'ENT',
  'DERMATOLOGY': 'DERMATOLOGY',
  'SKIN & VD': 'DERMATOLOGY',
  'PAEDIATRICS': 'PAEDIATRICS',
  'PEDIATRICS': 'PAEDIATRICS',
  
  // Remove common suffixes
  '(NBEMS)': '',
  '(NBEMS-DIPLOMA)': '',
  ' - ': ' - ',
  ' / ': ' / '
};

function normalizeCourseName(courseName) {
  if (!courseName) return courseName;
  
  let normalized = courseName.trim();
  
  // Apply normalization rules
  for (const [old, new_] of Object.entries(normalizationRules)) {
    normalized = normalized.replace(new RegExp(old, 'gi'), new_);
  }
  
  // Clean up extra spaces and punctuation
  normalized = normalized
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s*\/\s*/g, ' / ')
    .trim();
  
  return normalized;
}

function normalizeCourses() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to database');
    });

    // Get all courses
    db.all("SELECT id, name FROM programs", (err, rows) => {
      if (err) {
        console.error('Error fetching courses:', err);
        reject(err);
        return;
      }

      console.log(`📊 Found ${rows.length} courses to normalize`);
      
      let updated = 0;
      let errors = 0;
      
      // Process each course
      rows.forEach((row, index) => {
        const originalName = row.name;
        const normalizedName = normalizeCourseName(originalName);
        
        if (originalName !== normalizedName) {
          // Update the course name
          db.run(
            "UPDATE programs SET name = ? WHERE id = ?",
            [normalizedName, row.id],
            function(err) {
              if (err) {
                console.error(`❌ Error updating course ${row.id}:`, err);
                errors++;
              } else {
                console.log(`✅ Updated: "${originalName}" → "${normalizedName}"`);
                updated++;
              }
              
              // Check if this is the last update
              if (index === rows.length - 1) {
                console.log(`\n🎯 Normalization Complete:`);
                console.log(`   ✅ Updated: ${updated} courses`);
                console.log(`   ❌ Errors: ${errors} courses`);
                console.log(`   📊 Total: ${rows.length} courses`);
                
                db.close((err) => {
                  if (err) {
                    console.error('Error closing database:', err);
                    reject(err);
                  } else {
                    console.log('✅ Database connection closed');
                    resolve({ updated, errors, total: rows.length });
                  }
                });
              }
            }
          );
        } else {
          // No change needed
          if (index === rows.length - 1) {
            console.log(`\n🎯 Normalization Complete:`);
            console.log(`   ✅ Updated: ${updated} courses`);
            console.log(`   ❌ Errors: ${errors} courses`);
            console.log(`   📊 Total: ${rows.length} courses`);
            
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err);
                reject(err);
              } else {
                console.log('✅ Database connection closed');
                resolve({ updated, errors, total: rows.length });
              }
            });
          }
        }
      });
    });
  });
}

// Run the normalization
if (require.main === module) {
  console.log('🚀 Starting Course Name Normalization...');
  console.log('📋 This will standardize course names to fix redundancy issues');
  console.log('⏱️  Estimated time: 1-2 minutes\n');
  
  normalizeCourses()
    .then((result) => {
      console.log('\n🎉 Course normalization completed successfully!');
      console.log('🔄 Please restart your backend server to see changes');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Course normalization failed:', error);
      process.exit(1);
    });
}

module.exports = { normalizeCourses, normalizeCourseName };
