# IBTU – Phase 6, Step 7
## Admin Order, Payment, and Shipment API Integration

### 1. Objective

Integrate the existing IBTU Admin Dashboard with the real backend APIs for:

1. Order management.
2. Payment and receipt review.
3. Shipment and delivery management.
4. Order status monitoring.
5. Inventory and payment workflow visibility.

Replace mock admin order, payment, and shipment data with backend-authoritative data.

**Important:** This step is for the administrative order fulfillment workflow. Do not redesign the admin dashboard or modify database schemas without approval.

### 2. Inspect the Existing Project

Before editing, inspect:

**Frontend**
- Admin dashboard and navigation.
- Admin Orders page.
- Order details page or modal.
- Payment management page.
- Payment receipt viewer.
- Shipment management page.
- Existing API services.
- Authentication and permission management.
- Existing notification and confirmation components.

**Backend**
- Order routes, controllers, and services.
- Payment routes, controllers, and services.
- Receipt upload and private file access.
- Shipment routes, controllers, and services.
- Inventory movement and reservation logic.
- Audit logging.
- Role and permission middleware.
- Database constraints and relationships.

Inspect actual implementation and identify existing endpoints, methods, payloads, permissions, and response structures.

Do not assume that previously planned endpoint names match the current backend.

Prepare a short implementation plan before making changes.

### 3. Create or Extend Admin API Services

Create or extend the appropriate frontend services:

- `adminOrderApi.js`
- `adminPaymentApi.js`
- `adminShipmentApi.js`

Use the existing Axios client and centralized error handling.

Reuse existing services if equivalent functionality already exists.

Verify and integrate the actual backend operations for:

**Orders**
- List orders with pagination.
- Search and filter orders.
- Retrieve order details.
- Update permitted order statuses.
- Cancel orders where permitted.

**Payments**
- List pending payments.
- Retrieve payment details.
- View submitted receipts securely.
- Approve payments.
- Reject payments.

**Shipments**
- List shipments.
- Retrieve shipment details.
- Create shipments.
- Update shipment information and status.
- Retrieve tracking information where supported.

Do not invent missing endpoints or duplicate existing backend functionality.

### 4. Admin Order Management

Connect the existing Admin Orders page to the backend.

Implement:

**Order listing**
- Real order number.
- Customer information.
- Order date.
- Total amount in ETB.
- Order status.
- Payment status.
- Payment method.
- Shipment status where available.

**Search and filters**
- Search by order number.
- Search by customer name or phone where supported.
- Filter by order status.
- Filter by payment status.
- Filter by date range where supported.
- Pagination using backend-supported parameters.

**Order details**
Display:
- Order number and date.
- Customer details.
- Shipping address snapshot.
- Order items and variants.
- Quantities.
- Unit prices.
- Subtotals and discounts.
- Shipping cost and tax.
- Final total.
- Payment information.
- Shipment information.
- Customer notes.

Use historical order snapshots rather than current product information.

**Order status management**

Support only the transitions permitted by the backend.

Possible statuses include:
- pending
- confirmed
- processing
- shipped
- delivered
- cancelled
- refunded

Do not assume every transition is valid.

Before updating an order, show a confirmation dialog and explain the action.

Refresh order data after successful updates.

### 5. Admin Payment and Receipt Management

Connect the existing payment administration page to the real backend.

Previously planned endpoints:

- `GET /api/admin/payments/pending`
- `GET /api/admin/payments/:paymentId`
- `PATCH /api/admin/payments/:paymentId/approve`
- `PATCH /api/admin/payments/:paymentId/reject`

Verify the actual routes before integration.

Implement:

**Payment list**
- Payment reference.
- Order number.
- Customer information.
- Payment method.
- Amount.
- Payment status.
- Submission date.

**Payment details**
- Order information.
- Payment reference.
- Payment method.
- Submitted receipt.
- Payment amount.
- Current status.
- Relevant transaction information.

**Receipt review**

Allow authorized administrators to view submitted receipts.

Requirements:
- Use the backend's secure receipt access mechanism.
- Do not expose private receipt storage directories.
- Handle expired or unauthorized receipt access.
- Do not assume a receipt URL is publicly accessible.
- Show a useful message if the receipt cannot be loaded.

**Approve payment**

When an authorized administrator approves a payment:

1. Require confirmation.
2. Send the approval request to the backend.
3. Display the backend response.
4. Refresh payment and order information.
5. Reflect the actual payment status returned by the backend.

**Reject payment**

When rejecting a payment:

1. Require confirmation.
2. Collect a rejection reason if supported by the backend.
3. Submit the rejection request.
4. Display the backend response.
5. Refresh payment and order information.

Critical business rules:

- Only authorized administrators can approve or reject payments.
- A receipt upload is not payment approval.
- The frontend must never independently mark a payment as successful.
- Repeated approval or rejection requests must be handled safely by the backend.
- Do not allow unauthorized users to view private receipts.

Pay particular attention to the existing `awaiting_review` payment status. Verify how the backend uses it and ensure the frontend displays it consistently.

### 6. Admin Shipment Management

Connect the existing shipment management interface to the backend.

Verify the actual shipment endpoints.

Previously planned shipment operations include:

- List shipments.
- Retrieve shipment details.
- Create a shipment.
- Update shipment information.
- Update shipment status.
- Retrieve tracking information.

Implement the existing supported operations.

**Shipment creation**

Allow authorized staff to create a shipment for an eligible order.

