// IBTU Admin Sales Data Architecture: Orders, Payments, and Shipments
// Frontend mock state persistence adhering strictly to Phase 5 - Step 8.3 (frontendInt10.md).
// All data structures maintain relational consistency across orders, payments, and shipments.

export const IS_SALES_MOCK_DATA = true
export const MOCK_SALES_NOTICE =
  'Frontend Mock State: These order, payment, and shipment records and actions are simulated in frontend storage and do not alter actual MariaDB database tables or call real payment/courier APIs.'

// 1. Initial Mock Orders Dataset
export const initialAdminOrders = [
  {
    id: 'ORD-2026-9901',
    orderNumber: 'IBTU-9901',
    orderDate: '2026-03-01T14:20:00Z',
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Telebirr',
    paymentReference: 'TEL-99238471',
    paymentId: 'PAY-2026-001',
    currency: 'ETB',
    subtotal: 7200,
    discountAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 7200,
    customer: {
      id: 'cust-101',
      name: 'Yordanos Assefa',
      email: 'yordanos.a@gmail.com',
      phone: '+251 91 144 5566',
      avatar: 'YA',
      accountType: 'Registered Customer',
      memberSince: 'January 2026',
    },
    items: [
      {
        id: 'prod-dress-gondar',
        name: 'Royal Gondar Habesha Kemis',
        amharicName: 'የጎንደር ንጉሳዊ ቀሚስ',
        sku: 'IBTU-KEM-01-M',
        size: 'M',
        color: 'Pure White & Gold',
        quantity: 1,
        price: 4500,
        discount: 0,
        itemTotal: 4500,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        slug: 'royal-gondar-habesha-kemis',
      },
      {
        id: 'prod-scarf-tilf',
        name: 'Authentic Handwoven Tilf Netela',
        amharicName: 'የጥበብ ጥልፍ ነጠላ',
        sku: 'IBTU-NET-03-OS',
        size: 'One Size',
        color: 'Ivory / Red Gold',
        quantity: 1,
        price: 2700,
        discount: 0,
        itemTotal: 2700,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
        slug: 'authentic-handwoven-tilf-netela',
      },
    ],
    shippingAddress: {
      recipientName: 'Yordanos Assefa',
      phone: '+251 91 144 5566',
      addressType: 'Home',
      addressLine1: 'Bole Sub-City, Kebele 03, House #104',
      addressLine2: 'Behind Medhane Alem Cathedral',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    notes: {
      customerNotes: 'Please call recipient 30 minutes before delivery.',
      adminNotes: 'Artisan embroidery inspected. Handed over to packaging station.',
    },
    shipmentId: 'SHP-2026-001',
    createdAt: '2026-03-01T14:20:00Z',
    updatedAt: '2026-03-01T15:10:00Z',
  },
  {
    id: 'ORD-2026-9902',
    orderNumber: 'IBTU-9902',
    orderDate: '2026-03-01T11:15:00Z',
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'CBE Birr',
    paymentReference: 'CBE-77123984',
    paymentId: 'PAY-2026-002',
    currency: 'ETB',
    subtotal: 3500,
    discountAmount: 0,
    shippingCost: 150,
    taxAmount: 0,
    totalAmount: 3650,
    customer: {
      id: 'cust-102',
      name: 'Dawit Mengistu',
      email: 'dawit.m@yahoo.com',
      phone: '+251 92 331 8899',
      avatar: 'DM',
      accountType: 'Registered Customer',
      memberSince: 'February 2026',
    },
    items: [
      {
        id: 'prod-shirt-tibeb',
        name: 'Modern Tibeb Embroidered Shirt',
        amharicName: 'ዘመናዊ ጥበብ ሸሚዝ',
        sku: 'IBTU-SHT-02-L',
        size: 'L',
        color: 'Off-White',
        quantity: 1,
        price: 3500,
        discount: 0,
        itemTotal: 3500,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        slug: 'modern-tibeb-embroidered-shirt',
      },
    ],
    shippingAddress: {
      recipientName: 'Dawit Mengistu',
      phone: '+251 92 331 8899',
      addressType: 'Work',
      addressLine1: 'Kazanchis, Bloom Tower 5th Floor',
      addressLine2: 'Office #504',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    notes: {
      customerNotes: 'Deliver during office hours 9 AM - 5 PM.',
      adminNotes: 'Customer uploaded CBE Birr transfer screenshot. Awaiting admin review.',
    },
    shipmentId: null,
    createdAt: '2026-03-01T11:15:00Z',
    updatedAt: '2026-03-01T11:20:00Z',
  },
  {
    id: 'ORD-2026-9903',
    orderNumber: 'IBTU-9903',
    orderDate: '2026-02-28T16:45:00Z',
    orderStatus: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    paymentReference: 'BNK-CBE-991204',
    paymentId: 'PAY-2026-003',
    currency: 'ETB',
    subtotal: 12000,
    discountAmount: 600,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 11400,
    customer: {
      id: 'cust-103',
      name: 'Tigist Hailu',
      email: 'tigist.h@outlook.com',
      phone: '+251 91 220 3311',
      avatar: 'TH',
      accountType: 'VIP Customer',
      memberSince: 'December 2025',
    },
    items: [
      {
        id: 'prod-dress-axum',
        name: 'Axum Heritage Ceremonial Gown',
        amharicName: 'የአክሱም ባህላዊ የክብር ቀሚስ',
        sku: 'IBTU-AXM-01-M',
        size: 'M',
        color: 'Ivory & Crimson Tibeb',
        quantity: 2,
        price: 5200,
        discount: 600,
        itemTotal: 9800,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        slug: 'axum-heritage-ceremonial-gown',
      },
      {
        id: 'prod-acc-necklace',
        name: 'Handcrafted Ethiopian Cross Necklace',
        amharicName: 'ባህላዊ የብር መስቀል ሀብል',
        sku: 'IBTU-JWL-05-SLV',
        size: 'Standard',
        color: 'Antique Silver',
        quantity: 1,
        price: 1600,
        discount: 0,
        itemTotal: 1600,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        slug: 'handcrafted-ethiopian-cross-necklace',
      },
    ],
    shippingAddress: {
      recipientName: 'Tigist Hailu',
      phone: '+251 91 220 3311',
      addressType: 'Home',
      addressLine1: 'Old Airport Residential Quarter',
      addressLine2: 'Villa 18, Near Golf Club',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    notes: {
      customerNotes: 'Package with gift ribbon please.',
      adminNotes: 'Bank deposit verified on CBE statement. Dispatched via Ethio Post.',
    },
    shipmentId: 'SHP-2026-002',
    createdAt: '2026-02-28T16:45:00Z',
    updatedAt: '2026-03-01T08:30:00Z',
  },
  {
    id: 'ORD-2026-9904',
    orderNumber: 'IBTU-9904',
    orderDate: '2026-02-28T09:30:00Z',
    orderStatus: 'Confirmed',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash on Delivery',
    paymentReference: 'COD-PAY-9904',
    paymentId: 'PAY-2026-004',
    currency: 'ETB',
    subtotal: 2800,
    discountAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 2800,
    customer: {
      id: 'cust-104',
      name: 'Kassahun Tadesse',
      email: 'kassa.t@gmail.com',
      phone: '+251 93 450 1122',
      avatar: 'KT',
      accountType: 'Registered Customer',
      memberSince: 'January 2026',
    },
    items: [
      {
        id: 'prod-hoodie-forest',
        name: "Men's Habesha Hoodie",
        amharicName: 'የወንዶች ሀበሻ ሁዲ',
        sku: 'IBTU-HOD-04-XL',
        size: 'XL',
        color: 'Forest Green',
        quantity: 1,
        price: 2800,
        discount: 0,
        itemTotal: 2800,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        slug: 'mens-habesha-hoodie',
      },
    ],
    shippingAddress: {
      recipientName: 'Kassahun Tadesse',
      phone: '+251 93 450 1122',
      addressType: 'Home',
      addressLine1: 'Sarbet Area, Next to Adams Pavilion',
      addressLine2: 'Apartment 3B',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    notes: {
      customerNotes: 'Will pay cash in exact change.',
      adminNotes: 'Customer confirmed phone contact. Ready for fulfillment dispatch.',
    },
    shipmentId: null,
    createdAt: '2026-02-28T09:30:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
  },
  {
    id: 'ORD-2026-9905',
    orderNumber: 'IBTU-9905',
    orderDate: '2026-02-27T18:05:00Z',
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Telebirr',
    paymentReference: 'TEL-88192039',
    paymentId: 'PAY-2026-005',
    currency: 'ETB',
    subtotal: 6300,
    discountAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 6300,
    customer: {
      id: 'cust-105',
      name: 'Bethlehem Girma',
      email: 'beth.girma@gmail.com',
      phone: '+251 91 199 8877',
      avatar: 'BG',
      accountType: 'Registered Customer',
      memberSince: 'January 2026',
    },
    items: [
      {
        id: 'prod-dress-modern-tilf',
        name: 'Contemporary Tilf Kemis',
        amharicName: 'ዘመናዊ ጥልፍ ቀሚስ',
        sku: 'IBTU-KEM-07-S',
        size: 'S',
        color: 'Pure White',
        quantity: 1,
        price: 6300,
        discount: 0,
        itemTotal: 6300,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        slug: 'contemporary-tilf-kemis',
      },
    ],
    shippingAddress: {
      recipientName: 'Bethlehem Girma',
      phone: '+251 91 199 8877',
      addressType: 'Home',
      addressLine1: 'Gerji Imperial, Behind Jackros Building',
      addressLine2: 'House 55',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    notes: {
      customerNotes: 'Delivered successfully.',
      adminNotes: 'Signed by recipient on Feb 29.',
    },
    shipmentId: 'SHP-2026-003',
    createdAt: '2026-02-27T18:05:00Z',
    updatedAt: '2026-02-29T16:00:00Z',
  },
  {
    id: 'ORD-2026-9906',
    orderNumber: 'IBTU-9906',
    orderDate: '2026-02-26T10:15:00Z',
    orderStatus: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentMethod: 'Telebirr',
    paymentReference: 'TEL-77441199',
    paymentId: 'PAY-2026-006',
    currency: 'ETB',
    subtotal: 4200,
    discountAmount: 200,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 4000,
    customer: {
      id: 'cust-106',
      name: 'Solomon Demissie',
      email: 'solo.demissie@gmail.com',
      phone: '+251 91 334 4556',
      avatar: 'SD',
      accountType: 'Registered Customer',
      memberSince: 'February 2026',
    },
    items: [
      {
        id: 'prod-suit-habesha',
        name: 'Artisan Tailored Habesha Suit',
        amharicName: 'የባህል ልብስ ሙሉ ሱፍ',
        sku: 'IBTU-SUT-01-L',
        size: 'L',
        color: 'Natural Linen White',
        quantity: 1,
        price: 4200,
        discount: 200,
        itemTotal: 4000,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        slug: 'artisan-tailored-habesha-suit',
      },
    ],
    shippingAddress: {
      recipientName: 'Solomon Demissie',
      phone: '+251 91 334 4556',
      addressType: 'Home',
      addressLine1: 'CMC Michael, Site 2',
      addressLine2: 'Block 12, Unit 4',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    notes: {
      customerNotes: 'Customer requested size modification before dispatch.',
      adminNotes: 'Order cancelled per customer request. Telebirr reversal simulated.',
    },
    shipmentId: null,
    createdAt: '2026-02-26T10:15:00Z',
    updatedAt: '2026-02-26T14:30:00Z',
  },
]

// 2. Initial Mock Payments Dataset
export const initialAdminPayments = [
  {
    id: 'PAY-2026-001',
    paymentReference: 'TEL-99238471',
    orderId: 'ORD-2026-9901',
    orderNumber: 'IBTU-9901',
    customer: {
      name: 'Yordanos Assefa',
      email: 'yordanos.a@gmail.com',
      phone: '+251 91 144 5566',
    },
    paymentMethod: 'Telebirr',
    paymentProvider: 'Ethio Telecom (Telebirr)',
    providerTransactionId: 'TB-ET-992384710',
    amount: 7200,
    currency: 'ETB',
    paymentStatus: 'Paid',
    paymentDate: '2026-03-01T14:22:00Z',
    paidDate: '2026-03-01T14:22:00Z',
    receipt: {
      hasReceipt: true,
      receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-03-01T14:22:00Z',
      reviewStatus: 'approved',
      rejectionReason: null,
      reviewedBy: 'Admin (Simulated)',
      reviewedAt: '2026-03-01T14:25:00Z',
    },
  },
  {
    id: 'PAY-2026-002',
    paymentReference: 'CBE-77123984',
    orderId: 'ORD-2026-9902',
    orderNumber: 'IBTU-9902',
    customer: {
      name: 'Dawit Mengistu',
      email: 'dawit.m@yahoo.com',
      phone: '+251 92 331 8899',
    },
    paymentMethod: 'CBE Birr',
    paymentProvider: 'Commercial Bank of Ethiopia (CBE Birr)',
    providerTransactionId: null,
    amount: 3650,
    currency: 'ETB',
    paymentStatus: 'Pending',
    paymentDate: '2026-03-01T11:18:00Z',
    paidDate: null,
    receipt: {
      hasReceipt: true,
      receiptImage: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-03-01T11:18:00Z',
      reviewStatus: 'pending',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
    },
  },
  {
    id: 'PAY-2026-003',
    paymentReference: 'BNK-CBE-991204',
    orderId: 'ORD-2026-9903',
    orderNumber: 'IBTU-9903',
    customer: {
      name: 'Tigist Hailu',
      email: 'tigist.h@outlook.com',
      phone: '+251 91 220 3311',
    },
    paymentMethod: 'Bank Transfer',
    paymentProvider: 'Commercial Bank of Ethiopia (Direct Account)',
    providerTransactionId: 'FT2605991204',
    amount: 11400,
    currency: 'ETB',
    paymentStatus: 'Paid',
    paymentDate: '2026-02-28T16:50:00Z',
    paidDate: '2026-02-28T17:15:00Z',
    receipt: {
      hasReceipt: true,
      receiptImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-02-28T16:50:00Z',
      reviewStatus: 'approved',
      rejectionReason: null,
      reviewedBy: 'Admin (Simulated)',
      reviewedAt: '2026-02-28T17:15:00Z',
    },
  },
  {
    id: 'PAY-2026-004',
    paymentReference: 'COD-PAY-9904',
    orderId: 'ORD-2026-9904',
    orderNumber: 'IBTU-9904',
    customer: {
      name: 'Kassahun Tadesse',
      email: 'kassa.t@gmail.com',
      phone: '+251 93 450 1122',
    },
    paymentMethod: 'Cash on Delivery',
    paymentProvider: 'IBTU Courier Collection',
    providerTransactionId: null,
    amount: 2800,
    currency: 'ETB',
    paymentStatus: 'Unpaid',
    paymentDate: '2026-02-28T09:30:00Z',
    paidDate: null,
    receipt: {
      hasReceipt: false,
      receiptImage: null,
      submittedAt: null,
      reviewStatus: 'not_required',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
    },
  },
  {
    id: 'PAY-2026-005',
    paymentReference: 'TEL-88192039',
    orderId: 'ORD-2026-9905',
    orderNumber: 'IBTU-9905',
    customer: {
      name: 'Bethlehem Girma',
      email: 'beth.girma@gmail.com',
      phone: '+251 91 199 8877',
    },
    paymentMethod: 'Telebirr',
    paymentProvider: 'Ethio Telecom (Telebirr)',
    providerTransactionId: 'TB-ET-881920391',
    amount: 6300,
    currency: 'ETB',
    paymentStatus: 'Paid',
    paymentDate: '2026-02-27T18:07:00Z',
    paidDate: '2026-02-27T18:08:00Z',
    receipt: {
      hasReceipt: true,
      receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      submittedAt: '2026-02-27T18:07:00Z',
      reviewStatus: 'approved',
      rejectionReason: null,
      reviewedBy: 'Admin (Simulated)',
      reviewedAt: '2026-02-27T18:10:00Z',
    },
  },
  {
    id: 'PAY-2026-006',
    paymentReference: 'TEL-77441199',
    orderId: 'ORD-2026-9906',
    orderNumber: 'IBTU-9906',
    customer: {
      name: 'Solomon Demissie',
      email: 'solo.demissie@gmail.com',
      phone: '+251 91 334 4556',
    },
    paymentMethod: 'Telebirr',
    paymentProvider: 'Ethio Telecom (Telebirr)',
    providerTransactionId: 'TB-ET-774411995',
    amount: 4000,
    currency: 'ETB',
    paymentStatus: 'Refunded',
    paymentDate: '2026-02-26T10:18:00Z',
    paidDate: '2026-02-26T10:19:00Z',
    receipt: {
      hasReceipt: true,
      receiptImage: null,
      submittedAt: '2026-02-26T10:18:00Z',
      reviewStatus: 'approved',
      rejectionReason: null,
      reviewedBy: 'Admin (Simulated)',
      reviewedAt: '2026-02-26T10:20:00Z',
    },
  },
]

// 3. Initial Mock Shipments Dataset
export const initialAdminShipments = [
  {
    id: 'SHP-2026-001',
    shipmentNumber: 'SHP-2026-001',
    orderId: 'ORD-2026-9901',
    orderNumber: 'IBTU-9901',
    customer: {
      name: 'Yordanos Assefa',
      email: 'yordanos.a@gmail.com',
      phone: '+251 91 144 5566',
    },
    shippingAddress: {
      recipientName: 'Yordanos Assefa',
      phone: '+251 91 144 5566',
      addressType: 'Home',
      addressLine1: 'Bole Sub-City, Kebele 03, House #104',
      addressLine2: 'Behind Medhane Alem Cathedral',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    courierName: 'IBTU Direct Logistics',
    courierPhone: '+251 91 100 2233',
    trackingNumber: 'IBTU-EXP-9901',
    shippingCost: 0,
    shipmentStatus: 'Processing',
    estimatedDelivery: '2026-03-03T17:00:00Z',
    shippedDate: null,
    deliveredDate: null,
    deliveryNotes: 'Artisan packaging completed. Scheduled for morning courier dispatch.',
    stages: [
      { key: 'placed', label: 'Order Confirmed', time: 'Mar 01, 2026 • 02:20 PM', completed: true },
      { key: 'processing', label: 'Artisan Packaging & QA', time: 'Mar 01, 2026 • 03:10 PM', completed: true, current: true },
      { key: 'shipped', label: 'Courier Handover', time: 'Pending dispatch', completed: false },
      { key: 'in_transit', label: 'In Transit', time: 'Upcoming', completed: false },
      { key: 'out_for_delivery', label: 'Out for Delivery', time: 'Upcoming', completed: false },
      { key: 'delivered', label: 'Delivered', time: 'Estimated Mar 03', completed: false },
    ],
  },
  {
    id: 'SHP-2026-002',
    shipmentNumber: 'SHP-2026-002',
    orderId: 'ORD-2026-9903',
    orderNumber: 'IBTU-9903',
    customer: {
      name: 'Tigist Hailu',
      email: 'tigist.h@outlook.com',
      phone: '+251 91 220 3311',
    },
    shippingAddress: {
      recipientName: 'Tigist Hailu',
      phone: '+251 91 220 3311',
      addressType: 'Home',
      addressLine1: 'Old Airport Residential Quarter',
      addressLine2: 'Villa 18, Near Golf Club',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    courierName: 'Ethio Post Express',
    courierPhone: '+251 11 551 0422',
    trackingNumber: 'ET-POST-78901',
    shippingCost: 0,
    shipmentStatus: 'Shipped',
    estimatedDelivery: '2026-03-02T16:00:00Z',
    shippedDate: '2026-03-01T08:30:00Z',
    deliveredDate: null,
    deliveryNotes: 'Dispatched via Ethio Post Central Hub dispatch vehicle #4.',
    stages: [
      { key: 'placed', label: 'Order Confirmed', time: 'Feb 28, 2026 • 04:45 PM', completed: true },
      { key: 'processing', label: 'Artisan Packaging & QA', time: 'Feb 28, 2026 • 06:10 PM', completed: true },
      { key: 'shipped', label: 'Ethio Post Dispatched', time: 'Mar 01, 2026 • 08:30 AM', completed: true, current: true },
      { key: 'in_transit', label: 'In Transit (Addis Hub)', time: 'Pending update', completed: false },
      { key: 'out_for_delivery', label: 'Out for Delivery', time: 'Pending', completed: false },
      { key: 'delivered', label: 'Delivered', time: 'Estimated Mar 02', completed: false },
    ],
  },
  {
    id: 'SHP-2026-003',
    shipmentNumber: 'SHP-2026-003',
    orderId: 'ORD-2026-9905',
    orderNumber: 'IBTU-9905',
    customer: {
      name: 'Bethlehem Girma',
      email: 'beth.girma@gmail.com',
      phone: '+251 91 199 8877',
    },
    shippingAddress: {
      recipientName: 'Bethlehem Girma',
      phone: '+251 91 199 8877',
      addressType: 'Home',
      addressLine1: 'Gerji Imperial, Behind Jackros Building',
      addressLine2: 'House 55',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      postalCode: '1000',
      country: 'Ethiopia',
    },
    courierName: 'IBTU Direct Logistics',
    courierPhone: '+251 91 100 2233',
    trackingNumber: 'IBTU-EXP-8877',
    shippingCost: 0,
    shipmentStatus: 'Delivered',
    estimatedDelivery: '2026-02-29T15:00:00Z',
    shippedDate: '2026-02-28T10:00:00Z',
    deliveredDate: '2026-02-29T14:45:00Z',
    deliveryNotes: 'Delivered to recipient in person at Gerji gate.',
    stages: [
      { key: 'placed', label: 'Order Confirmed', time: 'Feb 27, 2026 • 06:05 PM', completed: true },
      { key: 'processing', label: 'Artisan Packaging & QA', time: 'Feb 27, 2026 • 07:30 PM', completed: true },
      { key: 'shipped', label: 'Dispatched to Courier', time: 'Feb 28, 2026 • 10:00 AM', completed: true },
      { key: 'in_transit', label: 'In Transit', time: 'Feb 28, 2026 • 01:20 PM', completed: true },
      { key: 'out_for_delivery', label: 'Out for Delivery', time: 'Feb 29, 2026 • 11:30 AM', completed: true },
      { key: 'delivered', label: 'Delivered to Recipient', time: 'Feb 29, 2026 • 02:45 PM', completed: true, current: true },
    ],
  },
]

// LocalStorage Keys
const STORAGE_KEY_ORDERS = 'ibtu_admin_orders'
const STORAGE_KEY_PAYMENTS = 'ibtu_admin_payments'
const STORAGE_KEY_SHIPMENTS = 'ibtu_admin_shipments'

// 4. Storage Helpers & Data Access
export function getStoredAdminOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin orders from localStorage', err)
  }
  return initialAdminOrders
}

export function saveStoredAdminOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders))
  } catch (err) {
    console.error('Error saving admin orders', err)
  }
}

export function getStoredAdminPayments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin payments from localStorage', err)
  }
  return initialAdminPayments
}

