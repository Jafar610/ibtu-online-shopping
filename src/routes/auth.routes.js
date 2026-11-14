/**
 * IBTU E-Commerce Backend
 * src/routes/auth.routes.js
 *
 * Authentication API Endpoints
 * Maps incoming HTTP routes to validators and controllers.
 */

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validate,
  registerValidationRules,
  loginValidationRules,
} = require('../validators/auth.validator');

// ─── Public Endpoints ─────────────────────────────────────────────────────────

// POST /api/auth/register - Register a new customer
router.post('/register', registerValidationRules, validate, AuthController.register);

// POST /api/auth/login - User login
router.post('/login', loginValidationRules, validate, AuthController.login);

// ─── Protected Endpoints (Requires valid JWT) ────────────────────────────────

// GET /api/auth/me - Retrieve current user profile with roles
router.get('/me', authenticate, AuthController.getMe);

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
