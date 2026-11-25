# IBTU E-Commerce Platform
## Phase 4 – Step 2: Coupon and Discount Management API

### Objective

Develop a secure coupon and discount management system using Node.js, Express, and MariaDB.

The system must allow:

**Customers**
- Enter a coupon code during checkout.
- Validate whether a coupon is available.
- See the discount amount before placing an order.
- Apply an eligible coupon to an order.
- Receive clear messages for invalid, expired, or ineligible coupons.

**Shop Owner (Admin)**
- Create coupons.
- View all coupons.
- View coupon details.
- Update coupon information.
- Activate or deactivate coupons.
- Monitor coupon usage.
- View customers and orders associated with coupon usage.

**Important:** Do not modify the existing React frontend or recreate existing database tables.

---

### STEP 0: Verify Previous Checkpoints

Before implementation, confirm the completion of:

1. Phase 3 – Step 1: Shopping Cart API.
2. Phase 3 – Step 2: Wishlist API.
3. Phase 3 – Step 3: Customer Address Management API.
4. Phase 4 – Step 1: Checkout, Order Creation and Manual Payment Verification.

In particular, verify that the checkout service calculates totals correctly and supports the manual payment receipt workflow.

Do not assume previous steps are complete.

### STEP 1: Inspect Existing Database Tables

Inspect the actual schemas, relationships, indexes, constraints, and existing records of:

1. `coupons`
2. `coupon_usages`
3. `orders`
4. `order_items`
5. `users`
6. `carts`
7. `cart_items`

Expected `coupons` fields:

- id
- code
- description
- discount_type
- discount_value
- minimum_order_amount
- maximum_discount_amount
- usage_limit
- usage_count
- usage_limit_per_customer
- starts_at
- expires_at
- is_active
- created_by
- created_at
- updated_at

Expected `coupon_usages` fields:

- id
- coupon_id
- user_id
- order_id
- discount_amount
- usage_status
- used_at
- created_at

Verify actual names and ENUM values.

Do not recreate or modify existing tables.

### STEP 2: Design Coupon Architecture

Follow the existing backend architecture.

Create these files if they do not already exist:

- `src/validators/coupon.validator.js`
- `src/services/coupon.service.js`
- `src/controllers/coupon.controller.js`
- `src/routes/coupon.routes.js`

Reuse:
- Database connection pool.
- Authentication middleware.
- Permission middleware.
- Error-handling middleware.
- API response utility.
- Existing checkout service.

Do not duplicate business logic.

### STEP 3: Implement Admin Coupon Management

Implement these endpoints:

**1. Create Coupon**

`POST /api/admin/coupons`

Example request:

```json
{
  "code": "WELCOME10",
  "description": "Welcome discount for new customers",
  "discount_type": "percentage",
  "discount_value": 10,
  "minimum_order_amount": 1000,
  "maximum_discount_amount": 500,
  "usage_limit": 100,
  "usage_limit_per_customer": 1,
  "starts_at": "2026-11-16 00:00:00",
  "expires_at": "2026-12-31 23:59:59",
  "is_active": true
}
```

Requirements:
- Normalize coupon codes consistently.
- Prevent duplicate coupon codes.
- Validate discount type.
- Validate percentage discounts.
- Validate fixed discounts.
- Validate minimum order amounts.
- Validate maximum discount amounts.
- Validate usage limits.
- Validate start and expiry dates.
- Set `created_by` from the authenticated Admin.
- Never accept `created_by` from the frontend.

**2. Get All Coupons**

`GET /api/admin/coupons`

Support:
- Search by coupon code.
- Filter by active/inactive status.
- Filter by discount type.
- Pagination.
- Sorting using an approved column whitelist.

**3. Get Coupon Details**

`GET /api/admin/coupons/:id`

Return coupon information and usage statistics.

**4. Update Coupon**

`PUT /api/admin/coupons/:id`

Requirements:
- Validate all updated values.
- Prevent duplicate codes.
- Preserve historical usage records.
- Do not silently change historical order discounts.

