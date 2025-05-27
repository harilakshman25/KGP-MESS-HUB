export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
}

export const COMPLAINT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
}

export const ITEM_CATEGORIES = {
  COUPON: 'coupon',
  EXTRA: 'extra',
  SNACK: 'snack',
  BEVERAGE: 'beverage',
  OTHER: 'other',
}

export const COMPLAINT_TYPES = {
  WRONG_ORDER: 'wrong_order',
  INCORRECT_BILLING: 'incorrect_billing',
  QUALITY_ISSUE: 'quality_issue',
  MISSING_ITEM: 'missing_item',
  OTHER: 'other',
}

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

export const HALL_TYPES = {
  BOYS: 'boys',
  GIRLS: 'girls',
  MIXED: 'mixed',
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
}

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  ROLL_NUMBER_PATTERN: /^[0-9]{2}[A-Z]{2}[0-9]{5}$/,
  PHONE_PATTERN: /^[0-9]{10}$/,
  EMAIL_PATTERN: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
}

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_CSV_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
}

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  CART: 'cart',
  THEME: 'theme',
  USER_PREFERENCES: 'userPreferences',
}

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  REGISTRATION_REQUESTS: '/admin/registration-requests',
  MANAGERS: '/admin/managers',
  
  // Students
  STUDENTS: '/students',
  UPLOAD_CSV: '/students/upload-csv',
  STUDENT_ACCESS: '/students/search',
  
  // Items
  ITEMS: '/items',
  AVAILABLE_ITEMS: '/items/available',
  
  // Orders
  ORDERS: '/orders',
  ORDER_STATS: '/orders/stats',
  
  // Complaints
  COMPLAINTS: '/complaints',
}

export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTRATION_SUCCESS: 'Registration successful! Please wait for admin approval.',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ITEM_ADDED_TO_CART: 'Item added to cart',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart',
  CART_CLEARED: 'Cart cleared',
  ORDER_PLACED: 'Order placed successfully',
  COMPLAINT_SUBMITTED: 'Complaint submitted successfully',
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size is too large.',
  INVALID_FILE_TYPE: 'Invalid file type.',
}

export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Data saved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
  EMAIL_SENT: 'Email sent successfully',
  FILE_UPLOADED: 'File uploaded successfully',
}

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  SECONDARY: '#64748b',
}

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
}
