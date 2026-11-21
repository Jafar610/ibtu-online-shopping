import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { getStoredAddresses, getStoredOrders, saveStoredOrders } from '../data/customerData'
import { getStoredAdminCoupons } from '../data/admin/adminAdministrationData'

const CheckoutContext = createContext()

const STORAGE_KEY_SHIPPING = 'ibtu_checkout_shipping'
const STORAGE_KEY_PAYMENT = 'ibtu_checkout_payment'
const STORAGE_KEY_COUPON = 'ibtu_checkout_coupon'

// Mock coupon dataset for frontend validation demonstration
const MOCK_COUPONS = {
  HABESHA10: {
    code: 'HABESHA10',
    type: 'percent',
    value: 10,
    description: '10% Ethiopian Heritage Discount',
  },
  IBTU2026: {
    code: 'IBTU2026',
    type: 'fixed',
    value: 200,
    description: '200 ETB New Season Voucher',
  },
}

export function CheckoutProvider({ children }) {
  // 1. Shipping Address State
  const [shippingAddress, setShippingAddressState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHIPPING)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    // Fallback to default address from stored customer addresses
    const storedAddresses = getStoredAddresses()
    const defaultAddr = storedAddresses.find((a) => a.isDefault) || storedAddresses[0]
    return defaultAddr || null
  })

  // 2. Payment Method State: 'telebirr' | 'cbe_birr' | 'bank_transfer' | 'cod'
  const [paymentMethod, setPaymentMethodState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYMENT)
      if (saved) return saved
    } catch {
      // ignore
    }
    return 'telebirr'
  })

  // 3. Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUPON)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return null
  })

  // 4. Receipt Upload State (for Telebirr / CBE Birr / Bank Transfer proof)
  const [receiptFile, setReceiptFile] = useState(null) // { name, size, previewUrl }

  // 5. Temporary Latest Placed Order
  const [latestOrder, setLatestOrder] = useState(null)

  // Persist shipping address
  const setShippingAddress = (addr) => {
    setShippingAddressState(addr)
    try {
      if (addr) {
        localStorage.setItem(STORAGE_KEY_SHIPPING, JSON.stringify(addr))
      } else {
        localStorage.removeItem(STORAGE_KEY_SHIPPING)
      }
    } catch {
      // ignore
    }
  }

  // Persist payment method
  const setPaymentMethod = (method) => {
    setPaymentMethodState(method)
    try {
      localStorage.setItem(STORAGE_KEY_PAYMENT, method)
    } catch {
      // ignore
    }
  }

  // Coupon handlers
  const applyCoupon = (rawCode) => {
    if (!rawCode || !rawCode.trim()) {
      return { success: false, message: 'Please enter a coupon code.' }
    }
    const cleanCode = rawCode.trim().toUpperCase()

    // 1. Check live admin coupon store first
    try {
      const adminCoupons = getStoredAdminCoupons()
      const found = adminCoupons.find((c) => c.code.toUpperCase() === cleanCode)
      if (found) {
        if (!found.isActive) {
          return { success: false, message: `Coupon "${found.code}" is currently inactive.` }
        }
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        if (found.expirationDate && new Date(found.expirationDate) < now) {
          return { success: false, message: `Coupon "${found.code}" expired on ${found.expirationDate}.` }
        }

        const couponObj = {
          code: found.code,
          type: found.type,
          value: found.value,
          minOrderAmount: found.minOrderAmount || 0,
          maxDiscountAmount: found.maxDiscountAmount || null,
          description: found.description || `${found.value}${found.type === 'percent' ? '%' : ' ETB'} off`,
        }

        setAppliedCoupon(couponObj)
        try {
          localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(couponObj))
        } catch {
          // ignore
        }
        return {
          success: true,
          message: `Coupon "${found.code}" applied! (${couponObj.description})`,
        }
      }
    } catch (e) {
      console.warn('Error reading stored coupons during checkout validation', e)
    }

    // 2. Fallback to hardcoded mock coupons if store lookup unavailable
    const coupon = MOCK_COUPONS[cleanCode]
    if (coupon) {
      setAppliedCoupon(coupon)
      try {
        localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(coupon))
      } catch {
        // ignore
      }
      return {
        success: true,
        message: `Coupon "${coupon.code}" applied! (${coupon.description})`,
      }
    }

    return {
      success: false,
      message: 'Invalid coupon code. Try "HABESHA10" for 10% off or "IBTU2026" for 200 ETB off.',
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    try {
      localStorage.removeItem(STORAGE_KEY_COUPON)
    } catch {
      // ignore
    }
  }

  // Calculate pricing breakdown based on cart subtotal
  const calculateTotals = (subtotal = 0) => {
    const freeShippingThreshold = 2000
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 150

    let discountAmount = 0
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        discountAmount = Math.round((subtotal * appliedCoupon.value) / 100)
      } else if (appliedCoupon.type === 'fixed') {
        discountAmount = Math.min(subtotal, appliedCoupon.value)
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee)

    return {
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      isFreeShipping: shippingFee === 0,
    }
  }

  // Place order: records order snapshot into stored orders and returns created order
  const createOrder = ({ cartItems, subtotal, customerUser }) => {
    const { shippingFee, discountAmount, totalAmount } = calculateTotals(subtotal)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `IBTU-${randomSuffix}`
    const orderId = `ORD-2026-${randomSuffix}`
    const nowIso = new Date().toISOString()

    const paymentMethodLabels = {
      telebirr: 'Telebirr',
      cbe_birr: 'CBE Birr',
      bank_transfer: 'Bank Transfer (CBE)',
      cod: 'Cash on Delivery (COD)',
    }

    const paymentStatusMap = {
      cod: 'Unpaid',
      telebirr: 'Pending',
      cbe_birr: 'Pending',
      bank_transfer: 'Pending',
    }

    const newOrder = {
      id: orderId,
      orderNumber,
      orderDate: nowIso,
      orderStatus: 'Pending',
      paymentStatus: paymentStatusMap[paymentMethod] || 'Pending',
      paymentMethod: paymentMethodLabels[paymentMethod] || 'Telebirr',
      paymentReference:
        paymentMethod === 'cod'
          ? 'COD-PAY-ON-DELIVERY'
          : `TXN-${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      paymentDate: null,
      currency: 'ETB',
      subtotal,
      discountAmount,
      shippingCost: shippingFee,
      taxAmount: 0, // VAT 15% inclusive in item prices
      totalAmount,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        amharicName: item.amharicName || null,
        sku: item.sku || `IBTU-SKU-${item.id?.slice(0, 5) || '01'}`,
        size: item.size || 'Standard',
        color: item.color || 'Default',
        quantity: item.quantity,
        price: item.price,
        itemTotal: item.price * item.quantity,
        image: item.image,
        slug: item.slug || item.id,
      })),
      shippingAddress: shippingAddress || {
        recipientName: customerUser?.name || 'Valued Customer',
        phone: customerUser?.phone || '+251 91 122 3344',
        addressType: 'Home',
        addressLine1: 'Bole Sub-City, Kebele 03',
        addressLine2: '',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        country: 'Ethiopia',
      },
      shipment: {
        trackingNumber: `ET-POST-${Date.now().toString().slice(-5)}`,
        courierName: 'Ethio Post Express',
        courierPhone: '+251 11 551 0422',
        shipmentStatus: 'Processing',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        stages: [
          {
            key: 'placed',
            label: 'Order Placed',
            time: 'Just now',
            completed: true,
          },
          {
            key: 'confirmed',
            label: 'Order Review',
            time: 'Pending payment confirmation',
            completed: false,
            current: true,
          },
          {
            key: 'processing',
            label: 'Artisan Packaging',
            time: 'Upcoming',
            completed: false,
          },
          {
            key: 'shipped',
            label: 'Handed to Courier',
            time: 'Upcoming',
            completed: false,
          },
          {
            key: 'delivered',
            label: 'Delivered',
            time: 'Estimated 2-3 business days',
            completed: false,
          },
        ],
      },
    }

    // Save to customer order history in customerData
    const existingOrders = getStoredOrders()
    const updatedOrders = [newOrder, ...existingOrders]
    saveStoredOrders(updatedOrders)

    setLatestOrder(newOrder)
    try {
      sessionStorage.setItem('ibtu_latest_order', JSON.stringify(newOrder))
    } catch {
      // ignore
    }

    return newOrder
  }

  const resetCheckout = () => {
    setReceiptFile(null)
    setAppliedCoupon(null)
    try {
      localStorage.removeItem(STORAGE_KEY_COUPON)
    } catch {
      // ignore
    }
  }

  return (
    <CheckoutContext.Provider
      value={{
        shippingAddress,
        setShippingAddress,
        paymentMethod,
        setPaymentMethod,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        receiptFile,
        setReceiptFile,
        calculateTotals,
        createOrder,
        latestOrder,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
