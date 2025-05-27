import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Upload, 
  Users, 
  Building, 
  UserCheck, 
  ShoppingCart,
  History,
  AlertTriangle,
  Menu,
  X,
  Settings,
  Key
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Navbar from '../Common/Navbar'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { getItemCount } = useCart()
  const location = useLocation()
  const cartItemCount = getItemCount()

  const navigation = [
    { name: 'Overview', href: '/dashboard/overview', icon: Home },
    { name: 'CSV Upload', href: '/dashboard/csv-upload', icon: Upload },
    { name: 'Students', href: '/dashboard/students', icon: Users },
    { name: 'Hall Info', href: '/dashboard/hall-info', icon: Building },
    { name: 'Student Access', href: '/dashboard/student-access', icon: UserCheck },
    { 
      name: 'Cart', 
      href: '/dashboard/cart', 
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : null
    },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-medium transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200 lg:hidden">
            <span className="text-lg font-semibold text-secondary-900">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-secondary-400 hover:text-secondary-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Hall info */}
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900 mb-1">
              {user?.hallName}
            </h2>
            <p className="text-sm text-secondary-600">Mess Manager Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-primary-500' : 'text-secondary-400'
                      }`}
                    />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-danger-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Settings section */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <div className="space-y-1">
                <Link
                  to="/dashboard/settings"
                  className="group flex items-center px-3 py-2 text-sm font-medium text-secondary-600 rounded-lg hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
                >
                  <Settings className="mr-3 h-5 w-5 text-secondary-400" />
                  Settings
                </Link>
                <Link
                  to="/dashboard/keys"
                  className="group flex items-center px-3 py-2 text-sm font-medium text-secondary-600 rounded-lg hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
                >
                  <Key className="mr-3 h-5 w-5 text-secondary-400" />
                  Access Keys
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile menu button */}
          <div className="sticky top-0 z-10 bg-white border-b border-secondary-200 lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-secondary-400 hover:text-secondary-600"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-semibold text-secondary-900">
                {user?.hallName}
              </h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
