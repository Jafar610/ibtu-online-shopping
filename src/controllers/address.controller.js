/**
 * IBTU E-Commerce Backend
 * src/controllers/address.controller.js
 *
 * Customer Address HTTP Controller
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/api-response');
const AppError = require('../utils/app-error');
const AddressService = require('../services/address.service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw AppError.unprocessable('Validation failed', messages);
  }
}

class AddressController {
  /**
   * GET /api/addresses
   */
  static async listAddresses(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const addresses = await AddressService.getAddresses(userId);
      return ApiResponse.success(res, 'Addresses retrieved successfully', addresses);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/addresses/:id
   */
  static async getAddress(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const addressId = req.params.id;
      const address = await AddressService.getAddressById(userId, addressId);
      return ApiResponse.success(res, 'Address retrieved successfully', address);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/addresses
   */
  static async createAddress(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const address = await AddressService.createAddress(userId, req.body);
      return ApiResponse.created(res, 'Address created successfully', address);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/addresses/:id
   */
  static async updateAddress(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const addressId = req.params.id;
      const address = await AddressService.updateAddress(userId, addressId, req.body);
      return ApiResponse.success(res, 'Address updated successfully', address);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/addresses/:id
   */
  static async deleteAddress(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const addressId = req.params.id;
      const result = await AddressService.deleteAddress(userId, addressId);
      return ApiResponse.success(res, 'Address deleted successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/addresses/:id/default
   */
  static async setDefault(req, res, next) {
    try {
      assertValid(req);
      const userId = req.user.id;
      const addressId = req.params.id;
      const address = await AddressService.setDefaultAddress(userId, addressId);
      return ApiResponse.success(res, 'Default address set successfully', address);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AddressController;
