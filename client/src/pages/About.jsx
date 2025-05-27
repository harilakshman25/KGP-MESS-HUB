import React from 'react'
import { 
  Shield, 
  Users, 
  Clock, 
  BarChart3,
  CheckCircle,
  Award,
  Target,
  Heart,
  Code,
  Database,
  Smartphone
} from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Multi-layer authentication with secret keys, master overrides, and role-based access control'
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student registration, profile management, and balance tracking system'
    },
    {
      icon: Clock,
      title: 'Real-time Operations',
      description: 'Instant order processing, live status updates, and real-time inventory management'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Detailed insights, performance metrics, and comprehensive reporting dashboard'
    }
  ]

  const technologies = [
    { name: 'React.js', description: 'Modern frontend framework for dynamic user interfaces' },
    { name: 'Node.js', description: 'Scalable backend runtime for server-side operations' },
    { name: 'MongoDB', description: 'NoSQL database for flexible data storage' },
    { name: 'Express.js', description: 'Web framework for robust API development' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for responsive design' },
    { name: 'JWT', description: 'Secure token-based authentication system' }
  ]

  const teamValues = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to solve real-world problems'
    },
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Designing with students and mess managers at the center of every decision'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality solutions'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About KGP MessHub
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-4xl mx-auto">
              Revolutionizing mess management at IIT Kharagpur with innovative technology, 
              robust security, and user-centric design principles.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-secondary-600 mb-6">
                KGP MessHub was born from the need to modernize and streamline mess operations 
                at IIT Kharagpur. We recognized the challenges faced by both mess managers and 
                students in the traditional system and set out to create a comprehensive solution.
              </p>
              <p className="text-lg text-secondary-600 mb-8">
                Our platform bridges the gap between technology and institutional food service, 
                ensuring transparency, efficiency, and security in every transaction.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">Automate complex mess management processes</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">Ensure financial transparency and accountability</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">Enhance user experience for all stakeholders</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-secondary-700">Provide robust security and access control</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-secondary-50 rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                    <div className="text-sm text-secondary-600">Students Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-600 mb-2">15+</div>
                    <div className="text-sm text-secondary-600">Halls Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning-600 mb-2">1000+</div>
                    <div className="text-sm text-secondary-600">Orders Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-danger-600 mb-2">99.9%</div>
                    <div className="text-sm text-secondary-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Comprehensive Features
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Every feature is designed with real-world mess management challenges in mind, 
              providing practical solutions that work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-soft p-8 hover:shadow-medium transition-shadow">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-secondary-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              We use industry-leading technologies to ensure reliability, scalability, and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-secondary-50 rounded-lg p-6 text-center hover:bg-secondary-100 transition-colors">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {tech.name}
                </h3>
                <p className="text-sm text-secondary-600">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              The principles that guide our development and shape our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamValues.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-secondary-600">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Have questions about KGP MessHub? We'd love to hear from you and help 
            improve your mess management experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Support Team</h3>
              <p className="text-primary-100">support@kgpmesshub.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Technical Support</h3>
              <p className="text-primary-100">tech@kgpmesshub.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Emergency Contact</h3>
              <p className="text-primary-100">+91-3222-255000</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
