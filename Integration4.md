# IBTU – Phase 6, Step 4: Wishlist API Integration

## Objective

Connect the existing IBTU Wishlist functionality to the real Node.js, Express, and MariaDB backend.

Replace the frontend mock Wishlist state with real authenticated customer Wishlist data.

The integration must connect:

- Wishlist page.
- Product cards.
- Product Details page.
- Quick View modal.
- Wishlist buttons and icons.
- Navbar wishlist count, if currently implemented.

**Important:** Preserve the existing design, authentication, product catalog, and shopping cart integrations from previous steps.

Do not integrate Checkout, Payments, Orders, or Customer Address APIs in this milestone.

---

## 1. Inspect the Existing Implementation

Before making changes, inspect the actual project.

### Frontend

Inspect:

- Existing WishlistContext or Wishlist state management.
- `useWishlist()` implementation.
- Wishlist page.
- ProductCard wishlist button.
- Product Details wishlist button.
- QuickViewModal wishlist action.
- Navbar wishlist count or indicator.
- AuthContext.
- CartContext.
- Product API services.
- Existing mock Wishlist datasets and localStorage keys.
- Existing ProtectedRoute and route configuration.

Identify every component that reads or modifies Wishlist data.

### Backend

Inspect:

- Wishlist routes.
- Wishlist controller.
- Wishlist service.
- Wishlist validation.
- Wishlist authentication middleware.
- Wishlist database relationships.
- Product availability and status validation.
- Existing Wishlist automated tests.

The previously identified endpoint family includes:

```text
GET    /api/wishlist
POST   /api/wishlist/items
DELETE /api/wishlist/items/:productId
GET    /api/wishlist/check/:productId
DELETE /api/wishlist
```

These are reference paths. Verify the actual route definitions, request bodies, response structures, and authentication requirements before integration.

The backend design specifies one Wishlist per registered user and a unique product entry per Wishlist.

**Wishlist operations are for authenticated customers. Do not invent guest Wishlist backend functionality.**

---

## 2. Create Wishlist API Service

Extend the existing centralized API service architecture.

Suggested structure:

```text
src/
  services/
    api/
      apiClient.js
      authApi.js
      productApi.js
      categoryApi.js
      cartApi.js
      wishlistApi.js
```

Implement functions matching the verified backend contract:

- getWishlist()
- addWishlistItem(productId)
- removeWishlistItem(productId)
- checkWishlistItem(productId)
- clearWishlist()

Only implement operations supported by the actual backend.

Requirements:

- Reuse the existing Axios instance.
- Reuse centralized error handling.
- Use the existing authentication mechanism.
- Do not create another Axios instance.
- Do not duplicate API configuration.
- Normalize returned product data only where necessary.
- Do not hardcode backend URLs in components.

Document the exact request and response structures discovered during inspection.

---

## 3. Integrate Wishlist State Management

Connect the existing WishlistContext or `useWishlist()` implementation to the real backend.

Do not create a second Wishlist state system if one already exists.

The shared Wishlist state should support:

- Wishlist items.
- Wishlist product IDs.
- Wishlist item count.
- Loading state.
- Mutation state.
- Error state.
- Initialization state.
- Adding products.
- Removing products.
- Checking whether a product is saved.
- Clearing the Wishlist.
- Refreshing Wishlist data.

### Initialization behavior

When the application starts:

1. Wait for authentication initialization from AuthContext.
2. If the user is an authenticated customer, load the backend Wishlist.
3. If the user is not authenticated, do not request protected Wishlist endpoints.
4. Keep the Wishlist empty for unauthenticated users.
5. Avoid displaying stale data from a previously authenticated account.
6. Handle loading and errors properly.

Do not request the Wishlist repeatedly because multiple components mount.

Avoid duplicate requests caused by React Strict Mode where practical.

---

## 4. Connect Product Wishlist Actions

Connect existing Wishlist buttons in:

- ProductCard.
- Product Details.
- QuickViewModal.
- Other components discovered during inspection.

