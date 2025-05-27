const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{2}[0-9]{5}$/, 'Please enter a valid roll number format (e.g., 21CS30001)']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  hallName: {
    type: String,
    required: [true, 'Hall name is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Year must be at least 1'],
    max: [5, 'Year cannot exceed 5']
  },
  balance: {
    type: Number,
    default: 2000,
    set: function(value) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
  },
  secretKey: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastAccessed: {
    type: Date
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  }
}, {
  timestamps: true
});

// Indexes
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ hallName: 1 });
studentSchema.index({ roomNumber: 1 });
studentSchema.index({ year: 1 });
studentSchema.index({ registeredBy: 1 });
studentSchema.index({ name: 'text', rollNumber: 'text' });

// Virtual for department
studentSchema.virtual('department').get(function() {
  if (this.rollNumber && this.rollNumber.length >= 4) {
    return this.rollNumber.substring(2, 4);
  }
  return null;
});

// Virtual for batch year
studentSchema.virtual('batchYear').get(function() {
  if (this.rollNumber && this.rollNumber.length >= 2) {
    const yearCode = parseInt(this.rollNumber.substring(0, 2));
    return 2000 + yearCode;
  }
  return null;
});

// Method to update balance
studentSchema.methods.updateBalance = function(amount, operation = 'deduct') {
  if (operation === 'deduct') {
    this.balance -= amount;
    this.totalSpent += amount;
  } else if (operation === 'add') {
    this.balance += amount;
  }
  return this.save();
};

// Method to check if student can afford purchase
studentSchema.methods.canAfford = function(amount, allowNegative = true) {
  if (allowNegative) return true;
  return this.balance >= amount;
};

// Static method to find students by hall
studentSchema.statics.findByHall = function(hallName) {
  return this.find({ hallName, isActive: true }).sort({ rollNumber: 1 });
};

// Static method to search students
studentSchema.statics.searchStudents = function(query, hallName) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    hallName,
    isActive: true,
    $or: [
      { rollNumber: searchRegex },
      { name: searchRegex },
      { roomNumber: searchRegex }
    ]
  }).sort({ rollNumber: 1 });
};

module.exports = mongoose.model('Student', studentSchema);
