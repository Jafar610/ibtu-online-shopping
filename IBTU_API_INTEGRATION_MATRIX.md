# IBTU API Integration Matrix

| Frontend Module | API Service | Backend Endpoint | HTTP Method | Integration Status | Notes |
|---|---|---|---|---|---|
| Auth: Login / Register / Me / Logout | `authApi.js` | `/api/auth/login`, `/register`, `/me`, `/permissions`, `/logout` | POST, GET | **Fully Integrated** | JWT Bearer + live DB active check |
| Auth: Forgot / Reset Password | `authService.js` | *None* | — | **Not Integrated** | Demo/mock only; no backend endpoint |
| Catalog: Shop, Search, Product Details | `productApi.js`, `categoryApi.js` | `/api/catalog/products`, `/featured`, `/:id/related`, `/categories` | GET | **Fully Integrated** | Real MariaDB catalog queries |
| Shopping Cart (Guest & Auth) | `cartApi.js` | `/api/cart`, `/cart/items`, `/cart/items/:id`, `/cart/merge` | GET, POST, PATCH, DELETE | **Fully Integrated** | Uses `X-Guest-Token`; reads `res.data` |
| Wishlist & Move-to-Cart | `wishlistApi.js` | `/api/wishlist`, `/wishlist/items`, `/wishlist/items/:id/add-to-cart` | GET, POST, DELETE | **Fully Integrated** | Reads `res.data` |
| Customer Addresses | `addressApi.js` | `/api/addresses`, `/addresses/:id`, `/addresses/:id/default` | GET, POST, PUT, PATCH, DELETE | **Fully Integrated** | Reads `res.data` |
| Customer Profile & Account Overview | `ProfilePage.jsx`, `AccountDashboard.jsx` | *None* | — | **Not Integrated** | Uses `sessionStorage` / `customerData.js` |
| Checkout Preview & Order Creation | `checkoutApi.js` | `/api/checkout/preview`, `/api/checkout/orders` | POST | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Coupon Validation (Checkout) | `checkoutApi.js` | `/api/coupons/validate` | POST | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Customer Orders, Cancel & Tracking | `checkoutApi.js` | `/api/orders`, `/orders/:id`, `/orders/:id/cancel`, `/tracking` | GET, POST | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Customer Payment Receipt Upload | `checkoutApi.js` | `/api/payments/instructions`, `/payments/:id/receipt` | GET, POST | **Partially Integrated (Bug)** | Multipart upload; reads `res.data?.data` |
| Public Contact Form | `ContactPage.jsx` | *None* | — | **Not Integrated** | Saves to `localStorage` |
| Admin: Products, Variants, Images | `productApi.js` | `/api/products`, `/variants`, `/product-images` | GET, POST, PUT, PATCH, DELETE | **Fully Integrated** | Admin & Data Encoder |
| Admin: Categories | `categoryApi.js` | `/api/categories` | GET, POST, PUT, DELETE | **Fully Integrated** | Admin & Data Encoder |
| Admin: Orders | `adminOrderApi.js` | `/api/admin/orders`, `/:id`, `/:id/status`, `/:id/cancel` | GET, PATCH, POST | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Admin: Payments & Receipt Blob | `adminPaymentApi.js` | `/api/admin/payments`, `/pending`, `/:id`, `/:id/receipt`, `/approve`, `/reject` | GET, PATCH | **Partially Integrated (Bug)** | Reads `res.data?.data` & `URL.createObjectURL(res.data)` |
| Admin: Shipments | `adminShipmentApi.js` | `/api/admin/shipments`, `/:id`, `/:id/status`, `/admin/orders/:id/shipments` | GET, POST, PATCH | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Admin: Customers | `adminCustomerApi.js` | `/api/admin/customers`, `/:id` | GET, PATCH | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Admin: Product Reviews | `adminReviewApi.js` | `/api/admin/reviews`, `/:id`, `/:id/approve`, `/:id/reject` | GET, PATCH | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Admin: Contact Messages | `adminContactMessageApi.js` | `/api/admin/contact-messages`, `/staff`, `/:id` | GET, PATCH | **Partially Integrated (Bug)** | Reads `res.data?.data`; reply email Unavailable by Design |
| Admin: Coupons | `adminCouponApi.js` | `/api/admin/coupons`, `/:id`, `/:id/status`, `/:id/usages` | GET, POST, PUT, PATCH, DELETE | **Partially Integrated (Bug)** | Reads `res.data?.data` instead of `res.data` |
| Admin: Roles & Permissions | `adminRoleApi.js` | `/api/admin/roles` | GET | **Partially Integrated (Bug)** | Read-only (`res.data?.data` bug); no mutation API |
| Admin: Dashboard & Reports | `adminReportApi.js` | `/api/admin/dashboard` + list endpoints | GET | **Partially Integrated (Bug)** | Reads `res.data?.data`; charts/trends Unavailable by Design |
| Admin: Settings (Payment Instructions) | `adminSettingsApi.js` | `/api/payments/instructions`, `/api/admin/payments/instructions/:method` | GET, PUT | **Partially Integrated (Bug)** | General/store/notification tabs Unavailable by Design |
| Admin: Staff Users | `adminUserApi.js` | *None* | — | **Unavailable by Design** | No `/api/admin/users` endpoints |
| Admin: Audit Logs | `adminAuditLogApi.js` | *None* | — | **Unavailable by Design** | No `GET /api/admin/audit-logs` endpoint |
