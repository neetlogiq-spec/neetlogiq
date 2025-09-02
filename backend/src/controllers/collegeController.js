const dbManager = require('../database/DatabaseManager');

// Helper function to normalize text fields to uppercase
const normalizeTextFields = (data) => {
  const normalized = { ...data };
  const textFields = [
    'name', 'college_type', 'state', 'city', 'district', 
    'address', 'website', 'email', 'phone', 'affiliation', 'accreditation',
    'course_name', 'course_type', 'specialization', 'duration', 'description'
  ];
  
  textFields.forEach(field => {
    if (normalized[field] && typeof normalized[field] === 'string') {
      normalized[field] = normalized[field].toUpperCase();
    }
  });
  
  return normalized;
};

// Helper function to get college program data from clean-unified database
const getCollegeProgramData = async (collegeName, collegeType) => {
  try {
    // Use the clean-unified database which has the correct data
    const cleanUnifiedDb = dbManager.getDatabase('clean-unified.db');
    
    if (!cleanUnifiedDb) {
      console.log(`⚠️ Clean-unified database not available for ${collegeName}`);
      return { total_programs: 0, total_seats: 0 };
    }

    // First find the college ID in the colleges table
    const collegeQuery = `
      SELECT id FROM colleges 
      WHERE name LIKE ? AND college_type = ?
      LIMIT 1
    `;
    
    const college = await cleanUnifiedDb.get(collegeQuery, [`%${collegeName}%`, collegeType?.toUpperCase()]);
    
    if (!college) {
      console.log(`⚠️ College not found in clean-unified database: ${collegeName}`);
      return { total_programs: 0, total_seats: 0 };
    }

    // Now query the programs table for this college
    const programsQuery = `
      SELECT 
        COUNT(DISTINCT name) as total_programs,
        SUM(total_seats) as total_seats
      FROM programs 
      WHERE college_id = ?
    `;
    
    const result = await cleanUnifiedDb.get(programsQuery, [college.id]);
    
    if (result && (result.total_programs > 0 || result.total_seats > 0)) {
      console.log(`✅ Found programs for "${collegeName}": ${result.total_programs} programs, ${result.total_seats} seats`);
      return {
        total_programs: result.total_programs || 0,
        total_seats: result.total_seats || 0
      };
    }
    
    console.log(`⚠️ No programs found for "${collegeName}" in clean-unified database`);
    return { total_programs: 0, total_seats: 0 };

  } catch (error) {
    console.error(`❌ Error fetching program data for college ${collegeName}:`, error);
    return { total_programs: 0, total_seats: 0 };
  }
};