export function saveStoredAdminPayments(payments) {
  try {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments))
  } catch (err) {
    console.error('Error saving admin payments', err)
  }
}

export function getStoredAdminShipments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHIPMENTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin shipments from localStorage', err)
  }
  return initialAdminShipments
}

export function saveStoredAdminShipments(shipments) {
  try {
    localStorage.setItem(STORAGE_KEY_SHIPMENTS, JSON.stringify(shipments))
  } catch (err) {
    console.error('Error saving admin shipments', err)
  }
}

// 5. Valid Status Transitions Rules
export const VALID_ORDER_STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled', 'Refunded'],
  Delivered: ['Refunded'],
  Cancelled: [],
  Refunded: [],
}

export const VALID_SHIPMENT_STATUS_TRANSITIONS = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['In Transit', 'Cancelled', 'Failed'],
  'In Transit': ['Out for Delivery', 'Returned', 'Failed'],
  'Out for Delivery': ['Delivered', 'Failed', 'Returned'],
  Delivered: [],
  Failed: ['Out for Delivery', 'Returned', 'Cancelled'],
  Returned: [],
  Cancelled: [],
}

// 6. Action Handlers: Orders
export function updateOrderStatus(orderId, newStatus, adminNote = '') {
  const orders = getStoredAdminOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) {
    return { success: false, message: `Order ${orderId} not found.` }
  }

  // Validate status transition
  const allowed = VALID_ORDER_STATUS_TRANSITIONS[order.orderStatus] || []
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      message: `Invalid status transition: Cannot move order from ${order.orderStatus} to ${newStatus}.`,
    }
  }

  const now = new Date().toISOString()
  const updatedOrder = {
    ...order,
    orderStatus: newStatus,
    updatedAt: now,
    notes: {
      ...order.notes,
      adminNotes: adminNote
        ? `${order.notes?.adminNotes ? order.notes.adminNotes + ' | ' : ''}${adminNote}`
        : order.notes?.adminNotes,
    },
  }

  // If order is cancelled, update linked shipment if exists
  if (newStatus === 'Cancelled' && order.shipmentId) {
    const shipments = getStoredAdminShipments()
    const updatedShipments = shipments.map((shp) => {
      if (shp.id === order.shipmentId && shp.shipmentStatus !== 'Delivered') {
        return {
          ...shp,
          shipmentStatus: 'Cancelled',
          deliveryNotes: `${shp.deliveryNotes || ''} (Cancelled due to order cancellation)`.trim(),
          stages: [
            ...(shp.stages || []),
            {
              key: 'cancelled',
              label: 'Shipment Cancelled',
              time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              completed: true,
              isCancelled: true,
            },
          ],
        }
      }
      return shp
    })
    saveStoredAdminShipments(updatedShipments)
  }

  const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o))
  saveStoredAdminOrders(updatedOrders)

  return { success: true, order: updatedOrder }
}

