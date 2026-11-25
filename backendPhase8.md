# IBTU E-Commerce Backend – Phase 2, Step 4: Product Image Management API

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack

- Node.js
- Express.js
- MariaDB
- mysql2/promise
- JWT authentication
- bcryptjs
- Multer
- Role-Based Access Control (RBAC)
- RESTful API architecture

### Existing Database Tables

- `products`
- `product_variants`
- `product_images`
- `categories`
- `users`

Database: `ibutu_ecommerce`

The `product_images` table already exists. Do not recreate it.

## 2. Main Objective

Build a complete Product Image Management API that supports:

- Uploading product images.
- Retrieving product images.
- Updating image information.
- Selecting a primary image.
- Changing image display order.
- Deleting product images.
- Associating images with products and optionally product variants.

Example:

A Habesha Kemis product may have:
- Front image.
- Back image.
- Side image.
- Detail image.
- Different color-specific images.

## 3. Step-by-Step Implementation

### Step 1: Review Existing Database Structure

Inspect:

- `product_images`
- `products`
- `product_variants`

Verify:

- Column names and data types.
- Primary keys.
- Foreign keys.
- Image URL field.
- Alt text.
- Primary image flag.
- Sort order.
- Variant relationship.

Important: Verify that a variant assigned to an image belongs to the same product. The backend must enforce this relationship.

Do not assume the schema.

### Step 2: Understand Image Uploading

Explain:

- What Multer is.
- How multipart/form-data works.
- How Node.js receives uploaded files.
- Difference between storing image files and storing image URLs in MariaDB.
- Why storing binary image files directly in the database is generally unnecessary for this project.
- How to validate image files securely.

Use simple IBTU examples.

### Step 3: Choose an Image Storage Strategy

Compare:

1. Local filesystem storage.
2. Cloud image storage.

Recommend an appropriate development and production strategy.

Requirements:

- Do not store large image binaries in MariaDB.
- Store image references or URLs in `product_images`.
- Keep image storage configuration separate from controllers.
- Ensure uploaded images remain accessible after deployment.
- Do not assume local server storage is permanent on cloud hosting.

If a cloud provider requires account credentials, explain the setup and wait for my approval before requesting configuration.

### Step 4: Install and Configure Multer

Install Multer:

```bash
npm install multer
```

Create:

`src/config/multer.js`

Configure:

- Accepted MIME types.
- File size limits.
- File count limits.
- Safe filenames.
- Upload destination or storage provider.

Allow only appropriate image formats, such as:

- JPEG
- PNG
- WebP

Do not trust file extensions alone. Validate actual file content where practical.

### Step 5: Create Image Management Architecture

Create or update:

```text
src/
├── config/
│   ├── database.js
│   └── multer.js
├── controllers/
│   └── product-image.controller.js
├── services/
│   └── product-image.service.js
├── routes/
│   └── product-image.routes.js
├── middleware/
│   └── upload.middleware.js
└── validators/
    └── product-image.validator.js
```

Explain each file's responsibility.

### Step 6: Implement Image Upload Service

Create reusable functions:

- `uploadProductImages(productId, files, data)`
- `getProductImages(productId)`
- `getProductImageById(imageId)`
- `updateProductImage(imageId, data)`
- `setPrimaryImage(imageId)`
- `reorderProductImages(productId, imageOrders)`
- `deleteProductImage(imageId)`

Requirements:

- Verify that the product exists.
- Verify that any supplied variant belongs to the product.
- Store image references in MariaDB.
- Support alt text.
- Support sort order.
- Support primary image selection.
- Prevent invalid image associations.
- Use transactions for related database changes.

### Step 7: Implement Primary Image Management

Business rules:

- A product should have at most one primary image.
- Setting a new primary image should unset the previous primary image.
- Primary image selection must happen atomically.
- The selected image must belong to the requested product.

Use a database transaction.

Review whether the existing schema supports enforcing this rule at database level. If a schema change is needed, explain it and request approval first.

### Step 8: Implement Image Controllers and Routes

Create:

`src/controllers/product-image.controller.js`

Create:

`src/routes/product-image.routes.js`

Endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/products/:productId/images` | Upload product images |
| GET | `/api/products/:productId/images` | List product images |
| GET | `/api/product-images/:id` | Get image details |
| PUT | `/api/product-images/:id` | Update image information |
| PATCH | `/api/product-images/:id/primary` | Set primary image |
| PATCH | `/api/products/:productId/images/reorder` | Change image order |
| DELETE | `/api/product-images/:id` | Delete image |

Use existing JWT authentication and RBAC middleware.

Authorization:

- Upload requires `products.create` or an explicitly approved image-management permission.
- Update requires `products.update`.
- Delete requires `products.delete`.
- Public users may retrieve images belonging to active products.

### Step 9: Implement File Deletion Safely

When deleting an image:

1. Verify that the image record exists.
2. Verify that the user is authorized.
3. Remove the database record safely.
4. Remove the stored file only after the database operation succeeds.
5. Handle missing files gracefully.

Avoid deleting files that are still referenced by another record.

If cloud storage is used, implement the provider's deletion operation.

### Step 10: Integrate Routes

Register the image routes in:

`src/app.js`

Preserve all existing:

- Health endpoints.
- Database health endpoint.
- Authentication routes.
- Category routes.
- Product routes.
- Variant routes.
- Error middleware.

### Step 11: Test with Postman

Test:

1. Upload one valid image.
2. Upload multiple valid images.
3. Upload an unsupported file type.
4. Upload an oversized image.
5. Upload images for a nonexistent product.
6. Associate an image with a variant belonging to another product.
7. Retrieve product images.
8. Update alt text.
9. Set a primary image.
10. Change the primary image.
11. Reorder images.
12. Delete an image.
13. Attempt an unauthorized upload.
14. Verify public access to images for active products.

## 4. Security and Business Rules

- Validate file content and size.
- Do not trust client-provided filenames.
- Generate safe unique filenames.
- Restrict accepted image types.
- Use existing RBAC permissions.
- Never expose server filesystem paths.
- Do not store image binaries in MariaDB.
- Preserve valid product-image relationships.
- Prevent multiple primary images for one product.
- Clean up files when appropriate.
- Do not expose internal server errors.

## 5. Development Rules

1. Work one step at a time.
2. Explain important code line by line.
3. Provide complete working code.
4. Inspect the actual database schema before coding.
5. Do not recreate existing tables.
6. Do not modify the frontend.
7. Do not skip checkpoints.
8. Fix errors before proceeding.
9. Wait for my confirmation before moving to the next step.

## 6. Final Checkpoint

Ask me to confirm:

- [ ] Existing image table reviewed.
- [ ] Storage strategy selected.
- [ ] Multer configured.
- [ ] Image validation working.
- [ ] Upload service working.
- [ ] Image retrieval working.
- [ ] Primary image selection working.
- [ ] Image ordering working.
- [ ] Image deletion working.
- [ ] RBAC protection working.
- [ ] Postman tests passed.

**Start with Step 1: Inspect the existing product_images, products, and product_variants tables. Do not write implementation code until the actual database structure is verified.**