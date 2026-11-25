# Phase 5 – Step 5: Customer Account Dashboard Completion

## Project: IBTU (ሀበሻን ጥበብ) E-Commerce Platform

### Objective

Build a complete, responsive Customer Account Dashboard using the existing React frontend architecture and IBTU design system.

The Customer Dashboard should provide a centralized area where customers can:

1. View their account overview.
2. Manage personal profile information.
3. Manage shipping addresses.
4. View their order history.
5. View individual order details.
6. Track their orders and shipment progress.
7. Navigate easily between account sections.

This milestone focuses on frontend development only. Backend API integration will be handled in a later phase.

---

# Step 1: Inspect the Existing Project

Before writing or modifying code, inspect the actual frontend project.

Review:

- Existing React folder structure.
- React Router configuration.
- Login and Registration pages.
- Existing authentication context or state management.
- ProtectedRoute component.
- Cart and Wishlist contexts.
- Existing shared components.
- Existing mock product and order data, if any.
- Existing customer-related pages or partial implementations.
- Existing styling, typography, icons, and responsive patterns.

Also verify the implementation status of Phase 5 Steps 2, 3, and 4.

### Important instructions

- Do not assume previous steps were completed successfully.
- Reuse existing components and contexts.
- Do not create duplicate authentication or shopping state systems.
- Preserve the existing public website.
- Do not rewrite working functionality unnecessarily.
- Identify dependencies and implementation limitations before making changes.

If previous steps are incomplete, report the findings and explain whether they block this milestone.

---

# Step 2: Create the Customer Dashboard Layout

Create a reusable Customer Dashboard layout.

Suggested route structure:

- `/account`
- `/account/profile`
- `/account/addresses`
- `/account/orders`
- `/account/orders/:orderId`
- `/account/orders/:orderId/tracking`

Suggested folder structure (adapt to the existing project):

```text
src/
  components/
    customer/
      CustomerSidebar.jsx
      CustomerHeader.jsx
      CustomerLayout.jsx
      AccountStatCard.jsx
      AddressCard.jsx
      OrderCard.jsx
      OrderStatusBadge.jsx
      TrackingTimeline.jsx

  pages/
    customer/
      AccountDashboard.jsx
      ProfilePage.jsx
      AddressesPage.jsx
      OrdersPage.jsx
      OrderDetailsPage.jsx
      OrderTrackingPage.jsx
```

Do not create unnecessary components if equivalent reusable components already exist.

### Desktop layout

Use a professional account dashboard layout:

- Left sidebar navigation.
- Main content area.
- Customer account heading.
- Consistent spacing and card layouts.
- Responsive navigation.

### Sidebar navigation

Include:

- Overview
- My Profile
- My Addresses
- My Orders
- Back to Shop
- Logout

Use suitable Lucide icons.

### Mobile layout

- Convert the sidebar into a mobile-friendly navigation menu.
- Avoid horizontal overflow.
- Ensure all navigation links are accessible.
- Keep content readable on small screens.

---

# Step 3: Customer Account Overview

Route:

`/account`

Create the main customer dashboard overview.

### Welcome section

Display:

- Welcome message.
- Customer's first name when available.
- Short account summary.

Do not hardcode a real customer identity.

### Account summary cards

Display:

1. Total Orders
2. Pending Orders
3. Completed Orders
4. Saved Addresses

Calculate these values from the available customer data.

If no order or address data exists, display zero rather than invented statistics.

### Recent Orders

Display a table or responsive list containing:

- Order Number
- Order Date
- Total Amount (ETB)
- Payment Status
- Order Status
- View Details action

Display the latest orders first.

If the customer has no orders, show a clear empty state with a button linking to `/shop`.

### Quick Actions

Include:

- Browse Products
- Manage Profile
- Manage Addresses
- View All Orders

Ensure each action navigates to the correct route.

---

# Step 4: Customer Profile Page

Route:

`/account/profile`

Create a profile management page.

### Profile information

