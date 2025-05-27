const Student = require('../models/Student');
const User = require('../models/User');
const { generateStudentKey } = require('../config/keys');
const csvParser = require('../utils/csvParser');

// @desc    Upload students CSV
// @route   POST /api/students/upload-csv
// @access  Private (Manager only)
const uploadStudentsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const students = await csvParser.parseStudentsCSV(req.file.path);
    const results = {
      successful: [],
      failed: [],
      duplicates: []
    };

    for (const studentData of students) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ 
          rollNumber: studentData.rollNumber 
        });

        if (existingStudent) {
          results.duplicates.push({
            rollNumber: studentData.rollNumber,
            reason: 'Student already exists'
          });
          continue;
        }

        // Generate student secret key
        const secretKey = generateStudentKey(studentData.rollNumber);

        // Extract year from roll number
        const year = parseInt(studentData.rollNumber.substring(0, 2)) > 50 
          ? 2000 + parseInt(studentData.rollNumber.substring(0, 2)) - 2000 + 1
          : 2000 + parseInt(studentData.rollNumber.substring(0, 2)) + 1;

        const currentYear = new Date().getFullYear();
        const studentYear = Math.min(5, Math.max(1, currentYear - year + 1));

        const student = await Student.create({
          rollNumber: studentData.rollNumber,
          name: studentData.name,
          roomNumber: studentData.roomNumber,
          phoneNumber: studentData.phoneNumber,
          hallName: req.user.hallName,
          year: studentYear,
          secretKey,
          registeredBy: req.user.id
        });

        results.successful.push({
          rollNumber: student.rollNumber,
          name: student.name,
          roomNumber: student.roomNumber
        });

      } catch (error) {
        results.failed.push({
          rollNumber: studentData.rollNumber,
          reason: error.message
        });
      }
    }

    res.json({
      message: 'CSV processing completed',
      results,
      summary: {
        total: students.length,
        successful: results.successful.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length
      }
    });

  } catch (error) {
    console.error('Upload students CSV error:', error);
    res.status(500).json({ message: 'Server error during CSV processing' });
  }
};

// @desc    Get all students for a hall
// @route   GET /api/students
// @access  Private (Manager only)
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, year } = req.query;
    const skip = (page - 1) * limit;

    let query = { 
      hallName: req.user.hallName,
      isActive: true 
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { rollNumber: searchRegex },
        { name: searchRegex },
        { roomNumber: searchRegex }
      ];
    }

    if (year) {
      query.year = parseInt(year);
    }

    const students = await Student.find(query)
      .select('-secretKey')
      .sort({ rollNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({
      students,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search students for access
// @route   POST /api/students/search
// @access  Private (Manager only)
const searchStudentsForAccess = async (req, res) => {
  try {
    const { query, secretKey } = req.body;

    // Verify secret key
    if (secretKey !== req.user.secretAccessKey) {
      return res.status(403).json({ message: 'Invalid secret key' });
    }

    const searchRegex = new RegExp(query, 'i');
    const students = await Student.find({
      hallName: req.user.hallName,
      isActive: true,
      $or: [
        { rollNumber: searchRegex },
        { name: searchRegex },
        { roomNumber: searchRegex },
        { year: isNaN(query) ? undefined : parseInt(query) }
      ].filter(Boolean)
    })
    .select('rollNumber name roomNumber year balance')
    .sort({ rollNumber: 1 })
    .limit(20);

    res.json(students);
  } catch (error) {
    console.error('Search students for access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Access student profile
// @route   POST /api/students/:id/access
// @access  Private (Manager only)
const accessStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentKey, masterKey } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if using master key or student key
    const isValidMasterKey = masterKey && masterKey === req.user.masterKey;
    const isValidStudentKey = studentKey && studentKey === student.secretKey;

    if (!isValidMasterKey && !isValidStudentKey) {
      return res.status(403).json({ message: 'Invalid access key' });
    }

    // Update last accessed
    student.lastAccessed = new Date();
    await student.save();

    res.json({
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        roomNumber: student.roomNumber,
        phoneNumber: student.phoneNumber,
        year: student.year,
        balance: student.balance,
        totalOrders: student.totalOrders,
        totalSpent: student.totalSpent,
        lastAccessed: student.lastAccessed
      },
      accessType: isValidMasterKey ? 'master' : 'student'
    });
  } catch (error) {
    console.error('Access student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student balance
// @route   PUT /api/students/:id/balance
// @access  Private (Manager only)
const updateStudentBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, operation, reason } = req.body; // operation: 'add' or 'deduct'

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldBalance = student.balance;
    await student.updateBalance(amount, operation);

    res.json({
      message: `Balance ${operation}ed successfully`,
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        oldBalance,
        newBalance: student.balance,
        operation,
        amount,
        reason
      }
    });
  } catch (error) {
    console.error('Update student balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Manager only)
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .select('-secretKey')
      .populate('registeredBy', 'name');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student information
// @route   PUT /api/students/:id
// @access  Private (Manager only)
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roomNumber, phoneNumber, year } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (name) student.name = name;
    if (roomNumber) student.roomNumber = roomNumber;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (year) student.year = year;

    await student.save();

    res.json({
      message: 'Student updated successfully',
      student: {
        id: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        roomNumber: student.roomNumber,
        phoneNumber: student.phoneNumber,
        year: student.year
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate student
// @route   DELETE /api/students/:id
// @access  Private (Manager only)
const deactivateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    student.isActive = false;
    await student.save();

    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    console.error('Deactivate student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset student key
// @route   POST /api/students/:id/reset-key
// @access  Private (Manager only)
const resetStudentKey = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.hallName !== req.user.hallName) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate new secret key
    student.secretKey = generateStudentKey(student.rollNumber + Date.now());
    await student.save();

    res.json({
      message: 'Student key reset successfully',
      newKey: student.secretKey
    });
  } catch (error) {
    console.error('Reset student key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get students statistics
// @route   GET /api/students/stats
// @access  Private (Manager only)
const getStudentsStats = async (req, res) => {
  try {
    const hallName = req.user.hallName;

    const stats = await Student.aggregate([
      { $match: { hallName, isActive: true } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' },
          totalSpent: { $sum: '$totalSpent' },
          totalOrders: { $sum: '$totalOrders' }
        }
      }
    ]);

    const yearWiseStats = await Student.aggregate([
      { $match: { hallName, isActive: true } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 },
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const balanceDistribution = await Student.aggregate([
      { $match: { hallName, isActive: true } },
      {
        $bucket: {
          groupBy: '$balance',
          boundaries: [-1000, 0, 500, 1000, 2000, 5000],
          default: '5000+',
          output: {
            count: { $sum: 1 },
            students: { $push: { rollNumber: '$rollNumber', name: '$name', balance: '$balance' } }
          }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalStudents: 0,
        totalBalance: 0,
        avgBalance: 0,
        totalSpent: 0,
        totalOrders: 0
      },
      yearWiseStats,
      balanceDistribution
    });
  } catch (error) {
    console.error('Get students stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
