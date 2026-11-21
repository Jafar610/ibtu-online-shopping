// IBTU Admin Engagement Data Architecture: Customers, Reviews, and Contact Messages
// Adheres strictly to Phase 5 - Step 8.4 (frontendInt11.md) specifications.

import { products } from '../products'
import { reviews as initialReviewMap } from '../reviews'
import { getStoredAdminOrders } from './adminSalesData'

export const IS_ENGAGEMENT_MOCK_DATA = true
export const MOCK_ENGAGEMENT_NOTICE =
  'Frontend Mock State: Customer account management, review moderation, and contact message operations update browser storage only and do not modify the MariaDB database or send SMTP emails.'

// 1. Initial Mock Customers Dataset
export const initialAdminCustomers = [
  {
    id: 'cust-demo-1',
    firstName: 'Almaz',
    lastName: 'Bekele',
    name: 'Almaz Bekele',
    email: 'almaz.bekele@ibtu.com',
    phone: '+251 91 122 3344',
    status: 'Active',
    accountType: 'Registered Customer',
    registrationDate: '2026-01-10T08:30:00Z',
    lastLogin: '2026-03-01T10:15:00Z',
    avatar: 'AB',
    addresses: [
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
    ],
  },
  {
    id: 'cust-101',
    firstName: 'Yordanos',
    lastName: 'Assefa',
    name: 'Yordanos Assefa',
    email: 'yordanos.a@gmail.com',
    phone: '+251 91 144 5566',
    status: 'Active',
    accountType: 'VIP Member',
    registrationDate: '2026-01-15T11:20:00Z',
    lastLogin: '2026-03-01T14:15:00Z',
    avatar: 'YA',
    addresses: [
      {
        id: 'addr-101',
        recipientName: 'Yordanos Assefa',
        phone: '+251 91 144 5566',
        addressType: 'Home',
        addressLine1: 'Bole Sub-City, Kebele 03, House #104',
        addressLine2: 'Behind Medhane Alem Cathedral',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        postalCode: '1000',
        country: 'Ethiopia',
        isDefault: true,
      },
    ],
  },
  {
    id: 'cust-102',
    firstName: 'Dawit',
    lastName: 'Mengistu',
    name: 'Dawit Mengistu',
    email: 'dawit.m@yahoo.com',
    phone: '+251 92 331 8899',
    status: 'Active',
    accountType: 'Registered Customer',
    registrationDate: '2026-02-01T09:40:00Z',
    lastLogin: '2026-03-01T11:10:00Z',
    avatar: 'DM',
    addresses: [
      {
        id: 'addr-102',
        recipientName: 'Dawit Mengistu',
        phone: '+251 92 331 8899',
        addressType: 'Work',
        addressLine1: 'Kazanchis, Bloom Tower 5th Floor',
        addressLine2: 'Office #504',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        postalCode: '1000',
        country: 'Ethiopia',
        isDefault: true,
      },
    ],
  },
  {
    id: 'cust-103',
    firstName: 'Tigist',
    lastName: 'Hailu',
    name: 'Tigist Hailu',
    email: 'tigist.h@outlook.com',
    phone: '+251 91 220 3311',
    status: 'Active',
    accountType: 'VIP Customer',
    registrationDate: '2025-12-18T14:00:00Z',
    lastLogin: '2026-02-28T16:30:00Z',
    avatar: 'TH',
    addresses: [
      {
        id: 'addr-103',
        recipientName: 'Tigist Hailu',
        phone: '+251 91 220 3311',
        addressType: 'Home',
        addressLine1: 'Old Airport Residential Quarter',
        addressLine2: 'Villa 18, Near Golf Club',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        postalCode: '1000',
        country: 'Ethiopia',
        isDefault: true,
      },
    ],
  },
  {
    id: 'cust-104',
    firstName: 'Kassahun',
    lastName: 'Tadesse',
    name: 'Kassahun Tadesse',
    email: 'kassa.t@gmail.com',
    phone: '+251 93 450 1122',
    status: 'Active',
    accountType: 'Registered Customer',
    registrationDate: '2026-01-22T16:15:00Z',
    lastLogin: '2026-02-28T09:20:00Z',
    avatar: 'KT',
    addresses: [
      {
        id: 'addr-104',
        recipientName: 'Kassahun Tadesse',
        phone: '+251 93 450 1122',
        addressType: 'Home',
        addressLine1: 'Sarbet Area, Next to Adams Pavilion',
        addressLine2: 'Apartment 3B',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        postalCode: '1000',
        country: 'Ethiopia',
        isDefault: true,
      },
    ],
  },
  {
    id: 'cust-105',
    firstName: 'Bethlehem',
    lastName: 'Girma',
    name: 'Bethlehem Girma',
    email: 'beth.girma@gmail.com',
    phone: '+251 91 199 8877',
    status: 'Active',
    accountType: 'Registered Customer',
    registrationDate: '2026-01-05T13:45:00Z',
    lastLogin: '2026-02-27T18:00:00Z',
    avatar: 'BG',
    addresses: [
      {
        id: 'addr-105',
        recipientName: 'Bethlehem Girma',
        phone: '+251 91 199 8877',
        addressType: 'Home',
        addressLine1: 'Gerji Imperial, Behind Jackros Building',
        addressLine2: 'House 55',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        postalCode: '1000',
        country: 'Ethiopia',
        isDefault: true,
      },
    ],
  },
  {
    id: 'cust-106',
    firstName: 'Solomon',
    lastName: 'Demissie',
    name: 'Solomon Demissie',
    email: 'solo.demissie@gmail.com',
    phone: '+251 91 334 4556',
    status: 'Suspended',
    accountType: 'Registered Customer',
    registrationDate: '2026-02-12T10:00:00Z',
    lastLogin: '2026-02-26T10:10:00Z',
    avatar: 'SD',
    addresses: [
      {
        id: 'addr-106',
        recipientName: 'Solomon Demissie',
        phone: '+251 91 334 4556',
        addressType: 'Home',
        addressLine1: 'CMC Michael, Site 2',
        addressLine2: 'Block 12, Unit 4',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        postalCode: '1000',
        country: 'Ethiopia',
        isDefault: true,
      },
    ],
  },
]

