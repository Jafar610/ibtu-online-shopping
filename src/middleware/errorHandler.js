/**
 * IBTU E-Commerce Backend
 * src/middleware/errorHandler.js
 *
 * Global error handler — must be the LAST middleware registered in app.js.
 * Catches any error passed via next(error) from any route/controller.
 */

const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  // Log the error server-side (never expose stack traces to the client)
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle known MySQL / MariaDB error codes
  if (err.code === 'ER_DUP_ENTRY') {
    return sendError(res, 409, 'A record with this value already exists.');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return sendError(res, 400, 'Referenced record does not exist.');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token has expired. Please log in again.');
  }

  // Handle express-validator errors forwarded as plain objects
  if (err.type === 'validation') {
    return sendError(res, 422, 'Validation failed.', err.errors);
  }

  // Default: use the status code attached to the error or 500
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal Server Error';

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
