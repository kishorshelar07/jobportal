const { validationResult } = require('express-validator');
const { formatError } = require('../utils/formatResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return formatError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: formatted,
    });
  }
  next();
};

module.exports = { validate };
