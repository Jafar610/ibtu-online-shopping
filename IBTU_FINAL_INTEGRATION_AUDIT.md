# IBTU Final Frontend–Backend Integration Audit

**Audit Date:** 2026-11-25  
**Phase:** 6 — Step 10 (Final Integration Audit — Audit Only)  
**Scope:** Full React (`frontend/`) and Node.js/Express/MariaDB (`backend/`) codebase  

---

## 1. Overall Project Integration Status

- **Backend API & Database:** **Strong.** 15 automated backend test suites exist and all **15 suites passed** (`0` failures across all executed suites). Core commerce, RBAC, inventory reservation/deduction, manual payment verification, shipment fulfillment, and admin engagement modules are backed by MariaDB transactions, input validators, and `audit_logs`.
- **Frontend Production Build:** **Passes** (`vite build`, `2398` modules transformed in `10.99s`).
- **Frontend Linting:** **Fails** (`npm.cmd run lint` exits `1` due to missing `eslint-plugin-react-hooks` package in `frontend/node_modules` / `package.json`).
- **End-to-End Runtime Readiness:** **NOT ready for E2E testing yet** due to a **Critical response-unwrapping bug** discovered in 11 frontend API services (`res.data?.data` vs `res.data` mismatch with `apiClient.js`), plus several customer/public pages still using `localStorage`/`sessionStorage` mocks (`AccountDashboard.jsx`, `ProfilePage.jsx`, `ContactPage.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`).

---

## 2. Frontend Module Inventory & Classification

**Classification Legend:**
- **Fully Integrated:** Real backend APIs support the required workflow (barring the shared `res.data?.data` unwrapping defect noted in Section 4).
- **Partially Integrated:** Some operations use real backend APIs while others are unavailable or remain client-side.
- **Not Integrated:** Relies on mock data or browser storage (`localStorage`/`sessionStorage`).
- **Unavailable by Design:** UI honestly communicates that the backend does not currently support the feature.

### A. Public Shopping
| Module | File(s) | Classification | Evidence & Notes |
|---|---|---|---|
| Home | `HomePage.jsx` | Fully Integrated | Uses catalog APIs (`productApi`, `categoryApi`) for featured/catalog products. |
| Shop & Search | `ShopPage.jsx` | Fully Integrated | Uses `catalog/products` search/filter/sort/pagination; `localStorage` used only for `ibtu_recently_viewed`. |
| Categories | `ShopPage.jsx`, `AdminCategoriesPage.jsx` | Fully Integrated | Uses `/api/catalog/categories` and `/api/categories`. |
| Product Details | `ProductDetailsPage.jsx` | Fully Integrated | Uses `/api/catalog/products/:slugOrId` & `/related`; `localStorage` used only for `ibtu_recently_viewed`. |
| About | `AboutPage.jsx` | Fully Integrated (Static) | Static informational page. |
| Contact | `ContactPage.jsx` | **Not Integrated** | Still reads/writes `localStorage.getItem/setItem('ibtu_admin_contact_messages')`; no public `POST /api/contact-messages` backend route exists. |

### B. Authentication
| Module | File(s) | Classification | Evidence & Notes |
|---|---|---|---|
| Login & Register | `Login.jsx`, `Register.jsx`, `authApi.js`, `AuthContext.jsx` | Fully Integrated | Uses `POST /api/auth/login` and `POST /api/auth/register`. |
| Session Restoration & Logout | `AuthContext.jsx`, `authApi.js` | Fully Integrated | Uses `GET /api/auth/me`, `GET /api/auth/permissions`, `POST /api/auth/logout`. |
| Forgot Password | `ForgotPassword.jsx`, `authService.js` | **Not Integrated** | Calls `authService.forgotPassword()` (demo/mock only; no backend endpoint). |
| Reset Password | `ResetPassword.jsx`, `authService.js` | **Not Integrated** | Calls `authService.resetPassword()` (`res.isDemo`; no backend endpoint). |

### C. Customer Experience
| Module | File(s) | Classification | Evidence & Notes |
|---|---|---|---|
| Cart | `CartContext.jsx`, `CartPage.jsx`, `cartApi.js` | Fully Integrated | Uses `/api/cart` with `X-Guest-Token` and `/api/cart/merge`. Correctly uses `res.data`. |
| Wishlist | `WishlistContext.jsx`, `WishlistPage.jsx`, `wishlistApi.js` | Fully Integrated | Uses `/api/wishlist` including `POST /api/wishlist/items/:productId/add-to-cart`. Correctly uses `res.data`. |
| Addresses | `AddressesPage.jsx`, `addressApi.js` | Fully Integrated | Uses `/api/addresses` CRUD + `/default`. Correctly uses `res.data`. |
| Checkout, Coupons, Payment, Orders, Tracking | `CheckoutPage.jsx`, `PaymentPage.jsx`, `OrderConfirmationPage.jsx`, `OrdersPage.jsx`, `OrderDetailsPage.jsx`, `OrderTrackingPage.jsx`, `checkoutApi.js` | **Partially Integrated (Bugged)** | Wired to `/api/checkout/*`, `/api/coupons/validate`, `/api/orders/*`, `/api/payments/*`, **but** `checkoutApi.js` reads `res.data?.data` instead of `res.data` (see Section 4). |
| Account Dashboard | `AccountDashboard.jsx` | **Not Integrated** | Still imports `getStoredOrders, getStoredAddresses` from `frontend/src/data/customerData.js`. |
| Customer Profile | `ProfilePage.jsx` | **Not Integrated** | Simulates saving updates to `sessionStorage('ibtu_current_user')` (`"Frontend Demonstration"`). |

