# IBTU – Customer Authentication Phase (Login & Create Account)

## Project Context

I am developing **IBTU (ሀበሻን ጥበብ)**, a modern Ethiopian clothing e-commerce platform.

The frontend uses:
- React + Vite
- Tailwind CSS
- React Router
- Lucide React icons
- Framer Motion
- Context API

The backend will be developed later using Node.js, Express, MySQL, JWT, and bcrypt.

### Brand Identity

Maintain the existing IBTU design system:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Soft Off-White: `#F8F9FA`
- Dark Text: `#1A1A1A`

Design direction: premium, elegant, clean, modern Ethiopian fashion identity. The authentication pages must look consistent with the existing Home, Shop, and Product Details pages.

---

## 1. Development Objective

Build the following customer authentication pages:

1. Customer Login Page
2. Customer Create Account Page
3. Forgot Password Page
4. Reset Password Page (frontend UI prepared for future backend integration)

Build only these authentication pages and their supporting components. Do not redesign the existing website.

## 2. Login Page

Create a modern, responsive login page.

### Layout

Use a two-column layout on desktop:

**Left Section**
- Attractive Ethiopian fashion lifestyle image.
- Forest-green overlay where appropriate.
- IBTU brand message:
  - "Welcome Back to IBTU"
  - "Discover authentic Ethiopian fashion and shop your favorite styles."
- Elegant visual presentation.

**Right Section**
- IBTU logo.
- Heading: "Welcome Back"
- Supporting text: "Sign in to continue your shopping experience."
- Email address input.
- Password input with show/hide password functionality.
- Remember Me checkbox.
- Forgot Password link.
- Sign In button.
- Link to Create Account.

### Login Functionality

- Validate required fields.
- Validate email format.
- Display appropriate validation messages.
- Toggle password visibility.
- Show loading state when submitting.
- Display success and error notifications.
- Include a mock authentication service for frontend testing.
- Redirect successfully authenticated customers to the appropriate page, such as Home or their account dashboard.

## 3. Customer Create Account Page

Create a matching registration page with the same visual identity.

### Layout

Use the same two-column design system as the login page.

### Registration Form

Include:

- First Name
- Last Name
- Email Address
- Phone Number
- Password
- Confirm Password
- Agree to Terms and Conditions checkbox
- Create Account button
- Link to Login page

### Registration Functionality

- Validate all required fields.
- Validate email format.
- Validate phone number format.
- Enforce reasonable password requirements.
- Confirm that Password and Confirm Password match.
- Prevent submission if Terms and Conditions are not accepted.
- Show clear validation messages.
- Include show/hide password controls.
- Display loading, success, and error states.
- After successful mock registration, redirect the customer to the appropriate page.

**Important account-management requirement:**

This is a public customer registration page. Only customers can create accounts here.

Do not include:
- Admin registration
- Data Encoder registration
- Staff registration
- Role selection dropdown
- Account type selection
- Any option that allows customers to choose an administrative role

Admin and Data Encoder accounts must be created and managed separately inside the protected Admin Dashboard. Never expose staff account creation through public customer registration.

## 4. Forgot Password Page

Create a simple and elegant forgot-password page.

Include:
- Heading: "Forgot Your Password?"
- Short explanatory message.
- Email address input.
- Send Reset Link button.
- Back to Login link.

Functionality:
- Validate the email address.
- Display a confirmation message after mock submission.
- Prepare the page for future email-based password reset integration.

## 5. Reset Password Page

Create a reset-password interface prepared for future backend integration.

Include:
- New Password
- Confirm New Password
- Show/hide password controls
- Reset Password button
- Back to Login link

Validate password requirements and ensure both password fields match.

For now, use mock functionality rather than implementing real email tokens or password updates.

## 6. Authentication Design Components

Create reusable components where appropriate:

- AuthLayout
- AuthBrandPanel
- AuthInput
- PasswordInput
- AuthButton
- AuthFormHeader
- AuthDivider (only if needed)
- AuthNotification
- PasswordStrengthIndicator

Avoid unnecessary component duplication.

## 7. Authentication State Management

Create a simple frontend authentication context.

Suggested structure:

- `AuthContext`
- `AuthProvider`
- `useAuth`
- `authService`

The authentication context should support:

- `login()`
- `register()`
- `logout()`
- `isAuthenticated`
- `user`
- `loading`

For this frontend phase, use mock customer data and localStorage to simulate authentication.

Important:
- Do not store plain-text passwords in localStorage.
- Do not treat frontend mock authentication as production security.
- Keep the authentication service separate from the UI so it can later be replaced with real API requests.
- Do not implement JWT authentication yet.

## 8. Routing

Create or update authentication routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Ensure navigation between these pages works correctly.

Add basic route protection where appropriate:

- Authenticated customers should not need to revisit Login or Register unnecessarily.
- Unauthenticated users should not access protected customer account pages.
- Preserve the user's intended destination when redirecting to Login, if practical.

Do not break existing Home, Shop, or Product Details routes.

## 9. Integration With Existing IBTU Pages

Make authentication work consistently with the existing website.

### Navbar Integration

Update only the necessary account-related behavior:

- Clicking the account icon should open the appropriate account menu.
- Unauthenticated users should see Login and Create Account links.
- Authenticated customers should see My Account, My Orders, and Logout.
- Preserve the existing navbar design and other functionality.

### Shopping Integration

- Preserve existing CartContext and WishlistContext.
- Do not clear cart or wishlist data when a customer logs out.
- Prepare the application to associate shopping data with customer accounts in the future.
- Do not change existing product or variant logic.

## 10. Responsive Design

Ensure all authentication pages work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

On smaller screens:
- Use a single-column layout.
- Reduce unnecessary spacing.
- Keep forms easy to use.
- Ensure buttons and inputs have comfortable touch sizes.
- Avoid horizontal scrolling.

## 11. Project Structure

Follow the existing project structure where possible.

Suggested organization:

```text
src/
├── components/
│   └── auth/
│       ├── AuthLayout.jsx
│       ├── AuthInput.jsx
│       ├── PasswordInput.jsx
│       ├── AuthButton.jsx
│       └── AuthNotification.jsx
│
├── pages/
│   └── auth/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── ForgotPassword.jsx
│       └── ResetPassword.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── services/
│   └── authService.js
│
└── routes/
    └── ProtectedRoute.jsx
```

Adapt this structure to the existing project instead of duplicating files or creating unnecessary folders.

## 12. Important Development Rules

1. Inspect the existing project before making changes.
2. Reuse the existing colors, typography, spacing, buttons, and design conventions.
3. Reuse the existing Navbar and Footer where appropriate.
4. Do not redesign or break the Home page.
5. Do not change the Shop page.
6. Do not change the Product Details page.
7. Do not change existing product, cart, or wishlist functionality.
8. Do not introduce a new UI framework.
9. Use reusable React components.
10. Use mock authentication only for this development phase.
11. Keep the code clean, organized, and maintainable.
12. Do not implement backend APIs, MySQL changes, JWT, real email services, or payment integration yet.

## Expected Result

Deliver a complete, responsive customer authentication experience for IBTU, including Login, Customer Registration, Forgot Password, and Reset Password pages.

The result should feel like a natural part of the existing premium Ethiopian fashion e-commerce website, not a separate application.

Before finishing, test all authentication forms, validation rules, route navigation, mock login/logout behavior, and integration with the existing navbar and shopping functionality.