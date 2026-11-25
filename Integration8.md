# IBTU – Phase 6, Step 8
## Admin Customer, Review, and Contact Message API Integration

### 1. Objective

Integrate the existing IBTU Admin Dashboard customer, product review, and contact message management pages with the real backend APIs.

Replace mock data and localStorage-based persistence with backend-authoritative data.

The scope includes:

- Customer listing, searching, filtering, and permitted customer updates.
- Product review listing and moderation.
- Contact message listing, viewing, assignment, and status management where supported.

Do not redesign the existing admin interface or modify database schemas without approval.

### 2. Inspect the Existing Project First

Before editing, inspect:

**Frontend**
- Admin Customers page.
- Customer details page or modal.
- Admin Reviews page.
- Review details and moderation components.
- Admin Contact Messages page.
- Contact message details and reply components.
- Existing API services.
- Authentication and RBAC implementation.
- Existing pagination, filters, forms, and notification components.

**Backend**
- Customer management routes, controllers, and services.
- User and customer database queries.
- Product review routes, controllers, and moderation logic.
- Contact message routes, controllers, and services.
- Audit logging.
- Role and permission middleware.
- Existing database schema and constraints.

Inspect actual implementations, route paths, HTTP methods, request payloads, response structures, and permissions.

Do not assume previously planned endpoints exist.

Prepare a short implementation plan before editing.

### 3. Create or Extend API Services

Create or extend the appropriate frontend services:

- `adminCustomerApi.js`
- `adminReviewApi.js`
- `adminContactMessageApi.js`

Follow existing API service conventions.

Reuse the existing Axios client and centralized error handling.

Verify and integrate actual backend operations for:

**Customers**
- List customers.
- Retrieve customer details.
- Search and filter customers.
- Update permitted customer information or account status.

**Reviews**
- List reviews.
- Retrieve review details.
- Filter by moderation status.
- Approve reviews.
- Reject reviews.
- Retrieve relevant product and customer information.

**Contact messages**
- List messages.
- Retrieve message details.
- Update message status.
- Assign messages to staff if supported.
- Save internal notes if supported.
- Submit replies only if a real backend reply mechanism exists.

Do not invent endpoints or duplicate existing backend functionality.

### 4. Admin Customer Management

Connect the existing Admin Customers page to real backend data.

**Customer listing**

Display available backend fields, such as:

- Customer name.
- Email.
- Phone number.
- Account status.
- Registration date.
- Last login, if available.
- Order count, if supported.

**Search and filtering**

Implement backend-supported:

- Search by customer name.
- Search by email.
- Search by phone number.
- Filter by account status.
- Pagination.
- Sorting, where supported.

Do not fetch all customers and implement pagination only in the browser if the backend supports server-side pagination.

**Customer details**

Display relevant information returned by the backend.

Where supported, show:
- Customer profile.
- Saved addresses.
- Order history summary.
- Account status.
- Registration information.

Do not expose password hashes, authentication tokens, or sensitive internal information.

**Customer updates**

If the backend supports account activation or deactivation, integrate it.

Requirements:
- Require confirmation for sensitive account changes.
- Display the actual backend response.
- Refresh customer information after successful updates.
- Do not allow administrators to change customer passwords through an insecure direct update.
- Do not invent customer-management features that the backend does not support.

### 5. Product Review Management

Connect the existing Admin Reviews page to the backend.

Inspect the `product_reviews` table and existing moderation implementation.

Expected review information includes:

- Product.
- Customer.
- Rating.
- Review title.
- Review text.
- Verified purchase status.
- Review status.
- Submission date.
- Moderation information, where available.

**Review listing**

Implement:
- Real backend review listing.
- Search and filters where supported.
- Moderation status filters.
- Pagination.
- Product and customer information.

Possible statuses:
- pending
- approved
- rejected

Use the exact backend-supported enum values.

**Review details**

Display the complete review information available to the administrator.

**Review moderation**

Connect approve and reject actions to the real backend.

Requirements:
1. Require confirmation before moderation.
2. Collect a moderation note if supported.
3. Submit the actual moderation request.
4. Refresh the review list and details.
5. Display backend validation and authorization errors.
6. Prevent duplicate moderation submissions.

**Important business rules**

- Only authorized staff can moderate reviews.
- Do not mark a review as verified based on frontend claims.
- Verified purchase status must be determined by backend order-item checks.
- Do not allow customers to moderate their own reviews through admin interfaces.
- Preserve the existing backend moderation workflow.

### 6. Contact Message Management

Connect the existing Admin Contact Messages page to the backend.

Inspect the `contact_messages` table and existing message-management functionality.

Expected information includes:

- Sender name.
- Email.
- Phone, if provided.
- Subject.
- Message.
- Message status.
- Assigned staff member, if supported.
- Admin notes.
- Submission date.
- Reply date, if available.

Possible statuses:
- new
- in_progress
- resolved
- closed

Use the exact backend-supported values.

**Message listing**

Implement:
- Real backend message listing.
- Search by sender, email, or subject where supported.
- Filter by message status.
- Pagination.
- Clear status indicators.

**Message details**

Display the full message and its available metadata.

