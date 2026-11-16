/**
 * IBTU E-Commerce Backend
 * src/routes/admin-shipment.routes.js
 *
 * Shop Owner / Admin Shipment Status Routes
 * Enforces authentication and 'Admin' role check.
 */

const express = require('express');
const router = express.Router();
const ShipmentController = require('../controllers/shipment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permission.middleware');
const { validateUpdateShipmentStatus } = require('../validators/shipment.validator');

// All admin shipment routes require Admin authentication
router.use(authenticate);
router.use(requireRole('Admin'));

// PATCH /api/admin/shipments/:shipmentId/status (Update shipment status)
router.patch(
  '/:shipmentId/status',
  validateUpdateShipmentStatus,
  ShipmentController.updateShipmentStatus
);

module.exports = router;
