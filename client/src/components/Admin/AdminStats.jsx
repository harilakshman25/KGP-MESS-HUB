import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../Common/LoadingSpinner'
import { formatCurrency } from '../../utils/helpers'

const AdminStats = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedHall, setSelectedHall] = useState('')

  const { data: reports, isLoading } = useQuery(
    ['systemReports', dateRange, selectedHall],
    () => adminService.getSystemReports({
      ...dateRange,
      hallName: selectedHall
    })
  )

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const exportReport = () => {
    if (!reports) return
    
    const csvData = reports.ordersReport.map(hall => ({
      hallName: hall._id,
      totalOrders: hall.totalOrders,
      totalRevenue: hall.totalRevenue,
      avgOrderValue: hall.avgOrderValue,
      uniqueStudents: hall.uniqueStudentCount
    }))

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">System Statistics</h1>
          <p className="text-secondary-600">
            Comprehensive analytics and reports across all halls
          </p>
        </div>
        <button
          onClick={exportReport}
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Hall Filter</label>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="form-input"
            >
              <option value="">All Halls</option>
              {reports?.ordersReport?.map(hall => (
                <option key={hall._id} value={hall._id}>{hall._id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {reports?.ordersReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Halls</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {reports.ordersReport.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <ShoppingBag className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {reports.ordersReport.reduce((sum, hall) => sum + hall.totalOrders, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100">
                <DollarSign className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {formatCurrency(reports.ordersReport.reduce((sum, hall) => sum + hall.totalRevenue, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-danger-100">
                <TrendingUp className="h-6 w-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Avg Order Value</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {formatCurrency(
                    reports.ordersReport.reduce((sum, hall) => sum + hall.avgOrderValue, 0) / 
                    reports.ordersReport.length || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Hall */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Revenue by Hall</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports?.ordersReport || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="totalRevenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Distribution */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Orders Distribution</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reports?.ordersReport || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalOrders"
                >
                  {reports?.ordersReport?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      {reports?.itemsReport && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Most Popular Items</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reports.itemsReport.slice(0, 8).map((item, index) => (
                <div key={item._id} className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-secondary-900">{item._id}</h4>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-secondary-600">
                    <div>Quantity: {item.totalQuantity}</div>
                    <div>Revenue: {formatCurrency(item.totalRevenue)}</div>
                    <div>Orders: {item.orderCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complaints Overview */}
      {reports?.complaintsReport && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Complaints Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reports.complaintsReport.map((complaint) => (
                <div key={`${complaint._id.hallName}-${complaint._id.status}`} className="text-center p-4 bg-secondary-50 rounded-lg">
                  <h4 className="font-medium text-secondary-900">{complaint._id.hallName}</h4>
                  <p className="text-sm text-secondary-600 capitalize">{complaint._id.status}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>Count: {complaint.count}</div>
                    <div>Requested: {formatCurrency(complaint.totalRefundRequested)}</div>
                    <div>Approved: {formatCurrency(complaint.totalRefundApproved)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminStats
