# IBTU – Phase 6, Step 3: Shopping Cart API Integration and Guest Cart Merge

## Objective

Connect the existing IBTU shopping cart experience to the real Node.js, Express, and MariaDB backend.

This step must replace the mock cart data with real backend cart operations and support both guest customers and authenticated customers.

The following frontend experiences must share one consistent cart state:

- Navbar cart count.
- Cart Drawer.
- Full Cart page.
- Product Details add-to-cart interaction.
- Product card add-to-cart interaction.
- Cart subtotal and item quantities.

**Important:** Preserve the existing design, product catalog integration, authentication system, and product variant selection implemented in previous steps.

Do not integrate Wishlist, Checkout, Payments, or Orders in this milestone.

---

## 1. Inspect the Existing Implementation

Before writing code, inspect the actual frontend and backend.

### Frontend inspection

Inspect:

- Existing CartContext or cart state management.
- Cart Drawer.
- Full Cart page.
- Navbar cart count.
- ProductCard add-to-cart actions.
- Product Details add-to-cart action.
- Product variant selection.
- AuthContext login and registration flow.
- API client and error handling.
- Existing mock cart data.
- Existing localStorage cart-related keys.

Identify every component that reads or modifies cart data.

### Backend inspection

Inspect:

- Cart routes.
- Cart controllers.
- Cart services.
- Cart validation.
- Cart ownership middleware.
- Guest cart identification.
- Cart merge implementation.
- Cart item database relationships.
- Product variant stock validation.
- Cart expiration and activity behavior.
- Existing automated cart tests.

The previously planned endpoint family includes:

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
POST   /api/cart/merge
```

These are reference paths only. Verify the actual route definitions, HTTP methods, request bodies, response envelopes, and authentication requirements before integration.

Do not invent missing endpoints.

---

## 2. Create the Cart API Service

Extend the centralized API service architecture.

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
```

Implement functions matching the verified backend contract:

- getCart()
- addCartItem()
- updateCartItem()
- removeCartItem()
- clearCart()
- mergeGuestCart()

Only implement operations supported by the actual backend.

Requirements:

- Reuse the existing Axios instance.
- Reuse centralized error handling.
- Do not create another Axios instance.
- Do not duplicate the API base URL.
- Do not hardcode backend URLs in components.
- Normalize cart responses only where necessary.
- Keep backend response handling consistent.

Document the exact request and response structures discovered during inspection.

---

## 3. Guest Cart Management

Guests must be able to add products to their cart without registering first.

Inspect the backend's guest-cart mechanism.

The database design previously established:

- Guest carts use a guest token.
- Only the hash of the guest token is stored in the database.
- A cart must belong to either a registered user or a guest token, never both.
- Guest tokens must be generated securely by the backend.

### Frontend responsibilities

- Obtain the guest cart token according to the actual backend contract.
- Preserve the guest token across page reloads.
- Include it in the required cart requests.
- Do not generate a predictable guest token.
- Do not send a token in a different format from what the backend expects.
- Handle expired or invalid guest carts gracefully.

Treat the guest token as a sensitive capability: avoid displaying it, logging it, or exposing it in URLs.

If the backend uses a cookie-based guest identity, follow that mechanism rather than introducing a separate localStorage token.

If the backend requires a browser-stored token, document the security trade-off and use the existing backend-compatible mechanism.

Do not change the backend guest-cart architecture in this step.

---

## 4. Integrate CartContext

Connect the existing CartContext to the real cart API.

Avoid creating a second cart context if one already exists.

The cart state should support:

- Cart items.
- Item count.
- Subtotal.
- Loading state.
- Error state.
- Cart initialization.
- Adding items.
- Updating quantities.
- Removing items.
- Clearing the cart.
- Refreshing cart data.

### Initial cart loading

On application startup:

1. Determine whether the customer has an authenticated session.
2. If authenticated, load the customer's backend cart.
3. Otherwise, initialize or retrieve the guest cart according to the backend contract.
4. Load the cart from the backend.
5. Populate the shared CartContext.
6. Keep the loading state active until initialization finishes.
7. Handle empty and expired carts.

Avoid making duplicate cart requests during React component mounting or development Strict Mode.

### Shared state

Ensure the following components read from the same cart state:

- Navbar.
- Cart Drawer.
- Cart page.
- Product Details.
- Product cards.

Do not maintain separate mock cart arrays in individual components.

---

## 5. Add Products to the Cart

Connect the existing Add to Cart actions to the backend.

The selected product variant is essential.

