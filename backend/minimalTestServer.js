const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = 4001;

// Test staging cutoffs routes directly
app.get('/api/sector_xp_12/admin/cutoffs/sessions', async (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'src', 'database', 'staging_cutoffs.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    
    const sessions = await db.all('SELECT * FROM import_sessions ORDER BY started_at DESC');
    await db.close();
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching import sessions:', error);
    res.status(500).json({ error: 'Failed to fetch import sessions', details: error.message });
  }
});

app.get('/api/sector_xp_12/admin/cutoffs/sessions/:sessionId/raw', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const dbPath = path.join(__dirname, 'src', 'database', 'staging_cutoffs.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    
    const rawData = await db.all(`
      SELECT * FROM raw_cutoffs 
      WHERE file_source = ? 
      ORDER BY row_number
    `, [sessionId]);
    
    await db.close();
    res.json(rawData);
  } catch (error) {
    console.error('Error fetching raw data:', error);
    res.status(500).json({ error: 'Failed to fetch raw data', details: error.message });
  }
});

app.get('/api/sector_xp_12/admin/cutoffs/sessions/:sessionId/processed', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const dbPath = path.join(__dirname, 'src', 'database', 'staging_cutoffs.db');
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    
    const processedData = await db.all(`
      SELECT pc.*, rc.college_institute, rc.course
      FROM processed_cutoffs pc
      JOIN raw_cutoffs rc ON pc.raw_cutoff_id = rc.id
      WHERE rc.file_source = ?
      ORDER BY pc.created_at DESC
    `, [sessionId]);
    
    await db.close();
    res.json(processedData);
  } catch (error) {
    console.error('Error fetching processed data:', error);
    res.status(500).json({ error: 'Failed to fetch processed data', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal Test Server running on port ${PORT}`);
  console.log(`🔗 Test the staging cutoffs endpoint:`);
  console.log(`   GET http://localhost:${PORT}/api/sector_xp_12/admin/cutoffs/sessions`);
});
