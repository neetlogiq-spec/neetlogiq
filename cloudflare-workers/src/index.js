// Cloudflare Workers backend for NEET Logiq
import { Router } from 'itty-router';

// Initialize router
const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// City aliases for search functionality
const cityAliases = {
  'bengaluru': 'bangalore',
  'mumbai': 'bombay',
  'kolkata': 'calcutta',
  'chennai': 'madras',
  'pune': 'puna',
  'hyderabad': 'secunderabad',
  'ahmedabad': 'gandhinagar',
  'jaipur': 'pink city',
  'lucknow': 'lko',
  'patna': 'bihar',
  'bhubaneswar': 'bhubaneshwar',
  'chandigarh': 'chd',
  'bangalore': 'bengaluru',
  'bombay': 'mumbai',
  'calcutta': 'kolkata',
  'madras': 'chennai',
  'puna': 'pune',
  'secunderabad': 'hyderabad',
  'gandhinagar': 'ahmedabad',
  'pink city': 'jaipur',
  'lko': 'lucknow',
  'bihar': 'patna',
  'bhubaneshwar': 'bhubaneswar',
  'chd': 'chandigarh'
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

// Helper function to build search query
function buildSearchQuery(searchTerm, filters = {}) {
  const terms = searchTerm.split(' ').filter(term => term.length > 0);
  const searchTerms = terms.map(term => {
    const normalized = normalizeSearchTerm(term);
    return `(name LIKE '%${normalized}%' OR city LIKE '%${normalized}%' OR state LIKE '%${normalized}%')`;
  });
  
  return searchTerms.join(' OR ');
}

// API Routes
router.get('/api/colleges', async (request, env) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM colleges WHERE status = "active"';
    let params = [];

    if (search) {
      const searchQuery = buildSearchQuery(search);
      query += ` AND (${searchQuery})`;
    }

    query += ` ORDER BY name LIMIT ${limit} OFFSET ${offset}`;

    const result = await env.DB.prepare(query).all();
    
    // Get total count for pagination
    let totalCount = 0;
    if (search) {
      const countQuery = `SELECT COUNT(*) as count FROM colleges WHERE status = "active" AND (${buildSearchQuery(search)})`;
      const countResult = await env.DB.prepare(countQuery).first();
      totalCount = countResult?.count || 0;
    } else {
      const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM colleges WHERE status = "active"').first();
      totalCount = countResult?.count || 0;
    }
    
    return new Response(JSON.stringify({
      colleges: result.results || [],
      pagination: {
        page,
        limit,
        total: totalCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Colleges error:', error);
    return new Response(JSON.stringify({ error: 'Colleges error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// College filters endpoint
router.get('/api/colleges/filters', async (request, env) => {
  try {
    // Get unique values for filters
    const states = await env.DB.prepare('SELECT DISTINCT state FROM colleges WHERE status = "active" ORDER BY state').all();
    const cities = await env.DB.prepare('SELECT DISTINCT city FROM colleges WHERE status = "active" ORDER BY city').all();
    const collegeTypes = await env.DB.prepare('SELECT DISTINCT college_type FROM colleges WHERE status = "active" ORDER BY college_type').all();
    const managementTypes = await env.DB.prepare('SELECT DISTINCT management_type FROM colleges WHERE status = "active" ORDER BY management_type').all();
    
    return new Response(JSON.stringify({
      states: states.results?.map(r => r.state) || [],
      cities: cities.results?.map(r => r.city) || [],
      collegeTypes: collegeTypes.results?.map(r => r.college_type) || [],
      managementTypes: managementTypes.results?.map(r => r.management_type) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Filters error:', error);
    return new Response(JSON.stringify({ error: 'Filters error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

router.get('/api/courses', async (request, env) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    // For now, return colleges as courses since we don't have programs data yet
    let query = `
      SELECT 
        name as college_name,
        name as course_name,
        college_type as stream,
        college_type as level,
        0 as total_seats,
        management_type,
        city,
        state,
        status
      FROM colleges
      WHERE status = 'active'
    `;

    if (search) {
      const searchQuery = buildSearchQuery(search);
      query += ` AND (${searchQuery})`;
    }

    query += ` ORDER BY name LIMIT ${limit} OFFSET ${offset}`;

    const result = await env.DB.prepare(query).all();
    
    // Get total count for pagination
    let totalCount = 0;
    if (search) {
      const countQuery = `SELECT COUNT(*) as count FROM colleges WHERE status = 'active' AND (${buildSearchQuery(search)})`;
      const countResult = await env.DB.prepare(countQuery).first();
      totalCount = countResult?.count || 0;
    } else {
      const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM colleges WHERE status = "active"').first();
      totalCount = countResult?.count || 0;
    }
    
    return new Response(JSON.stringify({
      courses: result.results || [],
      pagination: {
        page,
        limit,
        total: totalCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Courses error:', error);
    return new Response(JSON.stringify({ error: 'Courses error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

router.get('/api/cutoffs', async (request, env) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cutoffs WHERE status = "active"';
    let params = [];

    if (search) {
      const searchQuery = buildSearchQuery(search);
      query += ` AND (${searchQuery})`;
    }

    query += ` ORDER BY year DESC, opening_rank ASC LIMIT ${limit} OFFSET ${offset}`;

    const result = await env.DB.prepare(query).all();
    
    return new Response(JSON.stringify({
      cutoffs: result.results || [],
      pagination: {
        page,
        limit,
        total: result.results?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cutoffs error:', error);
    return new Response(JSON.stringify({ error: 'Cutoffs error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

router.get('/api/search', async (request, env) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = {};

    if (type === 'all' || type === 'colleges') {
      const collegesQuery = `SELECT * FROM colleges WHERE status = 'active' AND (name LIKE ? OR city LIKE ? OR state LIKE ?) LIMIT 10`;
      const collegesResult = await env.DB.prepare(collegesQuery).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
      results.colleges = collegesResult.results || [];
    }

    if (type === 'all' || type === 'courses') {
      const coursesQuery = `
        SELECT 
          c.name as college_name,
          p.name as course_name,
          p.level as stream,
          p.total_seats,
          c.management_type,
          c.city,
          c.state
        FROM programs p
        JOIN colleges c ON p.college_id = c.id
        WHERE p.status = 'active' AND c.status = 'active' 
        AND (c.name LIKE ? OR p.name LIKE ? OR c.city LIKE ?)
        LIMIT 10
      `;
      const coursesResult = await env.DB.prepare(coursesQuery).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
      results.courses = coursesResult.results || [];
    }

    if (type === 'all' || type === 'cutoffs') {
      const cutoffsQuery = `SELECT * FROM cutoffs WHERE status = 'active' AND (college_name LIKE ? OR course_name LIKE ?) LIMIT 10`;
      const cutoffsResult = await env.DB.prepare(cutoffsQuery).bind(`%${query}%`, `%${query}%`).all();
      results.cutoffs = cutoffsResult.results || [];
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: 'Search error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Health check routes
router.get('/health', () => {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

router.get('/api/health', () => {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// Handle OPTIONS requests for CORS
router.options('*', () => new Response(null, { headers: corsHeaders }));

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

// Export the worker
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  }
};