const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = 4001;

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: 'http://localhost:4001',
  credentials: true
}));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    message: 'Working Complete Server is running'
  });
});

// Simple test endpoint
app.get('/api/test', checkAdminAuth, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication working',
    user: req.adminUser
  });
});

// Mock data endpoints (temporarily replacing database calls)
app.get('/api/sector_xp_12/colleges', checkAdminAuth, (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Test College 1', type: 'Government', location: 'Test City', state: 'Test State' },
      { id: 2, name: 'Test College 2', type: 'Private', location: 'Test City 2', state: 'Test State 2' }
    ],
    total: 2,
    message: 'Mock colleges data (database temporarily disabled)'
  });
});

app.get('/api/sector_xp_12/programs', checkAdminAuth, (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'MBBS', type: 'Medical', specialization: 'General Medicine', seats: 100 },
      { id: 2, name: 'BDS', type: 'Dental', specialization: 'General Dentistry', seats: 50 }
    ],
    total: 2,
    message: 'Mock programs data (database temporarily disabled)'
  });
});

// Start server
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Working Complete Server running on port ${PORT}`);
  console.log(`🔗 Health: http://127.0.0.1:${PORT}/api/health`);
  console.log(`🔗 Test: http://127.0.0.1:${PORT}/api/test`);
  console.log(`🔗 Colleges: http://127.0.0.1:${PORT}/api/sector_xp_12/colleges`);
  console.log(`🔗 Programs: http://127.0.0.1:${PORT}/api/sector_xp_12/programs`);
  console.log(`🔐 Admin credentials: ${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`);
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
