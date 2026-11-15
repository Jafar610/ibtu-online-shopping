/**
 * IBTU E-Commerce Backend
 * src/services/permission.service.js
 *
 * RBAC Permission Service
 * Handles live database-backed queries for roles and permissions.
 * Does not rely solely on JWT token claims, ensuring role or permission
 * revocations take effect immediately on subsequent requests.
 */

const { pool } = require('../config/database');

class PermissionService {
  /**
   * Retrieve all unique role names assigned to a user
   * @param {number} userId
   * @returns {Promise<string[]>} e.g. ['Admin'] or ['Data Encoder', 'Customer']
   */
  static async getUserRoles(userId) {
    const [rows] = await pool.execute(
      `SELECT DISTINCT r.name
       FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );

    return rows.map((r) => r.name);
  }

  /**
   * Retrieve all unique permission keys assigned to a user through all their roles
   * Uses an INNER JOIN across user_roles -> roles -> role_permissions -> permissions
   * @param {number} userId
   * @returns {Promise<string[]>} e.g. ['products.view', 'products.create', ...]
   */
  static async getUserPermissions(userId) {
    const [rows] = await pool.execute(
      `SELECT DISTINCT p.name
       FROM permissions p
       JOIN role_permissions rp ON rp.permission_id = p.id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ?
       ORDER BY p.name ASC`,
      [userId]
    );

    return rows.map((row) => row.name);
  }

  /**
   * Check whether a user has a specific permission
   * Returns true immediately if found, false otherwise
   * @param {number} userId
   * @param {string} permissionKey - e.g. 'products.create'
   * @returns {Promise<boolean>}
   */
  static async hasPermission(userId, permissionKey) {
    const [rows] = await pool.execute(
      `SELECT 1
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = ? AND p.name = ?
       LIMIT 1`,
      [userId, permissionKey]
    );

    return rows.length > 0;
  }

  /**
   * Check whether a user has any of the specified roles
   * @param {number} userId
   * @param {string[]} roleNames - e.g. ['Admin', 'Data Encoder']
   * @returns {Promise<boolean>}
   */
  static async hasRole(userId, roleNames) {
    if (!roleNames || roleNames.length === 0) return false;

    const placeholders = roleNames.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = ? AND r.name IN (${placeholders})
       LIMIT 1`,
      [userId, ...roleNames]
    );

    return rows.length > 0;
  }

  /**
   * Get full user authorization state (roles and permissions combined)
   * @param {number} userId
   */
  static async getUserAuthorization(userId) {
    const [roles, permissions] = await Promise.all([
      PermissionService.getUserRoles(userId),
      PermissionService.getUserPermissions(userId),
    ]);

    return { roles, permissions };
  }
}

module.exports = PermissionService;
