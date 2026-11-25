# IBTU E-Commerce Platform
## Phase 4 – Step 1: Checkout, Order Creation and Manual Payment Verification

### Objective

Develop a secure checkout and order creation system using Node.js, Express, and MariaDB.

Customers should be able to:
- Review their shopping cart before checkout.
- Select a delivery address.
- Choose a payment method.
- Submit an order.
- Upload a payment receipt image for manual verification.
- Track payment verification status.
- View their order confirmation.

The shop owner (Admin) must be able to review uploaded receipts and approve or reject payments.

**Important:** Do not modify the existing React frontend or recreate existing database tables during this backend development step.

---

### STEP 0: Verify Previous Checkpoints

Confirm completion of:

1. Phase 3 – Step 1: Shopping Cart API.
2. Phase 3 – Step 2: Wishlist API.
3. Phase 3 – Step 3: Customer Address Management API.

Do not assume previous development steps are complete.

### STEP 1: Inspect Existing Database Tables

Inspect the actual structures and relationships of:

- `carts`
- `cart_items`
- `users`
- `customer_addresses`
- `products`
- `product_variants`
- `orders`
- `order_items`
- `payments`
- `inventory_movements`
- `audit_logs`

Pay particular attention to the existing `payments` fields:

- id
- order_id
- payment_reference
- provider_transaction_id
- payment_method
- payment_provider
- amount
- currency
- payment_status
- transaction_response
- paid_at
- created_at
- updated_at

Verify actual column names and types.

Do not modify existing tables without explaining the required changes and requesting my approval.

### STEP 2: Define Payment Methods and Workflow

Implement these payment methods:

| Payment method | Customer action | Verification |
|---|---|---|
| Cash on delivery | Select at checkout | Confirm according to delivery/payment policy |
| Telebirr | Transfer money and upload receipt | Shop owner approves |
| CBE Birr | Transfer money and upload receipt | Shop owner approves |
| Bank transfer | Transfer money and upload receipt | Shop owner approves |

For mobile and bank transfers, the workflow must be:

<escape>Customer places order → Selects payment method → Sees shop payment instructions → Transfers money → Uploads receipt → Payment awaits review → Shop owner reviews receipt → Approves or rejects → Customer receives updated status</escape>

Important payment rules:

- Uploading a receipt does NOT mean the payment is successful.
- Never automatically mark a payment as paid after image upload.
- Only an authorized shop owner can approve or reject a payment.
- The payment amount must be compared with the actual order total.
- Record who approved or rejected the payment and when.
- Record rejection reasons.
- Customers must be able to see their payment verification status.

### STEP 3: Design Payment Receipt Storage

Inspect the existing file-upload architecture.

Create the necessary files if they do not exist:

- `src/config/payment-upload.js`
- `src/middleware/payment-upload.middleware.js`
- `src/validators/payment.validator.js`
- `src/services/payment.service.js`
- `src/controllers/payment.controller.js`
- `src/routes/payment.routes.js`

Use Multer or the existing upload solution.

Allowed image formats:
- JPEG
- JPG
- PNG
- WebP

Security requirements:

1. Validate actual file content, not just filename extensions.
2. Set a reasonable maximum upload size, such as 5 MB.
3. Generate unique filenames.
4. Prevent executable file uploads.
5. Store receipts outside publicly accessible directories.
6. Never trust filenames supplied by customers.
7. Only the owning customer and authorized shop owner can view a receipt.
8. Never expose internal filesystem paths.
9. Do not delete receipt evidence while a payment dispute or review is unresolved.

If cloud storage is appropriate for production, explain the options and recommend an approach without assuming cloud credentials exist.

### STEP 4: Implement Payment Instructions

Create a secure configuration approach for shop payment information.

The customer should see the relevant instructions based on the selected method.

Examples:

**Telebirr**
- Shop account name.
- Telebirr phone/account number.
- Payment instructions.

**CBE Birr**
- Account holder name.
- CBE Birr account/phone number.
- Payment instructions.

**Bank transfer**
- Bank name.
- Account holder name.
- Account number.
- Branch information, if needed.
- Payment instructions.

Do not invent actual shop payment details.

Store configurable payment instructions securely and make them manageable by an authorized Admin.

If no suitable settings storage already exists, propose the required design and request approval before changing the database.

Never expose secret credentials or payment-provider authentication keys.

### STEP 5: Implement Checkout and Order Creation

Endpoints:

- `POST /api/checkout/preview`
- `POST /api/checkout/orders`

Requirements:

1. Retrieve the customer's cart securely.
2. Validate products and variants.
3. Verify stock availability.
4. Calculate prices on the server.
5. Validate the delivery address.
6. Calculate subtotal, shipping, discount, tax, and total.
7. Generate a unique order number.
8. Create the order and order-item snapshots.
9. Create the initial payment record.
10. Reserve inventory safely.
11. Clear the cart only after successful transaction completion.

For Telebirr, CBE Birr, and bank transfer:

- Initial payment status should be `pending`.
- The order must remain in an awaiting-payment-verification state using the existing supported order-status design.
- Return payment instructions and a payment reference to the customer.
- Do not mark the payment successful.

For cash on delivery:

- Create the order with the appropriate unpaid payment status.
- Do not require a receipt upload.

Inspect the existing ENUM values before implementing order statuses. If a new status is required, explain and request approval before modifying the database.

### STEP 6: Implement Receipt Upload

Endpoint:

`POST /api/payments/:paymentId/receipt`

Use `multipart/form-data`.

Expected field:

`receipt`

Requirements:

