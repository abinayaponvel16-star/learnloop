function success(res, statusCode, message, data = null, meta = undefined) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {})
  });
}

module.exports = { success };
