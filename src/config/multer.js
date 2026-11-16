/**
 * IBTU E-Commerce Backend
 * src/config/multer.js
 *
 * Multer Configuration for Product Image Uploads
 *
 * Security & Reliability:
 *  - Enforces strict MIME type checks (image/jpeg, image/png, image/webp).
 *  - Enforces file extension validation.
 *  - Generates collision-resistant, sanitized unique filenames (UUID + timestamp + extension).
 *  - Sets safe max file size limit (5MB per image).
 *  - Files are saved to local filesystem in 'uploads/products'.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/app-error');

// Upload destination directory
const uploadDir = path.join(__dirname, '../../uploads/products');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const safeFilename = `product-${uniqueSuffix}${ext}`;
    cb(null, safeFilename);
  },
});

// File filter to reject non-image files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      AppError.badRequest(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      ),
      false
    );
  }

  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10,                 // Up to 10 files per request
  },
});

module.exports = {
  upload,
  uploadDir,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
