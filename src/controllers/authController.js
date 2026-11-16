/**
 * IBTU E-Commerce Backend
 * src/controllers/authController.js
 *
 * Handles: register, login, logout, getMe, forgotPassword, resetPassword
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a signed JWT for a given user.
 */
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/**
 * Strip the password_hash from a user object before sending it to the client.
 */
const sanitizeUser = (user) => {
  const { password_hash, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Register a new customer account.
 */
const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // Check for duplicate email
    const existing = await User.findByEmail(email);
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    // Hash the password (never store plain text)
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, rounds);

    // Create the user
    const newUser = await User.create({ first_name, last_name, email, password_hash, phone, role: 'customer' });

    // Issue JWT
    const token = generateToken(newUser);

    return sendSuccess(res, 201, 'Account created successfully.', {
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate an existing user and return a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user (we need password_hash so we use findByEmail which returns the full row)
    const user = await User.findByEmail(email);
    if (!user) {
      // Generic message — do not reveal whether email exists
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Compare the submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user);

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 * Requires: authenticate middleware
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'Profile retrieved.', { user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Send a password reset link (mocked — logs token to console).
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    // Always return 200 so we don't reveal whether the email exists
    if (!user) {
      return sendSuccess(res, 200, 'If that email exists, a reset link has been sent.');
    }

    // Generate a secure random token and hash it before storing
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.setResetToken(email, hashedToken, expiresAt);

    // In production: send email with rawToken link
    // For development: log the raw token to the server console
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    console.log('🔑 [DEV] Password reset link:', resetLink);

    return sendSuccess(res, 200, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Validate the reset token and set a new password.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash the submitted token to compare with the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findByResetToken(hashedToken);

    if (!user) {
      return sendError(res, 400, 'Invalid or expired password reset token.');
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, rounds);

    await User.updatePassword(user.id, password_hash);
    await User.clearResetToken(user.id);

    return sendSuccess(res, 200, 'Password reset successfully. You can now log in.');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile fields.
 */
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;
    await User.update(req.user.id, { first_name, last_name, phone });
    const updated = await User.findById(req.user.id);
    return sendSuccess(res, 200, 'Profile updated.', { user: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile };
