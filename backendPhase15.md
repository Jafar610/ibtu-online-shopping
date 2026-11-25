# IBTU E-Commerce Platform
## Phase 4 – Step 3: Order Management and Fulfillment API

### 1. Objective

Develop a secure, reliable, and transaction-safe Order Management and Fulfillment API for the IBTU E-Commerce Platform.

The API must allow:

- Customers to view and track their orders.
- Administrators to view, filter, and manage all orders.
- Administrators to update order statuses according to approved business rules.
- Administrators to create and manage shipments.
- The system to update inventory correctly when orders are fulfilled or cancelled.
- The system to maintain accurate payment, coupon, and inventory records.

**Important:** This is a backend-only development task. Do not modify the React frontend.

---

### 2. Mandatory Previous-Step Verification

Before writing any code, inspect the existing backend and verify these milestones:

**Phase 3**
- Shopping Cart API
- Wishlist API
- Customer Address Management API

**Phase 4**
- Step 1: Checkout, Order Creation, Stock Reservation, and Manual Payment Receipt Verification.
- Step 2: Coupon and Discount Management API.

For each milestone, report:
1. Implemented files.
2. Available API endpoints.
3. Relevant database tables.
4. Working functionality.
5. Missing functionality or errors.

If a previous milestone is incomplete, stop and report what must be completed first. Do not silently skip dependencies or rebuild existing modules.

---

### 3. Database Inspection

Inspect the actual database schema before implementation.

Database: `ibutu_ecommerce`

Inspect these tables:

- `orders`
- `order_items`
- `payments`
- `shipments`
- `product_variants`
- `inventory_movements`
- `users`
- `audit_logs`
- `coupon_usages`

Also inspect the existing `inventory_stock_summary` view.

Verify:
- Primary and foreign keys.
- Existing ENUM values.
- Nullable columns.
- Existing indexes.
- Relationships between orders, payments, and shipments.
- Existing inventory reservation logic.
- Existing coupon usage lifecycle.
- Existing audit logging implementation.

Do not modify database tables, columns, ENUMs, indexes, or constraints without first explaining the reason and requesting approval.

---

### 4. Backend Architecture

Follow the existing project architecture and coding conventions.

Create or extend these files as appropriate:

```text
src/
├── controllers/
│   └── order.controller.js
├── services/
│   └── order.service.js
├── routes/
│   └── order.routes.js
├── validators/
│   └── order.validator.js
```

For shipment management, create separate files only if this matches the existing architecture:

```text
src/
├── controllers/
│   └── shipment.controller.js
├── services/
│   └── shipment.service.js
├── routes/
│   └── shipment.routes.js
└── validators/
    └── shipment.validator.js
```

Reuse existing authentication, authorization, database connection, validation, response, error-handling, and audit-log utilities.

Do not duplicate existing functionality.

---

### 5. Admin Order Management API

Implement the following endpoints.

**A. Get all orders**

`GET /api/admin/orders`

Features:
- Pagination.
- Search by order number.
- Search by customer name, email, or phone.
- Filter by order status.
- Filter by payment status.
- Filter by date range.
- Filter by payment method.
- Sort using an approved whitelist.
- Return useful customer and order summary information.

**B. Get order details**

`GET /api/admin/orders/:id`

Return:
- Order information.
- Customer information.
- Shipping address snapshot.
- Order items and product snapshots.
- Payment attempts and payment statuses.
- Coupon and discount information.
- Shipment information.
- Relevant order history, if supported by existing tables.

**C. Update order status**

`PATCH /api/admin/orders/:id/status`

Requirements:
- Validate the requested status.
- Enforce allowed status transitions.
- Reject invalid transitions.
- Record the administrator responsible.
- Write an audit log.
- Never allow an arbitrary status update that bypasses payment or inventory rules.

**D. Cancel an order**

`POST /api/admin/orders/:id/cancel`

