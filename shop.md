# Project: IBTU (ሀበሻን ጥበብ) — Shop / Product Catalog Page

## 1. Project Overview

Design and develop a modern, premium, fully responsive Shop / Product Catalog Page for **ibtu**, an Ethiopian fashion and clothing e-commerce platform.

The Shop Page should allow customers to explore, search, filter, sort, and discover clothing products through an intuitive and visually attractive shopping experience.

The design must maintain consistency with the previously developed ibtu Home Page.

**Important:** This is the second development phase of the ibtu e-commerce platform. Do not redesign the Home Page or change its existing design system, navigation, footer, branding, or reusable components.

Build only the Shop / Product Catalog Page and its necessary supporting components.

## 2. Technology Stack

Use the existing project technologies:

- React.js with Vite.
- Tailwind CSS.
- Lucide React for icons.
- React Router for navigation.
- Framer Motion for subtle animations.
- React Context API for shared cart and wishlist state.

Use reusable components and maintain a clean, scalable project structure.

Do not introduce unnecessary libraries.

## 3. Brand Identity and Design System

Strictly follow the ibtu brand colors.

| Color | Hex | Usage |
|---|---|---|
| Forest Green | #103321 | Main headings, navbar, buttons, accents |
| Lime Green | #95C623 | Active filters, badges, CTA buttons |
| White | #FFFFFF | Product cards and content backgrounds |
| Soft Off-White | #F8F9FA | Main page background |
| Dark Text | #1A1A1A | Product names and descriptions |

Design direction:

- Premium Ethiopian fashion e-commerce aesthetic.
- Clean and minimalist layout.
- Professional typography.
- Consistent spacing.
- High-quality fashion photography.
- Subtle shadows and rounded corners.
- Smooth transitions and hover effects.

The Shop Page must look like a natural continuation of the existing ibtu Home Page.

## 4. Shop Page Layout

### Section 1: Existing Global Navigation

Reuse the existing Home Page components:

- Announcement Bar.
- Sticky Navigation Bar.
- ibtu Logo.
- Navigation Links.
- Search Icon.
- Wishlist Icon.
- Shopping Cart Icon.
- Customer Account Icon.

Do not create a separate navigation design.

Ensure the active Shop navigation item is visually highlighted.

### Section 2: Shop Hero / Page Header

Create a compact and elegant Shop Page header.

Suggested content:

Small label:
"DISCOVER YOUR STYLE"

Main heading:
"Explore Our Collection"

Description:
"Discover beautiful Ethiopian fashion, timeless traditional clothing, and modern styles designed to celebrate your identity."

Include:
- Breadcrumb navigation: Home / Shop.
- Optional collection background image.
- Total product count.
- Subtle decorative Ethiopian-inspired pattern.

Keep this section relatively compact so customers can quickly access products.

### Section 3: Category Quick Navigation

Below the page header, create horizontally arranged category cards or category tabs.

Categories:

1. All Products.
2. Men's Fashion.
3. Women's Fashion.
4. Habesha Kemis.
5. Traditional Wear.
6. Accessories.

Design:
- Small category images or icons.
- Clear category labels.
- Active category highlighted using lime green.
- Horizontal scrolling on mobile.

Interactions:
- Clicking a category filters the displayed products.
- Active category state updates immediately.
- Include an All Products option to reset the category filter.

### Section 4: Main Product Catalog Layout

Create a two-column desktop layout.

LEFT SIDE: FILTER SIDEBAR

RIGHT SIDE: PRODUCT DISPLAY AREA

On desktop:
- Filter sidebar approximately 250px wide.
- Product section takes the remaining available width.
- Maintain comfortable spacing between the columns.

On mobile:
- Hide the sidebar by default.
- Provide a prominent Filters button.
- Open filters inside a slide-in drawer or modal.
- Include Apply Filters and Clear All buttons.

### Section 5: Product Filter Sidebar

Create a modern filter sidebar with the following filtering options.

**A. Category Filter**

Use checkboxes or expandable category groups.

- Men.
- Women.
- Habesha Kemis.
- Traditional Wear.
- Accessories.

**B. Price Range**

Include:
- Minimum price.
- Maximum price.
- Interactive range slider.
- Display the selected range in ETB.

Example:
ETB 500 – ETB 5,000.

**C. Size Filter**

Display selectable size pills:

