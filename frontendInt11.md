# Phase 5 – Step 8.4: Admin Customer, Product Review, and Contact Message Management

## Objective

Implement three Admin Dashboard modules:

1. Customer Management
2. Product Review Management
3. Contact Message Management

The goal is to help authorized administrators manage customer information, moderate product reviews, and respond to customer inquiries.

**Important:** This is a frontend-only milestone. Do not connect to backend APIs or modify the database.

---

## 1. Inspect the Existing Project

Before development:

1. Inspect the actual React project structure.
2. Review the Admin Dashboard foundation from Step 7.
3. Review completed management modules from Steps 8.1, 8.2, and 8.3.
4. Inspect existing customer account and profile pages.
5. Inspect existing product review components, if any.
6. Review the public Contact Us page and its form fields.
7. Inspect existing customer, review, and contact message data structures.
8. Review current role and permission handling.
9. Identify reusable tables, filters, forms, modals, and status badges.

Do not assume earlier milestones are complete. Verify actual source code.

Reuse existing components and preserve completed functionality.

---

## 2. Customer Management

**Route:** `/admin/customers`

### A. Customer Listing

Create a professional customer management table.

Display:

- Customer name
- Email
- Phone
- Registration date
- Account status
- Number of orders, if available
- Total spending, if available
- Last login, if available
- Actions

Include:

- Search by customer name, email, or phone.
- Filter by account status.
- Filter by registration date.
- Sort by name, registration date, and total spending where available.
- Pagination.
- Clear filters.
- Empty state.

Do not invent customer statistics.

### B. Customer Details

**Route:** `/admin/customers/:customerId`

Create a customer details page with sections:

**Personal Information**
- First name
- Last name
- Email
- Phone
- Account status
- Registration date
- Last login, if available

**Customer Addresses**
- Recipient name
- Address type
- Address
- City
- Region
- Country
- Default address indicator

**Order History**
- Order number
- Order date
- Order total
- Payment status
- Order status

**Customer Summary**
- Total orders.
- Total spending.
- Recent activity, if available.

Use actual mock relationships between customers, addresses, and orders.

Do not expose password hashes, authentication tokens, or private security information.

### C. Customer Actions

Implement frontend mock interactions for:

- View customer details.
- Activate customer.
- Deactivate customer.
- Search and filter customers.

Require confirmation before changing account status.

Do not delete customer accounts in this milestone.

Do not modify authentication credentials.

---

## 3. Product Review Management

**Route:** `/admin/reviews`

### A. Review Listing

Create a product review management table.

Display:

- Product name
- Customer name
- Rating
- Review title
- Review date
- Verified purchase status
- Moderation status
- Actions

Include:

- Search by product or customer.
- Filter by rating.
- Filter by moderation status.
- Filter by verified purchase.
- Filter by date.
- Sorting.
- Pagination.
- Empty state.

### B. Review Details

**Route:** `/admin/reviews/:reviewId`

Display:

- Product information.
- Customer information.
- Rating.
- Review title.
- Review content.
- Review date.
- Verified purchase indicator.
- Moderation status.
- Moderation notes, if available.

Do not expose private customer information unnecessarily.

### C. Review Moderation

Use the existing review statuses:

- Pending
- Approved
- Rejected

Implement frontend mock actions:

- Approve review.
- Reject review.
- Add moderation note.
- Change moderation status where appropriate.

Require confirmation before approving or rejecting.

Validation:

- A rejection reason or moderation note should be required when rejecting, if consistent with the existing workflow.
- Prevent accidental repeated moderation actions.
- Clearly distinguish pending, approved, and rejected reviews.

Important:

- Do not assume a review is a verified purchase because it contains an order number.
- Preserve the existing `is_verified_purchase` value.
- Actual verified-purchase validation must eventually be performed by the backend against order items.

---

## 4. Contact Message Management

**Route:** `/admin/messages`

### A. Message Listing

Create a professional message management table.

Display:

- Sender name
- Email
- Phone, if provided
- Subject
- Message preview
- Submission date
- Message status
- Assigned administrator, if available
- Actions

Include:

- Search by sender name or email.
- Filter by message status.
- Filter by submission date.
- Sorting.
- Pagination.
- Empty state.

Use the existing message statuses:

- New
- In Progress
- Resolved
- Closed

### B. Message Details

**Route:** `/admin/messages/:messageId`

Display:

- Sender name
- Email
- Phone
- Subject
- Full message
- Submission date
- Current status
- Assigned administrator, if available
- Admin notes, if available
- Replied date, if available

### C. Message Actions

Implement frontend mock interactions for:

- Mark as In Progress.
- Mark as Resolved.
- Mark as Closed.
- Add internal admin notes.
- Reopen a message if the existing workflow allows it.

Require confirmation for important status changes.

### D. Reply Preparation

Provide a simple reply preparation interface.

Include:

- Recipient email.
- Subject.
- Reply message.
- Basic validation.

Important:

