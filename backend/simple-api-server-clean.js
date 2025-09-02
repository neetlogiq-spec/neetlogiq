const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Import our updated controllers with synchronized filtering
const collegeRoutes = require('./src/routes/colleges');
const courseRoutes = require('./src/routes/courses');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
const dbPath = path.join(__dirname, 'database', 'clean-unified.db');
const db = new sqlite3.Database(dbPath);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'simple-api-server-clean.js',
    port: PORT
  });
});

// Use the imported routes with synchronized filtering
app.use('/api/colleges', collegeRoutes);
app.use('/api/courses', courseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeetLogIQ Simple API Server (Clean) running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Colleges API: http://localhost:${PORT}/api/colleges`);
  console.log(`🔗 Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`✅ Synchronized filtering enabled!`);
});
