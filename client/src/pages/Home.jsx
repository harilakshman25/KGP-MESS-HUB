import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Shield, 
  Users, 
  Clock, 
  BarChart3,
  CheckCircle,
  Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: Shield,
      title: 'Secure Access Control',
      description: 'Multi-level authentication with secret keys and master override functionality'
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student registration, balance management, and profile access'
    },
    {
      icon: Clock,
      title: 'Real-time Orders',
      description: 'Instant order processing with live status updates and history tracking'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Detailed insights and reports for better mess management decisions'
    }
  ]

  const benefits = [
    'Automated student registration via CSV upload',
    'Secure student profile access with dual authentication',
    'Real-time order management and tracking',
    'Comprehensive complaint handling system',
    'Financial transparency with detailed balance tracking',
    'Admin oversight with approval workflows'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              KGP MessHub
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              A comprehensive mess management system designed specifically for IIT Kharagpur hostels. 
              Streamline operations, enhance transparency, and improve student experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-700 bg-white hover:bg-primary-50 transition-colors"
                  >
                    Register as Manager
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-primary-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-700 bg-white hover:bg-primary-50 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Powerful Features for Modern Mess Management
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to handle complex mess operations 
              while maintaining security and user-friendliness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
                Why Choose KGP MessHub?
              </h2>
              <p className="text-lg text-secondary-600 mb-8">
                Our platform addresses the unique challenges of institutional mess management 
                with innovative solutions that prioritize security, efficiency, and transparency.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-hard p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900">
                    Trusted by IIT Kharagpur
                  </h3>
                </div>
                <blockquote className="text-secondary-600 italic">
                  "KGP MessHub has revolutionized our mess operations. The security features 
                  and user-friendly interface have made management significantly easier while 
                  ensuring complete transparency for students."
                </blockquote>
                <div className="mt-4 text-sm text-secondary-500">
                  - Hall Management Team
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Mess Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the digital revolution in institutional food service management. 
            Get started today and experience the difference.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-700 bg-white hover:bg-primary-50 transition-colors"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
