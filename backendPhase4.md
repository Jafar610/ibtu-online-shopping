# IBTU E-Commerce Backend – Phase 1, Step 5: Role-Based Access Control (RBAC) and Permission Management

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack
- Node.js
- Express.js
- MariaDB
- mysql2/promise
- Express.js middleware
- JWT authentication

### Existing Database

Database: `ibutu_ecommerce`

Existing RBAC tables:

- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `users`

These tables have already been created and populated.

Existing roles:
- Admin
- Data Encoder
- Customer

Existing permission examples:
- `dashboard.view`
- `products.view`
- `products.create`
- `products.update`
- `products.delete`
- `categories.view`
- `categories.create`
- `categories.update`
- `categories.delete`
- `inventory.view`
- `inventory.manage`
- `orders.view`
- `orders.update`
- `customers.view`
- `customers.update`
- `reports.view`
- `users.manage`
- `roles.manage`
- `settings.manage`
- `audit_logs.view`

**Important:** Inspect the actual database records and schema before writing queries. Do not recreate or overwrite existing roles or permissions.

## 2. Main Objective

Implement a reusable Role-Based Access Control system that determines whether an authenticated user is allowed to access a particular API endpoint or perform a specific action.

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

## 3. Step-by-Step Implementation

### Step 1: Review Existing RBAC Structure

Inspect:
- roles
- permissions
- user_roles
- role_permissions
- users

Verify:
- Role IDs and names.
- Permission IDs and permission keys.
- User-role relationships.
- Role-permission relationships.
- Duplicate or missing assignments.

Do not assume role IDs or permission IDs.

### Step 2: Understand RBAC

Explain:
- What RBAC means.
- How users receive roles.
- How roles receive permissions.
- How permissions protect API endpoints.
- The difference between authentication middleware and authorization middleware.

Use IBTU examples.

### Step 3: Create Authorization Middleware

Create:

`src/middleware/permission.middleware.js`

Implement reusable functions such as:

- `requirePermission(permissionKey)`
- `requireRole(roleName)`

Requirements:
- Require an authenticated user.
- Retrieve the user's current roles and permissions from the database.
- Check whether the required permission exists.
- Return HTTP 403 when permission is insufficient.
- Return HTTP 401 when authentication is missing or invalid.
- Use parameterized SQL queries.
- Do not trust roles or permissions sent by the frontend.

### Step 4: Implement Permission Checking

Create a reusable permission-checking service:

`src/services/permission.service.js`

It should:
- Retrieve permissions assigned to the authenticated user's roles.
- Support users with multiple roles.
- Avoid duplicate permission results.
- Provide a reusable permission-checking function.

Explain the SQL queries and how the joins work.

### Step 5: Protect Example API Routes

Create test routes demonstrating permission checks.

Examples:

```javascript
router.get(
    '/products',
    authenticate,
    requirePermission('products.view'),
    productController.getProducts
);
```

```javascript
router.post(
    '/products',
    authenticate,
    requirePermission('products.create'),
    productController.createProduct
);
```

```javascript
router.delete(
    '/products/:id',
    authenticate,
    requirePermission('products.delete'),
    productController.deleteProduct
);
```

Also demonstrate a role-protected route:

```javascript
router.get(
    '/admin/dashboard',
    authenticate,
    requireRole('Admin'),
    dashboardController.getAdminDashboard
);
```

Use the existing authentication middleware and error-handling system.

### Step 6: Create Current User Authorization Endpoint

Implement:

`GET /api/auth/permissions`

It should return the authenticated user's current roles and permissions.

Example response:

```json
{
  "success": true,
  "message": "User permissions retrieved successfully",
  "data": {
    "roles": ["Data Encoder"],
    "permissions": [
      "dashboard.view",
      "products.view",
      "products.create"
    ]
  }
}
```

Use actual database assignments rather than hardcoded permissions.

### Step 7: Security and Performance

Implement:
- Database-backed permission checks.
- Safe handling of multiple roles.
- Parameterized queries.
- Consistent 401 and 403 responses.
- Permission refresh after role changes.
- A suitable caching strategy only if needed.

Do not rely solely on JWT role claims for authorization because permissions may change after a token is issued.

### Step 8: Test RBAC

Use Postman to test:

1. Admin accessing an Admin-only endpoint.
2. Data Encoder accessing permitted product endpoints.
3. Data Encoder attempting to manage roles.
4. Customer attempting to access an Admin endpoint.
5. User accessing an endpoint without a token.
6. User accessing an endpoint with an expired token.
7. User with multiple roles.
8. Permission changes reflected in subsequent requests.

Verify that unauthorized actions are rejected by the backend, not just hidden in the frontend.

## 4. Important Development Rules

1. Work one step at a time.
2. Explain every important line of code.
3. Provide complete code for created or modified files.
4. Preserve existing authentication functionality.
5. Do not recreate or modify existing database tables.
6. Do not hardcode database role IDs.
7. Do not trust frontend permissions.
8. Do not modify the frontend.
9. Wait for my checkpoint confirmation before proceeding.
10. Fix errors before moving forward.

## 5. Final Checkpoint

Ask me to confirm:

- [ ] Existing RBAC tables reviewed.
- [ ] Permission service created.
- [ ] Permission middleware created.
- [ ] Role middleware created.
- [ ] Protected API routes tested.
- [ ] Current permissions endpoint working.
- [ ] Admin access verified.
- [ ] Data Encoder access verified.
- [ ] Customer restrictions verified.

**Start with Step 1: Review the existing RBAC database structure. Do not skip ahead.**