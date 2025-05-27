import React from 'react'
import { Heart, Github, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">KGP MessHub</span>
            </div>
            <p className="text-secondary-300 mb-4 max-w-md">
              A comprehensive mess management system designed specifically for IIT Kharagpur hostels. 
              Streamlining mess operations with modern technology and user-friendly interfaces.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:support@kgpmesshub.com"
                className="text-secondary-400 hover:text-white transition-colors"
              >
                <Mail size={20} />
              </a>
              <a
                href="https://github.com/kgpmesshub"
                className="text-secondary-400 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-secondary-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/features" className="text-secondary-300 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/support" className="text-secondary-300 hover:text-white transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-secondary-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-secondary-300">
              <li>IIT Kharagpur</li>
              <li>West Bengal, India</li>
              <li>Pin: 721302</li>
              <li>
                <a 
                  href="mailto:support@kgpmesshub.com"
                  className="hover:text-white transition-colors"
                >
                  support@kgpmesshub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-400 text-sm">
            © 2025 KGP MessHub. All rights reserved.
          </p>
          <p className="text-secondary-400 text-sm flex items-center mt-2 md:mt-0">
            Made with <Heart size={16} className="mx-1 text-danger-500" /> for IIT Kharagpur
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
