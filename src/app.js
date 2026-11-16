/**
 * IBTU E-Commerce Backend
 * src/app.js
 *
 * Express Application Setup
 * Configured in accordance with Phase 1 Step 3 & Step 4 specifications:
 * 1. Security middleware (Helmet)
 * 2. CORS
 * 3. Request body parsers
 * 4. API rate limiting
 * 5. API routes
 * 6. 404 Not Found middleware
 * 7. Centralized Error middleware
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// ─── Middleware ───────────────────────────────────────────────────────────────
const notFoundMiddleware = require('./middleware/not-found.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// ─── Route Modules ────────────────────────────────────────────────────────────
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders');
const variantRoutes = require('./routes/variant.routes');
const productImageRoutes = require('./routes/product-image.routes');
const catalogRoutes = require('./routes/catalog.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const addressRoutes = require('./routes/address.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminPaymentRoutes = require('./routes/admin-payment.routes');
const couponRoutes = require('./routes/coupon.routes');
const adminCouponRoutes = require('./routes/admin-coupon.routes');

// ─── Express App Instance ─────────────────────────────────────────────────────
const app = express();

// 1. Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// 2. CORS - Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body Parsers (Parse JSON & URL-encoded request bodies)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded images (product images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request Logger in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 minutes for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

// 5. API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
// Variant routes — mounted at /api so the router's full paths are preserved:
//   /api/products/:productId/variants  (nested under product)
//   /api/variants/:id                  (direct variant access)
app.use('/api', variantRoutes);
app.use('/api', productImageRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);

// 6. 404 Not Found Middleware (catches any unmatched route)
app.use(notFoundMiddleware);

// 7. Centralized Error Middleware (must be the last middleware in the pipeline)
app.use(errorMiddleware);

module.exports = app;
