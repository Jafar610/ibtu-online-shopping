/**
 * IBTU E-Commerce Backend
 * src/controllers/auth.controller.js
 *
 * Authentication HTTP Controllers
 * Bridges HTTP requests with AuthService and formats output using ApiResponse.
 */

const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/api-response');

class AuthController {
  /**
   * Register a new Customer account
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { first_name, last_name, email, phone, password } = req.body;

      const result = await AuthService.registerCustomer({
        first_name,
        last_name,
        email,
        phone,
        password,
      });

      return ApiResponse.created(
        res,
        'Account registered successfully. Welcome to IBTU!',
        result
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authenticate and login an existing user
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser({ email, password });

      return ApiResponse.success(
        res,
        'Login successful. Welcome back!',
        result
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get authenticated user's profile and roles
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getUserProfile(req.user.id);

      return ApiResponse.success(
        res,
        'User profile retrieved successfully.',
        { user }
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   * In a stateless JWT architecture, the client removes the stored token.
   * This endpoint provides a clean, standard handshake.
   */
  static async logout(req, res, next) {
    try {
      return ApiResponse.success(
        res,
        'Logged out successfully.'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
