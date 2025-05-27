const User = require('../models/User');
const Student = require('../models/Student');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const Item = require('../models/Item');
const Hall = require('../models/Hall');

// @desc    Get all registration requests
// @route   GET /api/admin/registration-requests
// @access  Private (Admin only)
const getRegistrationRequests = async (req, res) => {
  try {
    const requests = await User.find({ 
      role: 'manager', 
      isApproved: false 
    }).select('-password -secretAccessKey -masterKey -complaintToken')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get registration requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve/Reject registration request
// @route   PUT /api/admin/registration-requests/:id
// @access  Private (Admin only)
const updateRegistrationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isApproved) {
      return res.status(400).json({ message: 'User already approved' });
    }

    if (action === 'approve') {
      user.isApproved = true;
      user.approvedBy = req.user.id;
      user.approvedAt = new Date();
      await user.save();

      res.json({ 
        message: 'User approved successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hallName: user.hallName,
          isApproved: user.isApproved
        }
      });
    } else if (action === 'reject') {
      await User.findByIdAndDelete(id);
      res.json({ message: 'Registration request rejected and deleted' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Update registration request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalManagers = await User.countDocuments({ role: 'manager', isApproved: true });
    const pendingRequests = await User.countDocuments({ role: 'manager', isApproved: false });
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });

    // Get revenue statistics
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get orders by hall
    const ordersByHall = await Order.aggregate([
      {
        $group: {
          _id: '$hallName',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activities
    const recentOrders = await Order.find()
      .populate('student', 'rollNumber name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentComplaints = await Complaint.find()
      .populate('student', 'rollNumber name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly order trends
    const monthlyTrends = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      overview: {
        totalManagers,
        pendingRequests,
        totalStudents,
        totalOrders,
        totalComplaints,
        pendingComplaints,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        avgOrderValue: revenueStats[0]?.avgOrderValue || 0
      },
      ordersByHall,
      recentOrders,
      recentComplaints,
      monthlyTrends
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all managers
// @route   GET /api/admin/managers
// @access  Private (Admin only)
const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .select('-password -secretAccessKey -masterKey -complaintToken')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(managers);
  } catch (error) {
    console.error('Get all managers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate/Activate manager
// @route   PUT /api/admin/managers/:id/status
// @access  Private (Admin only)
const updateManagerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const manager = await User.findById(id);
    if (!manager || manager.role !== 'manager') {
      return res.status(404).json({ message: 'Manager not found' });
    }

    manager.isActive = isActive;
    await manager.save();

    res.json({
      message: `Manager ${isActive ? 'activated' : 'deactivated'} successfully`,
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        hallName: manager.hallName,
        isActive: manager.isActive
      }
    });
  } catch (error) {
    console.error('Update manager status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system-wide reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const getSystemReports = async (req, res) => {
  try {
    const { startDate, endDate, hallName } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let hallFilter = {};
    if (hallName) hallFilter.hallName = hallName;

    // Orders report
    const ordersReport = await Order.aggregate([
      { $match: { ...dateFilter, ...hallFilter } },
      {
        $group: {
          _id: '$hallName',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          uniqueStudents: { $addToSet: '$student' }
        }
      },
      {
        $addFields: {
          uniqueStudentCount: { $size: '$uniqueStudents' }
        }
      },
      {
        $project: {
          uniqueStudents: 0
        }
      }
    ]);

    // Items popularity report
    const itemsReport = await Order.aggregate([
      { $match: { ...dateFilter, ...hallFilter } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 20 }
    ]);

    // Complaints report
    const complaintsReport = await Complaint.aggregate([
      { $match: { ...dateFilter, ...hallFilter } },
      {
        $group: {
          _id: {
            hallName: '$hallName',
            status: '$status'
          },
          count: { $sum: 1 },
          totalRefundRequested: { $sum: '$requestedRefund' },
          totalRefundApproved: { $sum: '$refundApproved' }
        }
      }
    ]);

    res.json({
      ordersReport,
      itemsReport,
      complaintsReport,
      generatedAt: new Date(),
      filters: { startDate, endDate, hallName }
    });
  } catch (error) {
    console.error('Get system reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create admin user
// @route   POST /api/admin/create-admin
// @access  Private (Admin only)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isApproved: true,
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRegistrationRequests,
  updateRegistrationRequest,
  getDashboardStats,
  getAllManagers,
  updateManagerStatus,
  getSystemReports,
  createAdmin
};