Requirements:
- Validate whether cancellation is permitted.
- Prevent cancellation of already completed orders unless an approved return/refund workflow exists.
- Release reserved inventory when appropriate.
- Update coupon usage records consistently.
- Record the cancellation reason.
- Write an audit log.
- Do not automatically issue refunds without an approved refund policy.

---

### 6. Customer Order API

Implement:

`GET /api/orders`

Return only the authenticated customer's orders.

`GET /api/orders/:id`

Return details only if the authenticated customer owns the order.

`POST /api/orders/:id/cancel`

Allow customers to request cancellation only when the order is eligible.

Requirements:
- Verify ownership.
- Validate cancellation eligibility.
- Prevent customers from cancelling orders already shipped or delivered.
- Apply the correct inventory reservation release process.
- Update coupon usage consistently.
- Record the cancellation reason.
- Never expose another customer's order information.

Admin, Data Encoder, and Customer roles must follow the existing RBAC rules. Do not treat an Admin or Data Encoder as a customer simply because they are authenticated.

---

### 7. Shipment Management API

Implement shipment management using the existing `shipments` table.

**A. Create shipment**

`POST /api/admin/orders/:id/shipments`

Accept appropriate fields such as:

- `courier_name`
- `courier_phone`
- `tracking_number`
- `estimated_delivery_date`
- `shipping_cost`
- `delivery_notes`

Validate the order and shipment information before creation.

**B. Get order shipments**

`GET /api/admin/orders/:id/shipments`

**C. Update shipment status**

`PATCH /api/admin/shipments/:shipmentId/status`

Supported statuses must match the actual database ENUM:

- pending
- processing
- shipped
- in_transit
- out_for_delivery
- delivered
- failed
- returned
- cancelled

Validate allowed transitions rather than accepting every status change.

**D. Customer tracking**

`GET /api/orders/:id/tracking`

Customers can access tracking information only for their own orders.

Return:
- Order number.
- Shipment status.
- Courier name.
- Tracking number.
- Estimated delivery date.
- Shipped date.
- Delivered date.

**Important shipment rule:**

The current database supports multiple shipments per order but does not include a `shipment_items` table.

For this milestone, use a single shipment per order unless the existing business requirements explicitly require partial shipments.

If partial shipments are needed, explain why a `shipment_items` table is necessary and request approval before modifying the schema.

---

### 8. Inventory Fulfillment Integration

This is one of the most important parts of this milestone.

Follow the existing inventory design:

- `stock_quantity` = physical inventory.
- `reserved_quantity` = inventory reserved for orders.
- Available stock = `stock_quantity - reserved_quantity`.

**A. When an order is fulfilled**

When the business process confirms that an order is ready to be dispatched, implement the appropriate atomic inventory operation:

1. Lock the relevant product variant rows.
2. Verify the reserved quantities.
3. Decrease physical stock.
4. Release the corresponding reserved quantities.
5. Insert the appropriate `inventory_movements` records.
6. Commit the transaction.

Use the existing movement types and meanings. For example, `sale` for physical stock leaving inventory and `released` for releasing reserved quantities, if consistent with the existing design.

**B. When an order is cancelled before fulfillment**

1. Release reserved stock.
2. Do not decrease physical stock.
3. Insert the appropriate `released` inventory movement.
4. Ensure the same reservation cannot be released twice.

**C. When an order is already fulfilled**

Do not automatically restore stock because an order is returned.

A returned product must be inspected and processed through an approved return workflow before physical inventory is restored.

**D. Transaction safety**

Use:
- Database transactions.
- Row-level locking (`SELECT ... FOR UPDATE`) where appropriate.
- Conditional updates.
- Duplicate-operation prevention.
- Rollback on failure.

Prevent:
- Negative stock.
- Negative reserved quantities.
- Duplicate inventory deductions.
- Duplicate reservation releases.
- Inventory changes when an order transition fails.

---

### 9. Payment Integration

Integrate with the existing manual receipt verification workflow from Phase 4 Step 1.

Important rules:

