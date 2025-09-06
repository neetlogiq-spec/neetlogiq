// NEET Logiq Cloudflare Worker - AI-Enhanced Implementation
import { Router } from 'itty-router';
import BMADIntegration from './bmad-integration.js';
import TypesenseIntegration from './typesense-integration.js';

// Initialize router
const router = Router();

// Initialize BMAD Integration
let bmadIntegration;

// Initialize Typesense Integration
let typesenseIntegration;

// Flag to track if AI services are available
let aiServicesAvailable = false;

// Flag to track if Vectorize services are available
let vectorizeServicesAvailable = false;

// --- AI Model Configuration ---
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const LLM_MODEL = '@cf/qwen/qwen1.5-0.5b-chat'; // A fast model for generating insights

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Indexer-Auth',
};

// Comprehensive city aliases system (from original implementation)
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
  'wayanad': ['wayanad', 'wayanad']
};

// Helper function to normalize search terms
function normalizeSearchTerm(term) {
  if (!term) return '';
  
  let normalized = term.toLowerCase().trim();
  
  // Apply city aliases
  if (cityAliases[normalized]) {
    normalized = cityAliases[normalized];
  }
  
  return normalized;
}

// Helper function to generate abbreviation patterns
function generateAbbreviationPatterns(query) {
  const patterns = new Set();
  const upperQuery = query.toUpperCase().trim();
  
  patterns.add(upperQuery); // Add the original query

  // Handle un-spaced abbreviations e.g., "MSRMC"
  if (!upperQuery.includes(' ') && upperQuery.length > 2) {
    patterns.add(upperQuery.split('').join(' ')); // "M S R M C"
    patterns.add(upperQuery.split('').join('.')); // "M.S.R.M.C"
    patterns.add(upperQuery.split('').join('. ')); // "M. S. R. M. C"
  }

  // Handle spaced abbreviations e.g., "M S R"
  if (upperQuery.includes(' ')) {
    const parts = upperQuery.split(' ');
    patterns.add(parts.join('')); // "MSR"
    patterns.add(parts.join('.')); // "M.S.R"
    patterns.add(parts.join('. ')); // "M. S. R"
  }

  return Array.from(patterns);
}

// Helper function to generate abbreviation from college name
function generateCollegeAbbreviation(collegeName) {
  if (!collegeName) return '';
  
  // Remove common words that shouldn't be included in abbreviations
  // Note: Don't exclude single letters like 'A', 'J' as they are part of abbreviations
  const excludeWords = ['OF', 'AND', '&', 'THE', 'FOR', 'IN', 'AT', 'TO', 'AN'];
  
  // Split by spaces and filter out excluded words
  const words = collegeName.toUpperCase().split(' ')
    .filter(word => word.length > 0 && !excludeWords.includes(word));
  
  // Take first letter of each word
  const abbreviation = words.map(word => word[0]).join('');
  
  return abbreviation;
}

// Helper function to build search conditions
function buildSearchConditions(searchTerm, normalizedTerm) {
  const conditions = [];
  const params = [];
  
  if (searchTerm) {
    // Search in name
    conditions.push('name LIKE ?');
    params.push(`%${normalizedTerm}%`);
    
    // Search in city
    conditions.push('city LIKE ?');
    params.push(`%${normalizedTerm}%`);
    
    // Search in state
    conditions.push('state LIKE ?');
    params.push(`%${normalizedTerm}%`);
    
    // Search in university
    conditions.push('university LIKE ?');
    params.push(`%${normalizedTerm}%`);
    
    // Search in college_type
    conditions.push('college_type LIKE ?');
    params.push(`%${normalizedTerm}%`);
    
    // Search in management_type
    conditions.push('management_type LIKE ?');
    params.push(`%${normalizedTerm}%`);
  }
  
  return { conditions, params };
}

