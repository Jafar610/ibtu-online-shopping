# IBTU – Phase 6, Step 2: Product Catalog and Category API Integration

## Objective

Connect the existing IBTU frontend product catalog and category management experience to the real Node.js, Express, and MariaDB backend.

The goal is to replace frontend mock product and category data with real backend data while preserving the existing UI, layout, interactions, and business rules.

**Important:** Authentication integration from Step 1 must remain functional. Do not rewrite or replace AuthContext or the centralized Axios architecture.

---

## 1. Inspect the Existing Implementation

Before making changes, inspect:

### Frontend
- Shop page and product catalog.
- Product details page.
- Product cards and image galleries.
- Category navigation and category filters.
- Search, sorting, filtering, and pagination.
- Product variants and size/color selection.
- Admin product management page.
- Admin category management page.
- Existing mock product/category datasets.
- Existing API client and error handling.
- Existing AdminLayout, ProtectedRoute, and permission handling.

### Backend
Inspect the actual implementation of:
- Catalog routes.
- Product routes.
- Category routes.
- Product controllers and services.
- Product validation.
- Product variant endpoints.
- Product image endpoints.
- Product/category database relationships.
- Public and administrative access permissions.
- Pagination, search, filtering, and sorting support.
- Image upload and storage implementation.

The previous audit identified these endpoint families as available:

- `/api/catalog`
- `/api/products`
- `/api/categories`
- Product variants.
- Product images.

Verify the exact HTTP methods, paths, request parameters, response structures, and permission requirements before integration.

**Never invent an endpoint because it appears in this prompt.**

---

## 2. Create Product and Category API Services

Extend the existing API service architecture.

Suggested structure:

```text
src/
  services/
    api/
      apiClient.js
      authApi.js
      productApi.js
      categoryApi.js
```

Adapt to the existing project structure rather than creating duplicate services.

### Product API functions

Implement functions matching the verified backend endpoints:

- getProducts()
- getProductById()
- getProductBySlug()
- getFeaturedProducts()
- getRelatedProducts()
- createProduct()
- updateProduct()
- deleteProduct()
- activateProduct()
- deactivateProduct()

Only implement functions for operations actually supported by the backend.

### Category API functions

Implement supported operations:

- getCategories()
- getCategoryById()
- getCategoryBySlug()
- createCategory()
- updateCategory()
- deleteCategory()

Support hierarchical categories only if the existing backend schema and endpoints support them.

### Variants and Images

Inspect existing endpoints and implement supported operations for:

- Creating variants.
- Updating variants.
- Deleting variants.
- Managing product images.
- Associating images with products and variants.

Do not assume an image endpoint supports every operation.

---

## 3. Integrate the Public Shop Catalog

Connect the existing Shop page to the real product catalog.

Requirements:

- Load products from the backend.
- Display actual product names, descriptions, prices, images, and categories.
- Display sale prices when provided.
- Display available sizes and colors where supported.
- Handle products with no available variants.
- Handle inactive or archived products according to the backend's public catalog rules.
- Preserve existing product cards and visual design.

### Search and filtering

Connect the existing search and filter UI to backend query parameters where supported.

Support available filters such as:

- Category.
- Price range.
- Size.
- Color.
- Availability.
- Featured products.
- Search keyword.

Do not send unsupported query parameters.

If some filters are not supported by the backend, document the limitation rather than pretending they are server-side filters.

### Sorting and pagination

- Use backend pagination if available.
- Preserve the current sorting experience.
- Avoid downloading the entire product database unnecessarily.
- Maintain pagination when filters change.
- Reset pagination when appropriate after a new search.

### Loading and error states

Implement:
- Initial loading state.
- Empty catalog state.
- No search results state.
- Network error state.
- Retry behavior.

Do not show mock products when a real API request fails.

---

## 4. Integrate Product Details

Connect the existing Product Details page to the backend.

Display:

- Product name.
- Product description.
- Product images.
- Category.
- Available variants.
- Size and color options.
- Price and sale price.
- Stock availability.
- Product specifications, if provided.
- Related products, if supported.

### Variant selection

When a customer selects a size or color:

1. Identify the correct backend variant.
2. Update the selected variant state.
3. Display the correct price and stock availability.
4. Disable unavailable selections where appropriate.
5. Preserve the selected variant when adding the product to the cart later.

Do not calculate stock availability from unrelated mock data.

Do not allow customers to select inactive variants.

### Important

Do not implement cart API integration in this step. Preserve the existing cart interaction temporarily, but clearly separate it from the real product data.

---

## 5. Integrate Category Navigation

Connect category navigation to real backend category data.

Requirements:

- Load categories from the backend.
- Display active categories only where the backend supports that rule.
- Support parent and child categories if supported.
- Connect category selections to the appropriate product filtering behavior.
- Preserve the existing Navbar and Shop category UI.
- Handle empty categories gracefully.

Do not create categories automatically from frontend mock data.

---

## 6. Integrate Admin Product Management

Connect the existing Admin Products page to verified backend product management endpoints.

Requirements:

- Display real products.
- Search and filter products.
- Display product status.
- Display category and variant information.
- Support product creation.
- Support product editing.
- Support product activation/deactivation.
- Support deletion or archival according to the actual backend behavior.
- Display clear success and error feedback.

### Product form

