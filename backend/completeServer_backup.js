const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer'); // Added multer for file uploads
const csv = require('csv-parser'); // For CSV parsing
const xlsx = require('xlsx'); // For Excel parsing

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check both mimetype and file extension
    const allowedMimeTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Advanced CSV/Excel parsing function
function parseFile(filePath, fileType) {
  return new Promise((resolve, reject) => {
    try {
      if (fileType === 'csv') {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      } else if (fileType === 'excel') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const results = xlsx.utils.sheet_to_json(worksheet);
        resolve(results);
      } else {
        reject(new Error('Unsupported file type'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Advanced search and error correction functions
function calculateLevenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function calculateSimilarity(str1, str2) {
  const distance = calculateLevenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
}

function phoneticMatch(str1, str2) {
  // Simple phonetic matching (can be enhanced with libraries like metaphone)
  const normalize = (str) => str.toLowerCase()
    .replace(/[aeiou]/g, '')
    .replace(/[bcdfghjklmnpqrstvwxyz]/g, (match, index) => {
      const consonants = 'bcdfghjklmnpqrstvwxyz';
      const nextChar = str[index + 1];
      if (nextChar && consonants.includes(nextChar.toLowerCase())) {
        return match + 'a';
      }
      return match;
    });
  
  return normalize(str1) === normalize(str2);
}

function wildcardMatch(pattern, text) {
  const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
  return regex.test(text);
}

function regexMatch(pattern, text) {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  } catch (error) {
    return false;
  }
}

// College search with advanced matching
function searchColleges(query, limit = 10) {
  // Load colleges from your existing database or file
  const colleges = [
    // These will be loaded from your actual college database
    'AIIMS Delhi', 'JIPMER Puducherry', 'KGMU Lucknow', 'BHU Varanasi',
    'AMU Aligarh', 'JNU New Delhi', 'DU Delhi', 'BITS Pilani',
    'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur',
    'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad'
  ];
  
  // TODO: Load from your actual college database
  // const colleges = loadCollegesFromDatabase();
  
  const results = [];
  
  for (const college of colleges) {
    let score = 0;
    let matchType = '';
    
    // Exact match
    if (college.toLowerCase() === query.toLowerCase()) {
      score = 100;
      matchType = 'exact';
    }
    // Contains match
    else if (college.toLowerCase().includes(query.toLowerCase())) {
      score = 80;
      matchType = 'contains';
    }
    // Fuzzy match
    else {
      const similarity = calculateSimilarity(query, college);
      if (similarity > 0.6) {
        score = Math.round(similarity * 70);
        matchType = 'fuzzy';
      }
    }
    
    // Phonetic match
    if (phoneticMatch(query, college)) {
      score = Math.max(score, 60);
      matchType = matchType ? matchType + '+phonetic' : 'phonetic';
    }
    
    // Wildcard match
    if (wildcardMatch(query, college)) {
      score = Math.max(score, 50);
      matchType = matchType ? matchType + '+wildcard' : 'wildcard';
    }
    
    // Regex match
    if (regexMatch(query, college)) {
      score = Math.max(score, 40);
      matchType = matchType ? matchType + '+regex' : 'regex';
    }
    
    if (score > 0) {
      results.push({
        value: college,
        score: score,
        match_type: matchType,
        similarity: calculateSimilarity(query, college)
      });
    }
  }
  
  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Course search with advanced matching
function searchCourses(query, limit = 10) {
  // Load courses from your actual course list file
  const courses = [
    // These will be loaded from your Courses list.xlsx file
    'MBBS', 'BDS', 'BAMS', 'BHMS', 'BPT', 'BOT', 'BSc Nursing',
    'BSc Medical Technology', 'BSc Medical Laboratory Technology',
    'BSc Medical Imaging Technology', 'BSc Operation Theatre Technology',
    'BSc Anaesthesia Technology', 'BSc Cardiac Technology',
    'BSc Dialysis Technology', 'BSc Emergency Medical Technology',
    'BSc Optometry', 'BSc Physiotherapy', 'BSc Occupational Therapy',
    'BSc Speech and Hearing', 'BSc Audiology', 'BSc Prosthetics and Orthotics'
  ];
  
  // TODO: Load from your actual course list file
  // const courses = loadCoursesFromFile('/Users/kashyapanand/Desktop/data/list/Courses list.xlsx');
  
  const results = [];
  
  for (const course of courses) {
    let score = 0;
    let matchType = '';
    
    // Exact match
    if (course.toLowerCase() === query.toLowerCase()) {
      score = 100;
      matchType = 'exact';
    }
    // Contains match
    else if (course.toLowerCase().includes(query.toLowerCase())) {
      score = 80;
      matchType = 'contains';
    }
    // Fuzzy match
    else {
      const similarity = calculateSimilarity(query, course);
      if (similarity > 0.6) {
        score = Math.round(similarity * 70);
        matchType = 'fuzzy';
      }
    }
    
    // Phonetic match
    if (phoneticMatch(query, course)) {
      score = Math.max(score, 60);
      matchType = matchType ? matchType + '+phonetic' : 'phonetic';
    }
    
    // Wildcard match
    if (wildcardMatch(query, course)) {
      score = Math.max(score, 50);
      matchType = matchType ? matchType + '+wildcard' : 'wildcard';
    }
    
    // Regex match
    if (regexMatch(query, course)) {
      score = Math.max(score, 40);
      matchType = matchType ? matchType + '+regex' : 'regex';
    }
    
    if (score > 0) {
      results.push({
        value: course,
        score: score,
        match_type: matchType,
        similarity: calculateSimilarity(query, course)
      });
    }
  }
  
  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Category search with advanced matching
function searchCategories(query, limit = 10) {
  const categories = [
    'General', 'OBC', 'SC', 'ST', 'EWS', 'PWD', 'UR', 'OBC-NCL',
    'GENERAL', 'OBC-A', 'OBC-B', 'SC-A', 'SC-B', 'ST-A', 'ST-B',
    'GM', 'PH', 'Open', 'Reserved', 'Merit', 'Management'
  ];
  
  const results = [];
  
  for (const category of categories) {
    let score = 0;
    let matchType = '';
    
    // Exact match
    if (category.toLowerCase() === query.toLowerCase()) {
      score = 100;
      matchType = 'exact';
    }
    // Contains match
    else if (category.toLowerCase().includes(query.toLowerCase())) {
      score = 80;
      matchType = 'contains';
    }
    // Fuzzy match
    else {
      const similarity = calculateSimilarity(query, category);
      if (similarity > 0.6) {
        score = Math.round(similarity * 70);
        matchType = 'fuzzy';
      }
    }
    
    // Phonetic match
    if (phoneticMatch(query, category)) {
      score = Math.max(score, 60);
      matchType = matchType ? matchType + '+phonetic' : 'phonetic';
    }
    
    // Wildcard match
    if (wildcardMatch(query, category)) {
      score = Math.max(score, 50);
      matchType = matchType ? matchType + '+wildcard' : 'wildcard';
    }
    
    // Regex match
    if (regexMatch(query, category)) {
      score = Math.max(score, 40);
      matchType = matchType ? matchType + '+regex' : 'regex';
    }
    
    if (score > 0) {
      results.push({
        value: category,
        score: score,
        match_type: matchType,
        similarity: calculateSimilarity(query, category)
      });
    }
  }
  
  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Load actual course list from Excel file
function loadCoursesFromFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const courses = xlsx.utils.sheet_to_json(worksheet);
    
    // Extract course names from the Excel data
    return courses.map(row => {
      // Assuming the first column contains course names
      const firstKey = Object.keys(row)[0];
      return row[firstKey];
    }).filter(course => course && typeof course === 'string');
  } catch (error) {
    console.error('Error loading courses from file:', error);
    return [];
  }
}

// Load actual college list from database
function loadCollegesFromDatabase() {
  try {
    // This would load from your existing college database
    // For now, return the hardcoded list
    return [
      'AIIMS Delhi', 'JIPMER Puducherry', 'KGMU Lucknow', 'BHU Varanasi',
      'AMU Aligarh', 'JNU New Delhi', 'DU Delhi', 'BITS Pilani',
      'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur',
      'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad'
    ];
  } catch (error) {
    console.error('Error loading colleges from database:', error);
    return [];
  }
}

// Load actual course list from Excel file
function loadCoursesFromFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const courses = xlsx.utils.sheet_to_json(worksheet);
    
    // Extract course names from the Excel data
    return courses.map(row => {
      // Assuming the first column contains course names
      const firstKey = Object.keys(row)[0];
      return row[firstKey];
    }).filter(course => course && typeof course === 'string');
  } catch (error) {
    console.error('Error loading courses from file:', error);
    return [];
  }
}

// Load actual college list from database
function loadCollegesFromDatabase() {
  try {
    // This would load from your existing college database
    // For now, return the hardcoded list
    return [
      'AIIMS Delhi', 'JIPMER Puducherry', 'KGMU Lucknow', 'BHU Varanasi',
      'AMU Aligarh', 'JNU New Delhi', 'DU Delhi', 'BITS Pilani',
      'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur',
      'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad'
    ];
  } catch (error) {
    console.error('Error loading colleges from database:', error);
    return [];
  }
}

// Get suggestions for error correction
function getCollegeSuggestions(value, limit = 5) {
  return searchColleges(value, limit);
}

function getCourseSuggestions(value, limit = 5) {
  return searchCourses(value, limit);
}

function getCategorySuggestions(value, limit = 5) {
  return searchCategories(value, limit);
}

// Load actual course list from Excel file
function loadCoursesFromFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const courses = xlsx.utils.sheet_to_json(worksheet);
    
    // Extract course names from the Excel data
    return courses.map(row => {
      // Assuming the first column contains course names
      const firstKey = Object.keys(row)[0];
      return row[firstKey];
    }).filter(course => course && typeof course === 'string');
  } catch (error) {
    console.error('Error loading courses from file:', error);
    return [];
  }
}

// Load actual college list from database
function loadCollegesFromDatabase() {
  try {
    // This would load from your existing college database
    // For now, return the hardcoded list
    return [
      'AIIMS Delhi', 'JIPMER Puducherry', 'KGMU Lucknow', 'BHU Varanasi',
      'AMU Aligarh', 'JNU New Delhi', 'DU Delhi', 'BITS Pilani',
      'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur',
      'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad'
    ];
  } catch (error) {
    console.error('Error loading colleges from database:', error);
    return [];
  }
}

// Load actual course list from Excel file
function loadCoursesFromFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const courses = xlsx.utils.sheet_to_json(worksheet);
    
    // Extract course names from the Excel data
    return courses.map(row => {
      // Assuming the first column contains course names
      const firstKey = Object.keys(row)[0];
      return row[firstKey];
    }).filter(course => course && typeof course === 'string');
  } catch (error) {
    console.error('Error loading courses from file:', error);
    return [];
  }
}