When adding a product:

1. Require a valid selected variant.
2. Send the correct backend variant ID.
3. Send the quantity according to the verified API contract.
4. Wait for the backend response.
5. Refresh or update shared cart state using the authoritative response.
6. Display a success message only after the backend confirms the operation.

### Validation

Handle:

- Missing variant selection.
- Invalid variant ID.
- Inactive product.
- Inactive variant.
- Insufficient stock.
- Quantity below the minimum.
- Invalid quantity.
- Network failure.

Do not assume that the stock displayed on the product page is still available when the customer adds the item.

The backend must remain responsible for final stock validation.

### Duplicate cart items

The database design supports one cart item per combination of cart and variant.

When a customer adds an existing variant again, follow the backend's actual quantity update behavior.

Do not create duplicate UI rows for the same cart item.

---

## 6. Update Cart Quantities

Connect the Cart Drawer and Cart page quantity controls to the backend.

Requirements:

- Increase quantity.
- Decrease quantity.
- Prevent zero or negative quantities.
- Respect the backend's available stock validation.
- Display loading feedback during updates.
- Update subtotal and item count after successful responses.
- Handle insufficient-stock responses.
- Prevent rapid duplicate submissions where necessary.

Do not allow the frontend to override backend stock restrictions.

If the backend rejects an update, restore the last confirmed cart state and display a clear error message.

---

## 7. Remove Items and Clear Cart

Connect:

- Remove item action.
- Clear cart action.
- Remove-all confirmation dialog, if one already exists.

Requirements:

- Call the verified backend endpoint.
- Update shared state after success.
- Display empty-cart UI when no items remain.
- Handle items that have already been removed.
- Handle unauthorized and network errors.

Do not silently remove an item from the interface when the backend operation fails.

---

## 8. Guest Cart Merge After Login or Registration

This is a critical requirement.

When a guest customer logs in or registers, the guest cart should be merged into the authenticated customer's cart using the backend-supported merge operation.

Inspect the actual implementation of:

```text
POST /api/cart/merge
```

Do not assume its request body or merge rules.

### Expected integration behavior

After successful login:

1. Detect whether a guest cart exists.
2. Preserve its guest token until the merge operation completes.
3. Call the backend merge endpoint using the actual contract.
4. Allow the backend to resolve duplicate variants and stock conflicts.
5. Load the authenticated customer's resulting cart.
6. Update CartContext.
7. Clear guest-cart identity only after successful merge or confirmed backend consumption.
8. Prevent duplicate merges during repeated authentication events.

Apply the same process after successful registration if the backend supports the same flow.

### Important edge cases

Test:

- Guest cart has one item; customer cart is empty.
- Both carts contain different variants.
- Both carts contain the same variant.
- Guest cart contains an unavailable variant.
- Guest cart is empty.
- Merge request fails.
- Customer refreshes immediately after login.
- Customer logs out and starts a new guest session.

Do not discard guest cart contents simply because authentication succeeded.

Do not implement merge rules independently in the frontend. The backend owns merge behavior and final stock validation.

---

## 9. Cart Drawer and Full Cart Page

Connect the existing UI to the shared backend cart state.

### Cart Drawer

Preserve the existing appearance.

Display:

- Product image.
- Product name.
- Selected size and color.
- Variant information where available.
- Unit price.
- Quantity.
- Item total.
- Remove action.
- Cart subtotal.
- View Cart link.
- Continue Shopping action.

### Full Cart Page

Display:

- Cart items.
- Product images.
- Variant details.
- Unit prices.
- Quantity controls.
- Item totals.
- Remove actions.
- Subtotal.
- Continue Shopping.
- Proceed to Checkout.

The Proceed to Checkout action must retain the existing navigation behavior.

Do not integrate checkout or create an order in this step.

### Product information

Use the actual cart response and product data.

If the backend returns product snapshots, use them where appropriate.

If a product or variant is no longer available, display a clear unavailable-item message instead of inventing a price or stock value.

---

## 10. Price and Stock Calculations

Follow the backend's actual cart response structure.

Important business rules:

- Cart item quantity must be positive.
- Cart prices must come from trusted backend product/variant data.
- Frontend totals are display calculations only.
- Backend calculations remain authoritative.
- Currency is ETB.
- Do not reserve inventory when a customer adds items to the cart.
- Do not reduce physical stock during cart operations.
- Stock must be checked again during checkout.

The existing inventory model distinguishes:

```text
Physical Stock = stock_quantity

Reserved Stock = reserved_quantity

Available Stock = stock_quantity - reserved_quantity
```

