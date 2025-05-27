const Order = require('../models/Order');
const Student = require('../models/Student');
const Item = require('../models/Item');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Manager only)
const createOrder = async (req, res) => {
  try {
    const { studentId, items } = req.body;

    // Validate student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Student not from your hall' });
    }

    // Validate and process items
    let totalAmount = 0;
    const orderItems = [];

    for (const orderItem of items) {
      const item = await Item.findById(orderItem.item);
      if (!item) {
        return res.status(404).json({ message: `Item not found: ${orderItem.item}` });
      }

      if (!item.isAvailable) {
        return res.status(400).json({ message: `Item not available: ${item.name}` });
      }

      if (item.hallName !== req.user.hallName) {
        return res.status(403).json({ message: `Item not from your hall: ${item.name}` });
      }

      if (orderItem.quantity > item.maxQuantityPerOrder) {
        return res.status(400).json({ 
          message: `Quantity exceeds maximum allowed for ${item.name}. Max: ${item.maxQuantityPerOrder}` 
        });
      }

      const itemTotal = item.price * orderItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        item: item._id,
        itemName: item.name,
        quantity: orderItem.quantity,
        unitPrice: item.price,
        totalPrice: itemTotal
      });

      // Update item order count
      await item.incrementOrderCount(orderItem.quantity);
    }

    // Check if student can afford (allowing negative balance)
    const balanceAfterOrder = student.balance - totalAmount;

    // Generate batch ID
    const batchId = Order.generateBatchId();

    // Create order
    const order = await Order.create({
      batchId,
      student: student._id,
      studentRollNumber: student.rollNumber,
      studentName: student.name,
      hallName: req.user.hallName,
      items: orderItems,
      totalAmount,
      balanceAfterOrder,
      processedBy: req.user.id
    });

    // Update student balance and stats
    await student.updateBalance(totalAmount, 'deduct');
    student.totalOrders += 1;
    await student.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.item', 'name category')
      .populate('student', 'rollNumber name roomNumber')
      .populate('processedBy', 'name');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get orders for a hall
// @route   GET /api/orders
// @access  Private (Manager only)
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      startDate,
      endDate,
      studentRollNumber,
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    let query = { hallName: req.user.hallName };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    if (studentRollNumber) {
      query.studentRollNumber = new RegExp(studentRollNumber, 'i');
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('student', 'rollNumber name roomNumber')
      .populate('items.item', 'name category')
      .populate('processedBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Manager only)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('student', 'rollNumber name roomNumber phoneNumber')
      .populate('items.item', 'name category description')
      .populate('processedBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get orders by student
// @route   GET /api/orders/student/:studentId
// @access  Private (Manager only)
const getOrdersByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find({ student: studentId })
      .populate('items.item', 'name category')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ student: studentId });

    res.json({
      orders,
      student: {
        rollNumber: student.rollNumber,
        name: student.name,
        roomNumber: student.roomNumber
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get orders by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Manager only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (notes) order.notes = notes;

    if (status === 'completed') {
      order.completedAt = new Date();
    }

    await order.save();

    res.json({
      message: `Order status updated from ${oldStatus} to ${status}`,
      order: {
        id: order._id,
        batchId: order.batchId,
        status: order.status,
        notes: order.notes,
        completedAt: order.completedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (Manager only)
const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hallName = req.user.hallName;

    let dateFilter = { hallName };
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    // Overall statistics
    const overallStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
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
      }
    ]);

    // Status-wise statistics
    const statusStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Daily statistics
    const dailyStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$orderDate' }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Popular items
    const popularItems = await Order.aggregate([
      { $match: dateFilter },
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
      { $limit: 10 }
    ]);

    // Top spending students
    const topStudents = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            studentId: '$student',
            rollNumber: '$studentRollNumber',
            name: '$studentName'
          },
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: overallStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        uniqueStudentCount: 0
      },
      statusStats,
      dailyStats,
      popularItems,
      topStudents,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private (Manager only)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id).populate('student');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled order' });
    }

    // Refund the amount to student
    const student = order.student;
    await student.updateBalance(order.totalAmount, 'add');
    student.totalOrders = Math.max(0, student.totalOrders - 1);
    await student.save();

    // Update item order counts
    for (const item of order.items) {
      await Item.findByIdAndUpdate(item.item, {
        $inc: { totalOrdered: -item.quantity }
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.notes = reason || 'Cancelled by manager';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      refundAmount: order.totalAmount,
      order: {
        id: order._id,
        batchId: order.batchId,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Cancel order e rror:', error);
   res.status(500).json({ message: 'Server error' });
  }
};

module.exports={
    createOrder,
    getOrders,
    getOrderById,
    getOrdersByStudent,
    updateOrderStatus,
    getOrderStats,
    cancelOrder
};