// Load actual college list from database
function loadCollegesFromDatabase() {
  try {
    // This would load from your existing college database
    // For now, return the hardcoded list
    return [
      'AIIMS Delhi', 'JIPMER Puducherry', 'KGMU Lucknow', 'BHU Varanasi',
      'AMU Aligarh', 'JNU New Delhi', 'DU Delhi', 'BITS Pilani',
      'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur',
      'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad'
    ];
  } catch (error) {
    console.error('Error loading colleges from database:', error);
    return [];
  }
}

// Enhanced validation rules for counselling/cutoff data structure
function validateCutoffRecord(record, rowNumber) {
  const errors = [];
  const warnings = [];
  
  // Enhanced field mapping for counselling data format
  const allIndiaRank = record.all_india_rank || record['ALL INDIA RANK'] || record['All India Rank'] || record['Rank'] || record['RANK'] || '';
  const quota = record.quota || record['QUOTA'] || record['Quota'] || '';
  const collegeInstitute = record.college_institute || record['COLLEGE/INSTITUTE'] || record['College/Institute'] || record['College'] || record['Institute'] || record['INSTITUTE'] || '';
  const course = record.course || record['COURSE'] || record['Course'] || '';
  const category = record.category || record['CATEGORY'] || record['Category'] || '';
  const round = record.round || record['ROUND'] || record['Round'] || '';
  const year = record.year || record['YEAR'] || record['Year'] || '';
  
  // Required field validation for counselling data
  if (!allIndiaRank || allIndiaRank.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: ALL INDIA RANK is required`);
  }
  if (!quota || quota.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: QUOTA is required`);
  }
  if (!collegeInstitute || collegeInstitute.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: COLLEGE/INSTITUTE is required`);
  }
  if (!course || course.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: COURSE is required`);
  }
  if (!category || category.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: CATEGORY is required`);
  }
  if (!round || round.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: ROUND is required`);
  }
  if (!year || year.toString().trim() === '') {
    errors.push(`Row ${rowNumber}: YEAR is required`);
  }
  
  // Enhanced data type validation
  // ALL INDIA RANK validation - can be decimal, with letters, or parentheses
  if (allIndiaRank) {
    const rankStr = allIndiaRank.toString().trim();
    // Allow formats: 1, 1.01, 1.A, 1(A), 1.01A, etc.
    const rankPattern = /^(\d+(?:\.\d+)?)(?:[A-Z]|\([A-Z]\))?$/;
    if (!rankPattern.test(rankStr)) {
      warnings.push(`Row ${rowNumber}: ALL INDIA RANK format '${rankStr}' may not be standard`);
    }
  }
  
  // Year validation with flexible range
  if (year) {
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      warnings.push(`Row ${rowNumber}: Year ${year} may be outside expected range (2020-2030)`);
    }
  }
  
  // Round validation for counselling format (KEA_R1, AIQ_R1, etc.)
  if (round) {
    const roundStr = round.toString().trim();
    const roundPattern = /^(KEA|AIQ|MCC|NEET|JEE)_R\d+$/i;
    if (!roundPattern.test(roundStr)) {
      warnings.push(`Row ${rowNumber}: Round format '${roundStr}' may not follow standard pattern (e.g., KEA_R1, AIQ_R1)`);
    }
  }
  
  // Enhanced business logic validation
  if (allIndiaRank) {
    const rankNum = parseFloat(allIndiaRank.toString().replace(/[A-Z()]/g, ''));
    if (rankNum < 1) {
      warnings.push(`Row ${rowNumber}: ALL INDIA RANK ${allIndiaRank} seems unusually low`);
    }
    if (rankNum > 100000) {
      warnings.push(`Row ${rowNumber}: ALL INDIA RANK ${allIndiaRank} seems unusually high`);
    }
  }
  
  // Enhanced category validation for counselling data
  const validCategories = [
    'General', 'OBC', 'SC', 'ST', 'EWS', 'PWD',
    'GENERAL', 'OBC-A', 'OBC-B', 'SC-A', 'SC-B', 'ST-A', 'ST-B',
    'GM', 'OBC', 'SC', 'ST', 'EWS', 'PH',
    'Open', 'Reserved', 'Merit', 'Management',
    'UR', 'OBC-NCL', 'SC', 'ST', 'EWS', 'PwD'
  ];
  
  if (category && !validCategories.some(valid => 
    category.toString().toLowerCase().includes(valid.toLowerCase()) ||
    valid.toLowerCase().includes(category.toString().toLowerCase())
  )) {
    warnings.push(`Row ${rowNumber}: Category '${category}' may not be standard`);
  }
  
  // Quota validation
  const validQuotas = [
    'AIQ', 'State', 'Management', 'NRI', 'PwD', 'EWS',
    'All India', 'State Quota', 'Management Quota', 'NRI Quota'
  ];
  
  if (quota && !validQuotas.some(valid => 
    quota.toString().toLowerCase().includes(valid.toLowerCase()) ||
    valid.toLowerCase().includes(quota.toString().toLowerCase())
  )) {
    warnings.push(`Row ${rowNumber}: Quota '${quota}' may not be standard`);
  }
  
  // College/Institute validation
  if (collegeInstitute && collegeInstitute.toString().length < 3) {
    warnings.push(`Row ${rowNumber}: College/Institute name seems too short: '${collegeInstitute}'`);
  }
  
  // Course validation
  if (course && course.toString().length < 2) {
    warnings.push(`Row ${rowNumber}: Course name seems too short: '${course}'`);
  }
  
  // Data consistency checks
  if (allIndiaRank && quota && collegeInstitute && course && category && round && year) {
    // All required fields present - this is a valid record
    if (errors.length === 0) {
      return { errors, warnings, isValid: true };
    }
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React app static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Database connections - Using the correct clean-unified.db with 2401 colleges
const mainDb = new sqlite3.Database(path.join(__dirname, './database/clean-unified.db'));
const stagingDb = new sqlite3.Database(path.join(__dirname, './database/staging_cutoffs.db'));
const errorDb = new sqlite3.Database(path.join(__dirname, './database/error_corrections.db'));

// Initialize staging database table
stagingDb.serialize(() => {
  stagingDb.run(`
    CREATE TABLE IF NOT EXISTS staging_cutoffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      all_india_rank TEXT NOT NULL,
      quota TEXT NOT NULL,
      college_institute TEXT NOT NULL,
      course TEXT NOT NULL,
      category TEXT NOT NULL,
      round TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT DEFAULT 'pending_validation',
      validation_notes TEXT,
      uploaded_at TEXT NOT NULL,
      validated_at TEXT,
      approved_at TEXT,
      imported_at TEXT,
      updated_at TEXT,
      filename TEXT NOT NULL,
      UNIQUE(all_india_rank, year, round)
    )
  `);
  
  stagingDb.run(`
    CREATE INDEX IF NOT EXISTS idx_staging_status ON staging_cutoffs(status)
  `);
  
  stagingDb.run(`
    CREATE INDEX IF NOT EXISTS idx_staging_filename ON staging_cutoffs(filename)
  `);
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Colleges Management API Routes
app.get('/api/sector_xp_12/colleges', checkAdminAuth, (req, res) => {
  const query = req.query.search || '';
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder || 'ASC';
  const page = parseInt(req.query.page) || 1;

  // Calculate offset from page
  const calculatedOffset = (page - 1) * limit;

  // Query colleges from database with proper column mapping
  let sql = `
    SELECT 
      id,
      name,
      city,
      state,
      district,
      college_type as type,
      management_type as management,
      establishment_year as established_year,
      university,
      accreditation,
      status
    FROM colleges
  `;
  let params = [];

  if (query) {
    sql += ' WHERE name LIKE ? OR college_type LIKE ? OR city LIKE ? OR state LIKE ? OR district LIKE ?';
    params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
  }

  sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, calculatedOffset);

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
      countSql += ' WHERE name LIKE ? OR college_type LIKE ? OR city LIKE ? OR state LIKE ? OR district LIKE ?';
      countParams = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
    }

    mainDb.get(countSql, countParams, (err, countResult) => {
      if (err) {
        console.error('Error getting colleges count:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        data: rows,
        pagination: {
          total,
          limit,
          page,
          offset: calculatedOffset,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      });
    });
  });
});

