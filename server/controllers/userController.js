const User = require('../models/User');
const Student = require('../models/Student');
const Order = require('../models/Order');

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    let dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hallName: user.hallName,
        isApproved: user.isApproved
      }
    };

    if (user.role === 'manager' && user.isApproved) {
      // Get manager-specific dashboard data
      const studentsCount = await Student.countDocuments({ 
        hallName: user.hallName, 
        isActive: true 
      });

      const ordersCount = await Order.countDocuments({ 
        hallName: user.hallName 
      });

      const recentOrders = await Order.find({ hallName: user.hallName })
        .populate('student', 'rollNumber name')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData.managerData = {
        studentsCount,
        ordersCount,
        recentOrders
      };
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user activity log
// @route   GET /api/users/activity
// @access  Private
const getUserActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // This would typically come from an activity log collection
    // For now, we'll return recent orders as activity
    const activities = await Order.find({ processedBy: req.user.id })
      .populate('student', 'rollNumber name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ processedBy: req.user.id });

    const formattedActivities = activities.map(order => ({
      id: order._id,
      type: 'order_processed',
      description: `Processed order for ${order.student.name} (${order.student.rollNumber})`,
      amount: order.totalAmount,
      timestamp: order.createdAt,
      metadata: {
        orderId: order._id,
        batchId: order.batchId,
        studentId: order.student._id
      }
    }));

    res.json({
      activities: formattedActivities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user status
// @route   PUT /api/users/status
// @access  Private
const changeUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Change user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardData,
  updatePreferences,
  getUserActivity,
  changeUserStatus
};
