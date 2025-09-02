const path = require('path');
const fs = require('fs');
const DatabaseManager = require('../database/DatabaseManager');

class DatabaseNormalizer {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupPath = path.join(this.backupDir, `backup-${this.timestamp}`);
  }

  // Create backup directory if it doesn't exist
  ensureBackupDir() {
    console.log('🔍 Debug: Backup directory path:', this.backupDir);
    if (!fs.existsSync(this.backupDir)) {
      console.log('🔍 Debug: Creating backup directory...');
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('🔍 Debug: Backup directory created');
    } else {
      console.log('🔍 Debug: Backup directory already exists');
    }
    console.log('🔍 Debug: Backup directory exists:', fs.existsSync(this.backupDir));
    
    // Also ensure the specific timestamped backup directory exists
    console.log('🔍 Debug: Timestamped backup path:', this.backupPath);
    if (!fs.existsSync(this.backupPath)) {
      console.log('🔍 Debug: Creating timestamped backup directory...');
      fs.mkdirSync(this.backupPath, { recursive: true });
      console.log('🔍 Debug: Timestamped backup directory created');
    } else {
      console.log('🔍 Debug: Timestamped backup directory already exists');
    }
    console.log('🔍 Debug: Timestamped backup directory exists:', fs.existsSync(this.backupPath));
  }

  // Create a complete backup of all databases
  async createBackup() {
    try {
      console.log('🔄 Creating database backup...');
      this.ensureBackupDir();
      
      // Initialize database connections
      await DatabaseManager.initialize();
      
      // Get list of all database files
      const dbFiles = [
        'colleges.db',
        'medical_seats.db', 
        'dental_seats.db',
        'dnb_seats.db',
        'counselling.db',
        'cutoff_ranks.db',
        'users.db'
      ];

      // Copy each database file
      for (const dbFile of dbFiles) {
        const sourcePath = path.join(process.cwd(), 'database', dbFile);
        const backupPath = path.join(this.backupPath, dbFile);
        
        console.log(`🔍 Debug: Copying ${dbFile}`);
        console.log(`🔍 Debug: Source: ${sourcePath}`);
        console.log(`🔍 Debug: Source exists: ${fs.existsSync(sourcePath)}`);
        console.log(`🔍 Debug: Dest: ${backupPath}`);
        console.log(`🔍 Debug: Backup dir exists: ${fs.existsSync(this.backupPath)}`);
        
        if (fs.existsSync(sourcePath)) {
          try {
            fs.copyFileSync(sourcePath, backupPath);
            console.log(`✅ Backed up: ${dbFile}`);
          } catch (copyError) {
            console.error(`❌ Copy failed for ${dbFile}:`, copyError);
            throw copyError;
          }
        } else {
          console.log(`⚠️  Database not found: ${dbFile}`);
        }
      }

      // Create backup info file
      const backupInfo = {
        timestamp: this.timestamp,
        originalPath: path.resolve(__dirname, '../../database'),
        backupPath: this.backupPath,
        databases: dbFiles.filter(file => 
          fs.existsSync(path.join(__dirname, '../../database', file))
        ),
        createdAt: new Date().toISOString()
      };

      fs.writeFileSync(
        path.join(this.backupPath, 'backup-info.json'), 
        JSON.stringify(backupInfo, null, 2)
      );

      console.log(`✅ Backup completed successfully at: ${this.backupPath}`);
      return true;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return false;
    }
  }

  // Convert text to uppercase (preserving numbers and special characters)
  toUpperCase(text) {
    if (typeof text !== 'string') return text;
    return text.toUpperCase();
  }

  // Normalize all text fields in the database
  async normalizeDatabase() {
    try {
      console.log('🔄 Starting database normalization...');
      
      // Initialize database connections
      await DatabaseManager.initialize();
      
      const collegesDb = DatabaseManager.getDatabase('colleges.db');
      const medicalSeatsDb = DatabaseManager.getDatabase('medical_seats.db');
      const dentalSeatsDb = DatabaseManager.getDatabase('dental_seats.db');
      const dnbSeatsDb = DatabaseManager.getDatabase('dnb_seats.db');
      const counsellingDb = DatabaseManager.getDatabase('counselling.db');
      const cutoffRanksDb = DatabaseManager.getDatabase('cutoff_ranks.db');

      let totalUpdates = 0;

      // Normalize comprehensive_colleges table
      console.log('📚 Normalizing colleges table...');
      const colleges = await collegesDb.all('SELECT * FROM comprehensive_colleges');
      
      for (const college of colleges) {
        const updates = [];
        const params = [];
        
        // Fields to normalize
        const textFields = [
          'college_name', 'college_type', 'state', 'city', 'district', 
          'address', 'website', 'email', 'phone', 'affiliation', 'accreditation'
        ];

        textFields.forEach(field => {
          if (college[field] && typeof college[field] === 'string') {
            const normalizedValue = this.toUpperCase(college[field]);
            if (normalizedValue !== college[field]) {
              updates.push(`${field} = ?`);
              params.push(normalizedValue);
            }
          }
        });

        if (updates.length > 0) {
          params.push(college.id);
          const query = `UPDATE comprehensive_colleges SET ${updates.join(', ')} WHERE id = ?`;
          await collegesDb.run(query, params);
          totalUpdates++;
        }
      }

      // Normalize comprehensive_courses table
      console.log('📖 Normalizing courses table...');
      const courses = await collegesDb.all('SELECT * FROM comprehensive_courses');
      
      for (const course of courses) {
        const updates = [];
        const params = [];
        
        // Fields to normalize
        const textFields = [
          'course_name', 'course_type', 'specialization', 'duration', 'description'
        ];

        textFields.forEach(field => {
          if (course[field] && typeof course[field] === 'string') {
            const normalizedValue = this.toUpperCase(course[field]);
            if (normalizedValue !== course[field]) {
              updates.push(`${field} = ?`);
              params.push(normalizedValue);
            }
          }
        });

        if (updates.length > 0) {
          params.push(course.id);
          const query = `UPDATE comprehensive_courses SET ${updates.join(', ')} WHERE id = ?`;
          await collegesDb.run(query, params);
          totalUpdates++;
        }
      }

      // Normalize other tables if they exist
      const otherTables = [
        { db: medicalSeatsDb, table: 'medical_seats' },
        { db: dentalSeatsDb, table: 'dental_seats' },
        { db: dnbSeatsDb, table: 'dnb_seats' },
        { db: counsellingDb, table: 'counselling_data' },
        { db: cutoffRanksDb, table: 'cutoff_ranks' }
      ];

      for (const { db, table } of otherTables) {
        try {
          console.log(`📊 Normalizing ${table} table...`);
          const rows = await db.all(`SELECT * FROM ${table} LIMIT 1`);
          if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const textColumns = columns.filter(col => 
              typeof rows[0][col] === 'string' && 
              !col.toLowerCase().includes('id') &&
              !col.toLowerCase().includes('date') &&
              !col.toLowerCase().includes('time')
            );

            if (textColumns.length > 0) {
              const allRows = await db.all(`SELECT * FROM ${table}`);
              for (const row of allRows) {
                const updates = [];
                const params = [];
                
                textColumns.forEach(col => {
                  if (row[col] && typeof row[col] === 'string') {
                    const normalizedValue = this.toUpperCase(row[col]);
                    if (normalizedValue !== row[col]) {
                      updates.push(`${col} = ?`);
                      params.push(normalizedValue);
                    }
                  }
                });

                if (updates.length > 0) {
                  params.push(row.id || row.rowid);
                  const query = `UPDATE ${table} SET ${updates.join(', ')} WHERE ${row.id ? 'id' : 'rowid'} = ?`;
                  await db.run(query, params);
                  totalUpdates++;
                }
              }
            }
          }
        } catch (error) {
          console.log(`⚠️  Table ${table} not found or error: ${error.message}`);
        }
      }

      console.log(`✅ Database normalization completed! Total updates: ${totalUpdates}`);
      return true;
    } catch (error) {
      console.error('❌ Database normalization failed:', error);
      return false;
    }
  }

  // Revert database to backup
  async revertToBackup() {
    try {
      console.log('🔄 Reverting database to backup...');
      
      if (!fs.existsSync(this.backupPath)) {
        throw new Error('Backup not found. Cannot revert.');
      }

      // Get list of backed up databases
      const backupInfoPath = path.join(this.backupPath, 'backup-info.json');
      if (!fs.existsSync(backupInfoPath)) {
        throw new Error('Backup info not found. Cannot revert.');
      }

      const backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'));
      const databaseDir = path.join(process.cwd(), 'database');

      // Restore each database file
      for (const dbFile of backupInfo.databases) {
        const backupPath = path.join(this.backupPath, dbFile);
        const restorePath = path.join(databaseDir, dbFile);
        
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, restorePath);
          console.log(`✅ Restored: ${dbFile}`);
        }
      }

      console.log('✅ Database reverted successfully!');
      return true;
    } catch (error) {
      console.error('❌ Revert failed:', error);
      return false;
    }
  }

  // Get backup information
  getBackupInfo() {
    const backupInfoPath = path.join(this.backupPath, 'backup-info.json');
    if (fs.existsSync(backupInfoPath)) {
      return JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'));
    }
    return null;
  }

  // List all available backups
  listBackups() {
    if (!fs.existsSync(this.backupDir)) return [];
    
    const backups = fs.readdirSync(this.backupDir)
      .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
      .map(backup => {
        const infoPath = path.join(this.backupDir, backup, 'backup-info.json');
        if (fs.existsSync(infoPath)) {
          try {
            return JSON.parse(fs.readFileSync(infoPath, 'utf8'));
          } catch (error) {
            return { name: backup, error: 'Invalid backup info' };
          }
        }
        return { name: backup, error: 'No backup info found' };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return backups;
  }
}

module.exports = DatabaseNormalizer;
