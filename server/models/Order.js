const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentRollNumber: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  hallName: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  balanceAfterOrder: {
    type: Number,
    required: true,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'disputed'],
    default: 'confirmed'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  orderDay: {
    type: String,
    required: true
  },
  orderTime: {
    type: String,
    required: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  estimatedReadyTime: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String
  },
  disputedAt: {
    type: Date
  },
  disputeResolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  disputeResolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ batchId: 1 });
orderSchema.index({ student: 1, orderDate: -1 });
orderSchema.index({ studentRollNumber: 1 });
orderSchema.index({ hallName: 1, orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ isDisputed: 1 });

// Virtual for formatted total amount
orderSchema.virtual('formattedTotalAmount').get(function() {
  return `₹${this.totalAmount.toFixed(2)}`;
});

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return this.items.map(item => `${item.itemName} x${item.quantity}`).join(', ');
});

// Method to calculate estimated ready time
orderSchema.methods.calculateEstimatedReadyTime = function() {
  const totalPrepTime = this.items.reduce((total, item) => {
    return total + (item.preparationTime || 15); // Default 15 minutes
  }, 0);
  
  this.estimatedReadyTime = new Date(Date.now() + totalPrepTime * 60000);
  return this.estimatedReadyTime;
};

// Method to mark as completed
orderSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to dispute order
orderSchema.methods.disputeOrder = function(reason) {
  this.isDisputed = true;
  this.status = 'disputed';
  this.disputeReason = reason;
  this.disputedAt = new Date();
  return this.save();
};

// Method to resolve dispute
orderSchema.methods.resolveDispute = function(resolvedBy, approved = false) {
  this.disputeResolvedBy = resolvedBy;
  this.disputeResolvedAt = new Date();
  
  if (approved) {
    this.status = 'cancelled';
  } else {
    this.status = 'completed';
    this.isDisputed = false;
  }
  
  return this.save();
};

// Static method to generate batch ID
orderSchema.statics.generateBatchId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BATCH_${timestamp}_${random}`.toUpperCase();
};

// Static method to find orders by student
orderSchema.statics.findByStudent = function(studentId, limit = 50) {
  return this.find({ student: studentId })
    .populate('items.item', 'name category')
    .sort({ orderDate: -1 })
    .limit(limit);
};

// Static method to find orders by hall
orderSchema.statics.findByHall = function(hallName, startDate, endDate) {
  const query = { hallName };
  
  if (startDate || endDate) {
    query.orderDate = {};
    if (startDate) query.orderDate.$gte = new Date(startDate);
    if (endDate) query.orderDate.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('student', 'rollNumber name roomNumber')
    .populate('items.item', 'name category')
    .sort({ orderDate: -1 });
};

// Pre-save middleware to set order day and time
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const orderDate = this.orderDate || new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.orderDay = days[orderDate.getDay()];
    this.orderTime = orderDate.toLocaleTimeString('en-IN', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
