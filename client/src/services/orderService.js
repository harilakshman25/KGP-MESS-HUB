import api from '../utils/api'

export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response
  },

  // Get orders
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params })
    return response
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response
  },

  // Get orders by student
  getOrdersByStudent: async (studentId, params = {}) => {
    const response = await api.get(`/orders/student/${studentId}`, { params })
    return response
  },

  // Update order status
  updateOrderStatus: async (orderId, statusData) => {
    const response = await api.put(`/orders/${orderId}/status`, statusData)
    return response
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.delete(`/orders/${orderId}`, { data: { reason } })
    return response
  },

  // Get order statistics
  getOrderStats: async (params = {}) => {
    const response = await api.get('/orders/stats', { params })
    return response
  },
}
