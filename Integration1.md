# IBTU – Phase 6, Step 1: API Integration Foundation and Authentication

## Objective

Begin integrating the completed IBTU React frontend with the existing Node.js, Express, and MariaDB backend.

This step establishes the shared API communication architecture and connects the authentication system to the real backend.

**This is an integration task, not a redesign task.** Preserve the existing frontend design, components, pages, routes, and user experience.

---

## 1. Inspect the Existing Projects Before Making Changes

Before writing code, inspect:

### Frontend
- React + Vite project structure.
- Existing `AuthContext` and authentication-related contexts.
- Login, Register, Forgot Password, and Reset Password pages.
- `ProtectedRoute` and role-based route protection.
- Existing API utilities or Axios configuration.
- Existing environment variables.
- Existing mock authentication and user data.
- Existing Admin and Customer layouts.

### Backend
Inspect the actual backend implementation, including:
- Authentication routes.
- Authentication controllers and services.
- Login and registration validation.
- JWT generation and verification.
- `/api/auth/me` implementation.
- Logout implementation, if available.
- User response structure.
- Role and permission response structure.
- Error response format.
- CORS configuration.
- Existing automated tests.

### Important

The previous integration audit identified these endpoints as Class A:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

However, verify their actual implementation and request/response structures before connecting them.

Do not assume the endpoints work exactly as documented in the audit.

---

## 2. Create a Centralized API Client

Create or improve a centralized API communication layer.

Suggested structure (adapt to the existing project):

```text
src/
  services/
    api/
      apiClient.js
      authApi.js
      apiErrorHandler.js
  config/
    apiConfig.js
```

Requirements:

1. Use Axios if it is not already installed.
2. Create one reusable Axios instance.
3. Read the backend URL from a Vite environment variable.
4. Configure request and response interceptors.
5. Add a consistent timeout.
6. Handle network errors.
7. Handle HTTP errors consistently.
8. Handle expired or invalid authentication tokens.
9. Avoid duplicating API configuration across components.

Example environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Use the actual backend port and configuration discovered during inspection.

Create an `.env.example` file if appropriate.

Do not commit real secrets or environment-specific credentials.

---

## 3. Implement Authentication API Services

Create an authentication service that communicates with the real backend.

Support:

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

Implement these functions according to the actual backend contract:

- registerUser()
- loginUser()
- getCurrentUser()
- logoutUser() — only if supported by the backend.

Requirements:

- Match the backend request field names.
- Match the backend response structure.
- Handle validation errors.
- Handle duplicate email or phone errors.
- Handle invalid credentials.
- Handle inactive accounts.
- Handle network failures.
- Never return fake successful authentication responses.
- Never create fake user accounts in frontend state.

Do not invent additional backend endpoints.

---

## 4. Connect the Existing AuthContext

Integrate the real authentication service with the existing `AuthContext`.

The context should manage:

- Current authenticated user.
- Authentication status.
- Loading state.
- Login.
- Registration.
- Logout.
- Session restoration.
- Authentication errors.

On application startup:

1. Check whether an existing authentication session is available.
2. Restore the session using the backend-supported authentication mechanism.
3. Call `/auth/me` when appropriate.
4. Populate the current user from the real backend response.
5. Clear invalid or expired authentication state.
6. Avoid displaying protected pages before authentication initialization finishes.

Important security requirements:

- Do not trust user roles or permissions stored in localStorage as authorization evidence.
- Do not store passwords.
- Do not expose JWTs in application logs.
- Prefer secure, HttpOnly cookies if the backend already supports them.
- If the current backend uses bearer tokens, inspect its existing design and implement a compatible approach. Do not pretend browser localStorage provides HttpOnly-cookie security.
- Do not change backend authentication architecture in this step without explaining the requirement and obtaining approval.

---

## 5. Integrate the Existing Authentication Pages

Connect the existing pages to real authentication.

### Login
- Submit credentials to the backend.
- Display loading feedback.
- Display backend validation and authentication errors.
- On success, populate AuthContext.
- Redirect according to the existing route and role logic.
- Preserve the existing visual design.

### Register
- Submit registration information to the backend.
- Match the actual backend validation rules.
- Display field-level errors where possible.
- Display duplicate email/phone errors.
- Do not automatically claim that an account is verified unless the backend confirms it.

