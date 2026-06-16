const ApiError = require('../utils/ApiError');

function authorize(...roles) {
  return function authorizeRole(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You are not authorized to access this resource'));
    }

    return next();
  };
}

module.exports = authorize;
