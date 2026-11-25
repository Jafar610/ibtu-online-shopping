# IBTU E-Commerce Backend – Phase 1, Step 4: Authentication and User Management

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack
- Node.js
- Express.js
- MariaDB
- mysql2/promise
- bcryptjs
- jsonwebtoken (JWT)
- RESTful API architecture

### Existing Database

Database name: `ibutu_ecommerce`

The following tables already exist:

- users
- roles
- permissions
- user_roles
- role_permissions

Do not recreate these tables.

## 2. Current Objective

Build a complete and secure authentication system that allows users to:

1. Register an account.
2. Log in.
3. Receive a JWT access token.
4. Access protected API endpoints.
5. View their own profile.
6. Log out using the chosen token/session strategy.

Support three existing account roles:

- Admin
- Data Encoder
- Customer

Important: Public registration must only create Customer accounts. Admin and Data Encoder accounts must be created or assigned through authorized administrative processes.

## 3. Step-by-Step Implementation

### Step 1: Review the Existing Database Structure

Before writing code, inspect the existing tables:

- users
- roles
- user_roles
- permissions
- role_permissions

Verify the actual column names, foreign keys, and role names.

Do not assume the schema. Adapt the backend implementation to the existing database.

### Step 2: Explain Authentication Concepts

Explain in simple English:

- Authentication vs authorization.
- Password hashing.
- bcryptjs.
- JWT.
- Access tokens.
- Middleware.
- Protected routes.
- Role-based access control.

Use practical examples from IBTU.

### Step 3: Create the Authentication Architecture

Use the existing project structure:

```text
src/
├── config/
│   └── database.js
├── controllers/
│   └── auth.controller.js
├── services/
│   └── auth.service.js
├── routes/
│   └── auth.routes.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── validators/
│   └── auth.validator.js
├── utils/
│   ├── api-response.js
│   └── app-error.js
└── app.js
```

Explain the responsibility of each file.

### Step 4: Implement Customer Registration

Endpoint:

`POST /api/auth/register`

Required fields:

- first_name
- last_name
- email
- phone (optional)
- password
- confirm_password

Requirements:

- Validate all required fields.
- Validate email format.
- Validate password strength.
- Confirm password matches.
- Prevent duplicate email addresses.
- Prevent duplicate phone numbers when provided.
- Hash passwords using bcryptjs.
- Insert the new user into the users table.
- Assign the Customer role using the existing roles and user_roles tables.
- Use a database transaction so user creation and role assignment succeed or fail together.
- Never return password_hash in API responses.

### Step 5: Implement Login

Endpoint:

`POST /api/auth/login`

Required fields:

- email
- password

Requirements:

- Find the user by email.
- Verify the password using bcryptjs.
- Reject inactive accounts.
- Load the user's assigned roles.
- Update last_login_at.
- Generate a signed JWT.
- Return the token and safe user information.

Do not return password hashes or sensitive database information.

### Step 6: Implement Authentication Middleware

Create:

`src/middleware/auth.middleware.js`

It should:

- Read the Bearer token from the Authorization header.
- Verify the JWT signature and expiration.
- Identify the authenticated user.
- Confirm the user still exists and is active.
- Attach safe user information to `req.user`.
- Reject invalid or expired tokens.

Use the centralized error-handling system already created.

### Step 7: Implement the Current User Profile

Endpoint:

`GET /api/auth/me`

Requirements:

- Require a valid JWT.
- Return the authenticated user's profile.
- Include assigned roles.
- Never expose password_hash.

### Step 8: Implement Logout Strategy

Explain the difference between stateless JWT logout and server-side token revocation.

Choose a secure, appropriate strategy for this project.

If token revocation requires a database table, explain the required schema change and wait for my approval before changing the existing database.

### Step 9: Test Authentication

Use Postman to test:

1. Customer registration.
2. Duplicate email registration.
3. Duplicate phone registration.
4. Invalid registration data.
5. Successful login.
6. Incorrect password.
7. Inactive account login.
8. Accessing `/api/auth/me` without a token.
9. Accessing `/api/auth/me` with an invalid token.
10. Accessing `/api/auth/me` with a valid token.
11. Confirming Admin and Data Encoder accounts cannot be created through public registration.

## 4. Security Requirements

- Hash passwords using bcryptjs.
- Never store plain-text passwords.
- Never return password_hash.
- Never trust a role supplied by the frontend.
- Only assign the Customer role during public registration.
- Use parameterized SQL queries.
- Use database transactions for related registration operations.
- Validate all incoming data.
- Use JWT_SECRET from `.env`.
- Never expose JWT_SECRET.
- Set reasonable token expiration.
- Do not log passwords or JWTs.
- Avoid leaking internal errors to production clients.

## 5. Development Rules

1. Work one step at a time.
2. Explain every important line of code.
3. Provide complete, working code for each file.
4. Inspect the existing database before implementing SQL.
5. Preserve the existing database and backend functionality.
6. Do not modify the frontend.
7. Do not skip checkpoints.
8. Troubleshoot errors before continuing.
9. Do not start the next major step until I confirm the current step.

## 6. Final Checkpoint

Ask me to confirm:

- [ ] Existing database schema reviewed.
- [ ] Customer registration works.
- [ ] Password hashing works.
- [ ] Customer role assignment works.
- [ ] Login works.
- [ ] JWT generation works.
- [ ] Authentication middleware works.
- [ ] Current user profile endpoint works.
- [ ] Logout strategy tested.
- [ ] Security tests passed.

**Start with Step 1: Review the existing database structure. Do not write implementation code until the actual table structure has been verified.**