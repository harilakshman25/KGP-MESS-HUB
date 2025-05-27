const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateSecretKey, generateManagerMasterKey, generateComplaintToken } = require('../config/keys');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, contactNumber, password, hallName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if hall already has a manager
    const existingManager = await User.findOne({ hallName, role: 'manager' });
    if (existingManager) {
      return res.status(400).json({ message: 'This hall already has a registered manager' });
    }

    // Generate keys
    const secretAccessKey = generateSecretKey();
    const masterKey = generateManagerMasterKey(hallName, email);
    const complaintToken = generateComplaintToken();

    // Create user
    const user = await User.create({
      name,
      email,
      contactNumber,
      password,
      hallName,
      role: 'manager',
      secretAccessKey,
      masterKey,
      complaintToken,
      isApproved: false
    });

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hallName: user.hallName,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved (for managers)
    if (user.role === 'manager' && !user.isApproved) {
      return res.status(403).json({ message: 'Account approval pending. Please contact admin.' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hallName: user.hallName,
        isApproved: user.isApproved,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, contactNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        hallName: user.hallName
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user keys (for managers)
// @route   GET /api/auth/keys
// @access  Private (Manager only)
const getKeys = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.user.id);
    
    res.json({
      secretAccessKey: user.secretAccessKey,
      masterKey: user.masterKey,
      complaintToken: user.complaintToken
    });
  } catch (error) {
    console.error('Get keys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Regenerate keys (for managers)
// @route   POST /api/auth/regenerate-keys
// @access  Private (Manager only)
const regenerateKeys = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.user.id);
    
    // Regenerate keys
    user.secretAccessKey = generateSecretKey();
    user.masterKey = generateManagerMasterKey(user.hallName, user.email);
    user.complaintToken = generateComplaintToken();
    
    await user.save();

    res.json({
      message: 'Keys regenerated successfully',
      secretAccessKey: user.secretAccessKey,
      masterKey: user.masterKey,
      complaintToken: user.complaintToken
    });
  } catch (error) {
    console.error('Regenerate keys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// // @desc    Create initial admin user (temporary endpoint)
// // @route   POST /api/auth/create-admin
// // @access  Public (remove after creating admin)
// const createInitialAdmin = async (req, res) => {
//   try {
//     // Check if admin already exists
//     const existingAdmin = await User.findOne({ role: 'admin' });
//     if (existingAdmin) {
//       return res.status(400).json({ message: 'Admin user already exists' });
//     }

//     // Create admin user
//     const admin = await User.create({
//       name: 'System Admin',
//       email: 'admin@kgpmesshub.com',
//       contactNumber: '9999999999', // Add this required field
//       password: 'Admin@123456', // This will be hashed by the pre-save middleware
//       role: 'admin',
//       isApproved: true,
//       isActive: true
//     });

//     res.status(201).json({
//       message: 'Admin user created successfully',
//       user: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role
//       }
//     });
//   } catch (error) {
//     console.error('Create admin error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getKeys,
  regenerateKeys,
//   createInitialAdmin // Add this
};
