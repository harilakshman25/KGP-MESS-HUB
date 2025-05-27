import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../Common/Navbar'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Registration Requests', href: '/admin/registration-requests', icon: Users },
    { name: 'System Statistics', href: '/admin/stats', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
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
            <span className="text-lg font-semibold text-secondary-900">Admin Panel</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-secondary-400 hover:text-secondary-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Admin info */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-danger-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-secondary-900">
                  {user?.name}
                </h2>
                <p className="text-sm text-secondary-600">System Administrator</p>
              </div>
            </div>
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
                        ? 'bg-danger-100 text-danger-700'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-danger-500' : 'text-secondary-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
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
                Admin Panel
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

export default AdminLayout
