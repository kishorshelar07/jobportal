const AppError = require('../utils/AppError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. This action requires ${roles.join(' or ')} role.`, 403)
      );
    }
    next();
  };
};

module.exports = { restrictTo };
