const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const DatabaseManager = require('../database/DatabaseManager');

class CutoffImportPreparer {
  constructor() {
    this.dbManager = null;
    this.unifiedDb = null;
    this.collegesDb = null;
    this.programsDb = null;
  }

  async initialize() {
    this.dbManager = DatabaseManager;
    await this.dbManager.initialize();
    this.unifiedDb = this.dbManager.getDatabase('clean-unified.db');
    this.collegesDb = this.dbManager.getDatabase('colleges.db');
    this.programsDb = this.dbManager.getDatabase('clean-unified.db');
  }

  /**
   * Parse CSV file and return structured data
   */
  async parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Extract authority and year from filename
   */
  extractFileMetadata(filename) {
    // Example: AIQ_PG_2024_R1_aggregated_20250826_132632.csv
    // Example: KEA_2024_MEDICAL_R1_aggregated_20250826_132649.csv
    const match = filename.match(/^([A-Z_]+)_(\d{4})_([A-Z]+)_R(\d+)/);
    if (match) {
      // Handle KEA format: KEA_2024_MEDICAL_R1
      return {
        authority: `${match[1]} ${match[3]}`,
        year: parseInt(match[2]),
        round: `r${match[4]}`,
        roundNumber: parseInt(match[4])
      };
    }
    
    // Handle AIQ format: AIQ_PG_2024_R1
    const aiqMatch = filename.match(/^([A-Z_]+)_(\d{4})_R(\d+)/);
    if (aiqMatch) {
      return {
        authority: aiqMatch[1].replace(/_/g, ' '),
        year: parseInt(aiqMatch[2]),
        round: `r${aiqMatch[3]}`,
        roundNumber: parseInt(aiqMatch[3])
      };
    }
    
    return null;
  }

  /**
   * Parse quota string to standard format
   */
  parseQuota(quotaString) {
    const quota = quotaString.toLowerCase();
    
    if (quota.includes('state')) return 'STATE';
    if (quota.includes('management') || quota.includes('paid')) return 'MANAGEMENT';
    if (quota.includes('aiq') || quota.includes('all india')) return 'AIQ';
    if (quota.includes('central')) return 'CENTRAL';
    
    return quota.toUpperCase();
  }

  /**
   * Parse all_ranks string to structured format
   */
  parseRanks(allRanksString) {
    if (!allRanksString) return [];
    
    const rankEntries = allRanksString.split(',').map(entry => entry.trim());
    const parsedRanks = [];
    
    rankEntries.forEach(entry => {
      const match = entry.match(/^([A-Z_]+):(\d+)$/);
      if (match) {
        parsedRanks.push({
          category: match[1].trim(),
          rank: parseInt(match[2])
        });
      }
    });
    
    return parsedRanks;
  }

