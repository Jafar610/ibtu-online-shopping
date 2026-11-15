/**
 * IBTU E-Commerce Backend
 * src/middleware/permission.middleware.js
 *
 * RBAC Permission & Role Authorization Middleware
 * Enforces fine-grained permission and role gates on protected routes.
 * Always queries the database through PermissionService to prevent stale authorization.
 */

const PermissionService = require('../services/permission.service');
const AppError = require('../utils/app-error');

/**
 * requirePermission
 * Requires that the authenticated user has a specific permission key.
 * Example: router.post('/products', authenticate, requirePermission('products.create'), controller);
 * @param {string} permissionKey - e.g. 'products.create', 'users.manage'
 */
const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      // 1. Ensure user has been authenticated by auth.middleware first
      if (!req.user || !req.user.id) {
        return next(new AppError('Authentication required. Please provide a valid token.', 401));
      }

      // 2. Perform live database permission check
      const hasPerm = await PermissionService.hasPermission(req.user.id, permissionKey);

      if (!hasPerm) {
        return next(
          new AppError(
            `Access denied. You do not have permission to perform this action (${permissionKey}).`,
            403
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * requireRole
 * Requires that the authenticated user possesses at least one of the specified roles.
 * Example: router.get('/admin/dashboard', authenticate, requireRole('Admin'), controller);
 * @param {...string} allowedRoles - e.g. 'Admin', 'Data Encoder'
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return next(new AppError('Authentication required. Please provide a valid token.', 401));
      }

      // 2. Perform live database role check
      const hasMatchingRole = await PermissionService.hasRole(req.user.id, allowedRoles);

      if (!hasMatchingRole) {
        return next(
          new AppError(
            `Access denied. This resource requires one of the following roles: [${allowedRoles.join(', ')}].`,
            403
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
};
