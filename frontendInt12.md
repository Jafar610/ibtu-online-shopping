# Phase 5 – Step 8.5: Admin Users, Roles, Coupons, Reports, Settings, and Audit Logs

## Objective

Complete the remaining Admin Dashboard management modules for the IBTU e-commerce platform.

Implement:

1. User Management
2. Role and Permission Management
3. Coupon Management
4. Reports and Analytics
5. System Settings
6. Audit Log Viewer

This is a frontend-only development milestone.

Do not connect to backend APIs or modify the MariaDB database.

---

## 1. Inspect the Existing Project

Before development:

1. Inspect the actual React project structure.
2. Review the Admin Dashboard foundation.
3. Review all completed management modules from Steps 8.1–8.4.
4. Inspect the existing authentication and RBAC structures.
5. Review existing coupon mock data and checkout coupon functionality.
6. Review existing sales, order, inventory, and customer mock data.
7. Inspect existing settings and audit log structures, if present.
8. Identify reusable tables, forms, filters, modals, and dashboard components.

Do not assume earlier milestones are complete. Verify the actual source code.

Preserve existing functionality and reuse existing components.

---

## 2. User Management

**Route:** `/admin/users`

### A. User Listing

Display:

- User name
- Email
- Phone
- Assigned role
- Account status
- Registration date
- Last login, if available
- Actions

Include:

- Search by name or email.
- Filter by role.
- Filter by account status.
- Sort and pagination.
- Empty state.

### B. User Details

**Route:** `/admin/users/:userId`

Display:

- Personal information.
- Assigned roles.
- Account status.
- Registration date.
- Last login, if available.
- Relevant administrative information.

Never display password hashes, authentication tokens, or secrets.

### C. User Actions

Implement frontend mock interactions for:

- Create user.
- Edit user information.
- Assign or change roles.
- Activate/deactivate user.

Require confirmation for sensitive actions.

Do not implement password recovery, password resets, or real account creation.

Do not allow administrators to deactivate their own account through this interface.

---

## 3. Role and Permission Management

**Routes:**

- `/admin/roles`
- `/admin/roles/:roleId`

### A. Role Listing

Display:

- Role name.
- Description.
- Number of assigned users.
- Number of permissions.
- Actions.

Use the existing roles:

- Admin
- Data Encoder
- Customer

Do not invent additional system roles.

### B. Role Details

Display:

- Role name.
- Description.
- Assigned users.
- Available permissions.
- Assigned permissions.

### C. Permission Management

Review the existing permission definitions before implementation.

Existing permission groups may include:

- Dashboard
- Products
- Categories
- Inventory
- Orders
- Customers
- Users
- Roles
- Settings
- Audit Logs

Use only permissions that actually exist in the project.

Implement a permission matrix with:

- Permission name.
- Description.
- Assigned status.
- Category.

If permissions are grouped by action, display available actions such as view, create, update, and delete.

### Important RBAC Rules

- Admin retains all existing administrative permissions.
- Data Encoder must not receive users.manage, roles.manage, settings.manage, or audit_logs.view.
- Customer must not receive administrative permissions.
- Prevent accidental removal of the final administrator's administrative access.
- Do not invent new permissions.
- Do not modify database roles or permission records.

All changes are mock frontend changes only.

---

## 4. Coupon Management

**Route:** `/admin/coupons`

### A. Coupon Listing

Display:

- Coupon code.
- Description.
- Discount type.
- Discount value.
- Minimum order amount.
- Maximum discount amount.
- Usage limit.
- Usage count.
- Start date.
- Expiration date.
- Active status.
- Actions.

### B. Add Coupon

Create a coupon form supporting:

- Coupon code.
- Description.
- Discount type: Percentage or Fixed.
- Discount value.
- Minimum order amount.
- Maximum discount amount.
- Total usage limit.
- Per-customer usage limit.
- Start date.
- Expiration date.
- Active/inactive status.

### C. Edit Coupon

Allow authorized administrators to edit existing coupon information through frontend mock state.

### D. Coupon Validation

Implement frontend form validation:

- Coupon code is required.
- Coupon code must be unique within mock data.
- Discount value must be positive.
- Percentage discounts must not exceed 100%.
- Fixed discounts must be valid monetary amounts.
- Minimum order amount cannot be negative.
- Maximum discount amount cannot be negative.
- Expiration must be later than the start date.
- Usage limits must be valid positive integers when provided.

### E. Coupon Actions

Implement:

- Create coupon.
- Edit coupon.
- Activate/deactivate coupon.
- View coupon usage details.
- Delete coupon with confirmation, if consistent with existing checkout references.

Ensure coupon calculations are consistent with the existing checkout frontend.

Do not change checkout functionality unnecessarily.

Do not invent coupon usage records.

---

## 5. Reports and Analytics

**Route:** `/admin/reports`

Create a professional reporting dashboard.

Use existing mock data from:

- Orders.
- Payments.
- Products.
- Inventory.
- Customers.
- Coupons.

### A. Summary Metrics

Display available metrics such as:

- Total Revenue.
- Total Orders.
- Average Order Value.
- Total Customers.
- Total Products.
- Pending Orders.
- Low Stock Products.
- Successful Payments.

Clearly identify mock data.

### B. Sales Report

Include:

- Revenue over time.
- Order count over time.
- Sales by order status.
- Sales by payment method.

### C. Product Report

Include:

- Best-selling products.
- Product sales quantities.
- Product revenue.
- Low-stock products.
- Out-of-stock products.

### D. Customer Report

Include:

- New customers.
- Repeat customers.
- Customer order counts.
- Customer lifetime value where data exists.

### E. Coupon Report

Include:

- Coupon usage.
- Discount amounts.
- Active coupons.
- Expired coupons.

### F. Filters and Export

Provide:

- Date range filter.
- Report category filter.
- Reset filters.
- CSV export where appropriate.

CSV exports must contain the currently filtered data and use meaningful column headings.

Do not add new chart libraries without approval. Reuse existing chart components or existing visualization methods.

Do not fabricate revenue or other business metrics.

---

## 6. System Settings

**Route:** `/admin/settings`

Create a structured settings interface.

Organize settings into sections:

### A. General Settings

- Store name.
- Store description.
- Store logo preview, if available.
- Default currency.
- Time zone.
- Contact email.
- Contact phone.

### B. Store Settings

- Store status.
- Product display preferences.
- Default low-stock threshold, only if supported.
- Order-related display preferences.

### C. Payment Settings

Display the supported payment methods:

- Cash on Delivery.
- Telebirr.
- CBE Birr.
- Bank Transfer.
- Card.

Allow frontend mock activation/deactivation of methods only.

Do not invent merchant account numbers, bank account details, API credentials, or payment provider secrets.

### D. Notification Preferences

Display configurable mock preferences for:

- New order notifications.
- Low-stock notifications.
- New customer notifications.
- New contact message notifications.

Do not implement real email, SMS, or push notification delivery.

### Important Settings Rules

- Reuse existing settings structures if available.
- Keep settings organized and validated.
- Require confirmation before important changes.
- Clearly identify frontend-only mock settings.
- Do not store secrets or credentials in localStorage.

---

## 7. Audit Log Viewer

**Route:** `/admin/audit-logs`

Create a read-only audit log management page.

### A. Audit Log Listing

Display:

- Date and time.
- User.
- Action.
- Entity type.
- Entity ID.
- Description.
- IP address, if available.

### B. Filters

Implement:

- Search by user or description.
- Filter by action.
- Filter by entity type.
- Filter by date range.
- Sorting.
- Pagination.

### C. Audit Log Details

Provide a details modal displaying:

- User.
- Action.
- Entity type.
- Entity ID.
- Description.
- Old values, if available.
- New values, if available.
- Date and time.

Display JSON values in a readable format.

### Important Audit Rules

- Audit logs are read-only.
- Do not implement edit or delete actions.
- Never display passwords, tokens, or other secrets.
- Do not fabricate real IP addresses or real administrative activity.
- Clearly label mock audit records.

---

## 8. Shared Components

Reuse existing Admin Dashboard components.

Create additional components only when necessary:

- UserTable
- UserForm
- UserFilters
- RoleTable
- PermissionMatrix
- CouponTable
- CouponForm
- CouponUsageDetails
- ReportFilters
- ReportMetricCard
- ReportExportButton
- SettingsSection
- AuditLogTable
- AuditLogDetails

Keep components modular.

Avoid creating unnecessarily large page components.

---

## 9. State Management and Mock Data

Use the existing project state-management approach.

