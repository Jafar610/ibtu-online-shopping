# IBTU – Phase 6, Step 9
## Admin Users, Roles, Coupons, Reports, Settings, and Audit Logs API Integration

### 1. Objective

Integrate the remaining IBTU administration modules with the existing backend.

The scope includes:

1. Staff user management.
2. Role and permission management.
3. Coupon management.
4. Reports and analytics.
5. System settings.
6. Audit log viewing.

Replace mock data and localStorage-based persistence with backend-authoritative data wherever the backend supports the required functionality.

**Important:** This is an integration milestone. Do not redesign the admin dashboard, invent backend capabilities, or modify database schemas without approval.

### 2. Inspect the Existing Project First

Before editing, inspect the actual frontend and backend implementation.

**Frontend**
- Admin Users page.
- User creation and editing forms.
- Admin Roles page.
- Permission matrix.
- Coupon management page.
- Reports and analytics pages.
- Settings page.
- Audit Logs page.
- Existing API service conventions.
- Authentication and RBAC implementation.
- Existing dashboard statistics and charts.

**Backend**
- User management routes, controllers, and services.
- Role and permission routes, controllers, and services.
- Coupon routes, controllers, and services.
- Reports or analytics endpoints.
- Settings storage and configuration.
- Audit log routes and services.
- Authorization middleware.
- Database tables and relationships.

Inspect actual routes, HTTP methods, payloads, validation, permissions, response structures, and persistence behavior.

Prepare a short implementation plan before editing.

### 3. Create or Extend Frontend API Services

Create or extend:

- `adminUserApi.js`
- `adminRoleApi.js`
- `adminCouponApi.js`
- `adminReportApi.js`
- `adminSettingsApi.js`
- `adminAuditLogApi.js`

Use the existing Axios client and centralized error handling.

Reuse equivalent services if they already exist.

Do not create another Axios instance or hardcode API URLs.

For every service, document the actual backend endpoint and response structure.

If a feature has no backend implementation, document it as a gap instead of simulating successful persistence.

### 4. Staff User Management

Connect the Admin Users page to the backend.

Inspect the existing `users`, `roles`, and `user_roles` implementation.

Support only operations actually available in the backend, such as:

- List staff users.
- Search and filter users.
- Retrieve user details.
- Create staff accounts.
- Update permitted profile fields.
- Activate or deactivate accounts.
- Assign roles.
- Retrieve assigned roles.

**Important business rules:**

- Do not expose password hashes.
- Never return passwords or authentication secrets.
- Use the existing secure account creation and password hashing process.
- Do not allow unauthorized role escalation.
- Customer accounts must not accidentally become administrative accounts.
- Do not allow the last active administrator to be removed or disabled if backend business rules prohibit it.
- Do not allow an administrator to modify their own critical permissions if backend rules prohibit it.

Do not introduce insecure password editing or direct database updates from the frontend.

### 5. Role and Permission Management

Connect the existing Roles page and permission matrix to the real backend.

Inspect:

- `roles`
- `permissions`
- `role_permissions`
- Existing role-management endpoints.

Implement backend-supported functionality:

- List roles.
- Retrieve role details.
- Display assigned permissions.
- Create roles if supported.
- Update roles if supported.
- Assign or remove permissions if supported.

**Critical RBAC requirements:**

1. Admin must retain the required administrative permissions.
2. Data Encoder must not gain unauthorized access to user, role, settings, or audit management.
3. Customer must not receive administrative permissions.
4. Changes must use backend authorization.
5. Permission changes must not silently invalidate the current administrator's access.
6. Prevent privilege escalation and unauthorized role assignment.

Do not invent permissions or change the existing permission model without approval.

Before modifying any role or permission data, inspect the existing backend implementation and confirm that the operation is supported.

### 6. Coupon Management

Connect the existing Coupons page to the backend coupon API.

Inspect the existing `coupons` and `coupon_usages` tables and their service implementation.

Support backend-implemented operations:

- List coupons.
- Search and filter coupons.
- Retrieve coupon details.
- Create coupons.
- Update coupons.
- Activate or deactivate coupons.
- View usage information if supported.

