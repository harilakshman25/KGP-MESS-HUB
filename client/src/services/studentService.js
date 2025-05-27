import api from '../utils/api'

export const studentService = {
  // CSV Upload
  uploadCSV: async (file) => {
    const formData = new FormData()
    formData.append('csvFile', file)
    
    const response = await api.post('/students/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Get students
  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params })
    return response
  },

  // Search students for access
  searchStudentsForAccess: async (query, secretKey) => {
    const response = await api.post('/students/search', { query, secretKey })
    return response
  },

  // Access student profile
  accessStudentProfile: async (studentId, accessData) => {
    const response = await api.post(`/students/${studentId}/access`, accessData)
    return response
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`)
    return response
  },

  // Update student
  updateStudent: async (studentId, updateData) => {
    const response = await api.put(`/students/${studentId}`, updateData)
    return response
  },

  // Update student balance
  updateStudentBalance: async (studentId, balanceData) => {
    const response = await api.put(`/students/${studentId}/balance`, balanceData)
    return response
  },

  // Deactivate student
  deactivateStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`)
    return response
  },

  // Reset student key
  resetStudentKey: async (studentId) => {
    const response = await api.post(`/students/${studentId}/reset-key`)
    return response
  },

  // Get students statistics
  getStudentsStats: async () => {
    const response = await api.get('/students/stats')
    return response
  },
}
