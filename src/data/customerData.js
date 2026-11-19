// IBTU Customer Dashboard Data Architecture
// Provides mock orders, addresses, and helper functions for frontend state persistence.

export const initialCustomerProfile = {
  id: 'cust-demo-1',
  firstName: 'Almaz',
  lastName: 'Bekele',
  name: 'Almaz Bekele',
  email: 'almaz.bekele@ibtu.com',
  phone: '+251 91 122 3344',
  role: 'customer',
  avatar: 'AB',
  memberSince: 'January 2026',
}

export const initialCustomerAddresses = [
  {
    id: 'addr-1',
    recipientName: 'Almaz Bekele',
    phone: '+251 91 122 3344',
    addressType: 'Home',
    addressLine1: 'Bole Sub-City, Kebele 03, House #412',
    addressLine2: 'Near Edna Mall, Atlas Area',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    postalCode: '1000',
    country: 'Ethiopia',
    isDefault: true,
  },
  {
    id: 'addr-2',
    recipientName: 'Almaz Bekele',
    phone: '+251 91 122 3344',
    addressType: 'Work',
    addressLine1: 'Kazanchis Business District, Bloom Tower 4th Floor',
    addressLine2: 'Suite 402',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    postalCode: '1000',
    country: 'Ethiopia',
    isDefault: false,
  },
]

