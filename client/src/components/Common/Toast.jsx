import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

const Toast = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  }

  const Icon = icons[type]

  return (
    <div className={`flex items-center p-4 border rounded-lg shadow-soft ${colors[type]} animate-slide-in`}>
      <Icon size={20} className="mr-3 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-current opacity-70 hover:opacity-100"
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  )
}

export default Toast
