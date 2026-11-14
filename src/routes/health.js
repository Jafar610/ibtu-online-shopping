/**
 * IBTU E-Commerce Backend
 * src/routes/health.js
 *
 * Health check endpoints for monitoring and server status.
 *
 * GET /api/health      → server status
 * GET /api/health/db   → database connection status
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');

// Server health
router.get('/', (req, res) => {
  return ApiResponse.success(res, 'IBTU API is running smoothly.', {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Database health
router.get('/db', async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name, VERSION() AS database_version;'
    );
    const { database_name, database_version } = rows[0];

    return ApiResponse.success(res, 'Database connection successful.', {
      database: database_name,
      version: database_version,
    });
  } catch (err) {
    return next(new AppError('Database connection failed. Please ensure MariaDB is running.', 503));
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