// 2. Initial Mock Reviews Dataset
const generateInitialReviews = () => {
  const result = []
  let revCount = 1

  // Product map for quick lookup
  const prodMap = {}
  products.forEach((p) => {
    prodMap[p.id] = p
  })

  // Review seeds from reviews.js
  Object.entries(initialReviewMap).forEach(([prodId, reviewList]) => {
    const prod = prodMap[prodId] || {
      name: 'Artisan Habesha Garment',
      category: 'habesha-kemis',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    }

    reviewList.forEach((r, idx) => {
      // Deterministically set some pending, approved, and rejected for moderation queue testing
      let status = 'Approved'
      let modNote = 'Meets community quality standards.'
      if (idx === 1 && revCount % 2 === 0) {
        status = 'Pending'
        modNote = null
      } else if (idx === 3) {
        status = 'Rejected'
        modNote = 'Flagged for content verification.'
      }

      result.push({
        id: `REV-2026-${String(revCount).padStart(3, '0')}`,
        productId: prodId,
        productName: prod.name,
        productCategory: prod.category || 'artisan',
        productImage: prod.image,
        author: r.author,
        avatar: r.avatar,
        rating: r.rating,
        date: r.date,
        title: r.title,
        body: r.body,
        verified: Boolean(r.verified),
        status,
        moderationNote: modNote,
        moderatedBy: status !== 'Pending' ? 'Admin Moderator' : null,
        moderatedAt: status !== 'Pending' ? '2026-02-28T14:00:00Z' : null,
      })
      revCount++
    })
  })

  // Add a few more distinct reviews
  result.push({
    id: `REV-2026-099`,
    productId: 'prod-dress-trad',
    productName: "Women's Traditional Dress",
    productCategory: 'habesha-kemis',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    author: 'Abeba Girmay',
    avatar: 'AG',
    rating: 5,
    date: '2026-02-28',
    title: 'Pure Ethiopian Elegance!',
    body: 'The gold Tilf embroidery border is exceptionally detailed. Worth every single birr. Delivered to Bole in 2 days.',
    verified: true,
    status: 'Pending',
    moderationNote: null,
    moderatedBy: null,
    moderatedAt: null,
  })

  return result
}

