const Item = require('../models/Item');

// @desc    Create new item
// @route   POST /api/items
// @access  Private (Manager only)
const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      maxQuantityPerOrder,
      tags,
      nutritionalInfo,
      preparationTime,
      isSpecialItem
    } = req.body;

    // Check if item already exists in this hall
    const existingItem = await Item.findOne({
      name: name.trim(),
      hallName: req.user.hallName
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item with this name already exists in your hall' });
    }

    const item = await Item.create({
      name: name.trim(),
      description,
      price,
      category,
      hallName: req.user.hallName,
      maxQuantityPerOrder,
      tags,
      nutritionalInfo,
      preparationTime,
      isSpecialItem,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all items for a hall
// @route   GET /api/items
// @access  Private (Manager only)
const getItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      category, 
      isAvailable,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (page - 1) * limit;

    let query = { hallName: req.user.hallName };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find(query)
      .populate('createdBy', 'name')
      .populate('lastModifiedBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available items for ordering
// @route   GET /api/items/available
// @access  Private (Manager only)
const getAvailableItems = async (req, res) => {
  try {
    const { category } = req.query;

    let query = { 
      hallName: req.user.hallName,
      isAvailable: true 
    };

    if (category) {
      query.category = category;
    }

    const items = await Item.find(query)
      .select('name description price category maxQuantityPerOrder tags preparationTime isSpecialItem')
      .sort({ category: 1, name: 1 });

    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      items,
      groupedItems,
      categories: Object.keys(groupedItems)
    });
  } catch (error) {
    console.error('Get available items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private (Manager only)
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Manager only)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== item.name) {
      const existingItem = await Item.findOne({
        name: updateData.name.trim(),
        hallName: req.user.hallName,
        _id: { $ne: id }
      });

      if (existingItem) {
        return res.status(400).json({ message: 'Item with this name already exists' });
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'hallName' && key !== 'createdBy') {
        item[key] = updateData[key];
      }
    });

    item.lastModifiedBy = req.user.id;
    await item.save();

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Manager only)
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Item.findByIdAndDelete(id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle item availability
// @route   PUT /api/items/:id/toggle-availability
// @access  Private (Manager only)
const toggleItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await item.toggleAvailability();

    res.json({
      message: `Item ${item.isAvailable ? 'enabled' : 'disabled'} successfully`,
      item: {
        id: item._id,
        name: item.name,
        isAvailable: item.isAvailable
      }
    });
  } catch (error) {
    console.error('Toggle item availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get item categories
// @route   GET /api/items/categories
// @access  Private (Manager only)
const getItemCategories = async (req, res) => {
  try {
    const categories = await Item.distinct('category', { 
      hallName: req.user.hallName 
    });

    const categoriesWithCount = await Item.aggregate([
      { $match: { hallName: req.user.hallName } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          availableCount: {
            $sum: { $cond: ['$isAvailable', 1, 0] }
          }
        }
      }
    ]);

    res.json({
      categories,
      categoriesWithCount
    });
  } catch (error) {
    console.error('Get item categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get items statistics
// @route   GET /api/items/stats
// @access  Private (Manager only)
const getItemsStats = async (req, res) => {
  try {
    const hallName = req.user.hallName;

    const stats = await Item.aggregate([
      { $match: { hallName } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          availableItems: {
            $sum: { $cond: ['$isAvailable', 1, 0] }
          },
          avgPrice: { $avg: '$price' },
          totalOrdered: { $sum: '$totalOrdered' }
        }
      }
    ]);

    const categoryStats = await Item.aggregate([
      { $match: { hallName } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          availableCount: {
            $sum: { $cond: ['$isAvailable', 1, 0] }
          },
          avgPrice: { $avg: '$price' },
          totalOrdered: { $sum: '$totalOrdered' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const topItems = await Item.find({ hallName })
      .sort({ totalOrdered: -1 })
      .limit(10)
      .select('name totalOrdered price category');

    res.json({
      overview: stats[0] || {
        totalItems: 0,
        availableItems: 0,
        avgPrice: 0,
        totalOrdered: 0
      },
      categoryStats,
      topItems
    });
  } catch (error) {
    console.error('Get items stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk update items
// @route   PUT /api/items/bulk-update
// @access  Private (Manager only)
const bulkUpdateItems = async (req, res) => {
  try {
    const { itemIds, updateData } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'Item IDs are required' });
    }

    const result = await Item.updateMany(
      {
        _id: { $in: itemIds },
        hallName: req.user.hallName
      },
      {
        ...updateData,
        lastModifiedBy: req.user.id
      }
    );

    res.json({
      message: `${result.modifiedCount} items updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
