import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Download,
  RefreshCw,
  DollarSign
} from 'lucide-react'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../Common/LoadingSpinner'
import Modal from '../Common/Modal'
import { formatCurrency, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const StudentList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)

  const { data, isLoading, refetch } = useQuery(
    ['students', currentPage, searchQuery, selectedYear],
    () => studentService.getStudents({
      page: currentPage,
      limit: 20,
      search: searchQuery,
      year: selectedYear
    }),
    { keepPreviousData: true }
  )

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleYearFilter = (e) => {
    setSelectedYear(e.target.value)
    setCurrentPage(1)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const handleBalanceUpdate = (student) => {
    setSelectedStudent(student)
    setShowBalanceModal(true)
  }

  const handleDeactivateStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to deactivate this student?')) {
      try {
        await studentService.deactivateStudent(studentId)
        toast.success('Student deactivated successfully')
        refetch()
      } catch (error) {
        toast.error('Failed to deactivate student')
      }
    }
  }

  const exportToCSV = () => {
    if (!data?.students) return
    
    const csvData = data.students.map(student => ({
      rollNumber: student.rollNumber,
      name: student.name,
      roomNumber: student.roomNumber,
      phoneNumber: student.phoneNumber,
      year: student.year,
      balance: student.balance,
      totalOrders: student.totalOrders,
      totalSpent: student.totalSpent
    }))

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Students</h1>
          <p className="text-secondary-600">
            Manage student information and balances
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportToCSV}
            className="btn-secondary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => refetch()}
            className="btn-primary inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search by roll number, name, or room..."
              value={searchQuery}
              onChange={handleSearch}
              className="form-input pl-10"
            />
          </div>

          {/* Year Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-secondary-400" />
            </div>
            <select
              value={selectedYear}
              onChange={handleYearFilter}
              className="form-input pl-10"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-end">
            <div className="text-sm text-secondary-600">
              Total: <span className="font-medium">{data?.pagination?.total || 0}</span> students
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Student</th>
                <th className="table-header-cell">Room</th>
                <th className="table-header-cell">Year</th>
                <th className="table-header-cell">Balance</th>
                <th className="table-header-cell">Orders</th>
                <th className="table-header-cell">Total Spent</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {data?.students?.map((student) => (
                <tr key={student._id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-secondary-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {student.rollNumber}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium">{student.roomNumber}</span>
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-primary">
                      Year {student.year}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`font-medium ${
                      student.balance >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatCurrency(student.balance)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-secondary-900">{student.totalOrders}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-secondary-900">
                      {formatCurrency(student.totalSpent)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                        title="Edit Student"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBalanceUpdate(student)}
                        className="p-1 text-secondary-400 hover:text-success-600 transition-colors"
                        title="Update Balance"
                      >
                        <DollarSign className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivateStudent(student._id)}
                        className="p-1 text-secondary-400 hover:text-danger-600 transition-colors"
                        title="Deactivate Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-600">
                Showing {((currentPage - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-secondary-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === data.pagination.pages}
                  className="px-3 py-1 text-sm border border-secondary-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={selectedStudent}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStudent(null)
        }}
        onSuccess={() => {
          refetch()
          setShowEditModal(false)
          setSelectedStudent(null)
        }}
      />

      {/* Balance Update Modal */}
      <BalanceUpdateModal
        student={selectedStudent}
        isOpen={showBalanceModal}
        onClose={() => {
          setShowBalanceModal(false)
          setSelectedStudent(null)
        }}
        onSuccess={() => {
          refetch()
          setShowBalanceModal(false)
          setSelectedStudent(null)
        }}
      />
    </div>
  )
}

// Edit Student Modal Component
const EditStudentModal = ({ student, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  React.useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        roomNumber: student.roomNumber,
        phoneNumber: student.phoneNumber,
        year: student.year
      })
    }
  }, [student, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await studentService.updateStudent(student._id, data)
      toast.success('Student updated successfully')
      onSuccess()
    } catch (error) {
      toast.error('Failed to update student')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="form-input"
            placeholder="Student name"
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="form-label">Room Number</label>
          <input
            {...register('roomNumber', { required: 'Room number is required' })}
            className="form-input"
            placeholder="Room number"
          />
          {errors.roomNumber && <p className="form-error">{errors.roomNumber.message}</p>}
        </div>

        <div>
          <label className="form-label">Phone Number</label>
          <input
            {...register('phoneNumber', {
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Phone number must be 10 digits'
              }
            })}
            className="form-input"
            placeholder="Phone number"
          />
          {errors.phoneNumber && <p className="form-error">{errors.phoneNumber.message}</p>}
        </div>

        <div>
          <label className="form-label">Year</label>
          <select
            {...register('year', { required: 'Year is required' })}
            className="form-input"
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
          {errors.year && <p className="form-error">{errors.year.message}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <LoadingSpinner size="small" color="white" /> : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Balance Update Modal Component
const BalanceUpdateModal = ({ student, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  React.useEffect(() => {
    if (student) {
      reset({ amount: '', operation: 'add', reason: '' })
    }
  }, [student, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await studentService.updateStudentBalance(student._id, data)
      toast.success('Balance updated successfully')
      onSuccess()
    } catch (error) {
      toast.error('Failed to update balance')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Student Balance">
      {student && (
        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-medium text-secondary-900">{student.name}</h4>
            <p className="text-sm text-secondary-600">{student.rollNumber}</p>
            <p className="text-lg font-semibold text-secondary-900 mt-2">
              Current Balance: {formatCurrency(student.balance)}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Operation</label>
              <select
                {...register('operation', { required: 'Operation is required' })}
                className="form-input"
              >
                <option value="add">Add Money</option>
                <option value="deduct">Deduct Money</option>
              </select>
              {errors.operation && <p className="form-error">{errors.operation.message}</p>}
            </div>

            <div>
              <label className="form-label">Amount</label>
              <input
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Enter amount"
              />
              {errors.amount && <p className="form-error">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="form-label">Reason</label>
              <textarea
                {...register('reason')}
                className="form-input"
                rows="3"
                placeholder="Reason for balance update (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <LoadingSpinner size="small" color="white" /> : 'Update Balance'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  )
}

export default StudentList