export const initialAdminReviews = generateInitialReviews()

// 3. Initial Mock Contact Messages Dataset
export const initialAdminMessages = [
  {
    id: 'MSG-2026-001',
    senderName: 'Selamawit Tadesse',
    email: 'selam.tadesse@gmail.com',
    phone: '+251 91 188 2233',
    subject: 'Custom Habesha Kemis Tailoring for Upcoming Wedding',
    message:
      'Selam IBTU team! I am having my wedding in Addis Ababa this May. I am interested in custom tailoring 5 matching Royal Tilf bridesmaid dresses along with my bridal gown. Could you share your custom measurement procedure and timeline?',
    submissionDate: '2026-03-01T09:15:00Z',
    status: 'New',
    assignedTo: 'Admin Support',
    adminNotes: 'High-value wedding party lead. Assigned to senior artisan coordinator.',
    replies: [],
  },
  {
    id: 'MSG-2026-002',
    senderName: 'Henok Fikru',
    email: 'henok.fikru@yahoo.com',
    phone: '+251 92 445 6677',
    subject: 'Bulk Order Inquiry for Ethiopian Cultural Festival in Nairobi',
    message:
      'We are organizing an East African cultural gala in Nairobi next month and would like to purchase 25 Men Habesha Shirts and 25 Netela scarves. Do you offer corporate/wholesale discounts and regional delivery to Kenya?',
    submissionDate: '2026-02-28T14:30:00Z',
    status: 'In Progress',
    assignedTo: 'Admin Support',
    adminNotes: 'Drafted export delivery quote via Ethio Post EMS.',
    replies: [
      {
        id: 'REP-001',
        subject: 'Re: Bulk Order Inquiry for Ethiopian Cultural Festival in Nairobi',
        message:
          'Dear Henok, thank you for reaching out! We can certainly support your gala with our authentic artisan collection. We offer a 15% discount for bulk orders over 20 pieces. We will follow up with our international dispatch schedule.',
        draftedAt: '2026-03-01T08:00:00Z',
        draftedBy: 'Admin Moderator (Simulated)',
      },
    ],
  },
  {
    id: 'MSG-2026-003',
    senderName: 'Rahel Zewde',
    email: 'rahel.z@outlook.com',
    phone: '+251 91 332 9900',
    subject: 'Delivery Tracking Status for Order IBTU-9104',
    message:
      'Hello, I placed an order three days ago for the Men Premium Hoodie. The status says Shipped, but I have not received a call from the courier driver yet. Could you check if it is out for delivery today?',
    submissionDate: '2026-02-27T16:45:00Z',
    status: 'Resolved',
    assignedTo: 'Admin Support',
    adminNotes: 'Contacted Ethio Post driver. Package delivered to recipient on Feb 28.',
    replies: [
      {
        id: 'REP-002',
        subject: 'Re: Delivery Tracking Status for Order IBTU-9104',
        message:
          'Dear Rahel, your parcel is currently in Addis Ababa central hub with driver dispatch #4. You will receive a call within the next 2 hours.',
        draftedAt: '2026-02-28T09:00:00Z',
        draftedBy: 'Admin (Simulated)',
      },
    ],
  },
  {
    id: 'MSG-2026-004',
    senderName: 'Michael Berhanu',
    email: 'micky.b@gmail.com',
    phone: '+251 91 556 7788',
    subject: 'Sizing Consultation for Modern Tibeb Embroidered Shirt',
    message:
      'Greetings! I am 182cm tall and normally wear Large, but I prefer a relaxed fit around the chest. Does your handspun cotton shrink after the first gentle wash, or should I order XL?',
    submissionDate: '2026-02-25T11:20:00Z',
    status: 'Closed',
    assignedTo: 'Admin Support',
    adminNotes: 'Customer advised that preshrunk cotton Shemma retains sizing. Advised size L.',
    replies: [],
  },
  {
    id: 'MSG-2026-005',
    senderName: 'Meron Asfaw',
    email: 'meron.asfaw@gmail.com',
    phone: '+251 94 112 3344',
    subject: 'Express Shipping to Washington D.C. for Timkat Gala',
    message:
      'I am an Ethiopian living in the US and would love to buy the Royal Gondar Kemis for our church festival. Do you ship to the United States via DHL or EMS, and what is the typical transit duration?',
    submissionDate: '2026-02-24T08:10:00Z',
    status: 'New',
    assignedTo: 'Admin Support',
    adminNotes: 'International diaspora shipping inquiry. Requires standard DHL transit rate card.',
    replies: [],
  },
]

