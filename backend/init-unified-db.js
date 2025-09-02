const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function initUnifiedDatabase() {
  try {
    const dbPath = path.join(__dirname, 'database', 'unified.db');
    const schemaPath = path.join(__dirname, 'database', 'unified_schema.sql');
    
    console.log('🔧 Initializing unified database...');
    console.log(`Database path: ${dbPath}`);
    console.log(`Schema path: ${schemaPath}`);
    
    // Check if schema file exists
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    // Read schema
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📖 Schema file loaded successfully');
    
    // Create/connect to database
    const db = await open({ 
      filename: dbPath, 
      driver: sqlite3.Database 
    });
    
    console.log('🔌 Connected to unified database');
    
    // Enable WAL mode
    await db.exec('PRAGMA journal_mode = WAL;');
    console.log('📝 WAL mode enabled');
    
    // Execute schema
    console.log('🏗️  Creating tables...');
    await db.exec(schema);
    console.log('✅ Tables created successfully');
    
    // Close database
    await db.close();
    console.log('🔒 Database connection closed');
    
    console.log('🎉 Unified database initialized successfully!');
    console.log(`📁 Database file: ${dbPath}`);
    
  } catch (error) {
    console.error('❌ Error initializing unified database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initUnifiedDatabase();
}

module.exports = { initUnifiedDatabase };
