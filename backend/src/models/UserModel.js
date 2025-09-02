const dbManager = require('../database/DatabaseManager');
class UserModel {
  constructor() {
    this.db = dbManager.getDatabase('users.db');
    this.initialize();
  }
  async initialize() {
    try {
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT, googleId TEXT UNIQUE, email TEXT UNIQUE NOT NULL,
          password TEXT, name TEXT, avatarUrl TEXT, role TEXT DEFAULT 'user',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
      logger.info('User model initialized for Google OAuth.');
    } catch (error) { logger.error('Error initializing UserModel:', error); }
  }
  async findById(id) { return this.db.get('SELECT * FROM users WHERE id = ?', id); }
  async findOrCreateFromGoogle(profile) {
    const { id: googleId, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatarUrl = photos[0].value;
    let user = await this.db.get('SELECT * FROM users WHERE googleId = ? OR email = ?', googleId, email);
    if (user) {
      await this.db.run('UPDATE users SET googleId = ?, name = ?, avatarUrl = ? WHERE id = ?', googleId, displayName, avatarUrl, user.id);
      return this.findById(user.id);
    } else {
      const result = await this.db.run('INSERT INTO users (googleId, email, name, avatarUrl) VALUES (?, ?, ?, ?)', googleId, email, displayName, avatarUrl);
      return this.findById(result.lastID);
    }
  }
}
const logger = require('../utils/logger');
module.exports = new UserModel();
