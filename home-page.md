# Project: IBTU (ሀበሻን ጥበብ) — Modern E-Commerce Home Page

## 1. Project Overview

Design and develop a modern, premium, fully responsive Home Page for **ibtu (ሀበሻን ጥበብ)**, an Ethiopian clothing and fashion e-commerce platform.

The website should combine contemporary e-commerce design with Ethiopian cultural fashion identity.

The overall experience should feel:
- Modern and premium.
- Clean, elegant, and professional.
- Culturally inspired by Ethiopian fashion.
- Easy to navigate.
- Visually attractive without unnecessary decorations.
- Responsive across desktop, tablet, and mobile devices.

**Important:** Build only the Home Page in this phase. Do not implement the entire e-commerce application yet.

## 2. Technology Stack

Use the following technologies:

- React.js with Vite.
- Tailwind CSS for styling.
- Lucide React for icons.
- React Router for navigation.
- Framer Motion for smooth animations and transitions.
- React Context API or an appropriate state-management approach for interactive UI components.

Use reusable React components and a clean, organized project structure.

Do not introduce unnecessary UI libraries.

## 3. Brand Identity and Color System

Follow the official ibtu brand identity strictly.

| Color | Hex | Usage |
|---|---|---|
| Primary Forest Green | #103321 | Navbar, footer, hero backgrounds, headings |
| Accent Lime Green | #95C623 | CTA buttons, badges, active states, highlights |
| White | #FFFFFF | Cards, navigation text, content sections |
| Soft Off-White | #F8F9FA | Main backgrounds and section backgrounds |
| Dark Text | #1A1A1A | Body text and descriptions |

Use the forest green and lime green as the dominant brand colors.

Avoid introducing unrelated colors that weaken the brand identity.

## 4. Home Page Layout and Sections

### Section 1: Announcement Bar

Create a slim announcement bar at the very top.

