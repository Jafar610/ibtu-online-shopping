/**
 * IBTU E-Commerce Backend
 * src/routes/admin.routes.js
 *
 * Dedicated Admin & RBAC Routes
 * Uses role and permission middleware to restrict access.
 */

const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, requirePermission } = require('../middleware/permission.middleware');

// All admin routes require authentication first
router.use(authenticate);

// Role-protected route: Only Admin role can access
router.get('/dashboard', requireRole('Admin'), AdminController.getDashboard);

// Permission-protected route: Requires 'roles.manage' permission (Admin only, Data Encoder lacks this)
router.get('/roles', requirePermission('roles.manage'), AdminController.getRolesAndPermissions);

module.exports = router;
