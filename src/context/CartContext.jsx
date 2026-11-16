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
    }, 2800)
  }

  const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!product) return
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard'
    const color = selectedColor || (product.colors && product.colors[0]) || 'Default'
    const itemKey = `${product.id || product.slug}-${size}-${color}`
    const stockLimit = product.stockCount || 50

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.key === itemKey)
      if (existingIndex > -1) {
        const updated = [...prevItems]
        const currentQty = updated[existingIndex].quantity
        const newQty = Math.min(currentQty + quantity, stockLimit)
        if (newQty === currentQty && currentQty >= stockLimit) {
          showNotification(`Maximum stock reached (${stockLimit} items).`)
          return prevItems
        }
        updated[existingIndex].quantity = newQty
        return updated
      }
      return [
        ...prevItems,
        {
          key: itemKey,
          id: product.id,
          slug: product.slug || product.id,
          name: product.name,
          amharicName: product.amharicName,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          size,
          color,
          quantity: Math.min(quantity, stockLimit),
          stockCount: stockLimit,
        },
      ]
    })

    showNotification(`Added "${product.name}" to your shopping bag!`)
    setIsCartOpen(true)
  }

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.key === itemKey)
      if (item) {
        showNotification(`Removed "${item.name}" from your bag`)
      }
      return prev.filter((i) => i.key !== itemKey)
    })
  }

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity < 1) {
      return // Prevent quantity from going below 1
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.key === itemKey) {
          const maxStock = item.stockCount || 50
          if (newQuantity > maxStock) {
            showNotification(`Only ${maxStock} items available in stock.`)
            return { ...item, quantity: maxStock }
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
    showNotification('Cleared your shopping bag')
  }

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
        showNotification,
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