Expected coupon information may include:

- Coupon code.
- Description.
- Discount type.
- Discount value.
- Minimum order amount.
- Maximum discount amount.
- Usage limit.
- Usage count.
- Per-customer usage limit.
- Start date.
- Expiry date.
- Active status.

Use actual backend field names and validation rules.

**Business rules:**

- Coupon codes must follow backend uniqueness rules.
- Discount values must be validated by the backend.
- Expired coupons must not be presented as active.
- Usage limits must remain transaction-safe.
- Coupon usage counts must not be manually fabricated by the frontend.
- Do not change coupon usage history.
- Do not bypass checkout coupon validation.

Do not duplicate the coupon validation logic already integrated into checkout.

### 7. Reports and Analytics

Connect the existing Reports page and dashboard analytics to real backend data where reporting endpoints exist.

Inspect the existing report implementation before changing charts.

Potential report categories include:

- Sales summary.
- Order statistics.
- Revenue trends.
- Payment statistics.
- Product performance.
- Inventory summary.
- Customer statistics.
- Coupon usage.

Use only metrics supported by actual backend queries and business definitions.

Requirements:

- Use backend-calculated values.
- Respect date filters.
- Respect pagination or aggregation limits where applicable.
- Display loading and error states.
- Clearly identify the currency as ETB where monetary values are displayed.
- Avoid calculating revenue from unrelated order statuses.
- Do not count pending or failed payments as successful revenue.
- Avoid double-counting orders with multiple payment attempts.
- Do not use shipment totals as sales totals.

If report endpoints are missing, document exactly which reports cannot yet be connected.

Do not create fake report values or misleading charts.

### 8. System Settings

Inspect the existing Settings page and backend configuration.

Determine which settings are currently persisted and which are only frontend mock data.

Potential settings include:

- Store name.
- Store contact details.
- Store address.
- Currency.
- Shipping configuration.
- Tax configuration.
- Payment instructions.
- Notification preferences.

Connect only settings supported by the backend.

Requirements:

- Use persistent backend storage.
- Validate settings using backend rules.
- Restrict sensitive changes to authorized administrators.
- Do not expose secrets in API responses.
- Do not return database credentials, API keys, payment secrets, or JWT secrets.
- Do not allow arbitrary modification of environment variables through the frontend.
- Ensure payment instructions shown during checkout remain consistent with the backend configuration.

If settings are stored only in environment variables and there is no secure settings-management API, do not invent a public update mechanism. Document the limitation.

### 9. Audit Log Management

Connect the existing Audit Logs page to the backend.

Inspect the existing `audit_logs` table and audit logging service.

Support available operations:

- List audit logs.
- Search or filter by action.
- Filter by user.
- Filter by entity type.
- Filter by date range.
- Retrieve detailed audit records.
- Paginate results.

Display available information such as:

- User.
- Action.
- Entity type.
- Entity ID.
- Description.
- Timestamp.
- Old values.
- New values.

**Security requirements:**

- Audit logs must remain append-only.
- The frontend must not provide edit or delete functionality.
- Only authorized users can view audit logs.
- Sensitive values such as passwords, tokens, and payment credentials must not be exposed.
- Do not create fake audit events in the frontend.

If any expected administrative action is not logged by the backend, document the gap.

### 10. Admin Dashboard Integration

Inspect the existing Admin Dashboard.

Connect its statistics and summary cards to existing real backend reporting endpoints where possible.

Potential indicators include:

- Total orders.
- Pending orders.
- Successful revenue.
- Pending payments.
- Total customers.
- Active products.
- Low-stock products.
- Pending reviews.

Use actual backend definitions and endpoints.

Do not reuse stale mock dashboard values.

Do not create additional report endpoints or change business calculations without documenting the need.

If some dashboard metrics remain unavailable, display an appropriate unavailable state instead of a fabricated zero.

### 11. Role and Permission Enforcement

Verify every administrative module against the existing RBAC system.

Test:

