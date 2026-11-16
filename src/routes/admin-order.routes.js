/**
 * IBTU E-Commerce Backend
 * src/routes/admin-order.routes.js
 *
 * Shop Owner / Admin Order Management & Shipment Routes
 * Enforces authentication and 'Admin' role check.
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const ShipmentController = require('../controllers/shipment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permission.middleware');
const {
  validateOrderId,
  validateUpdateOrderStatus,
  validateCancelOrder,
} = require('../validators/order.validator');
const { validateCreateShipment } = require('../validators/shipment.validator');

// All admin order routes require Admin authentication
router.use(authenticate);
router.use(requireRole('Admin'));

// GET /api/admin/orders (List all orders with filters, search, pagination)
router.get('/', OrderController.getAllOrders);

// GET /api/admin/orders/:id (Get full order details)
router.get('/:id', validateOrderId, OrderController.getOrderDetails);

// PATCH /api/admin/orders/:id/status (Update order status & fulfillment)
router.patch('/:id/status', validateUpdateOrderStatus, OrderController.updateOrderStatus);

// POST /api/admin/orders/:id/cancel (Admin cancel order)
router.post('/:id/cancel', validateCancelOrder, OrderController.cancelOrder);

// POST /api/admin/orders/:id/shipments (Create shipment for order)
router.post('/:id/shipments', validateCreateShipment, ShipmentController.createShipment);

// GET /api/admin/orders/:id/shipments (List shipments for order)
router.get('/:id/shipments', validateOrderId, ShipmentController.getOrderShipments);

module.exports = router;
