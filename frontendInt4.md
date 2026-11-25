# Phase 5 – Step 4: Cart and Wishlist Pages Completion

## Project: IBTU (ሀበሻን ጥበብ) E-Commerce Platform

### Objective

Build complete, responsive Cart and Wishlist pages for the IBTU e-commerce frontend.

The existing project already has product cards, product details, a Cart Drawer, and some shopping interactions. This milestone should extend those existing features rather than create separate or conflicting shopping systems.

By the end of this step, customers should be able to:

- View all items in their shopping cart.
- Update product quantities.
- Remove items from their cart.
- Move cart items to their wishlist, where appropriate.
- View their saved wishlist products.
- Remove products from their wishlist.
- Add wishlist products to their cart.
- Navigate easily between Shop, Cart, and Wishlist.

This is a frontend-only implementation. Do not connect to backend APIs or modify the database.

---

## Step 1: Inspect the Existing Project

Before making any changes, inspect:

1. Complete frontend folder structure.
2. Existing Cart Context or cart state management.
3. Existing Wishlist Context or wishlist state management.
4. Cart Drawer component.
5. ProductCard component.
6. Product Details page.
7. Existing mock product data.
8. Navbar cart and wishlist icons.
9. React Router configuration.
10. Existing shared UI components and styling.

Also verify the completion status of Phase 5 Steps 2 and 3.

### Important rules

- Reuse existing Cart and Wishlist state wherever possible.
- Do not create duplicate contexts or state systems.
- Preserve existing product identifiers and product variant structures.
- Follow the existing React, Tailwind CSS, and project architecture.
- Do not redesign unrelated pages.
- Do not assume a feature is complete without inspecting and testing it.

If a required feature is already implemented correctly, preserve it.

---

## Step 2: Create the Cart Page

Create a dedicated Cart page using the existing design system.

Suggested route:

`/cart`

Suggested file location:

Use the existing pages folder structure. A possible location is:

`src/pages/cart/CartPage.jsx`

Adjust this path if the project follows a different established structure.

### Cart Page Layout

The page should include:

**A. Page Header**
- Title: Shopping Cart
- Short description.
- Breadcrumb navigation: Home / Cart.

**B. Cart Items Section**

Display each cart item with:

- Product image.
- Product name.
- Selected size, if applicable.
- Selected color, if applicable.
- SKU, if available.
- Unit price in ETB.
- Quantity controls.
- Item subtotal.
- Remove button.
- Move to Wishlist action, if supported.

**C. Order Summary**

Display:

- Subtotal.
- Discount, only when an actual applicable discount exists in the current frontend data.
- Total.

Do not invent shipping fees, taxes, or discounts.

Clearly explain that shipping and final payment details will be calculated during checkout.

Include a prominent Continue to Checkout button.

For this milestone, the button should not pretend to process an order. It may navigate to a clearly identified checkout placeholder only if that route already exists; otherwise, show a clear message that checkout will be available in a later development step.

**D. Continue Shopping**

Provide a button linking back to `/shop`.

---

## Step 3: Cart Functionality

Implement and test the following interactions.

### 3.1 Quantity Management

- Increase item quantity.
- Decrease item quantity.
- Prevent quantity from going below 1.
- Update the item subtotal immediately.
- Update the cart subtotal immediately.
- Respect available stock information when it exists in the product data.
- Prevent customers from increasing quantity beyond available stock.
- Display a clear message when the requested quantity exceeds stock.

### 3.2 Remove Cart Items

- Allow customers to remove individual products.
- Update cart count immediately.
- Update subtotal immediately.
- Display a confirmation only if consistent with the existing UX.
- Provide a useful empty-cart state when all products are removed.

### 3.3 Move to Wishlist

If the existing wishlist functionality supports it:

- Allow customers to move a cart product to their wishlist.
- Remove the item from the cart after it is successfully added to the wishlist.
- Preserve the correct product and variant information where applicable.
- Avoid duplicate wishlist entries.

Do not silently remove a cart item if adding it to the wishlist fails.

### 3.4 Cart Drawer Synchronization

The dedicated Cart page and existing Cart Drawer must use the same cart state.

When a customer:

- Adds a product from Shop, the Cart page must update.
- Adds a product from Product Details, the Cart Drawer and Cart page must update.
- Changes quantity in the Cart page, the Cart Drawer must reflect the change.
- Removes an item from either location, both must update.
- Removes the final item, both must display the correct empty state.

