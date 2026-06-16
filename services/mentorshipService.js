const Mentorship = require('../models/Mentorship');
const Session = require('../models/Session');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');
const { buildSearchFilter } = require('../utils/search');
const { createNotification } = require('./notificationService');
const { createSession } = require('./sessionService');
const eventBus = require('../utils/eventBus');

function generateGoogleMeetLink() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const randomString = (length) => Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `https://meet.google.com/${randomString(3)}-${randomString(4)}-${randomString(3)}`;
}

function calculateMatchScore(mentor, skill, level) {
  let score = 0;
  if (mentor.skillsToTeach.some((item) => item.toLowerCase() === skill.toLowerCase())) score += 55;
  if (mentor.level === level) score += 15;
  if (mentor.averageRating) score += Math.min(mentor.averageRating * 4, 20);
  if (mentor.sessionsCompleted) score += Math.min(mentor.sessionsCompleted, 10);
  return Math.min(score, 100);
}

async function requestMentorship(learner, payload) {
  if (String(payload.mentor) === String(learner._id)) throw new ApiError(400, 'You cannot request yourself as mentor');

  const mentor = await User.findOne({ _id: payload.mentor, role: 'mentor', isActive: true });
  if (!mentor) throw new ApiError(404, 'Mentor not found');

  const existing = await Mentorship.findOne({
    mentor: mentor._id,
    learner: learner._id,
    skill: payload.skill,
    status: { $in: ['pending', 'accepted'] }
  });
  if (existing) throw new ApiError(409, 'A mentorship request for this skill already exists');

  const mentorship = await Mentorship.create({
    ...payload,
    mentor: mentor._id,
    learner: learner._id,
    matchScore: calculateMatchScore(mentor, payload.skill, payload.skillLevelRequired)
  });

  await createNotification({
    recipient: mentor._id,
    sender: learner._id,
    title: 'New mentorship request',
    message: `${learner.name} requested mentorship for ${payload.skill}.`,
    type: 'mentorship_request'
  });

  const populated = await mentorship.populate([
    { path: 'mentor', select: 'name avatar role averageRating' },
    { path: 'learner', select: 'name avatar role' }
  ]);

  // Emit an event for real-time listeners (mentors)
  try {
    eventBus.emit('mentorship_request', { recipient: mentor._id.toString(), mentorship: populated });
  } catch (err) {
    // swallow errors — notifications already persisted
    console.error('Failed to emit mentorship_request event', err);
  }

  return populated;
}

async function listMentorships(user, query) {
  const filter = buildSearchFilter(query, ['skill', 'requestMessage']);
  if (query.status) filter.status = query.status;
  if (user.role === 'mentor') filter.mentor = user._id;
  if (user.role === 'learner') filter.learner = user._id;

  return paginate(Mentorship, filter, query, {
    populate: [
      { path: 'mentor', select: 'name avatar role averageRating skillsToTeach' },
      { path: 'learner', select: 'name avatar role skillsToLearn' }
    ]
  });
}

async function getMentorshipById(id, user) {
  const mentorship = await Mentorship.findById(id).populate([
    { path: 'mentor', select: 'name avatar role averageRating skillsToTeach' },
    { path: 'learner', select: 'name avatar role skillsToLearn' }
  ]);
  if (!mentorship) throw new ApiError(404, 'Mentorship not found');
  if (user.role !== 'admin' && ![mentorship.mentor._id, mentorship.learner._id].some((idValue) => String(idValue) === String(user._id))) {
    throw new ApiError(403, 'You cannot access this mentorship');
  }
  return mentorship;
}

async function acceptMentorship(id, mentor, payload = {}) {
  const mentorship = await Mentorship.findOne({ _id: id, mentor: mentor._id, status: 'pending' });
  if (!mentorship) throw new ApiError(404, 'Pending mentorship request not found');

  mentorship.status = 'accepted';
  mentorship.acceptedAt = new Date();
  await mentorship.save();

  const session = await createSession(mentor, {
    mentorshipId: mentorship._id,
    learner: mentorship.learner,
    topic: payload.topic || mentorship.skill,
    description: payload.description || mentorship.requestMessage,
    scheduledTime: payload.scheduledTime ? new Date(payload.scheduledTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: payload.duration || 60,
    meetingPlatform: payload.meetingPlatform || 'google-meet',
    meetingLink: payload.meetingLink
  });

  await createNotification({
    recipient: mentorship.learner,
    sender: mentor._id,
    title: 'Mentorship accepted',
    message: `${mentor.name} accepted your mentorship request for ${mentorship.skill}.`,
    type: 'mentorship_accepted'
  });

  await createNotification({
    recipient: mentorship.learner,
    sender: mentor._id,
    title: 'Session created',
    message: `A session has been scheduled for ${mentorship.skill}.`,
    type: 'session_created'
  });

  return { mentorship, session };
}

async function rejectMentorship(id, mentor, rejectionReason) {
  const mentorship = await Mentorship.findOne({ _id: id, mentor: mentor._id, status: 'pending' });
  if (!mentorship) throw new ApiError(404, 'Pending mentorship request not found');

  mentorship.status = 'rejected';
  mentorship.rejectionReason = rejectionReason;
  await mentorship.save();

  await createNotification({
    recipient: mentorship.learner,
    sender: mentor._id,
    title: 'Mentorship rejected',
    message: `${mentor.name} rejected your mentorship request.`,
    type: 'mentorship_rejected'
  });

  return mentorship;
}

async function completeMentorship(id, user) {
  const filter = { _id: id, status: 'accepted' };
  if (user.role !== 'admin') filter.$or = [{ mentor: user._id }, { learner: user._id }];

  const mentorship = await Mentorship.findOne(filter);
  if (!mentorship) throw new ApiError(404, 'Accepted mentorship not found');

  const session = await Session.findOne({ mentorshipId: mentorship._id });
  if (session && session.status !== 'completed') {
    throw new ApiError(400, 'Cannot complete mentorship until the associated session is completed');
  }

  mentorship.status = 'completed';
  mentorship.completedAt = new Date();
  await mentorship.save();
  return mentorship;
}

module.exports = {
  requestMentorship,
  listMentorships,
  getMentorshipById,
  acceptMentorship,
  rejectMentorship,
  completeMentorship
};