- Admin access.
- Data Encoder access.
- Customer denial.
- Unauthorized direct API requests.
- Unauthorized frontend route access.
- Unauthorized mutation attempts.

The backend must remain the final authorization authority.

Do not rely on hidden frontend buttons as the only security measure.

Do not create or change permissions without documenting the existing permission model and obtaining approval where database or authorization-model changes are necessary.

### 12. Preserve Existing Functionality

Do not:

- Redesign the admin dashboard.
- Change IBTU brand colors or typography.
- Modify customer checkout.
- Modify payment approval workflows.
- Modify shipment fulfillment.
- Modify cart or wishlist functionality.
- Change customer authentication.
- Modify database schema without approval.
- Expose secrets.
- Simulate persistent settings or report data.
- Create fake audit logs.
- Introduce unauthorized permission changes.

Reuse existing frontend components, API services, and design patterns.

### 13. Testing and Validation

Test each module.

**Staff users**
- List users.
- Search users.
- Create staff accounts if supported.
- Update permitted fields.
- Assign permitted roles.
- Activate or deactivate accounts if supported.
- Verify password hashes are never exposed.

**Roles and permissions**
- Load roles.
- Display permission matrix.
- Create or update roles if supported.
- Verify permission changes.
- Test privilege escalation prevention.
- Verify Admin and Data Encoder restrictions.

**Coupons**
- List coupons.
- Search and filter coupons.
- Create a valid coupon.
- Reject invalid coupon values.
- Update a coupon.
- Activate or deactivate a coupon.
- Verify usage counts remain backend-controlled.

**Reports**
- Load available reports.
- Apply date filters.
- Verify currency formatting.
- Verify successful revenue calculations.
- Confirm unavailable reports do not display fabricated data.

**Settings**
- Load saved settings.
- Update supported settings.
- Reload the page and verify persistence.
- Verify sensitive configuration is not exposed.

**Audit logs**
- Load audit logs.
- Search and filter.
- View audit details.
- Confirm edit and delete operations are unavailable.
- Verify unauthorized users cannot view audit logs.

**Dashboard**
- Load real dashboard metrics.
- Verify that metrics match backend data.
- Confirm loading and unavailable states work correctly.

**Regression**
- Customer authentication.
- Cart and Wishlist.
- Customer addresses.
- Checkout and order creation.
- Payment receipt submission.
- Admin orders.
- Admin payment review.
- Shipments.
- Customer management.
- Review moderation.
- Contact messages.

Run:
1. Frontend production build.
2. User management tests.
3. Role and permission tests.
4. Coupon tests.
5. Reports tests.
6. Settings tests.
7. Audit log tests.
8. Relevant backend regression tests.

Report actual test results. Do not claim success without execution evidence.

### 14. Final Checkpoint Report

Create:

`frontend-phase6-step9-checkpoint.md`

Include:

1. Files inspected.
2. Files created.
3. Files modified.
4. Verified user-management endpoints.
5. Verified role and permission endpoints.
6. Verified coupon endpoints.
7. Verified reporting endpoints.
8. Verified settings endpoints.
9. Verified audit-log endpoints.
10. Staff user management integration.
11. Role and permission integration.
12. Coupon management integration.
13. Reports and dashboard integration.
14. Settings integration.
15. Audit log integration.
16. RBAC and security verification.
17. Frontend build results.
18. Backend test results.
19. Regression test results.
20. Missing backend capabilities.
21. Unresolved issues.
22. Confirmation of database schema changes, if any.

### Completion Criteria

Step 9 is complete only when:

- Supported staff user operations use the backend.
- Supported role and permission operations use the backend.
- Coupon management uses real backend data.
- Available reports use backend-calculated values.
- Supported settings persist through the backend.
- Audit logs are displayed securely and remain read-only.
- Dashboard metrics use real data where available.
- RBAC restrictions are enforced.
- Existing customer and admin workflows remain functional.
- Frontend build and test results are documented.

**STOP after completing Phase 6, Step 9. Do not begin Step 10 until the checkpoint report has been reviewed and approval is given.**