Do not maintain independent cart data for the Drawer and Cart page.

---

## Step 4: Create the Wishlist Page

Create a dedicated Wishlist page.

Suggested route:

`/wishlist`

Suggested file location:

Use the project's existing pages folder conventions. A possible location is:

`src/pages/wishlist/WishlistPage.jsx`

### Wishlist Page Layout

Include:

**A. Page Header**
- Title: My Wishlist
- Short description.
- Breadcrumb: Home / Wishlist.

**B. Wishlist Product Grid**

Display saved products using the existing ProductCard component or a compatible reusable component.

Each wishlist product should display:

- Product image.
- Product name.
- Current price in ETB.
- Sale price, if available.
- Availability status.
- View Product action.
- Add to Cart button.
- Remove from Wishlist button.

Preserve existing product design and responsive grid behavior.

### Empty Wishlist State

When no products have been saved:

- Display a suitable wishlist icon or illustration.
- Show a message such as "Your wishlist is empty."
- Explain briefly that customers can save products they like.
- Provide a button linking to `/shop`.

Do not display mock wishlist products as if customers had saved them.

---

## Step 5: Wishlist Functionality

Implement the following behavior.

### 5.1 Add to Wishlist

- Customers can save products from Shop.
- Customers can save products from Product Details.
- Customers can add products from existing wishlist controls.
- Update wishlist state immediately.
- Prevent duplicate products.
- Update the Navbar wishlist count, if one is displayed.

### 5.2 Remove from Wishlist

- Allow customers to remove individual products.
- Update the wishlist count immediately.
- Update the page immediately.
- Display the empty state when the last product is removed.

### 5.3 Add Wishlist Product to Cart

- Allow customers to add wishlist products to the cart.
- Reuse the existing cart state.
- Validate required variants before adding the product.
- If a product requires a size or color selection, provide a suitable selection interaction instead of silently choosing an arbitrary variant.
- Respect product availability and stock.
- Display clear success or error feedback.
- Do not remove the wishlist product automatically unless that behavior is explicitly part of the existing design.

### 5.4 Product Navigation

Clicking a wishlist product should navigate to its correct Product Details page.

Preserve the existing product slug or identifier conventions.

---

## Step 6: Shared State and Frontend Persistence

Inspect the current state management before implementation.

### Cart State

Use the existing Cart Context or state management.

### Wishlist State

Use the existing Wishlist Context or state management.

If either is missing, implement it using the project's established architecture.

### Persistence

If the project already uses localStorage for frontend cart or wishlist persistence, preserve and improve that implementation.

Otherwise, introduce persistence only where appropriate and consistent with the existing architecture.

Requirements:

- Cart data should survive a page refresh.
- Wishlist data should survive a page refresh.
- Validate persisted data before restoring it.
- Handle missing or invalid persisted data safely.
- Avoid storing passwords, tokens, or sensitive personal information.
- Do not claim that local browser data is synchronized across devices.
- Do not treat frontend persistence as permanent server-side storage.

Keep the state structure suitable for future backend integration.

---

## Step 7: Navbar Integration

Review the existing Navbar.

Ensure:

- Cart icon navigates to `/cart` or opens the existing Cart Drawer according to the current design.
- Wishlist icon navigates to `/wishlist`.
- Cart count updates immediately.
- Wishlist count updates immediately, if displayed.
- Navigation works from Home, Shop, Product Details, About, and Contact pages.
- Active navigation states are consistent.
- No broken hash links remain for Cart or Wishlist.

Do not redesign the entire Navbar.

---

## Step 8: Responsive Design and Visual Consistency

Follow the existing IBTU design system.

Brand colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

### Desktop

- Use a clean cart layout with items and order summary.
- Ensure product details are easy to scan.
- Use appropriate spacing and alignment.

### Tablet

- Adapt the cart layout to available width.
- Keep quantity controls and prices readable.

### Mobile

- Use a compact cart item layout.
- Ensure buttons are easy to tap.
- Prevent horizontal overflow.
- Make the order summary readable.
- Ensure wishlist cards fit the mobile screen.

Preserve existing typography, icons, animations, and visual language.

---

## Step 9: Component Reusability

Inspect existing components before creating new ones.

Possible reusable components, only if needed:

- `CartItem`
- `CartSummary`
- `CartEmptyState`
- `WishlistItem`
- `WishlistEmptyState`
- `QuantitySelector`
- `RemoveItemButton`

