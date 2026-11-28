# Phase 6 – Step 11: Fix Critical Frontend API Response Unwrapping and Payment Receipt Handling

## Objective

Fix the critical frontend API response-handling defect identified in `IBTU_FINAL_INTEGRATION_AUDIT.md`.

The current `apiClient.js` response interceptor unwraps Axios responses by returning `response.data`. However, several API services still attempt to access `res.data?.data`.

This creates an inconsistency that can cause frontend components to receive `undefined` instead of the actual backend response payload.

Your task is to inspect the existing implementation, correct the response handling, verify payment receipt Blob handling, and resolve the missing ESLint dependency.

**Do not implement new features or integrate additional modules in this step.**

---

## 1. Inspect Before Editing

Before modifying anything:

1. Read `IBTU_FINAL_INTEGRATION_AUDIT.md`.
2. Inspect `frontend/src/services/api/apiClient.js`.
3. Inspect the response interceptors and error handling.
4. Inspect all 11 affected API services.
5. Identify every component or context that depends on the affected service responses.
6. Review the existing backend response envelope and confirm how successful API responses are structured.

Do not assume that every endpoint returns an identical response structure. Verify actual endpoint responses and existing service contracts.

## 2. Fix the 11 Affected API Services

Inspect and correct the following files:

- `checkoutApi.js`
- `adminOrderApi.js`
- `adminPaymentApi.js`
- `adminShipmentApi.js`
- `adminCustomerApi.js`
- `adminReviewApi.js`
- `adminContactMessageApi.js`
- `adminCouponApi.js`
- `adminRoleApi.js`
- `adminReportApi.js`
- `adminSettingsApi.js`

### Required behavior

The current response interceptor returns `response.data`.

Therefore, when a service receives a normal successful API response, it must access the already-unwrapped payload rather than attempting to unwrap it again.

For example, if the backend returns:

`{ success: true, message: "Success", data: {...} }`

and the interceptor returns the response body, the service receives:

`{ success: true, message: "Success", data: {...} }`

It must not assume that the service receives an Axios response object containing another `.data` property.

Use the actual response structure to determine the correct access pattern.

### Important requirements

- Do not blindly replace every `.data` occurrence.
- Inspect each service method individually.
- Preserve existing API endpoint URLs and HTTP methods.
- Preserve query parameters, request payloads, pagination, filters, and authentication.
- Preserve existing return-value contracts expected by React components.
- Do not introduce unnecessary response transformations.
- Do not modify backend response structures to compensate for frontend mistakes.
- Do not remove error handling.

After making the corrections, verify that every affected service returns the data expected by its consuming component.

## 3. Fix Payment Receipt Blob Handling

Inspect `adminPaymentApi.js` and the receipt preview implementation.

The audit identified a possible defect involving Blob responses.

Verify the actual Axios configuration and response interceptor behavior for:

`GET /api/admin/payments/:paymentId/receipt`

Requirements:

1. The request must preserve the binary Blob response.
2. The response must not be converted into a JSON response.
3. `URL.createObjectURL()` must receive a valid Blob.
4. The receipt preview must continue working inside the existing review modal.
5. Object URLs must be revoked when no longer needed.
6. Handle loading, invalid response, and preview errors gracefully.
7. Do not expose private receipt files through public URLs.

Check the existing modal cleanup behavior, including closing the modal and switching between receipts.

Do not change the backend receipt storage or authorization logic unless a genuine defect is discovered. If a backend change appears necessary, explain it and stop for approval.

## 4. Fix the ESLint Dependency

The audit identified this error:

`ERR_MODULE_NOT_FOUND: Cannot find package 'eslint-plugin-react-hooks'`

Inspect:

- `frontend/package.json`
- The ESLint configuration files
- The installed dependency setup
- Existing React Hooks lint rules

If the package is genuinely missing:

1. Add the compatible `eslint-plugin-react-hooks` development dependency.
2. Use a version compatible with the existing ESLint configuration.
3. Update the lockfile using the package manager already used by the project.
4. Do not upgrade unrelated dependencies.
5. Do not disable React Hooks rules just to make lint pass.

Run the existing lint command after installation.

If the configuration requires a different correction, explain the issue before making unrelated configuration changes.

## 5. Regression Testing

After implementation, run the following checks.

### Frontend

- `npm.cmd run build`
- `npm.cmd run lint`

Test the affected workflows:

- Checkout preview and order placement.
- Customer order listing and order details.
- Admin order listing, filtering, and status updates.
- Admin payment listing and receipt preview.
- Payment approval and rejection.
- Admin shipment listing and updates.
- Admin customer listing and details.
- Admin review listing and moderation.
- Admin contact message listing and updates.
- Admin coupon management.
- Admin roles and permissions display.
- Admin reports and dashboard metrics.
- Admin payment instruction settings.

Confirm that loading, empty, success, and error states still work.

### Backend

Run the existing backend test suites without modifying backend functionality.

Confirm that previously passing suites remain passing.

Do not change database tables, migrations, seeders, or existing backend business rules.

## 6. Final Verification

Create a report:

`frontend/PHASE6_STEP11_API_RESPONSE_FIX_REPORT.md`

Include:

1. Root cause of the response-unwrapping defect.
2. Files inspected.
3. Files modified.
4. The correction made in each affected API service.
5. Payment receipt Blob handling correction.
6. ESLint dependency/configuration correction.
7. Frontend build result.
8. Frontend lint result.
9. Backend regression test results.
10. Workflows manually verified.
11. Any remaining issues or limitations.

Clearly distinguish between automated tests, manual browser verification, and checks that could not be performed.

## Strict Scope Restrictions

- Do not redesign the frontend.
- Do not modify unrelated components.
- Do not implement Contact, Profile, Account Dashboard, or Password Reset integrations in this step.
- Do not implement missing backend endpoints.
- Do not modify the database.
- Do not change authentication or RBAC behavior.
- Do not remove existing functionality.
- Do not replace real API integration with mock data.
- Do not perform general code cleanup.

**Completion condition:** The 11 affected services must correctly handle the actual response structure, payment receipt previews must work with valid Blob responses, and frontend build and lint checks must pass.

Stop after completing this step and producing the report. Do not begin Step 12 without approval.