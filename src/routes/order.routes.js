/**
 * IBTU E-Commerce Backend
 * src/routes/order.routes.js
 *
 * Customer Order & Tracking Routes
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const ShipmentController = require('../controllers/shipment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateOrderId, validateCancelOrder } = require('../validators/order.validator');

// All customer order endpoints require authentication
router.use(authenticate);

// GET /api/orders (View authenticated customer's own orders)
router.get('/', OrderController.getCustomerOrders);

// GET /api/orders/:id (View order details if owner)
router.get('/:id', validateOrderId, OrderController.getOrderDetails);

// POST /api/orders/:id/cancel (Customer requests order cancellation if eligible)
router.post('/:id/cancel', validateCancelOrder, OrderController.cancelOrder);

// GET /api/orders/:id/tracking (Customer tracks shipment for own order)
router.get('/:id/tracking', validateOrderId, ShipmentController.getCustomerTracking);

module.exports = router;
