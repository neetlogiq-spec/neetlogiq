const router = require('express').Router();
const collegeController = require('../controllers/collegeController');

// Get all colleges with filtering and pagination
router.get('/', collegeController.getAllColleges);

// Get available filter options
router.get('/filters', collegeController.getFilterOptions);

// Search colleges
router.get('/search', collegeController.searchColleges);

// Get colleges by type (medical, dental, etc.)
router.get('/type/:type', collegeController.getCollegesByType);

// Get programs for a specific college
router.get('/:collegeId/programs', collegeController.getCollegePrograms);

// Get a specific college by ID
router.get('/:id', collegeController.getCollegeById);

module.exports = router;