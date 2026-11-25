# Phase 5 – Step 6: Checkout and Payment Pages Completion

## Project: IBTU (ሀበሻን ጥበብ) E-Commerce Platform

## 1. Objective

Build a complete, responsive checkout and payment experience for the IBTU e-commerce platform.

Customers should be able to:

1. Review their shopping cart.
2. Select or enter a shipping address.
3. Review their order summary.
4. Enter a coupon code.
5. Select a payment method.
6. Review their order before placing it.
7. View an order confirmation interface.
8. Understand the next steps for payment and delivery.

This is a frontend-only milestone. Do not connect to backend APIs, create real orders, or process actual payments.

---

## 2. Inspect the Existing Project

Before implementation, inspect:

- React project structure.
- React Router configuration.
- Cart Context and Cart Page.
- Wishlist Context and Wishlist Page.
- Customer Account Dashboard.
- Address management implementation.
- Existing authentication state.
- Existing product and variant structures.
- Existing checkout-related components, if any.
- Existing design system and responsive layouts.

Verify the completion status of Steps 2–5.

Do not assume previous features are implemented correctly.

Reuse existing state management and components. Avoid duplicate cart, address, or authentication systems.

If an earlier milestone is incomplete, report any blockers before proceeding.

---

## 3. Checkout Route and Page Structure

Create the following customer-facing routes:

- `/checkout`
- `/checkout/payment`
- `/checkout/confirmation/:orderId`

Use the project's existing routing conventions.

Suggested folder structure:

```text
src/
  pages/
    checkout/
      CheckoutPage.jsx
      PaymentPage.jsx
      OrderConfirmationPage.jsx

  components/
    checkout/
      CheckoutProgress.jsx
      ShippingAddressSelector.jsx
      ShippingAddressForm.jsx
      CheckoutOrderSummary.jsx
      CouponInput.jsx
      PaymentMethodSelector.jsx
      PaymentInstructions.jsx
      OrderReview.jsx
```

Adjust the structure to match the actual project. Do not create unnecessary duplicate components.

---

## 4. Checkout Page – Shipping Information

Route:

`/checkout`

### Page layout

Create a clean checkout layout with:

- Checkout heading.
- Progress indicator.
- Shipping information section.
- Order summary section.
- Continue to Payment button.

### Shipping address selection

If the Customer Address Management feature from Step 5 exists:

- Display saved customer addresses.
- Allow customers to select an existing address.
- Clearly identify the default address.
- Allow customers to add a new address.
- Allow customers to edit an address if supported by the existing implementation.

### New address form

Include:

- Recipient Name
- Phone Number
- Address Type
- Address Line 1
- Address Line 2 (optional)
- City
- Region
- Postal Code (optional)
- Country

Set Ethiopia as the default country where appropriate.

### Validation

- Required fields must be completed.
- Validate email or phone information only where applicable.
- Validate phone number using existing project rules.
- Show clear inline validation errors.
- Prevent continuation when the selected address is invalid.

### Important

Do not invent delivery zones, shipping fees, or delivery dates.

Do not claim that an address has been saved to the server.

---

## 5. Checkout Order Summary

Display the customer's current cart items.

For each item, show:

- Product image.
- Product name.
- Selected size.
- Selected color.
- Quantity.
- Unit price in ETB.
- Item subtotal.

Display:

- Subtotal.
- Discount amount, if applicable.
- Shipping cost, only if a real frontend rule already exists.
- Tax, only if an established rule exists.
- Total amount.

### Business rules

- Calculate item subtotals from the current cart state.
- Calculate subtotal consistently.
- Do not invent tax rates.
- Do not invent shipping fees.
- Do not invent discounts.
- Clearly label estimates if the final amount depends on backend calculations.

Keep all monetary values in ETB.

---

## 6. Coupon Code Interface

Create a coupon input section.

Include:

- Coupon code input.
- Apply button.
- Remove coupon action.
- Discount display.
- Success and error feedback.

### Frontend behavior

Since the backend coupon API is not connected:

- Inspect whether existing mock coupon data exists.
- If no mock coupon data exists, implement only the coupon input UI and validation states.
- Do not invent real promotional codes.
- Do not claim that a coupon has been validated by the server.
- Do not permanently alter cart prices.

Keep coupon logic separate so it can later connect to the backend coupon validation API.

---

## 7. Payment Page

Route:

`/checkout/payment`

Create a dedicated payment selection and instructions page.

### Supported payment methods

Display the following options:

1. Cash on Delivery (COD)
2. Telebirr
3. CBE Birr
4. Bank Transfer
5. Card Payment, only as a clearly marked future option if no provider integration exists.

Use selectable payment cards or radio controls.

### Payment method behavior

When the customer selects a payment method, display the appropriate frontend instructions.

#### Cash on Delivery

Display:

- Explanation that payment is made upon delivery.
- A clear note that COD availability will be confirmed during backend integration.

#### Telebirr

Display:

- Telebirr payment method description.
- A placeholder for official merchant payment instructions.
- A clear notice that actual payment processing is not yet connected.

#### CBE Birr

Display:

- CBE Birr payment method description.
- A placeholder for official payment instructions.
- A clear notice that actual payment processing is not yet connected.

#### Bank Transfer

Display:

- Bank transfer method description.
- Placeholder for bank name, account name, and account number.
- Explain that official account details must be supplied by IBTU administrators.

**Never invent IBTU bank account details or merchant payment numbers.**

#### Card Payment

If no payment provider is available:

- Show the method as Coming Soon or disabled.
- Do not collect card numbers, CVV, PINs, or passwords.
- Do not simulate a successful card transaction.

---

## 8. Payment Receipt Upload Interface

For Telebirr, CBE Birr, or Bank Transfer, inspect whether the backend payment receipt workflow is already documented.

If appropriate, build a frontend-only receipt upload interface.

### Requirements

- Accept JPEG, JPG, PNG, and WebP images.
- Display selected filename.
- Provide an image preview when practical.
- Allow the customer to remove the selected file.
- Display file validation errors.
- Set a reasonable frontend file size limit, consistent with the existing backend specification (5 MB if that remains the planned limit).

### Important

- Do not upload files to a public folder.
- Do not claim that a receipt has been submitted or verified.
- Clearly label the interface as awaiting backend integration.
- Do not automatically mark payment as successful.

If the backend payment workflow requires a different sequence, document it rather than inventing one.

---

## 9. Order Review

Before final confirmation, display an order review section.

Include:

- Shipping address.
- Cart items.
- Subtotal.
- Discount.
- Shipping cost, if established.
- Tax, if established.
- Total.
- Selected payment method.

Provide:

- Back to Checkout.
- Back to Cart.
- Confirm Order button.

### Validation

Do not allow confirmation if:

- Cart is empty.
- Required shipping information is missing.
- No payment method is selected.
- Required frontend validation fails.

The Confirm Order button must not create a fake real order.

If no backend order API exists, show a clear message explaining that order placement will be enabled after backend integration.

---

## 10. Order Confirmation Page

Route:

`/checkout/confirmation/:orderId`

Create an order confirmation interface suitable for future backend integration.

### Confirmation information

Display:

- Confirmation heading.
- Order number.
- Order date, if available.
- Order summary.
- Total amount.
- Payment method.
- Payment status, if available.
- Shipping information.
- Next steps.

### Status handling

Support the existing project statuses:

Order statuses:
- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled
- Refunded

Payment statuses:
- Unpaid
- Pending
- Paid
- Failed
- Partially Refunded
- Refunded

### Important restrictions

- Do not invent order numbers.
- Do not generate fake payment references.
- Do not claim an order has been placed unless the backend confirms it.
- Do not claim a payment is successful without verified payment data.
- Handle unknown or unavailable order IDs with a useful message.

Provide navigation to:

- Continue Shopping.
- View My Orders, when the customer account routes are available.

---

## 11. Checkout Progress Indicator

Create a reusable progress indicator:

1. Cart
2. Shipping
3. Payment
4. Confirmation

Requirements:

- Clearly distinguish completed, current, and upcoming steps.
- Ensure mobile responsiveness.
- Do not allow users to skip required steps.
- Preserve the existing checkout state when navigating backward and forward.

---

## 12. State Management and Persistence

Inspect existing application state management.

Reuse:

- Cart Context.
- Customer Address state.
- Authentication state.
- Existing coupon state, if any.

If checkout state is missing, introduce a lightweight state implementation consistent with the project architecture.

Requirements:

- Preserve selected address while navigating checkout steps.
- Preserve selected payment method.
- Preserve validated frontend coupon state where applicable.
- Do not store sensitive payment information.
- Do not store card information.
- Handle page refresh and invalid checkout state safely.
- Clear temporary checkout state only after a confirmed successful order creation in the future backend integration.

Do not create a second independent cart state.

---

## 13. Authentication and Route Protection

Review the existing ProtectedRoute implementation.

