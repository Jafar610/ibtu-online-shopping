# Phase 5 – Step 8.1: Admin Product and Category Management Pages

## Objective

Implement the Admin Product Management and Category Management frontend pages for the IBTU e-commerce platform.

The goal is to allow authorized administrators and data encoders to manage the product catalog through a clean, responsive, and reusable admin interface.

**Important:** This is a frontend development milestone. Do not connect to the backend API or modify the database in this step.

---

## 1. Inspect the Existing Project Before Development

Before writing or modifying code:

1. Inspect the existing React project structure.
2. Review the Admin Dashboard foundation completed in Step 7.
3. Review existing components, layouts, routing, styling, and state management.
4. Inspect the existing product and category data structures.
5. Review existing mock data and identify reusable components.
6. Check the existing role and permission structure.
7. Identify any existing product or category management components.

Do not recreate components that already exist and work correctly.

Preserve all completed frontend functionality from previous steps.

If Step 7 is incomplete, report the missing foundation before proceeding.

---

## 2. Product Management Page

Create or complete the Product Management page.

**Suggested route:**

`/admin/products`

### A. Product Listing

Create a professional product management table with:

- Product image
- Product name
- SKU or product identifier, if available
- Category
- Price (ETB)
- Stock status
- Product status
- Created date, if available
- Actions

Include:

- Search by product name or SKU.
- Filter by category.
- Filter by product status.
- Filter by stock status.
- Sorting by name, price, and date where supported.
- Pagination if appropriate.
- Clear filters.
- Responsive table behavior.

Product statuses should reflect the existing project data model, such as:

- Draft
- Active
- Archived

Stock status should distinguish:

- In Stock
- Low Stock
- Out of Stock

Use the existing stock fields and business rules. Do not invent stock calculations.

### B. Add Product

Create a reusable product form that supports:

**Basic Information**
- Product name
- Product slug, if used
- Product description
- Category
- Product status

**Product Variants**

Support the existing variant structure:

- SKU
- Size
- Color
- Price (ETB)
- Sale price (optional)
- Stock quantity
- Reserved quantity, if displayed
- Low-stock threshold
- Active/inactive status

Allow adding and removing multiple variants if the existing data model supports it.

**Product Images**
- Image selection and preview.
- Multiple image previews if supported.
- Image removal before saving.
- Main image selection if supported by the existing structure.

Do not claim that images are uploaded to a server. This milestone uses frontend-only behavior.

### C. Edit Product

Allow the user to:

- Open an existing product.
- Edit product information.
- Update variants.
- Review product images.
- Save changes to the frontend mock state.

### D. Product Actions

Implement frontend interactions for:

- View product details.
- Edit product.
- Change product status.
- Delete product with confirmation.

Do not permanently delete products in the real database. Use mock state only.

If the existing project uses archived products rather than deletion, preserve that behavior.

---

## 3. Category Management Page

Create or complete the Category Management page.

**Suggested route:**

`/admin/categories`

### A. Category Listing

Display:

- Category image, if available.
- Category name.
- Slug.
- Description.
- Parent category, if supported.
- Number of products, if available.
- Status.
- Actions.

Include:

- Search by category name.
- Filter by status.
- Sorting.
- Pagination where appropriate.
- Empty state.
- Loading state if the existing UI architecture supports it.

### B. Add Category

Create a category form with:

- Category name.
- Slug.
- Description.
- Parent category, if hierarchical categories are supported.
- Category image selection and preview, if supported.
- Active/inactive status.

Validate required fields and prevent duplicate category slugs within the frontend mock data.

### C. Edit Category

Allow editing existing category information and updating the frontend mock state.

### D. Category Actions

Implement:

- View category.
- Edit category.
- Activate/deactivate category.
- Delete category with confirmation.

If a category contains products, show a warning before deletion. Do not silently remove products or alter their category assignments.

---

## 4. Reusable Components

Review the components created in Step 7 and reuse them wherever possible.

