const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, 'database', 'clean-unified.db');
const db = new sqlite3.Database(dbPath);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'simple-working-server.js',
    port: PORT,
    message: 'Basic synchronized filtering for Stream, State, College Type'
  });
});

// Get colleges with simple filtering
app.get('/api/colleges', (req, res) => {
  const { page = 1, limit = 20, stream, state, college_type } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM colleges WHERE 1=1';
  let params = [];
  
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  
  if (college_type) {
    query += ' AND college_type = ?';
    params.push(college_type);
  }
  
  if (stream) {
    query += ' AND id IN (SELECT DISTINCT college_id FROM programs WHERE course_type = ?)';
    params.push(stream);
  }
  
  query += ' ORDER BY name LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(query, params, (err, colleges) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({
      data: colleges,
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });
  });
});

// Get filter options with basic synchronization
app.get('/api/colleges/filters', (req, res) => {
  const { stream, state, college_type } = req.query;
  
  // Get all streams
  db.all('SELECT DISTINCT course_type as stream FROM programs WHERE course_type IS NOT NULL ORDER BY course_type', [], (err, streams) => {
    if (err) {
      console.error('Error getting streams:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get all states
    db.all('SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL ORDER BY state', [], (err, states) => {
      if (err) {
        console.error('Error getting states:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get all college types
      db.all('SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL ORDER BY college_type', [], (err, collegeTypes) => {
        if (err) {
          console.error('Error getting college types:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Basic synchronization logic
        let filteredStates = states;
        let filteredCollegeTypes = collegeTypes;
        let filteredStreams = streams;
        
        if (stream) {
          // If stream is selected, filter states and college types
          db.all('SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL AND id IN (SELECT DISTINCT college_id FROM programs WHERE course_type = ?) ORDER BY state', [stream], (err, filteredStatesResult) => {
            if (!err && filteredStatesResult) {
              filteredStates = filteredStatesResult;
            }
            
            db.all('SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL AND id IN (SELECT DISTINCT college_id FROM programs WHERE course_type = ?) ORDER BY college_type', [stream], (err, filteredCollegeTypesResult) => {
              if (!err && filteredCollegeTypesResult) {
                filteredCollegeTypes = filteredCollegeTypesResult;
              }
              
              res.json({
                streams: streams.map(s => s.stream),
                states: filteredStates.map(s => s.state),
                collegeTypes: filteredCollegeTypes.map(c => c.college_type)
              });
            });
          });
        } else {
          res.json({
            streams: streams.map(s => s.stream),
            states: states.map(s => s.state),
            collegeTypes: collegeTypes.map(c => c.college_type)
          });
        }
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Working Server running on port ${PORT}`);
  console.log(`✅ Basic synchronized filtering enabled!`);
});
