const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const ErrorCorrectionDictionary = require('./errorCorrectionDictionary');

/**
 * Staging Cutoff Importer
 * 
 * Strategy:
 * 1. Import raw data to temporary database
 * 2. Iteratively refine matching algorithms
 * 3. Allow manual verification and corrections
 * 4. Migrate validated data to unified database
 * 5. Reset staging database for next file
 */
class StagingCutoffImporter {
  constructor() {
    this.stagingDbPath = path.join(__dirname, '..', 'database', 'staging_cutoffs.db');
    this.stagingDb = null;
    this.referenceDataPath = '/Users/kashyapanand/Desktop/data/list';
    this.colleges = new Map();
    this.programs = new Map();
    this.quotas = new Map();
    this.categories = new Map();
    this.states = new Map();
    this.errorDictionary = null;
    
    // OCR correction patterns
    this.ocrCorrections = new Map([
      // College name corrections
      ['PGIMER', 'PGIMER'],
      ['PGIMER,', 'PGIMER'],
      ['PGIMER,,', 'PGIMER'],
      ['DR. RML', 'DR. RML'],
      ['DR RML', 'DR. RML'],
      ['RML HOSPITAL', 'RML HOSPITAL'],
      ['RML HOSPITAL,', 'RML HOSPITAL'],
      ['CANNAUGHT', 'CONNAUGHT'],
      ['CANNAUGHT PLACE', 'CONNAUGHT PLACE'],
      ['ABVIMS', 'ABVIMS'],
      ['ABVIMS,', 'ABVIMS'],
      ['BABA KHARAK', 'BABA KHARAK'],
      ['BABA KHARAK SINGH', 'BABA KHARAK SINGH'],
      ['SAWAI MAN', 'SAWAI MAN'],
      ['SAWAI MAN SINGH', 'SAWAI MAN SINGH'],
      ['VARDHMAN', 'VARDHMAN'],
      ['VARDHMAN MAHAVIR', 'VARDHMAN MAHAVIR'],
      ['B. J. MEDICAL', 'B.J. MEDICAL'],
      ['B J MEDICAL', 'B.J. MEDICAL'],
      ['B.J. MDAL', 'B.J. MEDICAL'],
      ['B J MDAL', 'B.J. MEDICAL'],
      ['MDAL COLLEGE', 'MEDICAL COLLEGE'],
      ['MADRAS MEDICAL', 'MADRAS MEDICAL'],
      ['MAULANA AZAD', 'MAULANA AZAD'],
      
      // Program name corrections
      ['M.D.', 'MD'],
      ['M.D', 'MD'],
      ['MD.', 'MD'],
      ['M.S.', 'MS'],
      ['M.S', 'MS'],
      ['MS.', 'MS'],
      ['GENERAL MDINE', 'GENERAL MEDICINE'],
      ['GENERAL MEDICINE', 'GENERAL MEDICINE'],
      ['RADIO- DIAGNOSIS', 'RADIODIAGNOSIS'],
      ['RADIO DIAGNOSIS', 'RADIODIAGNOSIS'],
      ['RADIODIAGNOSIS', 'RADIODIAGNOSIS'],
      ['OBST. AND GYNAE', 'OBSTETRICS AND GYNAECOLOGY'],
      ['OBST AND GYNAE', 'OBSTETRICS AND GYNAECOLOGY'],
      ['OBSTETRICS AND GYNAECOLOGY', 'OBSTETRICS AND GYNAECOLOGY'],
      
      // Location corrections
      ['NEW DELHI,', 'NEW DELHI'],
      ['NEW DELHI,,', 'NEW DELHI'],
      ['JAIPUR,', 'JAIPUR'],
      ['JAIPUR,,', 'JAIPUR'],
      ['AHMEDABAD,', 'AHMEDABAD'],
      ['AHMEDABAD,,', 'AHMEDABAD'],
      ['AHMDAD', 'AHMEDABAD'],
      ['CHENNAI-03', 'CHENNAI'],
      ['CHENNAI-03,', 'CHENNAI'],
      ['DELHI (NCT)', 'DELHI'],
      ['DELHI (NCT),', 'DELHI'],
      ['GUJARAT,INDIA', 'GUJARAT'],
      ['TAMIL NADU,', 'TAMIL NADU'],
      ['RAJASTHAN,', 'RAJASTHAN'],
      
      // Common OCR errors
      ['MDINE', 'MEDICINE'],
      ['MDAL', 'MEDICAL'],
      ['AHMDAD', 'AHMEDABAD'],
      ['RADIO', 'RADIODIAGNOSIS'],
      ['DIAGNOSIS', 'RADIODIAGNOSIS'],
      ['OBST', 'OBSTETRICS'],
      ['GYNAE', 'GYNAECOLOGY'],
      ['GYNAECOLOGY', 'GYNAECOLOGY']
    ]);
    
    // AIQ-specific program mappings
    this.aiqProgramMappings = new Map([
      ['MD(GENERAL MEDICINE)', 'GENERAL MEDICINE'],
      ['MD(RADIODIAGNOSIS)', 'RADIODIAGNOSIS'],
      ['MD(OBSTETRICS AND GYNAECOLOGY)', 'OBSTETRICS AND GYNAECOLOGY'],
      ['MS(OBSTETRICS AND GYNAECOLOGY)', 'OBSTETRICS AND GYNAECOLOGY'],
      ['MD(GENERAL SURGERY)', 'GENERAL SURGERY'],
      ['MS(GENERAL SURGERY)', 'GENERAL SURGERY'],
      ['MD(ANESTHESIOLOGY)', 'ANESTHESIOLOGY'],
      ['MD(PATHOLOGY)', 'PATHOLOGY'],
      ['MD(MICROBIOLOGY)', 'MICROBIOLOGY'],
      ['MD(BIOCHEMISTRY)', 'BIOCHEMISTRY'],
      ['MD(PHARMACOLOGY)', 'PHARMACOLOGY'],
      ['MD(FORENSIC MEDICINE)', 'FORENSIC MEDICINE'],
      ['MD(PSYCHIATRY)', 'PSYCHIATRY'],
      ['MD(DERMATOLOGY)', 'DERMATOLOGY'],
      ['MD(PEDIATRICS)', 'PEDIATRICS'],
      ['MD(ORTHOPEDICS)', 'ORTHOPEDICS'],
      ['MD(OPHTHALMOLOGY)', 'OPHTHALMOLOGY'],
      ['MD(ENT)', 'ENT'],
      ['MD(RADIATION ONCOLOGY)', 'RADIATION ONCOLOGY'],
      ['MD(EMERGENCY MEDICINE)', 'EMERGENCY MEDICINE'],
      ['MD(COMMUNITY MEDICINE)', 'COMMUNITY MEDICINE'],
      ['MD(PHYSICAL MEDICINE)', 'PHYSICAL MEDICINE'],
      ['MD(REHABILITATION)', 'REHABILITATION'],
      ['MD(SPORTS MEDICINE)', 'SPORTS MEDICINE'],
      ['MD(CLINICAL PHARMACOLOGY)', 'CLINICAL PHARMACOLOGY'],
      ['MD(TRANSFUSION MEDICINE)', 'TRANSFUSION MEDICINE'],
      ['MD(IMMUNOHEMATOLOGY)', 'IMMUNOHEMATOLOGY'],
      ['MD(MOLECULAR MEDICINE)', 'MOLECULAR MEDICINE'],
      ['MD(CLINICAL GENETICS)', 'CLINICAL GENETICS'],
      ['MD(CLINICAL IMMUNOLOGY)', 'CLINICAL IMMUNOLOGY'],
      ['MD(CLINICAL MICROBIOLOGY)', 'CLINICAL MICROBIOLOGY'],
      ['MD(CLINICAL PATHOLOGY)', 'CLINICAL PATHOLOGY'],
      ['MD(CLINICAL PHARMACOLOGY)', 'CLINICAL PHARMACOLOGY'],
      ['MD(CLINICAL RADIOLOGY)', 'CLINICAL RADIOLOGY'],
      ['MD(CLINICAL TOXICOLOGY)', 'CLINICAL TOXICOLOGY'],
      ['MD(CLINICAL VIROLOGY)', 'CLINICAL VIROLOGY'],
      ['MD(CLINICAL BIOCHEMISTRY)', 'CLINICAL BIOCHEMISTRY'],
      ['MD(CLINICAL HEMATOLOGY)', 'CLINICAL HEMATOLOGY'],
      ['MD(CLINICAL IMMUNOLOGY)', 'CLINICAL IMMUNOLOGY'],
      ['MD(CLINICAL MICROBIOLOGY)', 'CLINICAL MICROBIOLOGY'],
      ['MD(CLINICAL PATHOLOGY)', 'CLINICAL PATHOLOGY'],
      ['MD(CLINICAL PHARMACOLOGY)', 'CLINICAL PHARMACOLOGY'],
      ['MD(CLINICAL RADIOLOGY)', 'CLINICAL RADIOLOGY'],
      ['MD(CLINICAL TOXICOLOGY)', 'CLINICAL TOXICOLOGY'],
      ['MD(CLINICAL VIROLOGY)', 'CLINICAL VIROLOGY']
    ]);
  }

