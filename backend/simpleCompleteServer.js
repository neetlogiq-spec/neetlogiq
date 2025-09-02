const express = require('express');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = 4003;

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
    message: 'Simple Complete Server is running'
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

// Start server
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Simple Complete Server running on port ${PORT}`);
  console.log(`🔗 Health: http://127.0.0.1:${PORT}/api/health`);
  console.log(`🔗 Test: http://127.0.0.1:${PORT}/api/test`);
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
