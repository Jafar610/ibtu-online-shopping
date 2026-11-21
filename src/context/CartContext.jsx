/**
 * IBTU E-Commerce Frontend
 * src/context/CartContext.jsx
 *
 * Real Backend-Integrated Cart Context:
 *  - Communicates directly with Node.js/Express cart API (cartApi.js)
 *  - Supports guest cart tokens and authenticated customer carts
 *  - Merges guest cart automatically upon login / registration
 *  - Authoritative backend calculations for subtotals, item totals, and stock limits
 *  - Shared single source of truth across Navbar count, Cart Drawer, Cart Page, and Product Details
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import cartApi from '../services/api/cartApi'
import { productApi } from '../services/api/productApi'
import { CART_STORAGE_KEYS } from '../config/apiConfig'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user, isAuthenticated, isInitializing: isAuthInitializing } = useAuth()

  const [cart, setCart] = useState({
    id: null,
    items: [],
    subtotal: 0,
    total_items: 0,
    item_count: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  const prevUserRef = useRef(null)
  const initialLoadRef = useRef(false)

  const showNotification = useCallback((message) => {
    setNotification(message)
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr))
    }, 3000)
  }, [])

  // 1. Initial Cart Load & Guest Cart Merge on Auth Change
  useEffect(() => {
    if (isAuthInitializing) return

    let isMounted = true

    async function syncCart() {
      setIsLoading(true)
      setError(null)

      try {
        const guestToken = localStorage.getItem(CART_STORAGE_KEYS.GUEST_TOKEN)

        // Case A: User is authenticated and a guest token exists -> MERGE
        if (isAuthenticated && user?.id && guestToken) {
          try {
            const res = await cartApi.mergeGuestCart(guestToken)
            if (isMounted && res.data) {
              setCart(res.data)
            }
          } catch (mergeErr) {
            console.warn('Cart merge failed; falling back to retrieving customer cart:', mergeErr)
            const res = await cartApi.getCart()
            if (isMounted && res.data) {
              setCart(res.data)
            }
          }
        } else {
          // Case B: Regular cart fetch (either authenticated customer or guest)
          const res = await cartApi.getCart()
          if (isMounted && res.data) {
            setCart(res.data)
          }
        }

        // Clean up legacy mock cart localStorage key safely after backend cart is initialized
        try {
          localStorage.removeItem('ibtu_cart')
        } catch {
          // ignore
        }
      } catch (err) {
        console.error('Failed to load cart from backend:', err)
        if (isMounted) {
          setError(err.message || 'Failed to load shopping cart.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          initialLoadRef.current = true
        }
      }
    }

    const currentUserId = user ? user.id : null
    const userChanged = prevUserRef.current !== currentUserId
    if (!initialLoadRef.current || userChanged) {
      prevUserRef.current = currentUserId
      syncCart()
    }
  }, [isAuthInitializing, isAuthenticated, user])

  // Helper to resolve variant ID
  const resolveVariantId = async (product, selectedSize, selectedColor) => {
    if (!product) return null

    // 1. Explicit variant ID on product or selectedVariant
    if (product.selectedVariant?.id) return product.selectedVariant.id
    if (product.variant_id) return product.variant_id
    if (product.variantId) return product.variantId

    // 2. Variants list attached to product
    let variants = product.variants
    if ((!variants || variants.length === 0) && (product.id || product.slug)) {
      try {
        const details = await productApi.getProductDetails(product.slug || product.id)
        if (details?.variants?.length > 0) {
          variants = details.variants
        }
      } catch (err) {
        console.warn('Could not fetch product details to resolve variant:', err)
      }
    }

    if (!variants || variants.length === 0) {
      return null
    }

    // Try to match both size & color
    if (selectedSize && selectedColor) {
      const match = variants.find(
        (v) =>
          (!v.size || v.size === selectedSize) &&
          (!v.color || v.color.toLowerCase() === selectedColor.toLowerCase())
      )
      if (match) return match.id
    }

    // Try to match size only
    if (selectedSize) {
      const match = variants.find((v) => !v.size || v.size === selectedSize)
      if (match) return match.id
    }

    // Try to match color only
    if (selectedColor) {
      const match = variants.find((v) => !v.color || v.color.toLowerCase() === selectedColor.toLowerCase())
      if (match) return match.id
    }

    // Fallback: first variant with available quantity, or first variant overall
    const inStockVariant = variants.find((v) => (v.available_quantity ?? v.stockQuantity ?? 1) > 0)
    return inStockVariant ? inStockVariant.id : variants[0].id
  }

  // 2. Add Item to Cart
  const addToCart = async (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!product) return
    setIsUpdating(true)
    setError(null)

    try {
      const variantId = await resolveVariantId(product, selectedSize, selectedColor)
      if (!variantId) {
        showNotification('Unable to add item: product variant could not be resolved.')
        return
      }

      const res = await cartApi.addItem(variantId, quantity)
      if (res.data) {
        setCart(res.data)
        showNotification(`Added "${product.name || 'item'}" to your shopping bag!`)
        setIsCartOpen(true)
      }
    } catch (err) {
      console.error('Failed to add item to cart:', err)
      const msg = err.message || 'Could not add item to cart.'
      showNotification(msg)
      setError(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  // 3. Update Cart Item Quantity
  const updateQuantity = async (itemKeyOrId, newQuantity) => {
    const qty = parseInt(newQuantity, 10)
    if (isNaN(qty) || qty < 1) return

    const item = cart.items.find(
      (i) => String(i.key) === String(itemKeyOrId) || String(i.id) === String(itemKeyOrId)
    )
    if (!item) return

    setIsUpdating(true)
    setError(null)

    try {
      const res = await cartApi.updateQuantity(item.id, qty)
      if (res.data) {
        setCart(res.data)
      }
    } catch (err) {
      console.error('Failed to update cart quantity:', err)
      const msg = err.message || 'Failed to update quantity.'
      showNotification(msg)
      setError(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  // 4. Remove Item from Cart
  const removeFromCart = async (itemKeyOrId) => {
    const item = cart.items.find(
      (i) => String(i.key) === String(itemKeyOrId) || String(i.id) === String(itemKeyOrId)
    )
    if (!item) return

    setIsUpdating(true)
    setError(null)

    try {
      const res = await cartApi.removeItem(item.id)
      if (res.data) {
        setCart(res.data)
        showNotification(`Removed "${item.name}" from your bag`)
      }
    } catch (err) {
      console.error('Failed to remove item from cart:', err)
      const msg = err.message || 'Failed to remove item from cart.'
      showNotification(msg)
      setError(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  // 5. Clear All Items from Cart
  const clearCart = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      const res = await cartApi.clearCart()
      if (res.data) {
        setCart(res.data)
        showNotification('Cleared your shopping bag')
      }
    } catch (err) {
      console.error('Failed to clear cart:', err)
      const msg = err.message || 'Failed to clear cart.'
      showNotification(msg)
      setError(msg)
    } finally {
      setIsUpdating(false)
    }
  }

  // 6. Refresh Cart from Server
  const refreshCart = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await cartApi.getCart()
      if (res.data) {
        setCart(res.data)
      }
    } catch (err) {
      console.error('Failed to refresh cart:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cartItems = cart.items
  const totalItems = cart.total_items
  const subtotal = cart.subtotal
  const freeShippingThreshold = 2000
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        totalItems,
        subtotal,
        freeShippingThreshold,
        progressToFreeShipping,
        remainingForFreeShipping,
        isLoading,
        isUpdating,
        error,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
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
