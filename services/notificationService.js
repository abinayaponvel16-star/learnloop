const Notification = require('../models/Notification');
const { paginate } = require('../utils/pagination');

async function createNotification(payload) {
  return Notification.create(payload);
}

async function listNotifications(user, query) {
  const filter = { recipient: user._id };
  if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

  return paginate(Notification, filter, query, {
    populate: [{ path: 'sender', select: 'name avatar role' }]
  });
}

async function markRead(id, user) {
  return Notification.findOneAndUpdate(
    { _id: id, recipient: user._id },
    { isRead: true },
    { new: true }
  );
}

module.exports = { createNotification, listNotifications, markRead };
