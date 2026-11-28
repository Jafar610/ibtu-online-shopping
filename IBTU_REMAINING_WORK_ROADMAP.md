# IBTU Remaining Work Roadmap

**Date:** 2026-11-25  
**Source:** Phase 6 Step 10 Final Integration Audit  

---

## 1. Critical Fixes (Blockers for End-to-End Testing)

### 1.1 Fix `apiClient.js` Response Unwrapping Mismatch (`res.data?.data` → `res.data`)
- **Feature:** Frontend API Service Layer (Checkout & Admin Modules)
- **Current Status:** `apiClient.js` interceptor returns `response.data`, but 11 services access `res.data?.data` (resolving to `undefined`), and `adminPaymentApi.getReceiptBlobUrl` passes `res.data` instead of `res` (`Blob`) to `URL.createObjectURL()`.
- **Relevant Frontend Files:** `frontend/src/services/api/checkoutApi.js`, `adminOrderApi.js`, `adminPaymentApi.js`, `adminShipmentApi.js`, `adminCustomerApi.js`, `adminReviewApi.js`, `adminContactMessageApi.js`, `adminCouponApi.js`, `adminRoleApi.js`, `adminReportApi.js`, `adminSettingsApi.js`
- **Dependencies:** None
- **Priority:** **Critical**

### 1.2 Fix ESLint Configuration Dependency
- **Feature:** Frontend Linting
- **Current Status:** `npm run lint` fails with `ERR_MODULE_NOT_FOUND: Cannot find package 'eslint-plugin-react-hooks'`.
- **Relevant Frontend Files:** `frontend/package.json`, `frontend/eslint.config.js`
- **Dependencies:** None
- **Priority:** **Critical** (CI/code quality)

---

## 2. High-Priority Backend & Frontend Integration

### 2.1 Public Contact Form Backend Endpoint (`POST /api/contact-messages`)
- **Feature:** Public Contact Us Submission
- **Current Status:** `ContactPage.jsx` saves messages to `localStorage('ibtu_admin_contact_messages')`.
- **Missing Capability:** Public `POST /api/contact-messages` endpoint inserting into `contact_messages` table with validation and rate limiting.
- **Relevant Files:** `frontend/src/pages/ContactPage.jsx`; new `backend/src/routes/contact-message.routes.js`
- **Priority:** **High**

### 2.2 Customer Account Dashboard & Profile Update APIs
- **Feature:** Customer Overview & Profile Editing
- **Current Status:** `AccountDashboard.jsx` reads `customerData.js` (`localStorage`); `ProfilePage.jsx` writes to `sessionStorage('ibtu_current_user')`.
- **Missing Capability:** Connect `AccountDashboard.jsx` to `checkoutApi.getCustomerOrders()` and `addressApi.getAddresses()`; add `PATCH /api/auth/me` (or `/api/customer/profile`) for permitted profile updates (`first_name`, `last_name`, `phone`).
- **Relevant Files:** `frontend/src/pages/customer/AccountDashboard.jsx`, `ProfilePage.jsx`; `backend/src/routes/auth.routes.js`
- **Priority:** **High**

### 2.3 Forgot Password & Reset Password Backend Flow
- **Feature:** Self-Service Password Recovery
- **Current Status:** `ForgotPassword.jsx` and `ResetPassword.jsx` use mock `authService.js`.
- **Missing Capability:** `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` with secure time-limited token storage and SMTP email delivery.
- **Relevant Files:** `frontend/src/pages/auth/ForgotPassword.jsx`, `ResetPassword.jsx`, `frontend/src/services/authService.js`; `backend/src/routes/auth.routes.js`
- **Priority:** **High**

---

## 3. Medium-Priority Improvements

