const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { admin, collector } = require('../middleware/authMiddleware');
const wasteController = require('../controllers/wasteController');

// @route   POST api/waste
// @desc    Create a waste pickup request
// @access  Private (User)
router.post('/', auth, wasteController.createRequest);

// @route   GET api/waste
// @desc    Get all requests for logged in user
// @access  Private (User)
router.get('/', auth, wasteController.getUserRequests);

// @route   GET api/waste/all
// @desc    Get all requests (Admin/Collector)
// @access  Private (Admin/Collector)
router.get('/all', auth, collector, wasteController.getAllRequests);

// @route   PUT api/waste/:id
// @desc    Update request status (Admin/Collector)
// @access  Private (Admin/Collector)
router.put('/:id', auth, collector, wasteController.updateStatus);

// Bin Management
// @route   POST api/waste/bins
// @desc    Create/Assign a waste bin (Admin only)
// @access  Private (Admin)
router.post('/bins', auth, admin, wasteController.createBin);

// @route   GET api/waste/bins
// @desc    Get all waste bins (Admin/Collector)
// @access  Private (Admin/Collector)
router.get('/bins', auth, collector, wasteController.getBins);

// @route   PUT api/waste/bins/:id/status
// @desc    Update bin status (Admin/Collector)
// @access  Private (Admin/Collector)
router.put('/bins/:id/status', auth, collector, wasteController.updateBinStatus);

// @route   GET api/waste/my-bin
// @desc    Get user's assigned waste bin
// @access  Private (User)
router.get('/my-bin', auth, wasteController.getUserBin);

// Calendar Routes
// @route   GET api/waste/calendar
// @desc    Get all collection schedules
// @access  Private (All)
router.get('/calendar', auth, wasteController.getSchedules);

// @route   POST api/waste/calendar
// @desc    Create a collection schedule
// @access  Private (Admin/Collector)
router.post('/calendar', auth, collector, wasteController.createSchedule);

// @route   PUT api/waste/calendar/:id
// @desc    Update a collection schedule
// @access  Private (Admin/Collector)
router.put('/calendar/:id', auth, collector, wasteController.updateSchedule);

// @route   DELETE api/waste/calendar/:id
// @desc    Delete a collection schedule
// @access  Private (Admin/Collector)
router.delete('/calendar/:id', auth, collector, wasteController.deleteSchedule);

// @route   DELETE api/waste/bins/:id
// @desc    Delete a waste bin (Admin only)
// @access  Private (Admin)
router.delete('/bins/:id', auth, admin, wasteController.deleteBin);

module.exports = router;
