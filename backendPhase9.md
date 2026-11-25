# IBTU E-Commerce Backend – Phase 2, Step 5: Public Product Catalog API Enhancement

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack

- Node.js
- Express.js
- MariaDB
- mysql2/promise
- JWT authentication
- Role-Based Access Control (RBAC)
- RESTful API architecture

### Existing Database Tables

- `categories`
- `products`
- `product_variants`
- `product_images`
- `product_reviews`

Database name: `ibutu_ecommerce`

Do not recreate existing tables.

## 2. Main Objective

Build a customer-facing Product Catalog API that provides complete product information without requiring customers to log in.

The API should support:

- Product listing.
- Product details.
- Category-based browsing.
- Product search.
- Filtering.
- Sorting.
- Pagination.
- Featured products.
- Product variants.
- Product images.
- Product pricing.
- Stock availability.
- Related products.

The catalog must provide reliable data for the existing React frontend.

## 3. Step-by-Step Implementation

### Step 1: Review Existing Database Structure

Inspect:

- `categories`
- `products`
- `product_variants`
- `product_images`
- `product_reviews`

Verify the actual column names, foreign keys, status fields, image relationships, variant pricing, and stock fields.

Do not assume the schema.

### Step 2: Design the Public Product Response

Create a consistent response structure.

Example:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Elegant Habesha Kemis",
      "slug": "elegant-habesha-kemis",
      "short_description": "Traditional Ethiopian clothing",
      "category": {
        "id": 4,
        "name": "Habesha Kemis",
        "slug": "habesha-kemis"
      },
      "price": {
        "min": 3500,
        "max": 4000,
        "currency": "ETB"
      },
      "primary_image": {
        "image_url": "/uploads/products/example.webp",
        "alt_text": "Elegant white Habesha Kemis"
      },
      "is_featured": true,
      "stock_status": "in_stock"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3
  }
}
```

Adapt the response to actual database fields and image storage configuration.

### Step 3: Implement Product Listing

Endpoint:

`GET /api/catalog/products`

Requirements:
- Return only active products.
- Include category information.
- Include primary product image.
- Include available pricing.
- Include stock availability.
- Support pagination.
- Avoid duplicate products caused by SQL joins.

### Step 4: Implement Product Details

Endpoint:

`GET /api/catalog/products/:slug`

Return:

- Product information.
- Category.
- All product images.
- Available variants.
- Sizes.
- Colors.
- Regular prices.
- Sale prices.
- Available stock status.
- Product review summary where supported.

Do not expose internal administrative fields or sensitive inventory information.

### Step 5: Implement Category Browsing

Endpoints:

`GET /api/catalog/categories`

`GET /api/catalog/categories/:slug/products`

Requirements:
- Return active categories.
- Support parent and child categories.
- Display product counts where appropriate.
- Return only active products.
- Support pagination.

### Step 6: Implement Product Search

Support:

`GET /api/catalog/products?search=kemis`

Search appropriate fields:
- Product name.
- Short description.
- Full description.
- Material.
- Category name.

Use parameterized queries and safe search logic.

### Step 7: Implement Product Filtering

Support:

- `category`
- `min_price`
- `max_price`
- `size`
- `color`
- `featured`
- `in_stock`

Example:

```text
/api/catalog/products?category=habesha-kemis&size=M&color=White
```

```text
/api/catalog/products?min_price=3000&max_price=5000
```

```text
/api/catalog/products?in_stock=true&featured=true
```

Ensure price and availability filters use valid active variants.

### Step 8: Implement Sorting

Support:

- `newest`
- `oldest`
- `price_asc`
- `price_desc`
- `name_asc`
- `name_desc`

Whitelist sorting options. Never insert unvalidated query parameters directly into SQL.

### Step 9: Implement Featured Products

Endpoint:

`GET /api/catalog/products/featured`

Return active products marked as featured.

Support a reasonable limit and consistent response structure.

### Step 10: Implement Related Products

Endpoint:

`GET /api/catalog/products/:id/related`

Recommend products using relevant criteria such as:
- Same category.
- Similar product type.
- Active status.

Exclude the current product.

### Step 11: Implement Catalog Architecture

Create:

```text
src/
├── controllers/
│   └── catalog.controller.js
├── services/
│   └── catalog.service.js
├── routes/
│   └── catalog.routes.js
└── validators/
    └── catalog.validator.js
```

Keep:
- SQL queries in services.
- HTTP handling in controllers.
- Endpoint definitions in routes.
- Query validation in validators.

### Step 12: Integrate Catalog Routes

Register the catalog routes in `src/app.js`.

Preserve all existing:
- Health endpoints.
- Database health endpoint.
- Authentication routes.
- Category routes.
- Product routes.
- Variant routes.
- Image routes.
- Error middleware.

### Step 13: Test with Postman

Test:

1. Retrieve products.
2. Retrieve product details by slug.
3. Browse categories.
4. Browse products by category.
5. Search products.
6. Filter by size.
7. Filter by color.
8. Filter by price.
9. Filter in-stock products.
10. Sort by price.
11. Sort by newest.
12. Retrieve featured products.
13. Retrieve related products.
14. Test pagination.
15. Verify draft and archived products are not publicly accessible.
16. Verify inactive variants are excluded from purchasable options.

## 4. Performance and Security Requirements

- Use parameterized SQL queries.
- Avoid N+1 database queries.
- Use appropriate indexes.
- Avoid duplicate product results.
- Validate all query parameters.
- Whitelist sorting columns and directions.
- Return only public product information.
- Calculate prices from database variant records.
- Never trust frontend pricing or stock values.
- Use consistent API response structures.
- Avoid exposing database errors.

## 5. Development Rules

1. Work one step at a time.
2. Explain important code line by line.
3. Provide complete working code.
4. Inspect the actual database schema before implementation.
5. Preserve existing tables and records.
6. Do not modify the frontend.
7. Do not skip checkpoints.
8. Fix errors before continuing.
9. Wait for my confirmation before moving to the next step.

## 6. Final Checkpoint

Ask me to confirm:

- [ ] Database structure reviewed.
- [ ] Product listing endpoint working.
- [ ] Product details endpoint working.
- [ ] Category browsing working.
- [ ] Product search working.
- [ ] Filtering working.
- [ ] Sorting working.
- [ ] Pagination working.
- [ ] Featured products working.
- [ ] Related products working.
- [ ] Public product restrictions working.
- [ ] Postman tests passed.

**Start with Step 1: Review the existing catalog database structure. Do not start implementation until the actual schema is verified.**