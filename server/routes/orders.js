const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByStudent,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');
const { managerAuth } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Manager only)
router.post('/', managerAuth, validateOrder, createOrder);

// @route   GET /api/orders
// @desc    Get orders for a hall
// @access  Private (Manager only)
router.get('/', managerAuth, getOrders);

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private (Manager only)
router.get('/stats', managerAuth, getOrderStats);

// @route   GET /api/orders/student/:studentId
// @desc    Get orders by student
// @access  Private (Manager only)
router.get('/student/:studentId', managerAuth, getOrdersByStudent);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Manager only)
router.get('/:id', managerAuth, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Manager only)
router.put('/:id/status', managerAuth, updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private (Manager only)
router.delete('/:id', managerAuth, cancelOrder);

module.exports = router;
