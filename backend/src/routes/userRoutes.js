const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMe, updateProfile } = require('../controllers/authController');

// @route   GET api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, getMe);

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
