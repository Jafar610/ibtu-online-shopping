import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ibtu_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [notification, setNotification] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('ibtu_wishlist', JSON.stringify(wishlistItems))
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e)
    }
  }, [wishlistItems])

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr))
    }, 2800)
  }

  const toggleWishlist = (product) => {
    if (!product) return
    const prodId = product.id || product.slug

    setWishlistItems((prev) => {
      const exists = prev.some(
        (item) => String(item.id) === String(prodId) || String(item.slug) === String(prodId)
      )
      if (exists) {
        showNotification(`Removed "${product.name || 'Item'}" from your wishlist`)
        return prev.filter(
          (item) => String(item.id) !== String(prodId) && String(item.slug) !== String(prodId)
        )
      } else {
        showNotification(`Saved "${product.name || 'Item'}" to your wishlist!`)
        return [...prev, product]
      }
    })
  }

  const removeFromWishlist = (productId) => {
    if (!productId) return
    setWishlistItems((prev) => {
      const target = prev.find(
        (item) => String(item.id) === String(productId) || String(item.slug) === String(productId)
      )
      if (target) {
        showNotification(`Removed "${target.name || 'Item'}" from your wishlist`)
      }
      return prev.filter(
        (item) => String(item.id) !== String(productId) && String(item.slug) !== String(productId)
      )
    })
  }

  const isInWishlist = (productId) => {
    if (!productId) return false
    return wishlistItems.some(
      (item) => String(item.id) === String(productId) || String(item.slug) === String(productId)
    )
  }

  const clearWishlist = () => {
    setWishlistItems([])
    showNotification('Cleared all saved items from wishlist')
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        notification,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
