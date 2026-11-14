/**
 * IBTU E-Commerce Backend
 * src/controllers/productController.js
 */

const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/products
 * List products with optional filters, sort, and pagination.
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category_id, search, min_price, max_price,
      sort = 'created_at', order = 'DESC',
      page = 1, limit = 12,
      type, // 'featured' | 'best_seller' | 'new_arrival'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Handle type shortcuts
    if (type && ['featured', 'best_seller', 'new_arrival'].includes(type)) {
      const products = await Product.findByType(type, limitNum);
      return sendSuccess(res, 200, 'Products retrieved.', { products });
    }

    const filters = { category_id, search, min_price, max_price, sort, order, limit: limitNum, offset };
    const [products, total] = await Promise.all([
      Product.findAll(filters),
      Product.count({ category_id, search, min_price, max_price }),
    ]);

    return sendSuccess(res, 200, 'Products retrieved.', {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:identifier
 * Get a single product by id (numeric) or slug (string).
 */
const getProduct = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const product = isNumeric
      ? await Product.findById(parseInt(identifier))
      : await Product.findBySlug(identifier);

    if (!product) return sendError(res, 404, 'Product not found.');

    // Parse JSON fields stored as strings in the DB
    if (product.images && typeof product.images === 'string') {
      try { product.images = JSON.parse(product.images); } catch { product.images = []; }
    }
    if (product.sizes && typeof product.sizes === 'string') {
      try { product.sizes = JSON.parse(product.sizes); } catch { product.sizes = []; }
    }
    if (product.colors && typeof product.colors === 'string') {
      try { product.colors = JSON.parse(product.colors); } catch { product.colors = []; }
    }

    // Fetch related products
    const related = await Product.findRelated(product.id, product.category_id, 4);

    return sendSuccess(res, 200, 'Product retrieved.', { product, related });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/products  [admin only]
 */
const createProduct = async (req, res, next) => {
  try {
    const id = await Product.create(req.body);
    const product = await Product.findById(id);
    return sendSuccess(res, 201, 'Product created.', { product });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id  [admin only]
 */
const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.update(parseInt(req.params.id), req.body);
    if (!updated) return sendError(res, 404, 'Product not found or nothing changed.');
    const product = await Product.findById(parseInt(req.params.id));
    return sendSuccess(res, 200, 'Product updated.', { product });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/products/:id  [admin only]
 */
const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.delete(parseInt(req.params.id));
    if (!deleted) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'Product deleted (soft).');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