  /**
   * Initialize staging database
   */
  async initializeStagingDatabase() {
    return new Promise((resolve, reject) => {
      this.stagingDb = new sqlite3.Database(this.stagingDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Create staging tables
        this.stagingDb.serialize(() => {
          // Raw data table
          this.stagingDb.run(`
            CREATE TABLE IF NOT EXISTS raw_cutoffs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              file_source TEXT NOT NULL,
              row_number INTEGER NOT NULL,
              raw_data TEXT NOT NULL,
              all_india_rank INTEGER,
              quota TEXT,
              college_institute TEXT,
              course TEXT,
              category TEXT,
              round TEXT,
              year INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('Error creating raw_cutoffs table:', err);
              reject(err);
              return;
            }
          });
          
          // Processed data table
          this.stagingDb.run(`
            CREATE TABLE IF NOT EXISTS processed_cutoffs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              raw_cutoff_id INTEGER NOT NULL,
              college_id INTEGER,
              program_id INTEGER,
              year INTEGER,
              round TEXT,
              authority TEXT,
              quota TEXT,
              category TEXT,
              opening_rank INTEGER,
              closing_rank INTEGER,
              seats_available INTEGER DEFAULT 1,
              seats_filled INTEGER DEFAULT 1,
              status TEXT DEFAULT 'pending',
              confidence_score INTEGER DEFAULT 0,
              manual_verified BOOLEAN DEFAULT FALSE,
              notes TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (raw_cutoff_id) REFERENCES raw_cutoffs (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating processed_cutoffs table:', err);
              reject(err);
              return;
            }
          });
          
          // Manual corrections table
          this.stagingDb.run(`
            CREATE TABLE IF NOT EXISTS manual_corrections (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              processed_cutoff_id INTEGER NOT NULL,
              field_name TEXT NOT NULL,
              original_value TEXT,
              corrected_value TEXT,
              correction_type TEXT NOT NULL,
              notes TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (processed_cutoff_id) REFERENCES processed_cutoffs (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating manual_corrections table:', err);
              reject(err);
              return;
            }
          });
          
          // Import sessions table
          this.stagingDb.run(`
            CREATE TABLE IF NOT EXISTS import_sessions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              file_name TEXT NOT NULL,
              file_type TEXT NOT NULL,
              total_records INTEGER,
              raw_imported INTEGER,
              processed INTEGER,
              verified INTEGER,
              migrated INTEGER,
              status TEXT DEFAULT 'active',
              started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              completed_at DATETIME,
              notes TEXT
            )
          `, (err) => {
            if (err) {
              console.error('Error creating import_sessions table:', err);
              reject(err);
              return;
            }
            
            // All tables created successfully
            console.log('✅ All staging tables created successfully');
            
            // Initialize error correction dictionary
            this.initializeErrorDictionary().then(() => {
              resolve();
            }).catch(err => {
              console.warn('Warning: Error dictionary not initialized, continuing without it');
              resolve();
            });
          });
        });
      });
    });
  }

  /**
   * Initialize error correction dictionary
   */
  async initializeErrorDictionary() {
    try {
      this.errorDictionary = new ErrorCorrectionDictionary();
      await this.errorDictionary.initializeDatabase();
      console.log('✅ Error correction dictionary initialized');
    } catch (error) {
      console.error('Error initializing error dictionary:', error);
    }
  }

  /**
   * Start new import session
   */
  async startImportSession(fileName, fileType) {
    return new Promise((resolve, reject) => {
      const stmt = this.stagingDb.prepare(`
        INSERT INTO import_sessions (file_name, file_type, started_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([fileName, fileType], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        this.sessionId = this.lastID;
        resolve(this.lastID);
      });
    });
  }

  /**
   * Import raw data to staging database
   */
  async importRawData(filePath, sessionId) {
    console.log(`📥 Importing raw data from: ${path.basename(filePath)}`);
    
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`📊 Raw data loaded: ${data.length} records`);
      
      let importedCount = 0;
      const errors = [];
      
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        
        try {
          await this.insertRawRecord(record, sessionId, i + 1);
          importedCount++;
          
          if (importedCount % 1000 === 0) {
            console.log(`   📈 Imported: ${importedCount}/${data.length}`);
          }
          
        } catch (error) {
          errors.push({
            row: i + 1,
            error: error.message,
            data: record
          });
        }
      }
      
      // Update session with raw import count
      await this.updateSessionProgress(sessionId, 'raw_imported', importedCount);
      
      console.log(`✅ Raw import completed: ${importedCount} records`);
      
      if (errors.length > 0) {
        console.log(`⚠️  Import errors: ${errors.length}`);
        errors.slice(0, 5).forEach(error => {
          console.log(`   Row ${error.row}: ${error.error}`);
        });
      }
      
      return {
        success: true,
        total: data.length,
        imported: importedCount,
        errors: errors.length
      };
      
    } catch (error) {
      console.error('❌ Raw import failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Insert raw record to staging database
   */
  async insertRawRecord(record, sessionId, rowNumber) {
    return new Promise((resolve, reject) => {
      const stmt = this.stagingDb.prepare(`
        INSERT INTO raw_cutoffs (
          file_source, row_number, raw_data, all_india_rank, quota, 
          college_institute, course, category, round, year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const rawData = JSON.stringify(record);
      const rank = parseInt(record['ALL INDIA RANK']) || 0;
      const quota = record['QUOTA'] || '';
      const college = record['COLLEGE/INSTITUTE'] || '';
      const course = record['COURSE'] || '';
      const category = record['CATEGORY'] || '';
      const round = record['ROUND'] || '';
      const year = parseInt(record['YEAR']) || 2024;
      
      stmt.run([
        sessionId, rowNumber, rawData, rank, quota, 
        college, course, category, round, year
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  }

  /**
   * Process raw data with current algorithms
   */
  async processRawData(sessionId) {
    console.log(`🔄 Processing raw data for session: ${sessionId}`);
    
    try {
      // Get raw records for this session
      const rawRecords = await this.getRawRecords(sessionId);
      console.log(`📊 Processing ${rawRecords.length} raw records`);
      
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;
      
      for (const record of rawRecords) {
        try {
          const result = await this.processRawRecord(record);
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
          
          processedCount++;
          
          if (processedCount % 1000 === 0) {
            console.log(`   📈 Processed: ${processedCount}/${rawRecords.length}`);
          }
          
        } catch (error) {
          errorCount++;
          console.error(`Error processing record ${record.id}:`, error.message);
        }
      }
      
      // Update session progress
      await this.updateSessionProgress(sessionId, 'processed', processedCount);
      
      console.log(`✅ Processing completed:`);
      console.log(`   📊 Total: ${processedCount}`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      console.log(`   📈 Success rate: ${((successCount/processedCount)*100).toFixed(1)}%`);
      
      return {
        success: true,
        total: processedCount,
        successful: successCount,
        errors: errorCount,
        successRate: (successCount/processedCount)*100
      };
      
    } catch (error) {
      console.error('❌ Processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get raw records for a session
   */
  async getRawRecords(sessionId) {
    return new Promise((resolve, reject) => {
      this.stagingDb.all(
        'SELECT * FROM raw_cutoffs WHERE file_source = ? ORDER BY row_number',
        [sessionId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
  }

  /**
   * Process individual raw record
   */
  async processRawRecord(rawRecord) {
    try {
      // Clean and process the data
      const cleanedData = this.cleanRawData(rawRecord);
      
      // Find matches
      const college = await this.findMatchingCollege(cleanedData.college_institute);
      const program = await this.findMatchingProgram(cleanedData.course);
      
      // Calculate confidence score
      let confidenceScore = 0;
      if (college) confidenceScore += 50;
      if (program) confidenceScore += 50;
      
      // Insert processed record
      const processedId = await this.insertProcessedRecord(rawRecord.id, cleanedData, college, program, confidenceScore);
      
      return {
        success: true,
        processedId,
        confidenceScore,
        college: college ? college.name : null,
        program: program ? program.name : null
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean raw data
   */
  cleanRawData(rawRecord) {
    const cleaned = {};
    
    // Clean college name
    cleaned.college_institute = this.cleanCollegeName(rawRecord.college_institute);
    
    // Clean course name
    cleaned.course = this.cleanProgramName(rawRecord.course);
    
    // Clean other fields
    cleaned.quota = rawRecord.quota ? rawRecord.quota.toUpperCase().trim() : '';
    cleaned.category = rawRecord.category ? rawRecord.category.toUpperCase().trim() : '';
    cleaned.round = rawRecord.round || '';
    cleaned.year = parseInt(rawRecord.year) || 2024;
    cleaned.opening_rank = parseInt(rawRecord.all_india_rank) || 0;
    cleaned.closing_rank = parseInt(rawRecord.all_india_rank) || 0;
    
    return cleaned;
  }

  /**
   * Clean college name with OCR correction
   */
  async cleanCollegeName(name) {
    if (!name) return '';
    
    let cleaned = name.toString()
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\-&,()]/g, '');
    
    // Apply error correction dictionary if available
    if (this.errorDictionary) {
      try {
        const result = await this.errorDictionary.applyCorrections(cleaned, 'college_name');
        cleaned = result.corrected;
        if (result.corrections.length > 0) {
          console.log(`🔧 Applied ${result.corrections.length} college name corrections`);
        }
      } catch (error) {
        console.warn('Error applying college name corrections:', error);
      }
    }
    
    // Apply legacy OCR corrections
    for (const [incorrect, correct] of this.ocrCorrections) {
      cleaned = cleaned.replace(new RegExp(incorrect, 'g'), correct);
    }
    
    return cleaned;
  }

  /**
   * Clean program name with OCR correction
   */
  async cleanProgramName(name) {
    if (!name) return '';
    
    let cleaned = name.toString()
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\-&,()]/g, '');
    
    // Apply error correction dictionary if available
    if (this.errorDictionary) {
      try {
        const result = await this.errorDictionary.applyCorrections(cleaned, 'program_name');
        cleaned = result.corrected;
        if (result.corrections.length > 0) {
          console.log(`🔧 Applied ${result.corrections.length} program name corrections`);
        }
      } catch (error) {
        console.warn('Error applying program name corrections:', error);
      }
    }
    
    // Apply legacy OCR corrections
    for (const [incorrect, correct] of this.ocrCorrections) {
      cleaned = cleaned.replace(new RegExp(incorrect, 'g'), correct);
    }
    
    // Fix OCR duplications like "RADIORADIODIAGNOSISRADIODIAGNOSIS"
    cleaned = cleaned.replace(/(\w+)\1+/g, '$1');
    
    return cleaned;
  }

  /**
   * Find matching college
   */
  async findMatchingCollege(collegeName) {
    try {
      // Load reference data if not already loaded
      if (this.colleges.size === 0) {
        await this.loadReferenceData();
      }
      
      // Strategy 1: Exact match
      for (const [id, college] of this.colleges) {
        if (college.name.toUpperCase() === collegeName.toUpperCase()) {
          return { id, name: college.name, type: college.type };
        }
      }
      
      // Strategy 2: Partial match
      for (const [id, college] of this.colleges) {
        if (college.name.toUpperCase().includes(collegeName.toUpperCase()) ||
            collegeName.toUpperCase().includes(college.name.toUpperCase())) {
          return { id, name: college.name, type: college.type };
        }
      }
      
      // Strategy 3: Key words match
      const collegeWords = collegeName.toUpperCase().split(/\s+/);
      for (const [id, college] of this.colleges) {
        const collegeNameWords = college.name.toUpperCase().split(/\s+/);
        const commonWords = collegeWords.filter(word => 
          collegeNameWords.includes(word) && word.length > 2
        );
        if (commonWords.length >= 2) {
          return { id, name: college.name, type: college.type };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding matching college:', error);
      return null;
    }
  }

  /**
   * Find matching program
   */
  async findMatchingProgram(programName) {
    try {
      // Check AIQ mappings first
      if (this.aiqProgramMappings.has(programName)) {
        const mappedName = this.aiqProgramMappings.get(programName);
        // Find the mapped program in reference data
        for (const [id, program] of this.programs) {
          if (program.name.toUpperCase() === mappedName.toUpperCase()) {
            return { id, name: program.name };
          }
        }
        return { name: mappedName };
      }
      
      // Load reference data if not already loaded
      if (this.programs.size === 0) {
        await this.loadReferenceData();
      }
      
      // Strategy 1: Exact match
      for (const [id, program] of this.programs) {
        if (program.name.toUpperCase() === programName.toUpperCase()) {
          return { id, name: program.name };
        }
      }
      
      // Strategy 2: Partial match
      for (const [id, program] of this.programs) {
        if (program.name.toUpperCase().includes(programName.toUpperCase()) ||
            programName.toUpperCase().includes(program.name.toUpperCase())) {
          return { id, name: program.name };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding matching program:', error);
      return null;
    }
  }

  /**
   * Load reference data from files
   */
  async loadReferenceData() {
    try {
      console.log('📚 Loading reference data...');
      
      // Load colleges
      const collegesFile = path.join(this.referenceDataPath, 'ALL COLLEGES OF INDIA.xlsx');
      if (fs.existsSync(collegesFile)) {
        const workbook = xlsx.readFile(collegesFile);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process data
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row[0] && row[1]) { // college_name and college_type
            this.colleges.set(i, {
              id: i,
              name: row[0].toString().trim(),
              type: row[1].toString().trim()
            });
          }
        }
        console.log(`✅ Loaded ${this.colleges.size} colleges`);
      }
      
      // Load programs
      const programsFile = path.join(this.referenceDataPath, 'Courses list.xlsx');
      if (fs.existsSync(programsFile)) {
        const workbook = xlsx.readFile(programsFile);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process data
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row[0]) { // course_name
            this.programs.set(i, {
              id: i,
              name: row[0].toString().trim()
            });
          }
        }
        console.log(`✅ Loaded ${this.programs.size} programs`);
      }
      
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }

  /**
   * Insert processed record
   */
  async insertProcessedRecord(rawId, cleanedData, college, program, confidenceScore) {
    return new Promise((resolve, reject) => {
      const stmt = this.stagingDb.prepare(`
        INSERT INTO processed_cutoffs (
          raw_cutoff_id, college_id, program_id, year, round, authority,
          quota, category, opening_rank, closing_rank, seats_available,
          seats_filled, status, confidence_score, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const collegeId = college ? college.id : null;
      const programId = program ? program.id : null;
      const status = confidenceScore === 100 ? 'verified' : 'pending';
      const notes = `Processed with confidence: ${confidenceScore}%`;
      
      stmt.run([
        rawId, collegeId, programId, cleanedData.year, cleanedData.round, 'AIQ',
        cleanedData.quota, cleanedData.category, cleanedData.opening_rank, cleanedData.closing_rank,
        1, 1, status, confidenceScore, notes
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  }

  /**
   * Update session progress
   */
  async updateSessionProgress(sessionId, field, value) {
    return new Promise((resolve, reject) => {
      const stmt = this.stagingDb.prepare(`
        UPDATE import_sessions SET ${field} = ? WHERE id = ?
      `);
      
      stmt.run([value, sessionId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(sessionId) {
    return new Promise((resolve, reject) => {
      this.stagingDb.get(
        'SELECT * FROM import_sessions WHERE id = ?',
        [sessionId],
        (err, session) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Get counts
          this.stagingDb.get(
            'SELECT COUNT(*) as total FROM raw_cutoffs WHERE file_source = ?',
            [sessionId],
            (err, rawCount) => {
              if (err) {
                reject(err);
                return;
              }
              
              this.stagingDb.get(
                'SELECT COUNT(*) as total FROM processed_cutoffs WHERE raw_cutoff_id IN (SELECT id FROM raw_cutoffs WHERE file_source = ?)',
                [sessionId],
                (err, processedCount) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  
                  resolve({
                    session,
                    rawCount: rawCount.total,
                    processedCount: processedCount.total
                  });
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * Close staging database
   */
  async close() {
    if (this.stagingDb) {
      return new Promise((resolve) => {
        this.stagingDb.close(() => resolve());
      });
    }
  }
}

module.exports = StagingCutoffImporter;