- XS
- S
- M
- L
- XL
- XXL

Active sizes should use forest green or lime green styling.

**D. Color Filter**

Display interactive circular color swatches.

Examples:
- Black.
- White.
- Green.
- Red.
- Blue.
- Gold.
- Brown.

Show the color name when selected or hovered.

**E. Availability**

Checkbox options:
- In Stock.
- Out of Stock.

By default, display only available products.

**F. Product Type**

Options:
- New Arrivals.
- Best Sellers.
- Featured Products.
- Traditional Collection.
- Modern Collection.

**G. Clear Filters**

Include a Clear All button to reset every selected filter.

Important:
All filters must work together. For example, selecting Women, Size M, Green, and a price range should display only products matching all selected conditions.

### Section 6: Product Toolbar

At the top of the product display area, include:

LEFT:
- Showing product results.
- Example: "Showing 1–12 of 48 products."

RIGHT:
- Sort dropdown.
- Grid/List view toggle.
- Mobile filter button.

Sorting options:

1. Featured.
2. Newest First.
3. Price: Low to High.
4. Price: High to Low.
5. Best Selling.
6. Customer Rating.

Interactions:
- Sorting must update product order.
- Grid/List toggle changes the product presentation.
- Product result count updates according to filters.
- Maintain selected filters when sorting or changing views.

### Section 7: Product Grid

Create a premium product grid.

Desktop:
- Four products per row on large screens.
- Three products per row on medium screens.
- Two products per row on mobile.

Each product card must contain:

1. Product image.
2. Product name.
3. Current price in ETB.
4. Previous price when discounted.
5. Discount percentage badge when applicable.
6. New Arrival or Best Seller badge where appropriate.
7. Wishlist heart button.
8. Quick View button.
9. Available color indicators.
10. Available size information.
11. Add to Cart button.

Design:
- White product cards.
- Consistent image aspect ratio.
- High-quality product photography.
- Rounded corners.
- Subtle shadow on hover.
- Smooth image zoom.
- Clean typography.
- Lime green accents for important actions.

Interactions:

**Wishlist**
- Clicking the heart adds or removes the product from the wishlist.
- Update the global wishlist count.
- Maintain wishlist state using the existing WishlistContext.

**Quick View**
- Open a product preview modal.
- Display product image, name, description, price, available sizes, colors, and stock.
- Allow customers to select a size and color.
- Include an Add to Cart button.

**Add to Cart**
- Allow customers to select a product variant.
- Update the shared cart state.
- Update the cart count in the existing navigation bar.
- Display a small success notification.

**Product Details**
- Clicking the product image or title navigates to the Product Details page.
- Use React Router and pass the product ID or slug.

Important:
Do not allow customers to add a product without selecting its required size and color.

### Section 8: Pagination / Load More

Implement a modern pagination system.

Options:
- Previous.
- Page numbers.
- Next.

Alternatively, implement a Load More Products button.

Requirements:
- Display 12 products initially.
- Load the next group of products when requested.
- Preserve active filters and sorting.
- Update the result count.
- Avoid unnecessary page reloads.

Choose pagination as the default for the catalog.

### Section 9: Empty Results State

When no products match the selected filters, display a friendly empty state.

Suggested heading:
"No Products Found"

Description:
"We couldn't find products matching your selected filters. Try adjusting your search or clearing some filters."

Include:
- Search or filter illustration.
- Clear All Filters button.
- Return to All Products action.

### Section 10: Recently Viewed Products

At the bottom of the catalog, optionally include:

Heading:
"Recently Viewed"

Display up to four previously viewed products.

Use localStorage for the initial frontend implementation.

Only display this section when there are recently viewed products.

### Section 11: Existing Footer

Reuse the exact footer component from the Home Page.

Do not redesign or duplicate the footer.

Maintain consistency in:
- Background color.
- Typography.
- Social media links.
- Navigation links.
- Contact information.
- Copyright section.

## 5. Global Shopping Interactions

The Shop Page must be functional, not just a static UI design.

Implement:

- Category filtering.
- Price filtering.
- Size filtering.
- Color filtering.
- Availability filtering.
- Product type filtering.
- Multiple filters simultaneously.
- Sorting.
- Grid/List view switching.
- Wishlist actions.
- Quick View modal.
- Variant selection.
- Add to Cart.
- Product navigation.
- Pagination.
- Mobile filter drawer.
- Recently viewed products.
- Toast notifications.

