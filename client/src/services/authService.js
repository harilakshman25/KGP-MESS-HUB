import api from '../utils/api'

export const authService = {
  // Authentication
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response
  },

  getKeys: async () => {
    const response = await api.get('/auth/keys')
    return response
  },

  regenerateKeys: async () => {
    const response = await api.post('/auth/regenerate-keys')
    return response
  },
}