Preserve the existing form and connect it to the actual backend fields.

Support:
- Product name.
- Description.
- Category.
- Slug, if required or generated by the backend.
- Product status.
- Variants.
- SKU.
- Size.
- Color.
- Price.
- Sale price.
- Stock quantity.
- Low-stock threshold.
- Product images.

Do not send fields that do not exist in the backend schema.

### Product variants

Ensure that:
- Each variant belongs to the correct product.
- SKU uniqueness is handled correctly.
- Prices are validated.
- Stock values are validated.
- Sale price follows the backend's business rules.
- Inactive variants cannot be purchased.

Never update another product's variant accidentally.

### Product images

Inspect the backend upload contract first.

If supported:
- Use the correct multipart field name.
- Validate image types and size.
- Display upload progress where practical.
- Handle upload failures.
- Support existing image display and removal.

Do not store image files as base64 in localStorage.

Do not invent public image URLs or expose private storage paths.

If image uploads are not supported by the actual backend, report the limitation and leave that operation clearly unavailable.

---

## 7. Integrate Admin Category Management

Connect the existing Admin Categories page to the real backend.

Support verified operations:

- Category listing.
- Category creation.
- Category editing.
- Category activation/deactivation, if supported.
- Category deletion, if supported.
- Parent category assignment, if supported.
- Category search and filtering.

### Important business rules

- Prevent invalid parent-child relationships.
- Do not allow a category to become its own parent.
- Respect backend restrictions when a category contains products.
- Do not bypass database foreign-key constraints.
- Display meaningful validation errors.
- Confirm destructive actions.

Do not invent category deletion or archival behavior.

---

## 8. Replace Mock Product and Category State Carefully

Identify every component currently using mock product/category data.

Requirements:

- Replace mock data in the integrated catalog and category flows.
- Keep unrelated mock data for Cart, Wishlist, Checkout, Orders, and other modules until their integration steps.
- Avoid duplicate API requests.
- Reuse shared product data where appropriate.
- Avoid unnecessary global state changes.
- Do not break existing cart or wishlist UI.
- Do not silently display mock products when the backend is unavailable.

If existing cart or wishlist items depend on product information, ensure they can continue displaying their stored product snapshots until those modules are integrated.

---

## 9. Permissions and Security

Use the real authentication and authorization system from Step 1.

Requirements:

- Public customers can browse products and categories according to backend rules.
- Admin product/category management requires the appropriate backend permissions.
- Data Encoder access must follow actual backend permissions.
- Customer users must not access administrative operations.
- Never rely only on hiding frontend buttons for authorization.
- The backend remains responsible for enforcing permissions.
- Do not expose database IDs, internal errors, or private storage information unnecessarily.

Do not add or modify database permissions in this step.

---

## 10. Testing Requirements

### Public catalog tests

- Load product catalog.
- Open product details.
- Search products.
- Filter by category.
- Test price filtering if supported.
- Test size and color selection.
- Test unavailable variants.
- Test empty catalog.
- Test API/network failure.
- Test pagination and sorting.

### Admin tests

- Load product list.
- Create a product.
- Edit a product.
- Update variants.
- Upload or manage images if supported.
- Activate/deactivate a product.
- Test category creation.
- Edit a category.
- Test category deletion restrictions.
- Test Admin permissions.
- Test Data Encoder permissions.
- Confirm Customer users cannot perform administrative actions.

### Regression tests

Verify that these remain functional:

- Login.
- Registration.
- Session restoration.
- Logout.
- Protected routes.
- Cart UI.
- Wishlist UI.
- Customer account pages.
- Admin navigation.

### Build and backend tests

Run the available frontend build, lint, and test commands.

Run the relevant backend product, variant, image, category, and catalog test suites.

Record the actual results, including any pre-existing failures. Do not report a test as passing unless it was executed successfully.

---

## 11. Strict Scope Restrictions

This step covers:

- Product API integration.
- Category API integration.
- Public Shop catalog.
- Product Details.
- Category navigation.
- Admin Products.
- Admin Categories.
- Product variants and images.

Do NOT integrate:

- Cart API.
- Wishlist API.
- Customer addresses.
- Checkout.
- Payments.
- Orders.
- Shipments.
- Coupons.

Do NOT:
- Change the MariaDB schema.
- Add new database tables.
- Invent API endpoints.
- Redesign frontend pages.
- Remove unrelated mock datasets.
- Replace the authentication architecture.
- Add unnecessary dependencies.

If a backend capability is missing, document it and stop that specific integration rather than implementing an unapproved backend feature.

---

## 12. Final Checkpoint Report

Provide a detailed report containing:

1. Frontend and backend files inspected.
2. API endpoints verified.
3. API endpoints successfully connected.
4. Public catalog integration results.
5. Product details integration results.
6. Category navigation integration results.
7. Admin product management integration results.
8. Admin category management integration results.
9. Variant and image integration results.
10. Permission test results.
11. Mock data replaced and retained.
12. Build, lint, and test results.
13. Remaining issues and unsupported backend operations.
14. Confirmation that no database schema changes were made.
15. Confirmation that unrelated modules were not modified.

**Stop after Step 2. Do not automatically begin Step 3.**

The next milestone will be:

**Phase 6 – Step 3: Shopping Cart API Integration and Guest Cart Merge.**