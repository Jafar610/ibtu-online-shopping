# IBTU E-Commerce Backend Development – Phase 1, Step 3: Centralized Error Handling and API Response Structure

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack
- Node.js
- Express.js
- MariaDB
- mysql2/promise
- JWT authentication
- bcryptjs
- RESTful API architecture

### Existing Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   ├── validators/
│   ├── utils/
│   ├── constants/
│   └── app.js
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

The MariaDB database already exists:

`ibutu_ecommerce`

## 2. Current Task

Implement a professional, centralized error-handling and API response system.

Before starting, ask me to confirm that Phase 1, Step 2 (MariaDB connection configuration and testing) has been completed successfully. Do not assume it is complete.

## 3. Step-by-Step Implementation

### Step 1: Understand API Responses

Explain:
- What an API response is.
- What HTTP status codes are.
- Why APIs need a consistent response structure.
- The difference between successful and failed responses.

Use beginner-friendly examples.

### Step 2: Create a Standard API Response Utility

Create:

`src/utils/api-response.js`

Implement reusable response functions for:
- Successful responses.
- Resource creation.
- Client errors.
- Server errors.

Use a consistent JSON response structure.

Example success:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": null
}
```

Example error:

```json
{
  "success": false,
  "message": "Product not found",
  "errors": null
}
```

### Step 3: Create a Custom API Error Class

Create:

`src/utils/app-error.js`

Implement a reusable custom error class that supports:
- Error message.
- HTTP status code.
- Operational error identification.

Explain how custom errors help us manage application errors.

### Step 4: Create Centralized Error Middleware

Create:

`src/middleware/error.middleware.js`

It should:
- Handle errors from all routes and controllers.
- Return consistent JSON error responses.
- Handle operational errors.
- Handle unexpected server errors.
- Avoid exposing sensitive technical details in production.
- Log useful debugging information in development.

### Step 5: Create a Not Found Middleware

Create:

`src/middleware/not-found.middleware.js`

Return a proper HTTP 404 response when a requested API endpoint does not exist.

Example:

```json
{
  "success": false,
  "message": "API endpoint not found"
}
```

### Step 6: Integrate Middleware into Express

Update:

`src/app.js`

Register middleware in the correct order:
1. Security middleware.
2. CORS.
3. Request body parsing.
4. API rate limiting.
5. API routes.
6. Not found middleware.
7. Centralized error middleware.

Preserve all existing functionality, including the health endpoints and MariaDB connection configuration.

### Step 7: Test the Implementation

Test the following scenarios:

1. Existing health endpoint returns success.
2. Database health endpoint returns the correct response.
3. Unknown endpoint returns HTTP 404.
4. Custom application error returns the correct status.
5. Unexpected errors return a safe HTTP 500 response.

Explain how to test each scenario using a browser or Postman.

## 4. Important Development Rules

- Work one step at a time.
- Explain every important line of code.
- Provide complete code for every file created or updated.
- Preserve existing working functionality.
- Do not modify the frontend.
- Do not recreate or modify the existing database tables.
- Follow professional Node.js and Express.js practices.
- Do not move to the next step until I confirm the current checkpoint.
- If an error occurs, help me troubleshoot it before proceeding.

## 5. Final Checkpoint

Ask me to confirm:

- [ ] API response utility created.
- [ ] Custom error class created.
- [ ] Centralized error middleware created.
- [ ] Not found middleware created.
- [ ] Middleware integrated into Express.
- [ ] All test scenarios passed.

**Start by confirming the MariaDB connection step is complete, then explain Step 1.**