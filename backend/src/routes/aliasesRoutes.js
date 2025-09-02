/**
 * ALIASES ROUTES
 * 
 * API routes for the aliases system
 * Provides comprehensive endpoints for managing aliases
 */

const express = require('express');
const router = express.Router();
const aliasesController = require('../controllers/aliasesController');

// ========================================
// MIDDLEWARE
// ========================================

// Basic authentication middleware (you can enhance this)
const authenticate = (req, res, next) => {
  // For now, we'll allow all requests
  // In production, implement proper authentication
  req.user = { id: 1, role: 'admin' }; // Mock user
  next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// ========================================
// CRUD OPERATIONS
// ========================================

/**
 * @route   POST /api/aliases
 * @desc    Create a new alias
 * @access  Private (Admin)
 * @body    { entityType, entityId, aliasText, aliasType, confidenceScore, isPrimary, context, notes }
 */
router.post('/', authenticate, requireAdmin, aliasesController.createAlias);

/**
 * @route   GET /api/aliases/search
 * @desc    Search entities by alias
 * @access  Public
 * @query   { q (required), entityType?, limit? }
 */
router.get('/search', aliasesController.searchByAlias);

/**
 * @route   GET /api/aliases/entity
 * @desc    Get entity by alias
 * @access  Public
 * @query   { q (required), entityType? }
 */
router.get('/entity', aliasesController.getEntityByAlias);

/**
 * @route   GET /api/aliases/statistics
 * @desc    Get alias statistics
 * @access  Public
 */
router.get('/statistics', aliasesController.getAliasStatistics);

/**
 * @route   GET /api/aliases/top-used
 * @desc    Get top used aliases
 * @access  Public
 * @query   { limit? }
 */
router.get('/top-used', aliasesController.getTopUsedAliases);

/**
 * @route   GET /api/aliases/export
 * @desc    Export aliases to CSV or JSON
 * @access  Private (Admin)
 * @query   { entityType?, entityId?, format? }
 */
router.get('/export', authenticate, requireAdmin, aliasesController.exportAliases);

/**
 * @route   GET /api/aliases/health
 * @desc    Health check for aliases service
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const aliasesService = require('../services/aliasesService');
    
    if (!aliasesService.isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Aliases service not initialized',
        status: 'unhealthy'
      });
    }

    // Try to get basic statistics to verify service is working
    const stats = await aliasesService.getAliasStatistics();
    
    if (stats.success) {
      res.json({
        success: true,
        message: 'Aliases service is healthy',
        status: 'healthy',
        statistics: stats.statistics
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'Aliases service is not responding properly',
        status: 'unhealthy'
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Aliases service health check failed',
      status: 'unhealthy',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/aliases
 * @desc    Get aliases (with optional filtering)
 * @access  Public
 * @query   { entityType?, entityId?, limit?, offset? }
 */
router.get('/', aliasesController.getAliases);

/**
 * @route   GET /api/aliases/:aliasId
 * @desc    Get a specific alias by ID
 * @access  Public
 * @params  { aliasId }
 */
router.get('/:aliasId', async (req, res, next) => {
  try {
    const { aliasId } = req.params;
    
    if (!aliasId || isNaN(aliasId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alias ID'
      });
    }

    // Get all aliases and filter by ID
    const result = await aliasesController.getAliases(req, res, next);
    
    if (result && result.aliases) {
      const alias = result.aliases.find(a => a.id === parseInt(aliasId));
      if (alias) {
        return res.json({
          success: true,
          alias
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Alias not found'
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/aliases/:aliasId
 * @desc    Update an alias
 * @access  Private (Admin)
 * @params  { aliasId }
 * @body    { aliasText?, aliasType?, confidenceScore?, isPrimary?, context?, notes?, status? }
 */
router.put('/:aliasId', authenticate, requireAdmin, aliasesController.updateAlias);

/**
 * @route   DELETE /api/aliases/:aliasId
 * @desc    Delete an alias
 * @access  Private (Admin)
 * @params  { aliasId }
 */
router.delete('/:aliasId', authenticate, requireAdmin, aliasesController.deleteAlias);

// ========================================
// SEARCH OPERATIONS
// ========================================
// (Routes moved to top for proper ordering)

// ========================================
// AUTOMATIC GENERATION
// ========================================

/**
 * @route   POST /api/aliases/generate
 * @desc    Generate aliases for an entity
 * @access  Private (Admin)
 * @body    { entityType, entityId, entityName }
 */
router.post('/generate', authenticate, requireAdmin, aliasesController.generateAliases);

/**
 * @route   POST /api/aliases/generate/all-colleges
 * @desc    Generate aliases for all colleges
 * @access  Private (Admin)
 */
router.post('/generate/all-colleges', authenticate, requireAdmin, aliasesController.generateAllCollegeAliases);

// ========================================
// STATISTICS AND ANALYTICS
// ========================================
// (Routes moved to top for proper ordering)

// ========================================
// BULK OPERATIONS
// ========================================

/**
 * @route   POST /api/aliases/bulk/create
 * @desc    Bulk create aliases
 * @access  Private (Admin)
 * @body    { aliases: [{ entityType, entityId, aliasText, ... }] }
 */
router.post('/bulk/create', authenticate, requireAdmin, aliasesController.bulkCreateAliases);

/**
 * @route   PUT /api/aliases/bulk/update
 * @desc    Bulk update aliases
 * @access  Private (Admin)
 * @body    { updates: [{ aliasId, ...updateData }] }
 */
router.put('/bulk/update', authenticate, requireAdmin, aliasesController.bulkUpdateAliases);

// ========================================
// EXPORT/IMPORT
// ========================================
// (Routes moved to top for proper ordering)

// ========================================
// HEALTH CHECK
// ========================================
// (Routes moved to top for proper ordering)

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler for aliases routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Aliases API endpoint not found',
    availableEndpoints: [
      'GET /api/aliases - Get aliases',
      'POST /api/aliases - Create alias',
      'GET /api/aliases/:id - Get specific alias',
      'PUT /api/aliases/:id - Update alias',
      'DELETE /api/aliases/:id - Delete alias',
      'GET /api/aliases/search - Search by alias',
      'GET /api/aliases/entity - Get entity by alias',
      'POST /api/aliases/generate - Generate aliases',
      'GET /api/aliases/statistics - Get statistics',
      'GET /api/aliases/top-used - Get top used aliases',
      'POST /api/aliases/bulk/create - Bulk create',
      'PUT /api/aliases/bulk/update - Bulk update',
      'GET /api/aliases/export - Export aliases',
      'GET /api/aliases/health - Health check'
    ]
  });
});

module.exports = router;