// Storage Keys
const STORAGE_KEY_CUSTOMERS = 'ibtu_admin_customers'
const STORAGE_KEY_REVIEWS = 'ibtu_admin_reviews'
const STORAGE_KEY_MESSAGES = 'ibtu_admin_contact_messages'

// 4. Data Access & Storage Functions
export function getStoredAdminCustomers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin customers', err)
  }
  return initialAdminCustomers
}

export function saveStoredAdminCustomers(customers) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers))
  } catch (err) {
    console.error('Error saving admin customers', err)
  }
}

export function getStoredAdminReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin reviews', err)
  }
  return initialAdminReviews
}

export function saveStoredAdminReviews(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews))
  } catch (err) {
    console.error('Error saving admin reviews', err)
  }
}

export function getStoredAdminMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading admin messages', err)
  }
  return initialAdminMessages
}

export function saveStoredAdminMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
  } catch (err) {
    console.error('Error saving admin messages', err)
  }
}

// 5. Customer Aggregated Metrics Helper
// Calculates actual order count & total spending by matching orders from getStoredAdminOrders()
export function getCustomerMetrics(customerId, customerEmail) {
  const allOrders = getStoredAdminOrders()
  const customerOrders = allOrders.filter(
    (o) =>
      o.customer?.id === customerId ||
      (customerEmail && o.customer?.email?.toLowerCase() === customerEmail.toLowerCase())
  )

  const orderCount = customerOrders.length
  const totalSpending = customerOrders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  return {
    orderCount,
    totalSpending,
    orders: customerOrders,
  }
}

// 6. Action Handlers: Customers
export function updateCustomerStatus(customerId, newStatus) {
  const allowed = ['Active', 'Inactive', 'Suspended']
  if (!allowed.includes(newStatus)) {
    return { success: false, message: `Invalid status: ${newStatus}` }
  }

  const customers = getStoredAdminCustomers()
  const cust = customers.find((c) => c.id === customerId)
  if (!cust) return { success: false, message: 'Customer not found.' }

  const updated = {
    ...cust,
    status: newStatus,
  }

  const updatedList = customers.map((c) => (c.id === customerId ? updated : c))
  saveStoredAdminCustomers(updatedList)

  return {
    success: true,
    customer: updated,
    message: `Customer account status updated to "${newStatus}".`,
  }
}

// 7. Action Handlers: Reviews
export function moderateReview(reviewId, { action, note = '', adminName = 'Admin' }) {
  const allowedActions = ['approve', 'reject']
  if (!allowedActions.includes(action)) {
    return { success: false, message: 'Action must be approve or reject.' }
  }

  if (action === 'reject' && !note.trim()) {
    return { success: false, message: 'Rejection reason is required.' }
  }

  const reviews = getStoredAdminReviews()
  const rev = reviews.find((r) => r.id === reviewId)
  if (!rev) return { success: false, message: 'Review not found.' }

  const now = new Date().toISOString()
  const isApproved = action === 'approve'

  const updated = {
    ...rev,
    status: isApproved ? 'Approved' : 'Rejected',
    moderationNote: note.trim() || (isApproved ? 'Approved by moderator.' : 'Rejected.'),
    moderatedBy: `${adminName} (Simulated)`,
    moderatedAt: now,
  }

  const updatedList = reviews.map((r) => (r.id === reviewId ? updated : r))
  saveStoredAdminReviews(updatedList)

  return {
    success: true,
    review: updated,
    message: isApproved
      ? 'Review has been approved and published (Simulated).'
      : 'Review has been rejected with moderation note.',
  }
}

