import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Clock, 
  Check, 
  X, 
  Eye, 
  Mail, 
  Phone, 
  Building,
  Calendar
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../Common/LoadingSpinner'
import Modal from '../Common/Modal'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const RegistrationRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [actionReason, setActionReason] = useState('')

  const queryClient = useQueryClient()

  const { data: requests, isLoading } = useQuery(
    'registrationRequests',
    adminService.getRegistrationRequests
  )

  const updateRequestMutation = useMutation(
    ({ id, action, reason }) => adminService.updateRegistrationRequest(id, { action, reason }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('registrationRequests')
        queryClient.invalidateQueries('adminDashboard')
        toast.success(
          variables.action === 'approve' 
            ? 'Registration approved successfully' 
            : 'Registration rejected successfully'
        )
        setShowActionModal(false)
        setSelectedRequest(null)
        setActionReason('')
      },
      onError: () => {
        toast.error('Failed to update registration request')
      }
    }
  )

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleAction = (request, action) => {
    setSelectedRequest(request)
    setActionType(action)
    setShowActionModal(true)
  }

  const handleConfirmAction = () => {
    if (!selectedRequest) return

    updateRequestMutation.mutate({
      id: selectedRequest._id,
      action: actionType,
      reason: actionReason
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Registration Requests</h1>
        <p className="text-secondary-600">
          Review and approve mess manager registration requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-100">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Pending Requests</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {requests?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests && requests.length > 0 ? (
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Manager Details</th>
                  <th className="table-header-cell">Hall Information</th>
                  <th className="table-header-cell">Contact</th>
                  <th className="table-header-cell">Submitted</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {requests.map((request) => (
                  <tr key={request._id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-secondary-900">
                          {request.name}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {request.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-secondary-400 mr-2" />
                        <span className="font-medium">{request.hallName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 text-secondary-400 mr-1" />
                          {request.contactNumber}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 text-secondary-400 mr-1" />
                          {request.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center text-sm text-secondary-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(request.createdAt)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(request, 'approve')}
                          className="p-1 text-secondary-400 hover:text-success-600 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(request, 'reject')}
                          className="p-1 text-secondary-400 hover:text-danger-600 transition-colors"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No Pending Requests
            </h3>
            <p className="text-secondary-600">
              All registration requests have been processed.
            </p>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedRequest(null)
        }}
        title="Registration Request Details"
        size="large"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Personal Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-secondary-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedRequest.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-secondary-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedRequest.email}</span>
                  </div>
                  <div>
                    <span className="text-sm text-secondary-600">Contact:</span>
                    <span className="ml-2 font-medium">{selectedRequest.contactNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Hall Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-secondary-600">Hall Name:</span>
                    <span className="ml-2 font-medium">{selectedRequest.hallName}</span>
                  </div>
                  <div>
                    <span className="text-sm text-secondary-600">Role:</span>
                    <span className="ml-2 font-medium capitalize">{selectedRequest.role}</span>
                  </div>
                  <div>
                    <span className="text-sm text-secondary-600">Submitted:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
              <button
                onClick={() => handleAction(selectedRequest, 'reject')}
                className="btn-secondary text-danger-600 hover:text-danger-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction(selectedRequest, 'approve')}
                className="btn-primary"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false)
          setSelectedRequest(null)
          setActionReason('')
        }}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Registration`}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900">{selectedRequest.name}</h4>
              <p className="text-sm text-secondary-600">{selectedRequest.hallName}</p>
            </div>

            <div>
              <label className="form-label">
                {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows="3"
                className="form-input"
                placeholder={
                  actionType === 'approve' 
                    ? 'Add any notes for the approval...'
                    : 'Please provide a reason for rejection...'
                }
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionReason('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={updateRequestMutation.isLoading}
                className={actionType === 'approve' ? 'btn-primary' : 'btn-danger'}
              >
                {updateRequestMutation.isLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  `${actionType === 'approve' ? 'Approve' : 'Reject'} Request`
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RegistrationRequests