**Message status updates**

Allow authorized staff to update supported statuses.

**Assignment and internal notes**

If the backend supports assignment and internal notes:
- Connect the existing controls.
- Use valid staff IDs.
- Refresh the message after successful changes.
- Keep internal notes private from public users.

**Replies**

Inspect whether a real reply endpoint or email service exists.

If it exists, integrate it according to the actual backend contract.

If no reply mechanism exists:
- Do not simulate a successful email.
- Do not display a fake sent confirmation.
- Preserve the existing interface where possible.
- Document the missing capability.

### 7. Role and Permission Enforcement

Inspect the existing RBAC implementation before making permission-related changes.

Verify the permissions required for:

- Viewing customers.
- Updating customer accounts.
- Viewing reviews.
- Moderating reviews.
- Viewing contact messages.
- Updating message status.
- Assigning messages.
- Managing internal notes.
- Sending replies, if supported.

The existing roles include Admin, Data Encoder, and Customer.

Do not assume that Data Encoder has every administrative permission.

Requirements:
- Hide or disable unauthorized frontend actions appropriately.
- Protect admin routes.
- Rely on backend authorization for actual security.
- Do not create new permissions or change role assignments without approval.
- Document any missing permission or endpoint.

### 8. Data Privacy and Security

Verify that:

- Customer information is only returned to authorized staff.
- Sensitive authentication information is never exposed.
- Review moderation is restricted to authorized users.
- Contact message content is protected.
- Internal notes are not exposed through public endpoints.
- Customer ownership and authorization checks remain enforced.
- No private data is stored unnecessarily in browser localStorage.
- API errors do not expose SQL statements or internal stack traces.

### 9. Loading, Error, and User Feedback

All three admin sections must support:

- Loading states.
- Empty states.
- Retry after API errors.
- Success notifications.
- Validation feedback.
- Confirmation dialogs.
- Pagination and filter loading.
- Unauthorized and forbidden responses.

Prevent duplicate submissions.

Refresh the relevant data after successful mutations.

Do not show success messages before receiving a successful backend response.

### 10. Preserve Existing Functionality

Do not:

- Redesign the admin dashboard.
- Change IBTU brand colors or typography.
- Change authentication functionality.
- Replace the existing RBAC system.
- Modify customer checkout.
- Modify cart or wishlist functionality.
- Modify order, payment, or shipment workflows.
- Modify database tables or constraints.
- Invent email delivery functionality.
- Expose private customer information.
- Remove features outside this milestone.

Reuse existing components, API utilities, contexts, and design patterns.

### 11. Testing and Validation

Test the following scenarios.

**Customer management**
- Admin loads customers.
- Admin searches customers.
- Admin filters customer accounts.
- Admin opens customer details.
- Admin updates a permitted customer field.
- Admin activates or deactivates an account if supported.
- Unauthorized staff cannot perform restricted updates.
- Sensitive customer information is not exposed.

**Review management**
- Admin loads reviews.
- Admin filters pending reviews.
- Admin opens review details.
- Admin approves a review.
- Admin rejects a review.
- Moderation notes are handled correctly if supported.
- Verified purchase status comes from backend data.
- Unauthorized staff cannot moderate reviews.

**Contact messages**
- Admin loads messages.
- Admin filters messages by status.
- Admin opens message details.
- Admin updates message status.
- Admin assigns a message if supported.
- Admin saves internal notes if supported.
- Reply functionality works only if a real backend mechanism exists.
- Internal notes remain private.

**Regression**
- Admin order management still works.
- Payment approval and receipt viewing still work.
- Shipment management still works.
- Customer checkout still works.
- Customer order history still works.
- Cart and Wishlist still work.
- Customer address management still works.
- Authentication and RBAC still work.

Run:
1. Frontend production build.
2. Customer management tests.
3. Review moderation tests.
4. Contact message tests.
5. RBAC and authorization tests.
6. Relevant order and payment regression tests.
7. Relevant authentication and catalog regression tests.

Report actual results, including failures. Do not claim a test passed unless it was executed successfully.

### 12. Final Checkpoint Report

Create:

`frontend-phase6-step8-checkpoint.md`

Include:

1. Files inspected.
2. Files created.
3. Files modified.
4. Verified customer API endpoints.
5. Verified review API endpoints.
6. Verified contact message API endpoints.
7. Customer management integration.
8. Review moderation integration.
9. Contact message integration.
10. Reply functionality status.
11. Role and permission verification.
12. Privacy and security checks.
13. Frontend production build results.
14. Backend test results.
15. Regression test results.
16. Missing backend endpoints or capabilities.
17. Unresolved issues.
18. Confirmation of database schema changes, if any.

### Completion Criteria

Step 8 is complete only when:

- Customer management uses real backend data.
- Review moderation uses real backend endpoints.
- Contact message management uses real backend data.
- Supported assignment and internal-note operations work.
- Reply functionality is accurately represented.
- Role and permission restrictions are enforced.
- Existing admin and customer workflows remain functional.
- Frontend build and test results are documented.

**STOP after completing Phase 6, Step 8. Do not begin Step 9 until the checkpoint report has been reviewed and approval is given.**