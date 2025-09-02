const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React app static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Database connections
const mainDb = new sqlite3.Database(path.join(__dirname, './database/unified.db'));
const stagingDb = new sqlite3.Database(path.join(__dirname, './database/staging_cutoffs.db'));
const errorDb = new sqlite3.Database(path.join(__dirname, './database/error_corrections.db'));

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

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'completeServer.js',
    port: PORT
  });
});

// Admin Authentication Endpoint
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

// API Routes
app.get('/api/colleges', (req, res) => {
    const query = req.query.search || '';
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    let sql = 'SELECT * FROM colleges';
    let params = [];
    
    if (query) {
        sql += ' WHERE name LIKE ? OR type LIKE ? OR location LIKE ?';
        params = [`%${query}%`, `%${query}%`, `%${query}%`];
    }
    
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    mainDb.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Enhanced colleges endpoint for admin
app.get('/api/sector_xp_12/colleges', checkAdminAuth, (req, res) => {
    const query = req.query.search || '';
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    // Query colleges from database
        let sql = 'SELECT * FROM colleges';
        let params = [];
        
        if (query) {
            sql += ' WHERE name LIKE ? OR type LIKE ? OR location LIKE ? OR state LIKE ?';
            params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
        }
        
        sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        mainDb.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error fetching colleges:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Get total count for pagination
            let countSql = 'SELECT COUNT(*) as total FROM colleges';
            let countParams = [];
            
            if (query) {
                countSql += ' WHERE name LIKE ? OR type LIKE ? OR location LIKE ? OR state LIKE ?';
                countParams = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
            }
            
            mainDb.get(countSql, countParams, (err, countResult) => {
                if (err) {
                    console.error('Error getting colleges count:', err);
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                res.json({
                    data: rows,
                    pagination: {
                        total: countResult.total,
                        limit,
                        offset,
                        pages: Math.ceil(countResult.total / limit)
                    }
                });
            });
        });
    });
});