### D. Administration
| Module | File(s) | Classification | Evidence & Notes |
|---|---|---|---|
| Products | `AdminProductsPage.jsx`, `productApi.js` | Fully Integrated | Uses `/api/products`, `/variants`, `/images`. |
| Categories | `AdminCategoriesPage.jsx`, `categoryApi.js` | Fully Integrated | Uses `/api/categories`. |
| Inventory | `AdminInventoryPage.jsx`, `AdminInventoryMovementsPage.jsx` | Partially Integrated | Uses product/variant APIs for stock; movement ledger endpoints limited. |
| Orders | `AdminOrdersPage.jsx`, `AdminOrderDetailsPage.jsx`, `adminOrderApi.js` | Fully Integrated (with `res.data?.data` bug) | Wired to `/api/admin/orders/*`; affected by `res.data?.data` unwrapping bug. |
| Payments & Receipts | `AdminPaymentsPage.jsx`, `AdminPaymentDetailsPage.jsx`, `ReceiptReviewModal.jsx`, `adminPaymentApi.js` | Fully Integrated (with `res.data?.data` & Blob bug) | Wired to `/api/admin/payments/*`; affected by `res.data?.data` and `URL.createObjectURL(res.data)` bug. |
| Shipments | `AdminShipmentsPage.jsx`, `AdminShipmentDetailsPage.jsx`, `adminShipmentApi.js` | Fully Integrated (with `res.data?.data` bug) | Wired to `/api/admin/shipments/*`; affected by `res.data?.data` bug. |
| Customers | `AdminCustomersPage.jsx`, `AdminCustomerDetailsPage.jsx`, `adminCustomerApi.js` | Fully Integrated (with `res.data?.data` bug) | Wired to `/api/admin/customers/*`; affected by `res.data?.data` bug. |
| Reviews | `AdminReviewsPage.jsx`, `AdminReviewDetailsPage.jsx`, `adminReviewApi.js` | Fully Integrated (with `res.data?.data` bug) | Wired to `/api/admin/reviews/*`; affected by `res.data?.data` bug. |
| Contact Messages | `AdminMessagesPage.jsx`, `AdminMessageDetailsPage.jsx`, `ReplyComposer.jsx`, `adminContactMessageApi.js` | Partially Integrated | Status, staff assignment, and internal notes wired to `/api/admin/contact-messages/*` (with `res.data?.data` bug); outbound email reply is **Unavailable by Design**. |
| Coupons | `AdminCouponsPage.jsx`, `adminCouponApi.js` | Fully Integrated (with `res.data?.data` bug) | Wired to `/api/admin/coupons/*`; affected by `res.data?.data` bug. |
| Roles & Permissions | `AdminRolesPage.jsx`, `AdminRoleDetailsPage.jsx`, `adminRoleApi.js` | Partially Integrated | Read-only inspection wired to `GET /api/admin/roles` (with `res.data?.data` bug); role/permission mutations unavailable. |
| Dashboard | `AdminDashboard.jsx`, `AdminRecentOrders.jsx`, `SalesOverviewChart.jsx`, `AdminRecentActivities.jsx`, `adminReportApi.js` | Partially Integrated | Summary counts & recent orders wired to backend (with `res.data?.data` bug); monthly trend chart & activity feed **Unavailable by Design**. |
| Reports | `AdminReportsPage.jsx`, `adminReportApi.js` | Partially Integrated | Live summary & status breakdown computed from existing endpoints; historical trends & inventory valuation **Unavailable by Design**. |
| Settings | `AdminSettingsPage.jsx`, `adminSettingsApi.js` | Partially Integrated | Ethiopian payment instructions wired to `GET /api/payments/instructions` & `PUT /api/admin/payments/instructions/:method` (with `res.data?.data` bug); general/store/notification tabs **Unavailable by Design**. |
| Staff Users | `AdminUsersPage.jsx`, `AdminUserDetailsPage.jsx`, `adminUserApi.js` | **Unavailable by Design** | No `/api/admin/users` backend endpoints exist; mock persistence removed. |
| Audit Logs | `AdminAuditLogsPage.jsx`, `adminAuditLogApi.js` | **Unavailable by Design** | No `GET /api/admin/audit-logs` backend endpoint exists; mock persistence removed. |

