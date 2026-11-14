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
require('dotenv').config();

// ─── Middleware ───────────────────────────────────────────────────────────────
const notFoundMiddleware = require('./middleware/not-found.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// ─── Route Modules ────────────────────────────────────────────────────────────
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// ─── Express App Instance ─────────────────────────────────────────────────────
const app = express();

// 1. Security Middleware
app.use(helmet());

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

// 6. 404 Not Found Middleware (catches any unmatched route)
app.use(notFoundMiddleware);

// 7. Centralized Error Middleware (must be the last middleware in the pipeline)
app.use(errorMiddleware);

module.exports = app;