### Add to Wishlist

When an authenticated customer clicks the Wishlist button:

1. Identify the actual product ID.
2. Call the verified backend add operation.
3. Wait for the backend response.
4. Update the shared Wishlist state.
5. Update every matching Wishlist button.
6. Show success feedback only after the backend confirms the operation.

### Remove from Wishlist

When the customer removes a product:

1. Identify its product ID.
2. Call the backend remove operation.
3. Update shared state after success.
4. Update the Wishlist count.
5. Update the corresponding product buttons.

### Duplicate products

The database design enforces one entry per product in a customer's Wishlist.

Handle duplicate add attempts gracefully.

Do not create duplicate UI entries.

### Unauthenticated users

Because the backend Wishlist requires authentication:

- Do not send unauthenticated Wishlist mutation requests.
- Redirect unauthenticated users to `/login` or display the existing login prompt.
- Preserve the intended destination where appropriate.
- Do not claim that a product was saved if it was not saved by the backend.

Do not introduce guest Wishlist storage or guest Wishlist merging in this step.

---

## 5. Integrate the Full Wishlist Page

Connect the existing Wishlist page to real backend data.

Preserve the existing page design and responsive layout.

Display:

- Product image.
- Product name.
- Product category, if available.
- Price.
- Sale price, if available.
- Availability status.
- Remove from Wishlist action.
- View Product action.
- Add to Cart action where supported.

### Add to Cart from Wishlist

Reuse the existing CartContext from Step 3.

Requirements:

- Use the existing product and variant information.
- Require a valid variant selection if the product has multiple variants.
- Use the existing cart API integration.
- Respect current backend stock validation.
- Do not duplicate cart API calls in Wishlist components.
- Do not implement a separate cart mechanism.

If the product is unavailable, clearly communicate this and disable the purchase action where appropriate.

### Empty Wishlist

Provide an appropriate empty state with a link to `/shop`.

### Error and loading states

Implement:

- Initial loading state.
- Empty Wishlist state.
- Network error state.
- Retry action.
- Mutation feedback.

Do not display mock Wishlist products when the backend request fails.

---

## 6. Navbar Wishlist Count

If the existing Navbar contains a Wishlist indicator or count:

- Connect it to shared Wishlist state.
- Display the actual authenticated customer's Wishlist count.
- Update it immediately after successful add/remove operations.
- Clear it when the customer logs out.
- Avoid displaying another user's previous Wishlist count.

Preserve the existing Navbar design.

Do not create a new Navbar design or duplicate Wishlist state.

---

## 7. Handle Authentication Changes Correctly

Wishlist data belongs to the authenticated customer.

### Login

After successful login:

1. Wait until AuthContext confirms the authenticated user.
2. Load that customer's Wishlist.
3. Update shared Wishlist state.
4. Display saved products in the Wishlist page.
5. Update Wishlist buttons across the application.

### Registration

After successful customer registration:

1. Use the authenticated customer identity returned or established by the backend.
2. Load the newly created customer's Wishlist.
3. Initialize shared Wishlist state.

### Logout

When the customer logs out:

1. Clear the current user's Wishlist state.
2. Clear the displayed Wishlist count.
3. Do not retain the previous customer's products in the UI.
4. Do not delete the customer's saved Wishlist from the backend.

### Account switching

Test logging out from one customer and logging in as another.

Ensure the second customer never sees the first customer's Wishlist.

---

## 8. Replace Mock Wishlist State Carefully

Identify all existing mock Wishlist state and storage.

Requirements:

- Stop using mock Wishlist arrays for the active authenticated customer flow.
- Stop writing new mock Wishlist data to localStorage.
- Use the backend as the source of truth.
- Preserve unrelated mock data.
- Do not remove mock Checkout, Order, or other unrelated data.
- Do not delete customer data from MariaDB.
- Do not invent a guest Wishlist migration.

If an old `localStorage` Wishlist key exists, handle it carefully.

