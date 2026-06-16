const Session = require('../models/Session');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');
const { buildSearchFilter } = require('../utils/search');
const { createNotification } = require('./notificationService');

function generateGoogleMeetLink() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const randomString = (length) => Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `https://meet.google.com/${randomString(3)}-${randomString(4)}-${randomString(3)}`;
}

function ensureParticipant(session, user) {
  if (user.role === 'admin') return;
  if (![session.mentor, session.learner].some((id) => String(id) === String(user._id))) {
    throw new ApiError(403, 'You cannot access this session');
  }
}

async function createSession(user, payload) {
  const mentorId = user.role === 'mentor' ? user._id : payload.mentor;
  const learnerId = user.role === 'learner' ? user._id : payload.learner;
  if (!mentorId || !learnerId) throw new ApiError(400, 'Mentor and learner are required');

  const [mentor, learner] = await Promise.all([
    User.findOne({ _id: mentorId, role: 'mentor', isActive: true }),
    User.findOne({ _id: learnerId, role: 'learner', isActive: true })
  ]);
  if (!mentor || !learner) throw new ApiError(404, 'Mentor or learner not found');

  if (payload.mentorshipId) {
    const mentorship = await Mentorship.findById(payload.mentorshipId);
    if (!mentorship || String(mentorship.mentor) !== String(mentor._id) || String(mentorship.learner) !== String(learner._id)) {
      throw new ApiError(400, 'Mentorship does not match session participants');
    }
    if (mentorship.status !== 'accepted') {
      throw new ApiError(400, 'Session must be linked to an accepted mentorship');
    }
  }

  const meetingPlatform = payload.meetingPlatform || 'google-meet';
  const meetingLink = payload.meetingLink || (meetingPlatform === 'google-meet' ? generateGoogleMeetLink() : undefined);

  return Session.create({
    ...payload,
    mentor: mentor._id,
    learner: learner._id,
    meetingPlatform,
    meetingLink
  });
}

async function listSessions(user, query) {
  const filter = buildSearchFilter(query, ['topic', 'description', 'notes']);
  if (query.status) filter.status = query.status;
  if (query.mentorshipId) filter.mentorshipId = query.mentorshipId;
  if (user.role === 'mentor') filter.mentor = user._id;
  if (user.role === 'learner') filter.learner = user._id;

  return paginate(Session, filter, query, {
    populate: [
      { path: 'mentor', select: 'name avatar role averageRating' },
      { path: 'learner', select: 'name avatar role' },
      { path: 'mentorshipId', select: 'skill status' }
    ]
  });
}

async function getSessionById(id, user) {
  const session = await Session.findById(id).populate([
    { path: 'mentor', select: 'name avatar role averageRating' },
    { path: 'learner', select: 'name avatar role' },
    { path: 'mentorshipId', select: 'skill status' }
  ]);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  return session;
}

async function updateSession(id, user, payload) {
  const session = await Session.findById(id);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  if (['completed', 'cancelled'].includes(session.status)) throw new ApiError(400, 'Completed or cancelled sessions cannot be edited');
  if (payload.status && user.role !== 'admin') {
    throw new ApiError(403, 'Session status can only be changed through workflow endpoints');
  }

  Object.assign(session, payload);
  await session.save();
  return session;
}

async function startSession(id, user) {
  const session = await Session.findById(id);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  if (!['scheduled', 'ongoing'].includes(session.status)) throw new ApiError(400, 'Session cannot be started');

  session.status = 'ongoing';
  session.sessionStartedAt = session.sessionStartedAt || new Date();
  if (String(session.mentor) === String(user._id)) session.mentorJoined = true;
  if (String(session.learner) === String(user._id)) session.learnerJoined = true;
  await session.save();

  await createNotification({
    recipient: String(session.mentor) === String(user._id) ? session.learner : session.mentor,
    sender: user._id,
    title: 'Session started',
    message: `${user.name} joined the session for ${session.topic}.`,
    type: 'session_created'
  });

  return session;
}

async function completeSession(id, user) {
  const session = await Session.findById(id);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  if (session.status === 'completed') throw new ApiError(400, 'Session is already completed');
  if (session.status === 'cancelled') throw new ApiError(400, 'Cancelled sessions cannot be completed');

  session.status = 'completed';
  session.sessionEndedAt = session.sessionEndedAt || new Date();
  session.attendanceMarked = true;
  await session.save();

  await Promise.all([
    User.updateMany({ _id: { $in: [session.mentor, session.learner] } }, { $inc: { sessionsCompleted: 1 } }),
    Mentorship.findOneAndUpdate(
      { _id: session.mentorshipId, status: 'accepted' },
      { status: 'completed', completedAt: new Date() }
    )
  ]);

  await createNotification({
    recipient: String(session.mentor) === String(user._id) ? session.learner : session.mentor,
    sender: user._id,
    title: 'Session completed',
    message: `${user.name} marked the session for ${session.topic} as completed.`,
    type: 'feedback_received'
  });

  return session;
}

async function endSession(id, user) {
  const session = await Session.findById(id);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  if (session.status !== 'ongoing') throw new ApiError(400, 'Only ongoing sessions can be ended');

  return completeSession(id, user);
}

async function cancelSession(id, user) {
  const session = await Session.findById(id);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  if (session.status === 'completed') throw new ApiError(400, 'Completed sessions cannot be cancelled');
  if (session.status === 'cancelled') throw new ApiError(400, 'Session is already cancelled');

  session.status = 'cancelled';
  session.sessionEndedAt = new Date();
  await session.save();

  await createNotification({
    recipient: String(session.mentor) === String(user._id) ? session.learner : session.mentor,
    sender: user._id,
    title: 'Session cancelled',
    message: `${user.name} cancelled the session for ${session.topic}.`,
    type: 'mentorship_rejected'
  });

  return session;
}

async function deleteSession(id, user) {
  const session = await Session.findById(id);
  if (!session) throw new ApiError(404, 'Session not found');
  ensureParticipant(session, user);
  await session.deleteOne();
}

module.exports = {
  createSession,
  listSessions,
  getSessionById,
  updateSession,
  startSession,
  endSession,
  completeSession,
  cancelSession,
  deleteSession
};
