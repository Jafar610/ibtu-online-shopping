/**
 * IBTU E-Commerce Backend
 * src/routes/health.js
 *
 * Health check endpoints — useful for monitoring and load balancers.
 *
 * GET /api/health      → server status
 * GET /api/health/db   → database connection status
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

// Server health
router.get('/', (req, res) => {
  return sendSuccess(res, 200, 'IBTU API is running.', {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Database health
router.get('/db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name, VERSION() AS database_version;'
    );
    const { database_name } = rows[0];
    return sendSuccess(res, 200, 'Database connection successful.', {
      database: database_name,
    });
  } catch (err) {
    return sendError(res, 503, 'Database connection failed. Check that MariaDB is running.');
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