export function updateOrderAdminNotes(orderId, adminNotes) {
  const orders = getStoredAdminOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) return { success: false, message: 'Order not found.' }

  const updated = {
    ...order,
    updatedAt: new Date().toISOString(),
    notes: {
      ...order.notes,
      adminNotes,
    },
  }

  const updatedOrders = orders.map((o) => (o.id === orderId ? updated : o))
  saveStoredAdminOrders(updatedOrders)
  return { success: true, order: updated }
}

// 7. Action Handlers: Payments & Receipt Review
export function reviewPaymentReceipt(paymentId, { action, reason = '', adminName = 'Admin' }) {
  if (action !== 'approve' && action !== 'reject') {
    return { success: false, message: 'Invalid action. Must be approve or reject.' }
  }

  const payments = getStoredAdminPayments()
  const payment = payments.find((p) => p.id === paymentId)
  if (!payment) {
    return { success: false, message: `Payment ${paymentId} not found.` }
  }

  const now = new Date().toISOString()
  const isApproval = action === 'approve'

  const updatedPayment = {
    ...payment,
    paymentStatus: isApproval ? 'Paid' : 'Failed',
    paidDate: isApproval ? now : null,
    receipt: {
      ...payment.receipt,
      reviewStatus: isApproval ? 'approved' : 'rejected',
      rejectionReason: isApproval ? null : reason,
      reviewedBy: `${adminName} (Simulated)`,
      reviewedAt: now,
    },
  }

  const updatedPayments = payments.map((p) => (p.id === paymentId ? updatedPayment : p))
  saveStoredAdminPayments(updatedPayments)

  // Synchronize Order payment status
  if (payment.orderId) {
    const orders = getStoredAdminOrders()
    const updatedOrders = orders.map((o) => {
      if (o.id === payment.orderId) {
        return {
          ...o,
          paymentStatus: isApproval ? 'Paid' : 'Failed',
          orderStatus: isApproval && o.orderStatus === 'Pending' ? 'Confirmed' : o.orderStatus,
          updatedAt: now,
        }
      }
      return o
    })
    saveStoredAdminOrders(updatedOrders)
  }

  return {
    success: true,
    payment: updatedPayment,
    message: isApproval
      ? 'Payment receipt approved (Simulated). Status changed to Paid.'
      : 'Payment receipt rejected. Status marked as Failed.',
  }
}

