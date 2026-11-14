/**
 * IBTU E-Commerce Backend
 * server.js  (project root entry point)
 *
 * Loads environment variables, tests the database connection,
 * and starts the Express HTTP server.
 */

require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('');
  console.log('🚀 Starting IBTU E-Commerce API...');
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  // Test the database connection before accepting traffic
  const dbOk = await testConnection();

  if (!dbOk && process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot start server: database is unavailable.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`   Health check : http://localhost:${PORT}/api/health`);
    console.log(`   DB health    : http://localhost:${PORT}/api/health/db`);
    console.log('');
  });
};

startServer();
