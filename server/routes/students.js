const express = require('express');
const router = express.Router();
const {
  uploadStudentsCSV,
  getStudents,
  searchStudentsForAccess,
  accessStudentProfile,
  updateStudentBalance,
  getStudentById,
  updateStudent,
  deactivateStudent,
  resetStudentKey,
  getStudentsStats
} = require('../controllers/studentController');
const { managerAuth, secretKeyAuth } = require('../middleware/auth');
const { uploadCSV, handleUploadError } = require('../middleware/upload');
const { validateStudent, validateSearch } = require('../middleware/validation');

// @route   POST /api/students/upload-csv
// @desc    Upload students CSV
// @access  Private (Manager only)
router.post('/upload-csv', managerAuth, uploadCSV, handleUploadError, uploadStudentsCSV);

// @route   GET /api/students
// @desc    Get all students for a hall
// @access  Private (Manager only)
router.get('/', managerAuth, getStudents);

// @route   POST /api/students/search
// @desc    Search students for access
// @access  Private (Manager only)
router.post('/search', managerAuth, searchStudentsForAccess);

// @route   POST /api/students/:id/access
// @desc    Access student profile
// @access  Private (Manager only)
router.post('/:id/access', managerAuth, accessStudentProfile);

// @route   GET /api/students/stats
// @desc    Get students statistics
// @access  Private (Manager only)
router.get('/stats', managerAuth, getStudentsStats);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Manager only)
router.get('/:id', managerAuth, getStudentById);

// @route   PUT /api/students/:id
// @desc    Update student information
// @access  Private (Manager only)
router.put('/:id', managerAuth, validateStudent, updateStudent);

// @route   PUT /api/students/:id/balance
// @desc    Update student balance
// @access  Private (Manager only)
router.put('/:id/balance', managerAuth, updateStudentBalance);

// @route   DELETE /api/students/:id
// @desc    Deactivate student
// @access  Private (Manager only)
router.delete('/:id', managerAuth, deactivateStudent);

// @route   POST /api/students/:id/reset-key
// @desc    Reset student key
// @access  Private (Manager only)
router.post('/:id/reset-key', managerAuth, resetStudentKey);

module.exports = router;
