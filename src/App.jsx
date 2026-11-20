import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import { WishlistProvider, useWishlist } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { CheckoutProvider } from './context/CheckoutContext'
import ProtectedRoute from './routes/ProtectedRoute'

import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Customer Account Dashboard Pages (Phase 5 - Step 5)
import AccountDashboard from './pages/customer/AccountDashboard'
import ProfilePage from './pages/customer/ProfilePage'
import AddressesPage from './pages/customer/AddressesPage'
import OrdersPage from './pages/customer/OrdersPage'
import OrderDetailsPage from './pages/customer/OrderDetailsPage'
import OrderTrackingPage from './pages/customer/OrderTrackingPage'

// Checkout & Payment Pages (Phase 5 - Step 6)
import CheckoutPage from './pages/checkout/CheckoutPage'
import PaymentPage from './pages/checkout/PaymentPage'
import OrderConfirmationPage from './pages/checkout/OrderConfirmationPage'

// Admin Dashboard Pages (Phase 5 - Step 7 & Step 8.1)
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage'
import AdminNotFound from './pages/admin/AdminNotFound'

import { CheckCircle2 } from 'lucide-react'

function GlobalNotification() {
  const { notification: cartNotification } = useCart()
  const { notification: wishlistNotification } = useWishlist()
  const notification = cartNotification || wishlistNotification
  if (!notification) return null
  return (
    <div className="fixed top-20 right-6 z-50 bg-[#103321] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#95C623] flex items-center gap-3 animate-slideDown">
      <CheckCircle2 className="w-5 h-5 text-[#95C623] shrink-0" />
      <span className="text-xs sm:text-sm font-semibold">{notification}</span>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CheckoutProvider>
              <GlobalNotification />
              <Routes>
                {/* Public Store Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Authentication Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Customer Account Routes (Protected - Role: Customer) */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <AccountDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/addresses"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <AddressesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/orders/:orderId/tracking"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderTrackingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Checkout & Payment Routes (Phase 5 - Step 6) */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/payment"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/confirmation/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderConfirmationPage />
                    </ProtectedRoute>
                  }
                />

                {/* ==================================================== */}
                {/* Admin Dashboard Routes (Phase 5 - Step 7 Foundation) */}
                {/* ==================================================== */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catalog & Inventory Routes (Admin & Data Encoder) */}
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminCategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminPlaceholderPage
                        title="Inventory Control & Stock Adjustments"
                        description="Monitor garment stock levels, low inventory warnings, and artisan restocking logs."
                        moduleKey="inventory"
                        plannedFeatures={[
                          'Real-Time Stock Level Table with Status Indicators',
                          'Manual Stock In / Stock Out Adjustments',
                          'Low-Stock Threshold Configuration',
                          'Artisan Supplier Batch Tracking',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />

                {/* Sales & Administration Routes (Admin Only) */}
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Customer Order Management"
                        description="Review order pipeline, update fulfillment stages, and issue Ethiopian tax invoices."
                        moduleKey="orders"
                        plannedFeatures={[
                          'Order Status Pipeline (Pending → Confirmed → Shipped → Delivered)',
                          'Itemized Order Inspector & Packing Slip Generator',
                          'Courier Assignment & Ethio Post Integration',
                          'Customer Order Cancellation & Status History',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Payment Verification & Approvals"
                        description="Review customer Telebirr, CBE Birr, and Bank Transfer receipts and reconcile transactions."
                        moduleKey="payments"
                        plannedFeatures={[
                          'Payment Slip Screenshot Modal Viewer',
                          'Telebirr Transaction ID Verification',
                          'CBE Birr & Bank Deposit Reconciliation',
                          'Approve / Reject Action with Customer Notification',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shipments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Shipment & Logistics Dispatch"
                        description="Manage local Addis Ababa courier handoffs and regional Ethio Post shipments."
                        moduleKey="shipments"
                        plannedFeatures={[
                          'Dispatch Manifest Generation',
                          'Tracking Number Assignment',
                          'Courier Driver Delivery Contact Logs',
                          'Delivery Milestone Timestamp Updates',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/coupons"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Coupons & Promotional Vouchers"
                        description="Create discount codes, set percentage or fixed Birr reductions, and enforce expiration dates."
                        moduleKey="coupons"
                        plannedFeatures={[
                          'Percentage & Fixed ETB Voucher Creator',
                          'Usage Limits per Customer Account',
                          'Minimum Cart Order Requirements',
                          'Promotional Campaign Schedule Control',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Customer Accounts Directory"
                        description="Inspect registered customer profiles, address books, and cumulative spending metrics."
                        moduleKey="customers"
                        plannedFeatures={[
                          'Customer Directory with Search & Filtering',
                          'Customer Profile Details & Verification Badges',
                          'Delivery Address Snapshot Inspector',
                          'Order History & Lifetime Value (LTV) Metrics',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Product Reviews & Ratings"
                        description="Moderate artisan garment customer reviews, star ratings, and buyer testimonials."
                        moduleKey="reviews"
                        plannedFeatures={[
                          'Review Moderation Queue (Pending / Approved / Rejected)',
                          'Customer Feedback Text & Rating Filter',
                          'Spam & Inappropriate Content Flagging',
                          'Featured Testimonial Assignment for Homepage',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Contact & Support Inquiries"
                        description="Manage customer inquiries submitted through the contact page and public channels."
                        moduleKey="messages"
                        plannedFeatures={[
                          'Support Inbox with Unread Status Counters',
                          'Message Response Tracking & Status Flags',
                          'Customer Contact Information Viewer',
                          'Archive & Export Support History',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Staff Users Management"
                        description="Manage administrative accounts, assign Data Encoder privileges, and monitor staff activity."
                        moduleKey="users"
                        plannedFeatures={[
                          'Staff Account Listing (Admins, Data Encoders)',
                          'Invite New Administrative Staff Members',
                          'Password Reset & Two-Factor Authentication Controls',
                          'Account Deactivation & Session Invalidation',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/roles"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Roles & Permissions (RBAC)"
                        description="Configure granular role-based access control and system authorization policies."
                        moduleKey="roles"
                        plannedFeatures={[
                          'Role Definition Matrix (Admin, Data Encoder, Customer)',
                          'Granular Permission Checkboxes per Resource',
                          'Audit History of Permission Modifications',
                          'Security Policy & Session Expiry Rules',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Financial Reports & Analytics"
                        description="Analyze e-commerce revenue, sales by category, and regional Ethiopian delivery volume."
                        moduleKey="reports"
                        plannedFeatures={[
                          'Revenue vs. Profit Margin Breakdown in ETB',
                          'Category Sales Distribution (Women Kemis, Men Attire, etc.)',
                          'Customer Acquisition & Retention Cohorts',
                          'Export Reports to CSV / Excel Formats',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="Global Store Configuration"
                        description="Configure Ethiopian currency rules, VAT rates, free shipping thresholds, and business info."
                        moduleKey="settings"
                        plannedFeatures={[
                          'Store Business Name, Logo, & Contact Numbers',
                          'Currency Setting (ETB) & VAT Rate (15%) Rules',
                          'Free Nationwide Shipping Threshold (2,000 ETB)',
                          'Telebirr & CBE Birr Merchant Account Settings',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPlaceholderPage
                        title="System Audit Trail Logs"
                        description="Immutable chronological logs of administrative actions, status updates, and security events."
                        moduleKey="audit-logs"
                        plannedFeatures={[
                          'Chronological Event Log with Actor, Action, & Resource',
                          'Date Range & Event Severity Filtering',
                          'Detailed JSON Payload Diff Inspector',
                          'Export Log History for Compliance',
                        ]}
                      />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Fallback 404 */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminNotFound />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all public fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </CheckoutProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}