// 8. Action Handlers: Contact Messages
export function updateMessageStatus(messageId, newStatus) {
  const allowed = ['New', 'In Progress', 'Resolved', 'Closed']
  if (!allowed.includes(newStatus)) {
    return { success: false, message: `Invalid status: ${newStatus}` }
  }

  const messages = getStoredAdminMessages()
  const msg = messages.find((m) => m.id === messageId)
  if (!msg) return { success: false, message: 'Message not found.' }

  const updated = {
    ...msg,
    status: newStatus,
  }

  const updatedList = messages.map((m) => (m.id === messageId ? updated : m))
  saveStoredAdminMessages(updatedList)

  return {
    success: true,
    messageItem: updated,
    message: `Inquiry status changed to "${newStatus}".`,
  }
}

export function updateMessageAdminNotes(messageId, adminNotes) {
  const messages = getStoredAdminMessages()
  const msg = messages.find((m) => m.id === messageId)
  if (!msg) return { success: false, message: 'Message not found.' }

  const updated = {
    ...msg,
    adminNotes: adminNotes.trim(),
  }

  const updatedList = messages.map((m) => (m.id === messageId ? updated : m))
  saveStoredAdminMessages(updatedList)

  return { success: true, messageItem: updated }
}

export function draftMessageReply(messageId, { subject, message, adminName = 'Admin' }) {
  if (!subject.trim() || !message.trim()) {
    return { success: false, message: 'Subject and reply message are required.' }
  }

  const messages = getStoredAdminMessages()
  const msg = messages.find((m) => m.id === messageId)
  if (!msg) return { success: false, message: 'Message not found.' }

  const newReply = {
    id: `REP-${Date.now().toString().slice(-4)}`,
    subject: subject.trim(),
    message: message.trim(),
    draftedAt: new Date().toISOString(),
    draftedBy: `${adminName} (Simulated Draft)`,
  }

  const updated = {
    ...msg,
    status: msg.status === 'New' ? 'In Progress' : msg.status,
    replies: [...(msg.replies || []), newReply],
  }

  const updatedList = messages.map((m) => (m.id === messageId ? updated : m))
  saveStoredAdminMessages(updatedList)

  return {
    success: true,
    reply: newReply,
    message: 'Reply draft saved to inquiry history. (Note: Email delivery is not active in frontend mock mode).',
  }
}

// 9. Summary KPIs Generator
export function getEngagementKPIs() {
  const customers = getStoredAdminCustomers()
  const reviews = getStoredAdminReviews()
  const messages = getStoredAdminMessages()

  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === 'Active').length
  const suspendedCustomers = customers.filter((c) => c.status === 'Suspended').length

  const totalReviews = reviews.length
  const pendingReviews = reviews.filter((r) => r.status === 'Pending').length
  const approvedReviews = reviews.filter((r) => r.status === 'Approved').length
  const rejectedReviews = reviews.filter((r) => r.status === 'Rejected').length

  const totalMessages = messages.length
  const newMessages = messages.filter((m) => m.status === 'New').length
  const inProgressMessages = messages.filter((m) => m.status === 'In Progress').length
  const resolvedMessages = messages.filter((m) => m.status === 'Resolved').length

  return {
    totalCustomers,
    activeCustomers,
    suspendedCustomers,
    totalReviews,
    pendingReviews,
    approvedReviews,
    rejectedReviews,
    totalMessages,
    newMessages,
    inProgressMessages,
    resolvedMessages,
  }
}
