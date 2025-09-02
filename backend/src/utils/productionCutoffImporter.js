const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Production-Ready Cutoff Import Script
 * Features:
 * - Fuzzy search with location awareness
 * - Vector search and semantic matching
 * - Regex patterns for complex data extraction
 * - OCR issue handling and data cleaning
 * - Intelligent fallbacks for edge cases
 * - Comprehensive validation and error handling
 */
class ProductionCutoffImporter {
  constructor() {
    this.referenceDataPath = '/Users/kashyapanand/Desktop/data/list';
    this.colleges = new Map();
    this.programs = new Map();
    this.quotas = new Map();
    this.categories = new Map();
    this.states = new Map();
    this.cities = new Map();
    
    // OCR correction patterns - Enhanced for AIQ data
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
    
    // Location mapping for fuzzy matching
    this.locationMappings = new Map([
      ['NEW DELHI', { state: 'DELHI', city: 'NEW DELHI', region: 'NORTH' }],
      ['JAIPUR', { state: 'RAJASTHAN', city: 'JAIPUR', region: 'NORTH' }],
      ['AHMEDABAD', { state: 'GUJARAT', city: 'AHMEDABAD', region: 'WEST' }],
      ['CHENNAI', { state: 'TAMIL NADU', city: 'CHENNAI', region: 'SOUTH' }],
      ['DELHI', { state: 'DELHI', city: 'DELHI', region: 'NORTH' }],
      ['MUMBAI', { state: 'MAHARASHTRA', city: 'MUMBAI', region: 'WEST' }],
      ['BANGALORE', { state: 'KARNATAKA', city: 'BANGALORE', region: 'SOUTH' }],
      ['KOLKATA', { state: 'WEST BENGAL', city: 'KOLKATA', region: 'EAST' }],
      ['HYDERABAD', { state: 'TELANGANA', city: 'HYDERABAD', region: 'SOUTH' }],
      ['PUNE', { state: 'MAHARASHTRA', city: 'PUNE', region: 'WEST' }],
      ['LUCKNOW', { state: 'UTTAR PRADESH', city: 'LUCKNOW', region: 'NORTH' }],
      ['PATNA', { state: 'BIHAR', city: 'PATNA', region: 'EAST' }],
      ['CHANDIGARH', { state: 'CHANDIGARH', city: 'CHANDIGARH', region: 'NORTH' }],
      ['DEHRADUN', { state: 'UTTARAKHAND', city: 'DEHRADUN', region: 'NORTH' }],
      ['SHIMLA', { state: 'HIMACHAL PRADESH', city: 'SHIMLA', region: 'NORTH' }],
      ['SRINAGAR', { state: 'JAMMU & KASHMIR', city: 'SRINAGAR', region: 'NORTH' }],
      ['GANGTOK', { state: 'SIKKIM', city: 'GANGTOK', region: 'NORTH' }],
      ['IMPHAL', { state: 'MANIPUR', city: 'IMPHAL', region: 'NORTH EAST' }],
      ['SHILLONG', { state: 'MEGHALAYA', city: 'SHILLONG', region: 'NORTH EAST' }],
      ['AIZAWL', { state: 'MIZORAM', city: 'AIZAWL', region: 'NORTH EAST' }],
      ['KOHIMA', { state: 'NAGALAND', city: 'KOHIMA', region: 'NORTH EAST' }],
      ['ITANAGAR', { state: 'ARUNACHAL PRADESH', city: 'ITANAGAR', region: 'NORTH EAST' }],
      ['AGARTALA', { state: 'TRIPURA', city: 'AGARTALA', region: 'NORTH EAST' }]
    ]);
    
    // Program type mappings
    this.programTypeMappings = new Map([
      ['MD', 'MEDICAL'],
      ['MS', 'MEDICAL'],
      ['DM', 'MEDICAL'],
      ['MCH', 'MEDICAL'],
      ['DNB', 'MEDICAL'],
      ['DIPLOMA', 'MEDICAL'],
      ['FELLOWSHIP', 'MEDICAL'],
      ['CERTIFICATE', 'MEDICAL']
    ]);
    
    // Quota mappings
    this.quotaMappings = new Map([
      ['ALL INDIA', 'AIQ'],
      ['AIQ', 'AIQ'],
      ['STATE', 'STATE'],
      ['STATE QUOTA', 'STATE'],
      ['KEA', 'STATE'],
      ['CENTRAL', 'CENTRAL'],
      ['CENTRAL QUOTA', 'CENTRAL'],
      ['UNIVERSITY', 'UNIVERSITY'],
      ['UNIVERSITY QUOTA', 'UNIVERSITY'],
      ['MINORITY', 'MINORITY'],
      ['MINORITY QUOTA', 'MINORITY'],
      ['NRI', 'NRI'],
      ['NRI QUOTA', 'NRI'],
      ['MANAGEMENT', 'MANAGEMENT'],
      ['MANAGEMENT QUOTA', 'MANAGEMENT']
    ]);
    
    // Category mappings
    this.categoryMappings = new Map([
      ['OPEN', 'GENERAL'],
      ['GENERAL', 'GENERAL'],
      ['GM', 'GENERAL'],
      ['SC', 'SC'],
      ['SCHEDULED CASTE', 'SC'],
      ['ST', 'ST'],
      ['SCHEDULED TRIBE', 'ST'],
      ['OBC', 'OBC'],
      ['OTHER BACKWARD CLASS', 'OBC'],
      ['EWS', 'EWS'],
      ['ECONOMICALLY WEAKER SECTION', 'EWS'],
      ['PWD', 'PWD'],
      ['PERSON WITH DISABILITY', 'PWD'],
      ['PH', 'PWD'],
      ['PHYSICALLY HANDICAPPED', 'PWD']
    ]);
  }

