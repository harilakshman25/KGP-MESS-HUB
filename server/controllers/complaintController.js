const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const Student = require('../models/Student');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Manager only)
const createComplaint = async (req, res) => {
  try {
    const {
      orderId,
      complaintType,
      description,
      requestedRefund,
      complaintToken,
      submittedBy
    } = req.body;

    // Verify complaint token
    if (complaintToken !== req.user.complaintToken) {
      return res.status(403).json({ message: 'Invalid complaint token' });
    }

    // Verify order exists and belongs to this hall
    const order = await Order.findById(orderId).populate('student');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Order not from your hall' });
    }

    // Check if complaint already exists for this order
    const existingComplaint = await Complaint.findOne({ order: orderId });
    if (existingComplaint) {
      return res.status(400).json({ message: 'Complaint already exists for this order' });
    }

    // Generate complaint ID
    const complaintId = Complaint.generateComplaintId();

    // Create complaint
    const complaint = await Complaint.create({
      complaintId,
      order: orderId,
      student: order.student._id,
      studentRollNumber: order.studentRollNumber,
      hallName: req.user.hallName,
      complaintType,
      description,
      orderBatchId: order.batchId,
      orderAmount: order.totalAmount,
      requestedRefund: requestedRefund || order.totalAmount,
      submittedBy: submittedBy || 'mess_worker',
      complaintToken
    });

    // Mark order as disputed
    await order.disputeOrder(description);

    // Populate the complaint for response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'rollNumber name roomNumber')
      .populate('order', 'batchId totalAmount orderDate');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private (Manager only)
const getComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      startDate,
      endDate,
      studentRollNumber
    } = req.query;

    const skip = (page - 1) * limit;

    let query = { hallName: req.user.hallName };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (studentRollNumber) {
      query.studentRollNumber = new RegExp(studentRollNumber, 'i');
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'rollNumber name roomNumber')
      .populate('order', 'batchId totalAmount orderDate')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (Manager only)
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('student', 'rollNumber name roomNumber phoneNumber')
      .populate('order', 'batchId totalAmount orderDate items')
      .populate('reviewedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Manager only)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, refundAmount, reviewNotes } = req.body; // action: 'approve' or 'reject'

    const complaint = await Complaint.findById(id).populate('order').populate('student');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (complaint.status !== 'pending' && complaint.status !== 'under_review') {
      return res.status(400).json({ message: 'Complaint has already been processed' });
    }

    if (action === 'approve') {
      await complaint.approve(req.user.id, refundAmount, reviewNotes);
      
      // Process refund to student
      if (complaint.refundApproved > 0) {
        await complaint.student.updateBalance(complaint.refundApproved, 'add');
        await complaint.processRefund();
      }

      // Update order status
      await complaint.order.resolveDispute(req.user.id, true);

      res.json({
        message: 'Complaint approved and refund processed',
        complaint: {
          id: complaint._id,
          complaintId: complaint.complaintId,
          status: complaint.status,
          refundApproved: complaint.refundApproved
        }
      });
    } else if (action === 'reject') {
      await complaint.reject(req.user.id, reviewNotes);
      
      // Update order status
      await complaint.order.resolveDispute(req.user.id, false);

      res.json({
        message: 'Complaint rejected',
        complaint: {
          id: complaint._id,
          complaintId: complaint.complaintId,
          status: complaint.status
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaints statistics
// @route   GET /api/complaints/stats
// @access  Private (Manager only)
const getComplaintsStats = async (req, res) => {
  try {
    const hallName = req.user.hallName;

    const stats = await Complaint.aggregate([
      { $match: { hallName } },
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          pendingComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          totalRefundRequested: { $sum: '$requestedRefund' },
          totalRefundApproved: { $sum: '$refundApproved' }
        }
      }
    ]);

    const statusStats = await Complaint.aggregate([
      { $match: { hallName } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRefundRequested: { $sum: '$requestedRefund' },
          totalRefundApproved: { $sum: '$refundApproved' }
        }
      }
    ]);

    const typeStats = await Complaint.aggregate([
      { $match: { hallName } },
      {
        $group: {
          _id: '$complaintType',
          count: { $sum: 1 },
          avgRefundRequested: { $avg: '$requestedRefund' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalComplaints: 0,
        pendingComplaints: 0,
        approvedComplaints: 0,
        rejectedComplaints: 0,
        totalRefundRequested: 0,
        totalRefundApproved: 0
      },
      statusStats,
      typeStats
    });
  } catch (error) {
    console.error('Get complaints stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintsStats
};
