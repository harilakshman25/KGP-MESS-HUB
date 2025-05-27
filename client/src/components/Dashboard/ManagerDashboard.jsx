import React from 'react'
import { useQuery } from 'react-query'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { studentService } from '../../services/studentService'
import { orderService } from '../../services/orderService'
import { itemService } from '../../services/itemService'
import LoadingSpinner from '../Common/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

const ManagerDashboard = () => {
  const { data: studentsStats, isLoading: studentsLoading } = useQuery(
    'studentsStats',
    studentService.getStudentsStats
  )

  const { data: orderStats, isLoading: ordersLoading } = useQuery(
    'orderStats',
    orderService.getOrderStats
  )

  const { data: itemsStats, isLoading: itemsLoading } = useQuery(
    'itemsStats',
    itemService.getItemsStats
  )

  const { data: recentOrders, isLoading: recentOrdersLoading } = useQuery(
    'recentOrders',
    () => orderService.getOrders({ limit: 5, sortBy: 'orderDate', sortOrder: 'desc' })
  )

  if (studentsLoading || ordersLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Students',
      value: studentsStats?.overview?.totalStudents || 0,
      icon: Users,
      color: 'primary',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Orders',
      value: orderStats?.overview?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'success',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(orderStats?.overview?.totalRevenue || 0),
      icon: DollarSign,
      color: 'warning',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Available Items',
      value: itemsStats?.overview?.availableItems || 0,
      icon: TrendingUp,
      color: 'danger',
      change: '+3%',
      changeType: 'positive'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-danger-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-warning-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-primary-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard Overview</h1>
        <p className="text-secondary-600">
          Welcome back! Here's what's happening in your mess today.
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
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
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
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {recentOrdersLoading ? (
              <LoadingSpinner />
            ) : recentOrders?.orders?.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.orders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-sm font-medium text-secondary-900">
                          {order.studentName}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {order.studentRollNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Balance Distribution */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Student Balance Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total Balance</span>
                <span className="text-lg font-semibold text-secondary-900">
                  {formatCurrency(studentsStats?.overview?.totalBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Average Balance</span>
                <span className="text-lg font-semibold text-secondary-900">
                  {formatCurrency(studentsStats?.overview?.avgBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total Spent</span>
                <span className="text-lg font-semibold text-secondary-900">
                  {formatCurrency(studentsStats?.overview?.totalSpent || 0)}
                </span>
              </div>
            </div>

            {/* Year-wise distribution */}
            {studentsStats?.yearWiseStats && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Students by Year</h4>
                <div className="space-y-2">
                  {studentsStats.yearWiseStats.map((yearStat) => (
                    <div key={yearStat._id} className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Year {yearStat._id}</span>
                      <span className="text-sm font-medium text-secondary-900">
                        {yearStat.count} students
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Items */}
      {itemsStats?.topItems && itemsStats.topItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Popular Items</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsStats.topItems.slice(0, 6).map((item) => (
                <div key={item._id} className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-secondary-900">{item.name}</h4>
                    <span className={`badge badge-${item.category === 'coupon' ? 'primary' : 'secondary'}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-secondary-500">
                      {item.totalOrdered} orders
                    </span>
                    <span className="text-sm font-medium text-secondary-900">
                      {formatCurrency(item.price)}
                    </span>
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

export default ManagerDashboard
