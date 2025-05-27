import React from 'react'
import { useQuery } from 'react-query'
import { 
  Users, 
  Building, 
  ShoppingBag, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../Common/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

const AdminDashboard = () => {
  const { data: dashboardStats, isLoading } = useQuery(
    'adminDashboard',
    adminService.getDashboardStats
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Managers',
      value: dashboardStats?.overview?.totalManagers || 0,
      icon: Users,
      color: 'primary',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Pending Requests',
      value: dashboardStats?.overview?.pendingRequests || 0,
      icon: Clock,
      color: 'warning',
      change: '+2',
      changeType: 'neutral'
    },
    {
      name: 'Total Students',
      value: dashboardStats?.overview?.totalStudents || 0,
      icon: Building,
      color: 'success',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(dashboardStats?.overview?.totalRevenue || 0),
      icon: DollarSign,
      color: 'danger',
      change: '+18%',
      changeType: 'positive'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600">
          System overview and management statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-soft p-6 card-hover">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-success-600' : 
                      stat.changeType === 'negative' ? 'text-danger-600' : 'text-secondary-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registration Requests */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Registration Requests</h3>
          </div>
          <div className="p-6">
            {dashboardStats?.recentRequests?.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.recentRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{request.name}</p>
                      <p className="text-xs text-secondary-500">{request.hallName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary-500">
                        {formatDate(request.createdAt)}
                      </p>
                      <span className="badge badge-warning">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 text-center py-4">No pending requests</p>
            )}
          </div>
        </div>

        {/* Hall Performance */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Top Performing Halls</h3>
          </div>
          <div className="p-6">
            {dashboardStats?.ordersByHall?.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.ordersByHall.slice(0, 5).map((hall, index) => (
                  <div key={hall._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-secondary-100 text-secondary-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-900">{hall._id}</p>
                        <p className="text-xs text-secondary-500">{hall.totalOrders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-secondary-900">
                        {formatCurrency(hall.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      {dashboardStats?.monthlyTrends && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Monthly Trends</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardStats.monthlyTrends.slice(0, 3).map((month) => (
                <div key={`${month._id.year}-${month._id.month}`} className="text-center">
                  <h4 className="text-lg font-semibold text-secondary-900">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-secondary-600">
                      Orders: <span className="font-medium">{month.totalOrders}</span>
                    </p>
                    <p className="text-sm text-secondary-600">
                      Revenue: <span className="font-medium">{formatCurrency(month.totalRevenue)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">System Health</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <h4 className="font-medium text-secondary-900">System Status</h4>
              <p className="text-sm text-success-600">All systems operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Performance</h4>
              <p className="text-sm text-primary-600">Excellent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-warning-600" />
              </div>
              <h4 className="font-medium text-secondary-900">Alerts</h4>
              <p className="text-sm text-warning-600">
                {dashboardStats?.overview?.pendingComplaints || 0} pending complaints
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
