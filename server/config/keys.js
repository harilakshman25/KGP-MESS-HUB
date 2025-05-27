const crypto = require('crypto');

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateStudentKey = (rollNumber) => {
  const hash = crypto.createHash('sha256');
  hash.update(rollNumber + process.env.STUDENT_KEY_SALT);
  return hash.digest('hex').substring(0, 8);
};

const generateManagerMasterKey = (hallName, email) => {
  const hash = crypto.createHash('sha256');
  hash.update(hallName + email + process.env.MANAGER_KEY_SALT);
  return hash.digest('hex').substring(0, 12);
};

const generateComplaintToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashPassword = (password) => {
  return crypto.pbkdf2Sync(password, process.env.PASSWORD_SALT, 10000, 64, 'sha512').toString('hex');
};

const verifyPassword = (password, hash) => {
  const hashVerify = crypto.pbkdf2Sync(password, process.env.PASSWORD_SALT, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
};

module.exports = {
  generateSecretKey,
  generateStudentKey,
  generateManagerMasterKey,
  generateComplaintToken,
  hashPassword,
  verifyPassword
};
