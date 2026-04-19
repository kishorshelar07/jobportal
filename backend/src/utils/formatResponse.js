const formatResponse = (res, { statusCode = 200, success = true, message = '', data = {}, errors = [], meta = null }) => {
  const response = { success, message, data };
  if (errors.length > 0) response.errors = errors;
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const formatError = (res, { statusCode = 500, message = 'Internal Server Error', errors = [] }) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { formatResponse, formatError };
