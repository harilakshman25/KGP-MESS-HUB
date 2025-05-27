import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { studentService } from '../../services/studentService'
import LoadingSpinner from '../Common/LoadingSpinner'
import toast from 'react-hot-toast'

const CSVUpload = () => {
  const [uploadResult, setUploadResult] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const selectedFile = watch('csvFile')

  const onSubmit = async (data) => {
    if (!data.csvFile || data.csvFile.length === 0) {
      toast.error('Please select a CSV file')
      return
    }

    setIsUploading(true)
    try {
      const result = await studentService.uploadCSV(data.csvFile[0])
      setUploadResult(result)
      toast.success('CSV upload completed!')
    } catch (error) {
      toast.error('Failed to upload CSV file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setValue('csvFile', files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const downloadSampleCSV = () => {
    const sampleData = [
      ['rollNumber', 'name', 'roomNumber', 'phoneNumber'],
      ['21CS30001', 'John Doe', 'A101', '9876543210'],
      ['21ME30002', 'Jane Smith', 'B205', '9876543211'],
      ['21EE30003', 'Bob Johnson', 'C301', '9876543212'],
    ]
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample_students.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Upload Students CSV</h1>
        <p className="text-secondary-600">
          Upload a CSV file containing student information to register them in the system.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-3">CSV Format Instructions</h3>
        <div className="space-y-2 text-sm text-primary-800">
          <p>Your CSV file should contain the following columns in order:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>rollNumber:</strong> Student roll number (format: 21CS30001)</li>
            <li><strong>name:</strong> Student full name</li>
            <li><strong>roomNumber:</strong> Room number (e.g., A101, B205)</li>
            <li><strong>phoneNumber:</strong> 10-digit phone number</li>
          </ul>
          <div className="mt-4">
            <button
              onClick={downloadSampleCSV}
              className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Upload CSV File</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="form-label">CSV File</label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                  dragOver
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-secondary-300 hover:border-secondary-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-secondary-400" />
                  <div className="flex text-sm text-secondary-600">
                    <label
                      htmlFor="csvFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        {...register('csvFile', {
                          required: 'Please select a CSV file',
                        })}
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-secondary-500">CSV files only</p>
                </div>
              </div>
              {errors.csvFile && (
                <p className="form-error">{errors.csvFile.message}</p>
              )}
              
              {selectedFile && selectedFile.length > 0 && (
                <div className="mt-2 flex items-center text-sm text-secondary-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {selectedFile[0].name} ({Math.round(selectedFile[0].size / 1024)} KB)
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isUploading}
                className="btn-primary w-full"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Uploading...</span>
                  </>
                ) : (
                  'Upload CSV'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Upload Results</h3>
          </div>
          <div className="p-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-secondary-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary-900">
                  {uploadResult.summary.total}
                </div>
                <div className="text-sm text-secondary-600">Total Records</div>
              </div>
              <div className="bg-success-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success-700">
                  {uploadResult.summary.successful}
                </div>
                <div className="text-sm text-success-600">Successful</div>
              </div>
              <div className="bg-warning-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning-700">
                  {uploadResult.summary.duplicates}
                </div>
                <div className="text-sm text-warning-600">Duplicates</div>
              </div>
              <div className="bg-danger-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-danger-700">
                  {uploadResult.summary.failed}
                </div>
                <div className="text-sm text-danger-600">Failed</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              {/* Successful */}
              {uploadResult.results.successful.length > 0 && (
                <div>
                  <h4 className="flex items-center text-lg font-medium text-success-700 mb-3">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Successfully Added ({uploadResult.results.successful.length})
                  </h4>
                  <div className="bg-success-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {uploadResult.results.successful.map((student, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{student.rollNumber}</span>
                          <span>{student.name}</span>
                          <span className="text-success-600">{student.roomNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {uploadResult.results.duplicates.length > 0 && (
                <div>
                  <h4 className="flex items-center text-lg font-medium text-warning-700 mb-3">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Duplicates Skipped ({uploadResult.results.duplicates.length})
                  </h4>
                  <div className="bg-warning-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {uploadResult.results.duplicates.map((duplicate, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{duplicate.rollNumber}</span>
                          <span className="text-warning-600">{duplicate.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Failed */}
              {uploadResult.results.failed.length > 0 && (
                <div>
                  <h4 className="flex items-center text-lg font-medium text-danger-700 mb-3">
                    <XCircle className="h-5 w-5 mr-2" />
                    Failed Records ({uploadResult.results.failed.length})
                  </h4>
                  <div className="bg-danger-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {uploadResult.results.failed.map((failed, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{failed.rollNumber}</span>
                          <span className="text-danger-600">{failed.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CSVUpload
