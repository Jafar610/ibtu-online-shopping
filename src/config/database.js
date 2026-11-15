/**
 * IBTU E-Commerce Backend
 * src/config/database.js
 *
 * MariaDB connection pool using mysql2/promise.
 *
 * WHY A POOL?
 * -----------
 * A connection pool maintains a set of reusable database connections.
 * Instead of opening/closing a connection for every request (which is slow),
 * the pool lends an existing connection and takes it back when done.
 *
 * createConnection()  → single one-time connection (not suitable for servers)
 * createPool()        → multiple reusable connections (production-ready)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool configuration — all values come from .env, never hardcoded
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ibutu_ecommerce',

  // Character set — supports Amharic (Ethiopic) Unicode characters
  charset: 'utf8mb4',

  // waitForConnections: if the pool is full, queue the request instead of throwing
  waitForConnections: true,

  // connectionLimit: maximum number of simultaneous connections in the pool
  connectionLimit: 10,

  // queueLimit: 0 = unlimited queue; set a number to cap waiting requests
  queueLimit: 0,

  // Keep the connection alive (prevents "PROTOCOL_CONNECTION_LOST" errors)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // Automatically reconnect on connection loss
  multipleStatements: false,
};

// Create the connection pool
const pool = mysql.createPool(poolConfig);

/**
 * testConnection
 * -------------
 * Acquires a connection from the pool, runs a lightweight query,
 * logs the result, and releases the connection back to the pool.
 *
 * Called once at server startup to verify DB connectivity.
 */
const testConnection = async () => {
  let connection;
  try {
    // Acquire a connection from the pool
    connection = await pool.getConnection();

    // Run a safe, read-only query to confirm the connected database and version
    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name, VERSION() AS database_version;'
    );

    const { database_name, database_version } = rows[0];

    console.log('✅ Database connected successfully');
    console.log(`   Database : ${database_name}`);
    console.log(`   Version  : ${database_version}`);

    return true;
  } catch (error) {
    // Log a safe message — do NOT expose credentials
    console.error('❌ Database connection failed');
    console.error(`   Reason   : ${error.message}`);
    console.error('   Check that XAMPP / MariaDB is running and your .env credentials are correct.');
    return false;
  } finally {
    // Always release the connection back to the pool
    if (connection) connection.release();
  }
};

module.exports = { pool, testConnection };