Create additional reusable components only when needed, such as:

- ProductForm
- ProductVariantForm
- ProductImageUploader
- CategoryForm
- ProductFilters
- CategoryFilters
- ConfirmDeleteModal
- StatusBadge
- EmptyState

Keep components modular and maintainable.

Avoid placing all product and category functionality inside one large component.

---

## 5. Frontend State and Mock Data

For this milestone:

- Use the existing state-management approach.
- Reuse existing mock data where available.
- If additional mock data is necessary, create clearly separated mock data files.
- Support frontend create, edit, activate/deactivate, and delete interactions.
- Ensure changes appear immediately in the listing.
- Preserve state consistently across the relevant product and category components where practical.

Clearly identify mock data in the development implementation.

Do not pretend frontend changes have been saved to the actual IBTU database.

Do not introduce a new state-management library.

---

## 6. Role and Permission Preparation

Review the existing role and permission structure.

Expected access:

**Admin**
- Full product and category management access.

**Data Encoder**
- Product and category management only where the existing permission structure allows it.

**Customer**
- No access to admin management pages.

Important:

- Reuse existing permission names and authorization logic.
- Do not invent new permissions.
- Do not modify the database or RBAC configuration.
- Hide or disable actions when the existing frontend authorization structure requires it.
- Do not treat frontend permission checks as a replacement for backend authorization.

---

## 7. UI and Design Requirements

Follow the existing IBTU admin dashboard design.

Maintain the brand colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

Design requirements:

- Clean and professional admin interface.
- Consistent spacing and typography.
- Reusable form fields and buttons.
- Clear confirmation dialogs.
- Consistent status badges.
- Attractive product image previews.
- Responsive layouts for desktop, tablet, and mobile.
- Accessible labels and keyboard-friendly interactions.

Do not redesign the public website or change the Admin Dashboard layout unnecessarily.

---

## 8. Routing and Navigation

Add or update the routes using the existing React Router structure.

Required pages:

- `/admin/products`
- `/admin/categories`

Ensure:

- Both pages use the existing AdminLayout.
- Breadcrumbs display correctly.
- Sidebar navigation links work.
- Active navigation states work.
- Protected-route and role-access behavior is preserved.

Do not break existing routes.

---

## 9. Testing and Verification

After implementation, test:

### Product Management
- Product listing displays correctly.
- Search and filters work.
- Add product works using frontend state.
- Edit product works.
- Multiple variants can be managed where supported.
- Product status changes work.
- Delete confirmation works.
- Empty states display correctly.

### Category Management
- Category listing displays correctly.
- Search and filters work.
- Add and edit category work.
- Duplicate slug validation works.
- Category status changes work.
- Delete warning works when products are associated.

### Regression Testing
- Admin dashboard still works.
- Admin sidebar and header work.
- Public Home page works.
- Shop and Product Details pages work.
- Cart and Wishlist pages work.
- Customer Account pages work.
- Checkout pages remain unaffected.
- No console errors.
- Production build succeeds.

---

## 10. Strict Scope Restrictions

Do not:

- Connect to backend APIs.
- Install Axios for this milestone.
- Modify the MariaDB database.
- Create or modify backend endpoints.
- Implement inventory management.
- Implement order management.
- Implement payment management.
- Implement shipment management.
- Implement customer management.
- Implement user or role management.
- Change the public website design.
- Add new dependencies without approval.

If an important requirement depends on a missing backend feature, document it instead of creating fake functionality.

---

## 11. Final Checkpoint Report

When finished, provide a report containing:

1. Files created.
2. Files modified.
3. Product Management features completed.
4. Category Management features completed.
5. Reusable components created.
6. Routes added or updated.
7. Role and permission behavior.
8. Mock data and state-management approach.
9. Tests performed and their results.
10. Known issues or incomplete features.
11. Confirmation that no backend or database changes were made.

**STOP after completing Step 8.1. Do not start Step 8.2 until I review and approve the checkpoint report.**