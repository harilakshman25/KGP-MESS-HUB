import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  const quickLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Login', href: '/login', icon: Search },
    { name: 'About', href: '/about', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-200 mb-4">404</div>
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-primary-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-secondary-600 mb-6">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-full btn-primary inline-flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="w-full btn-secondary inline-flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="border-t border-secondary-200 pt-8">
          <h3 className="text-sm font-medium text-secondary-700 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex flex-col items-center p-3 text-secondary-600 hover:text-primary-600 hover:bg-white rounded-lg transition-all duration-200"
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-secondary-500">
          <p>
            If you believe this is an error, please{' '}
            <a 
              href="mailto:support@kgpmesshub.com" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