Display and allow editing of:

- First Name
- Last Name
- Email Address
- Phone Number

### Required behavior

- Load the current profile from the existing authentication/customer state when available.
- Allow editing supported fields.
- Validate required fields.
- Validate email format.
- Validate phone number according to the project's existing rules.
- Display clear validation messages.
- Provide Save Changes and Cancel actions.
- Show appropriate success or error feedback.

### Security and limitations

- Do not allow customers to edit their role or account permissions.
- Do not expose password hashes or authentication tokens.
- Do not implement password changes unless an existing secure flow is already available.
- Do not claim that profile changes have been saved to the server.

If backend APIs are not connected, clearly identify the update as frontend-only.

Do not invent customer data.

---

# Step 5: Customer Address Management

Route:

`/account/addresses`

Create a complete shipping address management interface.

### Address information

Each address should support:

- Recipient Name
- Phone Number
- Address Type (Home, Work, Other)
- Address Line 1
- Address Line 2 (optional)
- City
- Region
- Postal Code (optional)
- Country
- Default Address indicator

Use Ethiopia as the default country where appropriate.

### Address management features

Customers should be able to:

1. View saved addresses.
2. Add a new address.
3. Edit an existing address.
4. Delete an address.
5. Set an address as the default.
6. Identify which address is currently the default.

### Form behavior

- Use a modal or dedicated form consistent with the existing design.
- Validate required fields.
- Validate phone number format.
- Display clear validation errors.
- Prevent submission of incomplete forms.
- Provide Save and Cancel actions.

### Default address rules

- A customer should have no more than one default address.
- When a customer sets another address as default, update the previous default.
- If the default address is deleted, handle the remaining addresses consistently.
- Do not automatically assign a default address unless the behavior is clearly defined.

Use a consistent state update so the address list and dashboard summary remain synchronized.

### Persistence

Use the existing state management and frontend persistence approach where appropriate.

Do not connect to backend address APIs in this step.

---

# Step 6: Customer Order History

Route:

`/account/orders`

Create a complete order history page.

### Order listing

Display:

- Order Number
- Order Date
- Number of Items
- Total Amount (ETB)
- Payment Status
- Order Status
- View Details button
- Track Order action when shipment information exists

### Order status values

Support the statuses defined by the existing project/backend design:

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled
- Refunded

### Payment status values

Support:

- Unpaid
- Pending
- Paid
- Failed
- Partially Refunded
- Refunded

Use consistent status badges with clear visual distinctions.

### Filters

Provide frontend filtering for:

- All Orders
- Pending
- Processing
- Shipped
- Delivered
- Cancelled

Include:

- Search by order number.
- Sort by newest and oldest.
- Empty results state.
- Clear filters action.

Do not invent orders or payment statuses.

If there is no genuine customer order data available, display a useful empty state.

---

# Step 7: Customer Order Details Page

Route:

`/account/orders/:orderId`

Create a detailed order information page.

### Order information

Display:

- Order Number
- Order Date
- Order Status
- Payment Status
- Payment Method, when available
- Currency (ETB)

### Order Items

For each item, display:

- Product Image
- Product Name
- SKU, if available
- Selected Size
- Selected Color
- Quantity
- Unit Price
- Item Total

Use saved order-item information when available.

Order item information should be treated as a historical snapshot. Do not silently replace historical product names or prices with current catalog values.

### Order Summary

Display:

- Subtotal
- Discount Amount
- Shipping Cost
- Tax Amount, if available
- Total Amount

Only display values supported by the available order data.

Do not invent tax or shipping amounts.

### Shipping Information

Display:

- Recipient Name
- Phone Number
- Address
- City
- Region
- Country

Use the order's shipping address snapshot when available.

### Payment Information

Display:

- Payment Method
- Payment Reference, if available
- Payment Status
- Payment Date, if available

Never display sensitive payment credentials.

### Navigation

Provide:

- Back to Orders
- Track Order, when applicable
- Continue Shopping

