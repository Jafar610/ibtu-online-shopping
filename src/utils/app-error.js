/**
 * IBTU E-Commerce Backend
 * src/utils/app-error.js
 *
 * Custom Application Error Class
 * Extends JavaScript's native Error class to handle operational errors.
 *
 * Operational errors are expected errors that can occur during normal usage
 * (e.g., invalid input, item not found, duplicate email, insufficient stock),
 * as opposed to programming bugs (e.g., undefined variable, syntax error).
 */

class AppError extends Error {
  /**
   * @param {string} message - Error description
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 403, 404, 409, 422)
   * @param {*} errors - Optional specific field errors or details
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);

    this.statusCode = statusCode;
    // Status category: 'fail' for 4xx client errors, 'error' for 5xx server errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errors = errors;

    // isOperational flag differentiates known business errors from unknown system crashes
    this.isOperational = true;

    // Capture the stack trace while omitting constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  // Common error shortcuts for convenience
  static badRequest(message = 'Bad request', errors = null) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden access') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }

  static unprocessable(message = 'Validation failed', errors = null) {
    return new AppError(message, 422, errors);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500);
  }
}

module.exports = AppError;
