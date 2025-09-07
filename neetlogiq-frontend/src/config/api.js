// API Configuration for NeetLogIQ
const API_CONFIG = {
  // Use environment variable for API URL, fallback to production backend
  BASE_URL: process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev',
  ENDPOINTS: {
    COLLEGES: '/api/colleges',
    COURSES: '/api/courses',
    FILTERS: '/api/colleges/filters',
    AI_RECOMMENDATIONS: '/api/ai/recommendations',
    ALIASES_SEARCH: '/api/aliases/search',
    HEALTH: '/api/health'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get base URL
export const getBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};

export default API_CONFIG;