Ensure an invalid or unavailable order ID displays an appropriate not-found state rather than crashing the application.

Customers must only be able to view their own order information once real authentication and backend authorization are integrated.

---

# Step 8: Order Tracking Page

Route:

`/account/orders/:orderId/tracking`

Create a customer-friendly shipment tracking interface.

### Tracking information

Display when available:

- Order Number
- Tracking Number
- Courier Name
- Courier Phone
- Estimated Delivery Date
- Shipment Status

### Tracking timeline

Create a visual timeline with the following possible stages:

1. Order Placed
2. Order Confirmed
3. Processing
4. Shipped
5. In Transit
6. Out for Delivery
7. Delivered

Also handle:

- Failed
- Returned
- Cancelled

Use the actual shipment status and available timestamps.

### Important behavior

- Clearly distinguish completed, current, and upcoming stages.
- Display actual timestamps only when available.
- Do not generate fake tracking events or delivery timestamps.
- Do not display invented tracking numbers.
- If shipment information is unavailable, display a clear message that tracking information is not yet available.

If the existing data supports multiple shipments, inspect that structure before designing the tracking interface. Do not assume every order has exactly one shipment.

---

# Step 9: Authentication and Route Protection

Review the existing authentication implementation.

The Customer Dashboard must be designed for authenticated customers.

### Requirements

1. Review the existing ProtectedRoute component.
2. Reuse the existing authentication context.
3. Protect customer account routes when a reliable authentication mechanism exists.
4. Ensure customer-only pages are not accessible to unauthenticated users.
5. Ensure Admin and Data Encoder users are not treated as customers.
6. Preserve the original destination when redirecting unauthenticated users, if supported.
7. Ensure Logout uses the existing authentication flow.

### Important restriction

If real backend authentication has not been implemented:

- Do not create fake authenticated users.
- Do not hardcode authentication flags.
- Do not bypass route protection.
- Do not grant customer access based only on a localStorage boolean.
- Document which authentication integration is required before production use.

Keep the route and layout architecture ready for future backend integration.

---

# Step 10: Customer Dashboard UI Design

Use the established IBTU brand identity.

### Brand colors

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

### Design requirements

- Professional and clean e-commerce dashboard.
- Consistent typography.
- Consistent buttons and form controls.
- Clear status badges.
- Reusable cards.
- Appropriate empty states.
- Consistent icons.
- Smooth but subtle animations.
- Responsive layouts.

Do not introduce a completely different design language from the existing IBTU website.

Do not redesign the public website.

---

# Step 11: State Management and Frontend Data

Inspect the current application state architecture.

Use existing state management wherever possible.

### Data handling

- Reuse existing customer state when available.
- Reuse existing address state if implemented.
- Reuse existing order data structures if available.
- Keep customer profile, address, and order data organized.
- Avoid duplicating data across unrelated components.
- Keep calculations consistent across dashboard cards and order lists.

### Mock data restrictions

If mock data is needed for UI development:

- Use clearly identified development-only sample data.
- Do not present sample orders as real customer orders.
- Keep mock data separate from real authentication state.
- Never mix one customer's sample orders with another customer's account.
- Make it easy to replace mock data with backend API responses later.

Do not modify the database or backend.

---

# Step 12: Testing and Regression Verification

Test every feature.

### Dashboard

- [ ] `/account` loads correctly.
- [ ] Customer overview displays correctly.
- [ ] Summary statistics calculate correctly.
- [ ] Recent orders display correctly.
- [ ] Empty order state works.
- [ ] Quick navigation works.

### Profile

- [ ] Profile page loads.
- [ ] Profile information displays correctly.
- [ ] Form validation works.
- [ ] Editing works.
- [ ] Save and Cancel actions work.
- [ ] Feedback messages display correctly.

### Addresses

- [ ] Address list loads.
- [ ] Add address works.
- [ ] Edit address works.
- [ ] Delete address works.
- [ ] Default address selection works.
- [ ] Only one default address is maintained.
- [ ] Validation works.

