# Phase 5 – Step 7: Admin Dashboard Foundation and Layout

## Project: IBTU (ሀበሻን ጥበብ) E-Commerce Platform

## 1. Objective

Build the foundation of the IBTU Admin Dashboard using the existing React frontend architecture and design system.

This milestone focuses on:

1. Creating a professional Admin Dashboard layout.
2. Building sidebar navigation.
3. Creating an admin header.
4. Implementing the Admin Dashboard overview page.
5. Creating reusable dashboard components.
6. Organizing admin routes.
7. Preparing role-based navigation for Admin and Data Encoder users.
8. Preparing the structure for future management pages.

**Important:** This step establishes the Admin Dashboard foundation only. The individual management pages will be implemented in Step 8.

Do not connect to backend APIs or modify the database.

---

## 2. Inspect the Existing Project

Before implementation, inspect:

- Complete frontend folder structure.
- React Router configuration.
- Existing authentication context.
- Existing ProtectedRoute component.
- Existing role and permission handling.
- Existing Admin-related components or pages.
- Existing shared components.
- Existing chart libraries, if any.
- Existing styling and responsive design.
- Existing mock data structures.
- Phase 5 Steps 2–6 implementation status.

### Important instructions

- Do not assume earlier milestones were completed.
- Reuse existing components where appropriate.
- Follow the existing project architecture.
- Do not create duplicate authentication or permission systems.
- Do not modify the public website unnecessarily.
- Identify blockers before implementing dependent features.

If a previous step is incomplete, document the impact and avoid inventing missing functionality.

---

## 3. Create the Admin Dashboard Folder Structure

Adapt the following suggested structure to the actual project conventions.

```text
src/
  components/
    admin/
      AdminLayout.jsx
      AdminSidebar.jsx
      AdminHeader.jsx
      AdminBreadcrumb.jsx
      AdminPageHeader.jsx
      AdminStatCard.jsx
      AdminQuickAction.jsx
      AdminRecentOrders.jsx
      AdminRecentActivities.jsx
      AdminNotificationMenu.jsx
      AdminSearch.jsx
      AdminMobileMenu.jsx

  pages/
    admin/
      AdminDashboard.jsx
      AdminNotFound.jsx

  data/
    admin/
      adminNavigation.js
      adminDashboardMockData.js
```

### Requirements

- Keep components small and reusable.
- Avoid oversized page components.
- Use consistent naming conventions.
- Keep navigation configuration separate from layout components.
- Keep mock dashboard data separate from UI components.
- Do not create unnecessary files if equivalent components already exist.

---

## 4. Admin Dashboard Routes

Create the following initial routes:

- `/admin`
- `/admin/dashboard`

Both should lead to the Admin Dashboard overview if that matches the existing routing conventions.

For future development, reserve the following route structure:

```text
/admin/products
/admin/categories
/admin/inventory
/admin/orders
/admin/payments
/admin/shipments
/admin/customers
/admin/users
/admin/roles
/admin/coupons
/admin/reviews
/admin/messages
/admin/reports
/admin/settings
/admin/audit-logs
```

Do not build these management pages in this step.

If a reserved route is accessed before its page is implemented, display a consistent placeholder or not-implemented page rather than a broken screen.

Avoid duplicate or conflicting routes.

---

## 5. Build AdminLayout

Create the main reusable layout for the administrative area.

### Desktop layout

Include:

- Left sidebar.
- Top header.
- Main content area.
- Responsive content container.
- Consistent page spacing.

### Sidebar behavior

- Fixed or appropriately positioned sidebar.
- Collapsible sidebar if compatible with the existing design.
- Clear active navigation state.
- Navigation icons.
- Tooltips or accessible labels where appropriate.
- Scrollable navigation when necessary.

### Main content

The main content area should:

- Adapt when the sidebar collapses.
- Maintain consistent spacing.
- Support different page titles and breadcrumbs.
- Avoid horizontal overflow.

### Important

The Admin Dashboard must have a separate layout from the public shopping website.

Do not display the public shopping Navbar and Footer inside the Admin Dashboard unless there is an established reason.

---

## 6. Admin Sidebar Navigation

Create organized navigation groups.

### Group 1: Overview

- Dashboard

### Group 2: Catalog Management

- Products
- Categories

### Group 3: Sales Management

- Orders
- Payments
- Shipments
- Coupons

### Group 4: Inventory

- Inventory Management

### Group 5: Customers

- Customers
- Product Reviews
- Contact Messages

### Group 6: Administration

- Users
- Roles and Permissions
- Reports
- Settings
- Audit Logs

### Navigation requirements

- Use Lucide icons already installed in the project.
- Highlight the active route.
- Support nested navigation if appropriate.
- Make groups collapsible if useful.
- Keep labels readable.
- Ensure all links use React Router navigation.
- Avoid broken hash links.

