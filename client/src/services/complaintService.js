import api from '../utils/api'

export const complaintService = {
  // Create complaint
  createComplaint: async (complaintData) => {
    const response = await api.post('/complaints', complaintData)
    return response
  },

  // Get complaints
  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params })
    return response
  },

  // Get complaint by ID
  getComplaintById: async (complaintId) => {
    const response = await api.get(`/complaints/${complaintId}`)
    return response
  },

  // Update complaint status
  updateComplaintStatus: async (complaintId, statusData) => {
    const response = await api.put(`/complaints/${complaintId}/status`, statusData)
    return response
  },

  // Get complaints statistics
  getComplaintsStats: async () => {
    const response = await api.get('/complaints/stats')
    return response
  },
}
