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

// Admin Dashboard Pages (Phase 5 - Step 7, 8.1, 8.2, 8.3 & 8.4)
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminInventoryMovementsPage from './pages/admin/AdminInventoryMovementsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminOrderDetailsPage from './pages/admin/AdminOrderDetailsPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminPaymentDetailsPage from './pages/admin/AdminPaymentDetailsPage'
import AdminShipmentsPage from './pages/admin/AdminShipmentsPage'
import AdminShipmentDetailsPage from './pages/admin/AdminShipmentDetailsPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminCustomerDetailsPage from './pages/admin/AdminCustomerDetailsPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'
import AdminReviewDetailsPage from './pages/admin/AdminReviewDetailsPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminMessageDetailsPage from './pages/admin/AdminMessageDetailsPage'
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
                      <AdminInventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inventory/movements"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'data_encoder']}>
                      <AdminInventoryMovementsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Sales & Administration Routes (Admin Only - Phase 5 Step 8.3) */}
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminOrderDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPaymentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments/:paymentId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPaymentDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shipments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminShipmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/shipments/:shipmentId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminShipmentDetailsPage />
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
                {/* Customers & Engagement Routes (Admin Only - Phase 5 Step 8.4) */}
                <Route
                  path="/admin/customers"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminCustomersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/customers/:customerId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminCustomerDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReviewsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews/:reviewId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReviewDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/messages/:messageId"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminMessageDetailsPage />
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