Use clear component responsibilities.

Avoid putting all cart and wishlist functionality into one oversized component.

Do not create duplicate ProductCard, Cart Context, or Wishlist Context implementations.

---

## Step 10: Testing and Regression Verification

Test all interactions.

### Cart Page

- [ ] `/cart` loads correctly.
- [ ] Cart items display correctly.
- [ ] Product images display correctly.
- [ ] Selected variants display correctly.
- [ ] Quantity increases correctly.
- [ ] Quantity decreases correctly.
- [ ] Quantity cannot go below 1.
- [ ] Stock limits are respected where stock data exists.
- [ ] Item subtotal updates correctly.
- [ ] Cart subtotal updates correctly.
- [ ] Individual item removal works.
- [ ] Empty cart state works.
- [ ] Continue Shopping navigation works.

### Cart Drawer

- [ ] Cart Drawer still opens and closes.
- [ ] Cart Drawer and Cart page share the same state.
- [ ] Cart count updates correctly.
- [ ] Quantity updates remain synchronized.
- [ ] Removing items remains synchronized.

### Wishlist Page

- [ ] `/wishlist` loads correctly.
- [ ] Saved products display correctly.
- [ ] Duplicate products are prevented.
- [ ] Removing products works.
- [ ] Empty wishlist state works.
- [ ] Product navigation works.
- [ ] Add to Cart works.
- [ ] Required variant selection works.
- [ ] Navbar wishlist count updates correctly.

### Persistence

- [ ] Cart survives page refresh.
- [ ] Wishlist survives page refresh.
- [ ] Invalid stored data does not break the application.
- [ ] No sensitive information is stored.

### Regression

- [ ] Home page works.
- [ ] Shop page works.
- [ ] Product Details page works.
- [ ] Login and Registration pages still work.
- [ ] About and Contact pages still work.
- [ ] Navbar navigation still works.
- [ ] Footer navigation still works.
- [ ] Desktop layout works.
- [ ] Tablet layout works.
- [ ] Mobile layout works.
- [ ] No console errors.
- [ ] No broken imports.
- [ ] `npm run build` succeeds.

Fix any issues introduced by this milestone.

---

## Strict Scope Restrictions

Do NOT:

1. Modify backend files.
2. Create or modify database tables.
3. Connect Cart or Wishlist to backend APIs.
4. Implement checkout processing.
5. Implement payment processing.
6. Implement order creation.
7. Build Customer Dashboard pages.
8. Build Admin Dashboard pages.
9. Add coupon validation or payment calculations.
10. Invent shipping fees, tax rates, or discount rules.
11. Remove existing working features.
12. Install new dependencies without explaining the reason and requesting approval.
13. Create duplicate cart or wishlist state systems.

This milestone is strictly for completing the frontend Cart and Wishlist experiences.

---

## Final Checkpoint Report

After implementation, provide the following report.

### 1. Cart Page

| Feature | Status | Notes |
|---|---|---|
| Cart route | | |
| Cart items display | | |
| Quantity management | | |
| Remove item | | |
| Move to Wishlist | | |
| Order summary | | |
| Empty cart state | | |
| Cart Drawer synchronization | | |

### 2. Wishlist Page

| Feature | Status | Notes |
|---|---|---|
| Wishlist route | | |
| Wishlist products display | | |
| Add to Wishlist | | |
| Remove from Wishlist | | |
| Add to Cart | | |
| Variant selection | | |
| Empty wishlist state | | |

### 3. State Management

Explain:

- Which Cart Context or state implementation is used.
- Which Wishlist Context or state implementation is used.
- How persistence works.
- How Cart Drawer and Cart page synchronization works.
- Any limitations that remain.

### 4. Files Changed

List all:

- Created files.
- Modified files.
- Deleted files, if any.

Explain the purpose of each important change.

### 5. Testing Results

Report:

- Build result.
- Cart interaction tests.
- Wishlist interaction tests.
- Persistence tests.
- Responsive tests.
- Regression tests.
- Console errors.
- Remaining issues.

### 6. Backend Integration Readiness

Explain which features are currently frontend-only and what will eventually require backend API integration.

### 7. Final Status

Choose one:

- Completed
- Partially Completed
- Blocked

**Stop after Phase 5 Step 4. Do not start Checkout, Customer Dashboard, or Admin Dashboard development until this checkpoint report has been reviewed and approval is given.**