Do not silently import old mock products into a customer's real Wishlist.

Do not delete old data until the new authenticated Wishlist initialization is successful and the cleanup behavior is safe.

---

## 9. Permissions and Security

Use the authentication architecture implemented in Step 1.

Requirements:

- Only authenticated customers can access Wishlist operations.
- The backend must enforce customer ownership.
- Never trust a product ID or user ID supplied by the browser without backend validation.
- Do not expose another customer's Wishlist.
- Do not rely only on frontend route protection.
- Handle HTTP 401 and 403 using the centralized API error handling.
- Do not expose internal SQL errors.

Do not modify the database schema or add permissions in this step.

---

## 10. Testing Requirements

### Wishlist API tests

Run the existing backend Wishlist tests.

Verify:

- Retrieve authenticated customer's Wishlist.
- Add a product.
- Add the same product again.
- Remove a product.
- Check whether a product exists.
- Clear Wishlist.
- Reject unauthenticated requests.
- Prevent cross-customer access.
- Handle unavailable or invalid products according to backend rules.

### Frontend tests

Verify:

- Login loads the correct Wishlist.
- Registration initializes an empty Wishlist.
- ProductCard add/remove actions work.
- Product Details add/remove actions work.
- Quick View add/remove actions work.
- Wishlist page displays backend data.
- Navbar count updates correctly.
- Removing an item updates all matching components.
- Add to Cart uses the existing CartContext.
- Logging out clears the displayed Wishlist.
- Switching accounts does not leak Wishlist data.
- Network errors display correctly.
- Empty Wishlist state works.

### Regression tests

Verify that the following remain functional:

- Authentication.
- Session restoration.
- Protected routes.
- Product catalog.
- Product details.
- Admin product management.
- Admin category management.
- Guest cart.
- Authenticated cart.
- Guest cart merge.
- Cart Drawer.
- Full Cart page.

### Build and backend tests

Run:

```bash
npm run build
```

Also run available frontend lint and test commands.

Run the relevant backend Wishlist and authentication test suites.

Report actual results, including any existing failures. Do not report tests as passing unless they were executed.

---

## 11. Strict Scope Restrictions

This step covers ONLY:

- Wishlist API service.
- Wishlist state management.
- Authenticated Wishlist initialization.
- Add to Wishlist.
- Remove from Wishlist.
- Wishlist check.
- Clear Wishlist.
- Wishlist page.
- Product Wishlist buttons.
- Navbar Wishlist count.
- Add to Cart from Wishlist using existing CartContext.

Do NOT integrate:

- Customer Address API.
- Checkout API.
- Payment API.
- Order API.
- Shipment API.
- Coupon API.

Do NOT:

- Change the MariaDB schema.
- Add database tables.
- Invent backend endpoints.
- Implement guest Wishlist functionality.
- Implement guest Wishlist merging.
- Redesign existing frontend pages.
- Change authentication architecture.
- Rewrite CartContext.
- Remove unrelated mock data.
- Add unnecessary dependencies.

If a backend capability is missing, document it and request approval before implementing new backend functionality.

---

## 12. Final Checkpoint Report

Provide a detailed report containing:

1. Frontend and backend files inspected.
2. Verified Wishlist API endpoints.
3. Request and response contracts.
4. Wishlist API service implementation.
5. Shared Wishlist state changes.
6. ProductCard integration.
7. Product Details integration.
8. Quick View integration.
9. Wishlist page integration.
10. Navbar count integration.
11. Login, registration, logout, and account-switching behavior.
12. Add-to-Cart integration results.
13. Mock Wishlist data replaced or retained.
14. Build, lint, and backend test results.
15. Remaining issues and limitations.
16. Confirmation that no database schema changes were made.
17. Confirmation that Checkout, Payments, Orders, and Customer Addresses were not integrated.

**Stop after completing Step 4. Do not automatically start the next milestone.**

The next task will be:

**Phase 6 – Step 5: Customer Address API Integration.**