### 3.1 Staff User Management API (`/api/admin/users`)
- **Feature:** Admin Staff Account Management
- **Current Status:** `AdminUsersPage.jsx` and `AdminUserDetailsPage.jsx` are Unavailable by Design.
- **Missing Capability:** `GET /api/admin/users`, `POST /api/admin/users`, `PATCH /api/admin/users/:id`, role assignment with last-active-admin protection.
- **Relevant Files:** `frontend/src/pages/admin/AdminUsersPage.jsx`, `AdminUserDetailsPage.jsx`, `frontend/src/services/api/adminUserApi.js`
- **Priority:** **Medium**

### 3.2 Audit Log Viewing API (`GET /api/admin/audit-logs`)
- **Feature:** Read-Only Security Audit Ledger
- **Current Status:** Backend writes to `audit_logs`, but `AdminAuditLogsPage.jsx` and `AdminRecentActivities.jsx` are Unavailable by Design because no read endpoint exists.
- **Missing Capability:** `GET /api/admin/audit-logs` with action, user, entity_type, date filters, and pagination (`requirePermission('audit_logs.view')`).
- **Relevant Files:** `frontend/src/pages/admin/AdminAuditLogsPage.jsx`, `AdminRecentActivities.jsx`, `adminAuditLogApi.js`
- **Priority:** **Medium**

### 3.3 Dedicated Reporting & Time-Series Analytics (`/api/admin/reports/*`)
- **Feature:** Monthly Sales Trends, Product Performance, Inventory Valuation
- **Current Status:** `SalesOverviewChart.jsx` is Unavailable by Design; `AdminReportsPage.jsx` computes only sampled summaries.
- **Missing Capability:** SQL aggregation endpoints for monthly ETB revenue/orders, top-selling products, and low-stock/inventory valuation.
- **Relevant Files:** `frontend/src/pages/admin/AdminReportsPage.jsx`, `SalesOverviewChart.jsx`, `adminReportApi.js`
- **Priority:** **Medium**

### 3.4 Outbound Email Reply for Contact Messages
- **Feature:** Admin Inquiry Email Replies
- **Current Status:** `ReplyComposer.jsx` is Unavailable by Design.
- **Missing Capability:** SMTP/email provider integration + `POST /api/admin/contact-messages/:id/reply` updating `replied_at`.
- **Relevant Files:** `frontend/src/components/admin/ReplyComposer.jsx`, `backend/src/services/notification.service.js`
- **Priority:** **Medium**

---

## 4. Low-Priority Enhancements & Future Features

### 4.1 Role & Permission Mutation APIs
- **Current Status:** Read-only via `GET /api/admin/roles`.
- **Missing Capability:** `POST/PATCH /api/admin/roles` and `PUT /api/admin/roles/:id/permissions` with privilege-escalation guards.
- **Priority:** **Low**

### 4.2 Persistent Store Settings Table & API
- **Current Status:** Payment instructions persist via `PUT /api/admin/payments/instructions/:method`; general/store/notification tabs are Unavailable by Design (no `settings` table).
- **Missing Capability:** Approved DB migration for `store_settings` table + `GET/PUT /api/admin/settings`.
- **Priority:** **Low**

### 4.3 Production Hardening & Cleanup
- Enforce required `JWT_SECRET` (remove fallback default in `auth.middleware.js` for `NODE_ENV=production`).
- Remove unused legacy mock files in `frontend/src/data/` once `AccountDashboard.jsx` is migrated.
- Add code-splitting (`manualChunks`) in Vite to reduce the `1.27 MB` main JS bundle warning.

---

## Recommended Implementation Order
1. **Fix `res.data?.data` → `res.data` in all 11 API services** + fix `eslint-plugin-react-hooks` → **Run full E2E browser smoke tests**.
2. **Integrate `AccountDashboard.jsx`, `ProfilePage.jsx`, and `ContactPage.jsx`** (`POST /api/contact-messages`, `PATCH /api/auth/me`).
3. **Implement `GET /api/admin/audit-logs`** and **`/api/admin/users`**.
4. **Implement `/api/admin/reports/*`** and **SMTP email service** (shared by Forgot Password & Contact Replies).
