const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  getKeys, 
  regenerateKeys,
//   createInitialAdmin
} = require('../controllers/authController');
const { auth, managerAuth } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validatePasswordChange 
} = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateUserRegistration, register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateUserLogin, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, validatePasswordChange, changePassword);

// @route   GET /api/auth/keys
// @desc    Get user keys (for managers)
// @access  Private (Manager only)
router.get('/keys', managerAuth, getKeys);

// @route   POST /api/auth/regenerate-keys
// @desc    Regenerate keys (for managers)
// @access  Private (Manager only)
router.post('/regenerate-keys', managerAuth, regenerateKeys);

// Temporary route for creating initial admin
// router.post('/create-admin', createInitialAdmin);


module.exports = router;
