const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('contactNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact number must be exactly 10 digits'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('hallName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hall name must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Student validation
const validateStudent = [
  body('rollNumber')
    .trim()
    .toUpperCase()
    .matches(/^[0-9]{2}[A-Z]{2}[0-9]{5}$/)
    .withMessage('Roll number must be in format: 21CS30001'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('roomNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  
  body('phoneNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  
  body('year')
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be between 1 and 5'),
  
  handleValidationErrors
];

// Item validation
const validateItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['coupon', 'extra', 'snack', 'beverage', 'other'])
    .withMessage('Invalid category'),
  
  body('maxQuantityPerOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum quantity per order must be at least 1'),
  
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.item')
    .isMongoId()
    .withMessage('Invalid item ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  
  handleValidationErrors
];

// Complaint validation
const validateComplaint = [
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('complaintType')
    .isIn(['wrong_order', 'incorrect_billing', 'quality_issue', 'missing_item', 'other'])
    .withMessage('Invalid complaint type'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('requestedRefund')
    .isFloat({ min: 0 })
    .withMessage('Requested refund must be a positive number'),
  
  body('complaintToken')
    .notEmpty()
    .withMessage('Complaint token is required'),
  
  handleValidationErrors
];

// Hall validation
const validateHall = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hall name must be between 2 and 100 characters'),
  
  body('code')
    .trim()
    .toUpperCase()
    .isLength({ min: 2, max: 10 })
    .withMessage('Hall code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Hall code can only contain uppercase letters and numbers'),
  
  body('type')
    .isIn(['boys', 'girls', 'mixed'])
    .withMessage('Hall type must be boys, girls, or mixed'),
  
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  body('contactInfo.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  
  body('contactInfo.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Search validation
const validateSearch = [
  body('query')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateStudent,
  validateItem,
  validateOrder,
  validateComplaint,
  validateHall,
  validatePasswordChange,
  validateSearch,
  validatePagination,
  handleValidationErrors
};
