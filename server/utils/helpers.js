const moment = require('moment');

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

// Format date and time
const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  return moment(date).format(format);
};

// Get relative time
const getRelativeTime = (date) => {
  return moment(date).fromNow();
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Validate roll number
const isValidRollNumber = (rollNumber) => {
  const rollRegex = /^[0-9]{2}[A-Z]{2}[0-9]{5}$/;
  return rollRegex.test(rollNumber);
};

// Sanitize string
const sanitizeString = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/[<>]/g, '');
};

// Generate pagination metadata
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    current: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: totalPages,
    hasNext,
    hasPrev,
    next: hasNext ? page + 1 : null,
    prev: hasPrev ? page - 1 : null
  };
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined/null values from object
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Group array by key
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Sort array by multiple keys
const sortBy = (array, ...keys) => {
  return array.sort((a, b) => {
    for (let key of keys) {
      let direction = 1;
      if (key.startsWith('-')) {
        direction = -1;
        key = key.slice(1);
      }
      
      if (a[key] < b[key]) return -1 * direction;
      if (a[key] > b[key]) return 1 * direction;
    }
    return 0;
  });
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Calculate order statistics
const calculateOrderStats = (orders) => {
  const stats = {
    total: orders.length,
    totalAmount: 0,
    averageAmount: 0,
    statusCounts: {},
    dailyStats: {}
  };

  orders.forEach(order => {
    stats.totalAmount += order.totalAmount;
    
    // Count by status
    stats.statusCounts[order.status] = (stats.statusCounts[order.status] || 0) + 1;
    
    // Daily stats
    const date = formatDate(order.orderDate);
    if (!stats.dailyStats[date]) {
      stats.dailyStats[date] = { count: 0, amount: 0 };
    }
    stats.dailyStats[date].count++;
    stats.dailyStats[date].amount += order.totalAmount;
  });

  stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;
  
  return stats;
};

// Validate file type
const isValidFileType = (filename, allowedTypes) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// Get file size in human readable format
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate CSV content
const generateCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Parse CSV content
const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    return obj;
  }).filter(obj => Object.values(obj).some(value => value));
};

// Error response helper
const errorResponse = (res, statusCode, message, details = null) => {
  const response = { message };
  if (details) response.details = details;
  return res.status(statusCode).json(response);
};

// Success response helper
const successResponse = (res, data, message = 'Success') => {
  return res.json({ message, ...data });
};

module.exports = {
  formatCurrency,
  formatDate,
  formatDateTime,
  getRelativeTime,
  isValidEmail,
  isValidPhone,
  isValidRollNumber,
  sanitizeString,
  getPaginationMeta,
  calculatePercentage,
  generateRandomString,
  deepClone,
  cleanObject,
  groupBy,
  sortBy,
  debounce,
  throttle,
  calculateOrderStats,
  isValidFileType,
  formatFileSize,
  generateCSV,
  parseCSV,
  errorResponse,
  successResponse
};