// Enhanced controller with search, filtering, and pagination
exports.getAllColleges = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || null; // Allow null to get all colleges
    const offset = limit ? (page - 1) * limit : 0;
    
    // Get filter parameters - including synchronized filters
    const { state, city, management_type, college_type, stream, course, branch, search } = req.query;
    
    const db = dbManager.getDatabase('clean-unified.db');
    
    // Build dynamic query based on filters
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (search) {
      // Comprehensive city name aliases system
      const cityAliases = {
        // Major metropolitan cities
        'bengaluru': ['bangalore', 'bengaluru'],
        'bangalore': ['bangalore', 'bengaluru'],
        'mumbai': ['mumbai', 'bombay'],
        'bombay': ['mumbai', 'bombay'],
        'kolkata': ['kolkata', 'calcutta'],
        'calcutta': ['kolkata', 'calcutta'],
        'chennai': ['chennai', 'madras'],
        'madras': ['chennai', 'madras'],
        'pune': ['pune', 'poona'],
        'poona': ['pune', 'poona'],
        
        // State capitals & major cities
        'hyderabad': ['hyderabad', 'secunderabad'],
        'secunderabad': ['hyderabad', 'secunderabad'],
        'ahmedabad': ['ahmedabad', 'amdavad'],
        'amdavad': ['ahmedabad', 'amdavad'],
        'vadodara': ['vadodara', 'baroda'],
        'baroda': ['vadodara', 'baroda'],
        'surat': ['surat', 'suryapur'],
        'suryapur': ['surat', 'suryapur'],
        'indore': ['indore', 'indur'],
        'indur': ['indore', 'indur'],
        
        // Regional variations (Karnataka)
        'mysore': ['mysore', 'mysuru'],
        'mysuru': ['mysore', 'mysuru'],
        'mangalore': ['mangalore', 'mangaluru'],
        'mangaluru': ['mangalore', 'mangaluru'],
        'hubli': ['hubli', 'hubballi'],
        'hubballi': ['hubli', 'hubballi'],
        'belgaum': ['belgaum', 'belagavi'],
        'belagavi': ['belgaum', 'belagavi'],
        'gulbarga': ['gulbarga', 'kalaburagi'],
        'kalaburagi': ['gulbarga', 'kalaburagi'],
        'bijapur': ['bijapur', 'vijayapura'],
        'vijayapura': ['bijapur', 'vijayapura'],
        'tumkur': ['tumkur', 'tumakuru'],
        'tumakuru': ['tumkur', 'tumakuru'],
        'shimoga': ['shimoga', 'shivamogga'],
        'shivamogga': ['shimoga', 'shivamogga'],
        'bellary': ['bellary', 'ballari'],
        'ballari': ['bellary', 'ballari'],
        'chikmagalur': ['chikmagalur', 'chikkamagaluru'],
        'chikkamagaluru': ['chikmagalur', 'chikkamagaluru'],
        'hassan': ['hassan', 'hasan'],
        'hasan': ['hassan', 'hasan'],
        'bidar': ['bidar', 'bidar'],
        'raichur': ['raichur', 'raichur'],
        'kolar': ['kolar', 'kolar'],
        'mandya': ['mandya', 'mandya'],
        'udupi': ['udupi', 'udupi'],
        'davangere': ['davangere', 'davangere'],
        'karwar': ['karwar', 'karwar'],
        'chitradurga': ['chitradurga', 'chitradurga'],
        'kolar': ['kolar', 'kolar'],
        'hospet': ['hospet', 'hosapete'],
        'hosapete': ['hospet', 'hosapete'],
        
        // Medical hub cities
        'vellore': ['vellore', 'velluru'],
        'velluru': ['vellore', 'velluru'],
        'manipal': ['manipal', 'manipala'],
        'manipala': ['manipal', 'manipala'],
        'jamshedpur': ['jamshedpur', 'tatanagar'],
        'tatanagar': ['jamshedpur', 'tatanagar'],
        'ranchi': ['ranchi', 'ranchi'],
        'bhubaneswar': ['bhubaneswar', 'bhubaneshwar'],
        'bhubaneshwar': ['bhubaneswar', 'bhubaneshwar'],
        'coimbatore': ['coimbatore', 'kovai'],
        'kovai': ['coimbatore', 'kovai'],
        'madurai': ['madurai', 'madurai'],
        'tiruchirapalli': ['tiruchirapalli', 'trichy'],
        'trichy': ['tiruchirapalli', 'trichy'],
        'salem': ['salem', 'salem'],
        'tirunelveli': ['tirunelveli', 'tirunelveli'],
        'erode': ['erode', 'erode'],
        'thoothukudi': ['thoothukudi', 'tuticorin'],
        'tuticorin': ['thoothukudi', 'tuticorin'],
        'thanjavur': ['thanjavur', 'tanjore'],
        'tanjore': ['thanjavur', 'tanjore'],
        'kanchipuram': ['kanchipuram', 'kanchi'],
        'kanchi': ['kanchipuram', 'kanchi'],
        
        // Other major cities
        'kochi': ['kochi', 'cochin'],
        'cochin': ['kochi', 'cochin'],
        'thiruvananthapuram': ['thiruvananthapuram', 'trivandrum'],
        'trivandrum': ['thiruvananthapuram', 'trivandrum'],
        'kannur': ['kannur', 'cannanore'],
        'cannanore': ['kannur', 'cannanore'],
        'kollam': ['kollam', 'quilon'],
        'quilon': ['kollam', 'quilon'],
        'palakkad': ['palakkad', 'palghat'],
        'palghat': ['palakkad', 'palghat'],
        'thrissur': ['thrissur', 'trichur'],
        'trichur': ['thrissur', 'trichur'],
        'kottayam': ['kottayam', 'kottayam'],
        'alappuzha': ['alappuzha', 'alleppey'],
        'alleppey': ['alappuzha', 'alleppey'],
        'malappuram': ['malappuram', 'malappuram'],
        'kasaragod': ['kasaragod', 'kasaragod'],
        'pathanamthitta': ['pathanamthitta', 'pathanamthitta'],
        'idukki': ['idukki', 'idukki'],
        'ernakulam': ['ernakulam', 'ernakulam'],
        'wayanad': ['wayanad', 'wayanad'],
        'kannur': ['kannur', 'cannanore'],
        'cannanore': ['kannur', 'cannanore']
      };
      
      const searchLower = search.toLowerCase();
      let searchTerms = [search];
      
      // Add aliases if found
      if (cityAliases[searchLower]) {
        searchTerms = [...new Set([...searchTerms, ...cityAliases[searchLower]])];
      }
      
      // Build search conditions for name, city, and state
      const searchConditions = [];
      searchTerms.forEach(term => {
        searchConditions.push('name LIKE ?');
        searchConditions.push('city LIKE ?');
        searchConditions.push('state LIKE ?');
      });
      
      whereClause += ` AND (${searchConditions.join(' OR ')})`;
      
      // Add parameters for each search term
      searchTerms.forEach(term => {
        const searchTerm = `%${term}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      });
      
      // Debug logging
      console.log('🔍 Search:', search);
      console.log('🔍 Search terms:', searchTerms);
      console.log('🔍 Total conditions:', searchConditions.length);
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
    const totalResult = await db.get(countQuery, params);
    const totalColleges = totalResult.count;

    // Get filtered results - if no limit, get all colleges
    let collegesQuery;
    let queryParams;
    
    if (limit) {
      // Paginated query
      collegesQuery = `
        SELECT c.id, c.name, c.city, c.state, c.management_type, c.establishment_year, c.college_type, 
               c.university
        FROM colleges c
        ${whereClause}
        ORDER BY c.name
        LIMIT ? OFFSET ?
      `;
      queryParams = [...params, limit, offset];
    } else {
      // Get all colleges without pagination
      collegesQuery = `
        SELECT c.id, c.name, c.city, c.state, c.management_type, c.establishment_year, c.college_type, 
               c.university
        FROM colleges c
        ${whereClause}
        ORDER BY c.name
      `;
      queryParams = params;
    }
    
    const colleges = await db.all(collegesQuery, queryParams);

    // Enhance colleges with program and seat data
    const enhancedColleges = await Promise.all(
      colleges.map(async (college) => {
        const programData = await getCollegeProgramData(college.name, college.college_type);
        return {
          ...college,
          total_programs: programData.total_programs,
          total_seats: programData.total_seats
        };
      })
    );

    res.json({
      data: enhancedColleges,
      pagination: {
        page: limit ? page : 1,
        limit: limit || totalColleges,
        totalPages: limit ? Math.ceil(totalColleges / limit) : 1,
        totalItems: totalColleges,
        hasNext: limit ? page < Math.ceil(totalColleges / limit) : false,
        hasPrev: limit ? page > 1 : false
      },
      filters: {
        applied: { state, city, management_type, college_type, stream, course, branch, search },
        available: await getAvailableFilters(db, { state, city, management_type, college_type, stream, course, branch })
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get available filter options - synchronized with courses
async function getAvailableFilters(db, currentFilters = {}) {
  try {
    const { stream, course, branch, state, college_type } = currentFilters;
    
    // Base queries
    let statesQuery = 'SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL';
    let citiesQuery = 'SELECT DISTINCT city FROM colleges WHERE city IS NOT NULL';
    let managementTypesQuery = 'SELECT DISTINCT management_type FROM colleges WHERE management_type IS NOT NULL';
    let collegeTypesQuery = 'SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL';
    let streamsQuery = 'SELECT DISTINCT course_type as stream FROM programs WHERE course_type IS NOT NULL';
    let coursesQuery = 'SELECT DISTINCT name as course FROM programs WHERE name IS NOT NULL';
    let branchesQuery = 'SELECT DISTINCT specialization as branch FROM programs WHERE specialization IS NOT NULL';
    
    let params = [];
    
    // Apply filters to get synchronized options
    if (stream || course || branch) {
      // Filter colleges based on program criteria
      let programFilter = 'WHERE 1=1';
      if (stream) {
        programFilter += ' AND course_type = ?';
        params.push(stream);
      }
      if (course) {
        programFilter += ' AND name = ?';
        params.push(course);
      }
      if (branch) {
        programFilter += ' AND specialization = ?';
        params.push(branch);
      }
      
      // Get college IDs that match the program criteria
      const collegeIdsQuery = `
        SELECT DISTINCT college_id 
        FROM programs 
        ${programFilter}
      `;
      const collegeIds = await db.all(collegeIdsQuery, params);
      const collegeIdList = collegeIds.map(c => c.college_id);
      
      if (collegeIdList.length > 0) {
        // Filter other options based on these colleges
        const collegeFilter = `WHERE id IN (${collegeIdList.map(() => '?').join(',')})`;
        statesQuery = `SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL AND id IN (${collegeIdList.map(() => '?').join(',')})`;
        citiesQuery = `SELECT DISTINCT city FROM colleges WHERE city IS NOT NULL AND id IN (${collegeIdList.map(() => '?').join(',')})`;
        managementTypesQuery = `SELECT DISTINCT management_type FROM colleges WHERE management_type IS NOT NULL AND id IN (${collegeIdList.map(() => '?').join(',')})`;
        collegeTypesQuery = `SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL AND id IN (${collegeIdList.map(() => '?').join(',')})`;
        
        // Add college IDs to params for these queries
        const collegeParams = [...collegeIdList, ...collegeIdList, ...collegeIdList, ...collegeIdList];
        params = [...params, ...collegeParams];
      } else {
        // No colleges match the criteria, return empty results
        return {
          states: [],
          cities: [],
          managementTypes: [],
          collegeTypes: [],
          streams: streams.map(s => s.stream),
          courses: [],
          branches: []
        };
      }
    }
    
    // If state is selected, filter other options
    if (state) {
      if (stream || course || branch) {
        // If we already have program filtering, modify the existing queries
        statesQuery = statesQuery.replace('WHERE', 'WHERE state = ? AND');
        citiesQuery = citiesQuery.replace('WHERE', 'WHERE state = ? AND');
        managementTypesQuery = managementTypesQuery.replace('WHERE', 'WHERE state = ? AND');
        collegeTypesQuery = collegeTypesQuery.replace('WHERE', 'WHERE college_type = ? AND');
      } else {
        // No program filtering, append to base queries
        statesQuery += ' AND state = ?';
        citiesQuery += ' AND state = ?';
        managementTypesQuery += ' AND state = ?';
        collegeTypesQuery += ' AND state = ?';
      }
      params.push(state, state, state, state);
    }
    
    // If college_type is selected, filter other options
    if (college_type) {
      if (stream || course || branch) {
        // If we already have program filtering, modify the existing queries
        statesQuery = statesQuery.replace('WHERE', 'WHERE college_type = ? AND');
        citiesQuery = citiesQuery.replace('WHERE', 'WHERE college_type = ? AND');
        managementTypesQuery = managementTypesQuery.replace('WHERE', 'WHERE college_type = ? AND');
        collegeTypesQuery = collegeTypesQuery.replace('WHERE', 'WHERE college_type = ? AND');
      } else {
        // No program filtering, append to base queries
        statesQuery += ' AND college_type = ?';
        citiesQuery += ' AND college_type = ?';
        managementTypesQuery += ' AND college_type = ?';
        collegeTypesQuery += ' AND college_type = ?';
      }
      params.push(college_type, college_type, college_type, college_type);
    }
    
    // Execute queries
    const [states, cities, managementTypes, collegeTypes, streams, courses, branches] = await Promise.all([
      db.all(statesQuery + ' ORDER BY state', params),
      db.all(citiesQuery + ' ORDER BY city', params),
      db.all(managementTypesQuery + ' ORDER BY management_type', params),
      db.all(collegeTypesQuery + ' ORDER BY college_type', params),
      db.all(streamsQuery + ' ORDER BY course_type', []),
      db.all(coursesQuery + (stream ? ' AND course_type = ?' : '') + ' ORDER BY name', stream ? [stream] : []),
      db.all(branchesQuery + (stream ? ' AND course_type = ?' : '') + ' ORDER BY specialization', stream ? [stream] : [])
    ]);
    
    return {
      states: states.map(s => s.state),
      cities: cities.map(c => c.city),
      managementTypes: managementTypes.map(m => m.management_type),
      collegeTypes: collegeTypes.map(c => c.college_type),
      streams: streams.map(s => s.stream),
      courses: courses.map(c => c.course),
      branches: branches.map(b => b.branch)
    };
  } catch (err) {
    console.error('Error getting available filters:', err);
    return { 
      states: [], 
      cities: [], 
      managementTypes: [], 
      collegeTypes: [],
      streams: [],
      courses: [],
      branches: []
    };
  }
}

// Get a single college by ID
exports.getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase('clean-unified.db');
    
    // Get college details from the correct table with correct field names
    const college = await db.get('SELECT * FROM colleges WHERE id = ?', id);

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get program and seat data for this college
    let totalPrograms = 0;
    let totalSeats = 0;
    
    try {
      const programData = await getCollegeProgramData(college.name, college.college_type);
      totalPrograms = programData.total_programs;
      totalSeats = programData.total_seats;
    } catch (error) {
      console.error(`Error fetching program data for college ${college.name}:`, error);
      // Continue with default values
    }

    // Transform the response to match the expected format
    const transformedCollege = {
      id: college.id,
      name: college.name,
      city: college.city,
      state: college.state,
      college_type: college.college_type,
      management_type: college.management_type,
      establishment_year: college.establishment_year,
      university: college.university,
      total_programs: totalPrograms,
      total_seats: totalSeats,
      status: 'active' // Default status
    };

    res.json(transformedCollege);
  } catch (err) {
    next(err);
  }
};

// Advanced search functionality
exports.searchColleges = async (req, res, next) => {
  try {
    const { q, filters } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const db = dbManager.getDatabase('clean-unified.db');
    
    // Enhanced search with multiple fields and relevance scoring
    const searchQuery = `
      SELECT id, name, city, state, management_type, establishment_year, college_type,
             university,
             CASE 
               WHEN name LIKE ? THEN 100
               WHEN name LIKE ? THEN 80
               WHEN city LIKE ? THEN 60
               WHEN state LIKE ? THEN 40
               ELSE 20
             END as relevance_score
      FROM colleges 
      WHERE name LIKE ? OR city LIKE ? OR state LIKE ? OR university LIKE ?
      ORDER BY relevance_score DESC, name
      LIMIT 50
    `;
    
    const exactMatch = q;
    const startsWith = `${q}%`;
    const contains = `%${q}%`;
    const results = await db.all(searchQuery, [
      exactMatch, startsWith, contains, contains, 
      contains, contains, contains, contains
    ]);

    res.json({
      query: q,
      results,
      total: results.length
    });
  } catch (err) {
    next(err);
  }
};

// Get filter options for the frontend
exports.getFilterOptions = async (req, res, next) => {
  try {
    const db = dbManager.getDatabase('clean-unified.db');
    // Get current filters from query parameters
    const { stream, course, branch, state, college_type } = req.query;
    const currentFilters = { stream, course, branch, state, college_type };
    const filters = await getAvailableFilters(db, currentFilters);
    
    res.json(filters);
  } catch (err) {
    next(err);
  }
};

// Get colleges by type (medical, dental, etc.)
exports.getCollegesByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    
    const db = dbManager.getDatabase('clean-unified.db');
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM colleges WHERE college_type = ?`;
    const totalResult = await db.get(countQuery, [type]);
    const totalColleges = totalResult.count;
    
    // Get colleges by type
    const collegesQuery = `
      SELECT id, name, city, state, management_type, establishment_year, 
             university
      FROM colleges 
      WHERE college_type = ?
      ORDER BY name
      LIMIT ? OFFSET ?
    `;
    
    const colleges = await db.all(collegesQuery, [type, limit, offset]);

    res.json({
      data: colleges,
      type,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalColleges / limit),
        totalItems: totalColleges,
        hasNext: page < Math.ceil(totalColleges / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get programs for a specific college
exports.getCollegePrograms = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    
    if (!collegeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'College ID is required' 
      });
    }

    const db = dbManager.getDatabase('unified.db');
    
    // Get college details
    const collegeQuery = 'SELECT id, name, city, state, college_type, management_type FROM colleges WHERE id = ?';
    const college = await db.get(collegeQuery, [collegeId]);
    
    if (!college) {
      return res.status(404).json({ 
        success: false, 
        message: 'College not found' 
      });
    }
    
    // Get all programs for this college
    const programsQuery = `
      SELECT id, name, level, course_type, duration, entrance_exam, total_seats, status
      FROM programs 
      WHERE college_id = ? 
      ORDER BY name
    `;
    
    const programs = await db.all(programsQuery, [collegeId]);
    
    // Get total seats across all programs
    const totalSeatsQuery = 'SELECT SUM(total_seats) as total_seats FROM programs WHERE college_id = ?';
    const totalSeatsResult = await db.get(totalSeatsQuery, [collegeId]);
    
    res.json({
      success: true,
      data: {
        college: {
          id: college.id,
          name: college.name,
          city: college.city,
          state: college.state,
          college_type: college.college_type,
          management_type: college.management_type
        },
        programs: programs,
        summary: {
          total_programs: programs.length,
          total_seats: totalSeatsResult.total_seats || 0
        }
      }
    });
    
  } catch (err) {
    console.error('Error fetching college programs:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: err.message 
    });
  }
};