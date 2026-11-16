/**
 * IBTU E-Commerce Backend
 * src/middleware/payment-upload.middleware.js
 *
 * Middleware for safely accepting payment receipt uploads.
 * Includes deep file content (magic byte) verification to prevent disguised executables.
 */

const fs = require('fs');
const multer = require('multer');
const { receiptUpload } = require('../config/payment-upload');
const AppError = require('../utils/app-error');

const uploadSingleReceipt = receiptUpload.single('receipt');

/**
 * Validate file header bytes against known image magic signatures
 */
const validateMagicBytes = (filePath) => {
  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  // JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF .... WEBP
  // 'RIFF' at 0-3 (0x52, 0x49, 0x46, 0x46), 'WEBP' at 8-11 (0x57, 0x45, 0x42, 0x50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
};

const handleReceiptUpload = (req, res, next) => {
  uploadSingleReceipt(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(AppError.badRequest('File size exceeds the 5MB limit for payment receipts.'));
        }
        return next(AppError.badRequest(`Upload error: ${err.message}`));
      }
      return next(err);
    }

    if (!req.file) {
      return next(AppError.badRequest('Please upload a payment receipt image file using field name "receipt".'));
    }

    // Verify magic bytes
    try {
      const detectedMime = validateMagicBytes(req.file.path);
      if (!detectedMime) {
        // Remove invalid / disguised file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(
          AppError.badRequest(
            'Invalid file content. The uploaded file is not a valid JPEG, PNG, or WebP image.'
          )
        );
      }
    } catch (readErr) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(AppError.badRequest('Unable to read and verify uploaded file.'));
    }

    next();
  });
};

module.exports = {
  handleReceiptUpload,
};
