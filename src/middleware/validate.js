/**
 * IBTU E-Commerce Backend
 * src/middleware/validate.js
 *
 * Runs express-validator's validationResult and, if there are errors,
 * returns a 422 response with the full list of field errors.
 *
 * Usage: add validate as the last item in a route's middleware array,
 *        after all check() / body() validators.
 *
 *   router.post('/register', [...validators], validate, controller);
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Map to a simple [{ field, message }] array for the frontend
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 422, 'Validation failed.', formatted);
  }
  next();
};

module.exports = validate;
