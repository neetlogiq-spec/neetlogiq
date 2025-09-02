const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

class ReferenceDataAnalyzer {
  constructor() {
    this.referenceDataPath = '/Users/kashyapanand/Desktop/data/list';
    this.colleges = new Map();
    this.programs = new Map();
    this.quotas = new Map();
    this.categories = new Map();
    this.states = new Map();
  }

  /**
   * Load and analyze all reference data files
   */
  async loadReferenceData() {
    console.log('📚 Loading Reference Data Files...\n');
    
    try {
      // Load colleges data
      await this.loadCollegesData();
      
      // Load programs data
      await this.loadProgramsData();
      
      // Load quotas data
      await this.loadQuotasData();
      
      // Load categories data
      await this.loadCategoriesData();
      
      // Load states data
      await this.loadStatesData();
      
      console.log('✅ All reference data loaded successfully!\n');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Error loading reference data:', error);
      throw error;
    }
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
      // The data is in the first column, but the column name varies
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
        
        // Extract state and city from the name (they're often in the name)
        let state = '';
        let city = '';
        if (collegeName.includes(',')) {
          const parts = collegeName.split(',');
          city = parts[1]?.trim() || '';
          state = parts[2]?.trim() || '';
        }
        
        this.colleges.set(collegeName, {
          name: collegeName,
          type: collegeType,
          state: state,
          city: city,
          variations: this.generateCollegeVariations(collegeName)
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
      // Skip the header rows
      const programName = this.cleanProgramName(row['MEDICAL COURSES'] || '');
      const programType = this.cleanProgramName(row['MEDICAL COURSES_1'] || 'MEDICAL');
      
      // Skip rows that are headers or empty
      if (programName && 
          !programName.includes('COURSE NAME') && 
          !programName.includes('SUPER SPECIALITY COURSES') &&
          programName.trim().length > 0) {
        this.programs.set(programName, {
          name: programName,
          type: programType.toUpperCase(),
          variations: this.generateProgramVariations(programName)
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
   * Generate college name variations for fuzzy matching
   */
  generateCollegeVariations(collegeName) {
    const variations = [];
    const cleanName = this.cleanCollegeName(collegeName);
    
    // Add original name
    variations.push(cleanName);
    
    // Handle common abbreviations
    if (cleanName.includes('A.J.')) {
      variations.push(cleanName.replace('A.J.', 'A J'));
      variations.push(cleanName.replace('A.J.', 'AJ'));
    }
    
    if (cleanName.includes('A.B.')) {
      variations.push(cleanName.replace('A.B.', 'A B'));
      variations.push(cleanName.replace('A.B.', 'AB'));
    }
    
    if (cleanName.includes('D.A.')) {
      variations.push(cleanName.replace('D.A.', 'D A'));
      variations.push(cleanName.replace('D.A.', 'DA'));
    }
    
    if (cleanName.includes('M.S.')) {
      variations.push(cleanName.replace('M.S.', 'M S'));
      variations.push(cleanName.replace('M.S.', 'MS'));
    }
    
    // Handle common suffixes
    if (cleanName.includes('INSTITUTE')) {
      variations.push(cleanName.replace('INSTITUTE', 'INSTT'));
      variations.push(cleanName.replace('INSTITUTE', 'INST'));
    }
    
    if (cleanName.includes('COLLEGE')) {
      variations.push(cleanName.replace('COLLEGE', 'COL'));
    }
    
    if (cleanName.includes('UNIVERSITY')) {
      variations.push(cleanName.replace('UNIVERSITY', 'UNIV'));
    }
    
    // Handle common prefixes
    if (cleanName.includes('DR.')) {
      variations.push(cleanName.replace('DR.', 'DR'));
      variations.push(cleanName.replace('DR.', 'DOCTOR'));
    }
    
    if (cleanName.includes('SRI.')) {
      variations.push(cleanName.replace('SRI.', 'SRI'));
    }
    
    return variations;
  }

  /**
   * Generate program name variations for fuzzy matching
   */
  generateProgramVariations(programName) {
    const variations = [];
    const cleanName = this.cleanProgramName(programName);
    
    // Add original name
    variations.push(cleanName);
    
    // Handle common dental program variations
    if (cleanName.includes('ORTHODONTICS')) {
      variations.push(cleanName.replace('ORTHODONTICS', 'ORTHODONITICS'));
      variations.push(cleanName.replace('ORTHODONTICS', 'ORTHODONT'));
    }
    
    if (cleanName.includes('CONSERVATIVE')) {
      variations.push(cleanName.replace('CONSERVATIVE', 'CONSERVATIVE DENTISTRY'));
      variations.push(cleanName.replace('CONSERVATIVE', 'ENDODONTICS'));
    }
    
    if (cleanName.includes('ORAL MEDICINE')) {
      variations.push(cleanName.replace('ORAL MEDICINE', 'ORAL MEDICINE & RADIOLOGY'));
    }
    
    if (cleanName.includes('ORAL SURGERY')) {
      variations.push(cleanName.replace('ORAL SURGERY', 'ORAL AND MAXILLOFACIAL SURGERY'));
    }
    
    if (cleanName.includes('PERIODONTOLOGY')) {
      variations.push(cleanName.replace('PERIODONTOLOGY', 'PERIODONT'));
    }
    
    if (cleanName.includes('PROSTHODONTICS')) {
      variations.push(cleanName.replace('PROSTHODONTICS', 'PROSTHODONT'));
      variations.push(cleanName.replace('PROSTHODONTICS', 'CROWN & BRIDGE'));
    }
    
    if (cleanName.includes('PEDIATRIC')) {
      variations.push(cleanName.replace('PEDIATRIC', 'PAEDIATRIC'));
      variations.push(cleanName.replace('PEDIATRIC', 'PAEDODONTICS'));
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
   * Clean college name for matching
   */
  cleanCollegeName(name) {
    if (!name) return '';
    return name.toString()
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\-&]/g, '');
  }

  /**
   * Clean program name for matching
   */
  cleanProgramName(name) {
    if (!name) return '';
    return name.toString()
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\-&]/g, '');
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

  /**
   * Get college by name (with fuzzy matching)
   */
  getCollege(collegeName) {
    const cleanName = this.cleanCollegeName(collegeName);
    
    // Try exact match first
    if (this.colleges.has(cleanName)) {
      return this.colleges.get(cleanName);
    }
    
    // Try variations
    for (const [key, college] of this.colleges) {
      if (college.variations.includes(cleanName)) {
        return college;
      }
    }
    
    // Try fuzzy matching
    for (const [key, college] of this.colleges) {
      if (this.isSimilar(cleanName, key)) {
        return college;
      }
    }
    
    return null;
  }

  /**
   * Get program by name (with fuzzy matching)
   */
  getProgram(programName) {
    const cleanName = this.cleanProgramName(programName);
    
    // Try exact match first
    if (this.programs.has(cleanName)) {
      return this.programs.get(cleanName);
    }
    
    // Try variations
    for (const [key, program] of this.programs) {
      if (program.variations.includes(cleanName)) {
        return program;
      }
    }
    
    // Try fuzzy matching
    for (const [key, program] of this.programs) {
      if (this.isSimilar(cleanName, key)) {
        return program;
      }
    }
    
    return null;
  }

  /**
   * Check if two strings are similar (fuzzy matching)
   */
  isSimilar(str1, str2) {
    if (!str1 || !str2) return false;
    
    const words1 = str1.split(' ').filter(w => w.length > 2);
    const words2 = str2.split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    let commonWords = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          commonWords++;
          break;
        }
      }
    }
    
    const similarity = commonWords / Math.max(words1.length, words2.length);
    return similarity >= 0.7; // 70%+ similarity required
  }

  /**
   * Validate cutoff data against reference data
   */
  validateCutoffData(cutoffData) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate college
    const college = this.getCollege(cutoffData.college_name);
    if (!college) {
      validation.isValid = false;
      validation.errors.push(`College not found: ${cutoffData.college_name}`);
    } else {
      validation.suggestions.push(`College matched: ${college.name} (${college.type})`);
    }

    // Validate program (if college found)
    if (college) {
      const program = this.getProgram(cutoffData.course_name);
      if (!program) {
        validation.warnings.push(`Program not found: ${cutoffData.course_name}`);
      } else {
        validation.suggestions.push(`Program matched: ${program.name} (${program.type})`);
      }
    }

    // Validate quota
    const quota = this.quotas.get(cutoffData.quota?.toUpperCase());
    if (!quota) {
      validation.warnings.push(`Quota not found: ${cutoffData.quota}`);
    }

    return validation;
  }
}

module.exports = ReferenceDataAnalyzer;
