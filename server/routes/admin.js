const express = require('express');
const router = express.Router();
const {
  getRegistrationRequests,
  updateRegistrationRequest,
  getDashboardStats,
  getAllManagers,
  updateManagerStatus,
  getSystemReports,
  createAdmin
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const { validateUserRegistration } = require('../middleware/validation');

// @route   GET /api/admin/registration-requests
// @desc    Get all registration requests
// @access  Private (Admin only)
router.get('/registration-requests', adminAuth, getRegistrationRequests);

// @route   PUT /api/admin/registration-requests/:id
// @desc    Approve/Reject registration request
// @access  Private (Admin only)
router.put('/registration-requests/:id', adminAuth, updateRegistrationRequest);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, getDashboardStats);

// @route   GET /api/admin/managers
// @desc    Get all managers
// @access  Private (Admin only)
router.get('/managers', adminAuth, getAllManagers);

// @route   PUT /api/admin/managers/:id/status
// @desc    Deactivate/Activate manager
// @access  Private (Admin only)
router.put('/managers/:id/status', adminAuth, updateManagerStatus);

// @route   GET /api/admin/reports
// @desc    Get system-wide reports
// @access  Private (Admin only)
router.get('/reports', adminAuth, getSystemReports);

// @route   POST /api/admin/create-admin
// @desc    Create admin user
// @access  Private (Admin only)
router.post('/create-admin', adminAuth, validateUserRegistration, createAdmin);

module.exports = router;
