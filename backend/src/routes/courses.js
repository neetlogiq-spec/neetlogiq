const router = require('express').Router();
const courseController = require('../controllers/courseController');

// Get all courses with filtering and pagination
router.get('/', courseController.getAllCourses);

// Get available filter options for courses
router.get('/filters', courseController.getFilterOptions);

// Search courses
router.get('/search', courseController.searchCourses);

// Get courses by type (medical, dental, etc.)
router.get('/type/:type', courseController.getCoursesByType);

// Get courses by level (UG, PG, etc.)
router.get('/level/:level', courseController.getCoursesByLevel);

// Get a specific course by ID
router.get('/:id', courseController.getCourseById);

// Get courses for a specific college
router.get('/college/:collegeId', courseController.getCoursesByCollege);

module.exports = router;