  /**
   * Find matching college in database
   */
  async findMatchingCollege(collegeName) {
    try {
      // Extract the main college name (before the comma)
      const mainCollegeName = collegeName.split(',')[0].trim();
      const cleanMainName = this.cleanCollegeName(mainCollegeName);
      
      console.log(`      🔍 Searching for: "${cleanMainName}"`);
      
      // Strategy 1: Exact match with main name
      let college = await this.unifiedDb.get(
        'SELECT * FROM colleges WHERE name = ? LIMIT 1',
        [mainCollegeName]
      );
      
      if (college) {
        console.log(`      ✅ Exact match found: ${college.name}`);
        return college;
      }
      
      // Strategy 2: Exact match with cleaned name
      college = await this.unifiedDb.get(
        'SELECT * FROM colleges WHERE name = ? LIMIT 1',
        [cleanMainName]
      );
      
      if (college) {
        console.log(`      ✅ Exact match (cleaned) found: ${college.name}`);
        return college;
      }
      
      // Strategy 3: Partial match with main name (more restrictive)
      college = await this.unifiedDb.get(
        'SELECT * FROM colleges WHERE name LIKE ? AND college_type IN ("DENTAL", "MEDICAL") LIMIT 1',
        [`%${mainCollegeName}%`]
      );
      
      if (college) {
        console.log(`      ✅ Partial match found: ${college.name}`);
        return college;
      }
      
      // Strategy 4: Smart partial match with key words (more restrictive)
      const keyWords = cleanMainName.split(' ').filter(word => word.length > 3);
      console.log(`      🔍 Trying smart key words: ${keyWords.join(', ')}`);
      
      // Try to find colleges that contain multiple key words
      for (let i = 0; i < keyWords.length - 1; i++) {
        for (let j = i + 1; j < keyWords.length; j++) {
          const word1 = keyWords[i];
          const word2 = keyWords[j];
          
          college = await this.unifiedDb.get(
            'SELECT * FROM colleges WHERE name LIKE ? AND name LIKE ? AND college_type IN ("DENTAL", "MEDICAL") LIMIT 1',
            [`%${word1}%`, `%${word2}%`]
          );
          
          if (college) {
            console.log(`      ✅ Multi-keyword match found: ${college.name} (${word1} + ${word2})`);
            return college;
          }
        }
      }
      
      // Strategy 5: Single key word match (most restrictive)
      for (const word of keyWords) {
        if (word.length > 4) { // Only use longer words
          college = await this.unifiedDb.get(
            'SELECT * FROM colleges WHERE name LIKE ? AND college_type IN ("DENTAL", "MEDICAL") LIMIT 1',
            [`%${word}%`]
          );
          if (college) {
            console.log(`      ✅ Single key word match found: ${college.name} (${word})`);
            return college;
          }
        }
      }
      
      console.log(`      ❌ No college match found`);
      return null;
    } catch (error) {
      console.error('Error finding matching college:', error);
      return null;
    }
  }

  /**
   * Find matching program in database
   */
  async findMatchingProgram(programName, collegeId) {
    try {
      // Clean program name for matching
      const cleanProgramName = this.cleanProgramName(programName);
      
      console.log(`      🔍 Searching for program: "${cleanProgramName}"`);
      
      // Strategy 1: Exact match
      let program = await this.unifiedDb.get(
        'SELECT * FROM programs WHERE name = ? AND college_id = ? LIMIT 1',
        [programName, collegeId]
      );
      
      if (program) {
        console.log(`      ✅ Exact program match: ${program.name}`);
        return program;
      }
      
      // Strategy 2: Exact match with cleaned name
      program = await this.unifiedDb.get(
        'SELECT * FROM programs WHERE name = ? AND college_id = ? LIMIT 1',
        [cleanProgramName, collegeId]
      );
      
      if (program) {
        console.log(`      ✅ Exact program match (cleaned): ${program.name}`);
        return program;
      }
      
      // Strategy 3: Handle common dental program variations
      const programVariations = this.getProgramVariations(cleanProgramName);
      for (const variation of programVariations) {
        program = await this.unifiedDb.get(
          'SELECT * FROM programs WHERE name LIKE ? AND college_id = ? LIMIT 1',
          [`%${variation}%`, collegeId]
        );
        if (program) {
          console.log(`      ✅ Program variation match: ${program.name} (variation: ${variation})`);
          return program;
        }
      }
      
      // Strategy 4: Smart partial match with first few words
      const firstWords = cleanProgramName.split(' ').slice(0, 3).join(' ');
      program = await this.unifiedDb.get(
        'SELECT * FROM programs WHERE name LIKE ? AND college_id = ? LIMIT 1',
        [`%${firstWords}%`, collegeId]
      );
      
      if (program) {
        console.log(`      ✅ Partial program match: ${program.name}`);
        return program;
      }
      
      // Strategy 5: Multi-keyword matching (more restrictive)
      const keyWords = cleanProgramName.split(' ').filter(word => word.length > 2);
      console.log(`      🔍 Trying multi-keyword matching: ${keyWords.join(', ')}`);
      
      // Try to find programs that contain multiple key words
      for (let i = 0; i < keyWords.length - 1; i++) {
        for (let j = i + 1; j < keyWords.length; j++) {
          const word1 = keyWords[i];
          const word2 = keyWords[j];
          
          program = await this.unifiedDb.get(
            'SELECT * FROM programs WHERE name LIKE ? AND name LIKE ? AND college_id = ? LIMIT 1',
            [`%${word1}%`, `%${word2}%`, collegeId]
          );
          
          if (program) {
            console.log(`      ✅ Multi-keyword program match: ${program.name} (${word1} + ${word2})`);
            return program;
          }
        }
      }
      
      // Strategy 6: Single key word match (most restrictive)
      for (const word of keyWords) {
        if (word.length > 3) { // Only use longer words
          program = await this.unifiedDb.get(
            'SELECT * FROM programs WHERE name LIKE ? AND college_id = ? LIMIT 1',
            [`%${word}%`, collegeId]
          );
          if (program) {
            console.log(`      ✅ Single key word program match: ${program.name} (${word})`);
            return program;
          }
        }
      }
      
      console.log(`      ❌ No program match found`);
      return null;
    } catch (error) {
      console.error('Error finding matching program:', error);
      return null;
    }
  }

