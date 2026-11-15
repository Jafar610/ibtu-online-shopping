/**
 * IBTU E-Commerce Backend
 * src/services/product-image.service.js
 *
 * Product Image Business Logic & Database Operations
 *
 * Rules:
 *  - Enforces product existence and active status.
 *  - Enforces that associated variants strictly belong to the same product.
 *  - Enforces atomic primary image setting (at most 1 primary image per product).
 *  - Safely deletes image files from disk after DB deletion succeeds.
 *  - Automatically assigns primary image if product had no images or if deleted image was primary.
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class ProductImageService {
  /**
   * Helper: Format an image record for API response
   */
  static formatImage(row) {
    return {
      id: row.id,
      product_id: row.product_id,
      product_name: row.product_name || null,
      variant_id: row.variant_id || null,
      variant_sku: row.variant_sku || null,
      variant_size: row.variant_size || null,
      variant_color: row.variant_color || null,
      image_url: row.image_url,
      alt_text: row.alt_text || null,
      is_primary: Boolean(row.is_primary),
      sort_order: row.sort_order,
      created_at: row.created_at,
    };
  }

  /**
   * Helper: Delete files from disk safely
   */
  static async removeFileFromDisk(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.startsWith('/uploads/products/')) return;
      const filename = path.basename(imageUrl);
      const filePath = path.join(__dirname, '../../uploads/products', filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.error(`[ProductImageService] Warning: Could not delete file: ${imageUrl}`, err.message);
    }
  }

  /**
   * Upload one or more images for a product
   */
  static async uploadProductImages(productId, files, data = {}) {
    if (!files || files.length === 0) {
      throw AppError.badRequest('No image files provided.');
    }

    const conn = await pool.getConnection();
    const createdImageIds = [];
    const uploadedFilePaths = files.map(f => f.path);

    try {
      await conn.beginTransaction();

      // 1. Check if product exists
      const [[product]] = await conn.query(
        'SELECT id, name, status FROM products WHERE id = ?',
        [productId]
      );
      if (!product) {
        throw AppError.notFound('Product not found.');
      }
      if (product.status === 'archived') {
        throw AppError.badRequest('Cannot add images to an archived product.');
      }

      // 2. If variant_id is provided, verify it belongs to this product
      let variantId = null;
      if (data.variant_id) {
        const [[variant]] = await conn.query(
          'SELECT id FROM product_variants WHERE id = ? AND product_id = ?',
          [data.variant_id, productId]
        );
        if (!variant) {
          throw AppError.badRequest('The specified variant does not belong to this product.');
        }
        variantId = variant.id;
      }

      // 3. Check existing images count and primary status
      const [[{ count: existingCount }]] = await conn.query(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?',
        [productId]
      );
      const [[existingPrimary]] = await conn.query(
        'SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1',
        [productId]
      );

      // Determine if the first uploaded image should be primary
      const requestedPrimary =
        data.is_primary === true ||
        data.is_primary === 'true' ||
        data.is_primary === 1 ||
        data.is_primary === '1';

      const shouldSetPrimary = requestedPrimary || (!existingPrimary && existingCount === 0);

      if (shouldSetPrimary) {
        // Unset any existing primary image for this product
        await conn.query(
          'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
          [productId]
        );
      }

      // 4. Calculate sort_order base
      const [[{ maxSort }]] = await conn.query(
        'SELECT COALESCE(MAX(sort_order), 0) as maxSort FROM product_images WHERE product_id = ?',
        [productId]
      );
      let currentSort = data.sort_order !== undefined && files.length === 1
        ? parseInt(data.sort_order, 10)
        : maxSort;

      // 5. Insert each file into product_images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = `/uploads/products/${file.filename}`;
        const isPrimary = (i === 0 && shouldSetPrimary) ? 1 : 0;
        currentSort = (data.sort_order !== undefined && files.length === 1) ? currentSort : currentSort + 1;

        const [result] = await conn.query(
          `INSERT INTO product_images
            (product_id, variant_id, image_url, alt_text, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            productId,
            variantId,
            imageUrl,
            data.alt_text || `${product.name} image`,
            isPrimary,
            currentSort,
          ]
        );

        createdImageIds.push(result.insertId);
      }

      await conn.commit();

      // 6. Fetch created images
      const [rows] = await pool.query(
        `SELECT pi.*, p.name as product_name, pv.sku as variant_sku, pv.size as variant_size, pv.color as variant_color
         FROM product_images pi
         JOIN products p ON pi.product_id = p.id
         LEFT JOIN product_variants pv ON pi.variant_id = pv.id
         WHERE pi.id IN (?)
         ORDER BY pi.sort_order ASC, pi.id ASC`,
        [createdImageIds]
      );

      return rows.map(r => this.formatImage(r));
    } catch (err) {
      await conn.rollback();
      // Clean up orphaned uploaded files if DB insert failed
      for (const p of uploadedFilePaths) {
        if (fs.existsSync(p)) {
          fs.unlink(p, () => {});
        }
      }
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Retrieve all images for a given product
   */
  static async getProductImages(productId, { isAdmin = false } = {}) {
    // Check product exists
    const [[product]] = await pool.query(
      'SELECT id, name, status FROM products WHERE id = ?',
      [productId]
    );
    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    if (!isAdmin && product.status !== 'active') {
      throw AppError.notFound('Product not found.');
    }

    const [rows] = await pool.query(
      `SELECT pi.*, p.name as product_name, pv.sku as variant_sku, pv.size as variant_size, pv.color as variant_color
       FROM product_images pi
       JOIN products p ON pi.product_id = p.id
       LEFT JOIN product_variants pv ON pi.variant_id = pv.id
       WHERE pi.product_id = ?
       ORDER BY pi.sort_order ASC, pi.id ASC`,
      [productId]
    );

    return {
      product: {
        id: product.id,
        name: product.name,
        status: product.status,
      },
      images: rows.map(r => this.formatImage(r)),
    };
  }

  /**
   * Retrieve a single product image by id
   */
  static async getProductImageById(imageId, { isAdmin = false } = {}) {
    const [rows] = await pool.query(
      `SELECT pi.*, p.name as product_name, p.status as product_status,
              pv.sku as variant_sku, pv.size as variant_size, pv.color as variant_color
       FROM product_images pi
       JOIN products p ON pi.product_id = p.id
       LEFT JOIN product_variants pv ON pi.variant_id = pv.id
       WHERE pi.id = ?`,
      [imageId]
    );

    const image = rows[0];
    if (!image) {
      throw AppError.notFound('Product image not found.');
    }

    if (!isAdmin && image.product_status !== 'active') {
      throw AppError.notFound('Product image not found.');
    }

    return this.formatImage(image);
  }

  /**
   * Update an image's metadata (alt_text, variant_id, sort_order)
   */
  static async updateProductImage(imageId, data = {}) {
    const [[image]] = await pool.query(
      'SELECT * FROM product_images WHERE id = ?',
      [imageId]
    );
    if (!image) {
      throw AppError.notFound('Product image not found.');
    }

    // If variant_id is provided, verify it belongs to the same product
    if (data.variant_id !== undefined && data.variant_id !== null && data.variant_id !== '') {
      const [[variant]] = await pool.query(
        'SELECT id FROM product_variants WHERE id = ? AND product_id = ?',
        [data.variant_id, image.product_id]
      );
      if (!variant) {
        throw AppError.badRequest('The specified variant does not belong to this product.');
      }
    }

    const setClauses = [];
    const values = [];

    if (data.alt_text !== undefined) {
      setClauses.push('alt_text = ?');
      values.push(data.alt_text);
    }

    if (data.variant_id !== undefined) {
      setClauses.push('variant_id = ?');
      values.push(data.variant_id === '' || data.variant_id === null ? null : data.variant_id);
    }

    if (data.sort_order !== undefined) {
      setClauses.push('sort_order = ?');
      values.push(parseInt(data.sort_order, 10));
    }

    if (setClauses.length === 0) {
      throw AppError.badRequest('No update fields provided.');
    }

    values.push(imageId);
    await pool.query(
      `UPDATE product_images SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );

    return this.getProductImageById(imageId, { isAdmin: true });
  }

  /**
   * Atomically mark an image as the primary image of its product
   */
  static async setPrimaryImage(imageId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [[image]] = await conn.query(
        'SELECT id, product_id, is_primary FROM product_images WHERE id = ?',
        [imageId]
      );
      if (!image) {
        throw AppError.notFound('Product image not found.');
      }

      // Unset previous primary image
      await conn.query(
        'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
        [image.product_id]
      );

      // Set new primary image
      await conn.query(
        'UPDATE product_images SET is_primary = 1 WHERE id = ?',
        [imageId]
      );

      await conn.commit();

      const [[updated]] = await pool.query(
        `SELECT pi.*, p.name as product_name, pv.sku as variant_sku, pv.size as variant_size, pv.color as variant_color
         FROM product_images pi
         JOIN products p ON pi.product_id = p.id
         LEFT JOIN product_variants pv ON pi.variant_id = pv.id
         WHERE pi.id = ?`,
        [imageId]
      );

      return this.formatImage(updated);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Reorder multiple images for a product
   */
  static async reorderProductImages(productId, imageOrders) {
    if (!Array.isArray(imageOrders) || imageOrders.length === 0) {
      throw AppError.badRequest('image_orders must be a non-empty array.');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [[product]] = await conn.query(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );
      if (!product) {
        throw AppError.notFound('Product not found.');
      }

      const imageIds = imageOrders.map(item => item.id);
      const [existingImages] = await conn.query(
        'SELECT id FROM product_images WHERE product_id = ? AND id IN (?)',
        [productId, imageIds]
      );

      if (existingImages.length !== imageIds.length) {
        throw AppError.badRequest('One or more images do not belong to this product.');
      }

      for (const item of imageOrders) {
        await conn.query(
          'UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?',
          [item.sort_order, item.id, productId]
        );
      }

      await conn.commit();

      return this.getProductImages(productId, { isAdmin: true });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Delete an image safely (DB record first, then disk file)
   */
  static async deleteProductImage(imageId) {
    const conn = await pool.getConnection();
    let imageUrlToDelete = null;

    try {
      await conn.beginTransaction();

      const [[image]] = await conn.query(
        'SELECT id, product_id, image_url, is_primary FROM product_images WHERE id = ?',
        [imageId]
      );
      if (!image) {
        throw AppError.notFound('Product image not found.');
      }

      imageUrlToDelete = image.image_url;

      // Delete the record
      await conn.query('DELETE FROM product_images WHERE id = ?', [imageId]);

      // If the deleted image was primary, designate a new primary image if available
      if (image.is_primary) {
        const [[nextPrimary]] = await conn.query(
          'SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1',
          [image.product_id]
        );
        if (nextPrimary) {
          await conn.query(
            'UPDATE product_images SET is_primary = 1 WHERE id = ?',
            [nextPrimary.id]
          );
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Now delete file from disk outside transaction
    if (imageUrlToDelete) {
      await this.removeFileFromDisk(imageUrlToDelete);
    }

    return { id: imageId, deleted: true };
  }
}

module.exports = ProductImageService;
