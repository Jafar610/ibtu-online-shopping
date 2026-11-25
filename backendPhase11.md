# IBTU E-Commerce Platform
## Phase 3 – Step 2: Wishlist API Development

### Objective

Develop a secure Wishlist API using Node.js, Express, and MariaDB.

Customers should be able to:
- View their wishlist.
- Add products to their wishlist.
- Remove products from their wishlist.
- Check whether a product is already in their wishlist.
- Clear their wishlist.
- Move a product from their wishlist to their shopping cart (optional, if the existing Cart API supports it).

**Important:** Wishlist functionality is available only to authenticated registered customers. Do not modify the existing React frontend.

---

### STEP 0: Verify Previous Checkpoint

Before implementation, confirm that Phase 3 – Step 1 (Shopping Cart API Development) has been completed and tested.

If it has not been completed, ask me for its checkpoint.

Do not assume that previous files, endpoints, or middleware exist.

### STEP 1: Inspect Existing Database Tables

Inspect the actual structures and relationships of:

1. `wishlists`
2. `wishlist_items`
3. `users`
4. `products`
5. `product_variants`
6. `product_images`

Expected structure:

**wishlists**
- id
- user_id
- created_at
- updated_at

**wishlist_items**
- id
- wishlist_id
- product_id
- created_at

Important database rules:
- One wishlist per registered customer.
- `wishlists.user_id` must be unique.
- A wishlist item must not duplicate an existing product in the same wishlist.
- `wishlist_items` has a unique constraint on `(wishlist_id, product_id)`.
- Do not recreate or modify existing tables.

Verify the real schema before writing code.

### STEP 2: Design the Wishlist Architecture

Follow the existing backend architecture.

Create these files if they do not already exist:

- `src/validators/wishlist.validator.js`
- `src/services/wishlist.service.js`
- `src/controllers/wishlist.controller.js`
- `src/routes/wishlist.routes.js`

Reuse existing:
- Database connection pool.
- Authentication middleware.
- Error-handling middleware.
- API response utility.
- Validation conventions.

Avoid duplicating existing utilities.

### STEP 3: Implement Wishlist API Endpoints

**1. Get Customer Wishlist**

`GET /api/wishlist`

Return:
- Wishlist ID.
- Wishlist products.
- Product name.
- Product slug.
- Primary image.
- Category.
- Available variant information.
- Regular price.
- Sale price.
- Current price.
- Availability status.
- Date added.

Only return active products.

**2. Add Product to Wishlist**

`POST /api/wishlist/items`

Example request:

```json
{
  "product_id": 1
}
```

Requirements:
- Verify that the product exists.
- Verify that the product is active.
- Get or create the authenticated customer's wishlist.
- Prevent duplicate wishlist items.
- Return a meaningful response if the product is already saved.

**3. Remove Product from Wishlist**

`DELETE /api/wishlist/items/:productId`

Requirements:
- Verify wishlist ownership.
- Remove only the specified product.
- Return a suitable response if the item does not exist.

**4. Check Wishlist Status**

`GET /api/wishlist/check/:productId`

Return whether the specified product is already saved by the authenticated customer.

Example:

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "is_in_wishlist": true
  }
}
```

**5. Clear Wishlist**

`DELETE /api/wishlist`

Remove all items from the authenticated customer's wishlist without deleting the wishlist itself.

**6. Move Wishlist Product to Cart (Optional)**

`POST /api/wishlist/items/:productId/add-to-cart`

Requirements:
- Integrate with the existing Cart Service.
- Require a valid `variant_id` and quantity.
- Validate product and variant availability.
- Do not duplicate cart business logic.
- Remove the product from the wishlist only after successfully adding it to the cart.
- Use a transaction if the operations can be safely performed together.

If the existing cart architecture does not support this safely, defer this endpoint and explain why.

### STEP 4: Authentication and Authorization

All wishlist endpoints must require authentication.

Requirements:
- Use the existing authentication middleware.
- Identify the customer from the verified JWT.
- Never accept `user_id` from the frontend request.
- Customers can access only their own wishlist.
- Admin and Data Encoder accounts must not access customer wishlists as if they were customers.
- Return HTTP 401 for unauthenticated requests.
- Return HTTP 403 when the authenticated account is not authorized.

### STEP 5: Business Logic and Security

Implement these rules:

1. Never trust frontend product information or prices.
2. Retrieve product information from the database.
3. Only active products should be added.
4. Prevent duplicate wishlist products.
5. Use parameterized SQL queries.
6. Handle unique-constraint conflicts gracefully.
7. Use pagination if wishlist results may become large.
8. Avoid N+1 database queries.
9. Do not expose password hashes or sensitive customer information.
10. Preserve the existing database schema.
11. Do not change inventory quantities when adding or removing wishlist products.

### STEP 6: Register Wishlist Routes

Register the wishlist routes in the existing Express application.

Ensure that:
- Existing routes continue working.
- Authentication middleware is correctly applied.
- Route naming follows the existing backend conventions.

### STEP 7: API Testing

Test using Postman or another API testing tool.

Test these scenarios:

1. Access wishlist without authentication.
2. Create a wishlist for a registered customer.
3. Add an active product.
4. Add the same product again.
5. Add an inactive product.
6. Add a nonexistent product.
7. Retrieve wishlist products.
8. Check whether a product is saved.
9. Remove a wishlist product.
10. Remove a nonexistent wishlist product.
11. Clear the wishlist.
12. Attempt to access another customer's wishlist.
13. Verify that wishlist operations do not modify inventory.
14. Verify that Admin and Data Encoder accounts cannot access customer wishlists.

Fix all errors before declaring the step complete.

### STEP 8: Final Checkpoint

Provide the following report:

**IBTU Phase 3 – Step 2 Checkpoint**

- Previous cart checkpoint verified: yes/no
- Database inspection: completed/not completed
- Wishlist creation: completed/not completed
- Add product: completed/not completed
- Duplicate prevention: completed/not completed
- Retrieve wishlist: completed/not completed
- Remove product: completed/not completed
- Wishlist status check: completed/not completed
- Clear wishlist: completed/not completed
- Add to cart integration: completed/deferred/not applicable
- Authentication: completed/not completed
- Ownership security: completed/not completed
- API testing: completed/not completed
- Errors or remaining issues:

Include:
- Files created or modified.
- Implemented API endpoints.
- Postman test results.
- Any configuration changes.

**STOP after this checkpoint. Do not start the next step until I review and confirm the results.**

### Development Instructions

- Work step by step.
- Explain important code in simple English.
- Provide complete code with exact file paths.
- Inspect existing files before modifying them.
- Preserve existing functionality.
- Do not recreate database tables.
- Do not modify the React frontend.
- Do not skip testing.
- Wait for my confirmation before continuing.