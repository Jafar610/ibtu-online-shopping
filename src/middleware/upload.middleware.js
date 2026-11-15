/**
 * IBTU E-Commerce Backend
 * src/middleware/upload.middleware.js
 *
 * Middleware to handle file uploads safely with Multer.
 * Supports both single ('image') and multiple ('images') file field uploads.
 * Catches Multer-specific errors and forwards them as standardized AppError instances.
 */

const multer = require('multer');
const { upload } = require('../config/multer');
const AppError = require('../utils/app-error');

const uploader = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'image', maxCount: 1 },
]);

const handleUpload = (req, res, next) => {
  uploader(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(AppError.badRequest('File size exceeds the 5MB limit per image.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(AppError.badRequest('Exceeded maximum allowed number of files (10).'));
        }
        return next(AppError.badRequest(`Upload error: ${err.message}`));
      }
      return next(err);
    }

    // Standardize uploaded files into an array on req.uploadedFiles
    const files = [];
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        files.push(...req.files.image);
      }
      if (req.files.images && req.files.images.length > 0) {
        files.push(...req.files.images);
      }
    } else if (req.file) {
      files.push(req.file);
    }

    req.uploadedFiles = files;
    next();
  });
};

module.exports = {
  handleUpload,
};
