const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getAvailableItems,
  getItemById,
  updateItem,
  deleteItem,
  toggleItemAvailability,
  getItemCategories,
  getItemsStats,
  bulkUpdateItems
} = require('../controllers/itemController');
const { managerAuth } = require('../middleware/auth');
const { validateItem } = require('../middleware/validation');

// @route   POST /api/items
// @desc    Create new item
// @access  Private (Manager only)
router.post('/', managerAuth, validateItem, createItem);

// @route   GET /api/items
// @desc    Get all items for a hall
// @access  Private (Manager only)
router.get('/', managerAuth, getItems);

// @route   GET /api/items/available
// @desc    Get available items for ordering
// @access  Private (Manager only)
router.get('/available', managerAuth, getAvailableItems);

// @route   GET /api/items/categories
// @desc    Get item categories
// @access  Private (Manager only)
router.get('/categories', managerAuth, getItemCategories);

// @route   GET /api/items/stats
// @desc    Get items statistics
// @access  Private (Manager only)
router.get('/stats', managerAuth, getItemsStats);

// @route   PUT /api/items/bulk-update
// @desc    Bulk update items
// @access  Private (Manager only)
router.put('/bulk-update', managerAuth, bulkUpdateItems);

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Private (Manager only)
router.get('/:id', managerAuth, getItemById);

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (Manager only)
router.put('/:id', managerAuth, validateItem, updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (Manager only)
router.delete('/:id', managerAuth, deleteItem);

// @route   PUT /api/items/:id/toggle-availability
// @desc    Toggle item availability
// @access  Private (Manager only)
router.put('/:id/toggle-availability', managerAuth, toggleItemAvailability);

module.exports = router;
