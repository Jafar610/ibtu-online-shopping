# IBTU E-Commerce Platform
## Phase 3 – Step 1: Shopping Cart API Development

### Objective

Develop a secure, reliable Shopping Cart API using Node.js, Express, and MariaDB.

The API must support:
- Guest shopping carts (customers without accounts).
- Authenticated customer shopping carts.
- Adding products and variants to the cart.
- Updating item quantities.
- Removing individual items.
- Clearing the cart.
- Calculating cart totals on the backend.
- Merging a guest cart into a customer's cart after login.

**Important:** Do not modify the existing React frontend during this phase.

---

### STEP 0: Verify Previous Development Checkpoint

Before writing code, confirm that Phase 2 – Step 5 (Public Product Catalog API) has been completed and tested.

Ask me to provide its checkpoint if it has not been confirmed.

Do not assume previous API endpoints or files exist. Inspect the actual backend project.

### STEP 1: Inspect Existing Database Tables

Inspect the actual structures and relationships of:

1. `carts`
2. `cart_items`
3. `users`
4. `products`
5. `product_variants`

Do not recreate, modify, or delete existing database tables.

The expected cart structure is:

**carts**
- id
- user_id (nullable)
- guest_token_hash (nullable)
- expires_at
- last_activity_at
- created_at
- updated_at

**cart_items**
- id
- cart_id
- variant_id
- quantity
- created_at
- updated_at

Verify the actual column names and data types before implementation.

Important database rule:

A cart must belong to exactly one owner:
- A registered customer (`user_id`), OR
- A guest customer (`guest_token_hash`).

It must never belong to both or neither.

Enforce this rule in backend logic.

### STEP 2: Design the Cart Architecture

Follow the existing backend architecture and naming conventions.

Create these files if they do not already exist:

- `src/validators/cart.validator.js`
- `src/services/cart.service.js`
- `src/controllers/cart.controller.js`
- `src/routes/cart.routes.js`

Use the existing:
- Database connection pool.
- Authentication middleware.
- Error-handling middleware.
- API response utility.
- Validation conventions.

Do not duplicate existing utilities.

### STEP 3: Implement Guest Cart Management

Allow visitors to add products to a cart without registering.

Requirements:

1. Generate guest tokens using Node.js `crypto`.
2. Store only a secure hash of the guest token in MariaDB.
3. Never expose the stored hash to the client.
4. Never log guest tokens.
5. Prevent guests from accessing another guest's cart.
6. Implement a secure token transport strategy.

Prefer an HTTP-only cookie where the existing frontend and backend deployment configuration support it.

If cookies are used, configure CORS credentials and cookie security settings correctly. Explain any required frontend configuration without changing the frontend.

Do not use predictable guest tokens.

### STEP 4: Implement Cart API Endpoints

Implement the following endpoints:

**1. Get Cart**

`GET /api/cart`

Return:
- Cart ID.
- Cart items.
- Product information.
- Product image.
- Variant SKU.
- Size and color.
- Quantity.
- Current unit price.
- Item subtotal.
- Cart subtotal.
- Total item count.
- Stock availability information.

**2. Add Item**

`POST /api/cart/items`

Example request:

```json
{
  "variant_id": 1,
  "quantity": 2
}
```

Requirements:
- Verify that the product exists.
- Verify that the product is active.
- Verify that the variant exists and is active.
- Check available stock.
- If the variant already exists in the cart, increase its quantity.
- Reject invalid quantities.
- Calculate prices using database values.

**3. Update Item Quantity**

`PATCH /api/cart/items/:itemId`

Example request:

```json
{
  "quantity": 3
}
```

Requirements:
- Verify cart ownership.
- Validate quantity.
- Verify stock availability.
- Update only the specified cart item.

**4. Remove Item**

`DELETE /api/cart/items/:itemId`

Requirements:
- Verify cart ownership.
- Remove only the specified item.

**5. Clear Cart**

`DELETE /api/cart`

Remove all items belonging to the current customer's cart.

**6. Merge Guest Cart**

`POST /api/cart/merge`

When a guest customer logs in:
- Identify the guest cart securely.
- Identify the authenticated customer's cart.
- Merge matching variants by combining quantities.
- Add nonmatching variants.
- Revalidate product and variant availability.
- Handle quantities exceeding available stock safely.
- Use a database transaction.
- Avoid duplicate cart items.
- Delete or invalidate the guest cart after a successful merge.

Do not merge carts belonging to different users.

### STEP 5: Implement Business Logic

Important rules:

1. Never trust product prices sent by the frontend.
2. Calculate prices using `product_variants.price` and `product_variants.sale_price`.
3. Use the sale price when it is valid; otherwise use the regular price.
4. Do not reserve stock when adding items to the cart.
5. A cart is not a stock reservation.
6. Recheck stock during checkout.
7. Available stock is:

`stock_quantity - reserved_quantity`

8. Do not allow quantities greater than available stock.
9. Do not allow inactive products or variants in the cart.
10. Use parameterized SQL queries.
11. Use database transactions when multiple related database changes must succeed together.
12. Do not expose internal database errors or sensitive information.

### STEP 6: Authentication and Authorization

Support two customer types:

**Guest customer**
- Can view their cart.
- Can add items.
- Can update quantities.
- Can remove items.
- Can clear their cart.

**Registered customer**
- Must be authenticated.
- Can access only their own cart.
- Cannot access another customer's cart.

Use the existing authentication middleware.

Do not allow Admin or Data Encoder accounts to access customer carts as if they were their own.

### STEP 7: Register Cart Routes

Register the cart routes in the existing application without disturbing other routes.

Use the appropriate middleware for guest and authenticated requests.

### STEP 8: Testing

Test every endpoint using Postman or another API testing tool.

Test these scenarios:

1. Create a guest cart.
2. Add one product variant.
3. Add the same variant again.
4. Add another variant.
5. Retrieve the cart.
6. Update quantity.
7. Attempt to add an inactive product.
8. Attempt to add an inactive variant.
9. Attempt to exceed available stock.
10. Attempt to update another customer's cart item.
11. Remove an item.
12. Clear the cart.
13. Log in and merge the guest cart.
14. Verify that duplicate variants merge correctly.
15. Verify that cart totals are calculated correctly.
16. Verify that cart operations do not modify inventory quantities.

Fix all errors before declaring the phase complete.

### STEP 9: Final Checkpoint

When implementation and testing are complete, provide:

**IBTU Phase 3 – Step 1 Checkpoint**

- Database inspection: completed / not completed
- Guest cart: completed / not completed
- Customer cart: completed / not completed
- Add item: completed / not completed
- Update quantity: completed / not completed
- Remove item: completed / not completed
- Clear cart: completed / not completed
- Guest cart merge: completed / not completed
- Stock validation: completed / not completed
- Cart ownership security: completed / not completed
- API testing: completed / not completed
- Errors or remaining issues:

Include:
- Files created or modified.
- API endpoints implemented.
- Postman test results.
- Any configuration changes required.

**STOP after this checkpoint. Do not start the next development step until I review and confirm the results.**

### Development Instructions

- Work step by step.
- Explain each important implementation decision in simple English.
- Show complete code with exact file paths.
- Inspect existing code before modifying it.
- Preserve existing functionality.
- Never assume database schemas.
- Do not create unnecessary tables.
- Do not modify the frontend.
- Do not skip testing.
- Wait for my confirmation before moving to the next step.