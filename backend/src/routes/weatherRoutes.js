const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/weather
// @desc    Get weather data based on coordinates
// @access  Private
router.get('/', authMiddleware, weatherController.getWeather);
router.get('/forecast', authMiddleware, weatherController.getForecast);

module.exports = router;
