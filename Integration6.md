# IBTU – Phase 6, Step 6
## Checkout and Order Creation API Integration

### 1. Objective

Integrate the existing React checkout experience with the real IBTU backend.

Replace mock checkout calculations and order creation with backend-driven operations.

The completed workflow should allow a customer to:

1. Review their shopping cart.
2. Select a shipping address.
3. Review the order summary.
4. Apply and validate a coupon, if supported by the existing backend.
5. Select an available payment method.
6. Submit the order.
7. Receive a real order confirmation using the backend-generated order information.

**Important:** The backend is the source of truth for prices, discounts, shipping costs, stock availability, and order totals. Never trust financial values calculated by the frontend.

### 2. Inspect the Existing Project First

Before changing any code, inspect:

**Frontend**
- Checkout page and its child components.
- `CartContext.jsx`.
- `AuthContext.jsx`.
- `addressApi.js`.
- Existing coupon functionality.
- Existing payment components and pages.
- Existing order confirmation page.
- Axios API client and error handling.
- Existing route configuration.

**Backend**
- Checkout routes.
- Checkout controller and service.
- Order creation service.
- Cart validation logic.
- Inventory reservation logic.
- Coupon validation and usage logic.
- Payment creation logic.
- Order retrieval endpoints.
- Database transactions and stock-locking logic.

Read the actual implementation. Do not assume that previously documented endpoints or payload structures match the current backend.

Before editing, produce a short implementation plan and identify any missing backend capabilities.

### 3. Verify Backend Checkout Endpoints

Previously planned endpoints include:

- `POST /api/checkout/preview`
- `POST /api/checkout/orders`

Also inspect the actual order and payment endpoints available in the backend.

For each endpoint, document:

- HTTP method and route.
- Authentication requirements.
- Request payload.
- Response structure.
- Validation rules.
- Error responses.
- Database operations.
- Whether the operation uses a database transaction.

Do not create duplicate endpoints if equivalent functionality already exists.

If an essential backend endpoint is missing, document the gap before implementing around it. Do not modify database tables or constraints without explicit approval.

### 4. Create Checkout API Service

Create:

`frontend/src/services/api/checkoutApi.js`

Use the existing Axios client and centralized error handling.

Implement service functions for the verified backend operations:

- Generate checkout preview.
- Create an order.
- Retrieve an order if the existing backend supports it.

If coupon validation is a separate backend endpoint, reuse the existing coupon API service or create a dedicated service only if necessary.

Requirements:

- Do not create another Axios instance.
- Do not hardcode API URLs.
- Do not calculate authoritative order totals in this service.
- Normalize API responses consistently.
- Preserve backend validation errors.
- Handle network failures and expired authentication sessions.

### 5. Integrate Checkout Preview

Connect the existing checkout page to the backend checkout preview endpoint.

The preview should use the customer's current cart and selected shipping address.

Display the values returned by the backend, where supported:

- Product names.
- Selected variants.
- Quantities.
- Unit prices.
- Item subtotals.
- Subtotal.
- Coupon discount.
- Shipping cost.
- Tax amount.
- Final total.
- Currency.

Requirements:

1. Fetch a preview when the checkout page loads.
2. Refresh the preview when the selected address changes.
3. Refresh the preview when cart contents change.
4. Refresh the preview when a coupon is applied or removed.
5. Show loading and error states.
6. Prevent submission when the preview is invalid or required information is missing.

Do not trust prices, stock quantities, or totals previously stored in the browser.

If the backend rejects a product or variant because it is inactive or unavailable, display a clear explanation and guide the customer back to the cart.

### 6. Integrate Coupon Validation

Inspect the existing backend coupon implementation before connecting the frontend.

If the backend supports coupon validation, connect the existing coupon input to the real API.

Support the applicable rules:

- Coupon code must exist.
- Coupon must be active.
- Coupon must be within its validity period.
- Minimum order amount must be satisfied.
- Usage limits must be respected.
- Per-customer usage limits must be respected.
- Discount type and maximum discount rules must be applied by the backend.

When a coupon is accepted:

- Display the confirmed discount.
- Refresh the checkout preview.
- Update the order summary using backend-calculated values.

