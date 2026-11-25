# IBTU – Phase 6, Step 5
## Customer Address API Integration

### Objective

Integrate the existing React frontend with the backend Customer Address API.

Replace mock address data with real MariaDB-backed customer address data. Connect the customer account address management page and checkout address selection to the backend.

**Important:** This step is strictly for customer address management and address selection. Do not implement order creation, payment processing, or checkout submission.

---

### 1. Inspect the Existing Project Before Making Changes

Before writing or modifying code:

1. Inspect the frontend project structure.
2. Inspect the existing Customer Account pages and address management components.
3. Inspect the existing Checkout page and address selection components.
4. Inspect the current `AuthContext` and customer authentication flow.
5. Inspect the existing Axios API client and API configuration.
6. Inspect the backend address routes, controllers, services, validation, middleware, and database queries.
7. Inspect the existing `customer_addresses` table and its constraints.

Identify the actual backend endpoint paths, HTTP methods, request payloads, response structures, and authorization requirements.

Do not assume that previously documented endpoints exactly match the current implementation.

Prepare a short implementation plan before editing.

### 2. Backend API Verification

Verify whether the backend supports these operations:

- Retrieve all addresses belonging to the authenticated customer.
- Retrieve one address by ID.
- Create a new address.
- Update an existing address.
- Delete an address.
- Set an address as the customer's default address.

Previously planned endpoint structure:

- `GET /api/addresses`
- `GET /api/addresses/:id`
- `POST /api/addresses`
- `PUT /api/addresses/:id`
- `DELETE /api/addresses/:id`
- `PATCH /api/addresses/:id/default`

Use the actual verified backend routes.

If an endpoint is missing, document it and determine whether the backend already has an equivalent implementation. Do not silently create new backend features or modify the database without approval.

### 3. Create the Frontend Address API Service

Create:

`frontend/src/services/api/addressApi.js`

Follow the existing API service conventions.

Implement functions corresponding to the verified backend operations:

- Fetch customer addresses.
- Fetch a single address.
- Create an address.
- Update an address.
- Delete an address.
- Set a default address.

Requirements:

- Reuse the existing Axios client.
- Reuse centralized API error handling.
- Do not create a second Axios instance.
- Do not hardcode the API base URL.
- Normalize responses only where necessary.
- Handle loading, success, and failure states properly.

### 4. Integrate the Customer Address Management Page

Find the existing customer account address page.

Replace mock data and localStorage-based address persistence with backend API operations.

Implement:

**Address listing**
- Display the authenticated customer's saved addresses.
- Display recipient name and phone.
- Display address lines, city, region, postal code, and country.
- Clearly identify the default address.
- Show a useful empty state when no addresses exist.

**Create address**
- Open the existing address form or modal.
- Submit the address to the backend.
- Refresh the address list after successful creation.
- Display success and validation feedback.

**Edit address**
- Load the selected address.
- Populate the form with its existing values.
- Save changes through the backend.
- Refresh the list after successful updates.

**Delete address**
- Require confirmation before deletion.
- Handle backend restrictions when an address cannot be deleted.
- Refresh the list after successful deletion.

**Set default address**
- Allow the customer to select a default address.
- Reflect the new default immediately after backend confirmation.
- Ensure the interface never displays multiple default addresses.

### 5. Address Form and Validation

Use the existing database structure and backend validation rules.

Expected address fields:

- `address_type`: home, work, or other
- `recipient_name`
- `phone`
- `address_line1`
- `address_line2`
- `city`
- `region`
- `postal_code`
- `country`
- `is_default`

Validation requirements:

- Recipient name is required.
- Phone number is required.
- Address line 1 is required.
- City and region are required where required by backend validation.
- Address type must be valid.
- Validate field lengths against backend constraints.
- Country should default to Ethiopia if that matches the backend behavior.
- Display field-level validation errors clearly.

Do not introduce frontend validation rules that conflict with backend validation.

### 6. Integrate Checkout Address Selection

Find the existing Checkout page.

Replace mock address selection with addresses retrieved through `addressApi.js`.

Requirements:

1. Fetch the authenticated customer's saved addresses.
2. Display available addresses in a clear selection interface.
3. Automatically select the default address when appropriate.
4. Allow the customer to choose another saved address.
5. Allow the customer to add a new address through the existing address form or a reusable address form.
6. Refresh the available addresses after a new address is successfully created.
7. Preserve the selected address when appropriate during the checkout experience.
8. Display loading, empty, and error states.

If the checkout flow supports guest customers, preserve its existing guest behavior. Do not expose authenticated customers' saved addresses to guests.

**Important:** Selecting an address must not create an order or trigger payment processing in this step.

### 7. Address Ownership and Security

Verify that:

- Only authenticated customers can access their own addresses.
- A customer cannot retrieve another customer's address by changing an ID.
- A customer cannot update or delete another customer's address.
- Default address changes are handled safely by the backend.
- Frontend state is cleared appropriately on logout and account switching.
- No customer address information is exposed through public endpoints.

Do not rely on frontend checks as a replacement for backend authorization.

### 8. Preserve Existing Functionality

Do not:

- Redesign the IBTU interface.
- Change the brand colors, typography, or existing layouts.
- Modify authentication functionality.
- Modify the CartContext.
- Implement order creation.
- Implement payment processing.
- Change database tables or constraints.
- Add new database columns or tables.
- Replace existing checkout functionality unnecessarily.
- Introduce duplicate address state management.

Reuse existing components, contexts, API utilities, and validation patterns wherever possible.

### 9. Testing and Validation

Test the following scenarios:

**Address management**
- Customer loads saved addresses.
- Customer creates an address.
- Customer edits an address.
- Customer deletes an address.
- Customer changes the default address.
- Customer attempts invalid form submission.
- Customer attempts to access another customer's address.

**Checkout**
- Existing customer loads checkout addresses.
- Default address is selected appropriately.
- Customer selects another address.
- Customer creates a new address during checkout.
- Newly created address becomes available for selection.
- Guest checkout behavior remains unchanged.

**Regression**
- Authentication still works.
- Cart functionality still works.
- Wishlist functionality still works.
- Customer account navigation still works.
- Existing checkout layout and unrelated functionality remain intact.

Run the frontend production build and relevant backend tests.

Report actual results, including any failed tests. Do not claim that a test passed unless it was executed successfully.

### 10. Final Checkpoint Report

Create:

`frontend-phase6-step5-checkpoint.md`

Include:

1. Files inspected.
2. Files created.
3. Files modified.
4. Verified backend address endpoints.
5. API service implementation details.
6. Customer address page integration.
7. Checkout address selection integration.
8. Authentication and ownership verification.
9. Validation and error-handling details.
10. Frontend build results.
11. Backend test results.
12. Regression test results.
13. Any unresolved issues.
14. Confirmation that no database schema changes were made.

### Completion Criteria

Step 5 is complete only when:

- Customer address management uses the real backend.
- Checkout address selection uses real customer addresses.
- CRUD and default-address operations work.
- Customer ownership is enforced.
- Guest behavior remains intact.
- Existing Cart and Wishlist functionality remains operational.
- The frontend builds successfully.
- Test results are documented.

**STOP after completing Phase 6, Step 5. Do not begin Step 6 until the checkpoint report has been reviewed and approval is given.**