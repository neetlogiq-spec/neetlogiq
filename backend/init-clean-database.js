const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function initCleanDatabase() {
  try {
    console.log('🚀 Initializing clean database with new schema...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'clean-database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Create new clean database
    const dbPath = path.join(__dirname, 'database', 'clean-unified.db');
    const db = await open({ 
      filename: dbPath, 
      driver: sqlite3.Database 
    });
    
    console.log('🔌 Connected to new database');
    
    // Enable WAL mode and foreign keys
    await db.exec('PRAGMA journal_mode = WAL;');
    await db.exec('PRAGMA foreign_keys = ON;');
    
    console.log('📋 Executing schema...');
    
    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        if (statement.trim()) {
          await db.exec(statement);
        }
      } catch (error) {
        // Skip errors for statements that might already exist
        if (!error.message.includes('already exists')) {
          console.log(`⚠️  Statement execution warning: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Schema executed successfully');
    
    // Verify the database structure
    console.log('\n🔍 Verifying database structure...');
    
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📊 Tables created:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Check record counts
    const collegeTypes = await db.get('SELECT COUNT(*) as count FROM college_types');
    const managementTypes = await db.get('SELECT COUNT(*) as count FROM management_types');
    const programLevels = await db.get('SELECT COUNT(*) as count FROM program_levels');
    const entranceExams = await db.get('SELECT COUNT(*) as count FROM entrance_exams');
    const states = await db.get('SELECT COUNT(*) as count FROM states');
    
    console.log('\n📈 Initial data loaded:');
    console.log(`  - College Types: ${collegeTypes.count}`);
    console.log(`  - Management Types: ${managementTypes.count}`);
    console.log(`  - Program Levels: ${programLevels.count}`);
    console.log(`  - Entrance Exams: ${entranceExams.count}`);
    console.log(`  - States: ${states.count}`);
    
    // Test the views
    console.log('\n👀 Testing views...');
    try {
      const collegeSummary = await db.get('SELECT COUNT(*) as count FROM college_summary');
      const programSummary = await db.get('SELECT COUNT(*) as count FROM program_summary');
      console.log(`  - College Summary View: ${collegeSummary.count} records`);
      console.log(`  - Program Summary View: ${programSummary.count} records`);
    } catch (error) {
      console.log(`⚠️  Views test: ${error.message}`);
    }
    
    await db.close();
    
    console.log('\n🎉 Clean database initialized successfully!');
    console.log(`📁 Database location: ${dbPath}`);
    console.log('\n📋 Next steps:');
    console.log('  1. Provide your standardized Excel files');
    console.log('  2. I\'ll create import scripts for each data type');
    console.log('  3. Import colleges, programs, and other data');
    console.log('  4. Test the complete system');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initCleanDatabase();
}

module.exports = { initCleanDatabase };
