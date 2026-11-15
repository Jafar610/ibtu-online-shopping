/**
 * IBTU E-Commerce Backend
 * src/middleware/auth.js
 *
 * JWT authentication middleware.
 * Verifies the Bearer token in the Authorization header,
 * attaches the decoded user payload to req.user, and calls next().
 *
 * Usage:
 *   router.get('/protected', authenticate, (req, res) => { ... });
 *   router.get('/admin-only', authenticate, authorizeAdmin, (req, res) => { ... });
 */

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

/**
 * authenticate
 * Checks for a valid JWT and attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  // 1. Extract the token from the Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No authentication token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using the secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach the decoded payload (id, email, role) to req.user
    req.user = decoded;
    next();
  } catch (error) {
    // Let the global error handler format the response
    next(error);
  }
};

/**
 * authorizeAdmin
 * Restricts the route to users with role === 'admin'.
 * Must be used AFTER authenticate.
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }
  next();
};

/**
 * optionalAuth
 * Attaches req.user if a valid token is present, but does NOT block the request
 * if no token is provided. Useful for routes like GET /products where guests
 * can browse but logged-in users get personalized data.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { authenticate, authorizeAdmin, optionalAuth };
