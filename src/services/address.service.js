/**
 * IBTU E-Commerce Backend
 * src/services/address.service.js
 *
 * Customer Address Business Logic & Database Operations
 *
 * Guarantees:
 *  - Strict customer ownership verification on all operations.
 *  - Atomic default address management (at most 1 default address per customer).
 *  - Automatic promotion of a secondary address to default when default is deleted.
 *  - Historical order relationship protection (addresses with past orders cannot be deleted).
 *  - Transactions on multi-query state mutations.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class AddressService {
  /**
   * Format database row into standard API payload
   */
  static formatAddress(row) {
    return {
      id: row.id,
      user_id: row.user_id,
      address_type: row.address_type,
      recipient_name: row.recipient_name,
      phone: row.phone,
      address_line1: row.address_line1,
      address_line2: row.address_line2 || null,
      city: row.city,
      region: row.region || null,
      postal_code: row.postal_code || null,
      country: row.country,
      is_default: Boolean(row.is_default),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Retrieve all saved addresses for a customer (default address first)
   */
  static async getAddresses(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM customer_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return rows.map((r) => this.formatAddress(r));
  }

  /**
   * Retrieve a single address for a customer by ID
   */
  static async getAddressById(userId, addressId) {
    const [[address]] = await pool.query(
      'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    if (!address) {
      throw AppError.notFound('Address not found.');
    }

    return this.formatAddress(address);
  }

  /**
   * Create a new address for a customer
   */
  static async createAddress(userId, data) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check current address count
      const [[{ count }]] = await conn.query(
        'SELECT COUNT(*) as count FROM customer_addresses WHERE user_id = ?',
        [userId]
      );

      // If customer has no addresses, the first address automatically becomes default
      const shouldBeDefault = count === 0 || Boolean(data.is_default);

      if (shouldBeDefault) {
        // Unset any existing default address for this customer
        await conn.query(
          'UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      const [insertResult] = await conn.query(
        `INSERT INTO customer_addresses
          (user_id, address_type, recipient_name, phone, address_line1, address_line2, city, region, postal_code, country, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.address_type || 'home',
          data.recipient_name,
          data.phone,
          data.address_line1,
          data.address_line2 || null,
          data.city,
          data.region || null,
          data.postal_code || null,
          data.country || 'Ethiopia',
          shouldBeDefault ? 1 : 0,
        ]
      );

      const [[created]] = await conn.query(
        'SELECT * FROM customer_addresses WHERE id = ?',
        [insertResult.insertId]
      );

      await conn.commit();

      return this.formatAddress(created);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Update an existing address
   */
  static async updateAddress(userId, addressId, data) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Verify ownership
      const [[existing]] = await conn.query(
        'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );

      if (!existing) {
        throw AppError.notFound('Address not found.');
      }

      // 2. Handle default status changes
      if (data.is_default === true) {
        await conn.query(
          'UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      // 3. Build dynamic update
      const allowedFields = [
        'address_type',
        'recipient_name',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'region',
        'postal_code',
        'country',
        'is_default',
      ];

      const setClauses = [];
      const values = [];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          if (field === 'is_default') {
            setClauses.push('is_default = ?');
            values.push(data.is_default ? 1 : 0);
          } else {
            setClauses.push(`${field} = ?`);
            values.push(data[field]);
          }
        }
      }

      if (setClauses.length > 0) {
        values.push(addressId, userId);
        await conn.query(
          `UPDATE customer_addresses SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
          values
        );
      }

      const [[updated]] = await conn.query(
        'SELECT * FROM customer_addresses WHERE id = ?',
        [addressId]
      );

      await conn.commit();

      return this.formatAddress(updated);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Delete an address safely
   */
  static async deleteAddress(userId, addressId) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Verify ownership
      const [[existing]] = await conn.query(
        'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );

      if (!existing) {
        throw AppError.notFound('Address not found.');
      }

      // 2. Protect historical order relationships
      const [[orderReference]] = await conn.query(
        'SELECT id FROM orders WHERE shipping_address_id = ? LIMIT 1',
        [addressId]
      );

      if (orderReference) {
        throw AppError.badRequest(
          'Cannot delete this address because it is associated with existing orders.'
        );
      }

      // 3. Delete address
      await conn.query(
        'DELETE FROM customer_addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );

      // 4. If the deleted address was default, promote another address to default
      if (existing.is_default) {
        const [[nextDefault]] = await conn.query(
          'SELECT id FROM customer_addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
          [userId]
        );

        if (nextDefault) {
          await conn.query(
            'UPDATE customer_addresses SET is_default = 1 WHERE id = ?',
            [nextDefault.id]
          );
        }
      }

      await conn.commit();

      return { id: addressId, deleted: true };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Set a specific address as the customer's default address
   */
  static async setDefaultAddress(userId, addressId) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Verify ownership
      const [[existing]] = await conn.query(
        'SELECT id FROM customer_addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );

      if (!existing) {
        throw AppError.notFound('Address not found.');
      }

      // 2. Reset other defaults
      await conn.query(
        'UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      );

      // 3. Set this address as default
      await conn.query(
        'UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );

      const [[updated]] = await conn.query(
        'SELECT * FROM customer_addresses WHERE id = ?',
        [addressId]
      );

      await conn.commit();

      return this.formatAddress(updated);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = AddressService;