  /**
   * Get common program name variations for dental programs
   */
  getProgramVariations(programName) {
    const variations = [];
    
    // Handle common dental program variations
    if (programName.includes('ORTHODONTICS')) {
      variations.push('ORTHODONITICS'); // Handle spelling variation
      variations.push('ORTHODONT');
      variations.push('ORTHODON');
    }
    
    if (programName.includes('CONSERVATIVE')) {
      variations.push('CONSERVATIVE');
      variations.push('ENDODONTICS');
    }
    
    if (programName.includes('ORAL MEDICINE')) {
      variations.push('ORAL MEDICINE');
      variations.push('RADIOLOGY');
    }
    
    if (programName.includes('ORAL SURGERY')) {
      variations.push('ORAL SURGERY');
      variations.push('MAXILLOFACIAL');
      variations.push('SURGERY');
    }
    
    if (programName.includes('PERIODONTOLOGY')) {
      variations.push('PERIODONTOLOGY');
      variations.push('PERIODONT');
    }
    
    if (programName.includes('PROSTHODONTICS')) {
      variations.push('PROSTHODONTICS');
      variations.push('PROSTHODONT');
      variations.push('CROWN');
      variations.push('BRIDGE');
    }
    
    if (programName.includes('PEDIATRIC')) {
      variations.push('PEDIATRIC');
      variations.push('PREVENTIVE');
    }
    
    if (programName.includes('PUBLIC HEALTH')) {
      variations.push('PUBLIC HEALTH');
      variations.push('COMMUNITY');
    }
    
    return variations;
  }

  /**
   * Clean college name for matching
   */
  cleanCollegeName(collegeName) {
    return collegeName
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toUpperCase();
  }

  /**
   * Clean program name for matching
   */
  cleanProgramName(programName) {
    return programName
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toUpperCase();
  }