// Add missing filters endpoint for colleges
app.get('/api/sector_xp_12/colleges/filters', checkAdminAuth, (req, res) => {
    try {
        // Get unique states
        mainDb.all('SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL ORDER BY state', (err, states) => {
                if (err) {
                    console.error('Error fetching states:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Get unique types
                mainDb.all('SELECT DISTINCT type FROM colleges WHERE type IS NOT NULL ORDER BY type', (err, types) => {
                    if (err) {
                        console.error('Error fetching types:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    // Get unique management types
                    mainDb.all('SELECT DISTINCT management FROM colleges WHERE management IS NOT NULL ORDER BY management', (err, management) => {
                        if (err) {
                            console.error('Error fetching management types:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        
                        res.json({
                            states: states.map(s => s.state),
                            types: types.map(t => t.type),
                            management: management.map(m => m.management)
                        });
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new college
app.post('/api/sector_xp_12/colleges', checkAdminAuth, (req, res) => {
    const { name, type, location, state, established_year, accreditation, website, phone, email } = req.body;
    
    if (!name || !type || !location) {
        return res.status(400).json({ error: 'Name, type, and location are required' });
    }
    
    const sql = `INSERT INTO colleges (name, type, location, state, established_year, accreditation, website, phone, email, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
    
    const params = [name, type, location, state, established_year, accreditation, website, phone, email];
    
    mainDb.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({
            success: true,
            message: 'College added successfully',
            id: this.lastID
        });
    });
});

// Update college
app.put('/api/sector_xp_12/colleges/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const { name, type, location, state, established_year, accreditation, website, phone, email } = req.body;
    
    const sql = `UPDATE colleges SET 
                  name = ?, type = ?, location = ?, state = ?, established_year = ?, 
                  accreditation = ?, website = ?, phone = ?, email = ?, updated_at = datetime('now')
                  WHERE id = ?`;
    
    const params = [name, type, location, state, established_year, accreditation, website, phone, email, id];
    
    mainDb.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'College not found' });
        }
        
        res.json({
            success: true,
            message: 'College updated successfully'
        });
    });
});

// Delete college
app.delete('/api/sector_xp_12/colleges/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM colleges WHERE id = ?';
    
    mainDb.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'College not found' });
        }
        
        res.json({
            success: true,
            message: 'College deleted successfully'
        });
    });
});

// Programs Management API Routes
app.get('/api/sector_xp_12/programs', checkAdminAuth, (req, res) => {
    const query = req.query.search || '';
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    // Query programs from database
        let sql = 'SELECT * FROM programs';
        let params = [];
        
        if (query) {
            sql += ' WHERE name LIKE ? OR type LIKE ? OR description LIKE ?';
            params = [`%${query}%`, `%${query}%`, `%${query}%`];
        }
        
        sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        mainDb.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error fetching programs:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Get total count for pagination
            let countSql = 'SELECT COUNT(*) as total FROM programs';
            let countParams = [];
            
            if (query) {
                countSql += ' WHERE name LIKE ? OR type LIKE ? OR description LIKE ?';
                countParams = [`%${query}%`, `%${query}%`, `%${query}%`];
            }
            
            mainDb.get(countSql, countParams, (err, countResult) => {
                if (err) {
                    console.error('Error getting programs count:', err);
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                res.json({
                    data: rows,
                    pagination: {
                        total: countResult.total,
                        limit,
                        offset,
                        pages: Math.ceil(countResult.total / limit)
                    }
                });
            });
        });
    });
});

// Add new program
app.post('/api/sector_xp_12/programs', checkAdminAuth, (req, res) => {
    const { name, type, duration, total_seats, college_id, description, eligibility, fee_structure, entrance_exam, specializations } = req.body;
    
    if (!name || !type || !duration || !total_seats || !college_id) {
        return res.status(400).json({ error: 'Name, type, duration, total_seats, and college_id are required' });
    }
    
    const sql = `INSERT INTO programs (name, type, duration, total_seats, college_id, description, eligibility, fee_structure, entrance_exam, specializations, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
    
    const params = [name, type, duration, total_seats, college_id, description, eligibility, fee_structure, entrance_exam, specializations];
    
    mainDb.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({
            success: true,
            message: 'Program added successfully',
            id: this.lastID
        });
    });
});

// Update program
app.put('/api/sector_xp_12/programs/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const { name, type, duration, total_seats, college_id, description, eligibility, fee_structure, entrance_exam, specializations } = req.body;
    
    const sql = `UPDATE programs SET 
                  name = ?, type = ?, duration = ?, total_seats = ?, college_id = ?, 
                  description = ?, eligibility = ?, fee_structure = ?, entrance_exam = ?, specializations = ?, updated_at = datetime('now')
                  WHERE id = ?`;
    
    const params = [name, type, duration, total_seats, college_id, description, eligibility, fee_structure, entrance_exam, specializations, id];
    
    mainDb.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        res.json({
            success: true,
            message: 'Program updated successfully'
        });
    });
});

// Delete program
app.delete('/api/sector_xp_12/programs/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM programs WHERE id = ?';
    
    mainDb.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        res.json({
            success: true,
            message: 'Program deleted successfully'
        });
    });
});

// Cutoff Import System API Routes
app.get('/api/sector_xp_12/admin/cutoffs/stats', checkAdminAuth, (req, res) => {
    // Get cutoff import statistics
    mainDb.get('SELECT COUNT(*) as total_imports FROM cutoff_sessions', (err, importsResult) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        mainDb.get('SELECT COUNT(*) as successful_imports FROM cutoff_sessions WHERE status = "completed"', (err, successResult) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            mainDb.get('SELECT COUNT(*) as failed_imports FROM cutoff_sessions WHERE status = "failed"', (err, failedResult) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                mainDb.get('SELECT COUNT(*) as total_records FROM cutoff_records', (err, recordsResult) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    mainDb.get('SELECT created_at as last_import FROM cutoff_sessions ORDER BY created_at DESC LIMIT 1', (err, lastResult) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        
                        res.json({
                            totalImports: importsResult.total_imports || 0,
                            successfulImports: successResult.successful_imports || 0,
                            failedImports: failedResult.failed_imports || 0,
                            totalRecords: recordsResult.total_records || 0,
                            lastImport: lastResult?.last_import || null
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/sector_xp_12/admin/cutoffs/sessions', checkAdminAuth, (req, res) => {
    // Get cutoff import sessions
    mainDb.all('SELECT * FROM cutoff_sessions ORDER BY created_at DESC LIMIT 50', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({
            sessions: rows || []
        });
    });
});

app.post('/api/sector_xp_12/admin/cutoffs/upload', checkAdminAuth, (req, res) => {
    // Handle file upload (this would typically use multer middleware)
    // For now, return a mock session
    const sessionId = Date.now();
    
    res.json({
        success: true,
        message: 'Files uploaded successfully',
        session: {
            id: sessionId,
            status: 'pending',
            file_count: 1,
            created_at: new Date().toISOString()
        }
    });
});

app.post('/api/sector_xp_12/admin/cutoffs/process/:sessionId', checkAdminAuth, (req, res) => {
    const { sessionId } = req.params;
    
    // Mock processing response
    res.json({
        success: true,
        message: 'Processing completed successfully',
        processedRecords: Math.floor(Math.random() * 1000) + 100,
        sessionId: sessionId
    });
});

// User Management API Routes
app.get('/api/sector_xp_12/admin/users', checkAdminAuth, (req, res) => {
    // Get all users (mock data for now)
    const mockUsers = [
        {
            id: 1,
            username: 'Lone_wolf#12',
            full_name: 'Super Administrator',
            email: 'admin@neetlogiq.com',
            role: 'super_admin',
            department: 'IT',
            phone: '+91-9876543210',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            last_login: new Date().toISOString()
        },
        {
            id: 2,
            username: 'moderator1',
            full_name: 'John Doe',
            email: 'john@neetlogiq.com',
            role: 'moderator',
            department: 'Content',
            phone: '+91-9876543211',
            status: 'active',
            created_at: '2024-01-15T00:00:00.000Z',
            last_login: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 3,
            username: 'viewer1',
            full_name: 'Jane Smith',
            email: 'jane@neetlogiq.com',
            role: 'viewer',
            department: 'Analytics',
            phone: '+91-9876543212',
            status: 'active',
            created_at: '2024-02-01T00:00:00.000Z',
            last_login: new Date(Date.now() - 172800000).toISOString()
        }
    ];
    
    res.json({
        users: mockUsers
    });
});

app.post('/api/sector_xp_12/admin/users', checkAdminAuth, (req, res) => {
    const { username, email, full_name, role, department, phone, status } = req.body;
    
    if (!username || !email || !full_name || !role) {
        return res.status(400).json({ error: 'Username, email, full_name, and role are required' });
    }
    
    // Mock user creation
    const newUser = {
        id: Date.now(),
        username,
        email,
        full_name,
        role,
        department: department || '',
        phone: phone || '',
        status: status || 'active',
        created_at: new Date().toISOString(),
        last_login: null
    };
    
    res.json({
        success: true,
        message: 'User created successfully',
        user: newUser
    });
});

app.put('/api/sector_xp_12/admin/users/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock user update
    res.json({
        success: true,
        message: 'User updated successfully',
        userId: id
    });
});

app.delete('/api/sector_xp_12/admin/users/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    
    // Mock user deletion
    res.json({
        success: true,
        message: 'User deleted successfully',
        userId: id
    });
});

// Data Validation API Routes
app.get('/api/sector_xp_12/admin/validation/results', checkAdminAuth, (req, res) => {
    // Mock validation results
    const mockResults = [
        {
            id: 1,
            type: 'college',
            field: 'name',
            originalValue: 'AIIMS Delhi',
            suggestedValue: 'All India Institute of Medical Sciences, New Delhi',
            confidence: 95,
            status: 'validated',
            errorType: 'formatting',
            severity: 'low',
            description: 'Official name format correction'
        }
    ];
    
    res.json({
        results: mockResults
    });
});

app.post('/api/sector_xp_12/admin/validation/start', checkAdminAuth, (req, res) => {
    // Mock validation start
    res.json({
        success: true,
        message: 'Data validation started',
        validationId: Date.now()
    });
});

app.post('/api/sector_xp_12/admin/validation/correct/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const correctionData = req.body;
    
    // Mock correction application
    res.json({
        success: true,
        message: 'Correction applied successfully',
        recordId: id
    });
});

app.post('/api/sector_xp_12/admin/validation/validate/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    
    // Mock validation approval
    res.json({
        success: true,
        message: 'Record marked as valid',
        recordId: id
    });
});

// AI System API Routes
app.get('/api/sector_xp_12/admin/ai/metrics', checkAdminAuth, (req, res) => {
    // Mock AI metrics
    res.json({
        accuracy: 94.7 + Math.random() * 2,
        processingSpeed: 1250 + Math.random() * 100,
        totalProcessed: 15680 + Math.floor(Math.random() * 100),
        learningProgress: 87.3 + Math.random() * 3,
        confidenceScore: 91.2 + Math.random() * 2
    });
});

app.post('/api/sector_xp_12/admin/ai/process', checkAdminAuth, (req, res) => {
    // Mock AI processing start
    res.json({
        success: true,
        message: 'AI processing started',
        processId: Date.now()
    });
});

app.post('/api/sector_xp_12/admin/ai/train', checkAdminAuth, (req, res) => {
    // Mock ML training start
    res.json({
        success: true,
        message: 'Machine learning training started',
        trainingId: Date.now()
    });
});

// System Health API Routes
app.get('/api/sector_xp_12/admin/system/health', checkAdminAuth, (req, res) => {
    // Mock system health
    res.json({
        overall: 'healthy',
        database: 'healthy',
        api: 'healthy',
        frontend: 'healthy',
        ai: 'healthy'
    });
});

app.get('/api/sector_xp_12/admin/system/performance', checkAdminAuth, (req, res) => {
    // Mock performance metrics
    res.json({
        responseTime: 245 + Math.random() * 50,
        throughput: 1250 + Math.random() * 100,
        errorRate: 0.12 + Math.random() * 0.05,
        uptime: 99.87 + Math.random() * 0.1
    });
});

app.get('/api/colleges/:id/courses', (req, res) => {
    const collegeId = req.params.id;
    const sql = 'SELECT * FROM programs WHERE college_id = ?';
    
    mainDb.all(sql, [collegeId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Admin API Routes
app.get('/api/sector_xp_12/stats', (req, res) => {
    mainDb.get('SELECT COUNT(*) as colleges_count FROM colleges', (err, collegeResult) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        mainDb.get('SELECT COUNT(*) as programs_count FROM programs', (err, programResult) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            mainDb.get('SELECT COUNT(DISTINCT location) as states_count FROM colleges', (err, stateResult) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                // Get recent activity count
                mainDb.get('SELECT COUNT(*) as recent_activity FROM programs WHERE created_at >= datetime("now", "-7 days")', (err, activityResult) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    res.json({
                        colleges_count: collegeResult.colleges_count || 0,
                        programs_count: programResult.programs_count || 0,
                        states_count: stateResult.states_count || 0,
                        districts_count: 0,
                        recent_activity: activityResult.recent_activity || 0,
                        total_cutoffs: 0, // Will be implemented with cutoff system
                        active_users: 1
                    });
                });
            });
        });
    });
});

app.get('/api/sector_xp_12/users/count', (req, res) => {
    res.json({ count: 1 });
});

app.get('/api/sector_xp_12/recent-activity', (req, res) => {
    // Get recent colleges added
    mainDb.all('SELECT name, location, type, created_at FROM colleges ORDER BY created_at DESC LIMIT 5', (err, colleges) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Get recent programs added
        mainDb.all('SELECT name, duration, created_at FROM programs ORDER BY created_at DESC LIMIT 5', (err, programs) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const activities = [];
            
            // Add college activities
            colleges.forEach(college => {
                activities.push({
                    type: 'college_added',
                    title: `New College Added: ${college.name}`,
                    description: `${college.type} in ${college.location}`,
                    timestamp: college.created_at || new Date().toISOString(),
                    icon: '🏫'
                });
            });
            
            // Add program activities
            programs.forEach(program => {
                activities.push({
                    type: 'program_added',
                    title: `New Program: ${program.name}`,
                    description: `Duration: ${program.duration}`,
                    timestamp: program.created_at || new Date().toISOString(),
                    icon: '📚'
                });
            });
            
            // Sort by timestamp and return top 10
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            res.json(activities.slice(0, 10));
        });
    });
});

app.get('/api/sector_xp_12/import-sessions/count', (req, res) => {
    stagingDb.get('SELECT COUNT(*) as count FROM import_sessions', (err, result) => {
        if (err) {
            res.json({ count: 0 });
            return;
        }
        res.json({ count: result.count || 0 });
    });
});

// Cutoff Import API Routes
app.post('/api/sector_xp_12/admin/cutoffs/import', (req, res) => {
    res.json({ message: 'File uploaded successfully', session_id: Date.now() });
});

app.post('/api/sector_xp_12/admin/cutoffs/process', (req, res) => {
    res.json({ message: 'Data processed successfully' });
});

app.get('/api/sector_xp_12/admin/cutoffs/sessions', (req, res) => {
    res.json({ sessions: [] });
});

// Cutoff Staging API Routes
app.get('/api/sector_xp_12/admin/cutoffs/staging', checkAdminAuth, (req, res) => {
    // Mock staging data
    const mockStagingData = [
        {
            id: 1,
            college_name: 'AIIMS Delhi',
            program_name: 'MBBS',
            category: 'General',
            cutoff_score: 720,
            status: 'pending'
        },
        {
            id: 2,
            college_name: 'JIPMER Puducherry',
            program_name: 'MBBS',
            category: 'OBC',
            cutoff_score: 680,
            status: 'validated'
        }
    ];
    
    res.json({
        data: mockStagingData,
        pagination: {
            total: mockStagingData.length,
            limit: 100,
            offset: 0,
            pages: 1
        }
    });
});

app.put('/api/sector_xp_12/admin/cutoffs/staging/:id', checkAdminAuth, (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    res.json({
        success: true,
        message: 'Staging record updated successfully',
        recordId: id
    });
});

// Cutoff Stats API
app.get('/api/sector_xp_12/admin/cutoffs/stats', checkAdminAuth, (req, res) => {
    res.json({
        stats: {
            totalStaging: 25,
            validated: 18,
            pending: 5,
            errors: 2,
            accuracy: 92
        }
    });
});

// Error Corrections API Routes
app.get('/api/sector_xp_12/admin/error-corrections', checkAdminAuth, (req, res) => {
    const mockErrors = [
        {
            id: 1,
            title: 'Invalid College Name Format',
            description: 'College name contains special characters that need standardization',
            severity: 'medium',
            category: 'Data Format',
            source: 'CSV Import',
            status: 'pending',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Missing Cutoff Score',
            description: 'Cutoff score field is empty for multiple records',
            severity: 'high',
            category: 'Data Completeness',
            source: 'Excel Import',
            status: 'in_progress',
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 3,
            title: 'Duplicate Program Entry',
            description: 'Same program appears multiple times for the same college',
            severity: 'critical',
            category: 'Data Integrity',
            source: 'Database Check',
            status: 'resolved',
            created_at: new Date(Date.now() - 7200000).toISOString()
        }
    ];
    
    res.json({
        errors: mockErrors
    });
});

app.get('/api/sector_xp_12/admin/error-corrections/stats', checkAdminAuth, (req, res) => {
    res.json({
        stats: {
            totalErrors: 15,
            resolved: 8,
            pending: 5,
            critical: 2,
            accuracy: 87
        },
        corrections: [
            {
                id: 1,
                error_title: 'Invalid College Name Format',
                correction_description: 'Standardized college names using official naming conventions',
                corrected_by: 'Admin User',
                corrected_at: new Date(Date.now() - 3600000).toISOString()
            }
        ]
    });
});

// React App Route Handler - This must be LAST to catch all admin routes
app.get('/sector_xp_12*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Root route
app.get('/', (req, res) => {
    res.redirect('http://localhost:4000/');
});

app.get('/welcome', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>NeetLogIQ Backend Server</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                .status { color: green; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 NeetLogIQ Backend Server</h1>
                <p class="status">✅ Server is running successfully on port ${PORT}</p>
                <h2>Available Routes:</h2>
                <ul>
                    <li><strong>Frontend:</strong> <a href="http://localhost:4000/">http://localhost:4000/</a></li>
                    <li><strong>Admin Panel:</strong> <a href="http://localhost:${PORT}/sector_xp_12">http://localhost:${PORT}/sector_xp_12</a></li>
                    <li><strong>API Stats:</strong> <a href="http://localhost:${PORT}/api/sector_xp_12/stats">/api/sector_xp_12/stats</a></li>
                </ul>
                <p><em>Admin credentials: Lone_wolf#12:Apx_gp_delta</em></p>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Complete Working Server running on port ${PORT}`);
    console.log(`🔗 Admin login: http://localhost:${PORT}/sector_xp_12`);
    console.log(`🔗 Cutoff Import: http://localhost:${PORT}/sector_xp_12/cutoff-import`);
    console.log(`🔗 Error Corrections: http://localhost:${PORT}/sector_xp_12/error-corrections`);
    console.log(`🔐 Admin credentials: Lone_wolf#12:Apx_gp_delta`);
});