export const initialCustomerOrders = [
  {
    id: 'ORD-2026-8841',
    orderNumber: 'IBTU-8841',
    orderDate: '2026-02-14T11:30:00Z',
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Telebirr',
    paymentReference: 'TEL-99238471',
    paymentDate: '2026-02-14T11:32:00Z',
    currency: 'ETB',
    subtotal: 3500,
    discountAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 3500,
    items: [
      {
        id: 'prod-dress-trad',
        name: "Women's Traditional Dress",
        amharicName: 'የሴቶች ባህላዊ ቀሚስ',
        sku: 'IBTU-KEMIS-01',
        size: 'M',
        color: 'Traditional White',
        quantity: 1,
        price: 3500,
        itemTotal: 3500,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        slug: 'womens-traditional-dress',
      },
    ],
    shippingAddress: {
      recipientName: 'Almaz Bekele',
      phone: '+251 91 122 3344',
      addressType: 'Home',
      addressLine1: 'Bole Sub-City, Kebele 03, House #412',
      addressLine2: 'Near Edna Mall, Atlas Area',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      country: 'Ethiopia',
    },
    shipment: {
      trackingNumber: 'ET-POST-44912',
      courierName: 'Ethio Post Express',
      courierPhone: '+251 11 551 0422',
      shipmentStatus: 'Delivered',
      estimatedDelivery: '2026-02-16T17:00:00Z',
      stages: [
        { key: 'placed', label: 'Order Placed', time: 'Feb 14, 2026 • 11:30 AM', completed: true },
        { key: 'confirmed', label: 'Order Confirmed', time: 'Feb 14, 2026 • 11:35 AM', completed: true },
        { key: 'processing', label: 'Artisan Packaging', time: 'Feb 15, 2026 • 09:00 AM', completed: true },
        { key: 'shipped', label: 'Dispatched to Courier', time: 'Feb 15, 2026 • 02:15 PM', completed: true },
        { key: 'in_transit', label: 'In Transit (Addis Hub)', time: 'Feb 16, 2026 • 08:30 AM', completed: true },
        { key: 'out_for_delivery', label: 'Out for Delivery', time: 'Feb 16, 2026 • 11:00 AM', completed: true },
        { key: 'delivered', label: 'Delivered to Recipient', time: 'Feb 16, 2026 • 03:45 PM', completed: true },
      ],
    },
  },
  {
    id: 'ORD-2026-9104',
    orderNumber: 'IBTU-9104',
    orderDate: '2026-02-18T09:15:00Z',
    orderStatus: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'CBE Birr',
    paymentReference: 'CBE-77123984',
    paymentDate: '2026-02-18T09:18:00Z',
    currency: 'ETB',
    subtotal: 2800,
    discountAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 2800,
    items: [
      {
        id: 'prod-hoodie',
        name: "Men's Premium Hoodie",
        amharicName: 'የወንዶች ፕሪሚየም ሁዲ',
        sku: 'IBTU-HOOD-02',
        size: 'L',
        color: 'Forest Green',
        quantity: 1,
        price: 2800,
        itemTotal: 2800,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        slug: 'mens-premium-hoodie',
      },
    ],
    shippingAddress: {
      recipientName: 'Almaz Bekele',
      phone: '+251 91 122 3344',
      addressType: 'Home',
      addressLine1: 'Bole Sub-City, Kebele 03, House #412',
      addressLine2: 'Near Edna Mall, Atlas Area',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      country: 'Ethiopia',
    },
    shipment: {
      trackingNumber: 'IBTU-EXP-8819',
      courierName: 'IBTU Courier Delivery',
      courierPhone: '+251 91 123 4567',
      shipmentStatus: 'Shipped',
      estimatedDelivery: '2026-02-21T18:00:00Z',
      stages: [
        { key: 'placed', label: 'Order Placed', time: 'Feb 18, 2026 • 09:15 AM', completed: true },
        { key: 'confirmed', label: 'Order Confirmed', time: 'Feb 18, 2026 • 09:20 AM', completed: true },
        { key: 'processing', label: 'Packaging Verified', time: 'Feb 18, 2026 • 02:00 PM', completed: true },
        { key: 'shipped', label: 'Shipped via Courier', time: 'Feb 19, 2026 • 08:30 AM', completed: true, current: true },
        { key: 'in_transit', label: 'In Transit', time: 'Pending', completed: false },
        { key: 'out_for_delivery', label: 'Out for Delivery', time: 'Pending', completed: false },
        { key: 'delivered', label: 'Delivered', time: 'Pending', completed: false },
      ],
    },
  },
  {
    id: 'ORD-2026-9320',
    orderNumber: 'IBTU-9320',
    orderDate: '2026-02-19T14:40:00Z',
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Chapa',
    paymentReference: 'CHP-55410928',
    paymentDate: '2026-02-19T14:42:00Z',
    currency: 'ETB',
    subtotal: 4200,
    discountAmount: 200,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 4000,
    items: [
      {
        id: 'prod-dress-festive',
        name: 'Festive Embroidered Habesha Kemis',
        amharicName: 'የበዓል ጥልፍ የሀበሻ ቀሚስ',
        sku: 'IBTU-KEMIS-09',
        size: 'M',
        color: 'Gold & Ivory',
        quantity: 1,
        price: 4200,
        itemTotal: 4200,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        slug: 'festive-embroidered-habesha-kemis',
      },
    ],
    shippingAddress: {
      recipientName: 'Almaz Bekele',
      phone: '+251 91 122 3344',
      addressType: 'Work',
      addressLine1: 'Kazanchis Business District, Bloom Tower 4th Floor',
      addressLine2: 'Suite 402',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      country: 'Ethiopia',
    },
    shipment: null, // Tests missing shipment/tracking state gracefully!
  },
  {
    id: 'ORD-2026-9411',
    orderNumber: 'IBTU-9411',
    orderDate: '2026-02-19T16:00:00Z',
    orderStatus: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentMethod: 'Telebirr',
    paymentReference: 'TEL-88192039',
    paymentDate: '2026-02-19T16:02:00Z',
    currency: 'ETB',
    subtotal: 1800,
    discountAmount: 0,
    shippingCost: 250,
    taxAmount: 0,
    totalAmount: 2050,
    items: [
      {
        id: 'prod-scarf-netela',
        name: 'Handwoven Tibeb Netela Scarf',
        amharicName: 'ባህላዊ የጥበብ ነጠላ ሻርፕ',
        sku: 'IBTU-ACC-03',
        size: 'One Size',
        color: 'Ivory / Red Pattern',
        quantity: 1,
        price: 1800,
        itemTotal: 1800,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
        slug: 'handwoven-tibeb-netela-scarf',
      },
    ],
    shippingAddress: {
      recipientName: 'Almaz Bekele',
      phone: '+251 91 122 3344',
      addressType: 'Home',
      addressLine1: 'Bole Sub-City, Kebele 03, House #412',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      country: 'Ethiopia',
    },
    shipment: {
      trackingNumber: 'CANCELLED',
      courierName: 'N/A',
      courierPhone: 'N/A',
      shipmentStatus: 'Cancelled',
      stages: [
        { key: 'placed', label: 'Order Placed', time: 'Feb 19, 2026 • 04:00 PM', completed: true },
        { key: 'cancelled', label: 'Order Cancelled', time: 'Feb 19, 2026 • 04:30 PM', completed: true, isCancelled: true },
      ],
    },
  },
]

// Helper functions for addresses local persistence
export function getStoredAddresses() {
  try {
    const data = localStorage.getItem('ibtu_customer_addresses')
    return data ? JSON.parse(data) : initialCustomerAddresses
  } catch {
    return initialCustomerAddresses
  }
}

export function saveStoredAddresses(addresses) {
  try {
    localStorage.setItem('ibtu_customer_addresses', JSON.stringify(addresses))
  } catch {
    // ignore
  }
}

// Helper functions for orders local persistence
export function getStoredOrders() {
  try {
    const data = localStorage.getItem('ibtu_customer_orders')
    return data ? JSON.parse(data) : initialCustomerOrders
  } catch {
    return initialCustomerOrders
  }
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem('ibtu_customer_orders', JSON.stringify(orders))
  } catch {
    // ignore
  }
}