  /**
   * Validate cutoff data structure
   */
  validateCutoffData(data) {
    const errors = [];
    
    if (!data.round) errors.push('Missing round');
    if (!data.quota) errors.push('Missing quota');
    if (!data.college_name) errors.push('Missing college_name');
    if (!data.course_name) errors.push('Missing course_name');
    if (!data.all_ranks) errors.push('Missing all_ranks');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Transform raw CSV data to database format
   */
  async transformCutoffData(rawData, fileMetadata) {
    const transformedData = [];
    
    for (const row of rawData) {
      // Validate data
      const validation = this.validateCutoffData(row);
      if (!validation.isValid) {
        console.warn('Invalid row:', row, 'Errors:', validation.errors);
        continue;
      }
      
      // Parse ranks
      const ranks = this.parseRanks(row.all_ranks);
      if (ranks.length === 0) {
        console.warn('No valid ranks found in row:', row);
        continue;
      }
      
      // Find matching college
      const college = await this.findMatchingCollege(row.college_name);
      if (!college) {
        console.warn('No matching college found for:', row.college_name);
        continue;
      }
      
      // Find matching program
      const program = await this.findMatchingProgram(row.course_name, college.id);
      if (!program) {
        console.warn('No matching program found for:', row.course_name, 'in college:', college.name);
        continue;
      }
      
      // Create cutoff entries for each rank
      for (const rankData of ranks) {
        transformedData.push({
          college_id: college.id,
          program_id: program.id,
          year: fileMetadata.year,
          round: fileMetadata.round,
          authority: fileMetadata.authority,
          quota: this.parseQuota(row.quota),
          category: rankData.category,
          opening_rank: rankData.rank,
          closing_rank: rankData.rank,
          seats_available: 1, // Default, can be updated later
          seats_filled: 0,
          status: 'active',
          notes: `Imported from ${fileMetadata.authority} ${fileMetadata.year} ${fileMetadata.round}`,
          source_file: path.basename(fileMetadata.filename)
        });
      }
    }
    
    return transformedData;
  }

  /**
   * Prepare system for import (create necessary tables, indexes)
   */
  async prepareSystem() {
    try {
      console.log('🔧 Preparing system for cutoff import...');
      
      // Ensure cutoffs table exists with proper structure
      await this.unifiedDb.exec(`
        CREATE TABLE IF NOT EXISTS cutoffs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          college_id INTEGER NOT NULL,
          program_id INTEGER NOT NULL,
          year INTEGER NOT NULL,
          round TEXT NOT NULL,
          authority TEXT NOT NULL,
          quota TEXT NOT NULL,
          category TEXT NOT NULL,
          opening_rank INTEGER,
          closing_rank INTEGER,
          opening_score DECIMAL(8,2),
          closing_score DECIMAL(8,2),
          score_type TEXT,
          score_unit TEXT,
          seats_available INTEGER,
          seats_filled INTEGER,
          seat_type TEXT,
          source_url TEXT,
          confidence_score INTEGER DEFAULT 1 CHECK (confidence_score BETWEEN 1 AND 5),
          notes TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'provisional')),
          source_file TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
        )
      `);
      
      // Create indexes for better performance
      await this.unifiedDb.exec(`
        CREATE INDEX IF NOT EXISTS idx_cutoffs_college_id ON cutoffs(college_id);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_program_id ON cutoffs(program_id);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_year ON cutoffs(year);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_quota ON cutoffs(quota);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_category ON cutoffs(category);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_authority ON cutoffs(authority);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_round ON cutoffs(round);
        CREATE INDEX IF NOT EXISTS idx_cutoffs_status ON cutoffs(status);
      `);
      
      console.log('✅ System prepared for cutoff import');
      return true;
    } catch (error) {
      console.error('❌ Error preparing system:', error);
      return false;
    }
  }

  /**
   * Get import statistics
   */
  async getImportStats() {
    try {
      const stats = await this.unifiedDb.get('SELECT COUNT(*) as total_cutoffs FROM cutoffs WHERE status = "active"');
      const collegeStats = await this.unifiedDb.get('SELECT COUNT(*) as total_colleges FROM colleges');
      const programStats = await this.unifiedDb.get('SELECT COUNT(*) as total_programs FROM programs');
      
      return {
        total_cutoffs: stats.total_cutoffs || 0,
        total_colleges: collegeStats.total_colleges || 0,
        total_programs: programStats.total_programs || 0,
        system_ready: true
      };
    } catch (error) {
      console.error('Error getting import stats:', error);
      return {
        total_cutoffs: 0,
        total_colleges: 0,
        total_programs: 0,
        system_ready: false
      };
    }
  }
}

module.exports = CutoffImportPreparer;
