const CutoffCsvParser = require('../utils/cutoffCsvParser');
const DatabaseManager = require('../database/DatabaseManager');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class CutoffController {
  constructor() {
    this.csvParser = new CutoffCsvParser();
    this.setupMulter();
  }

  setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cutoff-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.upload = multer({
      storage: storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    });
  }

  /**
   * Get all cutoffs with filtering and pagination
   */
  async getCutoffs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        year,
        authority,
        quota,
        category,
        round,
        college_id,
        program_id,
        state,
        city
      } = req.query;

      const offset = (page - 1) * limit;
      const db = DatabaseManager.getDatabase('unified.db');

      // Build WHERE clause
      let whereConditions = ['1=1'];
      let params = [];

      if (year) {
        whereConditions.push('c.year = ?');
        params.push(year);
      }
      if (authority) {
        whereConditions.push('c.authority = ?');
        params.push(authority);
      }
      if (quota) {
        whereConditions.push('c.quota = ?');
        params.push(quota);
      }
      if (category) {
        whereConditions.push('c.category = ?');
        params.push(category);
      }
      if (round) {
        whereConditions.push('c.round = ?');
        params.push(round);
      }
      if (college_id) {
        whereConditions.push('c.college_id = ?');
        params.push(college_id);
      }
      if (program_id) {
        whereConditions.push('c.program_id = ?');
        params.push(program_id);
      }
      if (state) {
        whereConditions.push('col.state = ?');
        params.push(state);
      }
      if (city) {
        whereConditions.push('col.city = ?');
        params.push(city);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM cutoffs c
        JOIN colleges col ON c.college_id = col.id
        JOIN programs p ON c.program_id = p.id
        WHERE ${whereClause}
      `;
      
      const countResult = await db.get(countQuery, params);
      const total = countResult.total;

      // Get cutoffs with pagination
      const query = `
        SELECT 
          c.*,
          col.name as college_name,
          col.city as college_city,
          col.state as college_state,
          p.name as program_name,
          p.level as program_level,
          p.course_type as program_type
        FROM cutoffs c
        JOIN colleges col ON c.college_id = col.id
        JOIN programs p ON c.program_id = p.id
        WHERE ${whereClause}
        ORDER BY c.year DESC, c.round ASC, col.name ASC
        LIMIT ? OFFSET ?
      `;

      const cutoffs = await db.all(query, [...params, limit, offset]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        success: true,
        data: cutoffs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext,
          hasPrev
        }
      });

    } catch (error) {
      logger.error('Error fetching cutoffs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cutoffs',
        details: error.message
      });
    }
  }

  /**
   * Get cutoff by ID
   */
  async getCutoffById(req, res) {
    try {
      const { id } = req.params;
      const db = DatabaseManager.getDatabase('unified.db');

      const query = `
        SELECT 
          c.*,
          col.name as college_name,
          col.city as college_city,
          col.state as college_state,
          p.name as program_name,
          p.level as program_level
        FROM cutoffs c
        JOIN colleges col ON c.college_id = col.id
        JOIN programs p ON c.program_id = p.id
        WHERE c.id = ?
      `;

      const cutoff = await db.get(query, [id]);

      if (!cutoff) {
        return res.status(404).json({
          success: false,
          error: 'Cutoff not found'
        });
      }

      res.json({
        success: true,
        data: cutoff
      });

    } catch (error) {
      logger.error('Error fetching cutoff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cutoff',
        details: error.message
      });
    }
  }

  /**
   * Create new cutoff
   */
  async createCutoff(req, res) {
    try {
      const cutoffData = req.body;
      const db = DatabaseManager.getDatabase('unified.db');

      // Validate required fields
      const requiredFields = ['college_id', 'program_id', 'year', 'round', 'authority', 'quota', 'category'];
      for (const field of requiredFields) {
        if (!cutoffData[field]) {
          return res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`
          });
        }
      }

      // Check if college and program exist
      const college = await db.get('SELECT id FROM colleges WHERE id = ?', [cutoffData.college_id]);
      const program = await db.get('SELECT id FROM programs WHERE id = ?', [cutoffData.program_id]);

      if (!college) {
        return res.status(400).json({
          success: false,
          error: 'College not found'
        });
      }

      if (!program) {
        return res.status(400).json({
          success: false,
          error: 'Program not found'
        });
      }

      // Insert cutoff
      const query = `
        INSERT INTO cutoffs (
          college_id, program_id, year, round, round_name, authority, quota, category,
          opening_rank, closing_rank, opening_score, closing_score, score_type, score_unit,
          seats_available, seats_filled, seat_type, source_url, confidence_score, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        cutoffData.college_id,
        cutoffData.program_id,
        cutoffData.year,
        cutoffData.round,
        cutoffData.round_name || this.getRoundName(cutoffData.round),
        cutoffData.authority,
        cutoffData.quota,
        cutoffData.category,
        cutoffData.opening_rank || null,
        cutoffData.closing_rank || null,
        cutoffData.opening_score || null,
        cutoffData.closing_score || null,
        cutoffData.score_type || 'rank',
        cutoffData.score_unit || 'rank',
        cutoffData.seats_available || 0,
        cutoffData.seats_filled || 0,
        cutoffData.seat_type || null,
        cutoffData.source_url || null,
        cutoffData.confidence_score || 1.0,
        cutoffData.notes || null,
        cutoffData.status || 'active'
      ];

      const result = await db.run(query, params);
      const newCutoffId = result.lastID;

      // Get the created cutoff
      const newCutoff = await db.get('SELECT * FROM cutoffs WHERE id = ?', [newCutoffId]);

      // Log audit
      await this.logAudit(db, 'cutoffs', newCutoffId, 'create', null, JSON.stringify(newCutoff), req.user?.id);

      res.status(201).json({
        success: true,
        data: newCutoff,
        message: 'Cutoff created successfully'
      });

    } catch (error) {
      logger.error('Error creating cutoff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create cutoff',
        details: error.message
      });
    }
  }

  /**
   * Update cutoff
   */
  async updateCutoff(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const db = DatabaseManager.getDatabase('unified.db');

      // Get existing cutoff
      const existingCutoff = await db.get('SELECT * FROM cutoffs WHERE id = ?', [id]);
      if (!existingCutoff) {
        return res.status(404).json({
          success: false,
          error: 'Cutoff not found'
        });
      }

      // Build update query dynamically
      const updateFields = [];
      const params = [];
      const allowedFields = [
        'round', 'round_name', 'authority', 'quota', 'category',
        'opening_rank', 'closing_rank', 'opening_score', 'closing_score',
        'score_type', 'score_unit', 'seats_available', 'seats_filled',
        'seat_type', 'source_url', 'confidence_score', 'notes', 'status'
      ];

      for (const field of allowedFields) {
        if (updateData.hasOwnProperty(field)) {
          updateFields.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update'
        });
      }

      // Add ID to params
      params.push(id);

      const query = `UPDATE cutoffs SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      await db.run(query, params);

      // Get updated cutoff
      const updatedCutoff = await db.get('SELECT * FROM cutoffs WHERE id = ?', [id]);

      // Log audit
      await this.logAudit(db, 'cutoffs', id, 'update', JSON.stringify(existingCutoff), JSON.stringify(updatedCutoff), req.user?.id);

      res.json({
        success: true,
        data: updatedCutoff,
        message: 'Cutoff updated successfully'
      });

    } catch (error) {
      logger.error('Error updating cutoff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update cutoff',
        details: error.message
      });
    }
  }

  /**
   * Delete cutoff
   */
  async deleteCutoff(req, res) {
    try {
      const { id } = req.params;
      const db = DatabaseManager.getDatabase('unified.db');

      // Get existing cutoff for audit
      const existingCutoff = await db.get('SELECT * FROM cutoffs WHERE id = ?', [id]);
      if (!existingCutoff) {
        return res.status(404).json({
          success: false,
          error: 'Cutoff not found'
        });
      }

      // Soft delete (set status to archived)
      await db.run('UPDATE cutoffs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['archived', id]);

      // Log audit
      await this.logAudit(db, 'cutoffs', id, 'delete', JSON.stringify(existingCutoff), null, req.user?.id);

      res.json({
        success: true,
        message: 'Cutoff deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting cutoff:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete cutoff',
        details: error.message
      });
    }
  }

  /**
   * Import cutoffs from CSV
   */
  async importCutoffs(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No CSV file uploaded'
        });
      }

      const filePath = req.file.path;
      const { authority = 'KEA', year = new Date().getFullYear(), quota = 'state' } = req.body;

      logger.info(`Starting CSV import for ${authority} ${year} ${quota}`);

      // Parse CSV
      const parseResult = await this.csvParser.parseCsvFile(filePath, {
        authority,
        year: parseInt(year),
        quota
      });

      if (parseResult.errors.length > 0) {
        logger.warn(`CSV import completed with ${parseResult.errors.length} errors`);
      }

      // Process parsed data
      const importResult = await this.processImportData(parseResult.data, {
        authority,
        year: parseInt(year),
        quota
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        data: {
          parseSummary: parseResult.summary,
          importSummary: importResult.summary,
          errors: [...parseResult.errors, ...importResult.errors],
          warnings: [...parseResult.warnings, ...importResult.warnings]
        },
        message: 'CSV import completed successfully'
      });

    } catch (error) {
      logger.error('Error importing cutoffs:', error);
      
      // Clean up file if it exists
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          logger.error('Error cleaning up uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to import cutoffs',
        details: error.message
      });
    }
  }

  /**
   * Process imported data and insert into database
   */
  async processImportData(parsedData, options) {
    const { authority, year, quota } = options;
    const db = DatabaseManager.getDatabase('unified.db');
    const errors = [];
    const warnings = [];
    const summary = {
      collegesCreated: 0,
      collegesUpdated: 0,
      programsCreated: 0,
      programsUpdated: 0,
      cutoffsCreated: 0,
      cutoffsUpdated: 0
    };

    for (const item of parsedData) {
      try {
        // Process college
        let collegeId = await this.processCollege(db, item.college);
        if (collegeId) {
          summary.collegesCreated++;
        }

        // Process program
        let programId = await this.processProgram(db, item.course, collegeId);
        if (programId) {
          summary.programsCreated++;
        }

        // Process cutoffs
        for (const cutoff of item.cutoffs) {
          const cutoffId = await this.processCutoff(db, cutoff, collegeId, programId);
          if (cutoffId) {
            summary.cutoffsCreated++;
          }
        }

      } catch (error) {
        errors.push({
          item: item,
          error: error.message
        });
        logger.error('Error processing import item:', error);
      }
    }

    return { summary, errors, warnings };
  }

  /**
   * Process college data
   */
  async processCollege(db, collegeData) {
    // Check if college exists
    let college = await db.get(
      'SELECT id FROM colleges WHERE normalized_name = ? AND city = ? AND state = ?',
      [collegeData.normalized_name, collegeData.city, collegeData.state]
    );

    if (college) {
      return college.id;
    }

    // Create new college
    const query = `
      INSERT INTO colleges (
        name, normalized_name, address, city, state, 
        college_type, management_type, status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      collegeData.name,
      collegeData.normalized_name,
      collegeData.address,
      collegeData.city,
      collegeData.state,
      'MEDICAL', // Default, can be updated later
      'PRIVATE', // Default, can be updated later
      'active',
      'import'
    ]);

    return result.lastID;
  }

  /**
   * Process program data
   */
  async processProgram(db, programData, collegeId) {
    // Check if program exists
    let program = await db.get(
      'SELECT id FROM programs WHERE college_id = ? AND normalized_name = ?',
      [collegeId, programData.normalized_name]
    );

    if (program) {
      return program.id;
    }

    // Create new program
    const query = `
      INSERT INTO programs (
        college_id, name, normalized_name, course_type, level, specialization
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      collegeId,
      programData.name,
      programData.normalized_name,
      programData.type,
      programData.level,
      programData.specialization
    ]);

    return result.lastID;
  }

  /**
   * Process cutoff data
   */
  async processCutoff(db, cutoffData, collegeId, programId) {
    // Check if cutoff exists
    let cutoff = await db.get(
      'SELECT id FROM cutoffs WHERE college_id = ? AND program_id = ? AND year = ? AND round = ? AND authority = ? AND quota = ? AND category = ?',
      [collegeId, programId, cutoffData.year, cutoffData.round, cutoffData.authority, cutoffData.quota, cutoffData.category]
    );

    if (cutoff) {
      // Update existing cutoff
      await db.run(
        'UPDATE cutoffs SET opening_rank = ?, closing_rank = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [cutoffData.opening_rank, cutoffData.closing_rank, cutoff.id]
      );
      return cutoff.id;
    }

    // Create new cutoff
    const query = `
      INSERT INTO cutoffs (
        college_id, program_id, year, round, round_name, authority, quota, category,
        opening_rank, closing_rank, score_type, score_unit, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      collegeId,
      programId,
      cutoffData.year,
      cutoffData.round,
      cutoffData.round_name,
      cutoffData.authority,
      cutoffData.quota,
      cutoffData.category,
      cutoffData.opening_rank,
      cutoffData.closing_rank,
      cutoffData.score_type,
      cutoffData.score_unit,
      'active'
    ]);

    return result.lastID;
  }

  /**
   * Export cutoffs to CSV
   */
  async exportCutoffs(req, res) {
    try {
      const { year, authority, quota, format = 'csv' } = req.query;
      const db = DatabaseManager.getDatabase('unified.db');

      // Build WHERE clause
      let whereConditions = ['c.status = "active"'];
      let params = [];

      if (year) {
        whereConditions.push('c.year = ?');
        params.push(year);
      }
      if (authority) {
        whereConditions.push('c.authority = ?');
        params.push(authority);
      }
      if (quota) {
        whereConditions.push('c.quota = ?');
        params.push(quota);
      }

      const whereClause = whereConditions.join(' AND ');

      const query = `
        SELECT 
          c.*,
          col.name as college_name,
          col.city as college_city,
          col.state as college_state,
          p.name as program_name
        FROM cutoffs c
        JOIN colleges col ON c.college_id = col.id
        JOIN programs p ON c.program_id = p.id
        WHERE ${whereClause}
        ORDER BY c.year DESC, c.round ASC, col.name ASC, p.name ASC
      `;

      const cutoffs = await db.all(query, params);

      if (format === 'json') {
        res.json({
          success: true,
          data: cutoffs
        });
      } else {
        // Generate CSV
        const csvContent = this.generateCsv(cutoffs);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="cutoffs-${year || 'all'}-${authority || 'all'}-${quota || 'all'}.csv"`);
        res.send(csvContent);
      }

    } catch (error) {
      logger.error('Error exporting cutoffs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export cutoffs',
        details: error.message
      });
    }
  }

  /**
   * Generate CSV content
   */
  generateCsv(cutoffs) {
    const headers = [
      'Year', 'Round', 'Authority', 'Quota', 'College Name', 'City', 'State',
      'Program', 'Category', 'Opening Rank', 'Closing Rank', 'Seats Available'
    ];

    const rows = cutoffs.map(cutoff => [
      cutoff.year,
      cutoff.round,
      cutoff.authority,
      cutoff.quota,
      cutoff.college_name,
      cutoff.college_city,
      cutoff.college_state,
      cutoff.program_name,
      cutoff.category,
      cutoff.opening_rank,
      cutoff.closing_rank,
      cutoff.seats_available
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');
  }

  /**
   * Get round name
   */
  getRoundName(roundCode) {
    const roundNames = {
      'r1': 'Round 1',
      'r2': 'Round 2',
      'r3': 'Round 3',
      'r4': 'Round 4',
      'r5': 'Round 5',
      'r6': 'Round 6',
      'r7': 'Round 7',
      'r8': 'Round 8'
    };
    return roundNames[roundCode] || `Round ${roundCode}`;
  }

  /**
   * Log audit trail
   */
  async logAudit(db, entityType, entityId, action, oldValue, newValue, userId) {
    try {
      const query = `
        INSERT INTO audit_logs (
          entity_type, entity_id, action, field_name, old_value, new_value, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await db.run(query, [
        entityType,
        entityId,
        action,
        'general',
        oldValue,
        newValue,
        userId || 1 // Default to system user
      ]);
    } catch (error) {
      logger.error('Error logging audit:', error);
    }
  }

  /**
   * Get import statistics
   */
  async getImportStats(req, res) {
    try {
      const db = DatabaseManager.getDatabase('unified.db');

      const stats = await db.get(`
        SELECT 
          COUNT(*) as total_cutoffs,
          COUNT(DISTINCT college_id) as total_colleges,
          COUNT(DISTINCT program_id) as total_programs,
          COUNT(DISTINCT year) as total_years,
          COUNT(DISTINCT authority) as total_authorities,
          COUNT(DISTINCT quota) as total_quotas
        FROM cutoffs 
        WHERE status = 'active'
      `);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error fetching import stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch import stats',
        details: error.message
      });
    }
  }
}

module.exports = new CutoffController();
