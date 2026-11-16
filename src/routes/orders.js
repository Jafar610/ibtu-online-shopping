/**
 * IBTU E-Commerce Backend
 * src/routes/orders.js
 */

const express = require('express');
const router = express.Router();

const {
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permission.middleware');

// All order routes require authentication
router.use(authenticate);

// Customer endpoints
router.get('/', getMyOrders);
router.get('/:id', getOrder);

// Admin endpoints
router.get('/admin/all', requireRole('Admin'), getAllOrders);
router.patch('/admin/:id/status', requireRole('Admin'), updateOrderStatus);

module.exports = router;
