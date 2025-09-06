// API Service for NeetLogIQ Cloudflare Worker Integration
import { getApiUrl, getBaseUrl } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = getBaseUrl();
  }

  // Generic API call method with BMAD integration
  async apiCall(endpoint, options = {}) {
    try {
      const url = getApiUrl(endpoint);
      console.log('🌐 API Call URL:', url);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌐 API Response data:', data);
      
      // Check for BMAD optimization headers
      const bmadOptimized = response.headers.get('X-BMAD-Optimized');
      if (bmadOptimized) {
        console.log('🤖 BMAD optimization detected:', bmadOptimized);
      }
      
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Colleges API
  async getColleges(filters = {}, page = 1, limit = 24) {
    const queryParams = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    // Add pagination
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    return this.apiCall(`/api/colleges?${queryParams.toString()}`);
  }

  async getCollegeFilters(currentFilters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add current filters as query parameters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    return this.apiCall(`/api/colleges/filters?${queryParams.toString()}`);
  }

  async searchColleges(query, page = 1, limit = 24) {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query); // Use 'q' parameter as expected by aliases search
    queryParams.append('entityType', 'college'); // Specify entity type
    queryParams.append('limit', limit); // Use the limit for results
    
    // Use the new aliases search endpoint
    return this.apiCall(`/api/aliases/search?${queryParams.toString()}`);
  }

  async getCollegeById(id) {
    return this.apiCall(`/api/colleges/${id}`);
  }

  async getCollegePrograms(collegeId) {
    return this.apiCall(`/api/colleges/${collegeId}/programs`);
  }

  // Courses API
  async getCourses(filters = {}, page = 1, limit = 20) {
    const queryParams = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    // Add pagination
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    return this.apiCall(`/api/courses?${queryParams.toString()}`);
  }

  async getCourseFilters() {
    return this.apiCall('/courses/filters');
  }

  async searchCourses(query, filters = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    return this.apiCall(`/api/courses?${queryParams.toString()}`);
  }

  async getCourseById(id) {
    return this.apiCall(`/courses/${id}`);
  }

  async getCoursesByCollege(collegeId) {
    return this.apiCall(`/courses?college_id=${collegeId}`);
  }

  // Cutoffs API
  async getCutoffs(filters = {}, page = 1, limit = 20) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    return this.apiCall(`/cutoffs?${queryParams.toString()}`);
  }

  // BMAD Analytics API
  async getBMADAnalytics() {
    return this.apiCall('/bmad/analytics');
  }

  async getBMADPerformance() {
    return this.apiCall('/bmad/performance');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get API status
  async getApiStatus() {
    try {
      const health = await this.healthCheck();
      return {
        status: health ? 'connected' : 'disconnected',
        baseURL: this.baseURL,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        baseURL: this.baseURL,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async search(query, options = {}) {
    const { limit = 100, contentType = 'colleges' } = options;
    const page = 1;
    const searchParams = new URLSearchParams({ search: query, page: page.toString(), limit: limit.toString() });

    const endpoint = contentType === 'courses' ? '/api/courses' : '/api/colleges';
    const url = `${this.baseURL}${endpoint}?${searchParams.toString()}`;

    console.log(`🌐 API Call URL: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌐 API Response data:', data);
      
      // Check for BMAD optimization headers
      const bmadOptimized = response.headers.get('X-BMAD-Optimized');
      if (bmadOptimized) {
        console.log('🤖 BMAD optimization detected:', bmadOptimized);
      }
      
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Advanced search using the new backend service
  async advancedSearch(query, options = {}) {
    const { 
      type = 'all', 
      limit = 50, 
      threshold = 0.3, 
      engines = ['fuse', 'flexsearch', 'ufuzzy', 'fuzzysort', 'neural', 'regex'] 
    } = options;
    
    const searchParams = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
      threshold: threshold.toString(),
      engines: engines.join(',')
    });

    const url = `${this.baseURL}/api/advanced-search?${searchParams.toString()}`;
    console.log(`🚀 Advanced Search URL: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🚀 Advanced Search Response:', data);
      
      return data;
    } catch (error) {
      console.error('Advanced search failed:', error);
      throw error;
    }
  }

  // FTS5 search for colleges (ultra-fast full-text search)
  async searchCollegesFTS5(query, page = 1, limit = 24) {
    const searchParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });

    const url = `${this.baseURL}/api/search/fts5/colleges?${searchParams.toString()}`;
    console.log(`🔍 FTS5 Colleges Search URL: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 FTS5 Colleges Search Response:', data);
      
      return data;
    } catch (error) {
      console.error('FTS5 colleges search failed:', error);
      throw error;
    }
  }

  // FTS5 search for courses (ultra-fast full-text search)
  async searchCoursesFTS5(query, page = 1, limit = 24) {
    const searchParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });

    const url = `${this.baseURL}/api/search/fts5/courses?${searchParams.toString()}`;
    console.log(`🔍 FTS5 Courses Search URL: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 FTS5 Courses Search Response:', data);
      
      return data;
    } catch (error) {
      console.error('FTS5 courses search failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  getColleges,
  getCollegeFilters,
  searchColleges,
  getCollegeById,
  getCollegePrograms,
  getCourses,
  getCourseFilters,
  searchCourses,
  getCourseById,
  getCoursesByCollege,
  getCutoffs,
  getBMADAnalytics,
  getBMADPerformance,
  healthCheck,
  getApiStatus,
  search,
  advancedSearch,
  searchCollegesFTS5,
  searchCoursesFTS5
} = apiService;
