const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Import our updated controllers
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
    server: 'simple-api-server.js',
    port: PORT
  });
});

// Use the imported routes instead of inline APIs
app.use('/api/colleges', collegeRoutes);
app.use('/api/courses', courseRoutes);

// Old Colleges API (replaced by imported routes)
// app.get('/api/colleges', (req, res) => {
  const { page = 1, limit = 20, state, city, management_type, college_type, stream, course, branch, search } = req.query;
  const offset = (page - 1) * limit;
  
  let whereClause = 'WHERE 1=1';
  let params = [];
  
  if (search) {
    whereClause += ' AND (name LIKE ? OR city LIKE ? OR state LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (state) {
    whereClause += ' AND state = ?';
    params.push(state);
  }
  
  if (city) {
    whereClause += ' AND city LIKE ?';
    params.push(city);
  }
  
  if (management_type) {
    whereClause += ' AND management_type = ?';
    params.push(management_type);
  }
  
  if (college_type) {
    whereClause += ' AND college_type = ?';
    params.push(college_type);
  }
  
  // Add synchronized filters for stream, course, branch
  if (stream || course || branch) {
    whereClause = whereClause.replace('WHERE 1=1', 'WHERE 1=1 AND c.id IN (SELECT DISTINCT college_id FROM programs p WHERE 1=1');
    
    if (stream) {
      whereClause += ' AND p.course_type = ?';
      params.push(stream);
    }
    
    if (course) {
      whereClause += ' AND p.name = ?';
      params.push(course);
    }
    
    if (branch) {
      whereClause += ' AND p.specialization = ?';
      params.push(branch);
    }
    
    whereClause += ')';
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
      const enhancedColleges = colleges.map(college => ({
        ...college,
        total_programs: 0, // Will be enhanced later
        total_seats: 0     // Will be enhanced later
      }));
      
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
          applied: { state, city, management_type, college_type, stream, course, branch, search },
          available: {} // Will be enhanced later
        }
      });
    });
  });
});

// Old filter options API (replaced by imported routes)
// app.get('/api/colleges/filters', (req, res) => {
  const queries = [
    'SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL ORDER BY state',
    'SELECT DISTINCT city FROM colleges WHERE city IS NOT NULL ORDER BY city',
    'SELECT DISTINCT management_type FROM colleges WHERE management_type IS NOT NULL ORDER BY management_type',
    'SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL ORDER BY college_type',
    'SELECT DISTINCT course_type as stream FROM programs WHERE course_type IS NOT NULL ORDER BY course_type',
    'SELECT DISTINCT name as course FROM programs WHERE name IS NOT NULL ORDER BY name',
    'SELECT DISTINCT specialization as branch FROM programs WHERE specialization IS NOT NULL ORDER BY branch'
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  )).then(([states, cities, managementTypes, collegeTypes, streams, courses, branches]) => {
    res.json({
      states: states.map(s => s.state),
      cities: cities.map(c => c.city),
      managementTypes: managementTypes.map(m => m.management_type),
      collegeTypes: collegeTypes.map(c => c.college_type),
      streams: streams.map(s => s.stream),
      courses: courses.map(c => c.course),
      branches: branches.map(b => b.branch)
    });
  }).catch(err => {
    console.error('Error getting filters:', err);
    res.status(500).json({ error: 'Database error' });
  });
// });

// Old Courses API (replaced by imported routes)
// app.get('/api/courses', (req, res) => {
  const { page = 1, limit = 20, stream, course, branch, state, college_type, level, search } = req.query;
  const offset = (page - 1) * limit;
  
  let whereClause = 'WHERE 1=1';
  let params = [];
  
  if (search) {
    whereClause += ' AND (p.name LIKE ? OR p.specialization LIKE ? OR c.name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (stream) {
    whereClause += ' AND p.course_type = ?';
    params.push(stream);
  }
  
  if (course) {
    whereClause += ' AND p.name = ?';
    params.push(course);
  }
  
  if (branch) {
    whereClause += ' AND p.specialization = ?';
    params.push(branch);
  }
  
  if (state) {
    whereClause += ' AND c.state = ?';
    params.push(state);
  }
  
  if (college_type) {
    whereClause += ' AND c.college_type = ?';
    params.push(college_type);
  }
  
  if (level) {
    whereClause += ' AND p.level = ?';
    params.push(level);
  }
  
  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as count 
    FROM programs p 
    JOIN colleges c ON p.college_id = c.id 
    ${whereClause}
  `;
  
  db.get(countQuery, params, (err, totalResult) => {
    if (err) {
      console.error('Error getting count:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const totalCourses = totalResult.count;
    
    // Get courses with college information
    const coursesQuery = `
      SELECT 
        p.id,
        p.name as course_name,
        p.level,
        p.course_type as stream,
        p.specialization as branch,
        p.duration,
        p.total_seats,
        p.entrance_exam,
        c.id as college_id,
        c.name as college_name,
        c.city,
        c.state,
        c.college_type,
        c.management_type,
        c.establishment_year
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      ${whereClause}
      ORDER BY c.name, p.name
      LIMIT ? OFFSET ?
    `;
    
    db.all(coursesQuery, [...params, limit, offset], (err, courses) => {
      if (err) {
        console.error('Error getting courses:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        data: courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCourses / limit),
          totalItems: totalCourses,
          hasNext: page < Math.ceil(totalCourses / limit),
          hasPrev: page > 1
        },
        filters: {
          applied: { stream, course, branch, state, college_type, level, search },
          available: {} // Will be enhanced later
        }
      });
    });
  });
});

// Old course filter options API (replaced by imported routes)
// app.get('/api/courses/filters', (req, res) => {
  const queries = [
    'SELECT DISTINCT course_type as stream FROM programs WHERE course_type IS NOT NULL ORDER BY course_type',
    'SELECT DISTINCT name as course FROM programs WHERE name IS NOT NULL ORDER BY name',
    'SELECT DISTINCT specialization as branch FROM programs WHERE specialization IS NOT NULL ORDER BY branch',
    'SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL ORDER BY state',
    'SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL ORDER BY college_type',
    'SELECT DISTINCT level FROM programs WHERE level IS NOT NULL ORDER BY level'
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  )).then(([streams, courses, branches, states, collegeTypes, levels]) => {
    res.json({
      streams: streams.map(s => s.stream),
      courses: courses.map(c => c.course),
      branches: branches.map(b => b.branch),
      states: states.map(s => s.state),
      collegeTypes: collegeTypes.map(c => c.college_type),
      levels: levels.map(l => l.level)
    });
  }).catch(err => {
    console.error('Error getting course filters:', err);
    res.status(500).json({ error: 'Database error' });
  });
// });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeetLogIQ Simple API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Colleges API: http://localhost:${PORT}/api/colleges`);
  console.log(`🔗 Courses API: http://localhost:${PORT}/api/courses`);
});
