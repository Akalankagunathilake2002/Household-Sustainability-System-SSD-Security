const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');

// @route   GET api/settings
// @desc    Get all settings
// @access  Public
router.get('/', getSettings);

// @route   PUT api/settings
// @desc    Update settings
// @access  Private/Admin
router.put('/', [authMiddleware, admin], updateSettings);

module.exports = router;
