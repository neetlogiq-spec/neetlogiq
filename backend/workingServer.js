const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4005; // New port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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

// Admin authentication endpoint
app.get('/api/sector_xp_12', checkAdminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.adminUser,
    timestamp: new Date().toISOString(),
    routes: {
      dashboard: '/sector_xp_12/admin',
      cutoffs: '/sector_xp_12/cutoffs',
      colleges: '/sector_xp_12/colleges',
      programs: '/sector_xp_12/programs',
      import: '/sector_xp_12/import-export',
      export: '/sector_xp_12/export',
      stats: '/sector_xp_12/stats',
      cutoffImport: '/sector_xp_12/cutoff-import',
      errorCorrections: '/sector_xp_12/error-corrections'
    }
  });
});

// React App Route Handler - ALL admin routes go to React
app.get('/sector_xp_12*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Root route
app.get('/', (req, res) => {
  res.redirect('http://localhost:4000/');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WORKING Server running on port ${PORT}`);
  console.log(`🔗 Admin Panel: http://localhost:${PORT}/sector_xp_12`);
  console.log(`🔗 API Auth: http://localhost:${PORT}/api/sector_xp_12`);
  console.log(`🔐 Admin credentials: ${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`);
});
