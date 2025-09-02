const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function cleanRebuildDatabase() {
  try {
    console.log('🚀 Starting clean database rebuild...');
    
    // Connect to all source databases
    const medicalDb = await open({ 
      filename: path.join(__dirname, 'database', 'medical_seats.db'), 
      driver: sqlite3.Database 
    });
    
    const dentalDb = await open({ 
      filename: path.join(__dirname, 'database', 'dental_seats.db'), 
      driver: sqlite3.Database 
    });
    
    const dnbDb = await open({ 
      filename: path.join(__dirname, 'database', 'dnb_seats.db'), 
      driver: sqlite3.Database 
    });
    
    const unifiedDb = await open({ 
      filename: path.join(__dirname, 'database', 'unified.db'), 
      driver: sqlite3.Database 
    });
    
    console.log('🔌 Connected to all databases');
    
    // Enable WAL mode and disable foreign keys temporarily
    await unifiedDb.exec('PRAGMA journal_mode = WAL;');
    await unifiedDb.exec('PRAGMA foreign_keys = OFF;');
    
    // Start transaction
    await unifiedDb.exec('BEGIN TRANSACTION;');
    
    try {
      console.log('\n🧹 Clearing existing data...');
      await unifiedDb.exec('DELETE FROM cutoffs;');
      await unifiedDb.exec('DELETE FROM programs;');
      await unifiedDb.exec('DELETE FROM colleges;');
      console.log('✅ Existing data cleared');
      
      // Step 1: Extract all unique colleges with proper deduplication
      console.log('\n🏫 Extracting and deduplicating colleges...');
      
      const allColleges = new Map(); // Use Map to deduplicate by college name
      
      // Extract from medical courses
      const medicalColleges = await medicalDb.all(`
        SELECT DISTINCT 
          college_name, city, state, management_type, establishment_year
        FROM medical_courses 
        WHERE college_name IS NOT NULL AND college_name != ''
      `);
      
      medicalColleges.forEach(college => {
        const key = college.college_name.toLowerCase().trim();
        if (!allColleges.has(key)) {
          allColleges.set(key, {
            name: college.college_name.trim(),
            city: college.city || 'Unknown',
            state: college.state || 'Unknown',
            college_type: 'MEDICAL',
            management_type: college.management_type || 'PRIVATE',
            establishment_year: college.establishment_year || null,
            source: 'medical'
          });
        }
      });
      
      console.log(`✅ Extracted ${medicalColleges.length} medical colleges`);
      
      // Extract from dental courses
      const dentalColleges = await dentalDb.all(`
        SELECT DISTINCT 
          college_name, city, state, management_type, establishment_year
        FROM dental_courses 
        WHERE college_name IS NOT NULL AND college_name != ''
      `);
      
      dentalColleges.forEach(college => {
        const key = college.college_name.toLowerCase().trim();
        if (!allColleges.has(key)) {
          allColleges.set(key, {
            name: college.college_name.trim(),
            city: college.city || 'Unknown',
            state: college.state || 'Unknown',
            college_type: 'DENTAL',
            management_type: college.management_type || 'PRIVATE',
            establishment_year: college.establishment_year || null,
            source: 'dental'
          });
        } else {
          // Update existing college with additional type
          const existing = allColleges.get(key);
          existing.college_type = 'MULTI'; // Both medical and dental
        }
      });
      
      console.log(`✅ Extracted ${dentalColleges.length} dental colleges`);
      
      // Extract from DNB courses
      const dnbColleges = await dnbDb.all(`
        SELECT DISTINCT 
          college_name, city, state, hospital_type
        FROM dnb_courses 
        WHERE college_name IS NOT NULL AND college_name != ''
      `);
      
      dnbColleges.forEach(college => {
        const key = college.college_name.toLowerCase().trim();
        if (!allColleges.has(key)) {
          allColleges.set(key, {
            name: college.college_name.trim(),
            city: college.city || 'Unknown',
            state: college.state || 'Unknown',
            college_type: 'DNB',
            management_type: college.hospital_type || 'PRIVATE',
            establishment_year: null,
            source: 'dnb'
          });
        } else {
          // Update existing college with additional type
          const existing = allColleges.get(key);
          if (existing.college_type === 'MULTI') {
            existing.college_type = 'MULTI+DNB';
          } else {
            existing.college_type = existing.college_type + '+DNB';
          }
        }
      });
      
      console.log(`✅ Extracted ${dnbColleges.length} DNB colleges`);
      
      console.log(`🎯 Total unique colleges found: ${allColleges.size}`);
      
      // Step 2: Insert all colleges into unified database
      console.log('\n💾 Inserting colleges into unified database...');
      
      const collegeIdMap = new Map(); // Map from college name to new ID
      let collegeCounter = 1;
      
      for (const [key, college] of allColleges) {
        try {
          await unifiedDb.run(`
            INSERT INTO colleges (
              id, name, city, state, college_type, management_type, 
              establishment_year, university, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            collegeCounter,
            college.name,
            college.city,
            college.state,
            college.college_type,
            college.management_type,
            college.establishment_year,
            null // university
          ]);
          
          collegeIdMap.set(key, collegeCounter);
          collegeCounter++;
        } catch (error) {
          console.log(`⚠️  Error inserting college ${college.name}: ${error.message}`);
        }
      }
      
      console.log(`✅ Inserted ${collegeCounter - 1} colleges`);
      
      // Step 3: Insert all medical courses as programs
      console.log('\n📚 Inserting medical courses as programs...');
      
      let medicalProgramCount = 0;
      for (const course of medicalColleges) {
        try {
          const collegeKey = course.college_name.toLowerCase().trim();
          const newCollegeId = collegeIdMap.get(collegeKey);
          
          if (newCollegeId) {
            await unifiedDb.run(`
              INSERT INTO programs (
                college_id, name, level, course_type, duration, entrance_exam, 
                total_seats, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
              newCollegeId,
              'MBBS', // Default medical course name
              'MBBS',
              'UG',
              66, // Medical course duration in months
              'NEET',
              150 // Default seats
            ]);
            
            medicalProgramCount++;
          }
        } catch (error) {
          console.log(`⚠️  Error inserting medical course: ${error.message}`);
        }
      }
      
      console.log(`✅ Inserted ${medicalProgramCount} medical programs`);
      
      // Step 4: Insert all dental courses as programs
      console.log('\n🦷 Inserting dental courses as programs...');
      
      let dentalProgramCount = 0;
      for (const course of dentalColleges) {
        try {
          const collegeKey = course.college_name.toLowerCase().trim();
          const newCollegeId = collegeIdMap.get(collegeKey);
          
          if (newCollegeId) {
            await unifiedDb.run(`
              INSERT INTO programs (
                college_id, name, level, course_type, duration, entrance_exam, 
                total_seats, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
              newCollegeId,
              'BDS', // Default dental course name
              'BDS',
              'UG',
              60, // Dental course duration in months
              'NEET',
              100 // Default seats
            ]);
            
            dentalProgramCount++;
          }
        } catch (error) {
          console.log(`⚠️  Error inserting dental course: ${error.message}`);
        }
      }
      
      console.log(`✅ Inserted ${dentalProgramCount} dental programs`);
      
      // Step 5: Insert all DNB courses as programs
      console.log('\n🏥 Inserting DNB courses as programs...');
      
      let dnbProgramCount = 0;
      for (const course of dnbColleges) {
        try {
          const collegeKey = course.college_name.toLowerCase().trim();
          const newCollegeId = collegeIdMap.get(collegeKey);
          
          if (newCollegeId) {
            await unifiedDb.run(`
              INSERT INTO programs (
                college_id, name, level, course_type, duration, entrance_exam, 
                total_seats, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
              newCollegeId,
              'DNB', // Default DNB course name
              'DNB',
              'PG',
              36, // DNB course duration in months
              'NEET-PG',
              50 // Default seats
            ]);
            
            dnbProgramCount++;
          }
        } catch (error) {
          console.log(`⚠️  Error inserting DNB course: ${error.message}`);
        }
      }
      
      console.log(`✅ Inserted ${dnbProgramCount} DNB programs`);
      
      // Step 6: Add sample cutoffs for testing
      console.log('\n📊 Adding sample cutoffs for testing...');
      
      const allPrograms = await unifiedDb.all('SELECT id, college_id FROM programs');
      
      for (const program of allPrograms) {
        const quotas = ['GENERAL', 'OBC', 'SC', 'ST'];
        const categories = ['GENERAL', 'OBC', 'SC', 'ST'];
        
        for (const quota of quotas) {
          for (const category of categories) {
            const openingRank = Math.floor(Math.random() * 50000) + 1000;
            const closingRank = openingRank + Math.floor(Math.random() * 10000) + 1000;
            
            await unifiedDb.run(`
              INSERT INTO cutoffs (
                college_id, program_id, year, round, authority, quota, category,
                opening_rank, closing_rank, seats_available, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
              program.college_id,
              program.id,
              2024,
              'r1',
              'NEET',
              quota,
              category,
              openingRank,
              closingRank,
              Math.floor(Math.random() * 20) + 5
            ]);
          }
        }
      }
      
      console.log('✅ Sample cutoffs added');
      
      // Re-enable foreign keys
      await unifiedDb.exec('PRAGMA foreign_keys = ON;');
      
      // Commit transaction
      await unifiedDb.exec('COMMIT;');
      console.log('💾 Transaction committed successfully');
      
    } catch (error) {
      // Rollback on error
      await unifiedDb.exec('ROLLBACK;');
      throw error;
    }
    
    // Close all connections
    await medicalDb.close();
    await dentalDb.close();
    await dnbDb.close();
    await unifiedDb.close();
    
    console.log('🎉 Database rebuild completed successfully!');
    
    // Verify migration
    console.log('\n📋 Rebuild Summary:');
    const verifyDb = await open({ 
      filename: path.join(__dirname, 'database', 'unified.db'), 
      driver: sqlite3.Database 
    });
    
    const collegeCount = await verifyDb.get('SELECT COUNT(*) as count FROM colleges');
    const programCount = await verifyDb.get('SELECT COUNT(*) as count FROM programs');
    const cutoffCount = await verifyDb.get('SELECT COUNT(*) as count FROM cutoffs');
    
    console.log(`🏫 Colleges: ${collegeCount.count}`);
    console.log(`📚 Programs: ${programCount.count}`);
    console.log(`📊 Cutoffs: ${cutoffCount.count}`);
    
    await verifyDb.close();
    
  } catch (error) {
    console.error('❌ Database rebuild failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanRebuildDatabase();
}

module.exports = { cleanRebuildDatabase };
