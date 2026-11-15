/**
 * IBTU E-Commerce Backend
 * src/middleware/not-found.middleware.js
 *
 * Catches any unhandled routes and forwards a 404 AppError
 */

const AppError = require('../utils/app-error');

const notFoundMiddleware = (req, res, next) => {
  next(new AppError(`API endpoint not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFoundMiddleware;
