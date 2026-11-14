/**
 * IBTU E-Commerce Backend
 * src/routes/products.js
 */

const express = require('express');
const router = express.Router();

const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');

// Public — everyone can browse products
router.get('/', optionalAuth, getProducts);
router.get('/:identifier', optionalAuth, getProduct);

// Admin only
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
