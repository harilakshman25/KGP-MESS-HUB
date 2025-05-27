import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const initialState = {
  items: [],
  studentId: null,
  totalAmount: 0,
  isOpen: false,
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STUDENT':
      return {
        ...state,
        studentId: action.payload,
        items: [], // Clear cart when switching students
        totalAmount: 0,
      }
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      )
      
      let newItems
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
      } else {
        // Add new item
        newItems = [...state.items, action.payload]
      }
      
      const totalAmount = newItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      )
      
      return {
        ...state,
        items: newItems,
        totalAmount,
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const totalAmount = newItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      )
      
      return {
        ...state,
        items: newItems,
        totalAmount,
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)
      
      const totalAmount = newItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      )
      
      return {
        ...state,
        items: newItems,
        totalAmount,
      }
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
      }
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    
    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      }
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        if (cartData.studentId) {
          dispatch({ type: 'SET_STUDENT', payload: cartData.studentId })
          cartData.items.forEach(item => {
            dispatch({ type: 'ADD_ITEM', payload: item })
          })
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.studentId) {
      localStorage.setItem('cart', JSON.stringify({
        studentId: state.studentId,
        items: state.items,
      }))
    }
  }, [state.items, state.studentId])

  const setStudent = (studentId) => {
    dispatch({ type: 'SET_STUDENT', payload: studentId })
  }

  const addItem = (item) => {
    if (!state.studentId) {
      toast.error('Please select a student first')
      return
    }
    
    dispatch({ type: 'ADD_ITEM', payload: item })
    toast.success(`${item.name} added to cart`)
  }

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    localStorage.removeItem('cart')
    toast.success('Cart cleared')
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const setCartOpen = (isOpen) => {
    dispatch({ type: 'SET_CART_OPEN', payload: isOpen })
  }

  const getItemCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const value = {
    ...state,
    setStudent,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    getItemCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
