const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Error Correction Dictionary
 * 
 * Centralized system for managing:
 * - Known OCR errors and their corrections
 * - Data format inconsistencies
 * - Common typos and variations
 * - Correction rules and patterns
 * - Usage statistics and effectiveness tracking
 */
class ErrorCorrectionDictionary {
  constructor() {
    this.dbPath = './error_corrections.db';
    this.db = null;
    
    // Default error corrections based on our findings
    this.defaultCorrections = [
      // College Name Corrections
      {
        category: 'college_name',
        error_type: 'ocr_error',
        pattern: 'PGIMER,',
        correction: 'PGIMER',
        description: 'Remove trailing comma from PGIMER',
        priority: 'high',
        context: 'AIQ PG 2024 data',
        examples: ['PGIMER,', 'PGIMER,,'],
        regex_pattern: '^PGIMER,+$',
        replacement: 'PGIMER'
      },
      {
        category: 'college_name',
        error_type: 'ocr_error',
        pattern: 'B.J. MDAL',
        correction: 'B.J. MEDICAL',
        description: 'Fix OCR error MDAL to MEDICAL',
        priority: 'high',
        context: 'AIQ PG 2024 data',
        examples: ['B.J. MDAL', 'B J MDAL', 'MDAL COLLEGE'],
        regex_pattern: 'MDAL',
        replacement: 'MEDICAL'
      },
      {
        category: 'college_name',
        error_type: 'ocr_error',
        pattern: 'CANNAUGHT',
        correction: 'CONNAUGHT',
        description: 'Fix OCR error CANNAUGHT to CONNAUGHT',
        priority: 'high',
        context: 'AIQ PG 2024 data',
        examples: ['CANNAUGHT', 'CANNAUGHT PLACE'],
        regex_pattern: 'CANNAUGHT',
        replacement: 'CONNAUGHT'
      },
      {
        category: 'college_name',
        error_type: 'ocr_error',
        pattern: 'AHMDAD',
        correction: 'AHMEDABAD',
        description: 'Fix OCR error AHMDAD to AHMEDABAD',
        priority: 'high',
        context: 'AIQ PG 2024 data',
        examples: ['AHMDAD', 'AHMDAD,'],
        regex_pattern: 'AHMDAD',
        replacement: 'AHMEDABAD'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'NEW DELHI,',
        correction: 'NEW DELHI',
        description: 'Remove trailing comma from city names',
        priority: 'medium',
        context: 'Location formatting',
        examples: ['NEW DELHI,', 'NEW DELHI,,', 'JAIPUR,', 'CHENNAI-03,'],
        regex_pattern: '([A-Z\s]+),+$',
        replacement: '$1'
      },
      
      // Program Name Corrections
      {
        category: 'program_name',
        error_type: 'ocr_error',
        pattern: 'GENERAL MDINE',
        correction: 'GENERAL MEDICINE',
        description: 'Fix OCR error MDINE to MEDICINE',
        priority: 'high',
        context: 'AIQ PG 2024 data',
        examples: ['GENERAL MDINE', 'MDINE'],
        regex_pattern: 'MDINE',
        replacement: 'MEDICINE'
      },
      {
        category: 'program_name',
        error_type: 'ocr_error',
        pattern: 'RADIO- DIAGNOSIS',
        correction: 'RADIODIAGNOSIS',
        description: 'Fix OCR spacing and hyphenation',
        priority: 'high',
        context: 'AIQ PG 2024 data',
        examples: ['RADIO- DIAGNOSIS', 'RADIO DIAGNOSIS'],
        regex_pattern: 'RADIO[-\\s]+DIAGNOSIS',
        replacement: 'RADIODIAGNOSIS'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'OBST. AND GYNAE',
        correction: 'OBSTETRICS AND GYNAECOLOGY',
        description: 'Expand abbreviated program names',
        priority: 'medium',
        context: 'AIQ PG 2024 data',
        examples: ['OBST. AND GYNAE', 'OBST AND GYNAE'],
        regex_pattern: 'OBST\\.?\\s+AND\\s+GYNAE',
        replacement: 'OBSTETRICS AND GYNAECOLOGY'
      },
      {
        category: 'program_name',
        error_type: 'ocr_error',
        pattern: 'OBST. AND GYNAE',
        correction: 'OBSTETRICS AND GYNAECOLOGY',
        description: 'Expand abbreviated program names',
        priority: 'medium',
        context: 'AIQ PG 2024 data',
        examples: ['OBST. AND GYNAE', 'OBST AND GYNAE'],
        regex_pattern: 'OBST\.?\s+AND\s+GYNAE',
        replacement: 'OBSTETRICS AND GYNAECOLOGY'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'M.D.',
        correction: 'MD',
        description: 'Standardize degree abbreviations',
        priority: 'medium',
        context: 'Degree formatting',
        examples: ['M.D.', 'M.D', 'MD.'],
        regex_pattern: 'M\\.?D\\.?',
        replacement: 'MD'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'M.S.',
        correction: 'MS',
        description: 'Standardize degree abbreviations',
        priority: 'medium',
        context: 'Degree formatting',
        examples: ['M.S.', 'M.S', 'MS.'],
        regex_pattern: 'M\\.?S\\.?',
        replacement: 'MS'
      },
      
      // AIQ-Specific Program Format Corrections
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MD(GENERAL MEDICINE)',
        correction: 'GENERAL MEDICINE',
        description: 'Extract specialty from AIQ format MD(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MD(GENERAL MEDICINE)', 'MD(RADIODIAGNOSIS)'],
        regex_pattern: 'MD\\(([^)]+)\\)',
        replacement: '$1'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MS(GENERAL SURGERY)',
        correction: 'GENERAL SURGERY',
        description: 'Extract specialty from AIQ format MS(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MS(GENERAL SURGERY)', 'MS(OBSTETRICS AND GYNAECOLOGY)'],
        regex_pattern: 'MS\\(([^)]+)\\)',
        replacement: '$1'
      },
      
      // OCR Duplication Corrections
      {
        category: 'program_name',
        error_type: 'ocr_duplication',
        pattern: 'RADIORADIODIAGNOSISRADIODIAGNOSIS',
        correction: 'RADIODIAGNOSIS',
        description: 'Fix OCR duplication of program names',
        priority: 'critical',
        context: 'AIQ PG 2024 OCR issues',
        examples: ['RADIORADIODIAGNOSISRADIODIAGNOSIS'],
        regex_pattern: '(\\w+)\\1+',
        replacement: '$1'
      },
      
      // Location Corrections
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'DELHI (NCT)',
        correction: 'DELHI',
        description: 'Simplify location names',
        priority: 'low',
        context: 'Location standardization',
        examples: ['DELHI (NCT)', 'DELHI (NCT),'],
        regex_pattern: 'DELHI\\s*\\([^)]+\\)',
        replacement: 'DELHI'
      },
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'CHENNAI-03',
        correction: 'CHENNAI',
        description: 'Remove postal codes from city names',
        priority: 'low',
        context: 'Location standardization',
        examples: ['CHENNAI-03', 'CHENNAI-03,'],
        regex_pattern: '([A-Z]+)-\\d+',
        replacement: '$1'
      },
      
      // Quota and Category Corrections
      {
        category: 'quota',
        error_type: 'format_error',
        pattern: 'AIQ',
        correction: 'AIQ',
        description: 'Standardize quota abbreviations',
        priority: 'low',
        context: 'Quota standardization',
        examples: ['AIQ', 'aiq', 'Aiq'],
        regex_pattern: '^aiq$',
        replacement: 'AIQ',
        flags: 'i'
      },
      {
        category: 'category',
        error_type: 'format_error',
        pattern: 'OPEN',
        correction: 'OPEN',
        description: 'Standardize category names',
        priority: 'low',
        context: 'Category standardization',
        examples: ['OPEN', 'open', 'Open'],
        regex_pattern: '^open$',
        replacement: 'OPEN',
        flags: 'i'
      },
      
      // Additional AIQ-Specific Corrections
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'DIPLOMA',
        correction: 'DIPLOMA',
        description: 'Standardize diploma program names',
        priority: 'medium',
        context: 'AIQ PG 2024 format',
        examples: ['DIPLOMA', 'diploma', 'Diploma'],
        regex_pattern: '^diploma$',
        replacement: 'DIPLOMA',
        flags: 'i'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'INSTITUTE',
        correction: 'INSTITUTE',
        description: 'Standardize institute naming',
        priority: 'low',
        context: 'College name standardization',
        examples: ['INSTITUTE', 'institute', 'Institute'],
        regex_pattern: '^institute$',
        replacement: 'INSTITUTE',
        flags: 'i'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'COLLEGE',
        correction: 'COLLEGE',
        description: 'Standardize college naming',
        priority: 'low',
        context: 'College name standardization',
        examples: ['COLLEGE', 'college', 'College'],
        regex_pattern: '^college$',
        replacement: 'COLLEGE',
        flags: 'i'
      },
      {
        category: 'program_name',
        error_type: 'ocr_error',
        pattern: 'ANESTHESIOLOGY',
        correction: 'ANESTHESIOLOGY',
        description: 'Fix common OCR errors in anesthesiology',
        priority: 'high',
        context: 'AIQ PG 2024 OCR issues',
        examples: ['ANESTHESIOLOGY', 'ANESTHESIOLOGY', 'ANESTHESIOLOGY'],
        regex_pattern: 'ANESTHESIOLOGY',
        replacement: 'ANESTHESIOLOGY'
      },
      {
        category: 'program_name',
        error_type: 'ocr_error',
        pattern: 'DERMATOLOGY',
        correction: 'DERMATOLOGY',
        description: 'Fix common OCR errors in dermatology',
        priority: 'high',
        context: 'AIQ PG 2024 OCR issues',
        examples: ['DERMATOLOGY', 'DERMATOLOGY', 'DERMATOLOGY'],
        regex_pattern: 'DERMATOLOGY',
        replacement: 'DERMATOLOGY'
      },
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'MAHARASHTRA',
        correction: 'MAHARASHTRA',
        description: 'Standardize state names',
        priority: 'low',
        context: 'Location standardization',
        examples: ['MAHARASHTRA', 'maharashtra', 'Maharashtra'],
        regex_pattern: '^maharashtra$',
        replacement: 'MAHARASHTRA',
        flags: 'i'
      },
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'KARNATAKA',
        correction: 'KARNATAKA',
        description: 'Standardize state names',
        priority: 'low',
        context: 'Location standardization',
        examples: ['KARNATAKA', 'karnataka', 'Karnataka'],
        regex_pattern: '^karnataka$',
        replacement: 'KARNATAKA',
        flags: 'i'
      },
      
      // AIQ-Specific Program Format Corrections
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MD(PSYCHIATRY)',
        correction: 'PSYCHIATRY',
        description: 'Extract specialty from AIQ format MD(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MD(PSYCHIATRY)', 'MD(PSYCHIATRY)'],
        regex_pattern: 'MD\\(PSYCHIATRY\\)',
        replacement: 'PSYCHIATRY'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MD(PEDIATRICS)',
        correction: 'PEDIATRICS',
        description: 'Extract specialty from AIQ format MD(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MD(PEDIATRICS)', 'MD(PEDIATRICS)'],
        regex_pattern: 'MD\\(PEDIATRICS\\)',
        replacement: 'PEDIATRICS'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MD(ORTHOPEDICS)',
        correction: 'ORTHOPEDICS',
        description: 'Extract specialty from AIQ format MD(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MD(ORTHOPEDICS)', 'MD(ORTHOPEDICS)'],
        regex_pattern: 'MD\\(ORTHOPEDICS\\)',
        replacement: 'ORTHOPEDICS'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MD(OPHTHALMOLOGY)',
        correction: 'OPHTHALMOLOGY',
        description: 'Extract specialty from AIQ format MD(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MD(OPHTHALMOLOGY)', 'MD(OPHTHALMOLOGY)'],
        regex_pattern: 'MD\\(OPHTHALMOLOGY\\)',
        replacement: 'OPHTHALMOLOGY'
      },
      {
        category: 'program_name',
        error_type: 'format_error',
        pattern: 'MD(ENT)',
        correction: 'ENT',
        description: 'Extract specialty from AIQ format MD(SPECIALTY)',
        priority: 'high',
        context: 'AIQ PG 2024 format',
        examples: ['MD(ENT)', 'MD(ENT)'],
        regex_pattern: 'MD\\(ENT\\)',
        replacement: 'ENT'
      },
      
      // AIQ-Specific College Name Corrections
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'DR. RML',
        correction: 'DR. RML',
        description: 'Standardize DR. RML naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['DR. RML', 'DR RML', 'DR.RML'],
        regex_pattern: 'DR\\.?\\s*RML',
        replacement: 'DR. RML'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'RML HOSPITAL',
        correction: 'RML HOSPITAL',
        description: 'Standardize RML HOSPITAL naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['RML HOSPITAL', 'RML HOSPITAL,', 'RML HOSPITAL,,'],
        regex_pattern: 'RML HOSPITAL[,]*',
        replacement: 'RML HOSPITAL'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'ABVIMS',
        correction: 'ABVIMS',
        description: 'Standardize ABVIMS naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['ABVIMS', 'ABVIMS,', 'ABVIMS,,'],
        regex_pattern: 'ABVIMS[,]*',
        replacement: 'ABVIMS'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'BABA KHARAK SINGH',
        correction: 'BABA KHARAK SINGH',
        description: 'Standardize BABA KHARAK SINGH naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['BABA KHARAK', 'BABA KHARAK SINGH'],
        regex_pattern: 'BABA KHARAK(\\s+SINGH)?',
        replacement: 'BABA KHARAK SINGH'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'SAWAI MAN SINGH',
        correction: 'SAWAI MAN SINGH',
        description: 'Standardize SAWAI MAN SINGH naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['SAWAI MAN', 'SAWAI MAN SINGH'],
        regex_pattern: 'SAWAI MAN(\\s+SINGH)?',
        replacement: 'SAWAI MAN SINGH'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'VARDHMAN MAHAVIR',
        correction: 'VARDHMAN MAHAVIR',
        description: 'Standardize VARDHMAN MAHAVIR naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['VARDHMAN', 'VARDHMAN MAHAVIR'],
        regex_pattern: 'VARDHMAN(\\s+MAHAVIR)?',
        replacement: 'VARDHMAN MAHAVIR'
      },
      {
        category: 'college_name',
        error_type: 'format_error',
        pattern: 'MAULANA AZAD',
        correction: 'MAULANA AZAD',
        description: 'Standardize MAULANA AZAD naming',
        priority: 'medium',
        context: 'AIQ PG 2024 college names',
        examples: ['MAULANA AZAD', 'MAULANA AZAD'],
        regex_pattern: 'MAULANA AZAD',
        replacement: 'MAULANA AZAD'
      },
      
      // AIQ-Specific Location Corrections
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'TAMIL NADU',
        correction: 'TAMIL NADU',
        description: 'Standardize TAMIL NADU naming',
        priority: 'low',
        context: 'AIQ PG 2024 location standardization',
        examples: ['TAMIL NADU', 'TAMIL NADU,'],
        regex_pattern: 'TAMIL NADU[,]*',
        replacement: 'TAMIL NADU'
      },
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'RAJASTHAN',
        correction: 'RAJASTHAN',
        description: 'Standardize RAJASTHAN naming',
        priority: 'low',
        context: 'AIQ PG 2024 location standardization',
        examples: ['RAJASTHAN', 'RAJASTHAN,'],
        regex_pattern: 'RAJASTHAN[,]*',
        replacement: 'RAJASTHAN'
      },
      {
        category: 'location',
        error_type: 'format_error',
        pattern: 'GUJARAT',
        correction: 'GUJARAT',
        description: 'Standardize GUJARAT naming',
        priority: 'low',
        context: 'AIQ PG 2024 location standardization',
        examples: ['GUJARAT', 'GUJARAT,INDIA', 'GUJARAT,'],
        regex_pattern: 'GUJARAT(,INDIA)?[,]*',
        replacement: 'GUJARAT'
      },
      
      // AIQ-Specific Quota Corrections
      {
        category: 'quota',
        error_type: 'format_error',
        pattern: 'AIQ',
        correction: 'AIQ',
        description: 'Standardize AIQ quota naming',
        priority: 'low',
        context: 'AIQ PG 2024 quota standardization',
        examples: ['AIQ', 'aiq', 'Aiq', 'AIQ '],
        regex_pattern: '^aiq\\s*$',
        replacement: 'AIQ',
        flags: 'i'
      },
      
      // AIQ-Specific Category Corrections
      {
        category: 'category',
        error_type: 'format_error',
        pattern: 'OPEN',
        correction: 'OPEN',
        description: 'Standardize OPEN category naming',
        priority: 'low',
        context: 'AIQ PG 2024 category standardization',
        examples: ['OPEN', 'open', 'Open', 'OPEN '],
        regex_pattern: '^open\\s*$',
        replacement: 'OPEN',
        flags: 'i'
      },
      {
        category: 'category',
        error_type: 'format_error',
        pattern: 'SC',
        correction: 'SC',
        description: 'Standardize SC category naming',
        priority: 'low',
        context: 'AIQ PG 2024 category standardization',
        examples: ['SC', 'sc', 'Sc', 'SC '],
        regex_pattern: '^sc\\s*$',
        replacement: 'SC',
        flags: 'i'
      },
      {
        category: 'category',
        error_type: 'format_error',
        pattern: 'ST',
        correction: 'ST',
        description: 'Standardize ST category naming',
        priority: 'low',
        context: 'AIQ PG 2024 category standardization',
        examples: ['ST', 'st', 'St', 'ST '],
        regex_pattern: '^st\\s*$',
        replacement: 'ST',
        flags: 'i'
      },
      {
        category: 'category',
        error_type: 'format_error',
        pattern: 'OBC',
        correction: 'OBC',
        description: 'Standardize OBC category naming',
        priority: 'low',
        context: 'AIQ PG 2024 category standardization',
        examples: ['OBC', 'obc', 'Obc', 'OBC '],
        regex_pattern: '^obc\\s*$',
        replacement: 'OBC',
        flags: 'i'
      },
      {
        category: 'category',
        error_type: 'format_error',
        pattern: 'EWS',
        correction: 'EWS',
        description: 'Standardize EWS category naming',
        priority: 'low',
        context: 'AIQ PG 2024 category standardization',
        examples: ['EWS', 'ews', 'Ews', 'EWS '],
        regex_pattern: '^ews\\s*$',
        replacement: 'EWS',
        flags: 'i'
      }
    ];
  }

  /**
   * Initialize error correction database
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Create tables
        this.db.serialize(() => {
          // Error corrections table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS error_corrections (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              category TEXT NOT NULL,
              error_type TEXT NOT NULL,
              pattern TEXT NOT NULL,
              correction TEXT NOT NULL,
              description TEXT,
              priority TEXT DEFAULT 'medium',
              context TEXT,
              examples TEXT,
              regex_pattern TEXT,
              replacement TEXT,
              flags TEXT DEFAULT 'g',
              is_active BOOLEAN DEFAULT TRUE,
              usage_count INTEGER DEFAULT 0,
              success_count INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              created_by TEXT DEFAULT 'system',
              notes TEXT
            )
          `, (err) => {
            if (err) {
              console.error('Error creating error_corrections table:', err);
              reject(err);
              return;
            }
          });
          
          // Correction history table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS correction_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              correction_id INTEGER NOT NULL,
              original_value TEXT NOT NULL,
              corrected_value TEXT NOT NULL,
              source TEXT NOT NULL,
              success BOOLEAN DEFAULT TRUE,
              applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (correction_id) REFERENCES error_corrections (id)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating correction_history table:', err);
              reject(err);
              return;
            }
          });
          
          // Correction statistics table
          this.db.run(`
            CREATE TABLE IF NOT EXISTS correction_stats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              correction_id INTEGER NOT NULL,
              date DATE NOT NULL,
              usage_count INTEGER DEFAULT 0,
              success_count INTEGER DEFAULT 0,
              FOREIGN KEY (correction_id) REFERENCES error_corrections (id),
              UNIQUE(correction_id, date)
            )
          `, (err) => {
            if (err) {
              console.error('Error creating correction_stats table:', err);
              reject(err);
              return;
            }
            
            // All tables created successfully
            console.log('✅ All error correction tables created successfully');
            resolve();
          });
        });
      });
    });
  }

  /**
   * Load default corrections
   */
  async loadDefaultCorrections() {
    try {
      console.log('📚 Loading default error corrections...');
      
      for (const correction of this.defaultCorrections) {
        await this.addCorrection(correction);
      }
      
      console.log(`✅ Loaded ${this.defaultCorrections.length} default corrections`);
    } catch (error) {
      console.error('Error loading default corrections:', error);
    }
  }

  /**
   * Add new correction rule
   */
  async addCorrection(correctionData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO error_corrections (
          category, error_type, pattern, correction, description, priority,
          context, examples, regex_pattern, replacement, flags, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const examples = Array.isArray(correctionData.examples) 
        ? JSON.stringify(correctionData.examples) 
        : correctionData.examples;
      
      stmt.run([
        correctionData.category,
        correctionData.error_type,
        correctionData.pattern,
        correctionData.correction,
        correctionData.description,
        correctionData.priority,
        correctionData.context,
        examples,
        correctionData.regex_pattern,
        correctionData.replacement,
        correctionData.flags || 'g',
        correctionData.created_by || 'system'
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
   * Get all corrections
   */
  async getAllCorrections() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM error_corrections 
        ORDER BY priority DESC, category, pattern
      `, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Parse examples JSON
        rows.forEach(row => {
          if (row.examples) {
            try {
              row.examples = JSON.parse(row.examples);
            } catch (e) {
              row.examples = [row.examples];
            }
          }
        });
        
        resolve(rows);
      });
    });
  }

  /**
   * Get corrections by category
   */
  async getCorrectionsByCategory(category) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM error_corrections 
        WHERE category = ? AND is_active = TRUE
        ORDER BY priority DESC, pattern
      `, [category], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Parse examples JSON
        rows.forEach(row => {
          if (row.examples) {
            try {
              row.examples = JSON.parse(row.examples);
            } catch (e) {
              row.examples = [row.examples];
            }
          }
        });
        
        resolve(rows);
      });
    });
  }

  /**
   * Update correction rule
   */
  async updateCorrection(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'string' && value.includes('+')) {
          // Handle SQL expressions like 'usage_count + 1'
          fields.push(`${key} = ${value}`);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      values.push(id);
      
      const stmt = this.db.prepare(`
        UPDATE error_corrections 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(values, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      });
    });
  }

  /**
   * Delete correction rule
   */
  async deleteCorrection(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM error_corrections WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      });
    });
  }

  /**
   * Apply corrections to text
   */
  async applyCorrections(text, category = null) {
    try {
      if (!text || typeof text !== 'string') {
        return text;
      }
      
      let correctedText = text;
      const appliedCorrections = [];
      
      // Get relevant corrections
      const corrections = category 
        ? await this.getCorrectionsByCategory(category)
        : await this.getAllCorrections();
      
      // Apply each correction
      for (const correction of corrections) {
        if (!correction.is_active) continue;
        
        try {
          let flags = correction.flags || 'g';
          if (flags.includes('i')) flags = flags.replace('i', '') + 'i';
          
          const regex = new RegExp(correction.regex_pattern || correction.pattern, flags);
          
          if (regex.test(correctedText)) {
            const originalText = correctedText;
            correctedText = correctedText.replace(regex, correction.replacement);
            
            if (originalText !== correctedText) {
              appliedCorrections.push({
                correction_id: correction.id,
                original_value: originalText,
                corrected_value: correctedText,
                pattern: correction.pattern,
                replacement: correction.replacement
              });
              
              // Update usage statistics
              await this.recordCorrectionUsage(correction.id, true);
            }
          }
        } catch (error) {
          console.error(`Error applying correction ${correction.id}:`, error);
        }
      }
      
      return {
        original: text,
        corrected: correctedText,
        corrections: appliedCorrections
      };
      
    } catch (error) {
      console.error('Error applying corrections:', error);
      return { original: text, corrected: text, corrections: [] };
    }
  }

  /**
   * Record correction usage
   */
  async recordCorrectionUsage(correctionId, success = true) {
    try {
      // Update main usage count
      await this.updateCorrection(correctionId, {
        usage_count: 'usage_count + 1',
        success_count: 'success_count + 1'
      });
      
      // Record in history
      const stmt = this.db.prepare(`
        INSERT INTO correction_history (
          correction_id, original_value, corrected_value, source, success
        ) VALUES (?, ?, ?, ?, ?)
      `);
      
      await stmt.run([correctionId, '', '', 'system', success]);
      
    } catch (error) {
      console.error('Error recording correction usage:', error);
    }
  }

  /**
   * Get correction statistics
   */
  async getCorrectionStats() {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          COUNT(*) as total_corrections,
          SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_corrections,
          SUM(usage_count) as total_usage,
          SUM(success_count) as total_success,
          AVG(CASE WHEN usage_count > 0 THEN CAST(success_count AS FLOAT) / usage_count ELSE 0 END) as success_rate
        FROM error_corrections
      `, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stats);
      });
    });
  }

  /**
   * Search corrections
   */
  async searchCorrections(query) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM error_corrections 
        WHERE pattern LIKE ? OR correction LIKE ? OR description LIKE ?
        ORDER BY priority DESC, category, pattern
      `, [`%${query}%`, `%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Parse examples JSON
        rows.forEach(row => {
          if (row.examples) {
            try {
              row.examples = JSON.parse(row.examples);
            } catch (e) {
              row.examples = [row.examples];
            }
          }
        });
        
        resolve(rows);
      });
    });
  }

  /**
   * Test correction on sample text
   */
  async testCorrection(correctionId, sampleText) {
    try {
      const correction = await this.db.get(
        'SELECT * FROM error_corrections WHERE id = ?',
        [correctionId]
      );
      
      if (!correction) {
        throw new Error('Correction not found');
      }
      
      let flags = correction.flags || 'g';
      if (flags.includes('i')) flags = flags.replace('i', '') + 'i';
      
      const regex = new RegExp(correction.regex_pattern || correction.pattern, flags);
      const correctedText = sampleText.replace(regex, correction.replacement);
      
      return {
        original: sampleText,
        corrected: correctedText,
        pattern: correction.pattern,
        replacement: correction.replacement,
        regex: regex.toString(),
        changed: sampleText !== correctedText
      };
      
    } catch (error) {
      console.error('Error testing correction:', error);
      return null;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close(() => resolve());
      });
    }
  }
}

module.exports = ErrorCorrectionDictionary;
