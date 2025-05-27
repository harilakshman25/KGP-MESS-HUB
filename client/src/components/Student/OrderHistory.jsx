import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Package, 
  AlertTriangle,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react'
import { orderService } from '../../services/orderService'
import LoadingSpinner from '../Common/LoadingSpinner'
import Modal from '../Common/Modal'
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor } from '../../utils/helpers'

const OrderHistory = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, refetch } = useQuery(
    ['orderHistory', studentId, statusFilter, currentPage],
    () => orderService.getOrdersByStudent(studentId, {
      status: statusFilter,
      page: currentPage,
      limit: 10
    }),
    { enabled: !!studentId }
  )

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'cancelled':
        return '❌'
      case 'disputed':
        return '⚠️'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '🍽️'
      default:
        return '📋'
    }
  }

  const exportOrderHistory = () => {
    if (!data?.orders) return
    
    const csvData = data.orders.map(order => ({
      batchId: order.batchId,
      date: formatDate(order.orderDate),
      time: order.orderTime,
      items: order.items.map(item => `${item.itemName} x${item.quantity}`).join('; '),
      totalAmount: order.totalAmount,
      status: order.status,
      balanceAfter: order.balanceAfterOrder
    }))

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => 
        typeof row[header] === 'string' && row[header].includes(',') 
          ? `"${row[header]}"` 
          : row[header]
      ).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order_history_${studentId}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Order History</h1>
            <p className="text-secondary-600">
              {data?.student ? `${data.student.name} (${data.student.rollNumber})` : 'Student Orders'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportOrderHistory}
            className="btn-secondary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => refetch()}
            className="btn-primary inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-secondary-400" />
            <label className="text-sm font-medium text-secondary-700">Status:</label>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="form-input w-auto"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
          <div className="text-sm text-secondary-600">
            Total: {data?.pagination?.total || 0} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      {data?.orders?.length > 0 ? (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow cursor-pointer"
              onClick={() => handleOrderClick(order)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(order.status)}</span>
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      Order #{order.batchId}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.orderDate)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {order.orderTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-secondary-900">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <span className={`badge badge-${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-secondary-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Items Ordered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700"
                        >
                          {item.itemName} × {item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-secondary-600">
                    <div>Balance After: {formatCurrency(order.balanceAfterOrder)}</div>
                    <div>{formatRelativeTime(order.orderDate)}</div>
                  </div>
                </div>
              </div>

              {order.isDisputed && (
                <div className="mt-4 bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-warning-600 mr-2" />
                    <span className="text-sm text-warning-700">
                      This order has been disputed
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-secondary-600">
              {statusFilter 
                ? `No orders found with status "${statusFilter}".`
                : 'This student has not placed any orders yet.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-soft px-6 py-4">
          <div className="text-sm text-secondary-600">
            Showing {((currentPage - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} orders
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-secondary-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === data.pagination.pages}
              className="px-3 py-1 text-sm border border-secondary-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}

// Order Details Modal Component
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!order) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="large">
      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-900">
              Order #{order.batchId}
            </h3>
            <span className={`badge badge-${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-secondary-600">Date:</span>
              <span className="ml-2 font-medium">{formatDate(order.orderDate)}</span>
            </div>
            <div>
              <span className="text-secondary-600">Time:</span>
              <span className="ml-2 font-medium">{order.orderTime}</span>
            </div>
            <div>
              <span className="text-secondary-600">Day:</span>
              <span className="ml-2 font-medium">{order.orderDay}</span>
            </div>
            <div>
              <span className="text-secondary-600">Total Amount:</span>
              <span className="ml-2 font-medium">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <h4 className="text-lg font-medium text-secondary-900 mb-3">Items Ordered</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-secondary-900">{item.itemName}</h5>
                  <p className="text-sm text-secondary-600">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-secondary-900">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Information */}
        <div className="bg-primary-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-primary-900 mb-2">Balance Information</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Balance After Order:</span>
              <span className={`font-medium ${
                order.balanceAfterOrder >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(order.balanceAfterOrder)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h4 className="text-lg font-medium text-secondary-900 mb-2">Notes</h4>
            <p className="text-sm text-secondary-600 bg-secondary-50 rounded-lg p-3">
              {order.notes}
            </p>
          </div>
        )}

        {/* Dispute Information */}
        {order.isDisputed && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <h4 className="text-lg font-medium text-warning-800 mb-2">Dispute Information</h4>
            <div className="text-sm text-warning-700">
              <p><strong>Reason:</strong> {order.disputeReason}</p>
              <p><strong>Disputed At:</strong> {formatDate(order.disputedAt)}</p>
              {order.disputeResolvedAt && (
                <p><strong>Resolved At:</strong> {formatDate(order.disputeResolvedAt)}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default OrderHistory