Persist appropriate shopping state using the existing Context API and localStorage.

Ensure the Shop Page shares cart and wishlist state with the Home Page.

## 6. Sample Product Data

Use realistic Ethiopian fashion products for the initial frontend prototype.

Example products:

1. Premium White Habesha Kemis — ETB 3,500.
2. Traditional Men's Habesha Shirt — ETB 2,200.
3. Modern Green Habesha Dress — ETB 4,500.
4. Ethiopian Traditional Scarf — ETB 850.
5. Men's Casual Cotton Shirt — ETB 1,500.
6. Women's Traditional White Dress — ETB 3,200.
7. Embroidered Cultural Jacket — ETB 2,800.
8. Premium Traditional Accessories — ETB 1,200.

Each product should have:

- Unique ID.
- Product title.
- Slug.
- Category.
- Description.
- Price.
- Previous price where applicable.
- Images.
- Available sizes.
- Available colors.
- Stock quantity.
- Rating.
- Review count.
- Featured status.
- New Arrival status.
- Best Seller status.

Keep the mock product data in a separate file so it can later be replaced with MySQL-backed API data.

## 7. Component Architecture

Reuse existing Home Page components wherever possible.

Suggested structure:

src/
  components/
    shop/
      ShopHeader.jsx
      CategoryNavigation.jsx
      FilterSidebar.jsx
      MobileFilterDrawer.jsx
      PriceRangeFilter.jsx
      SizeFilter.jsx
      ColorFilter.jsx
      AvailabilityFilter.jsx
      ProductToolbar.jsx
      ProductGrid.jsx
      ProductList.jsx
      Pagination.jsx
      EmptyProductsState.jsx
      RecentlyViewed.jsx
    product/
      ProductCard.jsx
      QuickViewModal.jsx
      ProductBadge.jsx
      WishlistButton.jsx
    common/
      SectionHeading.jsx
      Toast.jsx
      Breadcrumb.jsx

  context/
    CartContext.jsx
    WishlistContext.jsx

  data/
    products.js
    categories.js

  pages/
    HomePage.jsx
    ShopPage.jsx

  App.jsx

You may adjust the structure to match the existing project.

Do not duplicate components that already exist.

## 8. Responsive Design

Desktop:
- Spacious product catalog.
- Persistent filter sidebar.
- Four-column product grid.
- Comfortable product card dimensions.

Tablet:
- Collapsible or narrower filters.
- Two or three product columns depending on width.

Mobile:
- Compact header.
- Horizontal category navigation.
- Filter drawer.
- Two-column product grid where practical.
- Full-width or compact product actions.
- Touch-friendly controls.
- No horizontal page overflow.

Test the layout at common mobile, tablet, and desktop widths.

## 9. Performance and Accessibility

- Lazy-load product images.
- Use optimized image formats.
- Avoid unnecessary React re-renders.
- Use semantic HTML.
- Add accessible labels to controls.
- Support keyboard navigation.
- Ensure modals and drawers can be closed with Escape.
- Maintain readable contrast.
- Show loading, empty, and error states where appropriate.

## 10. Development Scope and Restrictions

For this phase:

- Build only the Shop / Product Catalog Page.
- Reuse the existing Home Page layout and design system.
- Use local mock product data.
- Implement frontend interactions.
- Use localStorage for initial persistence.
- Do not create a new backend.
- Do not modify the MySQL schema.
- Do not implement real payment processing.
- Do not modify existing authentication functionality.
- Do not break existing Home Page features.
- Do not change the global navbar, footer, cart context, or wishlist context unnecessarily.

Prepare the code for future integration with the planned Node.js, Express.js, MySQL, and JWT backend.

## 11. Final Expected Result

Deliver a premium, modern, responsive, fully interactive Shop / Product Catalog Page for ibtu.

The final result should provide a professional fashion-shopping experience with:

- A beautiful product catalog.
- Advanced filtering.
- Multiple sorting options.
- Responsive product cards.
- Functional wishlist and cart interactions.
- Product quick-view functionality.
- Mobile-friendly navigation and filtering.
- Consistent Ethiopian fashion branding.

The Shop Page should feel like a natural continuation of the existing ibtu Home Page, not a separate website.

**Before finishing, verify that all existing Home Page functionality remains intact and that every interactive Shop Page control works correctly.**