When a coupon is rejected:

- Display the backend's validation message.
- Do not apply a frontend-only discount.

Do not modify the coupon database schema or create a new coupon system.

If the coupon API is not ready, preserve the existing UI but clearly report the missing integration instead of pretending coupon validation is live.

### 7. Integrate Payment Method Selection

Inspect the existing payment methods and backend support.

Previously defined payment methods include:

- Cash on Delivery.
- Telebirr.
- CBE Birr.
- Bank Transfer.
- Card.
- Other, where supported.

Use only payment methods that are actually supported and configured by the backend.

Requirements:

1. Display available payment methods.
2. Allow the customer to select a valid method.
3. Send the selected payment method using the backend's expected payload.
4. Display payment instructions only when the backend provides configured instructions.
5. Never invent bank account numbers, merchant accounts, payment references, or payment instructions.
6. Do not request or store PINs, CVVs, passwords, or other payment credentials.

Do not implement a fake online payment gateway or mark an online payment as successful from a frontend response.

### 8. Integrate Real Order Creation

Connect the checkout submission action to the verified order creation endpoint.

Before submission:

- Confirm the cart is not empty.
- Confirm the shipping address is valid.
- Confirm a supported payment method is selected.
- Confirm the latest checkout preview is valid.
- Prevent duplicate submissions while a request is in progress.

Send only the information required by the backend, such as:

- Selected shipping address ID or supported guest address details.
- Payment method.
- Coupon code, if applicable.
- Customer notes, if supported.

Do not send frontend-calculated totals as authoritative values.

The backend must:

1. Validate the cart and selected variants.
2. Recalculate prices and discounts.
3. Validate coupon eligibility.
4. Validate available inventory.
5. Reserve stock safely.
6. Create the order and order items.
7. Create the appropriate payment record.
8. Record coupon usage where applicable.
9. Commit the transaction only when all required operations succeed.

Verify that stock reservation and order creation are atomic.

If any operation fails, the backend must not leave a partially created order or inconsistent inventory reservation.

Do not implement these backend operations again in the frontend.

### 9. Handle Order Creation Results

After successful order creation:

- Read the actual order response.
- Use the backend-generated order ID and order number.
- Display the real order confirmation.
- Display the confirmed order total.
- Display the selected payment method and current payment status.
- Provide navigation to the appropriate order details page.
- Refresh or clear the cart only after the backend confirms successful order creation.

Do not generate fake order numbers or show a success message before receiving a successful backend response.

If order creation fails:

- Preserve the customer's cart.
- Preserve the selected address where appropriate.
- Display a useful error message.
- Allow the customer to retry safely.
- Handle expired stock, changed prices, and invalid coupons.

### 10. Guest Checkout Compatibility

Inspect the existing guest checkout behavior before making changes.

If guest checkout is supported by the backend:

- Preserve guest cart functionality.
- Use the existing guest cart token mechanism.
- Submit guest customer details and shipping information using the backend's expected payload.
- Do not expose registered customers' saved addresses to guests.
- Do not create an authenticated customer account automatically.

If guest order creation is not supported, do not simulate it. Document the limitation and preserve the existing behavior as far as possible.

### 11. Payment Receipt Upload

Inspect the existing receipt-upload implementation.

If the backend already supports receipt uploads, connect the existing payment or checkout UI to it only after a successful order and payment record have been created.

Previously planned endpoint:

`POST /api/payments/:paymentId/receipt`

Previously planned multipart field:

`receipt`

Verify the actual route and expected payload before using it.

Requirements:

- Use the backend-generated payment ID.
- Follow the backend's allowed file types and size restrictions.
- Show upload progress or a clear loading state where supported.
- Display successful submission feedback.
- Preserve the distinction between receipt submission and payment approval.

**Critical:** Uploading a receipt must never automatically mark a payment as successful. Payment approval remains an authorized backend/admin operation.

If receipt upload is not available, document it as a remaining integration task. Do not create a mock successful upload.

### 12. Order Confirmation and Customer Order History

Inspect the existing order confirmation page and customer order history page.

Connect them to real backend data where the required endpoints already exist.