// 8. Action Handlers: Shipments
export function createAdminShipment({
  orderId,
  courierName,
  courierPhone,
  trackingNumber,
  shippingCost = 0,
  estimatedDelivery,
  deliveryNotes = '',
}) {
  const orders = getStoredAdminOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) {
    return { success: false, message: `Order ${orderId} not found.` }
  }

  const shipments = getStoredAdminShipments()

  // Validate duplicate tracking number
  const cleanTracking = trackingNumber?.trim().toUpperCase()
  if (!cleanTracking) {
    return { success: false, message: 'Tracking number is required.' }
  }
  const duplicate = shipments.find(
    (s) => s.trackingNumber?.toUpperCase() === cleanTracking
  )
  if (duplicate) {
    return {
      success: false,
      message: `Tracking number "${cleanTracking}" is already assigned to shipment ${duplicate.shipmentNumber}.`,
    }
  }

  const nextIndex = shipments.length + 1
  const shipmentId = `SHP-2026-${String(nextIndex).padStart(3, '0')}`
  const now = new Date()
  const timeFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const newShipment = {
    id: shipmentId,
    shipmentNumber: shipmentId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: {
      name: order.customer?.name || order.shippingAddress?.recipientName || 'Valued Customer',
      email: order.customer?.email || 'customer@ibtu.com',
      phone: order.shippingAddress?.phone || order.customer?.phone || '+251 91 122 3344',
    },
    shippingAddress: { ...order.shippingAddress },
    courierName: courierName || 'Ethio Post Express',
    courierPhone: courierPhone || '+251 11 551 0422',
    trackingNumber: cleanTracking,
    shippingCost: Number(shippingCost) || 0,
    shipmentStatus: 'Processing',
    estimatedDelivery: estimatedDelivery || new Date(Date.now() + 3 * 86400000).toISOString(),
    shippedDate: null,
    deliveredDate: null,
    deliveryNotes,
    stages: [
      { key: 'placed', label: 'Order Confirmed', time: timeFormatted, completed: true },
      { key: 'processing', label: 'Artisan Packaging & QA', time: timeFormatted, completed: true, current: true },
      { key: 'shipped', label: 'Courier Handover', time: 'Pending dispatch', completed: false },
      { key: 'in_transit', label: 'In Transit', time: 'Upcoming', completed: false },
      { key: 'out_for_delivery', label: 'Out for Delivery', time: 'Upcoming', completed: false },
      { key: 'delivered', label: 'Delivered', time: 'Pending', completed: false },
    ],
  }

  const updatedShipments = [newShipment, ...shipments]
  saveStoredAdminShipments(updatedShipments)

  // Update order with linked shipmentId and advance status to Processing if it was Confirmed
  const updatedOrders = orders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        shipmentId,
        orderStatus: o.orderStatus === 'Confirmed' ? 'Processing' : o.orderStatus,
        updatedAt: new Date().toISOString(),
      }
    }
    return o
  })
  saveStoredAdminOrders(updatedOrders)

  return { success: true, shipment: newShipment }
}

