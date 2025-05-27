import api from '../utils/api'

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard')
    return response
  },

  // Get registration requests
  getRegistrationRequests: async () => {
    const response = await api.get('/admin/registration-requests')
    return response
  },

  // Update registration request
  updateRegistrationRequest: async (id, data) => {
    const response = await api.put(`/admin/registration-requests/${id}`, data)
    return response
  },

  // Get system reports
  getSystemReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params })
    return response
  },

  // Get all managers
  getAllManagers: async () => {
    const response = await api.get('/admin/managers')
    return response
  },

  // Update manager status
  updateManagerStatus: async (id, data) => {
    const response = await api.put(`/admin/managers/${id}/status`, data)
    return response
  },

  // Create admin
  createAdmin: async (data) => {
    const response = await api.post('/admin/create-admin', data)
    return response
  }
}