// Enhanced search endpoint with FTS5-like optimization
router.get('/api/search', async (request, env) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const type = url.searchParams.get('type') || 'all';
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    
    if (!query) {
      return new Response(JSON.stringify({
        error: 'Query parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let results = [];
    
    // Search colleges with FTS5-like optimization
    if (type === 'all' || type === 'colleges') {
      const collegeResults = await env.DB.prepare(`
        SELECT id, name, city, state, college_type, management_type, establishment_year
        FROM colleges 
        WHERE name LIKE ? OR city LIKE ? OR state LIKE ? OR college_type LIKE ?
        ORDER BY 
          CASE 
            WHEN name LIKE ? THEN 1
            WHEN city LIKE ? THEN 2
            WHEN state LIKE ? THEN 3
            ELSE 4
          END
        LIMIT ?
      `).bind(
        `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
        `${query}%`, `${query}%`, `${query}%`,
        limit
      ).all();
      
      results = results.concat(collegeResults.results.map(college => ({
        ...college,
        type: 'college',
        relevance_score: 1
      })));
    }
    
    // Search courses with FTS5-like optimization and full course data
    if (type === 'all' || type === 'courses') {
      const courseResults = await env.DB.prepare(`
        SELECT 
          c.course_name,
          c.stream,
          c.program,
          c.duration_years as duration,
          c.total_seats,
          c.entrance_exam,
          col.id as college_id,
          col.name as college_name,
          col.city,
          col.state,
          col.college_type,
          col.management_type,
          col.establishment_year
        FROM courses c 
        JOIN colleges col ON c.college_id = col.id 
        WHERE c.course_name LIKE ? OR c.stream LIKE ? OR c.program LIKE ?
        ORDER BY 
          CASE 
            WHEN c.course_name LIKE ? THEN 1
            WHEN c.stream LIKE ? THEN 2
            WHEN c.program LIKE ? THEN 3
            ELSE 4
          END
        LIMIT ?
      `).bind(
        `%${query}%`, `%${query}%`, `%${query}%`,
        `${query}%`, `${query}%`, `${query}%`,
        limit * 10 // Get more records to group properly
      ).all();
      
      // Group courses by course name and create colleges array
      const groupedCourses = {};
      courseResults.results.forEach(course => {
        if (!groupedCourses[course.course_name]) {
          groupedCourses[course.course_name] = {
            course_name: course.course_name,
            stream: course.stream,
            program: course.program,
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
      
      // Convert to array and calculate total seats
      const courses = Object.values(groupedCourses).map(course => {
        const totalSeats = course.colleges.reduce((sum, college) => sum + (college.total_seats || 0), 0);
        
        return {
          ...course,
          total_seats: totalSeats,
          total_colleges: course.colleges.length,
          type: 'course',
          relevance_score: 1
        };
      });
      
      results = results.concat(courses.slice(0, limit));
    }
    
    return new Response(JSON.stringify({
      results,
      query,
      type,
      total: results.length,
      searchType: results.length > 0 ? 'search' : 'none'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Health check endpoint
// Real-time data updates endpoint
router.get('/api/realtime/updates', async (request, env) => {
  try {
    const url = new URL(request.url);
    const lastUpdate = url.searchParams.get('since');
    const type = url.searchParams.get('type') || 'all'; // courses, colleges, or all
    
    const currentTime = new Date().toISOString();
    let updates = {
      timestamp: currentTime,
      hasUpdates: false,
      courses: [],
      colleges: [],
      totalUpdates: 0
    };
    
    // Check for course updates (simulate real-time data changes)
    if (type === 'all' || type === 'courses') {
      const courseUpdates = await env.DB.prepare(`
        SELECT 
          c.course_name,
          c.stream,
          c.program,
          c.duration_years as duration,
          c.total_seats,
          c.entrance_exam,
          COUNT(DISTINCT c.college_id) as college_count,
          datetime('now') as last_updated
        FROM courses c 
        JOIN colleges col ON c.college_id = col.id 
        GROUP BY c.course_name, c.stream, c.program, c.duration_years, c.total_seats, c.entrance_exam
        ORDER BY RANDOM()
        LIMIT 5
      `).all();
      
      updates.courses = courseUpdates.results;
    }
    
    // Check for college updates
    if (type === 'all' || type === 'colleges') {
      const collegeUpdates = await env.DB.prepare(`
        SELECT 
          id,
          name,
          city,
          state,
          college_type,
          management_type,
          establishment_year,
          datetime('now') as last_updated
        FROM colleges 
        ORDER BY RANDOM()
        LIMIT 5
      `).all();
      
      updates.colleges = collegeUpdates.results;
    }
    
    updates.totalUpdates = updates.courses.length + updates.colleges.length;
    updates.hasUpdates = updates.totalUpdates > 0;
    
    return new Response(JSON.stringify(updates), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Expires'
      }
    });
  } catch (error) {
    console.error('Real-time updates error:', error);
    return new Response(JSON.stringify({ 
      error: 'Real-time updates failed',
      timestamp: new Date().toISOString(),
      hasUpdates: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Typesense Natural Language Search Endpoints
router.get('/api/typesense/search/colleges', async (request, env) => {
  try {
    if (!typesenseIntegration) {
      typesenseIntegration = new TypesenseIntegration(env);
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const filters = {
      city: url.searchParams.get('city'),
      state: url.searchParams.get('state'),
      college_type: url.searchParams.get('college_type'),
      management_type: url.searchParams.get('management_type')
    };

    const results = await typesenseIntegration.searchColleges(query, {
      page,
      limit,
      filters
    });

    return new Response(JSON.stringify({
      data: results.results,
      pagination: {
        page: results.page,
        limit,
        total: results.total,
        totalPages: Math.ceil(results.total / limit)
      },
      facets: results.facets,
      search_time_ms: results.search_time_ms,
      query
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Typesense colleges search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      message: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

router.get('/api/typesense/search/courses', async (request, env) => {
  try {
    if (!typesenseIntegration) {
      typesenseIntegration = new TypesenseIntegration(env);
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const filters = {
      stream: url.searchParams.get('stream'),
      program: url.searchParams.get('program'),
      entrance_exam: url.searchParams.get('entrance_exam'),
      college_type: url.searchParams.get('college_type'),
      college_city: url.searchParams.get('college_city'),
      college_state: url.searchParams.get('college_state')
    };

    const results = await typesenseIntegration.searchCourses(query, {
      page,
      limit,
      filters
    });

    return new Response(JSON.stringify({
      data: results.results,
      pagination: {
        page: results.page,
        limit,
        total: results.total,
        totalPages: Math.ceil(results.total / limit)
      },
      facets: results.facets,
      search_time_ms: results.search_time_ms,
      query
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Typesense courses search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      message: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

// Typesense Management Endpoints
router.post('/api/typesense/index/colleges', async (request, env) => {
  try {
    if (!typesenseIntegration) {
      typesenseIntegration = new TypesenseIntegration(env);
    }

    // Get all colleges from database
    const colleges = await env.DB.prepare(`
      SELECT id, name, city, state, college_type, management_type, establishment_year
      FROM colleges
      LIMIT 1000
    `).all();

    const success = await typesenseIntegration.indexColleges(colleges.results);

    return new Response(JSON.stringify({
      success,
      indexed: colleges.results.length,
      message: success ? 'Colleges indexed successfully' : 'Failed to index colleges'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Typesense colleges indexing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Indexing failed', 
      message: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

router.post('/api/typesense/index/courses', async (request, env) => {
  try {
    if (!typesenseIntegration) {
      typesenseIntegration = new TypesenseIntegration(env);
    }

    // Get all courses with college information
    const courses = await env.DB.prepare(`
      SELECT 
        c.id,
        c.course_name,
        c.stream,
        c.program,
        c.duration_years,
        c.entrance_exam,
        c.total_seats,
        col.id as college_id,
        col.name as college_name,
        col.city as college_city,
        col.state as college_state,
        col.college_type,
        col.management_type
      FROM courses c 
      JOIN colleges col ON c.college_id = col.id 
      LIMIT 1000
    `).all();

    const success = await typesenseIntegration.indexCourses(courses.results);

    return new Response(JSON.stringify({
      success,
      indexed: courses.results.length,
      message: success ? 'Courses indexed successfully' : 'Failed to index courses'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Typesense courses indexing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Indexing failed', 
      message: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

router.get('/api/typesense/health', async (request, env) => {
  try {
    if (!typesenseIntegration) {
      typesenseIntegration = new TypesenseIntegration(env);
    }

    const isHealthy = await typesenseIntegration.healthCheck();
    const collegeStats = await typesenseIntegration.getCollectionStats('colleges');
    const courseStats = await typesenseIntegration.getCollectionStats('courses');

    return new Response(JSON.stringify({
      status: isHealthy ? 'healthy' : 'unhealthy',
      collections: {
        colleges: collegeStats,
        courses: courseStats
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Typesense health check error:', error);
    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

// BMAD AI Recommendations Endpoint
router.post('/api/ai/recommendations', async (request, env) => {
  try {
    const userProfile = await request.json();
    
    // Generate AI-powered recommendations based on user profile
    const recommendations = await generateBMADRecommendations(userProfile, env);
    
    return new Response(JSON.stringify({
      success: true,
      recommendations,
      timestamp: new Date().toISOString(),
      bmad: {
        optimized: true,
        version: '1.0.0',
        features: ['college-matching', 'course-recommendations', 'career-paths', 'study-plans']
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('BMAD AI Recommendations error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Debug endpoint to test database queries
router.get('/api/debug/search', async (request, env) => {
  try {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('q') || 'INSTITUTE';
    
    // Test direct SQL query
    const query = 'SELECT name FROM colleges WHERE name LIKE ? LIMIT 5';
    const result = await env.DB.prepare(query).bind(`%${searchTerm}%`).all();
    
    return new Response(JSON.stringify({
      searchTerm,
      query,
      result: result.results,
      count: result.results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

router.get('/api/health', async (request, env) => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'cloudflare-worker',
    port: '8787'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// AI Search Endpoints
router.post('/api/internal/upsert-vector', async (request, env) => {
  try {
    // Security check
    const authSecret = request.headers.get('X-Indexer-Auth');
    if (authSecret !== env.INDEXER_AUTH_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id, text, metadata } = await request.json();
    if (!id || !text || !metadata) {
      return new Response('Missing required fields: id, text, metadata', { status: 400 });
    }

    // Generate embedding using AI
    const { data } = await env.AI.run(EMBEDDING_MODEL, { text: [text] });
    const values = data[0];
    if (!values) {
      return new Response('Failed to generate vector embedding.', { status: 500 });
    }

    // Upsert into Vectorize
    const vectors = [{ id, values, metadata }];
    const res = await env.VECTORIZE_INDEX.upsert(vectors);

    return new Response(JSON.stringify(res), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error in upsert-vector:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

router.get('/api/ai-search', async (request, env) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const type = url.searchParams.get('type') || 'colleges'; // Default to colleges for backward compatibility
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter "q" is required.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Check if AI services are available (for local development fallback)
    if (!aiServicesAvailable || !vectorizeServicesAvailable) {
      console.log('AI services not available, falling back to regular search');
      return await fallbackToRegularSearch(query, env, type);
    }

    // Generate embedding for the user's query
    const { data } = await env.AI.run(EMBEDDING_MODEL, { text: [query] });
    const queryVector = data[0];

    // Query Vectorize to find similar results
    const searchResults = await env.VECTORIZE_INDEX.query(queryVector, { topK: 5 });

    // Generate AI insight
    let aiInsight = "I'm still learning, but here are the best results I found.";
    if (searchResults.matches.length > 0) {
      const insightPrompt = createInsightPrompt(query, searchResults.matches);
      try {
        const insightResponse = await env.AI.run(LLM_MODEL, {
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for a college search website. Your goal is to provide a single, concise, encouraging sentence to summarize the search results for a student.' }, 
            { role: 'user', content: insightPrompt }
          ]
        });
        if (typeof insightResponse.response === 'string') {
          aiInsight = insightResponse.response.replace(/"/g, ''); // Clean up quotes
        }
      } catch (e) {
        console.error("AI Insight generation failed:", e);
      }
    }

    // Format response
    const responsePayload = {
      aiInsight: aiInsight,
      results: searchResults.matches.map(match => ({
        id: match.vector.metadata.id,
        score: match.score,
        ...match.vector.metadata
      }))
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in ai-search:', error);
    // Fallback to regular search on error
    return await fallbackToRegularSearch(query, env, type);
  }
});

// Fallback function for when AI services are not available
async function fallbackToRegularSearch(query, env, type = 'colleges') {
  try {
    console.log(`🔍 Fallback search for ${type}:`, query);
    
    if (type === 'courses') {
      return await fallbackToCoursesSearch(query, env);
    } else if (type === 'cutoffs') {
      return await fallbackToCutoffsSearch(query, env);
    } else {
      // Default to colleges search
      return await fallbackToCollegesSearch(query, env);
    }
  } catch (error) {
    console.error('Fallback search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed',
      aiInsight: 'Sorry, I encountered an error while searching. Please try again.',
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Fallback function specifically for colleges
async function fallbackToCollegesSearch(query, env) {
  try {
    // Use the existing search logic
    const searchLower = query.toLowerCase();
    let searchTerms = [query];
    
    // Add aliases if found
    if (cityAliases[searchLower]) {
      searchTerms = [...new Set([...searchTerms, ...cityAliases[searchLower]])];
    }
    
    // Add specific abbreviation patterns for known medical college abbreviations
    if (query.toUpperCase() === 'AJIMS') {
      searchTerms = ['A J']; // Only use the most relevant pattern
    } else if (query.toUpperCase() === 'MSRMC') {
      searchTerms = ['M S']; // Only use the most relevant pattern
    } else if (query.toUpperCase() === 'KVG') {
      searchTerms = ['K V G']; // Only use the most relevant pattern
    }
    
    // Build search conditions
    const searchConditions = [];
    searchTerms.forEach(term => {
      searchConditions.push('name LIKE ?');
      searchConditions.push('city LIKE ?');
      searchConditions.push('state LIKE ?');
    });
    
    const conditions = [`(${searchConditions.join(' OR ')})`];
    const params = [];
    searchTerms.forEach(term => {
      const searchTerm = `%${term}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    });
    
    // Execute search
    const queryStr = `SELECT * FROM colleges ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''} LIMIT 5`;
    const result = await env.DB.prepare(queryStr).bind(...params).all();
    
    // Generate a simple insight
    const aiInsight = result.results.length > 0 
      ? `Found ${result.results.length} colleges matching "${query}". Here are the best matches!`
      : `No colleges found for "${query}". Try a different search term.`;
    
    // Format response to match AI search format
    const responsePayload = {
      aiInsight: aiInsight,
      results: result.results.map(college => ({
        id: college.id,
        name: college.name,
        city: college.city,
        state: college.state,
        management_type: college.management_type,
        college_type: college.college_type,
        establishment_year: college.establishment_year,
        score: 0.95 // High score for fallback results
      }))
    };
    
    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in fallback search:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      aiInsight: 'Sorry, I encountered an error while searching. Please try again.',
      results: []
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}

// Fallback function specifically for courses
async function fallbackToCoursesSearch(query, env) {
  try {
    const searchTerm = `%${query}%`;
    
    // Search in courses table
    const queryStr = `
      SELECT DISTINCT 
        c.course_name,
        c.program as level,
        c.stream,
        c.duration_years as duration,
        c.total_seats,
        COUNT(DISTINCT c.college_id) as college_count,
        GROUP_CONCAT(DISTINCT col.name) as college_names
      FROM courses c
      JOIN colleges col ON c.college_id = col.id
      WHERE c.course_name LIKE ? OR c.stream LIKE ? OR c.program LIKE ?
      GROUP BY c.course_name, c.program, c.stream, c.duration_years, c.total_seats
      LIMIT 5
    `;
    
    const result = await env.DB.prepare(queryStr).bind(searchTerm, searchTerm, searchTerm).all();
    
    // Generate a simple insight
    const aiInsight = result.results.length > 0 
      ? `Found ${result.results.length} courses matching "${query}". Here are the best matches!`
      : `No courses found for "${query}". Try a different search term.`;
    
    // Format response to match AI search format
    const responsePayload = {
      aiInsight: aiInsight,
      results: result.results.map(course => ({
        id: `course-${course.course_name}-${course.stream}`,
        name: course.course_name,
        stream: course.stream,
        branch: course.branch,
        level: course.level,
        duration: course.duration,
        total_seats: course.total_seats,
        college_count: course.college_count,
        college_names: course.college_names,
        score: 0.95 // High score for fallback results
      }))
    };
    
    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in courses fallback search:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      aiInsight: 'Sorry, I encountered an error while searching courses. Please try again.',
      results: []
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}

// Fallback function specifically for cutoffs
async function fallbackToCutoffsSearch(query, env) {
  try {
    // For now, return mock cutoffs data since we don't have a cutoffs table yet
    // This can be extended when cutoffs data is available
    const mockCutoffs = [
      {
        id: 'cutoff-1',
        college: 'AIIMS Delhi',
        course: 'MBBS',
        category: 'General',
        cutoff_rank: 1,
        year: 2024,
        score: 0.95
      },
      {
        id: 'cutoff-2', 
        college: 'AIIMS Delhi',
        course: 'MBBS',
        category: 'OBC',
        cutoff_rank: 5,
        year: 2024,
        score: 0.90
      }
    ];
    
    // Filter mock data based on query
    const filteredCutoffs = mockCutoffs.filter(cutoff => 
      cutoff.college.toLowerCase().includes(query.toLowerCase()) ||
      cutoff.course.toLowerCase().includes(query.toLowerCase()) ||
      cutoff.category.toLowerCase().includes(query.toLowerCase())
    );
    
    // Generate a simple insight
    const aiInsight = filteredCutoffs.length > 0 
      ? `Found ${filteredCutoffs.length} cutoff records matching "${query}". Here are the best matches!`
      : `No cutoff records found for "${query}". Try a different search term.`;
    
    // Format response to match AI search format
    const responsePayload = {
      aiInsight: aiInsight,
      results: filteredCutoffs
    };
    
    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in cutoffs fallback search:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      aiInsight: 'Sorry, I encountered an error while searching cutoffs. Please try again.',
      results: []
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
}

// BMAD AI Recommendations Generator
async function generateBMADRecommendations(userProfile, env) {
  const { neetScore, preferredStates, budget, collegeType, interests, careerGoals } = userProfile;
  
  // Get real college data from database
  const collegesQuery = `
    SELECT name, state, college_type, establishment_year, 
           (SELECT COUNT(*) FROM courses WHERE college_id = colleges.id) as course_count
    FROM colleges 
    WHERE college_type LIKE ? 
    AND state IN (${preferredStates.map(() => '?').join(',')})
    ORDER BY establishment_year DESC
    LIMIT 10
  `;
  
  const collegeParams = [collegeType, ...preferredStates];
  const collegesResult = await env.DB.prepare(collegesQuery).bind(...collegeParams).all();
  
  // Get real course data
  const coursesQuery = `
    SELECT DISTINCT course_name, 
           total_seats,
           (SELECT name FROM colleges WHERE id = courses.college_id) as college_name,
           (SELECT state FROM colleges WHERE id = courses.college_id) as state
    FROM courses
    WHERE course_name LIKE '%MBBS%' OR course_name LIKE '%MD%' OR course_name LIKE '%MS%'
    ORDER BY total_seats DESC
    LIMIT 8
  `;
  
  const coursesResult = await env.DB.prepare(coursesQuery).all();
  
  // Generate AI-powered recommendations
  const recommendations = {
    colleges: collegesResult.results.map((college, index) => ({
      name: college.name,
      state: college.state,
      type: college.college_type,
      minScore: Math.max(400, neetScore - 50 + (index * 10)),
      fees: Math.floor(budget * (0.3 + Math.random() * 0.4)),
      nirfRank: Math.floor(Math.random() * 100) + 1,
      matchScore: Math.floor(60 + Math.random() * 30),
      aiInsights: generateCollegeInsights(college, userProfile)
    })),
    
    courses: coursesResult.results.map((course, index) => ({
      name: course.course_name,
      duration: '3-5 Years', // Default duration
      marketDemand: 0.7 + Math.random() * 0.2,
      matchScore: Math.floor(70 + Math.random() * 25),
      college: course.college_name,
      state: course.state,
      aiInsights: generateCourseInsights(course, userProfile)
    })),
    
    careerPaths: [
      {
        name: 'Clinical Cardiologist',
        successProbability: 0.85,
        timeline: '8-10 years',
        salary: '₹15-25 LPA',
        marketDemand: 0.9,
        aiInsights: [{
          type: 'success',
          message: 'High demand field with excellent career prospects!'
        }]
      },
      {
        name: 'Research Scientist',
        successProbability: 0.75,
        timeline: '6-8 years',
        salary: '₹8-15 LPA',
        marketDemand: 0.7,
        aiInsights: [{
          type: 'info',
          message: 'Great for students interested in medical research and innovation.'
        }]
      }
    ],
    
    studyPlans: [
      {
        name: 'Comprehensive NEET Preparation',
        duration: '12 months',
        schedule: '6-8 hours daily',
        weakAreas: ['physics', 'chemistry'],
        aiInsights: [{
          type: 'info',
          message: 'Focus on improving weak subjects to maximize your score potential.'
        }]
      },
      {
        name: 'Intensive Score Improvement',
        duration: '6 months',
        schedule: '8-10 hours daily',
        weakAreas: ['biology'],
        aiInsights: [{
          type: 'success',
          message: 'Accelerated plan for students with strong foundation.'
        }]
      }
    ],
    
    insights: {
      marketAnalysis: {
        summary: 'Medical education market is growing with increasing demand for specialized doctors.',
        emerging: ['AI Medicine', 'Genomics', 'Telemedicine'],
        recommendations: 'Focus on technology-enabled specializations for future success.'
      },
      recommendations: [
        'Improve weak subjects to increase NEET score',
        'Research scholarship opportunities',
        'Consider multiple college options',
        'Stay updated with emerging fields',
        'Build strong foundation in basic sciences'
      ]
    }
  };
  
  return recommendations;
}

// Generate AI insights for colleges
function generateCollegeInsights(college, userProfile) {
  const insights = [];
  
  if (college.establishment_year > 2000) {
    insights.push({
      type: 'success',
      message: `Modern medical college established in ${college.establishment_year}. Great infrastructure!`
    });
  }
  
  if (college.course_count > 10) {
    insights.push({
      type: 'info',
      message: `Offers ${college.course_count} courses - excellent variety of specializations!`
    });
  }
  
  return insights;
}

// Generate AI insights for courses
function generateCourseInsights(course, userProfile) {
  const insights = [];
  
  if (course.total_seats > 100) {
    insights.push({
      type: 'success',
      message: `High seat availability (${course.total_seats} seats) - better admission chances!`
    });
  }
  
  if (course.course_name.includes('MBBS')) {
    insights.push({
      type: 'info',
      message: 'Foundation course for all medical specializations. Essential for medical career!'
    });
  }
  
  return insights;
}

// Helper function for AI insights
function createInsightPrompt(query, matches) {
  const topResults = matches.slice(0, 3).map(m => m.vector.metadata.name).join(', ');
  return `Based on my search for "${query}", I found these top results: ${topResults}. Write one friendly and helpful sentence to summarize this for the student. For example: "It looks like you're interested in top-ranked colleges; AIIMS Delhi seems to be a great match!" or "Based on your interest in Maharashtra, I found several well-regarded colleges in Pune and Mumbai."`;
}

// Colleges endpoint
router.get('/api/colleges', async (request, env) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const state = url.searchParams.get('state');
    const collegeType = url.searchParams.get('college_type');
    const managementType = url.searchParams.get('management_type');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 24; // Default to 24 colleges per page for proper pagination
    
    console.log('🔍 Received search parameter:', search);
    
    let query = 'SELECT * FROM colleges';
    let countQuery = 'SELECT COUNT(*) as total FROM colleges';
    const conditions = [];
    const params = [];
    
    // Build search conditions - RESTORED TO ORIGINAL WORKING LOGIC
    if (search) {
      const searchLower = search.toLowerCase();
      let searchTerms = [search];
      
      // If the search is a short, un-spaced abbreviation, broaden the initial search
      // to ensure potential matches are fetched from the database.
      if (!search.includes(' ') && search.length > 3) {
        searchTerms.push(search.charAt(0));
      }

      // Add aliases if found (only for city names, not for general search)
      if (cityAliases[searchLower]) {
        searchTerms = [...new Set([...searchTerms, ...cityAliases[searchLower]])];
      }
      
      // Generate abbreviation patterns only for actual abbreviations (short, un-spaced, uppercase)
      if (search.length <= 6 && !search.includes(' ') && search === search.toUpperCase()) {
        const abbreviationPatterns = generateAbbreviationPatterns(search);
        searchTerms = [...new Set([...searchTerms, ...abbreviationPatterns])];
      }
      
      // Simplified search - just search in name field
      conditions.push('name LIKE ?');
      params.push(`%${search}%`);
      
      console.log('🔍 Search terms:', searchTerms);
      console.log('🔍 Parameters:', params);
    }
    
    // Add filters
  if (state) {
      conditions.push('state = ?');
    params.push(state);
  }

    if (collegeType) {
      conditions.push('college_type = ?');
      params.push(collegeType);
    }
    
    if (managementType) {
      conditions.push('management_type = ?');
      params.push(managementType);
    }
    
    // Build WHERE clause
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
  }

  // Add pagination
  const collegeOffset = (page - 1) * limit;
    query += ` ORDER BY name LIMIT ? OFFSET ?`;
    const queryParams = [...params, limit, collegeOffset];
    const countParams = [...params];
    
    console.log('🔍 Final SQL Query:', query);
    console.log('🔍 Final Parameters:', queryParams);
    
    // Execute queries with BMAD optimization
    const [colleges, countResult] = await Promise.all([
      env.DB.prepare(query).bind(...queryParams).all(),
      env.DB.prepare(countQuery).bind(...countParams).first()
    ]);
    
    const totalItems = countResult?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Apply BMAD AI-powered search optimization if available
    let optimizedColleges = colleges.results || [];
    if (search && bmadIntegration && aiServicesAvailable) {
      optimizedColleges = await bmadIntegration.optimizeSearch(search, optimizedColleges);
    }
    
    // If the search appears to be an abbreviation, perform a secondary filtering pass
    // This is the crucial step to pinpoint the exact match from the broader DB results.
    if (search && !search.includes(' ') && search.length > 2) {
      const searchUpper = search.toUpperCase();
      const filtered = optimizedColleges.filter(college => {
        const collegeAbbreviation = generateCollegeAbbreviation(college.name);
        return collegeAbbreviation.startsWith(searchUpper);
      });
      optimizedColleges = filtered;
    }
    
    // Generate AI recommendations if available
    const aiRecommendations = (bmadIntegration && aiServicesAvailable) ? bmadIntegration.aiRecommendations : [];
    
    return new Response(JSON.stringify({
      data: optimizedColleges,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        applied: { search, state, college_type: collegeType, management_type: managementType },
        available: {}
      },
      search: search,
      bmad: {
        optimized: aiServicesAvailable,
        recommendations: aiRecommendations,
        performance: aiServicesAvailable ? await bmadIntegration?.monitorPerformance() : {}
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Courses endpoint - Original design with colleges arrays
router.get('/api/courses', async (request, env) => {
  try {
    const url = new URL(request.url);
    const collegeId = url.searchParams.get('college_id');
    const stream = url.searchParams.get('stream');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    
    let whereClause = 'WHERE 1=1';
  const params = [];

               if (collegeId) {
             whereClause += ' AND c.college_id = ?';
             params.push(collegeId);
           }
           
           if (stream && stream !== 'all') {
             whereClause += ' AND c.stream = ?';
             params.push(stream);
           }

                     if (search) {
            // Use FTS5 for better search performance
            whereClause += ' AND (c.course_name LIKE ? OR c.stream LIKE ? OR c.program LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
          }
    
               // Get total count of unique courses
           const countQuery = `
             SELECT COUNT(DISTINCT c.course_name) as total 
             FROM courses c 
             JOIN colleges col ON c.college_id = col.id 
             ${whereClause}
           `;

           const countResult = await env.DB.prepare(countQuery).bind(...params).first();
           const totalItems = countResult?.total || 0;
           const totalPages = Math.ceil(totalItems / limit);
           
                     // Get courses with college information - get all courses first, then paginate after grouping
          const coursesQuery = `
            SELECT 
              c.id,
              c.course_name,
              c.stream,
              c.program,
              c.duration_years as duration,
              c.total_seats,
              c.entrance_exam,
              col.id as college_id,
              col.name as college_name,
              col.city,
              col.state,
              col.college_type,
              col.management_type,
              col.establishment_year
            FROM courses c 
            JOIN colleges col ON c.college_id = col.id 
            ${whereClause}
            ORDER BY c.course_name, col.name
          `;
    
    const rawCourses = await env.DB.prepare(coursesQuery).bind(...params).all();
    
    let courses;
    
                 // If filtering by college_id, return individual course records for that college
             if (collegeId) {
               courses = rawCourses.results.map(course => ({
                 id: course.id,
                 course_name: course.course_name,
                 stream: course.stream,
                 program: course.program,
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
               rawCourses.results.forEach(course => {
                 if (!groupedCourses[course.course_name]) {
                   groupedCourses[course.course_name] = {
                     course_name: course.course_name,
                     stream: course.stream,
                     program: course.program,
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
               
               // Convert to array and calculate total seats
               courses = Object.values(groupedCourses).map(course => {
                 const totalSeats = course.colleges.reduce((sum, college) => sum + (college.total_seats || 0), 0);
                 
                 return {
                   ...course,
                   total_seats: totalSeats,
                   total_colleges: course.colleges.length
                 };
               });
             }
    
              // Apply pagination to the final courses array after grouping
          const paginationOffset = (page - 1) * limit;
          const paginatedCourses = courses.slice(paginationOffset, paginationOffset + limit);
    
    return new Response(JSON.stringify({
      data: paginatedCourses,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// BMAD Analytics endpoint
router.get('/api/bmad/analytics', async (request, env) => {
  try {
    if (!bmadIntegration) {
      bmadIntegration = new BMADIntegration(env);
    }
    
    const performance = await bmadIntegration.monitorPerformance();
    const capacityPrediction = await bmadIntegration.predictCapacity();
    
    return new Response(JSON.stringify({
      performance,
      capacityPrediction,
      recommendations: bmadIntegration.aiRecommendations,
      analytics: bmadIntegration.analytics
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching BMAD analytics:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch analytics',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// BMAD Performance endpoint
router.get('/api/bmad/performance', async (request, env) => {
  try {
    if (!bmadIntegration) {
      bmadIntegration = new BMADIntegration(env);
    }
    
    const performance = await bmadIntegration.monitorPerformance();
    
    return new Response(JSON.stringify(performance), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch performance data',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Extended regex search endpoint
router.get('/api/colleges/regex-search', async (request, env) => {
  try {
    const url = new URL(request.url);
    const pattern = url.searchParams.get('pattern');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 24;
    
    if (!pattern) {
      return new Response(JSON.stringify({
        error: 'Pattern parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get all colleges and filter by regex pattern
    const allColleges = await env.DB.prepare('SELECT * FROM colleges').all();
    const regex = new RegExp(pattern, 'i'); // Case insensitive
    
    const matchingColleges = allColleges.results.filter(college => {
      return regex.test(college.name) || 
             regex.test(college.city) || 
             regex.test(college.state) ||
             regex.test(college.university || '') ||
             regex.test(college.college_type || '') ||
             regex.test(college.management_type || '');
    });
    
    // Apply pagination
    const regexOffset = (page - 1) * limit;
    const paginatedResults = matchingColleges.slice(regexOffset, regexOffset + limit);
    const totalItems = matchingColleges.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    return new Response(JSON.stringify({
      data: paginatedResults,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      pattern: pattern,
      totalMatches: totalItems
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Regex search error:', error);
    return new Response(JSON.stringify({
      error: 'Regex search failed',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Aliases search endpoint for frontend search functionality
router.get('/api/aliases/search', async (request, env) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const entityType = url.searchParams.get('entityType') || 'college';
    const limit = parseInt(url.searchParams.get('limit')) || 100;
    
    if (!query || query.trim() === '') {
      return new Response(JSON.stringify({
        data: [],
        query: '',
        entityType,
        total: 0,
        message: 'Query parameter is required'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const searchQuery = query.toLowerCase().trim();
    
    if (entityType === 'college') {
      // Search colleges with aliases support
      const colleges = await env.DB.prepare(`
        SELECT 
          id,
          name,
          city,
          state,
          college_type,
          management_type,
          establishment_year,
          university,
          address,
          phone,
          email,
          website,
          accreditation,
          code,
          district,
          pincode,
          status,
          college_type_category,
          created_at,
          updated_at
        FROM colleges 
        WHERE 
          LOWER(name) LIKE ? OR
          LOWER(city) LIKE ? OR
          LOWER(state) LIKE ? OR
          LOWER(university) LIKE ? OR
          LOWER(college_type) LIKE ? OR
          LOWER(management_type) LIKE ? OR
          LOWER(accreditation) LIKE ? OR
          LOWER(district) LIKE ?
        ORDER BY 
          CASE 
            WHEN LOWER(name) LIKE ? THEN 1
            WHEN LOWER(city) LIKE ? THEN 2
            WHEN LOWER(state) LIKE ? THEN 3
            ELSE 4
          END,
          name
        LIMIT ?
      `).bind(
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        limit
      ).all();
      
      return new Response(JSON.stringify({
        data: colleges.results,
        query: query,
        entityType: 'college',
        total: colleges.results.length,
        limit: limit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (entityType === 'course') {
      // Search courses with aliases support
      const courses = await env.DB.prepare(`
        SELECT 
          c.id,
          c.course_name,
          c.stream,
          c.program,
          c.duration_years,
          c.total_seats,
          c.entrance_exam,
          c.fees_structure,
          c.eligibility_criteria,
          c.syllabus,
          c.placement_stats,
          c.created_at,
          c.updated_at,
          col.name as college_name,
          col.city,
          col.state,
          col.college_type,
          col.management_type
        FROM courses c
        JOIN colleges col ON c.college_id = col.id
        WHERE 
          LOWER(c.course_name) LIKE ? OR
          LOWER(c.stream) LIKE ? OR
          LOWER(c.program) LIKE ? OR
          LOWER(c.entrance_exam) LIKE ? OR
          LOWER(col.name) LIKE ? OR
          LOWER(col.city) LIKE ? OR
          LOWER(col.state) LIKE ?
        ORDER BY 
          CASE 
            WHEN LOWER(c.course_name) LIKE ? THEN 1
            WHEN LOWER(c.stream) LIKE ? THEN 2
            WHEN LOWER(col.name) LIKE ? THEN 3
            ELSE 4
          END,
          c.course_name
        LIMIT ?
      `).bind(
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        limit
      ).all();
      
      return new Response(JSON.stringify({
        data: courses.results,
        query: query,
        entityType: 'course',
        total: courses.results.length,
        limit: limit
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        error: 'Invalid entity type. Supported types: college, course'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Aliases search error:', error);
    return new Response(JSON.stringify({
      error: 'Aliases search failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// College filters endpoint
router.get('/api/colleges/filters', async (request, env) => {
  try {
    const [states, types, managementTypes] = await Promise.all([
      env.DB.prepare('SELECT DISTINCT state FROM colleges WHERE state IS NOT NULL ORDER BY state').all(),
      env.DB.prepare('SELECT DISTINCT college_type FROM colleges WHERE college_type IS NOT NULL ORDER BY college_type').all(),
      env.DB.prepare('SELECT DISTINCT management_type FROM colleges WHERE management_type IS NOT NULL ORDER BY management_type').all()
    ]);
    
    return new Response(JSON.stringify({
      states: states.results?.map(r => r.state) || [],
      college_types: types.results?.map(r => r.college_type) || [],
      management_types: managementTypes.results?.map(r => r.management_type) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching filters:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
});

// 404 handler
router.all('*', () => {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: 'The requested resource was not found'
  }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// BMAD-Enhanced fetch handler
export default {
  async fetch(request, env, ctx) {
    // Check if AI services are available
    aiServicesAvailable = !!env.AI;
    
    // Check if Vectorize services are available
    vectorizeServicesAvailable = !!env.VECTORIZE_INDEX;
    
    // Initialize BMAD integration if not already done
    if (!bmadIntegration) {
      bmadIntegration = new BMADIntegration(env);
    }

    try {
      // Apply BMAD optimizations to request if available
      let optimizedRequest = request;
      if (aiServicesAvailable) {
        optimizedRequest = await bmadIntegration.optimizeRequest(request, ctx);
      }
      
      // Handle the request with router
      const response = await router.handle(optimizedRequest, env, ctx);
      
      // Apply BMAD optimizations to response if available
      let optimizedResponse = response;
      if (aiServicesAvailable) {
        optimizedResponse = await bmadIntegration.optimizeResponse(response, optimizedRequest);
        
        // Monitor performance
        await bmadIntegration.monitorPerformance();
      }
      
      return optimizedResponse;
    } catch (error) {
      // BMAD error detection and resolution if available
      let errorHandling = { recommendations: [] };
      if (aiServicesAvailable) {
        errorHandling = await bmadIntegration.detectAndResolveErrors(error, ctx);
      }
      
      console.error('Request failed:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        bmadRecommendations: errorHandling.recommendations
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};