Requirements:

- Checkout should require customer authentication if the current business flow supports registered-customer-only checkout.
- If guest checkout is an established project requirement, preserve that flow instead.
- Do not invent a guest checkout implementation.
- Protect customer order confirmation and account-related routes appropriately.
- Do not trust frontend role flags as production authorization.
- Document backend authorization requirements.

If real authentication is not yet connected, do not simulate successful customer authentication.

---

## 14. UI Design and Responsiveness

Follow the existing IBTU brand identity.

Colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

Requirements:

- Clean checkout layout.
- Consistent typography.
- Clear form labels.
- Accessible payment method selection.
- Clear validation and feedback messages.
- Responsive order summary.
- Mobile-friendly payment instructions.
- Consistent button styles.
- Reuse existing Lucide icons.
- Preserve the public website's design language.

Do not redesign unrelated pages.

---

## 15. Testing and Regression Verification

### Checkout

- [ ] `/checkout` loads correctly.
- [ ] Cart items display correctly.
- [ ] Address selection works.
- [ ] New address form works.
- [ ] Address validation works.
- [ ] Order summary calculates correctly.
- [ ] Empty cart is handled.
- [ ] Checkout navigation works.

### Coupon

- [ ] Coupon input works.
- [ ] Validation states display correctly.
- [ ] Remove coupon works.
- [ ] No fake server validation occurs.

### Payment

- [ ] Payment page loads.
- [ ] COD selection works.
- [ ] Telebirr selection works.
- [ ] CBE Birr selection works.
- [ ] Bank Transfer selection works.
- [ ] Card Payment is clearly marked as unavailable if not integrated.
- [ ] Payment instructions update correctly.
- [ ] Receipt file validation works if implemented.
- [ ] No fake payment success occurs.

### Order Review and Confirmation

- [ ] Order review displays correct information.
- [ ] Missing information is validated.
- [ ] Confirmation does not create a fake order.
- [ ] Unknown order IDs are handled.
- [ ] Payment status is not fabricated.

### Regression

- [ ] Home page works.
- [ ] Shop page works.
- [ ] Product Details works.
- [ ] Cart works.
- [ ] Wishlist works.
- [ ] Customer Dashboard works.
- [ ] Profile works.
- [ ] Address Management works.
- [ ] Order History works.
- [ ] Navbar and Footer work.
- [ ] Responsive desktop, tablet, and mobile layouts work.
- [ ] No console errors.
- [ ] `npm run build` succeeds.

---

## 16. Strict Scope Restrictions

Do NOT:

1. Modify backend files.
2. Modify database tables or schemas.
3. Create real orders.
4. Process real payments.
5. Integrate Telebirr or CBE Birr payment APIs.
6. Invent bank account or merchant details.
7. Mark payments as successful.
8. Invent tax rates or shipping costs.
9. Send real payment confirmation emails.
10. Implement real coupon validation without a backend.
11. Build Admin Dashboard pages.
12. Install new dependencies without explaining the reason and requesting approval.
13. Break existing Cart, Wishlist, or Customer Dashboard functionality.

This milestone is strictly for frontend checkout and payment experience completion.

---

## 17. Final Checkpoint Report

After implementation, provide:

### A. Checkout Page

| Feature | Status | Notes |
|---|---|---|
| Checkout route | | |
| Shipping address selection | | |
| New address form | | |
| Order summary | | |
| Coupon interface | | |
| Checkout validation | | |

### B. Payment Page

| Feature | Status | Notes |
|---|---|---|
| Payment route | | |
| Cash on Delivery | | |
| Telebirr | | |
| CBE Birr | | |
| Bank Transfer | | |
| Card Payment | | |
| Receipt upload interface | | |

### C. Order Confirmation

| Feature | Status | Notes |
|---|---|---|
| Confirmation route | | |
| Order summary | | |
| Payment status display | | |
| Shipping information | | |
| Unknown order handling | | |

### D. State Management

Explain how cart, shipping address, payment method, coupon, and checkout state are managed.

### E. Files Changed

List created and modified files and their purposes.

### F. Testing Results

Report build result, functional tests, responsive tests, regression tests, console errors, and remaining issues.

### G. Backend Integration Readiness

List the frontend features that need backend APIs, payment integrations, or configuration before production use.

### H. Final Status

Choose:

- Completed
- Partially Completed
- Blocked

**Stop after Phase 5 Step 6. Do not begin Admin Dashboard development until this checkpoint report has been reviewed and approval is given.**