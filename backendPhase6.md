# IBTU E-Commerce Backend – Phase 2, Step 2: Product Management API Development

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

The following tables already exist:

- `products`
- `categories`
- `product_variants`
- `product_images`
- `users`

Do not recreate these tables.

### Existing Product Categories

- Women
- Men
- Accessories
- Habesha Kemis
- Modern Dresses
- Traditional Shirts

### Product Types

- Habesha Kemis
- Modern Dresses
- Traditional Shirts
- Traditional Clothing
- Accessories

## 2. Main Objective

Build a complete Product Management API that supports:

- Creating products.
- Retrieving products.
- Retrieving individual product details.
- Updating products.
- Deleting or archiving products safely.
- Searching products.
- Filtering products by category and status.
- Sorting and pagination.
- Managing product publication status.

Use the existing authentication and RBAC middleware.

## 3. Step-by-Step Implementation

### Step 1: Review Existing Database Structure

Inspect these tables:

1. `products`
2. `categories`
3. `product_variants`
4. `product_images`

Verify:
- Column names and data types.
- Primary keys.
- Foreign keys.
- Unique constraints.
- Product status ENUM values.
- Category relationships.
- Product slug uniqueness.
- Created-by user relationship.

Do not assume the schema.

Do not modify or recreate existing tables without explaining why and receiving approval.

### Step 2: Understand Product Management

Explain:

- What a product record represents.
- Why products belong to categories.
- What a product slug is.
- Difference between draft, active, and archived products.
- Why product variants are separate records.
- Why product images are separate records.

Use practical IBTU examples.

### Step 3: Create Product Architecture

Create or update:

```text
src/
├── controllers/
│   └── product.controller.js
├── services/
│   └── product.service.js
├── routes/
│   └── product.routes.js
├── validators/
│   └── product.validator.js
└── utils/
    └── slugify.js
```

Explain the responsibility of each file.

### Step 4: Implement Product Validation

Validate:

- Product name.
- Slug.
- Category ID.
- Short description.
- Full description.
- Material.
- Care instructions.
- Product status.
- Featured status.

Requirements:

- Product name is required.
- Category must exist.
- Slug must be unique.
- Slugs should be generated safely.
- Only valid status values should be accepted.
- Validate all user-provided fields.
- Prevent unexpected fields from being inserted or updated.

### Step 5: Implement Product Service

Create reusable service functions:

- `getAllProducts()`
- `getProductById(id)`
- `createProduct(data, userId)`
- `updateProduct(id, data)`
- `archiveProduct(id)`
- `deleteProduct(id)` where deletion is safe.

Requirements:

- Use parameterized SQL queries.
- Use the existing MariaDB connection pool.
- Use transactions when multiple database operations must succeed together.
- Automatically record the authenticated user as `created_by`.
- Avoid hardcoded user IDs.
- Generate unique slugs.
- Protect products that have dependent orders or inventory history.
- Prefer archiving over permanent deletion for products with historical records.

### Step 6: Implement Product Controller

Create controller functions that:

- Receive requests.
- Validate request data.
- Call product service functions.
- Return consistent API responses.
- Forward errors to centralized error middleware.

Keep SQL queries out of controllers.

### Step 7: Implement Product Routes

Create:

`src/routes/product.routes.js`

Implement these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | List public products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/status` | Change product status |
| DELETE | `/api/products/:id` | Delete when safe |

Authorization:

- Public GET endpoints return only active products.
- POST requires `products.create`.
- PUT requires `products.update`.
- PATCH requires `products.update`.
- DELETE requires `products.delete`.

Use existing authentication and permission middleware.

### Step 8: Implement Product Search and Filtering

Support query parameters:

- `search`
- `category_id`
- `status`
- `is_featured`
- `sort`
- `order`
- `page`
- `limit`

Examples:

```text
/api/products?search=kemis
/api/products?category_id=4
/api/products?is_featured=true
/api/products?sort=created_at&order=DESC
/api/products?page=1&limit=12
```

Requirements:

- Use safe SQL construction.
- Whitelist sortable columns.
- Validate pagination parameters.
- Prevent SQL injection.
- Public requests must not expose draft or archived products.

### Step 9: Implement Product Details

The product details endpoint should return:

- Product information.
- Category information.
- Product images.
- Available variants.
- Size options.
- Color options.
- Price information.
- Stock availability where appropriate.

Do not calculate final checkout prices using frontend data.

### Step 10: Integrate Routes

Register the product routes in:

`src/app.js`

Preserve existing:
- Health endpoints.
- Database health endpoint.
- Authentication routes.
- Category routes.
- Error handling.
- Not-found middleware.

### Step 11: Test with Postman

Test:

1. Retrieve all active products.
2. Retrieve a product by ID.
3. Create a product as an authorized user.
4. Attempt creation without authentication.
5. Attempt creation without permission.
6. Create a product with an invalid category.
7. Attempt duplicate slug creation.
8. Update product information.
9. Change product status.
10. Search products.
11. Filter by category.
12. Sort products.
13. Test pagination.
14. Confirm public users cannot retrieve draft or archived products.
15. Attempt to delete a product with dependent records.

## 4. Important Business and Security Rules

- Product information belongs in `products`.
- Size, color, SKU, price, and stock belong in `product_variants`.
- Images belong in `product_images`.
- Use database transactions when necessary.
- Never trust frontend pricing or stock quantities.
- Validate category relationships.
- Preserve historical order and inventory records.
- Use existing RBAC permissions.
- Do not expose internal database errors.
- Use parameterized SQL queries.

**Important:** This step covers product information and product CRUD only. Do not implement variant management or image uploading yet. Those will be separate steps.

## 5. Development Rules

1. Work one step at a time.
2. Explain important code line by line.
3. Provide complete working code.
4. Inspect the existing database before implementation.
5. Preserve existing database tables and records.
6. Do not modify the frontend.
7. Do not skip checkpoints.
8. Fix errors before continuing.
9. Wait for my confirmation before moving to the next step.

## 6. Final Checkpoint

Ask me to confirm:

- [ ] Product database structure reviewed.
- [ ] Product validation completed.
- [ ] Product service created.
- [ ] Product controller created.
- [ ] Product routes created.
- [ ] Product CRUD working.
- [ ] Product search working.
- [ ] Category filtering working.
- [ ] Sorting and pagination working.
- [ ] Public product restrictions working.
- [ ] Postman tests passed.

**Start with Step 1: Inspect the existing products, categories, product_variants, and product_images tables. Do not start coding until the actual database structure is verified.**