1. Authenticate the customer.
2. Verify that the payment belongs to the customer's order.
3. Verify the payment method requires a receipt.
4. Verify the payment is awaiting receipt submission or an allowed resubmission.
5. Validate the uploaded image.
6. Store the receipt securely.
7. Save its reference in the database using an approved schema.
8. Update the payment verification status to awaiting review.
9. Record upload date and time.
10. Return the updated payment status.

Customers must not be able to upload receipts for another customer's payment.

Prevent duplicate or unnecessary receipt submissions.

If a payment has already been approved, prevent receipt replacement.

### STEP 7: Implement Shop Owner Payment Review

Create an Admin-only payment review system.

Endpoints:

**Get Pending Payments**

`GET /api/admin/payments/pending`

Return:
- Payment reference.
- Order number.
- Customer name.
- Payment method.
- Amount expected.
- Receipt upload date.
- Verification status.

**View Payment Details**

`GET /api/admin/payments/:paymentId`

Return payment details and secure receipt access.

**Approve Payment**

`PATCH /api/admin/payments/:paymentId/approve`

Requirements:
- Verify Admin authorization.
- Verify payment is awaiting review.
- Record approving Admin ID.
- Record approval date.
- Update payment status to successful.
- Update order payment status to paid.
- Update order status according to the agreed order workflow.
- Record the action in `audit_logs`.

**Reject Payment**

`PATCH /api/admin/payments/:paymentId/reject`

Example request:

```json
{
  "rejection_reason": "The uploaded receipt does not show the correct payment amount."
}
```

Requirements:
- Verify Admin authorization.
- Require a rejection reason.
- Record rejecting Admin ID.
- Record rejection date.
- Update the payment verification status.
- Keep the order unpaid.
- Notify the customer through the available notification mechanism.
- Allow receipt resubmission according to the approved business rules.
- Record the action in `audit_logs`.

Use transactions for all related payment and order status changes.

Prevent two administrators from processing the same payment simultaneously.

### STEP 8: Customer Payment Status and History

Implement:

`GET /api/payments/:paymentId`

`GET /api/orders/:id`

Return the customer's own payment and order information.

Possible customer-facing payment statuses:

- `pending`: Payment created, awaiting receipt.
- `awaiting_review`: Receipt uploaded and awaiting shop owner review.
- `successful`: Payment approved.
- `rejected`: Receipt rejected.
- `failed`: Payment failed.
- `cancelled`: Payment cancelled.
- `refunded`: Payment refunded.

These are proposed application statuses. Inspect the existing database ENUM before implementation. Do not change it without approval.

The customer should see:
- Payment method.
- Amount.
- Payment reference.
- Receipt submission date.
- Verification status.
- Rejection reason, if applicable.
- Approval date when approved.

### STEP 9: Implement Notifications

At minimum, create a notification-ready workflow for:

- Receipt successfully uploaded.
- Payment approved.
- Payment rejected.
- Receipt resubmission requested.

First inspect whether the project already has a notification service or table.

Do not create a notification table without explaining why it is needed and requesting approval.

If notifications are not implemented yet, return clear API messages and document the future integration.

### STEP 10: Security and Business Rules

- Customers cannot approve their own payments.
- Only Admin can approve or reject payments.
- Receipt files must be private.
- Never trust frontend payment status.
- Never trust frontend prices.
- Never mark an uploaded receipt as a successful payment.
- Prevent duplicate payment approvals.
- Use database transactions.
- Keep audit records of approval and rejection.
- Preserve payment evidence.
- Do not expose another customer's payment information.
- Never store PINs, passwords, CVVs, or banking credentials.
- Validate every uploaded file.
- Keep payment and order statuses consistent.

### STEP 11: API Testing

Test these scenarios:

1. Create a Telebirr order.
2. Create a CBE Birr order.
3. Create a bank-transfer order.
4. Create a cash-on-delivery order.
5. Verify initial payment status.
6. Upload a valid receipt.
7. Upload an invalid file.
8. Upload a file exceeding the size limit.
9. Attempt receipt upload without authentication.
10. Attempt to upload a receipt for another customer's payment.
11. Retrieve pending payments as Admin.
12. Attempt payment approval as a Customer.
13. Approve a valid payment as Admin.
14. Reject a payment with a reason.
15. Attempt duplicate approval.
16. Attempt to approve an already rejected payment without resubmission.
17. Verify customer payment status after approval.
18. Verify customer payment status after rejection.
19. Verify order payment status remains unpaid after rejection.
20. Verify receipt access is restricted.
21. Verify audit logs are created.
22. Verify database rollback if an approval transaction fails.

### STEP 12: Final Checkpoint

Provide:

**IBTU Phase 4 – Step 1 Checkpoint**

- Previous checkpoints verified: yes/no
- Checkout preview: completed/not completed
- Order creation: completed/not completed
- Inventory reservation: completed/not completed
- Payment initialization: completed/not completed
- Payment instructions: completed/not completed
- Receipt image upload: completed/not completed
- Private receipt storage: completed/not completed
- Pending payment review: completed/not completed
- Admin approval: completed/not completed
- Admin rejection: completed/not completed
- Customer payment status: completed/not completed
- Audit logging: completed/not completed
- Security tests: completed/not completed
- Transaction tests: completed/not completed
- Errors or remaining issues:

Include files created or modified, implemented endpoints, Postman results, required database changes, and unresolved decisions.

**STOP after this checkpoint. Do not start the next development phase until I review and confirm the results.**

### Development Instructions

- Work step by step.
- Explain important code in simple English.
- Provide complete code with exact file paths.
- Inspect existing schemas before implementation.
- Do not recreate existing tables.
- Request approval before schema changes.
- Preserve existing functionality.
- Do not modify the frontend.
- Never claim payment success based only on receipt upload.
- Wait for my confirmation before continuing.