Design:
- Lime green background (#95C623).
- Dark text.
- Small delivery truck icon.
- Announcement: "Free Shipping on Orders Over 2000 ETB!"
- Optional links: About, Contact, FAQ.
- Language selector: EN / AM.

Interactions:
- Language selector opens a dropdown.
- Announcement should remain visually compact.
- All elements should adapt to smaller screens.

### Section 2: Main Navigation Bar

Create a sticky navigation bar with a dark forest green background.

Left:
- ibtu logo.
- Ethiopian-inspired brand symbol.
- Brand name "ibtu".
- Amharic brand text.

Center:
- Home.
- Shop.
- Categories dropdown.
- About.
- Contact.

Right:
- Search icon.
- Wishlist icon.
- Shopping cart icon with a dynamic item count.
- Customer account/profile icon.

Interactions:
- Sticky navigation while scrolling.
- Shop and Categories dropdown menus.
- Search icon opens an expandable search field or search overlay.
- Wishlist navigates to the wishlist page.
- Cart icon opens a right-side cart drawer.
- Account icon opens a login/register dropdown.
- Mobile navigation uses a hamburger menu with a slide-in panel.
- Smooth hover effects and active navigation indicators.

### Section 3: Hero Banner

Create a visually impressive full-width hero section.

Design:
- Deep forest green background (#103321).
- Large, high-quality Ethiopian fashion photography.
- Feature models wearing beautiful modern Habesha clothing.
- Use subtle Ethiopian-inspired geometric patterns as decorative background elements.
- Strong visual hierarchy.
- Elegant typography.

Suggested content:

Small label:
"DISCOVER ETHIOPIAN FASHION"

Main heading:
"Tradition Meets Modern Elegance."

Description:
"Celebrate the beauty of Ethiopian fashion with timeless designs, authentic cultural inspiration, and contemporary style."

Primary CTA:
"Shop Collection"

Secondary CTA:
"Explore Our Story"

Visual direction:
- Large fashion photography positioned on the right.
- Text content on the left.
- Lime green CTA button.
- Subtle decorative patterns.
- Balanced whitespace.
- Avoid excessive gradients and unnecessary visual effects.

Interactions:
- Primary CTA navigates to the Shop page.
- Secondary CTA navigates to About.
- Smooth entrance animations.
- Subtle image movement or hover effects.

### Section 4: Shop by Category

Create a modern category section.

Heading:
"Explore Our Collections"

Description:
"Find your style from our carefully selected fashion collections."

Display four or five category cards:

1. Men's Collection.
2. Women's Collection.
3. Habesha Kemis.
4. Traditional Wear.
5. Accessories.

Design:
- High-quality category photographs.
- Rounded corners.
- Elegant category titles.
- Subtle dark image overlays.
- Hover image zoom effects.
- Lime green accent details.

Interactions:
- Each category card navigates to the Shop page with its corresponding category filter.
- Smooth hover animations.
- Responsive grid layout.

### Section 5: New Arrivals

Heading:
"New Arrivals"

Description:
"Discover the latest additions to our fashion collection."

Display four product cards per row on desktop.

Each product card should contain:
- Product image.
- Product name.
- Current price in ETB.
- Optional previous price.
- New Arrival badge.
- Wishlist heart icon.
- Quick View button.
- Add to Cart button.

Interactions:
- Wishlist toggles its selected state.
- Quick View opens a product preview modal.
- Add to Cart updates the cart count.
- Product image and title navigate to Product Details.
- Add subtle card hover animations.

Use realistic sample Ethiopian fashion products and ETB prices.

### Section 6: Promotional Banner

Create a visually engaging promotional section.

Suggested heading:
"Celebrate Your Style. Embrace Your Heritage."

Description:
"Discover unique fashion pieces inspired by the beauty of Ethiopian culture."

CTA:
"Explore the Collection"

Design:
- Forest green background.
- Lime green accent typography.
- Fashion photography.
- Decorative Ethiopian-inspired patterns.
- Elegant composition.

### Section 7: Best Sellers

Heading:
"Our Best Sellers"

Description:
"Customer favorites, selected for their exceptional style."

Display four product cards per row on desktop.

Use the same reusable product card component created for New Arrivals.

Include:
- Best Seller badge.
- Product images.
- Product names.
- ETB pricing.
- Wishlist functionality.
- Quick View.
- Add to Cart.

Include a "View All Products" button.

### Section 8: Why Choose ibtu?

Create a clean section highlighting the platform's benefits.

Use four feature cards:

1. Authentic Ethiopian Fashion.
2. Quality and Craftsmanship.
3. Secure Shopping.
4. Reliable Delivery.

Use Lucide icons with lime green accents.

Each card should contain a short description and a simple icon.

### Section 9: Newsletter Subscription

Create a newsletter subscription section.

Heading:
"Stay Inspired with ibtu"

Description:
"Subscribe to receive new collection updates, exclusive offers, and fashion inspiration."

Elements:
- Email input.
- Subscribe button.
- Email validation.
- Success and error messages.

Use a clean white or soft off-white background with forest green typography.

### Section 10: Footer

Create a comprehensive footer using a dark forest green background.

Include:

Brand column:
- ibtu logo.
- Short brand description.
- Social media icons.

Quick Links:
- Home.
- Shop.
- About.
- Contact.
- FAQ.

Customer Service:
- Shipping Information.
- Returns and Exchanges.
- Size Guide.
- Privacy Policy.
- Terms and Conditions.

Contact Information:
- Email.
- Phone.
- Location.

Bottom section:
- Copyright notice.
- Payment method icons or labels.
- Privacy and terms links.

Use white typography and lime green hover states.

## 5. Floating AI Shopping Assistant

Add a floating AI assistant button at the bottom-right corner.

Design:
- Circular lime green button.
- AI/chat icon.
- Subtle floating animation.
- Fixed position.
- Responsive placement.

Interactions:
- Clicking opens a right-side chat drawer.
- Drawer includes a welcome message.
- Display suggested questions:
  - "Help me choose an outfit."
  - "What sizes are available?"
  - "Recommend Habesha clothing."
  - "Find products under 2000 ETB."
- Include a message input and send button.
- Add close and minimize functionality.

For this phase, use mock responses and sample product recommendations. Prepare the component structure for future Gemini API integration.

## 6. Global Interactivity Requirements

The Home Page must not be a static mockup.

Implement functional frontend interactions for:

- Sticky navigation.
- Mobile navigation.
- Dropdown menus.
- Search overlay.
- Cart drawer.
- Wishlist toggles.
- Product quick-view modal.
- Add-to-cart actions.
- Dynamic cart count.
- Newsletter validation.
- Language selector UI.
- AI assistant drawer.
- Smooth scrolling.
- Responsive animations.

Use local sample data for products and categories.

Persist cart and wishlist state using localStorage for the initial frontend prototype.

## 7. Design and UX Requirements

Follow these design principles:

- Premium fashion e-commerce aesthetic.
- Consistent spacing and typography.
- Clean alignment and visual hierarchy.
- Large, high-quality product photographs.
- Consistent button styles.
- Subtle shadows.
- Rounded product cards.
- Smooth transitions.
- Accessible color contrast.
- Mobile-first responsive layout.

Avoid:
- Overcrowded sections.
- Excessive animations.
- Too many gradients.
- Unnecessary decorative icons.
- Inconsistent spacing.
- Generic fashion imagery that does not represent the Ethiopian clothing brand.

## 8. React Component Architecture

Organize the Home Page using reusable components.

Suggested structure:

src/
  components/
    layout/
      AnnouncementBar.jsx
      Navbar.jsx
      Footer.jsx
      MobileMenu.jsx
    home/
      HeroSection.jsx
      CategorySection.jsx
      CategoryCard.jsx
      NewArrivals.jsx
      BestSellers.jsx
      PromotionalBanner.jsx
      WhyChooseUs.jsx
      Newsletter.jsx
    product/
      ProductCard.jsx
      ProductGrid.jsx
      QuickViewModal.jsx
    cart/
      CartDrawer.jsx
    wishlist/
      WishlistButton.jsx
    ai/
      AIChatButton.jsx
      AIChatDrawer.jsx
    common/
      Button.jsx
      SectionHeading.jsx
      LoadingSpinner.jsx
  context/
    CartContext.jsx
    WishlistContext.jsx
  data/
    products.js
    categories.js
  pages/
    HomePage.jsx
  assets/
  App.jsx
  main.jsx

You may improve this structure when necessary, but keep components reusable and responsibilities clearly separated.

## 9. Performance and Accessibility

- Optimize image sizes and loading.
- Use lazy loading for images below the hero.
- Avoid unnecessary React re-renders.
- Use semantic HTML.
- Provide alt text for images.
- Ensure keyboard accessibility for interactive components.
- Make dropdowns and modals accessible.
- Ensure responsive layouts on mobile, tablet, and desktop.

## 10. Development Scope and Important Instructions

Build only the Home Page and its supporting reusable UI components.

Do not implement:
- Backend APIs.
- MySQL integration.
- JWT authentication.
- Actual payment processing.
- Admin dashboard.
- Product management backend.
- Actual Gemini API integration.

Use mock data and frontend state for now.

However, organize the code so that future integration with the existing planned Node.js, Express.js, MySQL, JWT, and Gemini architecture will be straightforward.

**Final Expected Result:**

A premium, modern, fully responsive Ethiopian fashion e-commerce Home Page for ibtu, with a consistent forest green and lime green brand identity, beautiful fashion imagery, organized sections, functional frontend interactions, and clean reusable React components.