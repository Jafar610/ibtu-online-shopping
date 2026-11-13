import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ibtu_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('ibtu_cart', JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }, [cartItems])

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr))
    }, 3000)
  }

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard'
    const color = selectedColor || (product.colors && product.colors[0]) || 'Default'
    const itemKey = `${product.id}-${size}-${color}`

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.key === itemKey)
      if (existingIndex > -1) {
        const updated = [...prevItems]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [
        ...prevItems,
        {
          key: itemKey,
          id: product.id,
          name: product.name,
          amharicName: product.amharicName,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          size,
          color,
          quantity,
        },
      ]
    })

    showNotification(`Added "${product.name}" to your shopping bag!`)
    setIsCartOpen(true)
  }

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((item) => item.key !== itemKey))
  }

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey)
      return
    }
    setCartItems((prev) =>
      prev.map((item) => (item.key === itemKey ? { ...item, quantity: newQuantity } : item))
    )
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const freeShippingThreshold = 2000
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        freeShippingThreshold,
        progressToFreeShipping,
        remainingForFreeShipping,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        notification,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

