/**
 * IBTU E-Commerce Backend
 * src/routes/auth.js
 */

const express = require('express');
const router = express.Router();

const {
  register, login, getMe, forgotPassword, resetPassword, updateProfile,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} = require('../validators/authValidators');

// Public routes
router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.post('/forgot-password', forgotPasswordValidators, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidators, validate, resetPassword);

// Protected routes (requires JWT)
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
