// Typesense Search Service for NeetLogIQ
// Provides advanced natural language search capabilities

class TypesenseService {
  constructor() {
    this.baseURL = `${process.env.REACT_APP_API_URL || 'http://localhost:8787'}/api`;
    this.searchCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Search colleges with natural language
  async searchColleges(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        filters = {},
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const cacheKey = `colleges_${query}_${page}_${JSON.stringify(filters)}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      const params = new URLSearchParams({
        q: query,
        page: page,
        limit: limit,
        ...filters
      });

      const response = await fetch(`${this.baseURL}/typesense/search/colleges?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.setCachedResult(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Typesense colleges search error:', error);
      throw error;
    }
  }

  // Search courses with natural language
  async searchCourses(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        filters = {},
        sortBy = 'course_name',
        sortOrder = 'asc'
      } = options;

      const cacheKey = `courses_${query}_${page}_${JSON.stringify(filters)}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      const params = new URLSearchParams({
        q: query,
        page: page,
        limit: limit,
        ...filters
      });

      const response = await fetch(`${this.baseURL}/typesense/search/courses?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.setCachedResult(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Typesense courses search error:', error);
      throw error;
    }
  }

  // Universal search (both colleges and courses)
  async universalSearch(query, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const [collegesResult, coursesResult] = await Promise.allSettled([
        this.searchColleges(query, { page, limit: Math.ceil(limit / 2) }),
        this.searchCourses(query, { page, limit: Math.ceil(limit / 2) })
      ]);

      const colleges = collegesResult.status === 'fulfilled' ? collegesResult.value.data : [];
      const courses = coursesResult.status === 'fulfilled' ? coursesResult.value.data : [];

      // Combine and sort by relevance
      const combinedResults = [
        ...colleges.map(item => ({ ...item, type: 'college' })),
        ...courses.map(item => ({ ...item, type: 'course' }))
      ].sort((a, b) => (b.text_match || 0) - (a.text_match || 0));

      return {
        results: combinedResults.slice(0, limit),
        total: combinedResults.length,
        colleges: colleges.length,
        courses: courses.length,
        query,
        search_time_ms: Math.max(
          collegesResult.status === 'fulfilled' ? collegesResult.value.search_time_ms : 0,
          coursesResult.status === 'fulfilled' ? coursesResult.value.search_time_ms : 0
        )
      };
    } catch (error) {
      console.error('Typesense universal search error:', error);
      throw error;
    }
  }

  // Get search suggestions
  async getSuggestions(query, type = 'all') {
    try {
      if (query.length < 2) return [];

      const suggestions = [];
      
      if (type === 'all' || type === 'colleges') {
        const collegesResult = await this.searchColleges(query, { limit: 5 });
        suggestions.push(...collegesResult.data.map(college => ({
          text: college.name,
          type: 'college',
          city: college.city,
          state: college.state
        })));
      }

      if (type === 'all' || type === 'courses') {
        const coursesResult = await this.searchCourses(query, { limit: 5 });
        suggestions.push(...coursesResult.data.map(course => ({
          text: course.course_name,
          type: 'course',
          stream: course.stream,
          college_name: course.college_name
        })));
      }

      return suggestions.slice(0, 10);
    } catch (error) {
      console.error('Typesense suggestions error:', error);
      return [];
    }
  }

  // Get search facets
  async getFacets(query, type = 'colleges') {
    try {
      const searchFunction = type === 'colleges' ? this.searchColleges : this.searchCourses;
      const result = await searchFunction(query, { limit: 1 });
      
      return result.facets || {};
    } catch (error) {
      console.error('Typesense facets error:', error);
      return {};
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/typesense/health`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Typesense health check error:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Cache management
  getCachedResult(key) {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedResult(key, data) {
    this.searchCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.searchCache.clear();
  }

  // Advanced search with natural language processing
  async advancedSearch(query, options = {}) {
    try {
      const {
        type = 'all',
        filters = {},
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = options;

      // Parse natural language queries
      const parsedQuery = this.parseNaturalLanguageQuery(query);
      
      let results;
      if (type === 'colleges') {
        results = await this.searchColleges(parsedQuery.text, {
          page,
          limit,
          filters: { ...filters, ...parsedQuery.filters }
        });
      } else if (type === 'courses') {
        results = await this.searchCourses(parsedQuery.text, {
          page,
          limit,
          filters: { ...filters, ...parsedQuery.filters }
        });
      } else {
        results = await this.universalSearch(parsedQuery.text, {
          page,
          limit
        });
      }

      return {
        ...results,
        naturalLanguageQuery: query,
        parsedQuery
      };
    } catch (error) {
      console.error('Typesense advanced search error:', error);
      throw error;
    }
  }

  // Parse natural language queries
  parseNaturalLanguageQuery(query) {
    const text = query.toLowerCase();
    const filters = {};

    // Extract location filters
    const locationPatterns = [
      { pattern: /in\s+([^,]+)(?:,\s*([^,]+))?/, fields: ['city', 'state'] },
      { pattern: /near\s+([^,]+)/, fields: ['city'] },
      { pattern: /from\s+([^,]+)/, fields: ['state'] }
    ];

    for (const { pattern, fields } of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (fields[0]) filters[fields[0]] = match[1].trim();
        if (fields[1] && match[2]) filters[fields[1]] = match[2].trim();
      }
    }

    // Extract course/college type filters
    const typePatterns = [
      { pattern: /medical\s+college/i, field: 'college_type', value: 'MEDICAL' },
      { pattern: /engineering\s+college/i, field: 'college_type', value: 'ENGINEERING' },
      { pattern: /government\s+college/i, field: 'management_type', value: 'GOVERNMENT' },
      { pattern: /private\s+college/i, field: 'management_type', value: 'PRIVATE' },
      { pattern: /mbbs/i, field: 'course_name', value: 'MBBS' },
      { pattern: /bds/i, field: 'course_name', value: 'BDS' }
    ];

    for (const { pattern, field, value } of typePatterns) {
      if (pattern.test(text)) {
        filters[field] = value;
      }
    }

    // Clean up the query text
    const cleanQuery = query.replace(/in\s+[^,]+(?:,\s*[^,]+)?/g, '')
                           .replace(/near\s+[^,]+/g, '')
                           .replace(/from\s+[^,]+/g, '')
                           .replace(/medical\s+college/gi, '')
                           .replace(/engineering\s+college/gi, '')
                           .replace(/government\s+college/gi, '')
                           .replace(/private\s+college/gi, '')
                           .trim();

    return {
      text: cleanQuery || query,
      filters
    };
  }
}

// Create singleton instance
const typesenseService = new TypesenseService();

export default typesenseService;
