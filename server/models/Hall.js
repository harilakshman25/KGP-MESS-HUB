const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hall name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Hall name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Hall code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Hall code cannot exceed 10 characters']
  },
  type: {
    type: String,
    enum: ['boys', 'girls', 'mixed'],
    required: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: [0, 'Current occupancy cannot be negative']
  },
  messManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
    trim: true
  },
  facilities: [{
    type: String,
    trim: true
  }],
  messTimings: {
    breakfast: {
      start: String,
      end: String
    },
    lunch: {
      start: String,
      end: String
    },
    snacks: {
      start: String,
      end: String
    },
    dinner: {
      start: String,
      end: String
    }
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  establishedYear: {
    type: Number,
    min: [1950, 'Established year cannot be before 1950'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  warden: {
    name: String,
    phone: String,
    email: String
  },
  messRules: [{
    rule: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  specialFeatures: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes
hallSchema.index({ name: 1 });
hallSchema.index({ code: 1 });
hallSchema.index({ type: 1 });
hallSchema.index({ isActive: 1 });

// Virtual for occupancy percentage
hallSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity === 0) return 0;
  return Math.round((this.currentOccupancy / this.capacity) * 100);
});

// Virtual for available capacity
hallSchema.virtual('availableCapacity').get(function() {
  return Math.max(0, this.capacity - this.currentOccupancy);
});

// Method to update occupancy
hallSchema.methods.updateOccupancy = function(change) {
  this.currentOccupancy = Math.max(0, this.currentOccupancy + change);
  return this.save();
};

// Method to check if hall is full
hallSchema.methods.isFull = function() {
  return this.currentOccupancy >= this.capacity;
};

// Static method to find active halls
hallSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find halls by type
hallSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true }).sort({ name: 1 });
};

// Static method to get hall statistics
hallSchema.statics.getStatistics = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalHalls: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        totalOccupancy: { $sum: '$currentOccupancy' },
        avgOccupancy: { $avg: '$currentOccupancy' },
        boysHalls: {
          $sum: { $cond: [{ $eq: ['$type', 'boys'] }, 1, 0] }
        },
        girlsHalls: {
          $sum: { $cond: [{ $eq: ['$type', 'girls'] }, 1, 0] }
        },
        mixedHalls: {
          $sum: { $cond: [{ $eq: ['$type', 'mixed'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Hall', hallSchema);
