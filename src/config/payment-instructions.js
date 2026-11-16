/**
 * IBTU E-Commerce Backend
 * src/config/payment-instructions.js
 *
 * Secure Configuration & Management for Payment Instructions
 * Loads instructions dynamically and allows Admin updates.
 */

const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'payment-instructions.json');

const PaymentInstructions = {
  /**
   * Get all active payment instructions
   */
  getAll() {
    try {
      if (fs.existsSync(configFilePath)) {
        const raw = fs.readFileSync(configFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to read payment instructions config:', err.message);
    }
    return {};
  },

  /**
   * Get instructions for a specific method
   */
  getByMethod(method) {
    const all = this.getAll();
    return all[method] || null;
  },

  /**
   * Update payment instructions (Admin only)
   */
  update(method, data) {
    const all = this.getAll();
    all[method] = {
      ...(all[method] || {}),
      ...data,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(configFilePath, JSON.stringify(all, null, 2), 'utf8');
    return all[method];
  },
};

module.exports = PaymentInstructions;