**5. Activate or Deactivate Coupon**

`PATCH /api/admin/coupons/:id/status`

Example:

```json
{
  "is_active": false
}
```

**6. Delete Coupon**

`DELETE /api/admin/coupons/:id`

Before implementing deletion, inspect foreign-key restrictions and historical usage.

Prefer deactivation instead of deleting coupons with usage history.

Never delete historical coupon usage records.

### STEP 4: Implement Public Coupon Validation

Endpoint:

`POST /api/coupons/validate`

Example request:

```json
{
  "code": "WELCOME10"
}
```

Requirements:

1. Retrieve the customer's current cart.
2. Retrieve current product and variant prices.
3. Calculate the cart subtotal on the server.
4. Retrieve the coupon from the database.
5. Verify the coupon exists.
6. Verify it is active.
7. Verify its start date and expiry date.
8. Verify minimum order requirements.
9. Verify global usage limits.
10. Verify per-customer usage limits.
11. Calculate the discount.
12. Return the updated checkout total.

Example response:

```json
{
  "success": true,
  "data": {
    "coupon_code": "WELCOME10",
    "discount_type": "percentage",
    "discount_value": 10,
    "subtotal": 5000,
    "discount_amount": 500,
    "total_after_discount": 4500,
    "currency": "ETB",
    "valid": true
  }
}
```

Do not trust subtotal or discount amounts submitted by the frontend.

For guest customers, enforce only the usage limits that can be reliably verified. Do not pretend to enforce a per-customer limit when no reliable customer identity exists.

### STEP 5: Implement Discount Calculation

Support two discount types.

**Percentage discount**

Example:
- Subtotal: 5,000 ETB.
- Discount: 10%.
- Discount amount: 500 ETB.
- Total after discount: 4,500 ETB.

**Fixed discount**

Example:
- Subtotal: 5,000 ETB.
- Fixed discount: 300 ETB.
- Discount amount: 300 ETB.
- Total after discount: 4,700 ETB.

Business rules:

1. Never allow a negative discount.
2. Never allow a discount greater than the eligible subtotal.
3. Apply `maximum_discount_amount` when configured.
4. Enforce `minimum_order_amount`.
5. Use precise decimal arithmetic for monetary calculations.
6. Do not calculate discount amounts using untrusted frontend values.
7. Do not allow the discount to exceed the order subtotal.
8. Define consistently whether shipping and tax are excluded from the discount base; use the approved checkout policy.
9. Preserve the final applied discount in the order record.

If the existing checkout calculation policy is unclear, ask before implementing it.

### STEP 6: Integrate Coupons With Checkout

Update the existing checkout service without breaking its current functionality.

The checkout preview should accept an optional coupon code.

Example:

```json
{
  "coupon_code": "WELCOME10"
}
```

Requirements:
- Revalidate the coupon during checkout.
- Recalculate the discount from database prices.
- Store the discount in `orders.discount_amount`.
- Prevent customers from modifying the discount amount.
- Apply the coupon only if the order is eligible.

During order creation:

1. Lock or safely validate the coupon record.
2. Check the global usage limit.
3. Check the customer's usage limit.
4. Create the order.
5. Create the coupon usage record with the appropriate initial status.
6. Update coupon usage counters consistently.
7. Reserve inventory.
8. Commit all related operations together.

Use database transactions and appropriate row locks to prevent simultaneous orders from exceeding coupon limits.

### STEP 7: Handle Coupon Usage Lifecycle

The existing `coupon_usages` table supports:

- `reserved`
- `applied`
- `cancelled`

Implement the lifecycle consistently.

**When an eligible order is created:**
- Create a reserved coupon usage record.
- Ensure usage counters are updated consistently.

**When payment is approved:**
- Change the usage status to applied.
- Ensure the coupon is counted as consumed.

**When payment is rejected or an order is cancelled:**
- Release the reserved coupon usage according to the agreed cancellation policy.
- Update counters safely.

