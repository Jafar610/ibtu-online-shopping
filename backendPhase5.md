# IBTU E-Commerce Backend – Phase 2, Step 1: Product Categories API Development

## 1. Project Context

We are developing IBTU (ሀበሻን ጥበብ), an Ethiopian clothing e-commerce platform.

### Technology Stack
- Node.js
- Express.js
- MariaDB
- mysql2/promise
- JWT authentication
- bcryptjs
- Role-Based Access Control (RBAC)
- RESTful API architecture

### Existing Database

Database name: `ibutu_ecommerce`

Existing category table:

`categories`

Existing category examples:
- Women
- Men
- Accessories
- Habesha Kemis
- Modern Dresses
- Traditional Shirts

The category table already exists and contains sample records.

**Important:** Inspect the existing table structure before writing SQL or backend code. Do not recreate the table or delete existing records.

## 2. Main Objective

Build a complete category management API that allows:

- Public visitors to view active categories.
- Admins to create categories.
- Authorized Data Encoders to create and update categories.
- Authorized users to update category information.
- Authorized Admins to delete categories when safe.

Use the existing authentication and permission middleware.

## 3. Step-by-Step Implementation

### Step 1: Review the Categories Table

Inspect:
- All column names and data types.
- Primary key.
- Unique constraints.
- Foreign keys.
- Parent category relationship.
- Existing category records.
- Active/inactive or status fields.

Check how parent-child categories are represented.

Do not assume column names or status values.

### Step 2: Understand Category CRUD

Explain:
- Create.
- Read.
- Update.
- Delete.
- Parent categories.
- Child categories.
- Category slugs.
- Why categories with existing products should not be deleted carelessly.

Use simple examples from IBTU.

### Step 3: Create the Category Architecture

Create or update:

```text
src/
├── controllers/
│   └── category.controller.js
├── services/
│   └── category.service.js
├── routes/
│   └── category.routes.js
├── validators/
│   └── category.validator.js
└── middleware/
    └── permission.middleware.js
```

Explain the responsibility of each file.

### Step 4: Implement Category Validation

Validate:
- Category name.
- Slug.
- Description.
- Parent category ID.
- Status or active flag, according to the actual schema.

Requirements:
- Category name cannot be empty.
- Slug must be unique.
- Parent category must exist.
- Prevent a category from being its own parent.
- Prevent circular parent-child relationships.
- Validate allowed fields.
- Do not allow unauthorized fields to be changed.

### Step 5: Implement Category Services

Create reusable service functions for:

- `getAllCategories()`
- `getCategoryById(id)`
- `createCategory(data)`
- `updateCategory(id, data)`
- `deleteCategory(id)`

Use parameterized SQL queries.

Use database transactions where multiple related database operations require atomicity.

Prevent deletion when a category contains products or child categories unless an explicit safe reassignment strategy is implemented.

### Step 6: Implement Category Controllers

Create controller functions that:
- Receive HTTP requests.
- Validate input.
- Call service functions.
- Return consistent API responses.
- Pass errors to centralized error middleware.

Do not put complex SQL queries inside controllers.

### Step 7: Implement Category Routes

Create:

`src/routes/category.routes.js`

Implement these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List active categories |
| GET | `/api/categories/:id` | Get category details |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

Authorization:

- Public GET endpoints may be accessible without login.
- POST requires `categories.create`.
- PUT requires `categories.update`.
- DELETE requires `categories.delete`.

Use the existing authentication and RBAC middleware.

### Step 8: Add Category Filtering

Support optional query parameters such as:

- `search`
- `parent_id`
- `status`
- `page`
- `limit`

Implement pagination safely.

Only expose fields appropriate for public catalog responses.

### Step 9: Integrate Routes into Express

Register category routes in:

`src/app.js`

Preserve:
- Existing health endpoints.
- Database health endpoint.
- Authentication routes.
- Error handling.
- Not-found middleware.

### Step 10: Test with Postman

Test:

1. Retrieve all active categories.
2. Retrieve a category by ID.
3. Search categories.
4. Retrieve child categories.
5. Create a category as an authorized user.
6. Attempt creation without authentication.
7. Attempt creation without permission.
8. Update a category.
9. Attempt duplicate slug creation.
10. Attempt invalid parent assignment.
11. Attempt circular parent assignment.
12. Attempt to delete a category containing products.
13. Attempt to delete a category with child categories.
14. Verify pagination.

## 4. Security and Development Requirements

- Use parameterized SQL queries.
- Use existing JWT authentication.
- Use existing RBAC permission middleware.
- Never trust frontend authorization.
- Validate all incoming data.
- Prevent SQL injection.
- Prevent circular category relationships.
- Do not delete categories with dependent records.
- Follow the existing API response structure.
- Do not expose internal database errors in production.

## 5. Important Development Rules

1. Work one step at a time.
2. Explain every important line of code.
3. Provide complete working code for every file.
4. Inspect the actual database schema before implementation.
5. Preserve existing database records.
6. Do not recreate existing tables.
7. Do not modify the frontend.
8. Do not skip checkpoints.
9. Fix errors before continuing.
10. Wait for my confirmation before moving to the next step.

## 6. Final Checkpoint

Ask me to confirm:

- [ ] Categories table reviewed.
- [ ] Category validation completed.
- [ ] Category service created.
- [ ] Category controller created.
- [ ] Category routes created.
- [ ] Public category endpoints working.
- [ ] Protected category endpoints working.
- [ ] Parent-child relationships working.
- [ ] Search and pagination working.
- [ ] All Postman tests passed.

**Start with Step 1: Inspect the existing categories table and its records. Do not write implementation code until the actual schema is verified.**