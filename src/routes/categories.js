/**
 * IBTU E-Commerce Backend
 * src/routes/categories.js
 */

const express = require('express');
const router = express.Router();

const {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post('/', authenticate, authorizeAdmin, createCategory);
router.put('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

module.exports = router;
