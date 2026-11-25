# Phase 5 – Step 8.2: Admin Inventory Management

## Objective

Implement the Inventory Management frontend for the IBTU e-commerce platform.

The inventory module should help authorized administrators and data encoders monitor stock levels, identify low-stock products, record stock adjustments, and review inventory movement history.

**Important:** This is a frontend-only milestone. Do not connect to backend APIs or modify the database.

---

## 1. Inspect the Existing Project

Before development:

1. Inspect the existing React project structure.
2. Review the Admin Dashboard foundation from Step 7.
3. Review the Product and Category Management implementation from Step 8.1.
4. Inspect existing product variant and stock data structures.
5. Review existing inventory-related mock data and components.
6. Inspect the existing inventory permissions and role authorization logic.
7. Identify reusable tables, modals, filters, status badges, and forms.

Do not assume that previous steps were completed successfully. Verify the actual source code.

Reuse existing components and preserve completed functionality.

---

## 2. Inventory Dashboard

Create the Inventory Management page.

**Suggested route:**

`/admin/inventory`

At the top, display inventory summary cards:

- Total Product Variants
- Total Physical Stock
- Total Reserved Stock
- Total Available Stock
- Low Stock Variants
- Out-of-Stock Variants

Use the existing data model.

### Important stock calculations

Follow these business rules:

- Physical Stock = `stock_quantity`
- Reserved Stock = `reserved_quantity`
- Available Stock = `stock_quantity - reserved_quantity`

Never calculate available stock by adding reserved stock.

If the project contains inconsistent stock values, identify and report them instead of silently correcting them.

Clearly label all figures as mock data when they are not connected to the backend.

---

## 3. Inventory Listing

Create a professional inventory table.

Display:

- Product image
- Product name
- SKU
- Category
- Size
- Color
- Physical stock
- Reserved stock
- Available stock
- Low-stock threshold
- Stock status
- Actions

### Search and filters

Implement:

- Search by product name or SKU.
- Filter by category.
- Filter by stock status.
- Filter by size and color if available.
- Sort by product name.
- Sort by available quantity.
- Sort by stock quantity.
- Clear all filters.
- Pagination if necessary.

### Stock status rules

Use the variant's existing `low_stock_threshold`.

- Out of Stock: available quantity is zero or less.
- Low Stock: available quantity is positive but at or below the threshold.
- In Stock: available quantity is above the threshold.

Do not invent alternative stock rules.

---

## 4. Stock Adjustment

Create a Stock Adjustment form or modal.

Authorized users should be able to simulate stock adjustments through frontend mock state.

Include:

- Product
- Product variant
- SKU
- Current physical stock
- Adjustment type
- Quantity
- Reason
- Notes

Supported adjustment types should follow the existing inventory movement model where applicable:

- Purchase
- Opening Stock
- Customer Return
- Damaged
- Lost
- Adjustment

### Validation

- Product and variant are required.
- Quantity must be a valid positive number.
- Reason is required where appropriate.
- Prevent invalid negative physical stock.
- Do not allow users to edit reserved stock directly through the physical stock adjustment form.
- Display a confirmation before applying an adjustment.

### Important

For this frontend-only implementation, simulate adjustments using mock state.

Do not claim that real database inventory has changed.

Do not implement stock reservation or order fulfillment in this step.

---

## 5. Inventory Movement History

Create an inventory movement history section or page.

**Suggested route:**

`/admin/inventory/movements`

Display:

- Date and time
- Product
- Variant
- SKU
- Movement type
- Quantity
- Quantity before
- Quantity after
- Reference type, if available
- Reference ID, if available
- User
- Reason

Support:

- Search by product or SKU.
- Filter by movement type.
- Filter by date range.
- Sort by date.
- Empty state.
- Movement details modal.

Use mock movement records if actual backend data is unavailable.

Do not invent real transaction references or user identities.

---

## 6. Low Stock Monitoring

Create a low-stock view or filter within the inventory module.

Display variants whose available quantity is at or below their low-stock threshold.

Include:

- Product name
- SKU
- Physical stock
- Reserved stock
- Available stock
- Threshold
- Stock status