Requirements:

1. Reuse existing user, role, permission, coupon, order, payment, inventory, and customer mock data.
2. Keep mock data organized separately from page components.
3. Maintain consistent relationships across modules.
4. Ensure frontend changes update relevant listings and details.
5. Keep report calculations consistent with the underlying mock records.
6. Ensure coupon changes are reflected in checkout mock behavior where appropriate.
7. Clearly identify mock data and simulated operations.
8. Do not introduce a new state-management library.

Do not claim that mock changes have been saved to the real IBTU database.

---

## 10. Routing and Navigation

Add or update:

- `/admin/users`
- `/admin/users/:userId`
- `/admin/roles`
- `/admin/roles/:roleId`
- `/admin/coupons`
- `/admin/reports`
- `/admin/settings`
- `/admin/audit-logs`

Requirements:

- Use the existing AdminLayout.
- Preserve sidebar navigation.
- Maintain breadcrumbs.
- Highlight active navigation items.
- Handle invalid record IDs gracefully.
- Preserve protected-route behavior.

---

## 11. Role and Permission Preparation

Use the existing authorization model.

Expected access:

**Admin**
- Full access to authorized administration modules.

**Data Encoder**
- Only access permitted by existing permissions.

**Customer**
- No administrative access.

Important:

- Do not invent permission names.
- Do not modify database RBAC.
- Do not bypass existing protected routes.
- Keep the audit log viewer restricted to existing authorized roles.
- Ensure the frontend does not expose administrative functionality to customers.

---

## 12. UI and Design Requirements

Follow the established IBTU Admin Dashboard design.

Brand colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

Requirements:

- Consistent page layouts.
- Professional tables.
- Clear forms and validation messages.
- Readable permission matrix.
- Attractive report charts.
- Consistent status badges.
- Responsive layouts.
- Accessible controls.
- Desktop, tablet, and mobile support.

Do not redesign the public website or Admin Dashboard foundation.

---

## 13. Testing and Verification

### User Management
- User listing works.
- Search and filters work.
- User details display correctly.
- Role assignment mock behavior works.
- Activation/deactivation requires confirmation.
- Sensitive information is not exposed.

### Role Management
- Role listing works.
- Permission matrix displays correctly.
- Existing role restrictions are respected.
- Final administrator protection works.
- No nonexistent permissions are introduced.

### Coupon Management
- Coupon listing works.
- Add and edit forms validate correctly.
- Duplicate coupon codes are rejected.
- Percentage and fixed discounts calculate correctly.
- Coupon status changes work.
- Checkout mock behavior remains consistent.

### Reports
- Summary metrics calculate from mock data.
- Filters update report results.
- Charts display correctly.
- CSV export contains filtered data.

### Settings
- Settings sections display correctly.
- Mock settings update correctly.
- Sensitive values are not stored.
- Confirmation dialogs work.

### Audit Logs
- Listing and filters work.
- Details display correctly.
- Records remain read-only.
- Sensitive values are not exposed.

### Regression
- Admin Dashboard works.
- Steps 8.1–8.4 modules remain functional.
- Public storefront remains functional.
- Customer Account pages remain functional.
- Cart, Wishlist, and Checkout remain functional.
- No console errors.
- Production build succeeds.

---

## 14. Strict Scope Restrictions

Do not:

- Connect to backend APIs.
- Modify the MariaDB database.
- Create or modify backend endpoints.
- Change authentication logic.
- Add new roles or permissions to the database.
- Implement real payment provider configuration.
- Send emails or notifications.
- Modify real audit logs.
- Install new dependencies without approval.
- Change unrelated public website functionality.

If a feature depends on missing backend functionality, document it instead of simulating a real server operation.

---

## 15. Final Checkpoint Report

After implementation, provide:

1. Files created.
2. Files modified.
3. User Management features completed.
4. Role and Permission Management features completed.
5. Coupon Management features completed.
6. Reports and Analytics features completed.
7. System Settings features completed.
8. Audit Log Viewer features completed.
9. Routes added or updated.
10. Reusable components created.
11. Mock data and state-management approach.
12. Role and permission behavior.
13. Tests performed and results.
14. Known issues or incomplete features.
15. Confirmation that no backend or database changes were made.

**STOP after completing Step 8.5. Do not start the next phase until I review and approve the checkpoint report.**