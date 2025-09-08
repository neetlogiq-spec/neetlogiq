// API Service for NeetLogIQ Cloudflare Worker Integration
import { getApiUrl, getBaseUrl } from '../config/api';
import cacheService from './cacheService';
import cachePerformanceService from './cachePerformanceService';

class ApiService {
  constructor() {
    this.baseURL = getBaseUrl();
  }

  // Generic API call method with BMAD integration and performance monitoring
  async apiCall(endpoint, options = {}) {
    const startTime = performance.now();
    let success = true;
    
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
        success = false;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌐 API Response data:', data);
      
      // Check for BMAD optimization headers
      const bmadOptimized = response.headers.get('X-BMAD-Optimized');
      if (bmadOptimized) {
        console.log('🤖 BMAD optimization detected:', bmadOptimized);
      }
      
      // Record performance metrics
      const responseTime = performance.now() - startTime;
      cachePerformanceService.recordApiCall(endpoint, responseTime, success);
      
      return data;
    } catch (error) {
      success = false;
      const responseTime = performance.now() - startTime;
      cachePerformanceService.recordApiCall(endpoint, responseTime, success);
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Colleges API with caching and performance monitoring
  async getColleges(filters = {}, page = 1, limit = 24) {
    const cacheParams = { ...filters, page, limit };
    const startTime = performance.now();
    
    // Try to get from cache first
    const cached = cacheService.get('colleges', cacheParams);
    if (cached) {
      const responseTime = performance.now() - startTime;
      cachePerformanceService.recordCacheHit('colleges', responseTime);
      return cached;
    }
    
    // If not in cache, make API call
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
    
    const data = await this.apiCall(`/api/colleges?${queryParams.toString()}`);
    
    // Cache the result
    cacheService.set('colleges', data, cacheParams);
    
    const responseTime = performance.now() - startTime;
    cachePerformanceService.recordCacheMiss('colleges', responseTime);
    
    return data;
  }

  async getCollegeFilters(currentFilters = {}) {
    const cacheParams = { ...currentFilters };
    const startTime = performance.now();
    
    // Try to get from cache first
    const cached = cacheService.get('filters', cacheParams);
    if (cached) {
      const responseTime = performance.now() - startTime;
      cachePerformanceService.recordCacheHit('filters', responseTime);
      return cached;
    }
    
    // If not in cache, make API call
    const queryParams = new URLSearchParams();
    
    // Add current filters as query parameters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const data = await this.apiCall(`/api/colleges/filters?${queryParams.toString()}`);
    
    // Cache the result
    cacheService.set('filters', data, cacheParams);
    
    const responseTime = performance.now() - startTime;
    cachePerformanceService.recordCacheMiss('filters', responseTime);
    
    return data;
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

  // Courses API with caching
  async getCourses(filters = {}, page = 1, limit = 20) {
    const cacheParams = { ...filters, page, limit };
    
    // Try to get from cache first
    const cached = cacheService.get('courses', cacheParams);
    if (cached) {
      return cached;
    }
    
    // If not in cache, make API call
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
    
    const data = await this.apiCall(`/api/courses?${queryParams.toString()}`);
    
    // Cache the result
    cacheService.set('courses', data, cacheParams);
    
    return data;
  }

  async getCourseFilters() {
    return this.apiCall('/api/courses/filters');
  }

  // Batch API for combining multiple requests
  async batchRequest(requests) {
    const cacheKey = `batch_${JSON.stringify(requests)}`;
    
    // Try to get from cache first
    const cached = cacheService.get('static', { batch: cacheKey });
    if (cached) {
      return cached;
    }
    
    // If not in cache, make batch API call
    const data = await this.apiCall('/api/batch', {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
    
    // Cache the result
    cacheService.set('static', data, { batch: cacheKey });
    
    return data;
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
    return this.apiCall(`/api/courses/${id}`);
  }

  async getCoursesByCollege(collegeId) {
    return this.apiCall(`/api/courses?college_id=${collegeId}&limit=1000`);
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
    
    return this.apiCall(`/api/cutoffs?${queryParams.toString()}`);
  }

  // BMAD Analytics API
  async getBMADAnalytics() {
    return this.apiCall('/api/bmad/analytics');
  }

  async getBMADPerformance() {
    return this.apiCall('/api/bmad/performance');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
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
