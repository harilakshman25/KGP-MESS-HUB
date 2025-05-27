const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintsStats
} = require('../controllers/complaintController');
const { managerAuth, complaintTokenAuth } = require('../middleware/auth');
const { uploadComplaintAttachment, handleUploadError } = require('../middleware/upload');
const { validateComplaint } = require('../middleware/validation');

// @route   POST /api/complaints
// @desc    Create new complaint
// @access  Private (Manager only)
router.post('/', managerAuth, uploadComplaintAttachment, handleUploadError, validateComplaint, createComplaint);

// @route   GET /api/complaints
// @desc    Get complaints
// @access  Private (Manager only)
router.get('/', managerAuth, getComplaints);

// @route   GET /api/complaints/stats
// @desc    Get complaints statistics
// @access  Private (Manager only)
router.get('/stats', managerAuth, getComplaintsStats);

// @route   GET /api/complaints/:id
// @desc    Get complaint by ID
// @access  Private (Manager only)
router.get('/:id', managerAuth, getComplaintById);

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Manager only)
router.put('/:id/status', managerAuth, updateComplaintStatus);

module.exports = router;
