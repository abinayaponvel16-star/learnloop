const ApiError = require('../utils/ApiError');

function normalizeError(error) {
  if (error.name === 'CastError') return new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  if (error.code === 11000) return new ApiError(409, `Duplicate value for ${Object.keys(error.keyValue).join(', ')}`);
  if (error.name === 'ValidationError') {
    return new ApiError(422, 'Validation failed', Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    })));
  }
  if (error.name === 'JsonWebTokenError') return new ApiError(401, 'Invalid token');
  if (error.name === 'TokenExpiredError') return new ApiError(401, 'Token expired');
  return error;
}

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