Fields may include:
- Order ID.
- Tracking number.
- Courier name.
- Courier phone.
- Shipping cost.
- Estimated delivery date.
- Delivery notes.

Use backend validation and actual supported fields.

**Shipment status management**

Possible statuses include:
- pending
- processing
- shipped
- in_transit
- out_for_delivery
- delivered
- failed
- returned
- cancelled

Use only valid backend-supported transitions.

Display shipment history and tracking details where available.

**Important inventory rule**

Verify that inventory deduction and reservation release are handled by the backend at the correct fulfillment stage.

Do not deduct inventory again from the frontend.

Do not release reserved stock simply because an administrator changes an unrelated shipment field.

Do not implement partial shipments unless the existing backend and database explicitly support them.

### 7. Order, Payment, and Shipment Synchronization

Ensure the admin interface reflects related workflow changes.

Examples:

- Payment approval should update the displayed payment status.
- Order status changes should refresh order details.
- Shipment creation should appear in the relevant order.
- Shipment status changes should update tracking information.
- Cancelled orders should display their actual cancellation status.
- Delivered orders should display their actual fulfillment status.

Use backend responses as the source of truth.

Do not independently infer or fabricate related statuses in the frontend.

If a workflow transition is not supported by the backend, display the limitation instead of simulating success.

### 8. Role and Permission Enforcement

Inspect the existing RBAC implementation.

Verify which roles and permissions are required for:

- Viewing orders.
- Updating orders.
- Viewing payments.
- Approving payments.
- Rejecting payments.
- Viewing shipments.
- Creating shipments.
- Updating shipments.

The existing roles include Admin, Data Encoder, and Customer.

Do not assume Data Encoder has permission to approve payments or modify orders.

Use the actual backend permissions and existing frontend permission checks.

Requirements:

- Unauthorized navigation must be restricted.
- Unauthorized actions must be hidden or disabled appropriately.
- Backend authorization must remain authoritative.
- Do not create new permissions or modify role assignments without approval.

### 9. Loading, Errors, and User Feedback

All admin pages must support:

- Loading states.
- Empty states.
- Retry after API errors.
- Success notifications.
- Validation feedback.
- Confirmation dialogs for sensitive operations.
- Pagination and filter loading.
- Unauthorized and forbidden responses.

Prevent duplicate requests caused by repeated button clicks.

Refresh relevant data after successful mutations.

Do not show success messages before receiving successful backend responses.

### 10. Preserve Existing Functionality

Do not:

- Redesign the admin dashboard.
- Change IBTU brand colors or typography.
- Change the authentication system.
- Replace existing RBAC functionality.
- Modify customer checkout.
- Modify CartContext or WishlistContext.
- Change customer address management.
- Change order creation logic.
- Modify database tables or constraints.
- Invent payment account instructions.
- Expose private receipt files.
- Implement frontend-only payment approval.
- Add unsupported shipment workflows.

Reuse existing components, API services, contexts, and UI patterns.

### 11. Testing and Validation

Test the following scenarios.

**Order management**
- Admin loads orders.
- Admin searches by order number.
- Admin filters by status.
- Admin opens order details.
- Admin performs an allowed status update.
- Invalid status transitions are rejected.
- Unauthorized users cannot update orders.

**Payment management**
- Admin loads pending payments.
- Admin opens payment details.
- Admin views an uploaded receipt.
- Admin approves a valid payment.
- Admin rejects a valid payment.
- Rejection reason is handled correctly if required.
- Duplicate approval or rejection is handled safely.
- Unauthorized users cannot approve or reject payments.
- `awaiting_review` displays consistently.

**Shipment management**
- Admin loads shipments.
- Admin creates a valid shipment.
- Admin updates shipment information.
- Admin updates an allowed shipment status.
- Invalid transitions are rejected.
- Tracking details display correctly.
- Inventory is not deducted twice.

**Regression**
- Customer checkout still works.
- Customer order history still works.
- Customer order tracking still works.
- Payment receipt upload still works.
- Customer cancellation still works.
- Cart and Wishlist remain operational.
- Address management remains operational.
- Authentication and RBAC remain operational.

Run:
1. Frontend production build.
2. Admin order tests.
3. Payment and receipt tests.
4. Shipment and fulfillment tests.
5. RBAC and authorization tests.
6. Relevant checkout and order regression tests.
7. Relevant inventory and cancellation tests.

Report actual results. Do not claim tests passed unless they were executed successfully.

### 12. Final Checkpoint Report

Create:

`frontend-phase6-step7-checkpoint.md`

Include:

1. Files inspected.
2. Files created.
3. Files modified.
4. Verified backend order endpoints.
5. Verified backend payment endpoints.
6. Verified backend shipment endpoints.
7. Admin order management integration.
8. Payment and receipt review integration.
9. Shipment management integration.
10. Role and permission verification.
11. Inventory and fulfillment verification.
12. Frontend build results.
13. Backend test results.
14. Regression test results.
15. Unresolved issues.
16. Confirmation of database schema changes, if any.

### Completion Criteria

Step 7 is complete only when:

- Admin order management uses real backend data.
- Payment review and approval use real backend endpoints.
- Receipt viewing uses secure backend access.
- Shipment management uses real backend data.
- Role and permission restrictions are enforced.
- Inventory and fulfillment behavior remains backend-controlled.
- Existing customer workflows remain functional.
- Frontend build and test results are documented.

**STOP after completing Phase 6, Step 7. Do not begin Step 8 until the checkpoint report has been reviewed and approval is given.**