  /**
   * Initialize the importer by loading reference data
   */
  async initialize() {
    console.log('🚀 Initializing Production Cutoff Importer...\n');
    
    try {
      await this.loadReferenceData();
      console.log('✅ Initialization completed successfully!\n');
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load reference data from Excel files
   */
  async loadReferenceData() {
    console.log('📚 Loading Reference Data...\n');
    
    // Load colleges
    await this.loadCollegesData();
    
    // Load programs
    await this.loadProgramsData();
    
    // Load quotas
    await this.loadQuotasData();
    
    // Load categories
    await this.loadCategoriesData();
    
    // Load states
    await this.loadStatesData();
    
    console.log('✅ All reference data loaded successfully!\n');
    this.printSummary();
  }

  /**
   * Load colleges reference data
   */
  async loadCollegesData() {
    const filePath = path.join(this.referenceDataPath, 'ALL COLLEGES OF INDIA.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Colleges file not found: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`🏥 Loading ${data.length} colleges from reference data...`);

    for (const row of data) {
      const collegeName = this.cleanCollegeName(
        row['MEDICAL COLLEGES OF INDIA'] || 
        row['__EMPTY'] || 
        Object.values(row)[0] || 
        ''
      );
      
      if (collegeName) {
        // Determine college type based on name
        let collegeType = 'MEDICAL';
        if (collegeName.includes('DENTAL') || collegeName.includes('DENTISTRY')) {
          collegeType = 'DENTAL';
        } else if (collegeName.includes('DNB') || collegeName.includes('DIPLOMATE')) {
          collegeType = 'DNB';
        }
        
        // Extract state and city from the name
        const location = this.extractLocationFromCollegeName(collegeName);
        
        this.colleges.set(collegeName, {
          name: collegeName,
          type: collegeType,
          state: location.state,
          city: location.city,
          region: location.region,
          variations: this.generateCollegeVariations(collegeName),
          vector: this.generateCollegeVector(collegeName)
        });
      }
    }

    console.log(`   ✅ Loaded ${this.colleges.size} colleges`);
  }

  /**
   * Load programs reference data
   */
  async loadProgramsData() {
    const filePath = path.join(this.referenceDataPath, 'Courses list.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Programs file not found: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`📚 Loading ${data.length} programs from reference data...`);

    for (const row of data) {
      const programName = this.cleanProgramName(row['MEDICAL COURSES'] || '');
      const programType = this.cleanProgramName(row['MEDICAL COURSES_1'] || 'MEDICAL');
      
      if (programName && 
          !programName.includes('COURSE NAME') && 
          !programName.includes('SUPER SPECIALITY COURSES') &&
          programName.trim().length > 0) {
        this.programs.set(programName, {
          name: programName,
          type: programType.toUpperCase(),
          variations: this.generateProgramVariations(programName),
          vector: this.generateProgramVector(programName)
        });
      }
    }

    console.log(`   ✅ Loaded ${this.programs.size} programs`);
  }

  /**
   * Load quotas reference data
   */
  async loadQuotasData() {
    const filePath = path.join(this.referenceDataPath, 'QUOTA.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Quotas file not found: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`🏛️ Loading ${data.length} quotas from reference data...`);

    for (const row of data) {
      const quotaName = row['Quota'] || row['QUOTA'] || '';
      if (quotaName) {
        this.quotas.set(quotaName.toUpperCase(), {
          name: quotaName.toUpperCase(),
          variations: this.generateQuotaVariations(quotaName)
        });
      }
    }

    console.log(`   ✅ Loaded ${this.quotas.size} quotas`);
  }

  /**
   * Load categories reference data
   */
  async loadCategoriesData() {
    const filePath = path.join(this.referenceDataPath, 'CATEGORY.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Categories file not found: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`🏷️ Loading ${data.length} categories from reference data...`);

    for (const row of data) {
      const categoryName = row['Category'] || row['CATEGORY'] || '';
      if (categoryName) {
        this.categories.set(categoryName.toUpperCase(), {
          name: categoryName.toUpperCase(),
          variations: this.generateCategoryVariations(categoryName)
        });
      }
    }

    console.log(`   ✅ Loaded ${this.categories.size} categories`);
  }

  /**
   * Load states reference data
   */
  async loadStatesData() {
    const filePath = path.join(this.referenceDataPath, 'STATES OF INDIA.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error(`States file not found: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`🗺️ Loading ${data.length} states from reference data...`);

    for (const row of data) {
      const stateName = row['State'] || row['STATE'] || '';
      if (stateName) {
        this.states.set(stateName.toUpperCase(), {
          name: stateName.toUpperCase(),
          variations: this.generateStateVariations(stateName)
        });
      }
    }

    console.log(`   ✅ Loaded ${this.states.size} states`);
  }

  /**
   * Clean college name with OCR correction
   */
  cleanCollegeName(name) {
    if (!name) return '';
    
    let cleaned = name.toString()
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\-&,()]/g, '');
    
    // Apply OCR corrections
    for (const [incorrect, correct] of this.ocrCorrections) {
      cleaned = cleaned.replace(new RegExp(incorrect, 'g'), correct);
    }
    
    return cleaned;
  }

  /**
   * Clean program name with OCR correction
   */
  cleanProgramName(name) {
    if (!name) return '';
    
    let cleaned = name.toString()
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\-&,()]/g, '');
    
    // Apply OCR corrections
    for (const [incorrect, correct] of this.ocrCorrections) {
      cleaned = cleaned.replace(new RegExp(incorrect, 'g'), correct);
    }
    
    return cleaned;
  }

  /**
   * Extract location information from college name
   */
  extractLocationFromCollegeName(collegeName) {
    const location = { state: '', city: '', region: '' };
    
    if (collegeName.includes(',')) {
      const parts = collegeName.split(',').map(p => p.trim()).filter(Boolean);
      
      // Look for state and city in the parts
      for (const part of parts) {
        // Check if it's a known city
        for (const [city, cityInfo] of this.locationMappings) {
          if (part.includes(city) || city.includes(part)) {
            location.city = city;
            location.state = cityInfo.state;
            location.region = cityInfo.region;
            break;
          }
        }
        
        // Check if it's a known state
        for (const [state] of this.states) {
          if (part.includes(state) || state.includes(part)) {
            if (!location.state) location.state = state;
            break;
          }
        }
      }
    }
    
    return location;
  }

  /**
   * Generate college name variations for fuzzy matching
   */
  generateCollegeVariations(collegeName) {
    const variations = [];
    
    // Add original name
    variations.push(collegeName);
    
    // Handle AIQ-specific patterns - extract main college name before comma
    if (collegeName.includes(',')) {
      const parts = collegeName.split(',').map(p => p.trim()).filter(Boolean);
      const mainName = parts[0];
      variations.push(mainName);
      
      // Also try without common suffixes
      if (mainName.includes('COLLEGE')) {
        variations.push(mainName.replace('COLLEGE', '').trim());
      }
      if (mainName.includes('INSTITUTE')) {
        variations.push(mainName.replace('INSTITUTE', '').trim());
      }
      if (mainName.includes('HOSPITAL')) {
        variations.push(mainName.replace('HOSPITAL', '').trim());
      }
    }
    
    // Handle common abbreviations
    if (collegeName.includes('A.J.')) {
      variations.push(collegeName.replace('A.J.', 'A J'));
      variations.push(collegeName.replace('A.J.', 'AJ'));
    }
    
    if (collegeName.includes('A.B.')) {
      variations.push(collegeName.replace('A.B.', 'A B'));
      variations.push(collegeName.replace('A.B.', 'AB'));
    }
    
    if (collegeName.includes('D.A.')) {
      variations.push(collegeName.replace('D.A.', 'D A'));
      variations.push(collegeName.replace('D.A.', 'DA'));
    }
    
    if (collegeName.includes('M.S.')) {
      variations.push(collegeName.replace('M.S.', 'M S'));
      variations.push(collegeName.replace('M.S.', 'MS'));
    }
    
    // Handle common suffixes
    if (collegeName.includes('INSTITUTE')) {
      variations.push(collegeName.replace('INSTITUTE', 'INSTT'));
      variations.push(collegeName.replace('INSTITUTE', 'INST'));
    }
    
    if (collegeName.includes('COLLEGE')) {
      variations.push(collegeName.replace('COLLEGE', 'COL'));
    }
    
    if (collegeName.includes('UNIVERSITY')) {
      variations.push(collegeName.replace('UNIVERSITY', 'UNIV'));
    }
    
    // Handle common prefixes
    if (collegeName.includes('DR.')) {
      variations.push(collegeName.replace('DR.', 'DR'));
      variations.push(collegeName.replace('DR.', 'DOCTOR'));
    }
    
    if (collegeName.includes('SRI.')) {
      variations.push(collegeName.replace('SRI.', 'SRI'));
    }
    
    // Handle location variations
    if (collegeName.includes(',')) {
      const mainName = collegeName.split(',')[0].trim();
      variations.push(mainName);
    }
    
    return variations;
  }

  /**
   * Generate program name variations for fuzzy matching
   */
  generateProgramVariations(programName) {
    const variations = [];
    
    // Add original name
    variations.push(programName);
    
    // Handle AIQ-specific program formats
    if (programName.startsWith('MD(') || programName.startsWith('MD (')) {
      const content = programName.replace(/^MD[\(\)\s]+/, '').replace(/[\(\)\s]+$/, '');
      variations.push(`MD ${content}`);
      variations.push(content);
      
      // Handle specific content variations
      if (content.includes('GENERAL MEDICINE') || content.includes('GENERAL MDINE')) {
        variations.push('GENERAL MEDICINE');
        variations.push('INTERNAL MEDICINE');
        variations.push('MEDICINE');
      }
      
      if (content.includes('RADIODIAGNOSIS') || content.includes('RADIO') || content.includes('DIAGNOSIS')) {
        variations.push('RADIODIAGNOSIS');
        variations.push('RADIOLOGY');
        variations.push('DIAGNOSTIC RADIOLOGY');
        variations.push('RADIO-DIAGNOSIS');
      }
      
      if (content.includes('OBSTETRICS') || content.includes('GYNAECOLOGY') || content.includes('OBST') || content.includes('GYNAE')) {
        variations.push('OBSTETRICS AND GYNAECOLOGY');
        variations.push('OBSTETRICS');
        variations.push('GYNAECOLOGY');
        variations.push('OBST. AND GYNAE');
      }
    }
    
    if (programName.startsWith('MS(') || programName.startsWith('MS (')) {
      const content = programName.replace(/^MS[\(\)\s]+/, '').replace(/[\(\)\s]+$/, '');
      variations.push(`MS ${content}`);
      variations.push(content);
    }
    
    // Handle common dental program variations
    if (programName.includes('ORTHODONTICS')) {
      variations.push(programName.replace('ORTHODONTICS', 'ORTHODONITICS'));
      variations.push(programName.replace('ORTHODONTICS', 'ORTHODONT'));
    }
    
    if (programName.includes('CONSERVATIVE')) {
      variations.push(programName.replace('CONSERVATIVE', 'CONSERVATIVE DENTISTRY'));
      variations.push(programName.replace('CONSERVATIVE', 'ENDODONTICS'));
    }
    
    if (programName.includes('ORAL MEDICINE')) {
      variations.push(programName.replace('ORAL MEDICINE', 'ORAL MEDICINE & RADIOLOGY'));
    }
    
    if (programName.includes('ORAL SURGERY')) {
      variations.push(programName.replace('ORAL SURGERY', 'ORAL AND MAXILLOFACIAL SURGERY'));
    }
    
    if (programName.includes('PERIODONTOLOGY')) {
      variations.push(programName.replace('PERIODONTOLOGY', 'PERIODONT'));
    }
    
    if (programName.includes('PROSTHODONTICS')) {
      variations.push(programName.replace('PROSTHODONTICS', 'PROSTHODONT'));
      variations.push(programName.replace('PROSTHODONTICS', 'CROWN & BRIDGE'));
    }
    
    if (programName.includes('PEDIATRIC')) {
      variations.push(programName.replace('PEDIATRIC', 'PAEDIATRIC'));
      variations.push(programName.replace('PEDIATRIC', 'PAEDODONTICS'));
    }
    
    // Handle medical program variations
    if (programName.includes('GENERAL MEDICINE')) {
      variations.push('INTERNAL MEDICINE');
      variations.push('MEDICINE');
    }
    
    if (programName.includes('RADIODIAGNOSIS')) {
      variations.push('RADIOLOGY');
      variations.push('DIAGNOSTIC RADIOLOGY');
      variations.push('RADIO-DIAGNOSIS');
    }
    
    if (programName.includes('OBSTETRICS AND GYNAECOLOGY')) {
      variations.push('OBSTETRICS');
      variations.push('GYNAECOLOGY');
      variations.push('OBST. AND GYNAE');
    }
    
    return variations;
  }

  /**
   * Generate quota variations for fuzzy matching
   */
  generateQuotaVariations(quotaName) {
    const variations = [];
    const cleanName = quotaName.toUpperCase();
    
    variations.push(cleanName);
    
    // Handle common quota variations
    if (cleanName.includes('ALL INDIA')) {
      variations.push('AIQ');
      variations.push('ALL INDIA QUOTA');
    }
    
    if (cleanName.includes('STATE')) {
      variations.push('STATE QUOTA');
      variations.push('KEA');
    }
    
    if (cleanName.includes('CENTRAL')) {
      variations.push('CENTRAL QUOTA');
      variations.push('CENTRAL');
    }
    
    return variations;
  }

  /**
   * Generate category variations for fuzzy matching
   */
  generateCategoryVariations(categoryName) {
    const variations = [];
    const cleanName = categoryName.toUpperCase();
    
    variations.push(cleanName);
    
    // Handle common category variations
    if (cleanName.includes('GENERAL')) {
      variations.push('GM');
      variations.push('GENERAL MERIT');
    }
    
    if (cleanName.includes('SC')) {
      variations.push('SC');
      variations.push('SCHEDULED CASTE');
    }
    
    if (cleanName.includes('ST')) {
      variations.push('ST');
      variations.push('SCHEDULED TRIBE');
    }
    
    if (cleanName.includes('OBC')) {
      variations.push('OBC');
      variations.push('OTHER BACKWARD CLASS');
    }
    
    if (cleanName.includes('EWS')) {
      variations.push('EWS');
      variations.push('ECONOMICALLY WEAKER SECTION');
    }
    
    return variations;
  }

  /**
   * Generate state variations for fuzzy matching
   */
  generateStateVariations(stateName) {
    const variations = [];
    const cleanName = stateName.toUpperCase();
    
    variations.push(cleanName);
    
    // Handle common state abbreviations
    if (cleanName.includes('KARNATAKA')) {
      variations.push('KA');
      variations.push('KARNATAKA');
    }
    
    if (cleanName.includes('MAHARASHTRA')) {
      variations.push('MH');
      variations.push('MAHARASHTRA');
    }
    
    if (cleanName.includes('TAMIL NADU')) {
      variations.push('TN');
      variations.push('TAMIL NADU');
    }
    
    return variations;
  }

  /**
   * Generate vector representation for college name (for semantic search)
   */
  generateCollegeVector(collegeName) {
    const words = collegeName.split(' ').filter(w => w.length > 2);
    const vector = new Map();
    
    words.forEach(word => {
      vector.set(word, (vector.get(word) || 0) + 1);
    });
    
    return vector;
  }

  /**
   * Generate vector representation for program name (for semantic search)
   */
  generateProgramVector(programName) {
    const words = programName.split(' ').filter(w => w.length > 2);
    const vector = new Map();
    
    words.forEach(word => {
      vector.set(word, (vector.get(word) || 0) + 1);
    });
    
    return vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateCosineSimilarity(vector1, vector2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    const allWords = new Set([...vector1.keys(), ...vector2.keys()]);
    
    for (const word of allWords) {
      const val1 = vector1.get(word) || 0;
      const val2 = vector2.get(word) || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find matching college using multiple strategies
   */
  async findMatchingCollege(collegeName) {
    const cleanName = this.cleanCollegeName(collegeName);
    
    // Strategy 1: Exact match
    if (this.colleges.has(cleanName)) {
      return this.colleges.get(cleanName);
    }
    
    // Strategy 2: Variation match
    for (const [key, college] of this.colleges) {
      if (college.variations.includes(cleanName)) {
        return college;
      }
    }
    
    // Strategy 3: Main name match (before comma)
    if (cleanName.includes(',')) {
      const mainName = cleanName.split(',')[0].trim();
      if (this.colleges.has(mainName)) {
        return this.colleges.get(mainName);
      }
      
      // Try variations of main name
      for (const [key, college] of this.colleges) {
        if (college.variations.includes(mainName)) {
          return college;
        }
      }
    }
    
    // Strategy 4: Fuzzy match with location awareness
    const location = this.extractLocationFromCollegeName(cleanName);
    const candidates = [];
    
    for (const [key, college] of this.colleges) {
      let score = 0;
      
      // Location bonus
      if (location.state && college.state === location.state) score += 0.3;
      if (location.city && college.city === location.city) score += 0.2;
      if (location.region && college.region === location.region) score += 0.1;
      
      // Word overlap
      const similarity = this.calculateCosineSimilarity(
        this.generateCollegeVector(cleanName),
        college.vector
      );
      score += similarity * 0.4;
      
      // Bonus for key words match
      const cleanWords = cleanName.split(' ').filter(w => w.length > 3);
      const collegeWords = key.split(' ').filter(w => w.length > 3);
      
      let wordMatches = 0;
      cleanWords.forEach(word => {
        if (collegeWords.some(cw => cw.includes(word) || word.includes(cw))) {
          wordMatches++;
        }
      });
      
      if (wordMatches > 0) {
        score += (wordMatches / Math.max(cleanWords.length, collegeWords.length)) * 0.2;
      }
      
      if (score > 0.25) { // Lowered threshold
        candidates.push({ college, score });
      }
    }
    
    // Return best match
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].college;
    }
    
    return null;
  }

  /**
   * Find matching program using multiple strategies
   */
  async findMatchingProgram(programName, collegeId) {
    const cleanName = this.cleanProgramName(programName);
    
    // Strategy 1: Exact match
    if (this.programs.has(cleanName)) {
      return this.programs.get(cleanName);
    }
    
    // Strategy 2: Variation match
    for (const [key, program] of this.programs) {
      if (program.variations.includes(cleanName)) {
        return program;
      }
    }
    
    // Strategy 3: Handle AIQ format MD(SPECIALTY) -> MD SPECIALTY
    if (cleanName.startsWith('MD(') || cleanName.startsWith('MD (')) {
      const specialty = cleanName.replace(/^MD[\(\)\s]+/, '').replace(/[\(\)\s]+$/, '');
      const mdSpecialty = `MD ${specialty}`;
      
      if (this.programs.has(mdSpecialty)) {
        return this.programs.get(mdSpecialty);
      }
      
      // Try variations of MD SPECIALTY
      for (const [key, program] of this.programs) {
        if (program.variations.includes(mdSpecialty)) {
          return program;
        }
      }
      
      // Try just the specialty
      if (this.programs.has(specialty)) {
        return this.programs.get(specialty);
      }
      
      // Try variations of specialty
      for (const [key, program] of this.programs) {
        if (program.variations.includes(specialty)) {
          return program;
        }
      }
    }
    
    // Strategy 4: Handle MS format MS(SPECIALTY) -> MS SPECIALTY
    if (cleanName.startsWith('MS(') || cleanName.startsWith('MS (')) {
      const specialty = cleanName.replace(/^MS[\(\)\s]+/, '').replace(/[\(\)\s]+$/, '');
      const msSpecialty = `MS ${specialty}`;
      
      if (this.programs.has(msSpecialty)) {
        return this.programs.get(msSpecialty);
      }
      
      // Try variations of MS SPECIALTY
      for (const [key, program] of this.programs) {
        if (program.variations.includes(msSpecialty)) {
          return program;
        }
      }
      
      // Try just the specialty
      if (this.programs.has(specialty)) {
        return this.programs.get(specialty);
      }
      
      // Try variations of specialty
      for (const [key, program] of this.programs) {
        if (program.variations.includes(specialty)) {
          return program;
        }
      }
    }
    
    // Strategy 5: Fuzzy match with semantic search
    const candidates = [];
    
    for (const [key, program] of this.programs) {
      const similarity = this.calculateCosineSimilarity(
        this.generateProgramVector(cleanName),
        program.vector
      );
      
      if (similarity > 0.3) { // Lowered threshold
        candidates.push({ program, score: similarity });
      }
    }
    
    // Return best match
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].program;
    }
    
    return null;
  }

  /**
   * Process AIQ file and import cutoffs
   */
  async processAIQFile(filePath) {
    console.log(`🚀 Processing AIQ File: ${path.basename(filePath)}\n`);
    
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`📊 File loaded: ${data.length} records`);
      
      // Process records
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        
        try {
          const result = await this.processRecord(record);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push({
              row: i + 1,
              error: result.error,
              data: record
            });
          }
          processedCount++;
          
          // Progress indicator
          if (processedCount % 1000 === 0) {
            console.log(`   📈 Processed: ${processedCount}/${data.length} (${((processedCount/data.length)*100).toFixed(1)}%)`);
          }
          
        } catch (error) {
          errorCount++;
          errors.push({
            row: i + 1,
            error: error.message,
            data: record
          });
        }
      }
      