1. Uploading a payment receipt does not mean the payment is successful.
2. Only an authorized administrator's successful receipt approval can mark a manual payment as successful.
3. Order payment status must remain consistent with payment records.
4. Order fulfillment must not bypass the required payment approval policy.
5. Cash-on-delivery orders must follow a clearly defined collection and payment confirmation policy.

If the existing payment workflow does not define when COD orders become paid, report the missing business rule and request clarification rather than inventing one.

Do not implement an automatic payment gateway in this milestone.

---

### 10. Coupon Integration

Integrate with the existing coupon management module.

When an order is cancelled:
- Check the corresponding `coupon_usages` record.
- Release reserved coupon usage where applicable.
- Keep applied usage records consistent with the existing policy.
- Prevent duplicate coupon usage updates.

Do not modify coupon counters independently of the transaction that updates coupon usage.

---

### 11. Audit Logging

Use the existing `audit_logs` implementation.

Record important actions, including:

- Order status changes.
- Order cancellation.
- Shipment creation.
- Shipment status changes.
- Inventory fulfillment.
- Administrative order updates.

Capture the responsible user, action, entity, relevant description, and appropriate old/new values.

Never log passwords, payment credentials, or sensitive receipt contents.

Audit logs must remain append-only.

---

### 12. Security and Validation

Implement:

- JWT authentication.
- Role and permission checks.
- Customer order ownership checks.
- Request validation.
- Parameterized SQL queries.
- Safe pagination and sorting.
- Proper error handling.
- Protection against unauthorized order modification.
- Protection against duplicate fulfillment and cancellation operations.

Inspect the existing permissions before adding anything.

Potential permissions include:

- `orders.view`
- `orders.update`
- `inventory.manage`
- `shipments.view`
- `shipments.manage`

If required permissions do not exist, explain the required additions and request approval before changing RBAC database records.

Do not rely on frontend role checks for security.

---

### 13. Testing Requirements

Test all major scenarios.

**Order Management**
- Admin can view all orders.
- Admin can filter and search orders.
- Customer can view only their own orders.
- Customer cannot access another customer's order.
- Invalid status transitions are rejected.
- Unauthorized users cannot update orders.

**Cancellation**
- Eligible orders can be cancelled.
- Ineligible orders cannot be cancelled.
- Reserved inventory is released exactly once.
- Physical stock is not decreased when an unfulfilled order is cancelled.
- Coupon usage is updated consistently.

**Shipment**
- Admin can create a valid shipment.
- Duplicate shipments are prevented according to the agreed policy.
- Invalid shipment status transitions are rejected.
- Customer tracking is ownership-protected.

**Inventory**
- Physical stock decreases correctly during fulfillment.
- Reserved stock decreases correctly.
- Inventory movements are recorded.
- Duplicate fulfillment cannot deduct inventory twice.
- Concurrent requests cannot cause negative stock.
- Failed transactions roll back all related changes.

**Payment**
- An uploaded receipt cannot independently mark an order as paid.
- Unapproved manual payments cannot bypass the approval workflow.
- COD payment status follows the approved business policy.

---

### 14. Final Verification and Checkpoint

After implementation:

1. Run the backend.
2. Test all new endpoints.
3. Test authentication and authorization.
4. Test customer ownership restrictions.
5. Test inventory transactions.
6. Test cancellation and fulfillment.
7. Test shipment tracking.
8. Check existing APIs for regressions.
9. Report any database changes that were approved.
10. Provide the exact files created or modified.

Provide a final report in this format:

**IBTU Phase 4 Step 3 Checkpoint**

- Previous phase verification: 
- Admin order API: 
- Customer order API: 
- Order cancellation: 
- Shipment creation: 
- Shipment status management: 
- Customer tracking: 
- Inventory fulfillment integration: 
- Payment integration: 
- Coupon integration: 
- Audit logging: 
- Security and validation: 
- Tests passed: 
- Database changes: 
- Errors or remaining issues: 

For each item, report `Yes`, `No`, or `Partial`, with a short explanation.

**Important:** Stop after completing this milestone and presenting the checkpoint. Do not start the next development phase automatically.