**Important:**
- Do not count a single order twice.
- Do not release an already applied coupon without an explicit refund/cancellation policy.
- Handle duplicate requests safely.
- Use transactions for status and counter updates.

Coordinate these operations with the existing manual payment verification service.

### STEP 8: Admin Coupon Usage Reports

Implement:

`GET /api/admin/coupons/:id/usages`

Return:
- Coupon code.
- Order number.
- Customer information where available.
- Discount amount.
- Usage status.
- Usage date.

Support pagination.

Only authorized Admin users may access coupon usage reports.

### STEP 9: Authentication and Authorization

Use existing permissions.

Suggested permissions:
- `coupons.view`
- `coupons.create`
- `coupons.update`
- `coupons.delete`

Inspect existing permissions before implementation.

If these permissions do not exist, explain the required database change and request approval before inserting or modifying permission records.

Customer coupon validation must not expose:
- Internal usage records.
- Other customers' information.
- Admin-only coupon statistics.

### STEP 10: Testing

Test using Postman.

**Admin tests**
1. Create a percentage coupon.
2. Create a fixed discount coupon.
3. Attempt a duplicate coupon code.
4. Create a coupon with invalid dates.
5. Create a coupon with invalid discount values.
6. Retrieve all coupons.
7. Search coupons.
8. Filter active and inactive coupons.
9. Update a coupon.
10. Deactivate a coupon.
11. Reactivate a coupon.
12. View coupon usage statistics.

**Customer tests**
13. Validate a valid coupon.
14. Validate an unknown coupon.
15. Validate an inactive coupon.
16. Validate an expired coupon.
17. Validate a coupon before its start date.
18. Validate a coupon below the minimum order amount.
19. Validate an exhausted coupon.
20. Validate a coupon after reaching the per-customer usage limit.
21. Test percentage discount calculation.
22. Test fixed discount calculation.
23. Test maximum discount limits.
24. Attempt to submit a manipulated discount amount.

**Checkout integration tests**
25. Create an eligible order with a coupon.
26. Verify order discount snapshot.
27. Verify reserved coupon usage.
28. Approve payment and verify usage becomes applied.
29. Reject payment and verify the usage is released according to policy.
30. Cancel an eligible order and verify coupon counters.
31. Test simultaneous orders competing for the last coupon usage.
32. Verify transaction rollback after a failure.

Fix all errors before declaring completion.

### STEP 11: Final Checkpoint

Provide:

**IBTU Phase 4 – Step 2 Checkpoint**

- Previous checkpoints verified: yes/no
- Database inspection: completed/not completed
- Admin coupon creation: completed/not completed
- Coupon listing and filtering: completed/not completed
- Coupon update: completed/not completed
- Coupon activation/deactivation: completed/not completed
- Public coupon validation: completed/not completed
- Percentage discount: completed/not completed
- Fixed discount: completed/not completed
- Maximum discount: completed/not completed
- Checkout integration: completed/not completed
- Coupon usage reservation: completed/not completed
- Payment approval integration: completed/not completed
- Payment rejection integration: completed/not completed
- Coupon usage reports: completed/not completed
- Authorization: completed/not completed
- Transaction and concurrency testing: completed/not completed
- Errors or remaining issues:

Include:
- Files created or modified.
- Implemented endpoints.
- Database changes, if approved.
- Postman test results.
- Any unresolved business rules.

**STOP after this checkpoint. Do not start the next development step until I review and confirm the results.**

### Development Instructions

- Work step by step.
- Explain important code in simple English.
- Provide complete code with exact file paths.
- Inspect existing code and database schemas first.
- Preserve existing functionality.
- Do not recreate existing tables.
- Request approval before schema changes.
- Do not modify the React frontend.
- Do not trust frontend prices or discount amounts.
- Use database transactions for coupon usage.
- Coordinate with manual payment approval and rejection.
- Wait for my confirmation before continuing.