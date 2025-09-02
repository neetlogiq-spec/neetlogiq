const logger = require('../utils/logger');

// Admin credentials - in production, these should be in environment variables
const ADMIN_CREDENTIALS = {
  username: 'Lone_wolf#12',
  password: 'Apx_gp_delta'
};

// Secret admin path
const ADMIN_SECRET_PATH = '/sector_xp_12';

/**
 * Middleware to check if request is for admin routes
 */
const isAdminRoute = (req, res, next) => {
  // Check if the request path contains the secret admin path
  if (req.path.includes(ADMIN_SECRET_PATH)) {
    req.isAdminRoute = true;
    next();
  } else {
    req.isAdminRoute = false;
    next();
  }
};

/**
 * Middleware to authenticate admin access
 */
const authenticateAdmin = (req, res, next) => {
  // Only apply to admin routes
  if (!req.isAdminRoute) {
    return next();
  }

  // Check for basic auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Return 401 with WWW-Authenticate header for basic auth
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Access"');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Admin credentials required'
    });
  }

  try {
    // Decode base64 credentials
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');

    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Set admin session
      req.isAdmin = true;
      req.adminUser = {
        username: username,
        role: 'super_admin',
        permissions: { all: true }
      };
      
      logger.info(`Admin login successful: ${username} from ${req.ip}`);
      next();
    } else {
      logger.warn(`Admin login failed: ${username} from ${req.ip}`);
      res.setHeader('WWW-Authenticate', 'Basic realm="Admin Access"');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password incorrect'
      });
    }
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to require admin access
 */
const requireAdmin = (req, res, next) => {
  if (!req.isAdminRoute) {
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  }

  if (!req.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }

  next();
};

/**
 * Rate limiting for admin routes to prevent brute force
 */
const adminRateLimit = (req, res, next) => {
  if (!req.isAdminRoute) {
    return next();
  }

  // Simple rate limiting - in production, use Redis or similar
  const clientIP = req.ip;
  const now = Date.now();
  
  if (!req.app.locals.adminRateLimit) {
    req.app.locals.adminRateLimit = new Map();
  }

  const rateLimitMap = req.app.locals.adminRateLimit;
  const clientData = rateLimitMap.get(clientIP) || { count: 0, resetTime: now + 15 * 60 * 1000 }; // 15 minutes

  // Reset counter if time has passed
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + 15 * 60 * 1000;
  }

  // Check rate limit (max 5 attempts per 15 minutes)
  if (clientData.count >= 5) {
    logger.warn(`Admin rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many authentication attempts. Please try again later.'
    });
  }

  clientData.count++;
  rateLimitMap.set(clientIP, clientData);
  next();
};

/**
 * Log all admin access attempts
 */
const logAdminAccess = (req, res, next) => {
  if (req.isAdminRoute) {
    logger.info(`Admin route accessed: ${req.method} ${req.path} by ${req.ip}`);
  }
  next();
};

module.exports = {
  isAdminRoute,
  authenticateAdmin,
  requireAdmin,
  adminRateLimit,
  logAdminAccess,
  ADMIN_SECRET_PATH
};
