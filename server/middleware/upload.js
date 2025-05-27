const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for CSV files
const csvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(uploadDir, 'csv');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `students-${uniqueSuffix}.csv`);
  }
});

// Storage configuration for complaint attachments
const complaintStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(uploadDir, 'complaints');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  }
});

// File filter for CSV files
const csvFileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || 
      file.mimetype === 'application/vnd.ms-excel' ||
      path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// File filter for complaint attachments
const complaintFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// CSV upload middleware
const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
}).single('csvFile');

// Complaint attachment upload middleware
const uploadComplaintAttachment = multer({
  storage: complaintStorage,
  fileFilter: complaintFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5
  }
}).array('attachments', 5);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field' });
    }
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};

// Cleanup old files function
const cleanupOldFiles = (directory, maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const dir = path.join(uploadDir, directory);
  
  if (!fs.existsSync(dir)) return;
  
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        
        const now = Date.now();
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            } else {
              console.log(`Deleted old file: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Schedule cleanup every 24 hours
setInterval(() => {
  cleanupOldFiles('csv');
  cleanupOldFiles('complaints', 30 * 24 * 60 * 60 * 1000); // Keep complaint files for 30 days
}, 24 * 60 * 60 * 1000);

module.exports = {
  uploadCSV,
  uploadComplaintAttachment,
  handleUploadError,
  cleanupOldFiles
};
