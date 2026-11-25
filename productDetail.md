# Project: IBTU (ሀበሻን ጥበብ) — Product Details Page

## 1. Project Overview

Design and develop a modern, premium, fully responsive Product Details Page for **ibtu**, an Ethiopian clothing and fashion e-commerce platform.

The Product Details Page should provide customers with a complete shopping experience where they can explore individual products, view multiple images, select clothing sizes and colors, check real-time stock availability, and add their preferred product variants to the shopping cart.

The design must be consistent with the existing IBTU Home Page and Shop / Product Catalog Page.

**Important:** Build only the Product Details Page and its necessary supporting components. Do not redesign existing pages or change the established global design system.

## 2. Technology Stack

Use the existing project stack:

- React.js with Vite.
- Tailwind CSS.
- Lucide React for icons.
- React Router for navigation.
- Framer Motion for subtle animations.
- React Context API for shared cart and wishlist state.

Use reusable components and maintain the existing project architecture.

## 3. Brand Identity and Design System

Strictly follow the IBTU brand colors.

| Color | Hex | Usage |
|---|---|---|
| Forest Green | #103321 | Headings, buttons, navigation, accents |
| Lime Green | #95C623 | CTA buttons, active selections, badges |
| White | #FFFFFF | Product cards and content backgrounds |
| Soft Off-White | #F8F9FA | Section backgrounds |
| Dark Text | #1A1A1A | Product descriptions and body text |

Design direction:
- Premium Ethiopian fashion aesthetic.
- Minimalist and elegant layout.
- High-quality product photography.
- Consistent typography and spacing.
- Subtle shadows and rounded corners.
- Smooth interactions and transitions.

## 4. Page Layout and Sections

### Section 1: Existing Global Navigation

Reuse the existing components from the Home Page:

- Announcement Bar.
- Sticky Navbar.
- IBTU Logo.
- Navigation Links.
- Search.
- Wishlist.
- Shopping Cart.
- Customer Account.

Requirements:
- Maintain the existing navigation design.
- Highlight the Shop navigation item.
- Preserve cart and wishlist counts.
- Ensure responsive mobile navigation.

Do not create duplicate navigation components.

### Section 2: Breadcrumb Navigation

Display a breadcrumb above the product content.

Example:

Home / Shop / Women's Collection / Premium White Habesha Kemis

Requirements:
- Each breadcrumb item should be clickable.
- Navigate to the appropriate page or category.
- Use subtle typography.
- Keep the layout compact.

### Section 3: Main Product Information Layout

Create a two-column desktop layout.

LEFT COLUMN:
Product image gallery.

RIGHT COLUMN:
Product information and purchasing options.

On desktop:
- Image gallery occupies approximately 55% of the content width.
- Product information occupies approximately 45%.
- Maintain balanced spacing.

On mobile:
- Display the image gallery first.
- Display product information below.
- Make purchase actions easy to access.

### Section 4: Product Image Gallery

Create a premium product photography gallery.

Include:
- Large main product image.
- Four or more thumbnail images.
- Front view.
- Back view.
- Side view.
- Close-up embroidery or fabric details.
- Zoom functionality.

Interactions:
- Clicking a thumbnail changes the main image.
- Clicking the main image opens a full-screen image viewer.
- Allow navigation between images.
- Support closing the viewer with Escape.
- Provide smooth image transitions.
- Include a favorite/wishlist heart icon.

Use high-quality Ethiopian fashion product photography.

Images should maintain consistent aspect ratios and avoid distortion.

### Section 5: Product Information

Display the following information:

- Product category.
- Product name.
- Product rating.
- Review count.
- Current price in ETB.
- Previous price when discounted.
- Discount percentage badge.
- Short product description.
- Stock availability indicator.
- Product SKU or reference number.

Example:

Category: Women's Traditional Wear

Product Name:
Premium White Habesha Kemis

Price:
ETB 3,500

Previous Price:
ETB 4,000

Rating:
4.8 / 5 (24 Reviews)

Description:
"An elegant traditional Habesha Kemis featuring beautiful Ethiopian-inspired embroidery and carefully selected fabric, designed for special occasions and cultural celebrations."

Stock:
In Stock

Use realistic sample product information.

### Section 6: Color Selection

Create interactive color selection swatches.

