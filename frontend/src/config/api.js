// API Configuration
export const API_CONFIG = {
  // Backend server URL - use relative paths for proxy to work
  BASE_URL: '',
  
  // API endpoints
  ENDPOINTS: {
    // Admin authentication
    ADMIN_AUTH: '/api/sector_xp_12',
    
    // Admin dashboard
    ADMIN_STATS: '/api/sector_xp_12/stats',
    ADMIN_ACTIVITY: '/api/sector_xp_12/recent-activity',
    
    // Colleges management
    COLLEGES_LIST: '/api/sector_xp_12/colleges',
    COLLEGE_ADD: '/api/sector_xp_12/colleges',
    COLLEGE_UPDATE: '/api/sector_xp_12/colleges',
    COLLEGE_DELETE: '/api/sector_xp_12/colleges',
    
    // Programs management
    PROGRAMS_LIST: '/api/sector_xp_12/programs',
    PROGRAM_ADD: '/api/sector_xp_12/programs',
    PROGRAM_UPDATE: '/api/sector_xp_12/programs',
    PROGRAM_DELETE: '/api/sector_xp_12/programs',
    
    // User management
    USERS_LIST: '/api/sector_xp_12/admin/users',
    USER_ADD: '/api/sector_xp_12/admin/users',
    USER_UPDATE: '/api/sector_xp_12/admin/users',
    USER_DELETE: '/api/sector_xp_12/admin/users',
    
    // Data validation
    VALIDATION_RESULTS: '/api/sector_xp_12/admin/validation/results',
    VALIDATION_START: '/api/sector_xp_12/admin/validation/start',
    VALIDATION_CORRECT: '/api/sector_xp_12/admin/validation/correct',
    VALIDATION_VALIDATE: '/api/sector_xp_12/admin/validation/validate',
    
    // AI system
    AI_METRICS: '/api/sector_xp_12/admin/ai/metrics',
    AI_PROCESS: '/api/sector_xp_12/admin/ai/process',
    AI_TRAIN: '/api/sector_xp_12/admin/ai/train',
    
    // System health
    SYSTEM_HEALTH: '/api/sector_xp_12/admin/system/health',
    SYSTEM_PERFORMANCE: '/api/sector_xp_12/admin/system/performance',
    
    // Cutoff management
    CUTOFF_IMPORT: '/api/sector_xp_12/admin/cutoffs/import',
    CUTOFF_STAGING_RESET: '/api/sector_xp_12/admin/cutoffs/staging/reset',
    CUTOFF_SESSIONS: '/api/sector_xp_12/admin/cutoffs/sessions',
    CUTOFF_STATS: '/api/sector_xp_12/admin/cutoffs/stats',
    CUTOFF_UPLOAD: '/api/sector_xp_12/admin/cutoffs/upload',
    CUTOFF_PROCESS: '/api/sector_xp_12/admin/cutoffs/process',
    CUTOFF_STAGING: '/api/sector_xp_12/admin/cutoffs/staging',
    CUTOFF_STAGING_UPDATE: '/api/sector_xp_12/admin/cutoffs/staging',
    
    // Import/Export
    IMPORT_EXPORT: '/api/sector_xp_12/import',
    
    // Error corrections
    ERROR_CORRECTIONS: '/api/sector_xp_12/admin/error-corrections',
    ERROR_CORRECTIONS_STATS: '/api/sector_xp_12/admin/error-corrections/stats',
    
    // Colleges
    COLLEGES: '/api/sector_xp_12/colleges',
    
    // Health checks
    HEALTH: '/api/health',
    CACHE_STATS: '/api/cache/stats',
    
    // Legacy endpoints (keeping for compatibility)
    LEGACY_CUTOFF_IMPORT: '/api/cutoffs/import',
    LEGACY_AUTH: '/api/auth/current-user'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint by key
export const getApiEndpoint = (key) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[key]);
};
