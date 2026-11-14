/**
 * IBTU E-Commerce Backend
 * src/utils/response.js
 *
 * Helpers to send consistent JSON responses across all controllers.
 * Every API response follows: { success, message, data?, error? }
 */

/**
 * Send a success response
 * @param {object} res  - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message    - Human-readable success message
 * @param {*}      data       - Payload to return to the client
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {object} res  - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message    - Human-readable error message
 * @param {*}      errors     - Optional detailed error info (validation errors, etc.)
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
