const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    if (user.isLocked) {
      return res.status(401).json({ message: 'Account is temporarily locked' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const managerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied. Manager role required.' });
      }
      
      if (!req.user.isApproved) {
        return res.status(403).json({ message: 'Account approval pending' });
      }
      
      next();
    });
  } catch (error) {
    console.error('Manager auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const secretKeyAuth = (req, res, next) => {
  try {
    const { secretKey } = req.body;
    const userSecretKey = req.user.secretAccessKey;
    
    if (!secretKey || secretKey !== userSecretKey) {
      return res.status(403).json({ message: 'Invalid secret key' });
    }
    
    next();
  } catch (error) {
    console.error('Secret key auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const complaintTokenAuth = (req, res, next) => {
  try {
    const { complaintToken } = req.body;
    const userComplaintToken = req.user.complaintToken;
    
    if (!complaintToken || complaintToken !== userComplaintToken) {
      return res.status(403).json({ message: 'Invalid complaint token' });
    }
    
    next();
  } catch (error) {
    console.error('Complaint token auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  auth,
  managerAuth,
  adminAuth,
  secretKeyAuth,
  complaintTokenAuth
};
