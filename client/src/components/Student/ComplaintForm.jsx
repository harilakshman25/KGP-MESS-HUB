import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, 
  Upload, 
  X, 
  FileText,
  ArrowLeft 
} from 'lucide-react'
import { complaintService } from '../../services/complaintService'
import LoadingSpinner from '../Common/LoadingSpinner'
import toast from 'react-hot-toast'

const ComplaintForm = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const complaintType = watch('complaintType')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      // Add form fields
      Object.keys(data).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, data[key])
        }
      })

      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file)
      })

      await complaintService.createComplaint(formData)
      toast.success('Complaint submitted successfully')
      navigate('/dashboard/complaints')
    } catch (error) {
      toast.error('Failed to submit complaint')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`)
        return false
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max 5MB)`)
        return false
      }
      
      return true
    })

    setAttachments(prev => [...prev, ...validFiles])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getComplaintTypeDescription = (type) => {
    const descriptions = {
      wrong_order: 'Items received were different from what was ordered',
      incorrect_billing: 'Amount charged was incorrect or unexpected',
      quality_issue: 'Food quality was poor or unsatisfactory',
      missing_item: 'Some ordered items were not delivered',
      other: 'Other issues not covered above'
    }
    return descriptions[type] || ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Submit Complaint</h1>
          <p className="text-secondary-600">
            Report issues with orders or mess services
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-warning-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-warning-800 mb-2">Important Notice</h3>
            <div className="text-sm text-warning-700 space-y-2">
              <p>
                <strong>Complaint Token Required:</strong> This form requires a special complaint token 
                that is only available to authorized mess workers. Students cannot directly submit complaints.
              </p>
              <p>
                <strong>For Students:</strong> Please approach a mess worker with your complaint details. 
                They will help you submit the complaint using their authorized token.
              </p>
              <p>
                <strong>Valid Complaints:</strong> Only genuine complaints will be processed. 
                False or frivolous complaints may result in penalties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Form */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Complaint Details</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Order ID */}
            <div>
              <label className="form-label">Order ID / Batch ID</label>
              <input
                {...register('orderId', {
                  required: 'Order ID is required'
                })}
                className="form-input"
                placeholder="Enter the order batch ID (e.g., BATCH_ABC123)"
              />
              {errors.orderId && (
                <p className="form-error">{errors.orderId.message}</p>
              )}
            </div>

            {/* Complaint Type */}
            <div>
              <label className="form-label">Complaint Type</label>
              <select
                {...register('complaintType', {
                  required: 'Please select a complaint type'
                })}
                className="form-input"
              >
                <option value="">Select complaint type</option>
                <option value="wrong_order">Wrong Order</option>
                <option value="incorrect_billing">Incorrect Billing</option>
                <option value="quality_issue">Quality Issue</option>
                <option value="missing_item">Missing Item</option>
                <option value="other">Other</option>
              </select>
              {errors.complaintType && (
                <p className="form-error">{errors.complaintType.message}</p>
              )}
              {complaintType && (
                <p className="text-sm text-secondary-600 mt-1">
                  {getComplaintTypeDescription(complaintType)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Detailed Description</label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters'
                  },
                  maxLength: {
                    value: 1000,
                    message: 'Description cannot exceed 1000 characters'
                  }
                })}
                rows="4"
                className="form-input"
                placeholder="Please provide detailed information about the issue..."
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>

            {/* Requested Refund */}
            <div>
              <label className="form-label">Requested Refund Amount (₹)</label>
              <input
                {...register('requestedRefund', {
                  required: 'Refund amount is required',
                  min: {
                    value: 0.01,
                    message: 'Refund amount must be greater than 0'
                  },
                  max: {
                    value: 1000,
                    message: 'Refund amount cannot exceed ₹1000'
                  }
                })}
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Enter the amount you believe should be refunded"
              />
              {errors.requestedRefund && (
                <p className="form-error">{errors.requestedRefund.message}</p>
              )}
            </div>

            {/* Submitted By */}
            <div>
              <label className="form-label">Submitted By</label>
              <input
                {...register('submittedBy', {
                  required: 'Please specify who is submitting this complaint'
                })}
                className="form-input"
                placeholder="Name of the person submitting (student name or mess worker)"
              />
              {errors.submittedBy && (
                <p className="form-error">{errors.submittedBy.message}</p>
              )}
            </div>

            {/* Complaint Token */}
            <div>
              <label className="form-label">Complaint Token</label>
              <input
                {...register('complaintToken', {
                  required: 'Complaint token is required'
                })}
                type="password"
                className="form-input"
                placeholder="Enter the authorized complaint token"
              />
              {errors.complaintToken && (
                <p className="form-error">{errors.complaintToken.message}</p>
              )}
              <p className="text-sm text-secondary-600 mt-1">
                This token is only available to authorized mess workers
              </p>
            </div>

            {/* File Attachments */}
            <div>
              <label className="form-label">Attachments (Optional)</label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-secondary-400 mb-2" />
                  <div className="text-sm text-secondary-600">
                    <label htmlFor="attachments" className="cursor-pointer text-primary-600 hover:text-primary-500">
                      Click to upload files
                    </label>
                    <span> or drag and drop</span>
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Images, PDFs, or text files (max 5MB each)
                  </p>
                  <input
                    id="attachments"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-secondary-700">Attached Files:</h4>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-secondary-400" />
                          <span className="text-sm text-secondary-900">{file.name}</span>
                          <span className="text-xs text-secondary-500">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-secondary-400 hover:text-danger-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ComplaintForm
