// Google OAuth Configuration
import { GOOGLE_CREDENTIALS } from './google-credentials';

export const GOOGLE_CONFIG = {
  // Google Client ID from the provided credentials
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || GOOGLE_CREDENTIALS.client_id,
  
  // OAuth scopes
  SCOPE: 'profile email',
  
  // Cookie policy
  COOKIE_POLICY: 'single_host_origin',
};

// Backend API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5002',
  ENDPOINTS: {
    AUTH: '/api/auth',
    USER: '/api/user',
  },
};