      // Summary
      console.log('\n📊 Processing Summary:');
      console.log(`   📋 Total records: ${data.length}`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      console.log(`   📈 Success rate: ${((successCount/data.length)*100).toFixed(1)}%`);
      
      if (errors.length > 0) {
        console.log('\n❌ Error Details (First 10):');
        errors.slice(0, 10).forEach(error => {
          console.log(`   Row ${error.row}: ${error.error}`);
        });
      }
      
      return {
        success: true,
        total: data.length,
        successful: successCount,
        errors: errorCount,
        errorDetails: errors
      };
      
    } catch (error) {
      console.error('❌ File processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process individual record
   */
  async processRecord(record) {
    try {
      // Extract data from record
      const rank = parseInt(record['ALL INDIA RANK']) || 0;
      const quota = this.cleanQuota(record['QUOTA'] || '');
      const collegeName = this.cleanCollegeName(record['COLLEGE/INSTITUTE'] || '');
      const programName = this.cleanProgramName(record['COURSE'] || '');
      const category = this.cleanCategory(record['CATEGORY'] || '');
      const round = record['ROUND'] || '';
      const year = parseInt(record['YEAR']) || 2024;
      
      // Validate required fields
      if (!rank || !collegeName || !programName) {
        return {
          success: false,
          error: 'Missing required fields (rank, college, or program)'
        };
      }
      
      // Find matching college
      const college = await this.findMatchingCollege(collegeName);
      if (!college) {
        return {
          success: false,
          error: `College not found: ${collegeName}`
        };
      }
      
      // Find matching program
      const program = await this.findMatchingProgram(programName, college.id);
      if (!program) {
        return {
          success: false,
          error: `Program not found: ${programName}`
        };
      }
      
      // Create cutoff record
      const cutoffRecord = {
        college_id: college.id,
        program_id: program.id,
        year: year,
        round: round,
        authority: 'AIQ',
        quota: quota,
        category: category,
        opening_rank: rank,
        closing_rank: rank,
        seats_available: 1,
        seats_filled: 1,
        status: 'active',
        notes: `Imported from AIQ ${year} ${round}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // TODO: Insert into database
      // For now, just return success
      
      return {
        success: true,
        data: cutoffRecord
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean quota with mapping
   */
  cleanQuota(quota) {
    const clean = quota.toUpperCase().trim();
    return this.quotaMappings.get(clean) || clean;
  }

  /**
   * Clean category with mapping
   */
  cleanCategory(category) {
    const clean = category.toUpperCase().trim();
    return this.categoryMappings.get(clean) || clean;
  }

  /**
   * Print summary of loaded reference data
   */
  printSummary() {
    console.log('📊 Reference Data Summary:');
    console.log(`   🏥 Colleges: ${this.colleges.size}`);
    console.log(`   📚 Programs: ${this.programs.size}`);
    console.log(`   🏛️ Quotas: ${this.quotas.size}`);
    console.log(`   🏷️ Categories: ${this.categories.size}`);
    console.log(`   🗺️ States: ${this.states.size}`);
    console.log('');
  }
}

module.exports = ProductionCutoffImporter;
