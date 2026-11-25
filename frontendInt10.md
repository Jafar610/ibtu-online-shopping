# Phase 5 – Step 8.3: Admin Order, Payment, and Shipment Management

## Objective

Implement the Admin Order Management, Payment Management, and Shipment Management frontend pages for the IBTU e-commerce platform.

The goal is to enable authorized administrators to review customer orders, monitor payment statuses, verify uploaded payment receipts, and manage shipment information.

**Important:** This is a frontend-only milestone. Do not connect to backend APIs or modify the database.

---

## 1. Inspect the Existing Project

Before development:

1. Inspect the actual React project structure.
2. Review the Admin Dashboard foundation from Step 7.
3. Review the Product, Category, and Inventory modules from Steps 8.1 and 8.2.
4. Inspect existing order, order-item, payment, and shipment data structures.
5. Review existing customer checkout and payment page implementations from Step 6.
6. Review existing status enums and business rules.
7. Inspect existing tables, modals, filters, forms, and confirmation components.
8. Review current role and permission handling.

Do not assume earlier steps are complete. Verify their implementation in the source code.

Reuse existing components and preserve existing functionality.

If a required data structure or feature is missing, document it rather than inventing a new backend structure.

---

## 2. Order Management

**Route:** `/admin/orders`

### A. Order Listing

Create a professional order management table.

Display:

- Order number
- Customer name
- Customer email or phone where available
- Order date
- Number of items
- Subtotal
- Discount
- Shipping cost
- Tax
- Total amount (ETB)
- Payment status
- Order status
- Actions

Include:

- Search by order number or customer.
- Filter by order status.
- Filter by payment status.
- Filter by order date.
- Sort by order date and total amount.
- Pagination.
- Clear filters.
- Empty state.

Use the existing order data structure. Do not invent financial values.

### B. Order Statuses

Support the existing order statuses:

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled
- Refunded

Display status badges consistently.

Allow authorized users to simulate valid status changes through frontend mock state.

Do not allow arbitrary status transitions. Review the existing business workflow and document any unclear transition rules.

### C. Order Details

**Route:** `/admin/orders/:orderId`

Create a detailed order page with the following sections:

**Customer Information**
- Customer name
- Email
- Phone
- Customer account information, if available

**Order Items**
- Product image
- Product name snapshot
- SKU snapshot
- Size
- Color
- Quantity
- Unit price
- Discount
- Line total

**Order Summary**
- Subtotal
- Discount amount
- Shipping cost
- Tax amount
- Total amount
- Currency

**Shipping Information**
- Recipient name
- Phone
- Address
- City
- Region
- Country

**Payment Information**
- Payment method
- Payment reference
- Payment status
- Payment amount
- Payment date

**Additional Information**
- Customer notes
- Admin notes
- Order creation date
- Last updated date

Preserve historical order-item and shipping-address snapshots. Do not replace them with current product or address information.

### D. Order Actions

Implement frontend interactions for:

- View order.
- Update order status.
- Add or edit admin notes.
- Cancel order with confirmation.
- View associated payments.
- View associated shipments.

For cancellation, display a clear confirmation describing the consequences.

Do not simulate real inventory release, stock deduction, payment refunds, or coupon usage changes. Those operations must eventually be performed atomically by the backend.

---

## 3. Payment Management

**Route:** `/admin/payments`

Create a payment management interface.

### A. Payment Listing

Display:

- Payment reference
- Order number
- Customer
- Payment method
- Payment provider, if available
- Amount (ETB)
- Payment status
- Payment date
- Actions

Include:

- Search by payment reference or order number.
- Filter by payment method.
- Filter by payment status.
- Filter by date range.
- Sorting.
- Pagination.
- Empty state.

### B. Payment Methods

Use the existing payment methods:

- Cash on Delivery
- Telebirr
- CBE Birr
- Bank Transfer
- Card
- Other

Do not invent payment provider details, merchant account numbers, or bank account information.

### C. Payment Statuses

Use the existing payment statuses:

- Pending
- Processing
- Successful
- Failed
- Cancelled
- Refunded

Do not confuse payment status with order status.

### D. Payment Details

**Route:** `/admin/payments/:paymentId`

Display:

- Payment reference
- Associated order
- Customer information
- Payment method
- Payment provider
- Amount and currency
- Payment status
- Provider transaction ID, if available
- Payment creation date
- Paid date, if available
- Receipt information, if available

Provide a payment details modal or dedicated page, consistent with the existing routing approach.

### E. Receipt Review

For manual payment methods, create a receipt review interface.

Display:

- Uploaded receipt preview, if an image is available.
- Payment reference.
- Order number.
- Customer.
- Submitted date.
- Payment amount.
- Current payment status.

Provide frontend-only actions for:

- Approve receipt.
- Reject receipt.
- Add a rejection reason.

Require confirmation before approving or rejecting.

**Important business rules:**

- Uploading a receipt does not mean a payment is successful.
- Receipt approval must be a separate action.
- Never mark online payments successful based only on frontend claims.
- Do not display private receipt files through fabricated public URLs.
- Do not claim that a receipt has been verified by an actual payment provider.

Clearly label simulated review actions as mock frontend behavior.

---

## 4. Shipment Management

**Route:** `/admin/shipments`

Create a shipment management interface.

### A. Shipment Listing

Display:

- Shipment identifier
- Associated order number
- Customer
- Courier name
- Tracking number
- Shipment status
- Estimated delivery date
- Shipped date
- Delivered date
- Actions

Include:

- Search by order number or tracking number.
- Filter by shipment status.
- Filter by courier.
- Filter by shipment date.
- Sorting.
- Pagination.
- Empty state.

### B. Shipment Statuses

Use the existing shipment statuses:

