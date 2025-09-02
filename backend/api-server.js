const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
const dbManager = require('./src/database/DatabaseManager');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'api-server.js',
    port: PORT
  });
});

// Import and use routes
const collegeRoutes = require('./src/routes/colleges');
const courseRoutes = require('./src/routes/courses');

// Use routes
app.use('/api/colleges', collegeRoutes);
app.use('/api/courses', courseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeetLogIQ API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Colleges API: http://localhost:${PORT}/api/colleges`);
  console.log(`🔗 Courses API: http://localhost:${PORT}/api/courses`);
});
