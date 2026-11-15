/**
 * IBTU E-Commerce Backend
 * src/middleware/error.middleware.js
 *
 * Centralized Error-Handling Middleware
 * Catches all operational and unexpected errors, ensures safe logging,
 * and returns consistent JSON error responses via ApiResponse.
 */

const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of AppError, convert it
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    error = new AppError(message, statusCode);
    error.isOperational = false;
  }

  // Handle MariaDB / MySQL specific error codes
  if (err.code === 'ER_DUP_ENTRY') {
    // E.g., Duplicate entry for email or phone
    const fieldMatch = err.sqlMessage ? err.sqlMessage.match(/for key '(.+?)'/) : null;
    const key = fieldMatch ? fieldMatch[1] : 'field';
    const cleanField = key.includes('email') ? 'email' : key.includes('phone') ? 'phone' : key;
    error = new AppError(`A user with this ${cleanField} already exists.`, 409, [
      { field: cleanField, message: `This ${cleanField} is already registered.` }
    ]);
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new AppError('Referenced resource does not exist.', 400);
  } else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token.', 401);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token has expired. Please log in again.', 401);
  }

  // Server-side logging for diagnostics
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [${req.method} ${req.originalUrl}] Error:`, error.message);
    if (!error.isOperational) {
      console.error(err.stack);
    }
  }

  // Prepare safe response
  const statusCode = error.statusCode || 500;
  const message = (process.env.NODE_ENV === 'production' && !error.isOperational)
    ? 'An unexpected error occurred. Please try again later.'
    : error.message;

  return res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || null,
  });
};

module.exports = errorMiddleware;
