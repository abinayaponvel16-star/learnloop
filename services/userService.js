const User = require('../models/User');
const Session = require('../models/Session');
const Resource = require('../models/Resource');
const { paginate } = require('../utils/pagination');
const { buildSearchFilter } = require('../utils/search');

function listMentors(query) {
  const filter = buildSearchFilter(query, ['name', 'bio', 'skillsToTeach', 'languages']);
  filter.role = 'mentor';
  filter.isActive = true;

  if (query.skill) filter.skillsToTeach = query.skill;

  return paginate(User, filter, query, {
    select: 'name username avatar bio role skillsToTeach languages availability averageRating totalRatings sessionsCompleted experienceYears education isVerified',
    sort: query.sort || '-averageRating -sessionsCompleted -createdAt'
  });
}

async function publicStats() {
  const [totalUsers, totalMentors, totalSessions, totalResources] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'mentor', isActive: true }),
    Session.countDocuments({ status: 'completed' }),
    Resource.countDocuments()
  ]);

  return [
    { label: 'Total Users', value: totalUsers },
    { label: 'Total Mentors', value: totalMentors },
    { label: 'Sessions Completed', value: totalSessions },
    { label: 'Resources Shared', value: totalResources }
  ];
}

module.exports = { listMentors, publicStats };
