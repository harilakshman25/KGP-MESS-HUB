const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    set: function(value) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['coupon', 'extra', 'snack', 'beverage', 'other'],
    default: 'other'
  },
  hallName: {
    type: String,
    required: [true, 'Hall name is required'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maxQuantityPerOrder: {
    type: Number,
    default: 10,
    min: [1, 'Maximum quantity must be at least 1']
  },
  totalOrdered: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  preparationTime: {
    type: Number, // in minutes
    default: 0
  },
  isSpecialItem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
itemSchema.index({ hallName: 1, isAvailable: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ createdBy: 1 });
itemSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for formatted price
itemSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

// Method to update total ordered count
itemSchema.methods.incrementOrderCount = function(quantity = 1) {
  this.totalOrdered += quantity;
  return this.save();
};

// Method to toggle availability
itemSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

// Static method to find available items by hall
itemSchema.statics.findAvailableByHall = function(hallName) {
  return this.find({ 
    hallName, 
    isAvailable: true 
  }).sort({ category: 1, name: 1 });
};

// Static method to find items by category
itemSchema.statics.findByCategory = function(hallName, category) {
  return this.find({ 
    hallName, 
    category, 
    isAvailable: true 
  }).sort({ name: 1 });
};

// Static method to search items
itemSchema.statics.searchItems = function(query, hallName) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    hallName,
    isAvailable: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } }
    ]
  }).sort({ name: 1 });
};

// Pre-save middleware
itemSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