Example:
- White.
- Forest Green.
- Black.
- Red.
- Gold.
- Navy Blue.

Requirements:
- Display circular color swatches.
- Highlight the selected color.
- Show the selected color name.
- Update product images when the selected color changes, when variant-specific images exist.
- Disable unavailable color variants.
- Clearly indicate unavailable options.

### Section 7: Size Selection

Create an interactive size selector.

Available sizes:

- XS
- S
- M
- L
- XL
- XXL

Requirements:
- Display sizes as selectable buttons.
- Highlight the selected size.
- Show unavailable sizes as disabled.
- Provide a Size Guide link.
- Require size selection before adding to cart.

### Section 8: Size Guide Modal

Create a professional size guide modal.

Include a measurement table:

| Size | Bust (cm) | Waist (cm) | Length (cm) |
|---|---:|---:|---:|
| XS | 82 | 66 | 135 |
| S | 86 | 70 | 137 |
| M | 90 | 74 | 140 |
| L | 96 | 80 | 142 |
| XL | 102 | 86 | 145 |
| XXL | 108 | 92 | 148 |

Include a short note explaining how customers can measure themselves.

Important: Treat these as illustrative sample measurements. Real measurements must be supplied per product or clothing type.

### Section 9: Quantity Selector

Create a quantity selector with:

- Minus button.
- Quantity display.
- Plus button.

Requirements:
- Minimum quantity is 1.
- Maximum quantity cannot exceed available stock.
- Prevent customers from selecting zero or negative quantities.
- Update the displayed subtotal dynamically.

### Section 10: Add to Cart and Buy Now

Create two prominent purchasing buttons.

Primary CTA:
"Add to Cart"

Secondary CTA:
"Buy Now"

Design:
- Full-width forest green or lime green primary action.
- Clear hover and active states.
- Consistent button height.
- Responsive mobile layout.

Add to Cart interactions:
1. Validate selected size.
2. Validate selected color where applicable.
3. Validate quantity.
4. Check available stock.
5. Add the exact product variant to the shared CartContext.
6. Update the global cart count.
7. Display a success toast notification.
8. Preserve existing cart items.

Buy Now interactions:
- Perform the same validation.
- Add the selected variant to the cart.
- Navigate to the checkout flow or cart, according to the existing application architecture.

Never allow an invalid product configuration to enter the cart.

### Section 11: Product Features and Details

Create a tabbed or accordion information section.

Tabs:

**Description**
- Full product description.
- Design details.
- Fabric information.
- Occasion and styling suggestions.

**Specifications**
- Material.
- Fabric type.
- Available colors.
- Available sizes.
- Product weight where applicable.
- Care instructions.
- Country of origin when verified.

**Shipping and Returns**
- Delivery information.
- Estimated delivery time.
- Shipping fees.
- Return and exchange policies.

Use accessible tabs or accordions with smooth transitions.

Do not invent guaranteed shipping times or return policies. Use clearly marked sample content until actual business policies are provided.

### Section 12: Customer Reviews and Ratings

Create a customer review section.

Include:
- Average product rating.
- Total review count.
- Rating distribution from 5 to 1 stars.
- Customer review cards.
- Reviewer name.
- Review date.
- Star rating.
- Review text.
- Optional customer product images.

Interactions:
- Allow customers to sort reviews.
- Provide a Write a Review button.
- Open a review submission modal.
- Include rating selection and review text.
- Require authentication for submitting a review.
- Use mock review data for the frontend prototype.

### Section 13: Related Products

Create a section titled:

"You May Also Like"

Display four related products using the existing reusable ProductCard component.

Recommendations should be based on:
- Same category.
- Similar price range.
- Related clothing styles.
- Similar customer interests.

Interactions:
- Product cards navigate to their respective Product Details pages.
- Wishlist and Add to Cart must use existing shared contexts.
- Keep the layout consistent with the Shop Page.

### Section 14: Recently Viewed Products

Create an optional recently viewed products section.

Requirements:
- Store recently viewed product IDs in localStorage.
- Display up to four products.
- Avoid displaying the current product in its own recently viewed list.
- Only display the section when products are available.

### Section 15: Existing Footer

Reuse the existing Home Page footer.

Do not redesign or duplicate it.

## 5. Additional Shopping Features

Implement these interactions:

- Product image gallery.
- Image zoom.
- Full-screen image viewer.
- Color selection.
- Size selection.
- Size guide modal.
- Quantity selector.
- Dynamic subtotal.
- Wishlist functionality.
- Add to Cart.
- Buy Now.
- Product information tabs.
- Customer reviews.
- Related products.
- Recently viewed products.
- Toast notifications.
- Mobile responsive layout.

## 6. Data Structure

Use mock product data initially.

The Product Details Page should support a product structure similar to:

{
  id: 1,
  title: "Premium White Habesha Kemis",
  slug: "premium-white-habesha-kemis",
  category: "Women's Traditional Wear",
  description: "Elegant traditional Habesha clothing.",
  price: 3500,
  originalPrice: 4000,
  images: [
    "/images/kemis-front.jpg",
    "/images/kemis-back.jpg",
    "/images/kemis-side.jpg"
  ],
  variants: [
    {
      id: 101,
      sku: "KEMIS-WHT-M",
      size: "M",
      color: "White",
      price: 3500,
      stockQuantity: 12,
      image: "/images/kemis-front.jpg"
    }
  ],
  rating: 4.8,
  reviewCount: 24,
  isFeatured: true
}

Important:
- Product data should be stored separately from UI components.
- Use product IDs or slugs to retrieve products through React Router.
- Treat each size/color combination as an individual variant.
- Cart items must reference the selected variant ID, not just the general product ID.
- Do not assume every product has sizes or colors; support configurable variant attributes.

## 7. Component Architecture

Reuse existing components wherever possible.

Suggested structure:

src/
  components/
    product-details/
      ProductGallery.jsx
      ProductInformation.jsx
      ColorSelector.jsx
      SizeSelector.jsx
      QuantitySelector.jsx
      SizeGuideModal.jsx
      ProductActions.jsx
      ProductTabs.jsx
      ProductReviews.jsx
      ReviewCard.jsx
      RelatedProducts.jsx
      RecentlyViewed.jsx
      ImageLightbox.jsx

  components/
    product/
      ProductCard.jsx
      WishlistButton.jsx

  pages/
    ProductDetailsPage.jsx

  data/
    products.js
    reviews.js

  context/
    CartContext.jsx
    WishlistContext.jsx

You may adapt the structure to the existing project. Do not duplicate existing shared components.

## 8. Responsive Design Requirements

Desktop:
- Two-column product layout.
- Large image gallery.
- Clear purchasing information.
- Comfortable whitespace.

Tablet:
- Balanced image and information columns.
- Responsive thumbnails.
- Properly sized controls.

Mobile:
- Image gallery at the top.
- Product information below.
- Horizontal thumbnail scrolling.
- Touch-friendly size and color selectors.
- Accessible modals and tabs.
- Optional sticky bottom Add to Cart button.
- No horizontal overflow.

## 9. Performance and Accessibility

- Lazy-load non-primary product images.
- Optimize product photography.
- Prevent layout shifts.
- Use semantic HTML.
- Add accessible labels to buttons.
- Support keyboard navigation.
- Provide image alt text.
- Ensure modal focus management.
- Maintain sufficient contrast.
- Include loading, empty, and error states.

## 10. Development Scope and Restrictions

For this development phase:

- Build only the Product Details Page.
- Reuse the existing Home and Shop components.
- Use local mock product data.
- Use existing CartContext and WishlistContext.
- Use localStorage where appropriate.
- Do not create backend APIs.
- Do not modify the MySQL database.
- Do not implement actual payment processing.
- Do not change existing authentication.
- Do not break existing Home or Shop functionality.

Prepare the implementation for future Node.js, Express.js, MySQL, and JWT integration.

## 11. Final Expected Result

Deliver a modern, premium, fully responsive and interactive IBTU Product Details Page.

Customers should be able to:

- Explore detailed product photographs.
- Zoom and inspect clothing.
- Select colors and sizes.
- View sizing information.
- Choose quantities.
- Check availability.
- Add products to their cart.
- Save products to their wishlist.
- Read customer reviews.
- Discover related products.

The final design must maintain a consistent Ethiopian fashion identity and match the existing IBTU Home Page and Shop Page.

**Before finishing, test all product interactions, variant validation, cart integration, wishlist integration, and responsive layouts. Ensure that existing pages continue working correctly.**