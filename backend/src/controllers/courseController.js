const dbManager = require('../database/DatabaseManager');

// Get all courses with filtering and pagination
exports.getAllCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const { 
      stream, 
      course, 
      branch, 
      state, 
      college_type, 
      level,
      search,
      college_id
    } = req.query;
    
    const db = dbManager.getDatabase('clean-unified.db');
    
    // Build dynamic query based on filters
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.specialization LIKE ? OR c.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
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
    
    if (state) {
      whereClause += ' AND c.state = ?';
      params.push(state);
    }
    
    if (college_type) {
      whereClause += ' AND c.college_type = ?';
      params.push(college_type);
    }
    
    if (level) {
      whereClause += ' AND p.level = ?';
      params.push(level);
    }
    
    if (college_id) {
      whereClause += ' AND p.college_id = ?';
      params.push(college_id);
    }
    
    // Get total count for pagination (count unique courses, not course-college combinations)
    const countQuery = `
      SELECT COUNT(DISTINCT p.name) as count 
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      ${whereClause}
    `;
    const totalResult = await db.get(countQuery, params);
    const totalCourses = totalResult.count;
    
    // Get courses with college information - group by course name to avoid duplicates
    const coursesQuery = `
      SELECT 
        p.id,
        p.name as course_name,
        p.level,
        p.course_type as stream,
        p.specialization as branch,
        p.duration,
        p.total_seats,
        p.entrance_exam,
        c.id as college_id,
        c.name as college_name,
        c.city,
        c.state,
        c.college_type,
        c.management_type,
        c.establishment_year
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      ${whereClause}
      ORDER BY p.name, c.name
    `;
    
    const rawCourses = await db.all(coursesQuery, params);
    
    let courses;
    
    // If filtering by college_id, return individual course records for that college
    if (college_id) {
      courses = rawCourses.map(course => ({
        id: course.id,
        course_name: course.course_name,
        stream: course.stream,
        level: course.level,
        branch: course.branch,
        duration: course.duration || 'N/A',
        total_seats: course.total_seats || 0,
        entrance_exam: course.entrance_exam,
        college_id: course.college_id,
        college_name: course.college_name,
        city: course.city,
        state: course.state,
        college_type: course.college_type,
        management_type: course.management_type,
        establishment_year: course.establishment_year
      }));
    } else {
      // Group courses by course name and create colleges array (original logic)
      const groupedCourses = {};
      rawCourses.forEach(course => {
        if (!groupedCourses[course.course_name]) {
          groupedCourses[course.course_name] = {
            course_name: course.course_name,
            stream: course.stream,
            level: course.level,
            branch: course.branch,
            duration: course.duration,
            entrance_exam: course.entrance_exam,
            colleges: []
          };
        }
        
        // Add college information
        groupedCourses[course.course_name].colleges.push({
          college_id: course.college_id,
          college_name: course.college_name,
          city: course.city,
          state: course.state,
          college_type: course.college_type,
          management_type: course.management_type,
          establishment_year: course.establishment_year,
          total_seats: course.total_seats
        });
      });
      
      // Convert to array and calculate total seats, also handle duration variations
      courses = Object.values(groupedCourses).map(course => {
        const totalSeats = course.colleges.reduce((sum, college) => sum + (college.total_seats || 0), 0);
      
      // Handle duration variations - if multiple durations exist, show the most common or a range
      let finalDuration = course.duration;
      if (course.colleges.length > 1) {
        const durations = course.colleges.map(college => college.duration).filter(d => d !== null && d !== undefined);
        if (durations.length > 0) {
          // If all durations are the same, use that
          if (durations.every(d => d === durations[0])) {
            finalDuration = durations[0];
          } else {
            // If different durations, show the most common or a range
            const durationCounts = {};
            durations.forEach(d => durationCounts[d] = (durationCounts[d] || 0) + 1);
            const mostCommonDuration = Object.keys(durationCounts).reduce((a, b) => 
              durationCounts[a] > durationCounts[b] ? a : b
            );
            finalDuration = mostCommonDuration;
          }
        }
      }
      
      // Set default durations for specific courses if duration is null/undefined
      if (!finalDuration || finalDuration === 'N/A' || finalDuration === null || finalDuration === undefined) {
        const courseName = course.course_name.toUpperCase();
        if (courseName.includes('MBBS')) {
          finalDuration = '66';
        } else if (courseName.includes('BDS')) {
          finalDuration = '48';
        } else if (courseName.includes('MD') || courseName.includes('MS')) {
          finalDuration = '36';
        } else if (courseName.includes('MDS')) {
          finalDuration = '36';
        } else if (courseName.includes('DNB')) {
          finalDuration = '36';
        } else if (courseName.includes('DIPLOMA')) {
          finalDuration = '24';
        } else {
          finalDuration = 'N/A';
        }
      }
      
        return {
          ...course,
          duration: finalDuration,
          total_seats: totalSeats
        };
      });
    }
    
    // Sort courses: courses with seats first (descending by seats), then 0-seat courses at the end
    courses.sort((a, b) => {
      // If both have seats, sort by seat count descending
      if (a.total_seats > 0 && b.total_seats > 0) {
        return b.total_seats - a.total_seats;
      }
      // If one has seats and one doesn't, put the one with seats first
      if (a.total_seats > 0 && b.total_seats === 0) {
        return -1;
      }
      if (a.total_seats === 0 && b.total_seats > 0) {
        return 1;
      }
      // If both have 0 seats, sort alphabetically by course name
      if (a.total_seats === 0 && b.total_seats === 0) {
        return a.course_name.localeCompare(b.course_name);
      }
      return 0;
    });
    
    // Apply pagination after grouping
    const startIndex = offset;
    const endIndex = startIndex + limit;
    courses = courses.slice(startIndex, endIndex);
    
    res.json({
      data: courses,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        hasNext: page < Math.ceil(totalCourses / limit),
        hasPrev: page > 1
      },
      filters: {
        applied: { stream, course, branch, state, college_type, level, search },
        available: await getAvailableFilters(db, { stream, course, branch, state, college_type, level })
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get available filter options for courses
exports.getFilterOptions = async (req, res, next) => {
  try {
    const db = dbManager.getDatabase('clean-unified.db');
    // Get current filters from query parameters
    const { stream, course, branch, state, college_type, level } = req.query;
    const currentFilters = { stream, course, branch, state, college_type, level };
    const filters = await getAvailableFilters(db, currentFilters);
    res.json(filters);
  } catch (err) {
    next(err);
  }
};

// Get available filter options - synchronized with colleges
async function getAvailableFilters(db, currentFilters = {}) {
  try {
    const { stream, course, branch, state, college_type, level } = currentFilters;
    
    // Base queries
    let streamsQuery = 'SELECT DISTINCT course_type as stream FROM programs WHERE course_type IS NOT NULL';
    let coursesQuery = 'SELECT DISTINCT name as course FROM programs WHERE name IS NOT NULL';
    let branchesQuery = 'SELECT DISTINCT specialization as branch FROM programs WHERE specialization IS NOT NULL';
    let statesQuery = 'SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL';
    let collegeTypesQuery = 'SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL';
    let levelsQuery = 'SELECT DISTINCT level FROM programs WHERE level IS NOT NULL';
    
    let params = [];
    
    // Apply filters to get synchronized options
    if (stream || course || branch || level) {
      // Filter programs based on criteria
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
      if (level) {
        programFilter += ' AND level = ?';
        params.push(level);
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
        statesQuery += ` AND id IN (${collegeIdList.map(() => '?').join(',')})`;
        collegeTypesQuery += ` AND id IN (${collegeIdList.map(() => '?').join(',')})`;
        
        // Add college IDs to params for these queries
        const collegeParams = [...collegeIdList, ...collegeIdList];
        params = [...params, ...collegeParams];
      } else {
        // No colleges match the criteria, return empty results
        return {
          streams: streams.map(s => s.stream),
          courses: [],
          branches: [],
          states: [],
          collegeTypes: [],
          levels: []
        };
      }
    }
    
    // If state is selected, filter other options
    if (state) {
      statesQuery += ' AND state = ?';
      collegeTypesQuery += ' AND state = ?';
      params.push(state, state);
    }
    
    // If college_type is selected, filter other options
    if (college_type) {
      statesQuery += ' AND college_type = ?';
      collegeTypesQuery += ' AND college_type = ?';
      params.push(college_type, college_type);
    }
    
    // Execute queries
    const [streams, courses, branches, states, collegeTypes, levels] = await Promise.all([
      db.all(streamsQuery + ' ORDER BY course_type', []),
      db.all(coursesQuery + (stream ? ' AND course_type = ?' : '') + ' ORDER BY name', stream ? [stream] : []),
      db.all(branchesQuery + (stream ? ' AND course_type = ?' : '') + ' ORDER BY specialization', stream ? [stream] : []),
      db.all(statesQuery + ' ORDER BY state', params),
      db.all(collegeTypesQuery + ' ORDER BY college_type', params),
      db.all(levelsQuery + (stream ? ' AND course_type = ?' : '') + ' ORDER BY level', stream ? [stream] : [])
    ]);
    
    return {
      streams: streams.map(s => s.stream),
      courses: courses.map(c => c.course),
      branches: branches.map(b => b.branch),
      states: states.map(s => s.state),
      collegeTypes: collegeTypes.map(c => c.college_type),
      levels: levels.map(l => l.level)
    };
  } catch (err) {
    console.error('Error getting available filters:', err);
    return { 
      streams: [], 
      courses: [], 
      branches: [], 
      states: [], 
      collegeTypes: [], 
      levels: [] 
    };
  }
}

// Search courses
exports.searchCourses = async (req, res, next) => {
  try {
    const { q, filters } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const db = dbManager.getDatabase('clean-unified.db');
    
    // Enhanced search with multiple fields and relevance scoring
    const searchQuery = `
      SELECT 
        p.id,
        p.name as course_name,
        p.level,
        p.course_type as stream,
        p.specialization as branch,
        p.duration,
        p.total_seats,
        c.name as college_name,
        c.city,
        c.state,
        c.college_type,
        CASE 
          WHEN p.name LIKE ? THEN 100
          WHEN p.specialization LIKE ? THEN 80
          WHEN c.name LIKE ? THEN 60
          WHEN c.city LIKE ? THEN 40
          ELSE 20
        END as relevance_score
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      WHERE p.name LIKE ? OR p.specialization LIKE ? OR c.name LIKE ? OR c.city LIKE ?
      ORDER BY relevance_score DESC, p.name
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

// Get courses by type
exports.getCoursesByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page, 10) || 20;
    const offset = (page - 1) * limit;
    
    const db = dbManager.getDatabase('clean-unified.db');
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      WHERE p.course_type = ?
    `;
    const totalResult = await db.get(countQuery, [type]);
    const totalCourses = totalResult.count;
    
    // Get courses by type
    const coursesQuery = `
      SELECT 
        p.id,
        p.name as course_name,
        p.level,
        p.course_type as stream,
        p.specialization as branch,
        p.duration,
        p.total_seats,
        c.name as college_name,
        c.city,
        c.state,
        c.college_type
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      WHERE p.course_type = ?
      ORDER BY c.name, p.name
      LIMIT ? OFFSET ?
    `;
    
    const courses = await db.all(coursesQuery, [type, limit, offset]);

    res.json({
      data: courses,
      type,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        hasNext: page < Math.ceil(totalCourses / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get courses by level
exports.getCoursesByLevel = async (req, res, next) => {
  try {
    const { level } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.page, 10) || 20;
    const offset = (page - 1) * limit;
    
    const db = dbManager.getDatabase('clean-unified.db');
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      WHERE p.level = ?
    `;
    const totalResult = await db.get(countQuery, [level]);
    const totalCourses = totalResult.count;
    
    // Get courses by level
    const coursesQuery = `
      SELECT 
        p.id,
        p.name as course_name,
        p.level,
        p.course_type as stream,
        p.specialization as branch,
        p.duration,
        p.total_seats,
        c.name as college_name,
        c.city,
        c.state,
        c.college_type
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      WHERE p.level = ?
      ORDER BY c.name, p.name
      LIMIT ? OFFSET ?
    `;
    
    const courses = await db.all(coursesQuery, [level, limit, offset]);

    res.json({
      data: courses,
      level,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        hasNext: page < Math.ceil(totalCourses / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get a specific course by ID
exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase('clean-unified.db');
    
    const course = await db.get(`
      SELECT 
        p.*,
        c.name as college_name,
        c.city,
        c.state,
        c.college_type,
        c.management_type
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      WHERE p.id = ?
    `, id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};

// Get courses for a specific college
exports.getCoursesByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const db = dbManager.getDatabase('clean-unified.db');
    
    const courses = await db.all(`
      SELECT 
        p.id,
        p.name as course_name,
        p.level,
        p.course_type as stream,
        p.specialization as branch,
        p.duration,
        p.total_seats,
        p.entrance_exam
      FROM programs p 
      WHERE p.college_id = ?
      ORDER BY p.name
    `, [collegeId]);

    res.json({
      collegeId,
      courses,
      total: courses.length
    });
  } catch (err) {
    next(err);
  }
};
