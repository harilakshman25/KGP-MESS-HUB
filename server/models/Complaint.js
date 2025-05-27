const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
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
  hallName: {
    type: String,
    required: true
  },
  complaintType: {
    type: String,
    enum: ['wrong_order', 'incorrect_billing', 'quality_issue', 'missing_item', 'other'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  orderBatchId: {
    type: String,
    required: true
  },
  orderAmount: {
    type: Number,
    required: true
  },
  requestedRefund: {
    type: Number,
    required: true,
    min: [0, 'Requested refund cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  submittedBy: {
    type: String, // This could be student or mess worker
    required: true
  },
  complaintToken: {
    type: String,
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  },
  resolution: {
    type: String,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  refundApproved: {
    type: Number,
    default: 0,
    min: [0, 'Refund approved cannot be negative']
  },
  isRefundProcessed: {
    type: Boolean,
    default: false
  },
  refundProcessedAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: {
    type: Date
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ hallName: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ orderBatchId: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual for formatted requested refund
complaintSchema.virtual('formattedRequestedRefund').get(function() {
  return `₹${this.requestedRefund.toFixed(2)}`;
});

// Virtual for complaint age in days
complaintSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to approve complaint
complaintSchema.methods.approve = function(reviewedBy, refundAmount, reviewNotes) {
  this.status = 'approved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.refundApproved = refundAmount || this.requestedRefund;
  this.reviewNotes = reviewNotes;
  return this.save();
};

// Method to reject complaint
complaintSchema.methods.reject = function(reviewedBy, reviewNotes) {
  this.status = 'rejected';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
  this.refundApproved = 0;
  return this.save();
};

// Method to process refund
complaintSchema.methods.processRefund = function() {
  this.isRefundProcessed = true;
  this.refundProcessedAt = new Date();
  this.status = 'resolved';
  return this.save();
};

// Method to escalate complaint
complaintSchema.methods.escalate = function(escalatedTo) {
  this.escalated = true;
  this.escalatedAt = new Date();
  this.escalatedTo = escalatedTo;
  this.priority = 'urgent';
  return this.save();
};

// Static method to generate complaint ID
complaintSchema.statics.generateComplaintId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `COMP_${timestamp}_${random}`.toUpperCase();
};

// Static method to find pending complaints by hall
complaintSchema.statics.findPendingByHall = function(hallName) {
  return this.find({ 
    hallName, 
    status: { $in: ['pending', 'under_review'] } 
  })
  .populate('student', 'rollNumber name roomNumber')
  .populate('order', 'batchId totalAmount orderDate')
  .sort({ priority: -1, createdAt: 1 });
};

// Static method to find complaints by status
complaintSchema.statics.findByStatus = function(status, hallName) {
  const query = { status };
  if (hallName) query.hallName = hallName;
  
  return this.find(query)
    .populate('student', 'rollNumber name roomNumber')
    .populate('order', 'batchId totalAmount orderDate')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to set priority based on amount
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.requestedRefund >= 500) {
      this.priority = 'high';
    } else if (this.requestedRefund >= 200) {
      this.priority = 'medium';
    } else {
      this.priority = 'low';
    }
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
