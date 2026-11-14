/**
 * IBTU E-Commerce Backend
 * src/utils/api-response.js
 *
 * Standardized API Response Formatter
 * Ensures every JSON response across the entire backend follows the exact same contract:
 * Success: { success: true, message: string, data: any, meta: object | null }
 * Error:   { success: false, message: string, errors: any }
 */

class ApiResponse {
  /**
   * Generic successful response (HTTP 200 by default)
   * @param {object} res - Express response object
   * @param {string} message - Human-readable success message
   * @param {*} data - Payload data
   * @param {object|null} meta - Optional metadata (e.g., pagination: page, limit, total)
   * @param {number} statusCode - HTTP status code
   */
  static success(res, message = 'Operation successful', data = null, meta = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  /**
   * Resource created successfully (HTTP 201)
   * @param {object} res - Express response object
   * @param {string} message - Human-readable creation message
   * @param {*} data - Created entity payload
   * @param {object|null} meta - Optional metadata
   */
  static created(res, message = 'Resource created successfully', data = null, meta = null) {
    return ApiResponse.success(res, message, data, meta, 201);
  }

  /**
   * Client error response (HTTP 400 by default, or 401, 403, 404, 422)
   * @param {object} res - Express response object
   * @param {string} message - Human-readable error message
   * @param {*} errors - Validation errors or field error details
   * @param {number} statusCode - HTTP status code
   */
  static clientError(res, message = 'Bad request', errors = null, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  /**
   * Server error response (HTTP 500 by default, or 503)
   * @param {object} res - Express response object
   * @param {string} message - Safe message to show the client
   * @param {*} errors - Optional sanitized error details
   * @param {number} statusCode - HTTP status code
   */
  static serverError(res, message = 'Internal server error', errors = null, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
