import api from '../utils/api'

export const itemService = {
  // Create item
  createItem: async (itemData) => {
    const response = await api.post('/items', itemData)
    return response
  },

  // Get items
  getItems: async (params = {}) => {
    const response = await api.get('/items', { params })
    return response
  },

  // Get available items
  getAvailableItems: async (category) => {
    const params = category ? { category } : {}
    const response = await api.get('/items/available', { params })
    return response
  },

  // Get item by ID
  getItemById: async (itemId) => {
    const response = await api.get(`/items/${itemId}`)
    return response
  },

  // Update item
  updateItem: async (itemId, updateData) => {
    const response = await api.put(`/items/${itemId}`, updateData)
    return response
  },

  // Delete item
  deleteItem: async (itemId) => {
    const response = await api.delete(`/items/${itemId}`)
    return response
  },

  // Toggle item availability
  toggleItemAvailability: async (itemId) => {
    const response = await api.put(`/items/${itemId}/toggle-availability`)
    return response
  },

  // Get item categories
  getItemCategories: async () => {
    const response = await api.get('/items/categories')
    return response
  },

  // Get items statistics
  getItemsStats: async () => {
    const response = await api.get('/items/stats')
    return response
  },

  // Bulk update items
  bulkUpdateItems: async (itemIds, updateData) => {
    const response = await api.put('/items/bulk-update', { itemIds, updateData })
    return response
  },
}