### Forgot Password and Reset Password
The audit identified password-reset functionality as a missing backend capability.

Therefore:

- Inspect the actual backend before connecting these pages.
- Do not simulate sending a real reset email.
- Do not generate fake reset tokens.
- Do not claim a password has been changed when no backend operation exists.
- Preserve the existing frontend pages.
- Clearly report that password-reset integration remains blocked if the required backend endpoints do not exist.

Do not implement new password-reset backend functionality in this step.

---

## 6. Review Protected Routes and Role-Based Access

Connect the existing `ProtectedRoute` to the real authentication state.

Requirements:

- Unauthenticated users cannot access protected customer or admin pages.
- Authenticated customers cannot access admin-only pages.
- Admin and Data Encoder access must follow the actual backend permission model.
- Do not hardcode permissions that contradict the backend.
- Handle authentication initialization without redirect loops.
- Preserve the current redirect-after-login behavior where supported.

Review both customer and admin route protection.

---

## 7. Remove Mock Authentication from the Active Flow

Identify mock authentication code that conflicts with real authentication.

Requirements:

- Stop using mock login success.
- Stop using mock registration success.
- Stop creating fake authenticated users.
- Keep unrelated mock data for modules that have not yet been integrated.
- Do not delete useful mock datasets needed by upcoming integration steps.
- Do not unnecessarily rewrite the entire state management architecture.

Clearly separate real authentication data from remaining mock e-commerce data.

---

## 8. Error Handling and User Experience

Implement consistent user-facing behavior for:

| Situation | Expected behavior |
|---|---|
| Invalid credentials | Display a friendly error |
| Duplicate email | Display a clear validation message |
| Duplicate phone | Display a clear validation message |
| Network unavailable | Show connection error |
| Server error | Show a general error without exposing internals |
| Expired session | Clear invalid session and redirect appropriately |
| Loading | Show loading feedback |
| Successful login | Update authentication state and redirect |

Never expose stack traces, SQL errors, JWT secrets, or internal server details to users.

---

## 9. Testing Requirements

Run the following checks.

### Frontend
- Register with valid data.
- Register with invalid data.
- Login with valid credentials.
- Login with invalid credentials.
- Reload the browser after login.
- Test session restoration.
- Logout and verify protected pages are inaccessible.
- Test Customer access.
- Test Admin access.
- Test Data Encoder access according to actual permissions.
- Test network failure handling.

### Backend
Run the existing automated test suites.

Do not merely confirm that the test files still exist. Execute the tests and report the actual results.

Do not modify unrelated backend functionality.

### Build
Run:

```bash
npm run build
```

Also run the available frontend lint and test commands.

Fix issues introduced by this step without changing unrelated modules.

---

## 10. Strict Scope Restrictions

This step covers ONLY:

- API client foundation.
- Environment configuration.
- Authentication API service.
- AuthContext integration.
- Login integration.
- Registration integration.
- Session restoration.
- Logout, if supported.
- Protected routes and authentication-related role checks.

Do NOT integrate:

- Product catalog.
- Categories.
- Cart.
- Wishlist.
- Customer addresses.
- Checkout.
- Payments.
- Orders.
- Shipments.
- Coupons.

Do NOT:
- Change the database schema.
- Add new database tables.
- Invent backend endpoints.
- Redesign existing frontend pages.
- Remove unrelated mock data.
- Introduce unnecessary dependencies.
- Change the backend authentication architecture without approval.

---

## 11. Final Checkpoint Report

After implementation, provide a detailed report containing:

1. Files inspected.
2. Files created.
3. Files modified.
4. API endpoints verified and connected.
5. Authentication request/response structures.
6. AuthContext changes.
7. Session persistence approach.
8. Protected-route behavior.
9. Customer/Admin/Data Encoder access test results.
10. Password-reset integration status.
11. Backend test results.
12. Frontend build results.
13. Remaining errors or limitations.
14. Confirmation that unrelated modules were not changed.

**Important:** Do not proceed to Step 2 automatically.

Stop after completing this step and wait for approval.

The next task will be:

**Phase 6 – Step 2: Product Catalog and Category API Integration.**