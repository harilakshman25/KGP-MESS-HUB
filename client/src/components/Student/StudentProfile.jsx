import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  User, 
  CreditCard, 
  ShoppingCart, 
  History, 
  Plus,
  Minus,
  AlertTriangle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import { studentService } from '../../services/studentService'
import { itemService } from '../../services/itemService'
import { useCart } from '../../context/CartContext'
import LoadingSpinner from '../Common/LoadingSpinner'
import { formatCurrency, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const StudentProfile = () => {
  const { studentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { addItem, items: cartItems } = useCart()
  
  const [selectedCategory, setSelectedCategory] = useState('')
  const [quantities, setQuantities] = useState({})

  const studentData = location.state?.studentData
  const accessType = location.state?.accessType

  const { data: availableItems, isLoading: itemsLoading } = useQuery(
    ['availableItems', selectedCategory],
    () => itemService.getAvailableItems(selectedCategory)
  )

  const { data: student, isLoading: studentLoading } = useQuery(
    ['student', studentId],
    () => studentService.getStudentById(studentId),
    { 
      initialData: studentData,
      enabled: !studentData 
    }
  )

  useEffect(() => {
    if (student && !location.state?.studentData) {
      // If we don't have student data from access, redirect back to access page
      navigate('/dashboard/student-access')
    }
  }, [student, location.state, navigate])

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }))
  }

  const handleAddToCart = (item) => {
    const quantity = quantities[item._id] || 1
    if (quantity <= 0) {
      toast.error('Please select a quantity')
      return
    }

    if (quantity > item.maxQuantityPerOrder) {
      toast.error(`Maximum ${item.maxQuantityPerOrder} items allowed per order`)
      return
    }

    addItem({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity,
      category: item.category,
      maxQuantity: item.maxQuantityPerOrder
    })

    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [item._id]: 0
    }))
  }

  const getCartQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  if (studentLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-warning-500 mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          Student Not Found
        </h3>
        <p className="text-secondary-600 mb-4">
          Unable to load student profile. Please try again.
        </p>
        <button
          onClick={() => navigate('/dashboard/student-access')}
          className="btn-primary"
        >
          Back to Student Access
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/student-access')}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Student Profile</h1>
            <p className="text-secondary-600">
              {accessType === 'master' ? 'Accessed via Master Key' : 'Accessed via Student Key'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/dashboard/order-history/${studentId}`)}
            className="btn-secondary inline-flex items-center"
          >
            <History className="h-4 w-4 mr-2" />
            Order History
          </button>
          <button
            onClick={() => navigate('/dashboard/cart')}
            className="btn-primary inline-flex items-center"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart ({cartItems.length})
          </button>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-secondary-900">{student.name}</h2>
              <p className="text-secondary-600">{student.rollNumber}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                <span>Room: {student.roomNumber}</span>
                <span>Year: {student.year}</span>
                <span>Phone: {student.phoneNumber}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-secondary-600">Current Balance</div>
              <div className={`text-2xl font-bold ${
                student.balance >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(student.balance)}
              </div>
              <div className="text-sm text-secondary-500 mt-1">
                Total Orders: {student.totalOrders} | Spent: {formatCurrency(student.totalSpent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Warning */}
      {student.balance < 100 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-warning-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-warning-800">Low Balance Warning</h3>
              <p className="text-sm text-warning-700">
                Student has a low balance. Consider adding funds before placing large orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items Section */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900">Available Items</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input w-auto"
              >
                <option value="">All Categories</option>
                <option value="coupon">Coupons</option>
                <option value="extra">Extras</option>
                <option value="snack">Snacks</option>
                <option value="beverage">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {availableItems?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableItems.items.map((item) => {
                const currentQuantity = quantities[item._id] || 0
                const cartQuantity = getCartQuantity(item._id)
                
                return (
                  <div key={item._id} className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-secondary-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className={`badge badge-${getStatusColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-semibold text-secondary-900">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-xs text-secondary-500">
                        Max: {item.maxQuantityPerOrder}
                      </span>
                    </div>

                    {cartQuantity > 0 && (
                      <div className="bg-success-50 border border-success-200 rounded-lg p-2 mb-3">
                        <p className="text-sm text-success-700">
                          {cartQuantity} in cart
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={currentQuantity <= 0}
                          className="p-1 rounded-md border border-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {currentQuantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          disabled={currentQuantity >= item.maxQuantityPerOrder}
                          className="p-1 rounded-md border border-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={currentQuantity <= 0}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No Items Available
              </h3>
              <p className="text-secondary-600">
                {selectedCategory 
                  ? `No items available in the ${selectedCategory} category.`
                  : 'No items are currently available for ordering.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
