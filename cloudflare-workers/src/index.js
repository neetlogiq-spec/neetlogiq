// NEET Logiq Cloudflare Worker - AI-Enhanced Implementation
import { Router } from 'itty-router';
import BMADIntegration from './bmad-integration.js';

// Initialize router
const router = Router();

// Initialize BMAD Integration
let bmadIntegration;

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

// Health check endpoint
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
    if (!env.AI || !env.VECTORIZE_INDEX) {
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
    
    // Search in courses/programs table
    const queryStr = `
      SELECT DISTINCT 
        p.course_name,
        p.level,
        p.branch as stream,
        p.stream as branch,
        p.duration,
        p.total_seats,
        COUNT(DISTINCT p.college_id) as college_count,
        GROUP_CONCAT(DISTINCT c.name) as college_names
      FROM programs p
      JOIN colleges c ON p.college_id = c.id
      WHERE p.course_name LIKE ? OR p.stream LIKE ? OR p.branch LIKE ?
      GROUP BY p.course_name, p.level, p.branch, p.stream, p.duration, p.total_seats
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
      if (!search.includes(' ') && search.length > 2) {
        searchTerms.push(search.charAt(0));
      }

      // Add aliases if found (only for city names, not for general search)
      if (cityAliases[searchLower]) {
        searchTerms = [...new Set([...searchTerms, ...cityAliases[searchLower]])];
      }
      
      // Generate abbreviation patterns from the search query
      const abbreviationPatterns = generateAbbreviationPatterns(search);
      searchTerms = [...new Set([...searchTerms, ...abbreviationPatterns])];
      
      // Build search conditions for name, city, and state (ORIGINAL PRECISE LOGIC)
      const searchConditions = [];
      searchTerms.forEach(term => {
        searchConditions.push('name LIKE ?');
        searchConditions.push('city LIKE ?');
        searchConditions.push('state LIKE ?');
      });
      
      conditions.push(`(${searchConditions.join(' OR ')})`);
      
      // Add parameters for each search term
      searchTerms.forEach(term => {
        const searchTerm = `%${term}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      });
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
  const offset = (page - 1) * limit;
    query += ` ORDER BY name LIMIT ${limit} OFFSET ${offset}`;
    
    // Execute queries with BMAD optimization
    const [colleges, countResult] = await Promise.all([
      env.DB.prepare(query).bind(...params).all(),
      env.DB.prepare(countQuery).bind(...params).first()
    ]);
    
    const totalItems = countResult?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Apply BMAD AI-powered search optimization
    let optimizedColleges = colleges.results || [];
    if (search && bmadIntegration) {
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
    
    // Generate AI recommendations
    const aiRecommendations = bmadIntegration ? bmadIntegration.aiRecommendations : [];
    
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
        optimized: true,
        recommendations: aiRecommendations,
        performance: await bmadIntegration?.monitorPerformance()
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
      whereClause += ' AND p.college_id = ?';
      params.push(collegeId);
    }
    
    if (stream && stream !== 'all') {
      whereClause += ' AND p.branch = ?';
    params.push(stream);
  }

    if (search) {
      whereClause += ' AND (p.course_name LIKE ? OR p.stream LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Get total count of unique courses
    const countQuery = `
      SELECT COUNT(DISTINCT p.course_name) as total 
      FROM programs p 
      JOIN colleges c ON p.college_id = c.id 
      ${whereClause}
    `;

    const countResult = await env.DB.prepare(countQuery).bind(...params).first();
    const totalItems = countResult?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get courses with college information - group by course name
    const coursesQuery = `
      SELECT 
        p.id,
        p.course_name,
        p.level,
        p.branch as stream,
        p.stream as branch,
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
      ORDER BY p.course_name, c.name
    `;
    
    const rawCourses = await env.DB.prepare(coursesQuery).bind(...params).all();
    
    let courses;
    
    // If filtering by college_id, return individual course records for that college
    if (collegeId) {
      courses = rawCourses.results.map(course => ({
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
      rawCourses.results.forEach(course => {
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
    
    // Apply pagination to the final courses array
    const offset = (page - 1) * limit;
    const paginatedCourses = courses.slice(offset, offset + limit);
    
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
    const offset = (page - 1) * limit;
    const paginatedResults = matchingColleges.slice(offset, offset + limit);
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
    // Initialize BMAD integration if not already done
    if (!bmadIntegration) {
      bmadIntegration = new BMADIntegration(env);
    }

    try {
      // Apply BMAD optimizations to request
      const optimizedRequest = await bmadIntegration.optimizeRequest(request, ctx);
      
      // Handle the request with router
      const response = await router.handle(optimizedRequest, env, ctx);
      
      // Apply BMAD optimizations to response
      const optimizedResponse = await bmadIntegration.optimizeResponse(response, optimizedRequest);
      
      // Monitor performance
      await bmadIntegration.monitorPerformance();
      
      return optimizedResponse;
    } catch (error) {
      // BMAD error detection and resolution
      const errorHandling = await bmadIntegration.detectAndResolveErrors(error, ctx);
      
      console.error('Request failed:', error, errorHandling);
      
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