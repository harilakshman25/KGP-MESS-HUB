const express = require('express');
const router = express.Router();
const { auth, managerAuth } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      hallName: req.user.hallName,
      isApproved: req.user.isApproved,
      createdAt: req.user.createdAt
    }
  });
});

// @route   GET /api/users/manager-info
// @desc    Get manager specific information
// @access  Private (Manager only)
router.get('/manager-info', managerAuth, (req, res) => {
  res.json({
    manager: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      hallName: req.user.hallName,
      secretAccessKey: req.user.secretAccessKey,
      masterKey: req.user.masterKey,
      complaintToken: req.user.complaintToken,
      isApproved: req.user.isApproved,
      approvedAt: req.user.approvedAt
    }
  });
});

module.exports = router;
