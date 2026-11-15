/**
 * IBTU E-Commerce Backend
 * src/routes/orders.js
 */

const express = require('express');
const router = express.Router();

const {
  createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Customer routes
router.use(authenticate);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

// Admin routes
router.get('/admin/all', authorizeAdmin, getAllOrders);
router.patch('/admin/:id/status', authorizeAdmin, updateOrderStatus);

module.exports = router;