Provide a clear visual warning for low-stock and out-of-stock items.

Do not implement automated notifications or email alerts.

---

## 7. Reusable Components

Review existing components before creating new ones.

Create additional reusable components only when necessary, such as:

- InventorySummaryCard
- InventoryTable
- InventoryFilters
- StockAdjustmentModal
- InventoryMovementTable
- InventoryMovementDetails
- StockStatusBadge
- LowStockList

Keep the implementation modular.

Avoid putting all inventory logic inside one large component.

---

## 8. State Management and Mock Data

Use the existing state-management approach.

Requirements:

- Reuse product variants from Step 8.1 where possible.
- Keep mock inventory movement data separate from page components.
- Ensure stock adjustment changes update the relevant inventory listing.
- Ensure dashboard summary cards update when mock stock changes.
- Keep stock calculations consistent throughout the module.
- Do not introduce another state-management library.
- Do not store sensitive information in localStorage.

If persistence is needed, follow the existing project convention and clearly identify it as frontend-only mock persistence.

---

## 9. Role and Permission Preparation

Review existing RBAC behavior.

Expected access:

**Admin**
- Full inventory viewing and management access.

**Data Encoder**
- Inventory access and stock adjustment only where existing permissions allow it.

**Customer**
- No access to inventory administration.

Important:

- Reuse existing permission names.
- Do not invent new permissions.
- Do not modify database RBAC records.
- Do not bypass existing route protection.
- Remember that backend authorization will be required during API integration.

---

## 10. Routing and Navigation

Add or update:

- `/admin/inventory`
- `/admin/inventory/movements`

Requirements:

- Use the existing AdminLayout.
- Maintain breadcrumb navigation.
- Highlight the active sidebar item.
- Ensure both routes respect existing admin authorization.
- Preserve existing product and category routes.

---

## 11. UI and Design Requirements

Follow the established IBTU Admin Dashboard design.

Brand colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

Ensure:

- Professional inventory dashboard.
- Consistent summary cards.
- Readable inventory tables.
- Clear stock status indicators.
- Responsive adjustment modal.
- Mobile-friendly layout.
- Accessible forms and controls.
- Consistent typography and spacing.

Do not redesign the existing Admin Dashboard.

---

## 12. Testing and Verification

Test the following:

### Inventory Dashboard
- Summary cards calculate correctly.
- Physical, reserved, and available stock are displayed correctly.
- Summary values update after mock adjustments.

### Inventory Listing
- Product variants display correctly.
- Search and filters work.
- Sorting works.
- Stock status follows the correct threshold rules.

### Stock Adjustment
- Valid adjustments update mock stock.
- Invalid quantities are rejected.
- Reserved stock cannot be edited through physical stock adjustments.
- Confirmation dialog works.

### Movement History
- Movement records display correctly.
- Filters and search work.
- Details modal works.
- New mock adjustments create corresponding movement records.

### Regression
- Product Management works.
- Category Management works.
- Admin Dashboard works.
- Public Home, Shop, and Product Details work.
- Cart and Wishlist work.
- Customer Account and Checkout pages remain unaffected.
- No console errors.
- Production build succeeds.

---

## 13. Strict Scope Restrictions

Do not:

- Connect to backend APIs.
- Modify the MariaDB database.
- Create backend endpoints.
- Implement real stock reservation.
- Implement order fulfillment.
- Implement shipment management.
- Implement automated stock notifications.
- Modify Product or Category Management unnecessarily.
- Change the public website.
- Install new dependencies without approval.

If a requirement depends on missing backend functionality, document it rather than simulating a real server operation.

---

## 14. Final Checkpoint Report

After implementation, provide:

1. Files created.
2. Files modified.
3. Inventory dashboard features completed.
4. Inventory listing and filters completed.
5. Stock adjustment behavior.
6. Inventory movement history.
7. Low-stock monitoring.
8. Stock calculation rules used.
9. Role and permission behavior.
10. Tests performed and results.
11. Known issues or incomplete features.
12. Confirmation that no backend or database changes were made.

**STOP after completing Step 8.2. Wait for my review and approval before starting Step 8.3.**