### Role-based navigation preparation

The project has three roles:

- Admin
- Data Encoder
- Customer

Inspect the existing permission structure.

The intended navigation should follow these principles:

**Admin**
- Full administrative navigation, subject to actual permissions.

**Data Encoder**
- Product and category management.
- Inventory management.
- Other features only when permitted by the existing permission model.

**Customer**
- Must not access the Admin Dashboard.

Do not invent new permissions or change the backend RBAC model.

If real permission data is not yet available, create a clean navigation configuration that can later consume permissions from the backend. Do not pretend frontend-only role checks provide production security.

---

## 7. Build AdminHeader

The header should include:

### Left section

- Sidebar toggle button.
- Breadcrumb or current page title.

### Right section

- Search interface or search placeholder.
- Notification icon.
- Admin profile menu.
- Logout action.

### Profile menu

Include:

- User display name when available.
- User role when available.
- Account/Profile placeholder if no profile page exists.
- Logout action using the existing authentication flow.

### Notification menu

Create a frontend-only notification interface.

Use sample notification data only when clearly identified as development mock data.

Do not invent real orders, payment approvals, or stock alerts.

If there are no notifications, show an appropriate empty state.

Do not connect notification actions to backend services.

---

## 8. Admin Dashboard Overview Page

Route:

`/admin` or `/admin/dashboard`

Create a professional overview page.

### A. Welcome section

Display:

- Dashboard title.
- Welcome message.
- Current date, if appropriate.
- Short administrative summary.

Do not hardcode a real administrator's identity.

### B. Statistics cards

Create reusable cards for:

1. Total Revenue
2. Total Orders
3. Total Customers
4. Total Products
5. Pending Orders
6. Low Stock Products

Each card should support:

- Title.
- Value.
- Icon.
- Optional comparison indicator.
- Optional description.

### Important data rules

- Do not invent real business statistics.
- If mock data is used, clearly identify it as development sample data.
- Do not display fake revenue as actual IBTU revenue.
- Do not calculate real financial metrics from incomplete sample data.
- Show placeholders or zero values when real data is unavailable.

### C. Sales Overview Chart

Create a sales chart section.

Requirements:

- Use an existing chart library if one is already installed.
- If no chart library exists, use a simple CSS-based visualization or request approval before adding a dependency.
- Use clearly identified mock data for demonstration.
- Include chart title and useful labels.
- Make the chart responsive.

Do not represent sample chart values as actual sales.

### D. Recent Orders

Display a compact table or list containing:

- Order Number
- Customer
- Date
- Amount (ETB)
- Payment Status
- Order Status
- View action

Use development-only sample data if necessary.

Do not invent real customer orders.

### E. Recent Activities

Display a recent activity section.

Possible activity types:

- Product created.
- Product updated.
- Order status changed.
- Inventory adjusted.
- Customer registered.

Use only clearly identified development sample activities.

Prepare the structure for future audit log integration.

### F. Quick Actions

Provide navigation shortcuts for:

- Add Product
- Manage Orders
- Manage Inventory
- View Customers

If a destination page is not implemented, show an appropriate placeholder page rather than a broken route.

---

## 9. Reusable Admin Components

Create reusable components where appropriate.

### AdminStatCard

Props may include:

- title
- value
- icon
- description
- trend
- trendDirection

### AdminPageHeader

Support:

- Title
- Description
- Breadcrumb
- Optional action button

### AdminStatusBadge

Support the existing order, payment, and shipment status values.

Use consistent colors and labels.

### AdminDataTable

Create a reusable table foundation suitable for future management pages.

It should support:

- Column definitions.
- Data rows.
- Loading state.
- Empty state.
- Responsive behavior.
- Optional row actions.

Do not build full CRUD functionality in this step.

### AdminEmptyState

Create a reusable empty state for sections without data.

### Admin components should be

- Reusable.
- Responsive.
- Consistent.
- Accessible.
- Easy to integrate with backend data later.

Avoid unnecessary abstraction.

---

## 10. Admin Authentication and Route Protection

Inspect the existing authentication and authorization architecture.

Requirements:

1. Reuse the existing authentication context.
2. Review the existing ProtectedRoute component.
3. Ensure the Admin Dashboard is intended for administrative roles only.
4. Ensure Customers cannot access administrative pages.
5. Prepare role and permission checks for Admin and Data Encoder users.
6. Use the existing logout flow.
7. Preserve the requested destination after authentication if supported.

### Security restrictions

- Do not use a hardcoded role to simulate real authorization.
- Do not trust localStorage role values as production authorization.
- Do not bypass authentication because the backend is unavailable.
- Do not claim frontend route protection is sufficient for security.

