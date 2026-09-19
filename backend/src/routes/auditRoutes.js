const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');
const auditController = require('../controllers/auditController');

// @route   POST api/audit
// @desc    Create a sustainability audit
// @access  Private
router.post('/', authMiddleware, auditController.createAudit);

// @route   GET api/audit
// @desc    Get user's latest audit
// @access  Private
router.get('/', authMiddleware, auditController.getAudit);

// @route   GET api/audit/all
// @desc    Get all audits (Admin only)
// @access  Private/Admin
router.get('/all', [authMiddleware, admin], auditController.getAllAudits);

// @route   PUT api/audit/:id
// @desc    Update an audit
// @access  Private
router.put('/:id', authMiddleware, auditController.updateAudit);

// @route   DELETE api/audit/:id
// @desc    Delete an audit
// @access  Private
router.delete('/:id', authMiddleware, auditController.deleteAudit);

module.exports = router;
