/**
 * IBTU E-Commerce Backend
 * src/config/payment-upload.js
 *
 * Multer Configuration for Private Payment Receipt Uploads
 *
 * Security Requirements:
 *  - Enforces strict MIME type checks (image/jpeg, image/png, image/webp).
 *  - Enforces file extension validation.
 *  - Generates collision-resistant, cryptographically secure unique filenames.
 *  - Sets safe max file size limit (5MB per receipt).
 *  - Stores receipts in private directory outside public static file serving.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/app-error');

// Private storage directory outside public access
const receiptStorageDir = path.join(__dirname, '../../storage/receipts');

// Ensure storage directory exists
if (!fs.existsSync(receiptStorageDir)) {
  fs.mkdirSync(receiptStorageDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptStorageDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}`;
    const safeFilename = `receipt-${uniqueSuffix}${ext}`;
    cb(null, safeFilename);
  },
});

// File filter to reject non-image files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      AppError.badRequest(
        'Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'
      ),
      false
    );
  }

  cb(null, true);
};

// Multer upload instance for payment receipts
const receiptUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1,                  // Exactly 1 receipt per upload
  },
});

module.exports = {
  receiptUpload,
  receiptStorageDir,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