If real backend authentication is not connected, document the missing integration and keep the route architecture ready for it.

---

## 11. Design System

Follow the existing IBTU brand identity.

### Brand colors

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

### Design requirements

- Professional e-commerce administration interface.
- Clean sidebar.
- Clear dashboard cards.
- Consistent typography.
- Appropriate table spacing.
- Clear status indicators.
- Subtle animations.
- Accessible controls.
- Consistent icon sizing.
- Responsive layout.

The Admin Dashboard can be more data-oriented than the public shopping website, but it must still follow the IBTU visual identity.

---

## 12. Responsive Design

Test:

### Desktop

- Sidebar and header layout.
- Dashboard cards in appropriate columns.
- Charts and tables readable.
- Main content uses available space.

### Tablet

- Sidebar collapses appropriately.
- Dashboard cards adapt.
- Tables remain usable.
- Navigation is accessible.

### Mobile

- Sidebar becomes a mobile drawer or equivalent.
- Header controls remain accessible.
- Cards stack vertically.
- Tables use responsive layouts or horizontal scrolling.
- No horizontal page overflow.

---

## 13. Testing and Regression Verification

### Admin layout

- [ ] Admin layout renders.
- [ ] Sidebar opens and closes.
- [ ] Active navigation works.
- [ ] Header renders.
- [ ] Breadcrumbs work.
- [ ] Profile menu works.
- [ ] Notification menu works.
- [ ] Logout uses the existing flow.

### Dashboard overview

- [ ] Welcome section renders.
- [ ] Statistics cards render.
- [ ] Chart renders.
- [ ] Recent Orders renders.
- [ ] Recent Activities renders.
- [ ] Quick Actions navigate correctly.
- [ ] Empty states work.
- [ ] Mock data is clearly identified.

### Routing and access

- [ ] `/admin` works.
- [ ] `/admin/dashboard` works.
- [ ] Reserved management routes do not show broken pages.
- [ ] Customer access is restricted appropriately.
- [ ] Admin/Data Encoder navigation respects the available permission model.
- [ ] Unknown routes display an appropriate not-found page.

### Regression

- [ ] Home page works.
- [ ] Shop page works.
- [ ] Product Details works.
- [ ] Cart works.
- [ ] Wishlist works.
- [ ] Checkout pages remain intact.
- [ ] Customer Dashboard works.
- [ ] Login and Registration work.
- [ ] About and Contact work.
- [ ] Public Navbar and Footer remain intact.
- [ ] Desktop, tablet, and mobile layouts work.
- [ ] No console errors.
- [ ] No broken imports.
- [ ] `npm run build` succeeds.

Fix issues introduced by this milestone.

---

## 14. Strict Scope Restrictions

Do NOT:

1. Modify backend files.
2. Modify database tables or schemas.
3. Connect dashboard statistics to backend APIs.
4. Implement product CRUD.
5. Implement category CRUD.
6. Implement order management.
7. Implement payment approval.
8. Implement shipment management.
9. Implement customer management.
10. Implement user or role management.
11. Implement inventory adjustments.
12. Implement coupon management.
13. Implement reports.
14. Implement settings management.
15. Implement audit log management.
16. Install new dependencies without explaining why they are necessary and requesting approval.
17. Break existing public website or customer dashboard functionality.

This milestone is strictly for Admin Dashboard foundation, layout, navigation, and overview.

---

## 15. Final Checkpoint Report

After implementation, provide:

### A. Admin Layout

| Feature | Status | Notes |
|---|---|---|
| AdminLayout | | |
| AdminSidebar | | |
| AdminHeader | | |
| Breadcrumb | | |
| Responsive Navigation | | |

### B. Dashboard Overview

| Feature | Status | Notes |
|---|---|---|
| Welcome Section | | |
| Statistics Cards | | |
| Sales Chart | | |
| Recent Orders | | |
| Recent Activities | | |
| Quick Actions | | |

### C. Reusable Components

List all reusable admin components created and explain their purpose.

### D. Routing and Permissions

Explain:

- Admin routes created.
- Reserved management routes.
- Admin role handling.
- Data Encoder role handling.
- Customer access restrictions.
- Current authentication limitations.

### E. Files Changed

List created and modified files with their purposes.

### F. Testing Results

Report:

- Build result.
- Layout tests.
- Navigation tests.
- Responsive tests.
- Regression tests.
- Console errors.
- Remaining issues.

### G. Backend Integration Readiness

Explain which dashboard sections currently use mock data and what backend endpoints or permission integration will eventually be required.

### H. Final Status

Choose one:

- Completed
- Partially Completed
- Blocked

**Stop after Phase 5 Step 7. Do not begin Admin Dashboard Management Pages until this checkpoint report has been reviewed and approval is given.**