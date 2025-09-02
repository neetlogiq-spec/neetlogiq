const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrateToUnified() {
  try {
    console.log('🚀 Starting migration to unified database...');
    
    // Connect to source databases
    const collegesDb = await open({ 
      filename: path.join(__dirname, 'database', 'colleges.db'), 
      driver: sqlite3.Database 
    });
    
    const unifiedDb = await open({ 
      filename: path.join(__dirname, 'database', 'unified.db'), 
      driver: sqlite3.Database 
    });
    
    console.log('🔌 Connected to databases');
    
    // Enable WAL mode for better performance
    await unifiedDb.exec('PRAGMA journal_mode = WAL;');
    
    // Start transaction
    await unifiedDb.exec('BEGIN TRANSACTION;');
    
    try {
      // Migrate colleges
      console.log('🏫 Migrating colleges...');
      const colleges = await collegesDb.all('SELECT * FROM comprehensive_colleges');
      
      for (const college of colleges) {
        await unifiedDb.run(`
          INSERT INTO colleges (
            id, name, city, state, college_type, management_type, 
            establishment_year, university, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          college.id,
          college.college_name,
          college.city,
          college.state,
          college.college_type,
          college.management_type,
          college.establishment_year,
          college.university,
          college.status || 'active'
        ]);
      }
      
      console.log(`✅ Migrated ${colleges.length} colleges`);
      
      // Add some sample programs for testing
      console.log('📚 Adding sample programs...');
      const samplePrograms = [
        { name: 'MBBS', level: 'MBBS', course_type: 'UG', duration: 66, entrance_exam: 'NEET' },
        { name: 'BDS', level: 'BDS', course_type: 'UG', duration: 60, entrance_exam: 'NEET' },
        { name: 'MD General Medicine', level: 'MD', course_type: 'PG', duration: 36, entrance_exam: 'NEET-PG' },
        { name: 'MS General Surgery', level: 'MS', course_type: 'PG', duration: 36, entrance_exam: 'NEET-PG' }
      ];
      
      for (let i = 0; i < colleges.length; i++) {
        const college = colleges[i];
        for (const program of samplePrograms) {
          await unifiedDb.run(`
            INSERT INTO programs (
              college_id, name, level, course_type, duration, entrance_exam, 
              total_seats, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            college.id,
            program.name,
            program.level,
            program.course_type,
            program.duration,
            program.entrance_exam,
            Math.floor(Math.random() * 50) + 10 // Random seats between 10-60
          ]);
        }
      }
      
      console.log(`✅ Added ${samplePrograms.length * colleges.length} sample programs`);
      
      // Add some sample cutoffs for testing
      console.log('📊 Adding sample cutoffs...');
      const years = [2023, 2022, 2021];
      const quotas = ['GENERAL', 'OBC', 'SC', 'ST'];
      const categories = ['GENERAL', 'OBC', 'SC', 'ST'];
      
      for (const college of colleges) {
        const programs = await unifiedDb.all('SELECT id FROM programs WHERE college_id = ?', [college.id]);
        
        for (const program of programs) {
          for (const year of years) {
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
                  college.id,
                  program.id,
                  year,
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
        }
      }
      
      console.log('✅ Added sample cutoffs');
      
      // Commit transaction
      await unifiedDb.exec('COMMIT;');
      console.log('💾 Transaction committed successfully');
      
    } catch (error) {
      // Rollback on error
      await unifiedDb.exec('ROLLBACK;');
      throw error;
    }
    
    // Close connections
    await collegesDb.close();
    await unifiedDb.close();
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify migration
    console.log('\n📋 Migration Summary:');
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
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  migrateToUnified();
}

module.exports = { migrateToUnified };