// Colleges filters endpoint
app.get('/api/sector_xp_12/colleges/filters', checkAdminAuth, (req, res) => {
  try {
    // Get unique states
    mainDb.all('SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL ORDER BY state', (err, states) => {
      if (err) {
        console.error('Error fetching states:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Get unique types
      mainDb.all('SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL ORDER BY college_type', (err, types) => {
        if (err) {
          console.error('Error fetching types:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Get unique management types
        mainDb.all('SELECT DISTINCT management_type FROM colleges WHERE management_type IS NOT NULL ORDER BY management_type', (err, management) => {
          if (err) {
            console.error('Error fetching management types:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            states: states.map(s => s.state),
            types: types.map(t => t.college_type),
            management: management.map(m => m.management_type)
          });
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Programs Management API Routes
app.get('/api/sector_xp_12/programs', checkAdminAuth, (req, res) => {
  const query = req.query.search || '';
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder || 'ASC';
  const page = parseInt(req.query.page) || 1;

  // Calculate offset from page
  const calculatedOffset = (page - 1) * limit;

  // Query programs from database with proper column mapping
  let sql = `
    SELECT 
      p.id,
      p.name,
      p.level,
      p.specialization,
      p.course_type,
      p.duration,
      p.entrance_exam,
      p.total_seats,
      p.status,
      p.created_at,
      c.name as college_name,
      c.city,
      c.state
    FROM programs p
    LEFT JOIN colleges c ON p.college_id = c.id
  `;
  let params = [];

  if (query) {
    sql += ' WHERE p.name LIKE ? OR p.level LIKE ? OR p.specialization LIKE ? OR c.name LIKE ?';
    params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
  }

  sql += ` ORDER BY p.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, calculatedOffset);

  mainDb.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching programs:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM programs p
      LEFT JOIN colleges c ON p.college_id = c.id
    `;
    let countParams = [];

    if (query) {
      countSql += ' WHERE p.name LIKE ? OR p.level LIKE ? OR p.specialization LIKE ? OR c.name LIKE ?';
      countParams = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
    }

    mainDb.get(countSql, countParams, (err, countResult) => {
      if (err) {
        console.error('Error getting programs count:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        data: rows,
        pagination: {
          total,
          limit,
          page,
          offset: calculatedOffset,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      });
    });
  });
});

// Mock API routes for new features
app.get('/api/sector_xp_12/admin/cutoffs/staging', checkAdminAuth, (req, res) => {
  // Get real staging data from database
  stagingDb.all("SELECT * FROM staging_cutoffs ORDER BY uploaded_at DESC LIMIT 100", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({
      data: rows || [],
      pagination: {
        total: rows ? rows.length : 0,
        limit: 100,
        offset: 0,
        pages: 1
      }
    });
  });
});

app.get('/api/sector_xp_12/admin/cutoffs/stats', checkAdminAuth, (req, res) => {
  // Get real statistics from staging database
  stagingDb.get("SELECT COUNT(*) as total FROM staging_cutoffs", (err, totalRow) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    stagingDb.get("SELECT COUNT(*) as pending FROM staging_cutoffs WHERE status = 'pending_validation'", (err, pendingRow) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      stagingDb.get("SELECT COUNT(*) as validated FROM staging_cutoffs WHERE status = 'validated'", (err, validatedRow) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        stagingDb.get("SELECT COUNT(*) as rejected FROM staging_cutoffs WHERE status = 'rejected'", (err, rejectedRow) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          const total = totalRow.total || 0;
          const pending = pendingRow.pending || 0;
          const validated = validatedRow.validated || 0;
          const rejected = rejectedRow.rejected || 0;
          const progress = total > 0 ? ((validated + rejected) / total * 100).toFixed(1) : 0;
          
          res.json({
            total_records: total,
            pending_validation: pending,
            validated: validated,
            rejected: rejected,
            validation_progress: parseFloat(progress)
          });
        });
      });
    });
  });
});

// File upload endpoint with real parsing and validation
app.post('/api/sector_xp_12/admin/cutoffs/upload', checkAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype === 'text/csv' ? 'csv' : 'excel';
    
    // Parse the file
    const parsedData = await parseFile(filePath, fileType);
    
    if (!parsedData || parsedData.length === 0) {
      return res.status(400).json({ error: 'No data found in file' });
    }

    // Validate each record
    const validationResults = [];
    const validRecords = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    parsedData.forEach((record, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      const validation = validateCutoffRecord(record, rowNumber);
      
      validationResults.push({
        row: rowNumber,
        record: record,
        errors: validation.errors,
        warnings: validation.warnings
      });

      totalErrors += validation.errors.length;
      totalWarnings += validation.warnings.length;

      // Only add to valid records if no critical errors
      if (validation.errors.length === 0) {
        validRecords.push({
          all_india_rank: record.all_india_rank || record['ALL INDIA RANK'] || record['All India Rank'] || record['Rank'] || record['RANK'] || '',
          quota: record.quota || record['QUOTA'] || record['Quota'] || '',
          college_institute: record.college_institute || record['COLLEGE/INSTITUTE'] || record['College/Institute'] || record['College'] || record['Institute'] || record['INSTITUTE'] || '',
          course: record.course || record['COURSE'] || record['Course'] || '',
          category: record.category || record['CATEGORY'] || record['Category'] || '',
          round: record.round || record['ROUND'] || record['Round'] || '',
          year: parseInt(record.year || record['YEAR'] || record['Year'] || 2024),
          filename: req.file.filename
        });
      }
    });

          // Insert valid records into staging database
      if (validRecords.length > 0) {
        const stmt = stagingDb.prepare(`
          INSERT INTO staging_cutoffs 
          (all_india_rank, quota, college_institute, course, category, round, year, status, uploaded_at, filename)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        validRecords.forEach(record => {
          stmt.run([
            record.all_india_rank,
            record.quota,
            record.college_institute,
            record.course,
            record.category,
            record.round,
            record.year,
            'pending_validation',
            new Date().toISOString(),
            record.filename
          ]);
        });

        stmt.finalize();
      }

    // Store validation results in session for preview
    req.session = req.session || {};
    req.session.lastValidation = {
      filename: req.file.filename,
      totalRows: parsedData.length,
      validRecords: validRecords.length,
      totalErrors: totalErrors,
      totalWarnings: totalWarnings,
      validationResults: validationResults
    };

    res.json({
      success: true,
      message: 'File uploaded and parsed successfully',
      records_added: validRecords.length,
      filename: req.file.filename,
      validation_summary: {
        total_rows: parsedData.length,
        valid_records: validRecords.length,
        total_errors: totalErrors,
        total_warnings: totalWarnings
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Start validation process
app.post('/api/sector_xp_12/admin/cutoffs/validate', checkAdminAuth, (req, res) => {
  try {
    // Get pending records for validation
    stagingDb.all("SELECT * FROM staging_cutoffs WHERE status = 'pending_validation'", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Simulate validation process
      rows.forEach(record => {
        // Basic validation rules
        let status = 'validated';
        let validation_notes = '';
        
        if (!record.college_name || record.college_name.trim() === '') {
          status = 'rejected';
          validation_notes = 'Missing college name';
        } else if (!record.program_name || record.program_name.trim() === '') {
          status = 'rejected';
          validation_notes = 'Missing program name';
        } else if (!record.cutoff_score || record.cutoff_score <= 0) {
          status = 'rejected';
          validation_notes = 'Invalid cutoff score';
        } else if (!record.category || record.category.trim() === '') {
          status = 'rejected';
          validation_notes = 'Missing category';
        }
        
        // Update record status
        stagingDb.run(
          "UPDATE staging_cutoffs SET status = ?, validation_notes = ?, validated_at = ? WHERE id = ?",
          [status, validation_notes, new Date().toISOString(), record.id]
        );
      });
      
    res.json({ 
      success: true, 
        message: 'Validation process completed',
        records_processed: rows.length
      });
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed', details: error.message });
  }
});

// Update staging record
app.put('/api/sector_xp_12/admin/cutoffs/staging/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { college_name, program_name, category, cutoff_score, year, round, status } = req.body;
  
  try {
    stagingDb.run(`
      UPDATE staging_cutoffs 
      SET college_name = ?, program_name = ?, category = ?, cutoff_score = ?, 
          year = ?, round = ?, status = ?, updated_at = ?
      WHERE id = ?
    `, [college_name, program_name, category, cutoff_score, year, round, status, new Date().toISOString(), id]);
    
    res.json({
      success: true,
      message: 'Record updated successfully'
    });
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
});

// Approve record for import
app.post('/api/sector_xp_12/admin/cutoffs/approve/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  
  try {
    stagingDb.run(
      "UPDATE staging_cutoffs SET status = 'validated', approved_at = ? WHERE id = ?",
      [new Date().toISOString(), id]
    );
    
      res.json({ 
        success: true, 
      message: 'Record approved successfully'
      });
    
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Approval failed', details: error.message });
  }
});

// Import validated records to unified database
app.post('/api/sector_xp_12/admin/cutoffs/import', checkAdminAuth, (req, res) => {
  try {
    // Get all validated records
    stagingDb.all("SELECT * FROM staging_cutoffs WHERE status = 'validated'", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (rows.length === 0) {
        return res.status(400).json({ error: 'No validated records to import' });
      }
      
      let importedCount = 0;
      let errors = [];
      
      // Process each record individually to handle lookups
      rows.forEach((record, index) => {
        // Look up college_id
        mainDb.get("SELECT id FROM colleges WHERE name = ?", [record.college_name], (err, collegeRow) => {
          if (err || !collegeRow) {
            errors.push(`College not found: ${record.college_name}`);
            return;
          }
          
          // Look up program_id
          mainDb.get("SELECT id FROM programs WHERE name = ? AND college_id = ?", 
            [record.program_name, collegeRow.id], (err, programRow) => {
            if (err || !programRow) {
              errors.push(`Program not found: ${record.program_name} at ${record.college_name}`);
              return;
            }
            
            // Insert into cutoffs table with proper structure
            mainDb.run(`
              INSERT INTO cutoffs 
              (college_id, program_id, year, round, authority, quota, category, 
               closing_score, score_type, score_unit, source_url, notes, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              collegeRow.id,
              programRow.id,
              record.year,
              record.round.toString(),
              'NEET', // Default authority
              record.category,
              record.category,
              record.cutoff_score,
              'RAW_SCORE', // Default score type
              'MARKS', // Default score unit
              `Imported from ${record.filename}`,
              `Auto-imported on ${new Date().toISOString()}`,
              'active'
            ], function(err) {
              if (err) {
                errors.push(`Database error for record ${record.id}: ${err.message}`);
              } else {
                importedCount++;
              }
              
              // If this is the last record, send response
              if (index === rows.length - 1) {
                // Mark staging records as imported
                stagingDb.run("UPDATE staging_cutoffs SET status = 'imported', imported_at = ? WHERE status = 'validated'", 
                  [new Date().toISOString()]);
                
                res.json({
                  success: true,
                  message: 'Import completed successfully',
                  records_imported: importedCount,
                  errors: errors.length > 0 ? errors : undefined
                });
              }
            });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
});

// Reset staging data
app.delete('/api/sector_xp_12/admin/cutoffs/staging/reset', checkAdminAuth, (req, res) => {
  try {
    stagingDb.run("DROP TABLE IF EXISTS staging_cutoffs", (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Recreate table with new schema
      stagingDb.run(`
        CREATE TABLE staging_cutoffs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          all_india_rank TEXT NOT NULL,
          quota TEXT NOT NULL,
          college_institute TEXT NOT NULL,
          course TEXT NOT NULL,
          category TEXT NOT NULL,
          round TEXT NOT NULL,
          year INTEGER NOT NULL,
          status TEXT DEFAULT 'pending_validation',
          validation_notes TEXT,
          uploaded_at TEXT NOT NULL,
          validated_at TEXT,
          approved_at TEXT,
          imported_at TEXT,
          updated_at TEXT,
          filename TEXT NOT NULL,
          UNIQUE(all_india_rank, year, round)
        )
      `, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Table recreation failed' });
        }
        
        res.json({
          success: true,
          message: 'Staging database reset and schema updated successfully'
        });
      });
    });
    
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Reset failed', details: error.message });
  }
});

// Get import history
app.get('/api/sector_xp_12/admin/cutoffs/history', checkAdminAuth, (req, res) => {
  try {
    stagingDb.all(`
      SELECT filename, COUNT(*) as total_records,
             SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) as valid_records,
             SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as error_records,
             MIN(uploaded_at) as timestamp,
             MAX(CASE WHEN status = 'imported' THEN imported_at END) as import_time
      FROM staging_cutoffs 
      GROUP BY filename
      ORDER BY timestamp DESC
    `, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const sessions = rows.map(row => ({
        id: row.filename,
        filename: row.filename,
        recordsProcessed: row.total_records,
        validRecords: row.valid_records,
        errorRecords: row.error_records,
        timestamp: row.timestamp,
        status: row.import_time ? 'completed' : 'pending',
        importTime: row.import_time
      }));

    res.json({
        data: sessions,
        pagination: {
          total: sessions.length,
          limit: 50,
          offset: 0,
          pages: 1
        }
      });
    });
    
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
});

app.get('/api/sector_xp_12/admin/error-corrections', checkAdminAuth, (req, res) => {
  res.json({
    data: [
      {
        id: 1,
        error_type: 'Data Mismatch',
        description: 'College name mismatch between source and target',
        severity: 'high',
        status: 'open',
        created_at: '2025-01-26T08:00:00Z'
      }
    ],
    pagination: {
      total: 1,
      limit: 50,
      offset: 0,
      pages: 1
    }
  });
});

app.get('/api/sector_xp_12/admin/error-corrections/stats', checkAdminAuth, (req, res) => {
  res.json({
    total_errors: 25,
    open_errors: 18,
    resolved_errors: 7,
    high_severity: 8,
    medium_severity: 12,
    low_severity: 5
  });
});

// Get data preview from last upload
app.get('/api/sector_xp_12/admin/cutoffs/preview', checkAdminAuth, (req, res) => {
  try {
    // Get actual data from staging database
    stagingDb.all("SELECT * FROM staging_cutoffs ORDER BY uploaded_at DESC LIMIT 10", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (rows.length === 0) {
        // Return sample data if no records
        res.json({
          success: true,
          preview_data: {
            filename: 'No data uploaded yet',
            total_rows: 0,
            sample_records: [],
            validation_summary: {
              total_rows: 0,
              valid_records: 0,
              total_errors: 0,
              total_warnings: 0
            }
          }
        });
        return;
      }
      
      const latestFile = rows[0].filename;
      const fileRecords = rows.filter(r => r.filename === latestFile);
      
              const previewData = {
          filename: latestFile,
          total_rows: fileRecords.length,
          sample_records: fileRecords.slice(0, 5).map((record, index) => ({
            row: index + 1,
            all_india_rank: record.all_india_rank,
            quota: record.quota,
            college_institute: record.college_institute,
            course: record.course,
            category: record.category,
            round: record.round,
            year: record.year,
            status: record.status
          })),
        validation_summary: {
          total_rows: fileRecords.length,
          valid_records: fileRecords.filter(r => r.status === 'validated').length,
          total_errors: fileRecords.filter(r => r.status === 'rejected').length,
          total_warnings: 0 // Warnings are not stored in DB
        }
      };
      
      res.json({
        success: true,
        preview_data: previewData
      });
    });
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Preview failed', details: error.message });
  }
});

// Bulk edit operations
app.put('/api/sector_xp_12/admin/cutoffs/bulk-edit', checkAdminAuth, (req, res) => {
  try {
    const { recordIds, updates } = req.body;
    
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({ error: 'Invalid record IDs' });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    let updatedCount = 0;
    const errors = [];
    
    recordIds.forEach(recordId => {
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(updates).forEach(key => {
        if (['college_name', 'program_name', 'category', 'cutoff_score', 'year', 'round'].includes(key)) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updates[key]);
        }
      });
      
      if (updateFields.length > 0) {
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(recordId);
        
        stagingDb.run(
          `UPDATE staging_cutoffs SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues,
          function(err) {
            if (err) {
              errors.push(`Error updating record ${recordId}: ${err.message}`);
            } else {
              updatedCount++;
            }
          }
        );
      }
    });
    
    res.json({
      success: true,
      message: 'Bulk update completed',
      records_updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Bulk edit error:', error);
    res.status(500).json({ error: 'Bulk edit failed', details: error.message });
  }
});

// Get data quality metrics
app.get('/api/sector_xp_12/admin/cutoffs/quality-metrics', checkAdminAuth, (req, res) => {
  try {
    stagingDb.get("SELECT COUNT(*) as total FROM staging_cutoffs", (err, totalRow) => {
      if (err) { return res.status(500).json({ error: 'Database error' }); }
      
      stagingDb.get("SELECT COUNT(*) as valid FROM staging_cutoffs WHERE status = 'validated'", (err, validRow) => {
        if (err) { return res.status(500).json({ error: 'Database error' }); }
        
        stagingDb.get("SELECT COUNT(*) as rejected FROM staging_cutoffs WHERE status = 'rejected'", (err, rejectedRow) => {
          if (err) { return res.status(500).json({ error: 'Database error' }); }
          
          const total = totalRow.total || 0;
          const valid = validRow.valid || 0;
          const rejected = rejectedRow.rejected || 0;
          
          const qualityMetrics = {
            total_records: total,
            data_quality_score: total > 0 ? ((valid / total) * 100).toFixed(2) : 0,
            validation_rate: total > 0 ? ((valid + rejected) / total * 100).toFixed(2) : 0,
            error_rate: total > 0 ? (rejected / total * 100).toFixed(2) : 0,
            completeness_score: total > 0 ? ((valid + rejected) / total * 100).toFixed(2) : 0
          };
          
          res.json({
            success: true,
            quality_metrics: qualityMetrics
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Quality metrics error:', error);
    res.status(500).json({ error: 'Quality metrics failed', details: error.message });
  }
});

// Export data to CSV/Excel
app.get('/api/sector_xp_12/admin/cutoffs/export', checkAdminAuth, (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const status = req.query.status || 'all';
    
    let sql = "SELECT * FROM staging_cutoffs";
    let params = [];
    
    if (status !== 'all') {
      sql += " WHERE status = ?";
      params.push(status);
    }
    
    stagingDb.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (format === 'csv') {
        const csvHeader = 'ID,All India Rank,Quota,College/Institute,Course,Category,Round,Year,Status,Uploaded At,Validation Notes\n';
        const csvData = rows.map(row => 
          `${row.id},"${row.all_india_rank}","${row.quota}","${row.college_institute}","${row.course}","${row.category}","${row.round}",${row.year},"${row.status}","${row.uploaded_at}","${row.validation_notes || ''}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="cutoff_data_${status}_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvHeader + csvData);
      } else if (format === 'json') {
        res.json({
          success: true,
          data: rows,
          export_info: {
            format: 'json',
            status: status,
            total_records: rows.length,
            exported_at: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({ error: 'Unsupported format. Use csv or json' });
      }
    });
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// Generate comprehensive reports
app.get('/api/sector_xp_12/admin/cutoffs/reports', checkAdminAuth, (req, res) => {
  try {
    const reportType = req.query.type || 'summary';
    
    if (reportType === 'summary') {
      // Summary report
              stagingDb.all(`
          SELECT 
            status,
            COUNT(*) as count,
            COUNT(DISTINCT all_india_rank) as unique_ranks,
            MIN(CAST(REPLACE(REPLACE(REPLACE(all_india_rank, 'A', ''), 'B', ''), '(', '') AS REAL)) as min_rank,
            MAX(CAST(REPLACE(REPLACE(REPLACE(all_india_rank, 'A', ''), 'B', ''), '(', '') AS REAL)) as max_rank
          FROM staging_cutoffs 
          GROUP BY status
        `, (err, statusStats) => {
        if (err) { return res.status(500).json({ error: 'Database error' }); }
        
        stagingDb.all(`
          SELECT 
            category,
            COUNT(*) as count,
            COUNT(DISTINCT all_india_rank) as unique_ranks,
            MIN(CAST(REPLACE(REPLACE(REPLACE(all_india_rank, 'A', ''), 'B', ''), '(', '') AS REAL)) as min_rank,
            MAX(CAST(REPLACE(REPLACE(REPLACE(all_india_rank, 'A', ''), 'B', ''), '(', '') AS REAL)) as max_rank
          FROM staging_cutoffs 
          GROUP BY category
          ORDER BY count DESC
        `, (err, categoryStats) => {
          if (err) { return res.status(500).json({ error: 'Database error' }); }
          
          stagingDb.all(`
            SELECT 
              strftime('%Y', uploaded_at) as year,
              COUNT(*) as count
            FROM staging_cutoffs 
            GROUP BY strftime('%Y', uploaded_at)
            ORDER BY year DESC
          `, (err, yearStats) => {
            if (err) { return res.status(500).json({ error: 'Database error' }); }
            
            res.json({
              success: true,
              report_type: 'summary',
              generated_at: new Date().toISOString(),
              status_distribution: statusStats,
              category_analysis: categoryStats,
              year_trends: yearStats
            });
          });
        });
      });
    } else if (reportType === 'validation') {
      // Validation report
      stagingDb.all(`
        SELECT 
          validation_notes,
          COUNT(*) as count
        FROM staging_cutoffs 
        WHERE validation_notes IS NOT NULL AND validation_notes != ''
        GROUP BY validation_notes
        ORDER BY count DESC
        LIMIT 20
      `, (err, validationErrors) => {
        if (err) { return res.status(500).json({ error: 'Database error' }); }
        
        res.json({
          success: true,
          report_type: 'validation',
          generated_at: new Date().toISOString(),
          common_validation_errors: validationErrors
        });
      });
    } else {
      res.status(400).json({ error: 'Unsupported report type. Use summary or validation' });
    }
    
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Report generation failed', details: error.message });
  }
});

// Advanced search and error correction endpoints
app.get('/api/sector_xp_12/admin/cutoffs/search', checkAdminAuth, (req, res) => {
  try {
    const { query, type, limit = 10 } = req.query;
    
    if (!query || !type) {
      return res.status(400).json({ error: 'Query and type are required' });
    }
    
    let results = [];
    
    if (type === 'college') {
      // Search colleges with fuzzy matching
      results = searchColleges(query, limit);
    } else if (type === 'course') {
      // Search courses with fuzzy matching
      results = searchCourses(query, limit);
    } else if (type === 'category') {
      // Search categories with fuzzy matching
      results = searchCategories(query, limit);
    } else {
      return res.status(400).json({ error: 'Invalid search type. Use college, course, or category' });
    }
    
    res.json({
      success: true,
      query: query,
      type: type,
      results: results,
      total: results.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Get error correction suggestions
app.get('/api/sector_xp_12/admin/cutoffs/error-corrections', checkAdminAuth, (req, res) => {
  try {
    const { field, value, limit = 5 } = req.query;
    
    if (!field || !value) {
      return res.status(400).json({ error: 'Field and value are required' });
    }
    
    let suggestions = [];
    
    if (field === 'college_institute') {
      suggestions = getCollegeSuggestions(value, limit);
    } else if (field === 'course') {
      suggestions = getCourseSuggestions(value, limit);
    } else if (field === 'category') {
      suggestions = getCategorySuggestions(value, limit);
    } else {
      return res.status(400).json({ error: 'Invalid field. Use college_institute, course, or category' });
    }
    
    res.json({
      success: true,
      field: field,
      original_value: value,
      suggestions: suggestions
    });
    
  } catch (error) {
    console.error('Error correction error:', error);
    res.status(500).json({ error: 'Error correction failed', details: error.message });
  }
});

// Get detailed analytics
app.get('/api/sector_xp_12/admin/cutoffs/analytics', checkAdminAuth, (req, res) => {
  try {
            stagingDb.all(`
          SELECT 
            COUNT(*) as total_records,
            SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END) as validated_count,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
            SUM(CASE WHEN status = 'pending_validation' THEN 1 ELSE 0 END) as pending_count,
            COUNT(DISTINCT all_india_rank) as unique_ranks,
            MIN(CAST(REPLACE(REPLACE(REPLACE(all_india_rank, 'A', ''), 'B', ''), '(', '') AS REAL)) as min_rank,
            MAX(CAST(REPLACE(REPLACE(REPLACE(all_india_rank, 'A', ''), 'B', ''), '(', '') AS REAL)) as max_rank,
            COUNT(DISTINCT college_institute) as unique_colleges,
            COUNT(DISTINCT course) as unique_courses,
            COUNT(DISTINCT category) as unique_categories,
            COUNT(DISTINCT quota) as unique_quotas,
            COUNT(DISTINCT round) as unique_rounds
          FROM staging_cutoffs
        `, (err, analytics) => {
      if (err) { return res.status(500).json({ error: 'Database error' }); }
      
                const data = analytics[0];
          const dataQualityScore = data.total_records > 0 ? 
            ((data.validated_count / data.total_records) * 100).toFixed(2) : 0;
          
          res.json({
            success: true,
            analytics: {
              ...data,
              data_quality_score: parseFloat(dataQualityScore),
              validation_progress: data.total_records > 0 ? 
                (((data.validated_count + data.rejected_count) / data.total_records) * 100).toFixed(2) : 0,
              rank_range: `${data.min_rank || 'N/A'} - ${data.max_rank || 'N/A'}`
            }
          });
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Analytics failed', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Complete Working Server running on port ${PORT}`);
  console.log(`🔗 Admin login: http://localhost:${PORT}/sector_xp_12`);
  console.log(`🔗 Cutoff Import: http://localhost:${PORT}/sector_xp_12/cutoff-import`);
  console.log(`🔐 Admin credentials: Lone_wolf#12:Apx_gp_delta`);
});
