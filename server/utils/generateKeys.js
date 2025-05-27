const crypto = require('crypto');

// Generate a random secret key
const generateSecretKey = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate student-specific key based on roll number
const generateStudentKey = (rollNumber, salt = process.env.STUDENT_KEY_SALT || 'kgp_mess_student') => {
  const hash = crypto.createHash('sha256');
  hash.update(rollNumber + salt + Date.now().toString());
  return hash.digest('hex').substring(0, 8).toUpperCase();
};

// Generate manager master key
const generateManagerMasterKey = (hallName, email, salt = process.env.MANAGER_KEY_SALT || 'kgp_mess_manager') => {
  const hash = crypto.createHash('sha256');
  hash.update(hallName + email + salt);
  return hash.digest('hex').substring(0, 12).toUpperCase();
};

// Generate complaint token
const generateComplaintToken = (length = 16) => {
  return crypto.randomBytes(length).toString('hex').toUpperCase();
};

// Generate order batch ID
const generateOrderBatchId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BATCH_${timestamp}_${random}`;
};

// Generate complaint ID
const generateComplaintId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `COMP_${timestamp}_${random}`;
};

// Generate API key
const generateApiKey = (prefix = 'kgp_mess') => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${random}`;
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash password with salt
const hashPassword = (password, salt = process.env.PASSWORD_SALT || 'kgp_mess_hash') => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

// Verify password
const verifyPassword = (password, hash, salt = process.env.PASSWORD_SALT || 'kgp_mess_hash') => {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
};

// Generate QR code data for student access
const generateQRCodeData = (studentId, rollNumber, secretKey) => {
  const data = {
    studentId,
    rollNumber,
    secretKey,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

// Validate QR code data
const validateQRCodeData = (qrData, maxAge = 5 * 60 * 1000) => { // 5 minutes default
  try {
    const data = JSON.parse(Buffer.from(qrData, 'base64').toString());
    const now = Date.now();
    
    if (now - data.timestamp > maxAge) {
      return { valid: false, reason: 'QR code expired' };
    }
    
    return { valid: true, data };
  } catch (error) {
    return { valid: false, reason: 'Invalid QR code format' };
  }
};

// Generate session token
const generateSessionToken = () => {
  return crypto.randomBytes(24).toString('hex');
};

// Generate file upload token
const generateUploadToken = (userId, fileType) => {
  const data = {
    userId,
    fileType,
    timestamp: Date.now()
  };
  
  const token = crypto.createHash('sha256')
    .update(JSON.stringify(data) + process.env.UPLOAD_SECRET)
    .digest('hex');
    
  return token;
};

module.exports = {
  generateSecretKey,
  generateStudentKey,
  generateManagerMasterKey,
  generateComplaintToken,
  generateOrderBatchId,
  generateComplaintId,
  generateApiKey,
  generateResetToken,
  hashPassword,
  verifyPassword,
  generateQRCodeData,
  validateQRCodeData,
  generateSessionToken,
  generateUploadToken
};
