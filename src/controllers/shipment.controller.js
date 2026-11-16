/**
 * IBTU E-Commerce Backend
 * src/controllers/shipment.controller.js
 *
 * Shipment Controller
 * Dispatches Admin shipment management & Customer tracking requests.
 */

const ShipmentService = require('../services/shipment.service');
const ApiResponse = require('../utils/api-response');

class ShipmentController {
  /**
   * POST /api/admin/orders/:id/shipments
   * Admin: Create shipment for an order
   */
  static async createShipment(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const shipment = await ShipmentService.createShipment(
        orderId,
        req.user,
        req.body,
        req.ip
      );
      return ApiResponse.created(res, 'Shipment created successfully.', shipment);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/orders/:id/shipments
   * Admin: List shipments for an order
   */
  static async getOrderShipments(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const shipments = await ShipmentService.getOrderShipments(orderId);
      return ApiResponse.success(res, 'Shipments retrieved successfully.', shipments);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/admin/shipments/:shipmentId/status
   * Admin: Update shipment status
   */
  static async updateShipmentStatus(req, res, next) {
    try {
      const shipmentId = parseInt(req.params.shipmentId, 10);
      const { status, delivery_notes } = req.body;
      const result = await ShipmentService.updateShipmentStatus(
        shipmentId,
        status,
        req.user,
        delivery_notes,
        req.ip
      );
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/orders/:id/tracking
   * Customer: View shipment tracking information
   */
  static async getCustomerTracking(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const tracking = await ShipmentService.getCustomerTracking(orderId, req.user);
      return ApiResponse.success(res, 'Tracking information retrieved successfully.', tracking);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ShipmentController;
