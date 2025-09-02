const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/verify - Verify Google ID token
router.post('/verify', authController.verifyAuth);

// GET /api/auth/profile - Get user profile
router.get('/profile', authController.getUserProfile);

module.exports = router;
