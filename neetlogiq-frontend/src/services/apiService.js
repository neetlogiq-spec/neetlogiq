// API Service for NeetLogIQ Backend Integration

const API_BASE_URL = 'http://localhost:5002/api'; // Backend is running on port 5002

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
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

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Colleges API
  async getColleges(filters = {}, page = 1, limit = 20) {
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
    
    return this.apiCall(`/colleges?${queryParams.toString()}`);
  }

  async getCollegeFilters(currentFilters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add current filters as query parameters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    return this.apiCall(`/colleges/filters?${queryParams.toString()}`);
  }

  async searchColleges(query, page = 1, limit = 24) {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query); // Use 'search' parameter as expected by backend
    queryParams.append('page', page); // Add pagination support
    queryParams.append('limit', limit); // Use 24 for proper grid layout
    
    // Use the existing colleges endpoint with search parameter
    return this.apiCall(`/colleges?${queryParams.toString()}`);
  }

  async getCollegeById(id) {
    return this.apiCall(`/colleges/${id}`);
  }

  async getCollegePrograms(collegeId) {
    return this.apiCall(`/colleges/${collegeId}/programs`);
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
    
    return this.apiCall(`/courses?${queryParams.toString()}`);
  }

  async getCourseFilters() {
    return this.apiCall('/courses/filters');
  }

  async searchCourses(query, filters = {}) {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    return this.apiCall(`/courses/search?${queryParams.toString()}`);
  }

  async getCourseById(id) {
    return this.apiCall(`/courses/${id}`);
  }

  async getCoursesByCollege(collegeId) {
    return this.apiCall(`/courses/college/${collegeId}`);
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
  healthCheck,
  getApiStatus
} = apiService;
