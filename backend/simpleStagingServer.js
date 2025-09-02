const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4001');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'Lone_wolf#12',
  password: 'Apx_gp_delta'
};

// Authentication middleware
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Access"');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Admin credentials required'
    });
  }

  try {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      req.adminUser = { username, role: 'super_admin' };
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Admin Access"');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password incorrect'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// File upload configuration
const upload = multer({ dest: '/tmp/' });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Admin root route (required for login)
app.get('/api/sector_xp_12', checkAdminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.adminUser,
    timestamp: new Date().toISOString(),
    routes: {
      dashboard: '/api/sector_xp_12/dashboard',
      cutoffs: '/api/sector_xp_12/cutoffs',
      colleges: '/api/sector_xp_12/colleges',
      programs: '/api/sector_xp_12/programs',
      import: '/api/sector_xp_12/import',
      export: '/api/sector_xp_12/export',
      stats: '/api/sector_xp_12/stats',
      cutoffImport: '/api/sector_xp_12/cutoff-import',
      errorCorrections: '/api/sector_xp_12/error-corrections'
    }
  });
});

// Staging cutoffs routes (with authentication)
app.get('/api/sector_xp_12/admin/cutoffs/sessions', checkAdminAuth, async (req, res) => {
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

app.get('/api/sector_xp_12/admin/cutoffs/sessions/:sessionId/raw', checkAdminAuth, async (req, res) => {
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

app.get('/api/sector_xp_12/admin/cutoffs/sessions/:sessionId/processed', checkAdminAuth, async (req, res) => {
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

// File upload endpoint
app.post('/api/sector_xp_12/admin/cutoffs/import', checkAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { fileType } = req.body;
    const filePath = req.file.path;

    // For now, just return success - we'll implement actual import later
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      file: req.file.originalname,
      type: fileType
    });

    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error('Error importing file:', error);
    res.status(500).json({ error: 'Failed to import file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Staging Server running on port ${PORT}`);
  console.log(`🔗 Test the staging cutoffs endpoint:`);
  console.log(`   GET http://localhost:${PORT}/api/sector_xp_12/admin/cutoffs/sessions`);
  console.log(`🔐 Admin credentials: ${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`);
});
