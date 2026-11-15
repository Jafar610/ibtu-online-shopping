/**
 * IBTU E-Commerce Backend
 * src/middleware/auth.middleware.js
 *
 * Authentication & Role Authorization Middleware
 * Verifies JWT tokens, validates active user status against the database,
 * and enforces Role-Based Access Control (RBAC).
 */

const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

/**
 * authenticate
 * Verifies the JWT Bearer token and attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Invalid token format.', 401));
    }

    // 2. Verify token signature and expiration
    const secret = process.env.JWT_SECRET || 'ibtu_default_secure_secret_key';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Authentication token has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // 3. Confirm user still exists and is active in MariaDB
    const [userRows] = await pool.execute(
      'SELECT id, email, is_active FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (userRows.length === 0) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    const user = userRows[0];
    if (!user.is_active) {
      return next(new AppError('This user account has been deactivated.', 403));
    }

    // 4. Load latest roles from database to prevent stale tokens if roles changed
    const [roleRows] = await pool.execute(
      `SELECT r.name
       FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const roles = roleRows.map((r) => r.name);

    // 5. Attach safe user payload to req.user
    req.user = {
      id: user.id,
      email: user.email,
      roles,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorizeRoles
 * Restricts access to users who possess at least one of the specified roles.
 * Example: router.get('/admin/stats', authenticate, authorizeRoles('Admin'), controller);
 * @param  {...string} allowedRoles - e.g. 'Admin', 'Data Encoder', 'Customer'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new AppError('Access denied. Authentication required.', 401));
    }

    const hasPermission = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasPermission) {
      return next(new AppError('Access denied. You do not have permission to perform this action.', 403));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
