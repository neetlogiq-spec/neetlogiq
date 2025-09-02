// Cloudflare Workers backend for NEET Logiq
import { createCors } from 'itty-cors';

// Initialize CORS
const { preflight, corsify } = createCors({
  origins: ['https://neetlogiq.com', 'https://neetlogiq.pages.dev', 'http://localhost:5001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
});

// City aliases for search functionality
const cityAliases = {
  'bengaluru': 'bangalore',
  'bengaluru': 'bangalore',
  'bengaluru': 'bangalore',
  'mumbai': 'bombay',
  'kolkata': 'calcutta',
  'chennai': 'madras',
  'pune': 'puna',
  'hyderabad': 'secunderabad',
  'ahmedabad': 'ahmedabad',
  'jaipur': 'pink city',
  'lucknow': 'lucknow',
  'patna': 'patna',
  'bhubaneswar': 'bhubaneswar',
  'chandigarh': 'chandigarh',
  'bangalore': 'bengaluru',
  'bombay': 'mumbai',
  'calcutta': 'kolkata',
  'madras': 'chennai',
  'puna': 'pune',
  'secunderabad': 'hyderabad'
};

// Helper function to build search query with aliases
function buildSearchQuery(query, aliases) {
  const searchTerms = [];
  
  // Add original query
  searchTerms.push(`'%${query}%'`);
  
  // Add aliases if they exist
  const lowerQuery = query.toLowerCase();
  if (aliases[lowerQuery]) {
    searchTerms.push(`'%${aliases[lowerQuery]}%'`);
  }
  
  // Add reverse aliases
  Object.entries(aliases).forEach(([alias, original]) => {
    if (original.toLowerCase() === lowerQuery) {
      searchTerms.push(`'%${alias}%'`);
    }
  });
  
  return searchTerms.join(' OR ');
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return preflight(request);
    }

    try {
      // API Routes
      if (path.startsWith('/api/')) {
        return await handleApiRequest(request, env, path, method);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 404 for other routes
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
};

// Handle API requests
async function handleApiRequest(request, env, path, method) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Colleges API
  if (path === '/api/colleges') {
    return await handleCollegesApi(request, env, searchParams);
  }

  // Courses API
  if (path === '/api/courses') {
    return await handleCoursesApi(request, env, searchParams);
  }

  // Cutoffs API
  if (path === '/api/cutoffs') {
    return await handleCutoffsApi(request, env, searchParams);
  }

  // Search API
  if (path === '/api/search') {
    return await handleSearchApi(request, env, searchParams);
  }

  return new Response('API endpoint not found', { status: 404 });
}

// Handle colleges API
async function handleCollegesApi(request, env, searchParams) {
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const stream = searchParams.get('stream') || '';
  const management = searchParams.get('management') || '';

  let query = 'SELECT * FROM colleges WHERE 1=1';
  const params = [];

  // Add search conditions
  if (search) {
    const searchQuery = buildSearchQuery(search, cityAliases);
    query += ` AND (college_name LIKE '%${search}%' OR city LIKE '%${search}%' OR state LIKE '%${search}%' OR ${searchQuery})`;
  }

  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }

  if (stream) {
    query += ' AND stream = ?';
    params.push(stream);
  }

  if (management) {
    query += ' AND management_type = ?';
    params.push(management);
  }

  // Add pagination
  const offset = (page - 1) * limit;
  query += ` ORDER BY college_name LIMIT ${limit} OFFSET ${offset}`;

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM colleges WHERE 1=1';
    if (search) {
      const searchQuery = buildSearchQuery(search, cityAliases);
      countQuery += ` AND (college_name LIKE '%${search}%' OR city LIKE '%${search}%' OR state LIKE '%${search}%' OR ${searchQuery})`;
    }
    if (state) {
      countQuery += ' AND state = ?';
    }
    if (stream) {
      countQuery += ' AND stream = ?';
    }
    if (management) {
      countQuery += ' AND management_type = ?';
    }

    const countResult = await env.DB.prepare(countQuery).bind(...params).first();
    const total = countResult.total;

    return corsify(new Response(JSON.stringify({
      colleges: result.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('Database error:', error);
    return corsify(new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

// Handle courses API
async function handleCoursesApi(request, env, searchParams) {
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') || '';
  const stream = searchParams.get('stream') || '';

  let query = 'SELECT * FROM courses WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (course_name LIKE ? OR college_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (stream) {
    query += ' AND stream = ?';
    params.push(stream);
  }

  const offset = (page - 1) * limit;
  query += ` ORDER BY course_name LIMIT ${limit} OFFSET ${offset}`;

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    
    let countQuery = 'SELECT COUNT(*) as total FROM courses WHERE 1=1';
    if (search) {
      countQuery += ' AND (course_name LIKE ? OR college_name LIKE ?)';
    }
    if (stream) {
      countQuery += ' AND stream = ?';
    }

    const countResult = await env.DB.prepare(countQuery).bind(...params).first();
    const total = countResult.total;

    return corsify(new Response(JSON.stringify({
      courses: result.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('Database error:', error);
    return corsify(new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

// Handle cutoffs API
async function handleCutoffsApi(request, env, searchParams) {
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const search = searchParams.get('search') || '';
  const year = searchParams.get('year') || '';
  const category = searchParams.get('category') || '';

  let query = 'SELECT * FROM cutoffs WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (college_name LIKE ? OR course_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  const offset = (page - 1) * limit;
  query += ` ORDER BY opening_rank LIMIT ${limit} OFFSET ${offset}`;

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    
    let countQuery = 'SELECT COUNT(*) as total FROM cutoffs WHERE 1=1';
    if (search) {
      countQuery += ' AND (college_name LIKE ? OR course_name LIKE ?)';
    }
    if (year) {
      countQuery += ' AND year = ?';
    }
    if (category) {
      countQuery += ' AND category = ?';
    }

    const countResult = await env.DB.prepare(countQuery).bind(...params).first();
    const total = countResult.total;

    return corsify(new Response(JSON.stringify({
      cutoffs: result.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('Database error:', error);
    return corsify(new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

// Handle search API
async function handleSearchApi(request, env, searchParams) {
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  if (!query) {
    return corsify(new Response(JSON.stringify({ error: 'Query parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }));
  }

  try {
    const results = {};

    if (type === 'all' || type === 'colleges') {
      const collegesQuery = `SELECT * FROM colleges WHERE college_name LIKE ? OR city LIKE ? OR state LIKE ? LIMIT 10`;
      const collegesResult = await env.DB.prepare(collegesQuery).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
      results.colleges = collegesResult.results || [];
    }

    if (type === 'all' || type === 'courses') {
      const coursesQuery = `SELECT * FROM courses WHERE course_name LIKE ? OR college_name LIKE ? LIMIT 10`;
      const coursesResult = await env.DB.prepare(coursesQuery).bind(`%${query}%`, `%${query}%`).all();
      results.courses = coursesResult.results || [];
    }

    if (type === 'all' || type === 'cutoffs') {
      const cutoffsQuery = `SELECT * FROM cutoffs WHERE college_name LIKE ? OR course_name LIKE ? LIMIT 10`;
      const cutoffsResult = await env.DB.prepare(cutoffsQuery).bind(`%${query}%`, `%${query}%`).all();
      results.cutoffs = cutoffsResult.results || [];
    }

    return corsify(new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    console.error('Search error:', error);
    return corsify(new Response(JSON.stringify({ error: 'Search error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}
