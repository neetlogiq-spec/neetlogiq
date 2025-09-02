const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const logger = require('../utils/logger');
class DatabaseManager {
  constructor() {
    this.connections = {};
    this.dbPath = path.join(__dirname, '..', 'database');
    this.dbFiles = [
      'clean-unified.db', // Primary database with 2401 colleges and 16830 programs
      'staging_cutoffs.db', // Staging database for cutoff imports
      'error_corrections.db' // Error correction dictionary
    ];
  }
  async initialize() {
    logger.info('Initializing DatabaseManager...');
    for (const dbFile of this.dbFiles) {
      const fullPath = path.join(this.dbPath, dbFile);
      try {
        const db = await open({ filename: fullPath, driver: sqlite3.Database });
        await db.exec('PRAGMA journal_mode = WAL;');
        this.connections[dbFile] = db;
        logger.info(`Successfully connected to ${dbFile}`);
      } catch (error) {
        if (error.code === 'SQLITE_CANTOPEN') {
          logger.warn(`Database file ${dbFile} not found. Creating it now.`);
          const db = await open({ filename: fullPath, driver: sqlite3.Database });
          await db.exec('PRAGMA journal_mode = WAL;');
          this.connections[dbFile] = db;
          logger.info(`Successfully created and connected to ${dbFile}`);
        } else {
          logger.error(`Failed to connect to database: ${dbFile}`, error);
          throw error;
        }
      }
    }
  }
  getDatabase(dbName) {
    if (!this.connections[dbName]) throw new Error(`DB connection not found for: ${dbName}`);
    return this.connections[dbName];
  }
  isConnected() { return Object.keys(this.connections).length > 0; }
}
module.exports = new DatabaseManager();
