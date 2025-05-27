import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Search, Key, Users, Eye } from 'lucide-react'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import LoadingSpinner from '../Common/LoadingSpinner'
import Modal from '../Common/Modal'
import toast from 'react-hot-toast'

const StudentAccess = () => {
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showKeysModal, setShowKeysModal] = useState(false)
  const [userKeys, setUserKeys] = useState(null)
  
  const { user } = useAuth()
  const { setStudent } = useCart()
  const navigate = useNavigate()

  const {
    register: registerSearch,
    handleSubmit: handleSearchSubmit,
    formState: { errors: searchErrors },
  } = useForm()

  const {
    register: registerAccess,
    handleSubmit: handleAccessSubmit,
    formState: { errors: accessErrors },
    reset: resetAccessForm
  } = useForm()

  const onSearchSubmit = async (data) => {
    setIsSearching(true)
    try {
      const results = await studentService.searchStudentsForAccess(
        data.query,
        data.secretKey
      )
      setSearchResults(results)
      if (results.length === 0) {
        toast.info('No students found matching your search')
      }
    } catch (error) {
      toast.error('Search failed. Please check your secret key.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setShowAccessModal(true)
    resetAccessForm()
  }

  const onAccessSubmit = async (data) => {
    try {
      const response = await studentService.accessStudentProfile(
        selectedStudent._id,
        data
      )
      
      // Set student in cart context
      setStudent(selectedStudent._id)
      
      toast.success(`Access granted for ${selectedStudent.name}`)
      setShowAccessModal(false)
      navigate(`/dashboard/student-profile/${selectedStudent._id}`, {
        state: { studentData: response.student, accessType: response.accessType }
      })
    } catch (error) {
      toast.error('Access denied. Please check your key.')
    }
  }

  const showUserKeys = async () => {
    try {
      const keys = await studentService.getKeys()
      setUserKeys(keys)
      setShowKeysModal(true)
    } catch (error) {
      toast.error('Failed to fetch keys')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Student Access</h1>
          <p className="text-secondary-600">
            Search and access student profiles securely
          </p>
        </div>
        <button
          onClick={showUserKeys}
          className="mt-4 sm:mt-0 btn-secondary inline-flex items-center"
        >
          <Key className="h-4 w-4 mr-2" />
          View Keys
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Key className="h-6 w-6 text-warning-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-warning-800">Security Notice</h3>
            <div className="mt-2 text-sm text-warning-700">
              <p className="mb-2">
                This section requires your secret access key to search for students. 
                Each student profile access requires either:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Student Key:</strong> The student's personal secret key</li>
                <li><strong>Master Key:</strong> Your manager override key (for emergencies)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Search Students</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearchSubmit(onSearchSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Search Query</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    {...registerSearch('query', {
                      required: 'Search query is required',
                      minLength: { value: 2, message: 'Query must be at least 2 characters' }
                    })}
                    className="form-input pl-10"
                    placeholder="Roll number, name, room number, or year"
                  />
                </div>
                {searchErrors.query && (
                  <p className="form-error">{searchErrors.query.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Secret Access Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    {...registerSearch('secretKey', {
                      required: 'Secret key is required'
                    })}
                    type="password"
                    className="form-input pl-10"
                    placeholder="Enter your secret access key"
                  />
                </div>
                {searchErrors.secretKey && (
                  <p className="form-error">{searchErrors.secretKey.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSearching}
                className="btn-primary w-full"
              >
                {isSearching ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Students
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">
              Search Results ({searchResults.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((student) => (
                <div
                  key={student._id}
                  className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-soft transition-all cursor-pointer"
                  onClick={() => handleStudentSelect(student)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900">{student.name}</h4>
                        <p className="text-sm text-secondary-500">{student.rollNumber}</p>
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-secondary-400" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Room:</span>
                      <span className="font-medium">{student.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Year:</span>
                      <span className="badge badge-primary">Year {student.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Balance:</span>
                      <span className={`font-medium ${
                        student.balance >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        ₹{student.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Access Modal */}
      <Modal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        title="Student Profile Access"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4">
              <h4 className="font-medium text-secondary-900">{selectedStudent.name}</h4>
              <p className="text-sm text-secondary-600">{selectedStudent.rollNumber}</p>
              <p className="text-sm text-secondary-600">Room: {selectedStudent.roomNumber}</p>
            </div>

            <form onSubmit={handleAccessSubmit(onAccessSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Access Method</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      {...registerAccess('accessMethod')}
                      type="radio"
                      value="student"
                      className="mr-2"
                    />
                    <span className="text-sm">Student Key (Recommended)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...registerAccess('accessMethod')}
                      type="radio"
                      value="master"
                      className="mr-2"
                    />
                    <span className="text-sm">Master Key (Emergency Override)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Access Key</label>
                <input
                  {...registerAccess('studentKey')}
                  type="password"
                  className="form-input"
                  placeholder="Enter student key or master key"
                />
                {accessErrors.studentKey && (
                  <p className="form-error">{accessErrors.studentKey.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAccessModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Access Profile
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Keys Modal */}
      <Modal
        isOpen={showKeysModal}
        onClose={() => setShowKeysModal(false)}
        title="Your Access Keys"
      >
        {userKeys && (
          <div className="space-y-4">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-sm text-warning-700">
                <strong>Important:</strong> Keep these keys secure and do not share them with unauthorized personnel.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Secret Access Key</label>
                <div className="bg-secondary-50 rounded-lg p-3 font-mono text-sm break-all">
                  {userKeys.secretAccessKey}
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Used for searching students
                </p>
              </div>

              <div>
                <label className="form-label">Master Key</label>
                <div className="bg-secondary-50 rounded-lg p-3 font-mono text-sm break-all">
                  {userKeys.masterKey}
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Emergency override key for accessing any student profile
                </p>
              </div>

              <div>
                <label className="form-label">Complaint Token</label>
                <div className="bg-secondary-50 rounded-lg p-3 font-mono text-sm break-all">
                  {userKeys.complaintToken}
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Required for filing complaints on behalf of students
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StudentAccess
