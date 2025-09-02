import { getApiEndpoint } from '../config/api';

// API utility functions for authenticated requests
const ADMIN_CREDENTIALS = {
  username: 'Lone_wolf#12',
  password: 'Apx_gp_delta'
};

// Create Basic Auth header
const getAuthHeader = () => {
  const credentials = btoa(`${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`);
  return `Basic ${credentials}`;
};

// Authenticated fetch wrapper
export const authenticatedFetch = async (url, options = {}) => {
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    }
  };

  try {
    const response = await fetch(url, authOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Import Sessions
  getImportSessions: () => authenticatedFetch(getApiEndpoint('CUTOFF_SESSIONS')),
  
  // Raw Data
  getRawData: (sessionId) => authenticatedFetch(`${getApiEndpoint('CUTOFF_SESSIONS')}/${sessionId}/raw`),
  
  // Processed Data
  getProcessedData: (sessionId) => authenticatedFetch(`${getApiEndpoint('CUTOFF_SESSIONS')}/${sessionId}/processed`),
  
  // File Upload
  uploadFile: (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    return authenticatedFetch(getApiEndpoint('CUTOFF_IMPORT'), {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        'Authorization': getAuthHeader(),
      }
    });
  },
  
  // Process Session
  processSession: (sessionId) => authenticatedFetch(`${getApiEndpoint('CUTOFF_SESSIONS')}/${sessionId}/process`, {
    method: 'POST'
  }),
  
  // Verify Record
  verifyRecord: (recordId, data) => authenticatedFetch(`${getApiEndpoint('CUTOFF_SESSIONS')}/records/${recordId}/verify`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Migrate Session
  migrateSession: (sessionId) => authenticatedFetch(`${getApiEndpoint('CUTOFF_SESSIONS')}/${sessionId}/migrate`, {
    method: 'POST'
  }),
  
  // Reset Staging Database
  resetStagingDatabase: () => authenticatedFetch(getApiEndpoint('CUTOFF_STAGING_RESET'), {
    method: 'POST'
  }),
  
  // Delete Import Session
  deleteImportSession: (sessionId) => authenticatedFetch(`${getApiEndpoint('CUTOFF_SESSIONS')}/${sessionId}`, {
    method: 'DELETE'
  })
};
