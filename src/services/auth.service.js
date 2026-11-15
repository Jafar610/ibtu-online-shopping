/**
 * IBTU E-Commerce Backend
 * src/services/auth.service.js
 *
 * Authentication Business Logic Service
 * Handles user registration with transaction, password hashing,
 * credential verification, role loading, and JWT generation.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class AuthService {
  /**
   * Generate a signed JSON Web Token (JWT)
   * @param {object} payload - { id, email, roles }
   * @returns {string} Signed JWT string
   */
  static generateToken(payload) {
    const secret = process.env.JWT_SECRET || 'ibtu_default_secure_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Helper to format a safe user object (strips password_hash)
   */
  static formatSafeUser(user, roles = []) {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || null,
      is_active: Boolean(user.is_active),
      roles: roles.length > 0 ? roles : (user.roles || []),
      last_login_at: user.last_login_at || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Register a new Customer account with atomic transaction
   * @param {object} userData - { first_name, last_name, email, phone, password }
   */
  static async registerCustomer({ first_name, last_name, email, phone = null, password }) {
    // 1. Check for existing email
    const [existingEmail] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existingEmail.length > 0) {
      throw new AppError('An account with this email address already exists.', 409, [
        { field: 'email', message: 'Email is already in use.' }
      ]);
    }

    // 2. Check for existing phone if provided
    if (phone) {
      const [existingPhone] = await pool.execute(
        'SELECT id FROM users WHERE phone = ? LIMIT 1',
        [phone]
      );
      if (existingPhone.length > 0) {
        throw new AppError('An account with this phone number already exists.', 409, [
          { field: 'phone', message: 'Phone number is already in use.' }
        ]);
      }
    }

    // 3. Find Customer role ID (Public registration MUST strictly assign Customer role)
    const [roleRows] = await pool.execute(
      'SELECT id, name FROM roles WHERE name = ? LIMIT 1',
      ['Customer']
    );
    if (roleRows.length === 0) {
      throw new AppError('System configuration error: Customer role not found in database.', 500);
    }
    const customerRole = roleRows[0];

    // 4. Hash password with bcryptjs
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const password_hash = await bcrypt.hash(password, rounds);

    // 5. Atomic transaction: Insert user + assign Customer role
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert user
      const [insertUserResult] = await connection.execute(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [first_name, last_name, email, phone || null, password_hash]
      );
      const newUserId = insertUserResult.insertId;

      // Assign Customer role in user_roles
      await connection.execute(
        `INSERT INTO user_roles (user_id, role_id, assigned_at)
         VALUES (?, ?, NOW())`,
        [newUserId, customerRole.id]
      );

      await connection.commit();

      // 6. Fetch created user record
      const [userRows] = await pool.execute(
        'SELECT id, first_name, last_name, email, phone, is_active, created_at, updated_at FROM users WHERE id = ?',
        [newUserId]
      );
      const newUser = userRows[0];
      const assignedRoles = [customerRole.name];

      // 7. Generate JWT
      const token = AuthService.generateToken({
        id: newUser.id,
        email: newUser.email,
        roles: assignedRoles,
      });

      return {
        token,
        user: AuthService.formatSafeUser(newUser, assignedRoles),
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Authenticate user with email and password
   * @param {object} credentials - { email, password }
   */
  static async loginUser({ email, password }) {
    // 1. Fetch user by email including password_hash
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      // Generic message to prevent email enumeration attacks
      throw new AppError('Invalid email or password.', 401);
    }

    const user = users[0];

    // 2. Reject inactive accounts
    if (!user.is_active) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // 3. Compare password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 4. Load assigned roles from user_roles JOIN roles
    const [roleRows] = await pool.execute(
      `SELECT r.name
       FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const roles = roleRows.map((r) => r.name);

    // 5. Update last_login_at timestamp
    await pool.execute(
      'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 6. Generate signed JWT token
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      roles,
    });

    return {
      token,
      user: AuthService.formatSafeUser(user, roles),
    };
  }

  /**
   * Get user profile by ID including roles
   * @param {number} userId
   */
  static async getUserProfile(userId) {
    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone, is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User profile not found.', 404);
    }

    const user = users[0];

    // Load roles
    const [roleRows] = await pool.execute(
      `SELECT r.name, r.description
       FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const roles = roleRows.map((r) => r.name);

    return AuthService.formatSafeUser(user, roles);
  }
}

module.exports = AuthService;