---

## 3. Backend Endpoint Inventory

Mounted in `backend/src/app.js`:
- `/api/health` (`health.js`)
- `/api/auth` (`auth.routes.js` — rate-limited 30 req / 15 min)
- `/api/admin` (`admin.routes.js`: `/dashboard`, `/roles`)
- `/api/products`, `/api/categories`, `/api` (`variant.routes.js`, `product-image.routes.js`)
- `/api/catalog` (`catalog.routes.js`)
- `/api/cart` (`cart.routes.js`)
- `/api/wishlist` (`wishlist.routes.js`)
- `/api/addresses` (`address.routes.js`)
- `/api/checkout` (`checkout.routes.js`)
- `/api/orders` (`order.routes.js`)
- `/api/payments` (`payment.routes.js`)
- `/api/coupons` (`coupon.routes.js`)
- `/api/admin/orders` (`admin-order.routes.js`)
- `/api/admin/shipments` (`admin-shipment.routes.js`)
- `/api/admin/payments` (`admin-payment.routes.js`)
- `/api/admin/coupons` (`admin-coupon.routes.js`)
- `/api/admin/customers` (`admin-customer.routes.js`)
- `/api/admin/reviews` (`admin-review.routes.js`)
- `/api/admin/contact-messages` (`admin-contact-message.routes.js`)

---

## 4. API Integration Consistency Findings

### Critical Defect: `apiClient.js` Response Unwrapping Mismatch
- `frontend/src/services/api/apiClient.js` line 63 returns `response.data` directly (`{ success, message, data, meta }`).
- `addressApi.js`, `cartApi.js`, and `wishlistApi.js` correctly read `res.data`.
- **11 services** (`checkoutApi.js`, `adminOrderApi.js`, `adminPaymentApi.js`, `adminShipmentApi.js`, `adminCustomerApi.js`, `adminReviewApi.js`, `adminContactMessageApi.js`, `adminCouponApi.js`, `adminRoleApi.js`, `adminReportApi.js`, `adminSettingsApi.js`) mistakenly read `res.data?.data` (double `.data`), which evaluates to `undefined` at runtime.
- In `adminPaymentApi.js` line 142, `getReceiptBlobUrl` calls `URL.createObjectURL(res.data)` with `responseType: 'blob'`, whereas `apiClient.js` returns the `Blob` itself as `res`.

### Other Consistency Observations
- No duplicate Axios instances (`axios.create` appears only in `apiClient.js`).
- No hardcoded backend API URLs in services (all use `API_ENDPOINTS` + `API_BASE_URL`).
- Unused legacy mock data files still exist under `frontend/src/data/` (`admin/*.js`, `customerData.js`, `products.js`, `categories.js`, `reviews.js`); only `customerData.js` is still actively imported by `AccountDashboard.jsx`.

---

## 5. Authentication & RBAC Findings

- **Backend Authorization:** `authenticate` (`auth.middleware.js`) verifies JWT signature & expiry and queries `users.is_active` live in MariaDB. `requireRole` and `requirePermission` (`permission.middleware.js`) query `roles`, `user_roles`, `permissions`, and `role_permissions` live in MariaDB (preventing stale JWT claim escalation).
- **Role & Permission Alignment:** Backend roles (`Admin`, `Data Encoder`, `Customer`) are normalized to lowercase snake_case on the frontend (`admin`, `data_encoder`, `customer`).
- **401 Handling:** `apiClient.js` clears `AUTH_STORAGE_KEYS.TOKEN` and `AUTH_STORAGE_KEYS.USER` and dispatches `ibtu:auth:expired` on `401` for non-auth routes.
- **Data Encoder Isolation:** Verified by tests (`rbac.test.js`, `admin-engagement.test.js`, `admin-step9.test.js`): Data Encoder has `16` catalog/inventory/view permissions, and is blocked (`403`) from `/api/admin/dashboard`, `/api/admin/roles`, `/api/admin/orders`, `/api/admin/payments`, `/api/admin/shipments`, `/api/admin/coupons`, and mutations on `/api/admin/customers`, `/api/admin/reviews`, and `/api/admin/contact-messages`.

---

## 6. Business Workflow Audit

- **Customer Shopping Workflow:** Catalog → Cart → Wishlist → Checkout Preview → Order Creation → Payment Receipt Upload → Order History/Tracking are all wired in backend and frontend (subject to fixing `res.data?.data` in `checkoutApi.js`).
- **Inventory Workflow:** Verified by `order-fulfillment.test.js` (`92 passed, 0 failed`): stock reservation on checkout, physical stock deduction on `shipped`, idempotency guard against double-deduction, and reservation release on cancellation.
- **Payment Workflow:** Verified by `checkout-payment.test.js` (`64 passed, 0 failed`): manual receipt upload sets `verification_status = 'awaiting_review'` while keeping order `pending`/`unpaid`; only `Admin` approval (`PATCH /api/admin/payments/:id/approve`) marks payment `successful` and order `paid`/`confirmed`.
- **Administrative Workflow:** Orders, payments, shipments, customers, reviews, contact-message moderation/assignment/notes, coupons, and payment instructions have real backend APIs; staff user management, role/permission mutations, outbound contact email replies, audit log reading, general store settings, and time-series reports do not have backend APIs.

---

## 7. Database Consistency Findings

- Inspected 26 MariaDB tables (`audit_logs`, `cart_items`, `carts`, `categories`, `contact_messages`, `coupon_usages`, `coupons`, `customer_addresses`, `inventory_movements`, `inventory_stock_summary`, `newsletter_subscribers`, `order_items`, `orders`, `payments`, `permissions`, `product_images`, `product_reviews`, `product_variants`, `products`, `role_permissions`, `roles`, `shipments`, `user_roles`, `users`, `wishlist_items`, `wishlists`).
- Foreign keys, unique constraints, enum values (`order_status`, `payment_status`, `shipment_status`, `review_status`, `message_status`), and order-item/address snapshots are consistent with backend queries.
- No `settings` table exists in the schema.

---

## 8. Security & Configuration Findings

| Severity | Finding | Details |
|---|---|---|
| **Critical** | `res.data?.data` unwrapping bug in 11 frontend API services | Causes checkout & admin API responses to resolve to `undefined` at runtime. |
| **Medium** | Default fallback JWT secret in `auth.middleware.js` | `process.env.JWT_SECRET \|\| 'ibtu_default_secure_secret_key'` — production deployments must enforce a strong `JWT_SECRET` env var and fail fast if missing. |
| **Medium** | `ContactPage.jsx` stores user inquiries in `localStorage` | Public contact form writes to browser `localStorage` instead of a backend endpoint. |
| **Low** | Missing `eslint-plugin-react-hooks` in `frontend/package.json` | Causes `npm run lint` to fail. |
| **Pass** | Helmet, CORS, Rate Limiting, Parameterized SQL, Private Receipts | `helmet`, `cors` with credentials, `/api` (`100/15m`) & `/api/auth` (`30/15m`) rate limiters, parameterized `pool.execute` queries, `password_hash` omitted from responses, and receipts streamed via authenticated `res.sendFile()`. |

---

## 9. Build & Test Results

### Frontend
- `npm.cmd run build` (`vite build`): **PASSED** (`2398` modules transformed, `10.99s`).
- `npm.cmd run lint` (`eslint .`): **FAILED** (`ERR_MODULE_NOT_FOUND: Cannot find package 'eslint-plugin-react-hooks'`).
- Frontend unit/E2E tests: **Not available** (no test runner configured in `frontend/package.json`).

### Backend (All 15 Suites Executed — All Passed)
1. `auth.test.js`: **12 passed, 0 failed**
2. `rbac.test.js`: **10 passed, 0 failed**
3. `catalog.test.js`: **58 passed, 0 failed**
4. `category.test.js`: **43 passed, 0 failed**
5. `product.test.js`: **37 passed, 0 failed**
6. `variant.test.js`: *(executed, exit 0; summary check below)*
7. `product-image.test.js`: *(executed, exit 0)*
8. `cart.test.js`: **52 passed, 0 failed**
9. `wishlist.test.js`: **42 passed, 0 failed**
10. `address.test.js`: **41 passed, 0 failed**
11. `coupon.test.js`: **80 passed, 0 failed**
12. `checkout-payment.test.js`: **64 passed, 0 failed**
13. `order-fulfillment.test.js`: **92 passed, 0 failed**
14. `admin-engagement.test.js`: **26 passed, 0 failed**
15. `admin-step9.test.js`: **9 passed, 0 failed**

---

## 10. Recommendations

1. **Immediately fix `res.data?.data` → `res.data`** across all 11 affected frontend API services (and `URL.createObjectURL(res)` for Blob in `adminPaymentApi.js`) before running E2E browser tests.
2. **Integrate remaining customer/public pages** (`AccountDashboard.jsx`, `ProfilePage.jsx`, `ContactPage.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`) with backend endpoints.
3. **Install `eslint-plugin-react-hooks`** in `frontend` so `npm run lint` passes.
4. **Add missing backend endpoints** prioritized in `IBTU_REMAINING_WORK_ROADMAP.md` (audit log read API, staff user management, public contact submission, reporting endpoints, and settings persistence if required).
