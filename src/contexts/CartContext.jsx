import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const initialState = {
  items: {},
  isOpen: false,
  shippingAddress: '',
  notes: ''
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: {
            ...action.payload,
            quantity: (state.items[action.payload.id]?.quantity || 0) + 1
          }
        }
      }
    
    case 'REMOVE_ITEM':
      const { [action.payload]: removed, ...rest } = state.items
      return { ...state, items: rest }
    
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        const { [action.payload.id]: removed, ...rest } = state.items
        return { ...state, items: rest }
      }
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: {
            ...state.items[action.payload.id],
            quantity: action.payload.quantity
          }
        }
      }
    
    case 'CLEAR_CART':
      return { ...state, items: {} }
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    
    case 'SET_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload }
    
    case 'SET_NOTES':
      return { ...state, notes: action.payload }
    
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Persist cart to localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      Object.keys(parsedCart.items).forEach(key => {
        dispatch({ type: 'ADD_ITEM', payload: parsedCart.items[key] })
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state))
  }, [state])

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const setShippingAddress = (address) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address })
  }

  const setNotes = (notes) => {
    dispatch({ type: 'SET_NOTES', payload: notes })
  }

  const cartItems = Object.values(state.items)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const value = {
    ...state,
    cartItems,
    cartCount,
    cartTotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setShippingAddress,
    setNotes
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