Do not confuse physical stock with available stock.

Do not introduce inventory reservations in this milestone.

---

## 11. Replace Mock Cart Data Carefully

Identify all mock cart data used by:

- CartContext.
- Cart Drawer.
- Cart page.
- Navbar.
- Product Details.
- Product cards.

Replace the active cart workflow with backend data.

Requirements:

- Stop writing new mock cart items.
- Stop calculating the active cart from old mock arrays.
- Preserve unrelated mock Wishlist data.
- Preserve mock Checkout and Order data until their integration milestones.
- Do not delete unrelated localStorage keys.
- Do not break product information needed by existing Wishlist items.
- Do not allow stale mock cart data to override the backend cart.

If old cart storage needs cleanup, do it safely and only after the backend cart has been initialized successfully.

---

## 12. Error Handling and User Experience

Provide consistent user-facing behavior.

| Situation | Expected behavior |
|---|---|
| Cart loading | Show loading UI |
| Empty cart | Show empty-cart state |
| Add item successful | Show confirmation |
| Variant unavailable | Display clear validation message |
| Insufficient stock | Display backend stock error |
| Quantity update successful | Update shared cart |
| Remove item successful | Update shared cart |
| Guest merge successful | Display merged cart |
| Network unavailable | Show retry option |
| Session expired | Follow existing AuthContext handling |

Never display fake success messages.

Do not expose SQL errors, internal backend messages, or sensitive guest tokens.

---

## 13. Testing Requirements

### Guest cart tests

- Open the shop without logging in.
- Add a product with a selected variant.
- Reload the page.
- Confirm cart persistence.
- Open the Cart Drawer.
- Open the full Cart page.
- Update quantity.
- Remove an item.
- Clear the cart.

### Authenticated cart tests

- Log in.
- Load an existing customer cart.
- Add a product.
- Update quantity.
- Remove an item.
- Reload and confirm persistence.

### Guest merge tests

- Add items as a guest.
- Log in.
- Verify the guest cart merges.
- Verify duplicate variants follow backend rules.
- Verify the final cart is displayed consistently.
- Repeat the test with registration.
- Test merge failure and recovery.

### Stock tests

- Add an available variant.
- Attempt to add an unavailable variant.
- Attempt to exceed available stock.
- Test a variant that becomes unavailable after being added.
- Confirm no physical stock is changed by cart operations.

### Regression tests

Confirm that these still work:

- Authentication.
- Product catalog.
- Product details.
- Category navigation.
- Admin product management.
- Admin category management.
- Protected routes.

### Build and backend tests

Run:

```bash
npm run build
```

Run available frontend lint and test commands.

Run the relevant backend cart and authentication test suites.

Report actual test results, including failures. Do not report unexecuted tests as passing.

---

## 14. Strict Scope Restrictions

This milestone covers ONLY:

- Cart API service.
- Guest cart initialization.
- Authenticated cart initialization.
- CartContext integration.
- Add-to-cart.
- Quantity updates.
- Item removal.
- Clear cart.
- Guest cart merge.
- Navbar cart count.
- Cart Drawer.
- Full Cart page.

Do NOT integrate:

- Wishlist API.
- Customer address API.
- Checkout API.
- Payment API.
- Order API.
- Shipment API.
- Coupon API.

Do NOT:

- Change the MariaDB schema.
- Add database tables.
- Invent endpoints.
- Implement inventory reservation.
- Deduct physical stock.
- Create real orders.
- Change authentication architecture.
- Redesign existing pages.
- Remove unrelated mock data.
- Add unnecessary dependencies.

If the actual backend does not support a required cart operation, document the missing capability and request approval before making backend changes.

---

## 15. Final Checkpoint Report

Provide a detailed report containing:

1. Frontend and backend files inspected.
2. Verified cart API endpoints.
3. Request and response contracts.
4. Guest cart implementation.
5. Authenticated cart implementation.
6. CartContext changes.
7. Guest cart merge behavior.
8. Cart Drawer integration.
9. Full Cart page integration.
10. Navbar count integration.
11. Stock and quantity validation results.
12. Mock cart data replaced or retained.
13. Build, lint, and backend test results.
14. Remaining issues and limitations.
15. Confirmation that no database schema changes were made.
16. Confirmation that Wishlist, Checkout, Payments, and Orders were not integrated.

**Stop after completing Step 3. Do not automatically start the next milestone.**

The next task will be:

**Phase 6 – Step 4: Wishlist API Integration.**