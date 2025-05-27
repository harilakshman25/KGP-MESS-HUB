// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return emailRegex.test(email)
}

// Phone number validation (10 digits)
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone)
}

// Roll number validation (format: 21CS30001)
export const validateRollNumber = (rollNumber) => {
  const rollRegex = /^[0-9]{2}[A-Z]{2}[0-9]{5}$/
  return rollRegex.test(rollNumber.toUpperCase())
}

// Password validation
export const validatePassword = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers
    }
  }
}

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/
  return nameRegex.test(name.trim())
}

// Hall name validation
export const validateHallName = (hallName) => {
  return hallName.trim().length >= 2 && hallName.trim().length <= 100
}

// Room number validation
export const validateRoomNumber = (roomNumber) => {
  return roomNumber.trim().length >= 1 && roomNumber.trim().length <= 20
}

// Price validation
export const validatePrice = (price) => {
  const numPrice = parseFloat(price)
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 10000
}

// Quantity validation
export const validateQuantity = (quantity, maxQuantity = 100) => {
  const numQuantity = parseInt(quantity)
  return !isNaN(numQuantity) && numQuantity >= 1 && numQuantity <= maxQuantity
}

// File validation
export const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const errors = []
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push('Invalid file type')
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${formatFileSize(maxSize)}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// CSV validation
export const validateCSVHeaders = (headers, requiredHeaders) => {
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  }
}

// Form validation helper
export const createValidator = (rules) => {
  return (data) => {
    const errors = {}
    let isValid = true
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field]
      const value = data[field]
      
      fieldRules.forEach(rule => {
        if (rule.required && (!value || value.toString().trim() === '')) {
          errors[field] = rule.message || `${field} is required`
          isValid = false
        } else if (value && rule.validator && !rule.validator(value)) {
          errors[field] = rule.message || `${field} is invalid`
          isValid = false
        }
      })
    })
    
    return { isValid, errors }
  }
}

// Common validation rules
export const validationRules = {
  email: [
    { required: true, message: 'Email is required' },
    { validator: validateEmail, message: 'Please enter a valid email address' }
  ],
  phone: [
    { required: true, message: 'Phone number is required' },
    { validator: validatePhone, message: 'Phone number must be 10 digits' }
  ],
  rollNumber: [
    { required: true, message: 'Roll number is required' },
    { validator: validateRollNumber, message: 'Invalid roll number format (e.g., 21CS30001)' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { 
      validator: (password) => validatePassword(password).isValid, 
      message: 'Password must be at least 6 characters with uppercase, lowercase, and number' 
    }
  ],
  name: [
    { required: true, message: 'Name is required' },
    { validator: validateName, message: 'Name must be 2-50 characters, letters only' }
  ],
  hallName: [
    { required: true, message: 'Hall name is required' },
    { validator: validateHallName, message: 'Hall name must be 2-100 characters' }
  ],
  roomNumber: [
    { required: true, message: 'Room number is required' },
    { validator: validateRoomNumber, message: 'Room number must be 1-20 characters' }
  ],
  price: [
    { required: true, message: 'Price is required' },
    { validator: validatePrice, message: 'Price must be between ₹0 and ₹10,000' }
  ]
}

// Sanitization helpers
export const sanitizeString = (str) => {
  if (!str) return ''
  return str.toString().trim().replace(/[<>]/g, '')
}

export const sanitizeNumber = (num) => {
  const parsed = parseFloat(num)
  return isNaN(parsed) ? 0 : parsed
}

export const sanitizeInteger = (num) => {
  const parsed = parseInt(num)
  return isNaN(parsed) ? 0 : parsed
}

// Format helpers for validation messages
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default {
  validateEmail,
  validatePhone,
  validateRollNumber,
  validatePassword,
  validateName,
  validateHallName,
  validateRoomNumber,
  validatePrice,
  validateQuantity,
  validateFile,
  validateCSVHeaders,
  createValidator,
  validationRules,
  sanitizeString,
  sanitizeNumber,
  sanitizeInteger
}
