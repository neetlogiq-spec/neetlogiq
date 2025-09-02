const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbPath = path.join(__dirname, 'database', 'clean-unified.db');
const db = new sqlite3.Database(dbPath);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'working-simple-server.js',
    port: PORT,
    message: 'Basic synchronized filtering enabled for Stream, State, College Type'
  });
});

// Get colleges with synchronized filtering
app.get('/api/colleges', (req, res) => {
  const { page = 1, limit = 20, stream, state, college_type, search } = req.query;
  const offset = (page - 1) * limit;
  
  let whereClause = 'WHERE 1=1';
  let params = [];
  
  if (search) {
    whereClause += ' AND (c.name LIKE ? OR c.city LIKE ? OR c.state LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (state) {
    whereClause += ' AND c.state = ?';
    params.push(state);
  }
  
  if (college_type) {
    whereClause += ' AND c.college_type = ?';
    params.push(college_type);
  }
  
  // Add synchronized filter for stream
  if (stream) {
    whereClause = whereClause.replace('WHERE 1=1', 'WHERE 1=1 AND c.id IN (SELECT DISTINCT college_id FROM programs p WHERE p.course_type = ?)');
    params.push(stream);
  }
  
  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as count FROM colleges c ${whereClause}`;
  
  db.get(countQuery, params, (err, totalResult) => {
    if (err) {
      console.error('Error getting count:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const totalColleges = totalResult.count;
    
    // Get colleges with basic information
    const collegesQuery = `
      SELECT c.id, c.name, c.city, c.state, c.management_type, c.establishment_year, 
             c.university, c.college_type
      FROM colleges c
      ${whereClause}
      ORDER BY c.name
      LIMIT ? OFFSET ?
    `;
    
    db.all(collegesQuery, [...params, limit, offset], (err, colleges) => {
      if (err) {
        console.error('Error getting colleges:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Enhance colleges with program and seat data
      Promise.all(colleges.map(async (college) => {
        try {
          const programData = await new Promise((resolve, reject) => {
            const query = `
              SELECT 
                COUNT(DISTINCT name) as total_programs,
                SUM(total_seats) as total_seats
              FROM programs 
              WHERE college_id = ?
            `;
            db.get(query, [college.id], (err, result) => {
              if (err) reject(err);
              else resolve(result || { total_programs: 0, total_seats: 0 });
            });
          });
          
          return {
            ...college,
            total_programs: programData.total_programs,
            total_seats: programData.total_seats
          };
        } catch (error) {
          return {
            ...college,
            total_programs: 0,
            total_seats: 0
          };
        }
      })).then(enhancedColleges => {
        res.json({
          data: enhancedColleges,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalColleges / limit),
            totalItems: totalColleges,
            hasNext: page < Math.ceil(totalColleges / limit),
            hasPrev: page > 1
          },
          filters: {
            applied: { stream, state, college_type, search },
            available: {} // Will be populated by filters endpoint
          }
        });
      });
    });
  });
});

// Get available filter options with synchronization
app.get('/api/colleges/filters', (req, res) => {
  const { stream, state, college_type } = req.query;
  
  // Base queries
  let statesQuery = 'SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL';
  let collegeTypesQuery = 'SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL';
  let streamsQuery = 'SELECT DISTINCT course_type as stream FROM programs WHERE course_type IS NOT NULL';
  
  let params = [];
  
  // Apply synchronized filtering
  if (stream) {
    // Filter states and college types based on selected stream
    const collegeIdsQuery = 'SELECT DISTINCT college_id FROM programs WHERE course_type = ?';
    db.all(collegeIdsQuery, [stream], (err, collegeIds) => {
      if (err) {
        console.error('Error getting college IDs:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const collegeIdList = collegeIds.map(c => c.college_id);
      
      if (collegeIdList.length > 0) {
        // Get filtered states and college types
        const filteredStatesQuery = `SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL AND id IN (${collegeIdList.map(() => '?').join(',')}) ORDER BY state`;
        const filteredCollegeTypesQuery = `SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL AND id IN (${collegeIdList.map(() => '?').join(',')}) ORDER BY college_type`;
        
        Promise.all([
          db.all(filteredStatesQuery, collegeIdList),
          db.all(filteredCollegeTypesQuery, collegeIdList),
          db.all(streamsQuery + ' ORDER BY course_type', [])
        ]).then(([states, collegeTypes, streams]) => {
          res.json({
            states: states.map(s => s.state),
            collegeTypes: collegeTypes.map(c => c.college_type),
            streams: streams.map(s => s.stream)
          });
        });
      } else {
        res.json({
          states: [],
          collegeTypes: [],
          streams: streams.map(s => s.stream)
        });
      }
    });
  } else if (state || college_type) {
    // Filter streams based on selected state or college type
    let whereClause = 'WHERE 1=1';
    if (state) {
      whereClause += ' AND state = ?';
      params.push(state);
    }
    if (college_type) {
      whereClause += ' AND college_type = ?';
      params.push(college_type);
    }
    
    const filteredCollegesQuery = `SELECT id FROM colleges ${whereClause}`;
    
    db.all(filteredCollegesQuery, params, (err, colleges) => {
      if (err) {
        console.error('Error getting filtered colleges:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const collegeIdList = colleges.map(c => c.id);
      
      if (collegeIdList.length > 0) {
        const filteredStreamsQuery = `SELECT DISTINCT course_type as stream FROM programs WHERE college_id IN (${collegeIdList.map(() => '?').join(',')}) ORDER BY course_type`;
        
        Promise.all([
          db.all(statesQuery + ' ORDER BY state', []),
          db.all(collegeTypesQuery + ' ORDER BY college_type', []),
          db.all(filteredStreamsQuery, collegeIdList)
        ]).then(([states, collegeTypes, streams]) => {
          res.json({
            states: states.map(s => s.state),
            collegeTypes: collegeTypes.map(c => c.college_type),
            streams: streams.map(s => s.stream)
          });
        });
      } else {
        res.json({
          states: [],
          collegeTypes: [],
          streams: []
        });
      }
    });
  } else {
    // No filters applied, return all options
    Promise.all([
      db.all(statesQuery + ' ORDER BY state', []),
      db.all(collegeTypesQuery + ' ORDER BY college_type', []),
      db.all(streamsQuery + ' ORDER BY course_type', [])
    ]).then(([states, collegeTypes, streams]) => {
      res.json({
        states: states.map(s => s.state),
        collegeTypes: collegeTypes.map(c => c.college_type),
        streams: streams.map(s => s.stream)
      });
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeetLogIQ Working Simple Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Colleges API: http://localhost:${PORT}/api/colleges`);
  console.log(`🔗 Filters API: http://localhost:${PORT}/api/colleges/filters`);
  console.log(`✅ Basic synchronized filtering enabled for Stream, State, College Type!`);
});
