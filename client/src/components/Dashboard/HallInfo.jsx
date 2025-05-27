import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Building, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Edit,
  Save,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../Common/LoadingSpinner'
import toast from 'react-hot-toast'

const HallInfo = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [hallData, setHallData] = useState({
    name: user?.hallName || '',
    capacity: 200,
    currentOccupancy: 180,
    type: 'boys',
    location: 'IIT Kharagpur Campus',
    contactInfo: {
      phone: '03222-255000',
      email: `${user?.hallName?.toLowerCase().replace(/\s+/g, '')}@iitkgp.ac.in`
    },
    messTimings: {
      breakfast: { start: '07:30', end: '09:30' },
      lunch: { start: '12:00', end: '14:00' },
      snacks: { start: '16:30', end: '18:00' },
      dinner: { start: '19:30', end: '21:30' }
    },
    warden: {
      name: 'Dr. John Doe',
      phone: '03222-255001',
      email: 'warden@iitkgp.ac.in'
    },
    facilities: ['WiFi', 'Common Room', 'Reading Room', 'Gym', 'Canteen'],
    messRules: [
      { rule: 'Mess timings must be strictly followed', isActive: true },
      { rule: 'No outside food in mess premises', isActive: true },
      { rule: 'Maintain cleanliness and hygiene', isActive: true },
      { rule: 'Report any issues to mess manager', isActive: true }
    ]
  })

  const handleSave = () => {
    // Here you would typically save to backend
    toast.success('Hall information updated successfully')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original data if needed
  }

  const occupancyPercentage = Math.round((hallData.currentOccupancy / hallData.capacity) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Hall Information</h1>
          <p className="text-secondary-600">
            Manage hall details, timings, and facilities
          </p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary inline-flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary inline-flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary inline-flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Information
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="form-label">Hall Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={hallData.name}
                  onChange={(e) => setHallData({...hallData, name: e.target.value})}
                  className="form-input"
                />
              ) : (
                <p className="text-secondary-900 font-medium">{hallData.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Capacity</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={hallData.capacity}
                    onChange={(e) => setHallData({...hallData, capacity: parseInt(e.target.value)})}
                    className="form-input"
                  />
                ) : (
                  <p className="text-secondary-900 font-medium">{hallData.capacity}</p>
                )}
              </div>
              <div>
                <label className="form-label">Current Occupancy</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={hallData.currentOccupancy}
                    onChange={(e) => setHallData({...hallData, currentOccupancy: parseInt(e.target.value)})}
                    className="form-input"
                  />
                ) : (
                  <p className="text-secondary-900 font-medium">{hallData.currentOccupancy}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Occupancy Rate</label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-secondary-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      occupancyPercentage > 90 ? 'bg-danger-500' : 
                      occupancyPercentage > 75 ? 'bg-warning-500' : 'bg-success-500'
                    }`}
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {occupancyPercentage}%
                </span>
              </div>
            </div>

            <div>
              <label className="form-label">Type</label>
              {isEditing ? (
                <select
                  value={hallData.type}
                  onChange={(e) => setHallData({...hallData, type: e.target.value})}
                  className="form-input"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="mixed">Mixed</option>
                </select>
              ) : (
                <p className="text-secondary-900 font-medium capitalize">{hallData.type}</p>
              )}
            </div>

            <div>
              <label className="form-label">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={hallData.location}
                  onChange={(e) => setHallData({...hallData, location: e.target.value})}
                  className="form-input"
                />
              ) : (
                <p className="text-secondary-900 font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {hallData.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="form-label">Hall Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={hallData.contactInfo.phone}
                  onChange={(e) => setHallData({
                    ...hallData, 
                    contactInfo: {...hallData.contactInfo, phone: e.target.value}
                  })}
                  className="form-input"
                />
              ) : (
                <p className="text-secondary-900 font-medium">{hallData.contactInfo.phone}</p>
              )}
            </div>

            <div>
              <label className="form-label">Hall Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={hallData.contactInfo.email}
                  onChange={(e) => setHallData({
                    ...hallData, 
                    contactInfo: {...hallData.contactInfo, email: e.target.value}
                  })}
                  className="form-input"
                />
              ) : (
                <p className="text-secondary-900 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {hallData.contactInfo.email}
                </p>
              )}
            </div>

            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-medium text-secondary-900 mb-3">Warden Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={hallData.warden.name}
                      onChange={(e) => setHallData({
                        ...hallData, 
                        warden: {...hallData.warden, name: e.target.value}
                      })}
                      className="form-input"
                    />
                  ) : (
                    <p className="text-secondary-900 font-medium">{hallData.warden.name}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={hallData.warden.phone}
                      onChange={(e) => setHallData({
                        ...hallData, 
                        warden: {...hallData.warden, phone: e.target.value}
                      })}
                      className="form-input"
                    />
                  ) : (
                    <p className="text-secondary-900 font-medium">{hallData.warden.phone}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={hallData.warden.email}
                      onChange={(e) => setHallData({
                        ...hallData, 
                        warden: {...hallData.warden, email: e.target.value}
                      })}
                      className="form-input"
                    />
                  ) : (
                    <p className="text-secondary-900 font-medium">{hallData.warden.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mess Timings */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Mess Timings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(hallData.messTimings).map(([meal, timing]) => (
              <div key={meal} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="font-medium text-secondary-900 capitalize">{meal}</span>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <input
                        type="time"
                        value={timing.start}
                        onChange={(e) => setHallData({
                          ...hallData,
                          messTimings: {
                            ...hallData.messTimings,
                            [meal]: {...timing, start: e.target.value}
                          }
                        })}
                        className="form-input w-auto text-sm"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={timing.end}
                        onChange={(e) => setHallData({
                          ...hallData,
                          messTimings: {
                            ...hallData.messTimings,
                            [meal]: {...timing, end: e.target.value}
                          }
                        })}
                        className="form-input w-auto text-sm"
                      />
                    </>
                  ) : (
                    <span className="text-secondary-600">
                      {timing.start} - {timing.end}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Facilities</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {hallData.facilities.map((facility, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mess Rules */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Mess Rules</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {hallData.messRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-900">{rule.rule}</span>
                <span className={`badge ${rule.isActive ? 'badge-success' : 'badge-secondary'}`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HallInfo
