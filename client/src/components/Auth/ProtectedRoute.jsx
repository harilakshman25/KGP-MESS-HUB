import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../Common/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // Check if manager is approved
  if (user?.role === 'manager' && !user?.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8 text-center">
          <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-warning-600 text-2xl">⏳</span>
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Approval Pending
          </h2>
          <p className="text-secondary-600 mb-6">
            Your account is currently under review. Please wait for admin approval 
            before accessing the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