- This is only a frontend reply-drafting feature.
- Do not claim that an email has been sent.
- Do not implement email delivery or SMTP.
- Do not invent an email address for IBTU.
- Clearly distinguish internal admin notes from customer-facing replies.

---

## 5. Shared Components

Review existing components before creating new ones.

Create reusable components only when necessary, such as:

- CustomerTable
- CustomerFilters
- CustomerDetails
- AccountStatusBadge
- ReviewTable
- ReviewFilters
- ReviewDetails
- RatingDisplay
- ReviewModerationModal
- ContactMessageTable
- MessageFilters
- MessageDetails
- MessageStatusBadge
- ReplyComposer
- ConfirmActionModal

Use shared date, currency, and status formatting utilities.

Keep the implementation modular.

---

## 6. Frontend State and Mock Data

Use the existing state-management approach.

Requirements:

1. Reuse existing mock customer data where possible.
2. Maintain consistent customer IDs across customer addresses and orders.
3. Maintain consistent product IDs across reviews and products.
4. Keep contact messages connected to the public Contact Us form structure.
5. Ensure status changes update the corresponding listing and detail page.
6. Ensure moderation notes and internal admin notes remain distinguishable.
7. Clearly label mock data and simulated operations.
8. Avoid duplicating conflicting customer information.

Do not introduce a new state-management library.

Do not pretend that changes have been saved to the actual IBTU database.

---

## 7. Role and Permission Preparation

Review the existing RBAC structure.

Expected access:

**Admin**
- Full customer, review, and contact message management access.

**Data Encoder**
- Only the operations permitted by the existing permission structure.

**Customer**
- No access to admin management pages.

Important:

- Reuse existing permissions.
- Do not invent new permission names.
- Do not modify database roles or permissions.
- Preserve protected routes.
- Do not expose private customer information unnecessarily.
- Remember that frontend permission checks do not replace backend authorization.

---

## 8. Routing and Navigation

Add or update the following routes:

**Customers**
- `/admin/customers`
- `/admin/customers/:customerId`

**Reviews**
- `/admin/reviews`
- `/admin/reviews/:reviewId`

**Contact Messages**
- `/admin/messages`
- `/admin/messages/:messageId`

Requirements:

- Use the existing AdminLayout.
- Maintain breadcrumbs.
- Highlight the active sidebar item.
- Handle invalid or missing record IDs gracefully.
- Preserve all existing routes.

---

## 9. UI and Design Requirements

Follow the existing IBTU Admin Dashboard design.

Brand colors:

- Forest Green: `#103321`
- Lime Green: `#95C623`
- White: `#FFFFFF`
- Off-white: `#F8F9FA`
- Dark Text: `#1A1A1A`

Requirements:

- Professional management tables.
- Clean customer detail layouts.
- Readable review content.
- Clear star rating display.
- Consistent moderation badges.
- Clear message status indicators.
- Responsive detail pages and modals.
- Accessible labels and keyboard-friendly interactions.
- Desktop, tablet, and mobile support.

Do not redesign the public website or existing Admin Dashboard.

---

## 10. Testing and Verification

### Customer Management
- Customer listing works.
- Search and filters work.
- Customer details display correctly.
- Address and order relationships are correct.
- Account status changes require confirmation.
- Sensitive authentication data is not exposed.

### Review Management
- Review listing works.
- Search and filters work.
- Review details display correctly.
- Rating displays correctly.
- Verified purchase indicator is preserved.
- Approve and reject actions work in mock state.
- Moderation notes are saved in mock state.

### Contact Message Management
- Message listing works.
- Search and filters work.
- Message details display correctly.
- Status changes work.
- Internal notes remain separate from reply drafts.
- Reply composer validates its fields.
- No fake email-sending success message is displayed.

### Regression Testing
- Admin Dashboard works.
- Product Management works.
- Category Management works.
- Inventory Management works.
- Order Management works.
- Payment Management works.
- Shipment Management works.
- Public Contact Us page remains functional.
- Customer Account pages remain functional.
- No console errors.
- Production build succeeds.

---

## 11. Strict Scope Restrictions

Do not:

- Connect to backend APIs.
- Modify the MariaDB database.
- Create or modify backend endpoints.
- Change authentication logic.
- Expose passwords or authentication tokens.
- Implement actual email sending.
- Implement real customer deletion.
- Implement real review moderation in the database.
- Implement actual customer notifications.
- Modify unrelated public website functionality.
- Install new dependencies without approval.

If a requirement depends on missing backend functionality, document it instead of pretending the operation is real.

---

## 12. Final Checkpoint Report

When finished, provide:

1. Files created.
2. Files modified.
3. Customer Management features completed.
4. Product Review Management features completed.
5. Contact Message Management features completed.
6. Routes added or updated.
7. Reusable components created.
8. Mock data and state-management approach.
9. Role and permission behavior.
10. Tests performed and results.
11. Known issues or incomplete features.
12. Confirmation that no backend or database changes were made.

**STOP after completing Step 8.4. Do not start Step 8.5 until I review and approve the checkpoint report.**