The order confirmation should display:

- Order number.
- Order date.
- Order status.
- Payment status.
- Items ordered.
- Quantities and variant information.
- Shipping address snapshot.
- Subtotal.
- Discount.
- Shipping cost.
- Tax.
- Final total.
- Payment method.

Use backend order snapshots rather than current product information for historical order details.

If the customer order history endpoint is available, ensure that newly created orders appear in the customer's order history.

Do not expose another customer's order information.

### 13. Security and Business Rules

Verify the following:

- Only authorized customers can create orders for their own accounts.
- Guest checkout follows backend guest authorization rules.
- Customers cannot manipulate prices by changing browser requests.
- Customers cannot bypass stock validation.
- Customers cannot apply invalid or expired coupons.
- Duplicate order submissions are handled safely.
- Payment status cannot be changed by frontend claims.
- Order ownership is checked when retrieving order details.
- Inventory reservations are handled transactionally.
- Failed order creation does not leave inconsistent inventory or coupon usage.

Do not rely on frontend validation as a substitute for backend security.

### 14. Preserve Existing Functionality

Do not:

- Redesign the checkout interface.
- Change IBTU brand colors or typography.
- Change the existing authentication system.
- Replace the CartContext.
- Break guest cart functionality.
- Break Wishlist functionality.
- Break customer address management.
- Modify database schema without approval.
- Invent payment configuration.
- Add a fake payment gateway.
- Mark payments successful from the frontend.
- Remove existing features that are outside this step.

Reuse existing components and API utilities wherever possible.

### 15. Testing and Validation

Run and document the following tests.

**Checkout preview**
- Customer opens checkout with a valid cart.
- Preview displays backend-calculated totals.
- Address changes refresh the preview.
- Cart changes refresh the preview.
- Inactive and unavailable products are handled.
- Invalid coupons are rejected.
- Valid coupons display the backend-confirmed discount.

**Order creation**
- Customer successfully creates an order.
- Empty cart submission is rejected.
- Invalid address submission is rejected.
- Unsupported payment methods are rejected.
- Insufficient stock is handled.
- Price changes are handled.
- Duplicate submission is handled.
- Failed order creation does not clear the cart.
- Successful order creation returns a real order number.

**Payment**
- Correct payment method is submitted.
- Payment status is displayed from backend data.
- Receipt upload works if supported.
- Receipt submission does not automatically approve payment.

**Regression**
- Login and registration still work.
- Cart operations still work.
- Guest cart behavior still works.
- Wishlist still works.
- Address management still works.
- Checkout navigation still works.
- Customer order history remains functional.

Run:

1. Frontend production build.
2. Relevant backend checkout and order tests.
3. Cart regression tests.
4. Address regression tests.
5. Coupon tests, if integrated.
6. Payment tests, if integrated.
7. Relevant authentication and catalog regression tests.

Report actual test results. Do not claim tests passed unless they were executed successfully.

### 16. Final Checkpoint Report

Create:

`frontend-phase6-step6-checkpoint.md`

Include:

1. Files inspected.
2. Files created.
3. Files modified.
4. Verified backend checkout endpoints.
5. Checkout preview integration.
6. Coupon integration status.
7. Payment method integration.
8. Order creation integration.
9. Inventory reservation verification.
10. Guest checkout status.
11. Receipt upload integration status.
12. Order confirmation and history integration.
13. Security checks.
14. Frontend production build results.
15. Backend test results.
16. Regression test results.
17. Unresolved issues and missing backend endpoints.
18. Confirmation of database schema changes, if any.

### Completion Criteria

Step 6 is complete only when:

- Checkout preview uses backend-calculated values.
- Address selection is connected to the real address service.
- Coupon validation uses the backend if supported.
- Order creation uses the real backend.
- Stock reservation is handled safely by the backend.
- Successful orders display real backend-generated information.
- Failed submissions do not incorrectly clear the cart.
- Payment status is never falsely represented.
- Existing cart, wishlist, address, and authentication functionality remains intact.
- Frontend build and test results are documented.

**STOP after completing Phase 6, Step 6. Do not begin Step 7 until the checkpoint report has been reviewed and approval is given.**