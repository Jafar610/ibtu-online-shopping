# IBTU E-Commerce Backend – Phase 2, Step 3: Product Variant Management API

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack
- Node.js
- Express.js
- MariaDB
- mysql2/promise
- JWT authentication
- bcryptjs
- Role-Based Access Control (RBAC)
- RESTful API architecture

### Existing Database Tables

- `products`
- `categories`
- `product_variants`
- `product_images`
- `inventory_movements`
- `users`

Database: `ibutu_ecommerce`

Do not recreate existing tables.

## 2. Main Objective

Build a complete Product Variant Management API that allows authorized Admins and Data Encoders to manage product variations.

Each variant represents a purchasable version of a product.

Example:

**Product:** Habesha Kemis

| SKU | Size | Color | Price | Stock |
|---|---|---|---:|---:|
| HK-WH-S | S | White | 3,300 ETB | 10 |
| HK-WH-M | M | White | 3,500 ETB | 8 |
| HK-GR-M | M | Green | 3,800 ETB | 5 |
| HK-GR-L | L | Green | 4,000 ETB | 6 |

The API must support:
- Creating variants.
- Retrieving variants.
- Updating variants.
- Activating and deactivating variants.
- Managing size and color options.
- Managing prices and sale prices.
- Tracking stock information safely.

## 3. Step-by-Step Implementation

### Step 1: Review Existing Database Structure

Inspect:
- `product_variants`
- `products`
- `inventory_movements`
- `product_images`

Verify:
- Column names and data types.
- Primary and foreign keys.
- Unique SKU constraint.
- Price and sale_price definitions.
- Stock quantity.
- Reserved quantity.
- Low stock threshold.
- Active status.
- Existing sample records.

Do not assume the database schema.

Important existing inventory rules:

- `stock_quantity` represents physical stock.
- `reserved_quantity` represents stock reserved for pending orders.
- Available quantity = physical stock − reserved stock.
- Reservation and fulfillment must be handled through inventory-aware transactions.

### Step 2: Understand Product Variants

Explain:
- What a product variant is.
- Why sizes and colors are separate records.
- What SKU means.
- Difference between regular price and sale price.
- Difference between physical stock, reserved stock, and available stock.
- Why variants belong to products.

Use simple IBTU examples.

### Step 3: Create Variant Architecture

Create or update:

```text
src/
├── controllers/
│   └── variant.controller.js
├── services/
│   └── variant.service.js
├── routes/
│   └── variant.routes.js
├── validators/
│   └── variant.validator.js
└── utils/
```

Explain each file's responsibility.

### Step 4: Implement Variant Validation

Validate:

- product_id
- SKU
- size
- color
- price
- sale_price
- low_stock_threshold
- is_active

Requirements:

- Product must exist.
- SKU must be unique.
- Price must be greater than zero.
- Sale price must be valid and lower than regular price when provided.
- Stock and reserved quantities must not be negative.
- Reserved stock must not exceed physical stock.
- Only valid fields should be accepted.
- Never trust frontend stock values without proper authorization.

### Step 5: Implement Variant Service

Create reusable functions:

- `getVariantsByProductId(productId)`
- `getVariantById(id)`
- `createVariant(data)`
- `updateVariant(id, data)`
- `activateVariant(id)`
- `deactivateVariant(id)`

Requirements:

- Use parameterized SQL queries.
- Use the existing database pool.
- Validate product ownership and relationships.
- Use transactions for related database operations.
- Prevent duplicate SKUs.
- Preserve inventory history.
- Do not allow ordinary variant updates to silently change stock quantities.

### Step 6: Implement Initial Stock Handling

Initial stock must be handled carefully.

If a new variant is created with opening stock:

1. Validate the initial quantity.
2. Insert the variant.
3. Record the opening stock movement in `inventory_movements`.
4. Use the movement type `opening_stock`.
5. Record the authenticated user.
6. Complete all operations in one transaction.

Do not create duplicate opening stock movements.

For existing variants, stock adjustments must be handled by a dedicated inventory service rather than a normal product update.

### Step 7: Implement Variant Controller

Create controller functions for:
- Listing variants.
- Retrieving a variant.
- Creating a variant.
- Updating variant details.
- Activating a variant.
- Deactivating a variant.

Keep SQL queries in the service layer.

Use the existing API response utility and error middleware.

### Step 8: Implement Variant Routes

Create:

`src/routes/variant.routes.js`

Endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products/:productId/variants` | List product variants |
| GET | `/api/variants/:id` | Get variant details |
| POST | `/api/products/:productId/variants` | Create variant |
| PUT | `/api/variants/:id` | Update variant details |
| PATCH | `/api/variants/:id/activate` | Activate variant |
| PATCH | `/api/variants/:id/deactivate` | Deactivate variant |

Authorization:

- Public users can view active variants of active products.
- Creating variants requires appropriate product creation permission.
- Updating variants requires `products.update`.
- Activating and deactivating variants requires `products.update`.

Use existing JWT and RBAC middleware.

### Step 9: Product Variant Response

Return useful information:

- Product ID and name.
- Variant ID.
- SKU.
- Size.
- Color.
- Regular price.
- Sale price.
- Effective display price.
- Available quantity.
- Active status.

Do not expose internal inventory details unnecessarily to public customers.

### Step 10: Test with Postman

Test:

1. List variants for a product.
2. Retrieve one variant.
3. Create a variant.
4. Create a duplicate SKU.
5. Create a variant for a nonexistent product.
6. Submit an invalid price.
7. Submit a sale price higher than regular price.
8. Create a variant with valid opening stock.
9. Verify the opening stock movement.
10. Update size and color.
11. Update pricing.
12. Attempt an unauthorized stock update.
13. Deactivate a variant.
14. Verify inactive variants are not purchasable.
15. Test activation.

## 4. Security and Business Rules

- Use parameterized SQL queries.
- Use database transactions.
- Preserve inventory movement history.
- Do not modify stock directly through ordinary product update endpoints.
- Do not allow negative quantities.
- Do not allow reserved quantity to exceed physical stock.
- Validate all product-variant relationships.
- Never trust frontend prices or stock availability.
- Do not delete variants with historical references.
- Use the existing RBAC middleware.
- Preserve existing database records.

## 5. Development Rules

1. Work one step at a time.
2. Explain important code line by line.
3. Provide complete working code.
4. Inspect the actual database structure before coding.
5. Do not recreate existing tables.
6. Do not modify the frontend.
7. Do not skip checkpoints.
8. Troubleshoot errors before continuing.
9. Wait for my confirmation before moving to the next step.

## 6. Final Checkpoint

Ask me to confirm:

- [ ] Variant table reviewed.
- [ ] Variant validation completed.
- [ ] Variant service created.
- [ ] Variant controller created.
- [ ] Variant routes created.
- [ ] Variant CRUD working.
- [ ] Opening stock movement recorded correctly.
- [ ] Inventory protection working.
- [ ] RBAC protection working.
- [ ] Postman tests passed.

**Start with Step 1: Inspect the existing product_variants, products, and inventory_movements tables. Do not write implementation code until the actual schema is verified.**