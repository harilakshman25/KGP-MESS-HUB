import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { orderService } from '../../services/orderService'
import LoadingSpinner from '../Common/LoadingSpinner'
import Modal from '../Common/Modal'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Cart = () => {
  const navigate = useNavigate()
  const { 
    items, 
    totalAmount, 
    studentId, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCart()
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handlePlaceOrder = async () => {
    if (!studentId) {
      toast.error('Please select a student first')
      return
    }

    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setIsPlacingOrder(true)
    try {
      const orderData = {
        studentId,
        items: items.map(item => ({
          item: item.id,
          quantity: item.quantity
        }))
      }

      const response = await orderService.createOrder(orderData)
      
      toast.success('Order placed successfully!')
      clearCart()
      setShowConfirmModal(false)
      
      // Navigate to order history or back to student profile
      navigate(`/dashboard/order-history/${studentId}`)
    } catch (error) {
      toast.error('Failed to place order')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (!studentId) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          No Student Selected
        </h3>
        <p className="text-secondary-600 mb-4">
          Please select a student to start adding items to cart.
        </p>
        <button
          onClick={() => navigate('/dashboard/student-access')}
          className="btn-primary"
        >
          Select Student
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
            onClick={() => navigate(-1)}
            className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Shopping Cart</h1>
            <p className="text-secondary-600">
              {items.length} item{items.length !== 1 ? 's' : ''} in cart
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="btn-secondary inline-flex items-center text-danger-600 hover:text-danger-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-soft">
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-secondary-600 mb-4">
              Add some items to get started with your order.
            </p>
            <button
              onClick={() => navigate('/dashboard/student-access')}
              className="btn-primary"
            >
              Browse Items
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-soft p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-secondary-900">{item.name}</h3>
                    <p className="text-sm text-secondary-600 capitalize">{item.category}</p>
                    <p className="text-lg font-semibold text-secondary-900 mt-1">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        className="p-1 rounded-md border border-secondary-300 hover:bg-secondary-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="p-1 rounded-md border border-secondary-300 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-secondary-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-secondary-400 hover:text-danger-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {item.quantity >= item.maxQuantity && (
                  <div className="mt-3 bg-warning-50 border border-warning-200 rounded-lg p-2">
                    <p className="text-sm text-warning-700">
                      Maximum quantity ({item.maxQuantity}) reached for this item.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-secondary-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-secondary-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-secondary-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="btn-primary w-full inline-flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Place Order
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/dashboard/student-access')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Order"
      >
        <div className="space-y-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="font-medium text-secondary-900 mb-2">Order Summary</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-secondary-200 mt-3 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-warning-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-warning-700">
                  <strong>Important:</strong> This amount will be deducted from the student's balance. 
                  Please confirm that the student has authorized this purchase.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-secondary"
              disabled={isPlacingOrder}
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="btn-primary"
            >
              {isPlacingOrder ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Placing Order...</span>
                </>
              ) : (
                'Confirm Order'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Cart
