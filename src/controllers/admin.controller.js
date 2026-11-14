/**
 * IBTU E-Commerce Backend
 * src/controllers/admin.controller.js
 *
 * Administrative Controller
 * Handles administrative metrics and RBAC management.
 */

const { pool } = require('../config/database');
const ApiResponse = require('../utils/api-response');

class AdminController {
  /**
   * Get Admin Dashboard overview
   * GET /api/admin/dashboard
   * Requires: requireRole('Admin')
   */
  static async getDashboard(req, res, next) {
    try {
      const [[userStats], [productStats], [orderStats]] = await Promise.all([
        pool.execute('SELECT COUNT(*) AS total_users FROM users'),
        pool.execute('SELECT COUNT(*) AS total_products FROM products'),
        pool.execute('SELECT COUNT(*) AS total_orders FROM orders'),
      ]);

      const data = {
        total_users: userStats[0]?.total_users || 0,
        total_products: productStats[0]?.total_products || 0,
        total_orders: orderStats[0]?.total_orders || 0,
        server_time: new Date().toISOString(),
      };

      return ApiResponse.success(res, 'Admin dashboard metrics retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get system roles and permissions list
   * GET /api/admin/roles
   * Requires: requirePermission('roles.manage')
   */
  static async getRolesAndPermissions(req, res, next) {
    try {
      const [roles] = await pool.execute('SELECT * FROM roles ORDER BY id ASC');
      const [permissions] = await pool.execute('SELECT * FROM permissions ORDER BY id ASC');

      return ApiResponse.success(res, 'Roles and permissions retrieved successfully', {
        roles,
        permissions,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
