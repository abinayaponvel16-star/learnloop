const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Mentorship = require('../models/Mentorship');
const Resource = require('../models/Resource');
const Rating = require('../models/Rating');
const Skill = require('../models/Skill');
const { paginate } = require('../utils/pagination');
const { buildSearchFilter } = require('../utils/search');

async function monthlyGrowth(model) {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  return model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
}

async function dashboard() {
  const [
    totalUsers,
    totalLearners,
    totalMentors,
    totalSessions,
    completedSessions,
    pendingRequests,
    totalResources,
    totalRatings,
    userGrowth,
    sessionGrowth,
    topMentors,
    topSkills,
    mostActiveLearners
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'learner' }),
    User.countDocuments({ role: 'mentor' }),
    Session.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
    Mentorship.countDocuments({ status: 'pending' }),
    Resource.countDocuments(),
    Rating.countDocuments(),
    monthlyGrowth(User),
    monthlyGrowth(Session),
    User.find({ role: 'mentor' }).sort('-averageRating -sessionsCompleted').limit(5).select('name avatar averageRating totalRatings sessionsCompleted skillsToTeach'),
    Mentorship.aggregate([
      { $group: { _id: '$skill', requests: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { requests: -1 } },
      { $limit: 10 }
    ]),
    User.find({ role: 'learner' }).sort('-sessionsCompleted -resourcesShared').limit(5).select('name avatar sessionsCompleted resourcesShared skillsToLearn')
  ]);

  return {
    totalUsers,
    totalLearners,
    totalMentors,
    totalSessions,
    completedSessions,
    pendingRequests,
    totalResources,
    totalRatings,
    monthlyGrowth: { users: userGrowth, sessions: sessionGrowth },
    topMentors,
    topSkills,
    mostActiveLearners
  };
}

function listUsers(query) {
  const filter = buildSearchFilter(query, ['name', 'email', 'college', 'department']);
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  return paginate(User, filter, query, { select: '-password' });
}

async function deleteUser(id) {
  return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

function listAdminSessions(query) {
  const filter = buildSearchFilter(query, ['topic', 'description']);
  if (query.status) filter.status = query.status;
  return paginate(Session, filter, query, {
    populate: [{ path: 'mentor', select: 'name email role' }, { path: 'learner', select: 'name email role' }]
  });
}

function listAdminRatings(query) {
  const filter = {};
  if (query.toUser && mongoose.isValidObjectId(query.toUser)) filter.toUser = query.toUser;
  return paginate(Rating, filter, query, {
    populate: [{ path: 'fromUser', select: 'name email' }, { path: 'toUser', select: 'name email' }, { path: 'sessionId', select: 'topic' }]
  });
}

function listAdminResources(query) {
  const filter = buildSearchFilter(query, ['title', 'description', 'tags']);
  if (query.visibility) filter.visibility = query.visibility;
  return paginate(Resource, filter, query, {
    populate: [{ path: 'uploadedBy', select: 'name email role' }, { path: 'sessionId', select: 'topic' }]
  });
}

async function upsertSkill(id, payload) {
  if (id) return Skill.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return Skill.create(payload);
}

function listSkills(query) {
  const filter = buildSearchFilter(query, ['name', 'category', 'description']);
  if (query.category) filter.category = query.category;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  return paginate(Skill, filter, query);
}

module.exports = {
  dashboard,
  listUsers,
  deleteUser,
  listAdminSessions,
  listAdminRatings,
  listAdminResources,
  upsertSkill,
  listSkills
};
