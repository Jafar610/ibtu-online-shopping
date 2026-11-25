# IBTU E-Commerce Backend Development – Phase 1, Step 2: MariaDB Database Connection

## Project Context

We are developing the backend for **IBTU (ሀበሻን ጥበብ)**, an Ethiopian clothing e-commerce platform.

The backend technology stack is:

- Node.js
- Express.js
- MariaDB
- mysql2
- JWT authentication
- bcryptjs
- RESTful API architecture

Our existing database is named `ibutu_ecommerce`, created using XAMPP phpMyAdmin.

Database information:
- Database name: `ibutu_ecommerce`
- Database server: MariaDB 10.4.32
- Character set: intended to be `utf8mb4`
- Storage engine: InnoDB

## Current Progress

We have completed Phase 1, Step 1:

- Initialized the Node.js backend project.
- Installed the required dependencies.
- Created the initial project structure.
- Configured Express.js.
- Configured CORS, Helmet, and API rate limiting.
- Created the server entry point.
- Started the development server using Nodemon.
- Tested the API health endpoint at `http://localhost:5000/api/health`.

Do not repeat these setup steps unless troubleshooting requires it.

## Current Task: Configure the MariaDB Connection

Guide me through connecting the existing MariaDB database to our Node.js backend using `mysql2/promise`.

### Step 1: Explain the Database Connection

Before providing code, explain:

- What `mysql2` is.
- What `mysql2/promise` means.
- Why we use a database connection pool.
- The difference between `createConnection()` and `createPool()`.
- Why a connection pool is recommended for production applications.

Use simple English and beginner-friendly examples.

### Step 2: Create the Database Configuration File

Create:

`src/config/database.js`

Implement a professional MariaDB connection pool using:

- `mysql2/promise`
- Environment variables from `.env`
- `waitForConnections`
- `connectionLimit`
- `queueLimit`

Explain every important line of code.

### Step 3: Verify Environment Variables

Review the following variables in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ibutu_ecommerce
```

Explain how to confirm the correct MariaDB port, username, and password in XAMPP.

Do not assume that my database password is empty. Do not ask me to share my password.

### Step 4: Test the Database Connection

Create a simple database connection test.

The test should:

1. Acquire a connection from the pool.
2. Execute a query to retrieve the current database name and MariaDB version.
3. Display a success message if the connection works.
4. Release the connection properly.
5. Display a helpful error message if the connection fails.

Use this SQL query:

```sql
SELECT DATABASE() AS database_name, VERSION() AS database_version;
```

Do not expose database credentials in console logs or API responses.

### Step 5: Create a Database Health Endpoint

After successfully testing the connection, integrate a database health endpoint into Express.

Use:

`GET /api/health/db`

Expected successful response:

```json
{
  "success": true,
  "message": "Database connection successful",
  "database": "ibutu_ecommerce"
}
```

If the database is unavailable, return an appropriate HTTP error status and a safe error message.

### Step 6: Test Everything

Guide me through:

1. Starting MariaDB through XAMPP.
2. Starting the Node.js backend.
3. Testing the database connection.
4. Opening the health endpoint in the browser or Postman.
5. Confirming that the backend connects to the correct database.

## Important Development Rules

1. Work one step at a time.
2. Do not provide all future development phases at once.
3. Explain the purpose of each file, package, function, and important code line.
4. Provide complete, working code whenever a file needs to be created or updated.
5. Preserve the existing backend structure and working functionality.
6. Do not modify the frontend.
7. Do not recreate or delete the existing database or its tables.
8. Use professional coding practices suitable for a real-world e-commerce application.
9. Wait for my confirmation at each major checkpoint before proceeding.
10. If an error occurs, help me understand and fix it before continuing.

## Final Checkpoint

After completing this step, ask me to confirm:

- [ ] `database.js` created successfully.
- [ ] Environment variables configured.
- [ ] MariaDB connection test successful.
- [ ] Database health endpoint working.
- [ ] Correct database identified as `ibutu_ecommerce`.

**Start with Step 1: Explain the MariaDB connection and connection pool. Do not skip ahead.**