# IBTU E-Commerce Platform
## Phase 3 – Step 3: Customer Address Management API

### Objective

Develop a secure Customer Address Management API using Node.js, Express, and MariaDB.

Customers should be able to:
- Add multiple delivery addresses.
- View all their saved addresses.
- View one specific address.
- Update an existing address.
- Delete an address.
- Set one address as their default delivery address.
- Change their default address whenever necessary.

**Important:** Do not modify the existing React frontend or recreate database tables.

---

### STEP 0: Verify Previous Checkpoint

Before starting, confirm that Phase 3 – Step 2 (Wishlist API Development) has been completed and tested.

If it has not been completed, request the checkpoint.

Do not assume previous development steps are complete.

### STEP 1: Inspect Existing Database Schema

Inspect the actual structures of:

1. `customer_addresses`
2. `users`
3. `orders`

Expected `customer_addresses` fields:

- id
- user_id
- address_type (home/work/other)
- recipient_name
- phone
- address_line1
- address_line2
- city
- region
- postal_code
- country
- is_default
- created_at
- updated_at

Verify the real column names, constraints, indexes, and foreign keys.

Important:
- Each address belongs to one registered customer.
- A customer can have multiple addresses.
- Each customer should have at most one default address.
- Never allow customers to manage another customer's addresses.
- Existing orders may reference saved addresses.

Do not modify the database schema without first explaining the reason and requesting approval.

### STEP 2: Create Backend Files

Follow the existing backend architecture.

Create these files if they do not already exist:

- `src/validators/address.validator.js`
- `src/services/address.service.js`
- `src/controllers/address.controller.js`
- `src/routes/address.routes.js`

Reuse the existing:
- Database connection pool.
- Authentication middleware.
- Error middleware.
- API response utility.
- Validation conventions.

### STEP 3: Implement Address API Endpoints

**1. Get All Addresses**

`GET /api/addresses`

Return the authenticated customer's addresses.

Include:
- Address ID.
- Address type.
- Recipient name.
- Phone.
- Address lines.
- City.
- Region.
- Postal code.
- Country.
- Default status.
- Creation date.

Order the default address first.

**2. Get One Address**

`GET /api/addresses/:id`

Requirements:
- Verify the address exists.
- Verify ownership.
- Return only the authenticated customer's address.

**3. Create Address**

`POST /api/addresses`

Example request:

```json
{
  "address_type": "home",
  "recipient_name": "Jafar Mohammed",
  "phone": "+251900000000",
  "address_line1": "Example Street",
  "address_line2": "",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "postal_code": "",
  "country": "Ethiopia",
  "is_default": true
}
```

Requirements:
- Validate required fields.
- Validate phone number format without assuming only one phone format.
- Set `user_id` from the authenticated JWT, never from request data.
- If this is the customer's first address, make it the default.
- If `is_default` is true, remove the default status from the customer's previous default address.
- Use a database transaction when changing default status and creating the address.

**4. Update Address**

`PUT /api/addresses/:id`

Requirements:
- Verify ownership.
- Validate all supplied fields.
- Update only the specified customer's address.
- Handle default-address changes safely.
- Do not allow changing the address owner.

**5. Delete Address**

`DELETE /api/addresses/:id`

Requirements:
- Verify ownership.
- Check whether the address is referenced by an existing order.
- Preserve historical order information.
- Do not break order relationships.
- If the deleted address was the default, select another existing address as the new default.
- If no addresses remain, allow the customer to have no default address.

Do not delete or modify historical order data.

**6. Set Default Address**

`PATCH /api/addresses/:id/default`

Requirements:
- Verify ownership.
- Set the selected address as default.
- Remove the default status from all other addresses belonging to that customer.
- Use a database transaction.
- Ensure concurrent requests cannot leave multiple default addresses.

### STEP 4: Business Logic and Security

Implement these rules:

1. All address endpoints require authentication.
2. Only customer accounts can manage customer addresses.
3. Never trust `user_id` from the frontend.
4. Always identify the customer using the verified JWT.
5. Verify address ownership before every update or deletion.
6. Validate required fields and maximum field lengths against the actual database schema.
7. Use parameterized SQL queries.
8. Use database transactions for multi-query operations.
9. Avoid exposing sensitive customer information in error messages.
10. Preserve existing order relationships.
11. Prevent multiple default addresses for one customer.

### STEP 5: Register Routes

Register the address routes in the existing Express application.

Follow existing route conventions.

Do not break authentication, cart, wishlist, catalog, or other existing endpoints.

### STEP 6: API Testing

Use Postman or another API testing tool.

Test the following scenarios:

1. Retrieve addresses without authentication.
2. Create the first address.
3. Verify the first address becomes default.
4. Create a second address.
5. Create a second address with `is_default: true`.
6. Verify the previous default is changed.
7. Retrieve all addresses.
8. Retrieve one address.
9. Attempt to access another customer's address.
10. Update an address.
11. Set another address as default.
12. Verify only one default address exists.
13. Delete a non-default address.
14. Delete the default address.
15. Verify default reassignment.
16. Attempt to delete an address referenced by an order.
17. Submit invalid address data.
18. Verify Admin and Data Encoder accounts cannot manage customer addresses as customers.

Fix all errors before completing this phase.

### STEP 7: Final Checkpoint

Provide the following report:

**IBTU Phase 3 – Step 3 Checkpoint**

- Previous wishlist checkpoint verified: yes/no
- Database inspection: completed/not completed
- Create address: completed/not completed
- Retrieve all addresses: completed/not completed
- Retrieve one address: completed/not completed
- Update address: completed/not completed
- Delete address: completed/not completed
- Set default address: completed/not completed
- Default address consistency: completed/not completed
- Order relationship protection: completed/not completed
- Authentication and ownership security: completed/not completed
- API testing: completed/not completed
- Errors or remaining issues:

Include:
- Files created or modified.
- Implemented API endpoints.
- Postman test results.
- Any configuration changes.
- Any unresolved database concerns.

**STOP after this checkpoint. Do not start the next development step until I review and confirm the results.**

### Development Instructions

- Work step by step.
- Explain important code in simple English.
- Provide complete code with exact file paths.
- Inspect existing code before modifying it.
- Preserve existing functionality.
- Do not recreate existing tables.
- Do not modify the frontend.
- Do not skip testing.
- Wait for my confirmation before continuing.