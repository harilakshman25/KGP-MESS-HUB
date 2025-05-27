const fs = require('fs');
const csv = require('csv-parser');

const parseStudentsCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const students = [];
    const errors = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          // Validate and clean data
          const student = {
            rollNumber: data.rollNumber?.toString().trim().toUpperCase(),
            name: data.name?.toString().trim(),
            roomNumber: data.roomNumber?.toString().trim(),
            phoneNumber: data.phoneNumber?.toString().trim()
          };

          // Basic validation
          if (!student.rollNumber || !student.name || !student.roomNumber || !student.phoneNumber) {
            errors.push({
              row: students.length + errors.length + 1,
              error: 'Missing required fields',
              data: student
            });
            return;
          }

          // Validate roll number format
          if (!/^[0-9]{2}[A-Z]{2}[0-9]{5}$/.test(student.rollNumber)) {
            errors.push({
              row: students.length + errors.length + 1,
              error: 'Invalid roll number format',
              data: student
            });
            return;
          }

          // Validate phone number
          if (!/^[0-9]{10}$/.test(student.phoneNumber)) {
            errors.push({
              row: students.length + errors.length + 1,
              error: 'Invalid phone number format',
              data: student
            });
            return;
          }

          students.push(student);
        } catch (error) {
          errors.push({
            row: students.length + errors.length + 1,
            error: error.message,
            data
          });
        }
      })
      .on('end', () => {
        // Clean up the uploaded file
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });

        resolve({ students, errors });
      })
      .on('error', (error) => {
        // Clean up the uploaded file
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });

        reject(error);
      });
  });
};

const validateCSVHeaders = (headers) => {
  const requiredHeaders = ['rollNumber', 'name', 'roomNumber', 'phoneNumber'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};

const generateSampleCSV = () => {
  const sampleData = [
    ['rollNumber', 'name', 'roomNumber', 'phoneNumber'],
    ['21CS30001', 'John Doe', 'A101', '9876543210'],
    ['21ME30002', 'Jane Smith', 'B205', '9876543211'],
    ['21EE30003', 'Bob Johnson', 'C301', '9876543212'],
    ['21CE30004', 'Alice Brown', 'D102', '9876543213'],
    ['21CH30005', 'Charlie Wilson', 'E203', '9876543214']
  ];

  return sampleData.map(row => row.join(',')).join('\n');
};

module.exports = {
  parseStudentsCSV,
  validateCSVHeaders,
  generateSampleCSV
};