export function updateAdminShipment(shipmentId, updates) {
  const shipments = getStoredAdminShipments()
  const shipment = shipments.find((s) => s.id === shipmentId)
  if (!shipment) {
    return { success: false, message: `Shipment ${shipmentId} not found.` }
  }

  // If tracking number changed, verify uniqueness
  if (updates.trackingNumber && updates.trackingNumber.trim().toUpperCase() !== shipment.trackingNumber.toUpperCase()) {
    const cleanTracking = updates.trackingNumber.trim().toUpperCase()
    const duplicate = shipments.find(
      (s) => s.id !== shipmentId && s.trackingNumber?.toUpperCase() === cleanTracking
    )
    if (duplicate) {
      return {
        success: false,
        message: `Tracking number "${cleanTracking}" already belongs to another shipment.`,
      }
    }
  }

  const now = new Date()
  const timeFormatted = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  let updatedStages = shipment.stages || []
  const newStatus = updates.shipmentStatus || shipment.shipmentStatus

  if (newStatus !== shipment.shipmentStatus) {
    // Progress or mark stages
    updatedStages = updatedStages.map((stage) => {
      if (newStatus === 'Shipped' && (stage.key === 'shipped' || stage.key === 'processing' || stage.key === 'placed')) {
        return { ...stage, completed: true, current: stage.key === 'shipped', time: stage.time === 'Pending dispatch' ? timeFormatted : stage.time }
      }
      if (newStatus === 'In Transit' && ['placed', 'processing', 'shipped', 'in_transit'].includes(stage.key)) {
        return { ...stage, completed: true, current: stage.key === 'in_transit' }
      }
      if (newStatus === 'Out for Delivery' && ['placed', 'processing', 'shipped', 'in_transit', 'out_for_delivery'].includes(stage.key)) {
        return { ...stage, completed: true, current: stage.key === 'out_for_delivery' }
      }
      if (newStatus === 'Delivered') {
        return { ...stage, completed: true, current: stage.key === 'delivered', time: stage.time.includes('Pending') ? timeFormatted : stage.time }
      }
      return stage
    })
  }

  const updatedShipment = {
    ...shipment,
    ...updates,
    stages: updatedStages,
    shippedDate: newStatus === 'Shipped' && !shipment.shippedDate ? now.toISOString() : shipment.shippedDate,
    deliveredDate: newStatus === 'Delivered' ? now.toISOString() : shipment.deliveredDate,
  }

  const updatedShipments = shipments.map((s) => (s.id === shipmentId ? updatedShipment : s))
  saveStoredAdminShipments(updatedShipments)

  // Synchronize Order status if shipment transitioned to Shipped or Delivered
  if (shipment.orderId && (newStatus === 'Shipped' || newStatus === 'Delivered')) {
    const orders = getStoredAdminOrders()
    const updatedOrders = orders.map((o) => {
      if (o.id === shipment.orderId) {
        return {
          ...o,
          orderStatus: newStatus,
          updatedAt: now.toISOString(),
        }
      }
      return o
    })
    saveStoredAdminOrders(updatedOrders)
  }

  return { success: true, shipment: updatedShipment }
}

// 9. Summary KPIs Generator
export function getSalesKPIs() {
  const orders = getStoredAdminOrders()
  const payments = getStoredAdminPayments()
  const shipments = getStoredAdminShipments()

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length
  const processingOrders = orders.filter((o) => o.orderStatus === 'Processing').length
  const shippedOrders = orders.filter((o) => o.orderStatus === 'Shipped').length
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  const pendingPaymentsCount = payments.filter((p) => p.paymentStatus === 'Pending' || p.receipt?.reviewStatus === 'pending').length
  const totalShipments = shipments.length
  const inTransitShipments = shipments.filter((s) => s.shipmentStatus === 'In Transit' || s.shipmentStatus === 'Shipped').length

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    pendingPaymentsCount,
    totalShipments,
    inTransitShipments,
  }
}
