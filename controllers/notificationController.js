const service = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listNotifications(req.user, req.query);
  success(res, 200, 'Notifications fetched', { notifications: items }, meta);
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await service.markRead(req.params.id, req.user);
  success(res, 200, 'Notification marked read', { notification });
});
