/**
 * ALIASES SERVICE
 * 
 * Comprehensive service for managing aliases system
 * Handles CRUD operations, automatic generation, and search integration
 */

const dbManager = require('../database/DatabaseManager');

class AliasesService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🔄 Initializing Aliases Service...');
      
      // Initialize database connection
      console.log('📊 Initializing database manager...');
      await dbManager.initialize();
      console.log('✅ Database manager initialized');
      
      console.log('🔗 Getting database connection...');
      this.db = dbManager.getDatabase('clean-unified.db');
      console.log('✅ Database connection established');
      
      // Check if aliases table exists, create if not
      console.log('📋 Ensuring aliases tables exist...');
      await this.ensureAliasesTables();
      console.log('✅ Aliases tables ready');
      
      this.isInitialized = true;
      console.log('✅ Aliases Service initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize Aliases Service:', error);
      console.error('❌ Error details:', error.stack);
      return { success: false, error: error.message };
    }
  }

  async ensureAliasesTables() {
    try {
      // Check if aliases table exists
      let tableExists;
      try {
        tableExists = await this.db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='aliases'"
        );
      } catch (error) {
        // Table doesn't exist, we'll create it
        tableExists = null;
      }

      if (!tableExists) {
        console.log('📋 Creating aliases tables...');
        
        // Read and execute the aliases schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, '../../database/aliases_schema.sql');
        
        if (fs.existsSync(schemaPath)) {
          console.log('📄 Reading aliases schema file...');
          const schema = fs.readFileSync(schemaPath, 'utf8');
          console.log('📄 Schema file read, length:', schema.length);
          
          // Split schema into individual statements and execute in correct order
          // Handle multi-line statements properly, including triggers with multiple semicolons
          const statements = [];
          let currentStatement = '';
          let inTriggerBlock = false;
          const lines = schema.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip comment lines
            if (trimmedLine.startsWith('--') || trimmedLine === '') {
              continue;
            }
            
            // Remove inline comments (everything after --)
            const cleanLine = trimmedLine.split('--')[0].trim();
            if (cleanLine === '') {
              continue;
            }
            
            // Check if we're starting a trigger block
            if (cleanLine.toUpperCase().startsWith('CREATE TRIGGER')) {
              inTriggerBlock = true;
            }
            
            currentStatement += ' ' + cleanLine;
            
            // For triggers, only end the statement when we see END;
            if (inTriggerBlock && cleanLine.toUpperCase() === 'END;') {
              const statement = currentStatement.trim();
              if (statement.length > 0) {
                statements.push(statement);
              }
              currentStatement = '';
              inTriggerBlock = false;
            }
            // For non-trigger statements, end on any semicolon
            else if (!inTriggerBlock && cleanLine.endsWith(';')) {
              const statement = currentStatement.trim();
              if (statement.length > 0) {
                statements.push(statement);
              }
              currentStatement = '';
            }
          }
          
          // Add any remaining statement (shouldn't happen with proper schema)
          if (currentStatement.trim().length > 0) {
            statements.push(currentStatement.trim());
          }
          
          console.log('📄 Found', statements.length, 'statements to execute');

          // Separate statements by type for proper execution order
          const createTableStatements = statements.filter(stmt => 
            stmt.toUpperCase().startsWith('CREATE TABLE')
          );
          const createIndexStatements = statements.filter(stmt => 
            stmt.toUpperCase().startsWith('CREATE INDEX')
          );
          const createTriggerStatements = statements.filter(stmt => 
            stmt.toUpperCase().startsWith('CREATE TRIGGER')
          );
          const insertStatements = statements.filter(stmt => 
            stmt.toUpperCase().startsWith('INSERT INTO')
          );
          const createViewStatements = statements.filter(stmt => 
            stmt.toUpperCase().startsWith('CREATE VIEW')
          );

          console.log('📄 Statement breakdown:');
          console.log('  - CREATE TABLE:', createTableStatements.length);
          console.log('  - CREATE INDEX:', createIndexStatements.length);
          console.log('  - CREATE TRIGGER:', createTriggerStatements.length);
          console.log('  - INSERT INTO:', insertStatements.length);
          console.log('  - CREATE VIEW:', createViewStatements.length);

          // Execute in correct order
          const orderedStatements = [
            ...createTableStatements,
            ...createIndexStatements,
            ...createTriggerStatements,
            ...insertStatements,
            ...createViewStatements
          ];
          
          for (let i = 0; i < orderedStatements.length; i++) {
            const statement = orderedStatements[i];
            if (statement.trim()) {
              console.log(`📄 Executing statement ${i + 1}/${orderedStatements.length}:`, statement.substring(0, 50) + '...');
              try {
                await this.db.exec(statement);
                console.log(`✅ Statement ${i + 1} executed successfully`);
              } catch (error) {
                console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                console.error(`❌ Statement:`, statement);
                throw error;
              }
            }
          }
          
          console.log('✅ Aliases tables created successfully');
        } else {
          console.warn('⚠️ Aliases schema file not found, creating basic tables...');
          await this.createBasicAliasesTables();
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring aliases tables:', error);
      throw error;
    }
  }

  async createBasicAliasesTables() {
    const basicSchema = `
      CREATE TABLE IF NOT EXISTS aliases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        alias_text TEXT NOT NULL,
        normalized_alias TEXT NOT NULL,
        alias_type TEXT NOT NULL,
        confidence_score REAL DEFAULT 1.0,
        usage_frequency INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT 0,
        is_auto_generated BOOLEAN DEFAULT 0,
        source TEXT DEFAULT 'manual',
        context TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        verified_at DATETIME,
        verified_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_aliases_entity ON aliases(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_aliases_text ON aliases(alias_text);
      CREATE INDEX IF NOT EXISTS idx_aliases_normalized ON aliases(normalized_alias);
      CREATE INDEX IF NOT EXISTS idx_aliases_status ON aliases(status);
    `;

    await this.db.exec(basicSchema);
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createAlias(aliasData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      const {
        entityType,
        entityId,
        aliasText,
        aliasType = 'alternative',
        confidenceScore = 1.0,
        isPrimary = false,
        isAutoGenerated = false,
        source = 'manual',
        context = null,
        notes = null,
        createdBy = null
      } = aliasData;

      // Validate required fields
      if (!entityType || !entityId || !aliasText) {
        throw new Error('Missing required fields: entityType, entityId, aliasText');
      }

      // Normalize alias text
      const normalizedAlias = this.normalizeText(aliasText);

      // Check for duplicates
      const existing = await this.db.get(
        'SELECT id FROM aliases WHERE entity_type = ? AND entity_id = ? AND normalized_alias = ?',
        [entityType, entityId, normalizedAlias]
      );

      if (existing) {
        throw new Error('Alias already exists for this entity');
      }

      // If this is set as primary, unset other primary aliases for this entity
      if (isPrimary) {
        await this.db.run(
          'UPDATE aliases SET is_primary = 0 WHERE entity_type = ? AND entity_id = ?',
          [entityType, entityId]
        );
      }

      // Insert new alias
      const result = await this.db.run(
        `INSERT INTO aliases (
          entity_type, entity_id, alias_text, normalized_alias, alias_type,
          confidence_score, is_primary, is_auto_generated, source, context, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entityType, entityId, aliasText, normalizedAlias, aliasType,
          confidenceScore, isPrimary, isAutoGenerated, source, context, notes, createdBy
        ]
      );

      console.log(`✅ Created alias: ${aliasText} for ${entityType}:${entityId}`);

      return {
        success: true,
        alias: {
          id: result.lastID,
          entityType,
          entityId,
          aliasText,
          normalizedAlias,
          aliasType,
          confidenceScore,
          isPrimary,
          isAutoGenerated,
          source,
          context,
          notes,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error creating alias:', error);
      return { success: false, error: error.message };
    }
  }

  async getAliases(entityType, entityId = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      let query = `
        SELECT a.*, 
               CASE 
                 WHEN a.entity_type = 'college' THEN c.name
                 WHEN a.entity_type = 'program' THEN p.name
                 ELSE NULL
               END as entity_name
        FROM aliases a
        LEFT JOIN colleges c ON a.entity_type = 'college' AND a.entity_id = c.id
        LEFT JOIN programs p ON a.entity_type = 'program' AND a.entity_id = p.id
        WHERE a.status = 'active'
      `;

      const params = [];

      if (entityType) {
        query += ' AND a.entity_type = ?';
        params.push(entityType);

        if (entityId) {
          query += ' AND a.entity_id = ?';
          params.push(entityId);
        }
      }

      query += ' ORDER BY a.is_primary DESC, a.confidence_score DESC, a.usage_frequency DESC';

      const aliases = await this.db.all(query, params);

      return {
        success: true,
        aliases: aliases.map(alias => ({
          id: alias.id,
          entityType: alias.entity_type,
          entityId: alias.entity_id,
          entityName: alias.entity_name,
          aliasText: alias.alias_text,
          normalizedAlias: alias.normalized_alias,
          aliasType: alias.alias_type,
          confidenceScore: alias.confidence_score,
          usageFrequency: alias.usage_frequency,
          isPrimary: alias.is_primary,
          isAutoGenerated: alias.is_auto_generated,
          source: alias.source,
          context: alias.context,
          notes: alias.notes,
          status: alias.status,
          createdAt: alias.created_at,
          updatedAt: alias.updated_at
        }))
      };
    } catch (error) {
      console.error('❌ Error getting aliases:', error);
      return { success: false, error: error.message };
    }
  }

  async updateAlias(aliasId, updateData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      const {
        aliasText,
        aliasType,
        confidenceScore,
        isPrimary,
        context,
        notes,
        status
      } = updateData;

      // Get current alias
      const currentAlias = await this.db.get(
        'SELECT * FROM aliases WHERE id = ?',
        [aliasId]
      );

      if (!currentAlias) {
        throw new Error('Alias not found');
      }

      // Build update query dynamically
      const updates = [];
      const params = [];

      if (aliasText !== undefined) {
        updates.push('alias_text = ?');
        params.push(aliasText);
        
        updates.push('normalized_alias = ?');
        params.push(this.normalizeText(aliasText));
      }

      if (aliasType !== undefined) {
        updates.push('alias_type = ?');
        params.push(aliasType);
      }

      if (confidenceScore !== undefined) {
        updates.push('confidence_score = ?');
        params.push(confidenceScore);
      }

      if (isPrimary !== undefined) {
        updates.push('is_primary = ?');
        params.push(isPrimary);
        
        // If setting as primary, unset other primary aliases
        if (isPrimary) {
          await this.db.run(
            'UPDATE aliases SET is_primary = 0 WHERE entity_type = ? AND entity_id = ? AND id != ?',
            [currentAlias.entity_type, currentAlias.entity_id, aliasId]
          );
        }
      }

      if (context !== undefined) {
        updates.push('context = ?');
        params.push(context);
      }

      if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes);
      }

      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(aliasId);

      const query = `UPDATE aliases SET ${updates.join(', ')} WHERE id = ?`;
      await this.db.run(query, params);

      console.log(`✅ Updated alias ID: ${aliasId}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating alias:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteAlias(aliasId) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      const result = await this.db.run(
        'DELETE FROM aliases WHERE id = ?',
        [aliasId]
      );

      if (result.changes === 0) {
        throw new Error('Alias not found');
      }

      console.log(`✅ Deleted alias ID: ${aliasId}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting alias:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // SEARCH AND MATCHING
  // ========================================

  async searchByAlias(query, entityType = null, limit = 50) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      const normalizedQuery = this.normalizeText(query);
      
      let searchQuery = `
        SELECT DISTINCT a.entity_type, a.entity_id, a.alias_text, a.confidence_score,
               CASE 
                 WHEN a.entity_type = 'college' THEN c.name
                 WHEN a.entity_type = 'program' THEN p.name
                 ELSE NULL
               END as entity_name,
               c.city, c.state, c.college_type
        FROM aliases a
        LEFT JOIN colleges c ON a.entity_type = 'college' AND a.entity_id = c.id
        LEFT JOIN programs p ON a.entity_type = 'program' AND a.entity_id = p.id
        WHERE a.status = 'active' 
          AND (a.normalized_alias LIKE ? OR a.alias_text LIKE ?)
      `;

      const params = [`%${normalizedQuery}%`, `%${query}%`];

      if (entityType) {
        searchQuery += ' AND a.entity_type = ?';
        params.push(entityType);
      }

      searchQuery += ' ORDER BY a.confidence_score DESC, a.usage_frequency DESC LIMIT ?';
      params.push(limit);

      const results = await this.db.all(searchQuery, params);

      // Log usage for analytics
      await this.logAliasUsage(results, query);

      return {
        success: true,
        results: results.map(result => ({
          entityType: result.entity_type,
          entityId: result.entity_id,
          entityName: result.entity_name,
          aliasText: result.alias_text,
          confidenceScore: result.confidence_score,
          city: result.city,
          state: result.state,
          collegeType: result.college_type
        }))
      };
    } catch (error) {
      console.error('❌ Error searching by alias:', error);
      return { success: false, error: error.message };
    }
  }

  async getEntityByAlias(query, entityType = null) {
    try {
      const searchResults = await this.searchByAlias(query, entityType, 1);
      
      if (searchResults.success && searchResults.results.length > 0) {
        const result = searchResults.results[0];
        
        // Get full entity details
        let entityQuery;
        let entityParams;

        if (result.entityType === 'college') {
          entityQuery = 'SELECT * FROM colleges WHERE id = ?';
          entityParams = [result.entityId];
        } else if (result.entityType === 'program') {
          entityQuery = 'SELECT * FROM programs WHERE id = ?';
          entityParams = [result.entityId];
        } else {
          throw new Error(`Unsupported entity type: ${result.entityType}`);
        }

        const entity = await this.db.get(entityQuery, entityParams);

        return {
          success: true,
          entity,
          matchedAlias: result.aliasText,
          confidenceScore: result.confidenceScore
        };
      }

      return { success: false, error: 'No entity found for alias' };
    } catch (error) {
      console.error('❌ Error getting entity by alias:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // AUTOMATIC GENERATION
  // ========================================

  async generateAliasesForEntity(entityType, entityId, entityName) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      console.log(`🔄 Generating aliases for ${entityType}:${entityId} - ${entityName}`);

      const generatedAliases = [];
      const normalizedName = this.normalizeText(entityName);

      // Generate abbreviation aliases
      const abbreviationAliases = this.generateAbbreviationAliases(entityName);
      for (const alias of abbreviationAliases) {
        const result = await this.createAlias({
          entityType,
          entityId,
          aliasText: alias.text,
          aliasType: 'abbreviation',
          confidenceScore: alias.confidence,
          isAutoGenerated: true,
          source: 'auto_generated'
        });

        if (result.success) {
          generatedAliases.push(result.alias);
        }
      }

      // Generate short form aliases
      const shortFormAliases = this.generateShortFormAliases(entityName);
      for (const alias of shortFormAliases) {
        const result = await this.createAlias({
          entityType,
          entityId,
          aliasText: alias.text,
          aliasType: 'short_form',
          confidenceScore: alias.confidence,
          isAutoGenerated: true,
          source: 'auto_generated'
        });

        if (result.success) {
          generatedAliases.push(result.alias);
        }
      }

      // Generate common misspelling aliases
      const misspellingAliases = this.generateMisspellingAliases(entityName);
      for (const alias of misspellingAliases) {
        const result = await this.createAlias({
          entityType,
          entityId,
          aliasText: alias.text,
          aliasType: 'misspelling',
          confidenceScore: alias.confidence,
          isAutoGenerated: true,
          source: 'auto_generated'
        });

        if (result.success) {
          generatedAliases.push(result.alias);
        }
      }

      console.log(`✅ Generated ${generatedAliases.length} aliases for ${entityName}`);

      return {
        success: true,
        generatedAliases,
        count: generatedAliases.length
      };
    } catch (error) {
      console.error('❌ Error generating aliases:', error);
      return { success: false, error: error.message };
    }
  }

  generateAbbreviationAliases(name) {
    const aliases = [];
    const words = name.split(' ').filter(word => word.length > 0);

    // Generate dot-separated abbreviations
    if (words.length >= 2) {
      const firstLetters = words.map(word => word.charAt(0).toUpperCase()).join('.');
      aliases.push({ text: firstLetters, confidence: 0.9 });

      // Generate space-separated abbreviations
      const spaceSeparated = words.map(word => word.charAt(0).toUpperCase()).join(' ');
      aliases.push({ text: spaceSeparated, confidence: 0.9 });

      // Generate no-separator abbreviations
      const noSeparator = words.map(word => word.charAt(0).toUpperCase()).join('');
      aliases.push({ text: noSeparator, confidence: 0.8 });
    }

    // Generate partial abbreviations (first 2-3 words)
    if (words.length >= 3) {
      const partialWords = words.slice(0, 3);
      const partialDots = partialWords.map(word => word.charAt(0).toUpperCase()).join('.');
      const partialSpaces = partialWords.map(word => word.charAt(0).toUpperCase()).join(' ');
      
      aliases.push({ text: partialDots, confidence: 0.8 });
      aliases.push({ text: partialSpaces, confidence: 0.8 });
    }

    return aliases;
  }

  generateShortFormAliases(name) {
    const aliases = [];
    const normalizedName = name.toUpperCase();

    // Common short forms
    const shortForms = {
      'MEDICAL COLLEGE': 'MC',
      'DENTAL COLLEGE': 'DC',
      'INSTITUTE': 'INST',
      'UNIVERSITY': 'UNIV',
      'HOSPITAL': 'HOSP',
      'COLLEGE': 'COLL',
      'MEDICAL': 'MED',
      'DENTAL': 'DENT',
      'SCIENCES': 'SCI',
      'TECHNOLOGY': 'TECH',
      'RESEARCH': 'RES',
      'CENTRE': 'CTR',
      'CENTER': 'CTR'
    };

    for (const [full, short] of Object.entries(shortForms)) {
      if (normalizedName.includes(full)) {
        const shortForm = normalizedName.replace(full, short);
        if (shortForm !== normalizedName) {
          aliases.push({ text: shortForm, confidence: 0.7 });
        }
      }
    }

    return aliases;
  }

  generateMisspellingAliases(name) {
    const aliases = [];
    const normalizedName = name.toUpperCase();

    // Common misspellings
    const misspellings = {
      'BANGALORE': 'BANGALURU',
      'BANGALURU': 'BANGALORE',
      'CALCUTTA': 'KOLKATA',
      'KOLKATA': 'CALCUTTA',
      'BOMBAY': 'MUMBAI',
      'MUMBAI': 'BOMBAY',
      'MADRAS': 'CHENNAI',
      'CHENNAI': 'MADRAS'
    };

    for (const [correct, misspelling] of Object.entries(misspellings)) {
      if (normalizedName.includes(correct)) {
        const misspelledName = normalizedName.replace(correct, misspelling);
        if (misspelledName !== normalizedName) {
          aliases.push({ text: misspelledName, confidence: 0.9 });
        }
      }
    }

    return aliases;
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  normalizeText(text) {
    if (!text) return '';
    
    return text
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\.]/g, '') // Remove special characters except dots
      .trim();
  }

  async logAliasUsage(results, query) {
    try {
      for (const result of results) {
        // Find the alias that matched
        const alias = await this.db.get(
          'SELECT id FROM aliases WHERE entity_type = ? AND entity_id = ? AND normalized_alias LIKE ?',
          [result.entity_type, result.entity_id, `%${this.normalizeText(query)}%`]
        );

        if (alias) {
          // Update usage frequency
          await this.db.run(
            'UPDATE aliases SET usage_frequency = usage_frequency + 1 WHERE id = ?',
            [alias.id]
          );
        }
      }
    } catch (error) {
      console.error('❌ Error logging alias usage:', error);
    }
  }

  // ========================================
  // STATISTICS AND ANALYTICS
  // ========================================

  async getAliasStatistics() {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      const stats = await this.db.all(`
        SELECT 
          entity_type,
          alias_type,
          COUNT(*) as total_aliases,
          COUNT(CASE WHEN is_primary = 1 THEN 1 END) as primary_aliases,
          COUNT(CASE WHEN is_auto_generated = 1 THEN 1 END) as auto_generated,
          COUNT(CASE WHEN is_auto_generated = 0 THEN 1 END) as manual,
          AVG(confidence_score) as avg_confidence,
          SUM(usage_frequency) as total_usage
        FROM aliases
        WHERE status = 'active'
        GROUP BY entity_type, alias_type
        ORDER BY entity_type, alias_type
      `);

      const totalStats = await this.db.get(`
        SELECT 
          COUNT(*) as total_aliases,
          COUNT(DISTINCT entity_id) as unique_entities,
          COUNT(CASE WHEN is_auto_generated = 1 THEN 1 END) as auto_generated_count,
          COUNT(CASE WHEN is_auto_generated = 0 THEN 1 END) as manual_count,
          AVG(confidence_score) as avg_confidence,
          SUM(usage_frequency) as total_usage
        FROM aliases
        WHERE status = 'active'
      `);

      return {
        success: true,
        statistics: {
          total: totalStats,
          byType: stats
        }
      };
    } catch (error) {
      console.error('❌ Error getting alias statistics:', error);
      return { success: false, error: error.message };
    }
  }

  async getTopUsedAliases(limit = 20) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aliases Service not initialized');
      }

      const topAliases = await this.db.all(`
        SELECT 
          a.id,
          a.entity_type,
          a.entity_id,
          a.alias_text,
          a.alias_type,
          a.usage_frequency,
          a.confidence_score,
          CASE 
            WHEN a.entity_type = 'college' THEN c.name
            WHEN a.entity_type = 'program' THEN p.name
            ELSE NULL
          END as entity_name
        FROM aliases a
        LEFT JOIN colleges c ON a.entity_type = 'college' AND a.entity_id = c.id
        LEFT JOIN programs p ON a.entity_type = 'program' AND a.entity_id = p.id
        WHERE a.status = 'active' AND a.usage_frequency > 0
        ORDER BY a.usage_frequency DESC, a.confidence_score DESC
        LIMIT ?
      `, [limit]);

      return {
        success: true,
        topAliases: topAliases.map(alias => ({
          id: alias.id,
          entityType: alias.entity_type,
          entityId: alias.entity_id,
          entityName: alias.entity_name,
          aliasText: alias.alias_text,
          aliasType: alias.alias_type,
          usageFrequency: alias.usage_frequency,
          confidenceScore: alias.confidence_score
        }))
      };
    } catch (error) {
      console.error('❌ Error getting top used aliases:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const aliasesService = new AliasesService();

module.exports = aliasesService;