### Orders

- [ ] Order history loads.
- [ ] Order filtering works.
- [ ] Order search works.
- [ ] Sorting works.
- [ ] Order details navigation works.
- [ ] Invalid order IDs are handled.
- [ ] Empty states work.

### Tracking

- [ ] Tracking page loads.
- [ ] Timeline reflects actual status.
- [ ] Available tracking details display correctly.
- [ ] Missing tracking information is handled.
- [ ] Cancelled and returned statuses are handled.

### Authentication and Security

- [ ] Customer routes use the appropriate protection.
- [ ] Unauthenticated access is handled correctly.
- [ ] Admin and Data Encoder roles are not treated as customers.
- [ ] Logout behavior is consistent with the existing authentication implementation.
- [ ] No sensitive information is exposed.

### Regression

- [ ] Home page still works.
- [ ] Shop page still works.
- [ ] Product Details still works.
- [ ] Cart page still works.
- [ ] Wishlist page still works.
- [ ] Cart Drawer still works.
- [ ] Login and Registration still work.
- [ ] About and Contact still work.
- [ ] Navbar and Footer still work.
- [ ] Desktop, tablet, and mobile layouts work.
- [ ] No console errors.
- [ ] No broken imports.
- [ ] `npm run build` succeeds.

Fix issues introduced by this milestone.

---

# Strict Scope Restrictions

Do NOT:

1. Modify backend files.
2. Modify database schemas or tables.
3. Connect customer pages to backend APIs.
4. Implement real order creation.
5. Implement payment processing.
6. Implement real courier integrations.
7. Build Admin Dashboard pages.
8. Build Data Encoder Dashboard pages.
9. Add new authentication mechanisms.
10. Invent customer accounts, real orders, payment confirmations, or tracking events.
11. Store sensitive information in localStorage.
12. Install new dependencies without explaining why they are necessary and requesting approval.
13. Break existing public shopping functionality.

This milestone is strictly for completing the frontend Customer Account Dashboard.

---

# Final Checkpoint Report

After implementation, provide the following report.

## 1. Customer Dashboard

| Feature | Status | Notes |
|---|---|---|
| Dashboard Overview | | |
| Summary Statistics | | |
| Recent Orders | | |
| Customer Navigation | | |

## 2. Profile Management

| Feature | Status | Notes |
|---|---|---|
| Profile Display | | |
| Profile Editing | | |
| Form Validation | | |
| Save and Cancel | | |

## 3. Address Management

| Feature | Status | Notes |
|---|---|---|
| Address Listing | | |
| Add Address | | |
| Edit Address | | |
| Delete Address | | |
| Default Address | | |

## 4. Order Management

| Feature | Status | Notes |
|---|---|---|
| Order History | | |
| Order Search | | |
| Order Filtering | | |
| Order Details | | |
| Order Summary | | |

## 5. Order Tracking

| Feature | Status | Notes |
|---|---|---|
| Tracking Page | | |
| Tracking Timeline | | |
| Shipment Details | | |
| Missing Tracking State | | |

## 6. Route and Authentication Status

List all customer routes and explain:

- Which routes are protected.
- How authentication is currently checked.
- Whether customer role validation is implemented.
- What remains necessary for backend authentication integration.

## 7. Files Changed

List all created and modified files with their purpose.

## 8. Testing Results

Report:

- Build result.
- Dashboard tests.
- Profile tests.
- Address tests.
- Order tests.
- Tracking tests.
- Responsive tests.
- Regression tests.
- Console errors.
- Remaining issues.

## 9. Backend Integration Readiness

Explain which customer dashboard features are frontend-only and identify the backend endpoints or integration work still required.

## 10. Final Status

Choose one:

- Completed
- Partially Completed
- Blocked

**Stop after Phase 5 Step 5. Do not start Checkout, Payment, or Admin Dashboard development until this checkpoint report has been reviewed and approval is given.**