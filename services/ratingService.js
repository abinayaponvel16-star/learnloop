const Rating = require('../models/Rating');
const Session = require('../models/Session');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');
const { createNotification } = require('./notificationService');

async function recalculateUserRating(userId) {
  const [aggregate] = await Rating.aggregate([
    { $match: { toUser: userId } },
    { $group: { _id: '$toUser', averageRating: { $avg: '$stars' }, totalRatings: { $sum: 1 } } }
  ]);

  await User.findByIdAndUpdate(userId, {
    averageRating: aggregate ? Number(aggregate.averageRating.toFixed(2)) : 0,
    totalRatings: aggregate ? aggregate.totalRatings : 0
  });
}

async function createRating(user, payload) {
  const session = await Session.findById(payload.sessionId);
  if (!session) throw new ApiError(404, 'Session not found');
  if (session.status !== 'completed') throw new ApiError(400, 'Ratings are allowed only after session completion');
  if (String(session.learner) !== String(user._id)) throw new ApiError(403, 'Only the learner can rate a completed session');
  if (String(session.mentor) !== String(payload.toUser)) throw new ApiError(400, 'Ratings for this session must target the mentor');
  const existing = await Rating.findOne({ sessionId: payload.sessionId, fromUser: user._id });
  if (existing) throw new ApiError(409, 'Feedback has already been submitted for this session');

  const rating = await Rating.create({ ...payload, fromUser: user._id });
  await recalculateUserRating(rating.toUser);

  await createNotification({
    recipient: rating.toUser,
    sender: user._id,
    title: 'New feedback received',
    message: `${user.name} rated your session.`,
    type: 'feedback_received'
  });

  return rating;
}

async function listRatings(user, query) {
  const filter = {};
  if (query.toUser) filter.toUser = query.toUser;
  if (query.fromUser) filter.fromUser = query.fromUser;
  if (query.sessionId) filter.sessionId = query.sessionId;
  if (user.role !== 'admin') filter.$or = [{ fromUser: user._id }, { toUser: user._id }];

  return paginate(Rating, filter, query, {
    populate: [
      { path: 'fromUser', select: 'name avatar role' },
      { path: 'toUser', select: 'name avatar role averageRating' },
      { path: 'sessionId', select: 'topic scheduledTime status' }
    ]
  });
}

async function getRatingById(id, user) {
  const rating = await Rating.findById(id).populate([
    { path: 'fromUser', select: 'name avatar role' },
    { path: 'toUser', select: 'name avatar role averageRating' },
    { path: 'sessionId', select: 'topic scheduledTime status' }
  ]);
  if (!rating) throw new ApiError(404, 'Rating not found');
  if (user.role !== 'admin' && ![rating.fromUser._id, rating.toUser._id].some((idValue) => String(idValue) === String(user._id))) {
    throw new ApiError(403, 'You cannot access this rating');
  }
  return rating;
}

module.exports = { createRating, listRatings, getRatingById, recalculateUserRating };