- Pending
- Processing
- Shipped
- In Transit
- Out for Delivery
- Delivered
- Failed
- Returned
- Cancelled

Use consistent status badges.

### C. Create Shipment

Create a shipment form with:

- Associated order.
- Courier name.
- Courier phone.
- Tracking number.
- Shipping cost.
- Estimated delivery date.
- Delivery notes.

Only allow selection of eligible orders based on the existing order workflow.

Prevent duplicate tracking numbers in the mock data.

### D. Update Shipment

Allow authorized users to simulate updates to:

- Courier details.
- Tracking number.
- Shipment status.
- Estimated delivery date.
- Delivery notes.

Display confirmation for important status changes.

Do not fabricate real courier tracking information.

### E. Shipment Details

**Route:** `/admin/shipments/:shipmentId`

Display:

- Shipment information.
- Associated order.
- Customer details.
- Delivery address snapshot.
- Tracking information.
- Shipment status.
- Estimated delivery date.
- Shipped and delivered dates.
- Delivery notes.

Include a shipment timeline using only available or explicitly simulated mock events.

Do not present mock events as actual courier updates.

---

## 5. Shared Components

Review existing components before creating new ones.

Create reusable components where necessary:

- OrderTable
- OrderFilters
- OrderDetails
- OrderStatusBadge
- PaymentTable
- PaymentFilters
- PaymentStatusBadge
- ReceiptReviewModal
- ShipmentTable
- ShipmentFilters
- ShipmentStatusBadge
- ShipmentForm
- ShipmentTimeline
- ConfirmActionModal

Keep components modular and maintainable.

Use shared formatting utilities for ETB currency, dates, and status labels.

---

## 6. Frontend State and Mock Data

Use the existing state-management approach.

Requirements:

1. Reuse existing mock data where available.
2. Keep order, payment, and shipment mock data organized separately.
3. Keep relationships between orders, payments, and shipments consistent.
4. Ensure frontend changes immediately update the corresponding listings and details.
5. Use consistent order, payment, and shipment identifiers.
6. Clearly label mock data and simulated operations.
7. Avoid duplicating conflicting customer or order information.

Do not introduce a new state-management library.

Do not claim that simulated actions have changed the actual IBTU database.

---

## 7. Role and Permission Preparation

Review the existing RBAC structure.

Expected access:

**Admin**
- Full order, payment, and shipment management access.

**Data Encoder**
- Only the operations allowed by existing permissions.

**Customer**
- No access to admin management pages.

Important:

- Reuse existing permissions.
- Do not invent permission names.
- Do not modify database roles or permissions.
- Preserve existing protected routes.
- Do not bypass authorization checks.
- Backend authorization will be required during API integration.

---

## 8. Routing and Navigation

Add or update the following routes:

**Orders**
- `/admin/orders`
- `/admin/orders/:orderId`

**Payments**
- `/admin/payments`
- `/admin/payments/:paymentId`

**Shipments**
- `/admin/shipments`
- `/admin/shipments/:shipmentId`

Requirements:

- Use the existing AdminLayout.
- Maintain breadcrumbs.
- Highlight the active sidebar item.
- Preserve existing navigation.
- Ensure protected-route behavior remains intact.
- Handle invalid or missing record IDs gracefully.

---

## 9. UI and Design Requirements

Follow the existing IBTU Admin Dashboard design.

Brand colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

Requirements:

- Professional admin interface.
- Clean and readable tables.
- Consistent status badges.
- Clear action buttons.
- Well-organized order details.
- Attractive receipt preview.
- Clear confirmation dialogs.
- Responsive forms and modals.
- Desktop, tablet, and mobile support.
- Accessible labels and keyboard-friendly interactions.

Do not redesign the existing public website or Admin Dashboard.

---

## 10. Testing and Verification

### Order Management
- Order listing displays correctly.
- Search, filters, and sorting work.
- Order details display correct snapshots.
- Status changes update frontend state.
- Cancellation confirmation works.
- Financial totals are displayed consistently.

### Payment Management
- Payment listing works.
- Payment filters work.
- Payment details display correctly.
- Receipt preview works where mock image data exists.
- Approve and reject actions require confirmation.
- Rejection reason validation works.
- Payment and order statuses remain distinct.

### Shipment Management
- Shipment listing works.
- Search and filters work.
- Create shipment works using mock state.
- Duplicate tracking number validation works.
- Shipment updates work.
- Shipment details and timeline display correctly.

### Regression Testing
- Admin Dashboard works.
- Product Management works.
- Category Management works.
- Inventory Management works.
- Public website pages work.
- Cart and Wishlist work.
- Customer Account pages work.
- Checkout pages work.
- No console errors.
- Production build succeeds.

---

## 11. Strict Scope Restrictions

Do not:

- Connect to backend APIs.
- Modify the MariaDB database.
- Create or modify backend endpoints.
- Implement actual payment processing.
- Implement real receipt verification.
- Process actual refunds.
- Implement real courier integrations.
- Perform actual inventory deductions or reservation releases.
- Implement partial shipments unless the existing frontend model already supports them.
- Change the public website.
- Install new dependencies without approval.

If a requirement depends on missing backend functionality, document it instead of pretending the operation is real.

---

## 12. Final Checkpoint Report

When finished, provide:

1. Files created.
2. Files modified.
3. Order Management features completed.
4. Payment Management features completed.
5. Receipt Review features completed.
6. Shipment Management features completed.
7. Routes added or updated.
8. Reusable components created.
9. Mock data and state-management approach.
10. Role and permission behavior.
11. Tests performed and results.
12. Known issues or incomplete features.
13. Confirmation that no backend or database changes were made.

**STOP after completing Step 8.3. Do not start Step 8.4 until I review and approve the checkpoint report.**