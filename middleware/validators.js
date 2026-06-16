const { body, param, query } = require('express-validator');

const objectId = (field = 'id') => param(field).isMongoId().withMessage(`${field} must be a valid MongoDB id`);
const pagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
];

const register = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('username').trim().notEmpty().withMessage('username is required'),
  body('email').isEmail().normalizeEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  body('role').optional().isIn(['learner', 'mentor', 'admin']),
  body('skillsToLearn').optional().isArray().withMessage('skillsToLearn must be an array'),
  body('skillsToTeach').optional().isArray().withMessage('skillsToTeach must be an array'),
  body('experienceYears').optional().isInt({ min: 0 }).withMessage('experienceYears must be a positive number'),
  body('education').optional().trim().isString(),
  body('college').optional().trim().isString(),
  body('department').optional().trim().isString(),
  body('languages').optional().isArray().withMessage('languages must be an array'),
  body('bio').optional().trim().isString().withMessage('bio must be a string')
];

const login = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('username or email is required'),

  body('password')
    .notEmpty()
    .withMessage('password is required')
];

const changePassword = [
  body('currentPassword').notEmpty().withMessage('currentPassword is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters')
];

const mentorshipRequest = [
  body('mentor').isMongoId().withMessage('mentor must be a valid MongoDB id'),
  body('skill').trim().notEmpty().withMessage('skill is required'),
  body('skillLevelRequired').optional().isIn(['beginner', 'intermediate', 'advanced'])
];

const rejectMentorship = [
  body('rejectionReason').optional().trim().isLength({ max: 500 }).withMessage('rejectionReason is too long')
];

const acceptMentorship = [
  body('topic').optional().trim().notEmpty().withMessage('topic cannot be empty'),
  body('description').optional().trim(),
  body('scheduledTime').optional().isISO8601().withMessage('scheduledTime must be an ISO date'),
  body('duration').optional().isInt({ min: 15 }).withMessage('duration must be at least 15 minutes'),
  body('meetingLink').optional().trim().isString(),
  body('meetingPlatform').optional().isIn(['google-meet', 'zoom', 'microsoft-teams'])
];

const session = [
  body('topic').trim().notEmpty().withMessage('topic is required'),
  body('scheduledTime').isISO8601().withMessage('scheduledTime must be an ISO date'),
  body('duration').optional().isInt({ min: 15 }).withMessage('duration must be at least 15 minutes'),
  body('meetingPlatform').optional().isIn(['google-meet', 'zoom', 'microsoft-teams']),
  body('mentorshipId').optional().isMongoId().withMessage('mentorshipId must be a valid MongoDB id'),
  body('mentor').optional().isMongoId().withMessage('mentor must be a valid MongoDB id'),
  body('learner').optional().isMongoId().withMessage('learner must be a valid MongoDB id')
];

const updateSession = [
  body('topic').optional().trim(),
  body('scheduledTime').optional().isISO8601().withMessage('scheduledTime must be an ISO date'),
  body('duration').optional().isInt({ min: 15 }).withMessage('duration must be at least 15 minutes'),
  body('meetingPlatform').optional().isIn(['google-meet', 'zoom', 'microsoft-teams']),
  body('status').optional().isIn(['scheduled', 'ongoing', 'completed', 'cancelled']),
  body('mentorshipId').optional().isMongoId().withMessage('mentorshipId must be a valid MongoDB id')
];

const resource = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('fileType').optional().isIn(['pdf', 'ppt', 'doc', 'image', 'video', 'link']),
  body('visibility').optional().isIn(['sessionOnly', 'public']),
  body('sessionId').optional().isMongoId().withMessage('sessionId must be a valid MongoDB id')
];

const rating = [
  body('sessionId').isMongoId().withMessage('sessionId must be a valid MongoDB id'),
  body('toUser').isMongoId().withMessage('toUser must be a valid MongoDB id'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('stars must be between 1 and 5'),
  body('communication').optional().isInt({ min: 1, max: 5 }),
  body('teachingQuality').optional().isInt({ min: 1, max: 5 }),
  body('knowledgeLevel').optional().isInt({ min: 1, max: 5 }),
  body('helpfulness').optional().isInt({ min: 1, max: 5 })
];

const skill = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('category').trim().notEmpty().withMessage('category is required')
];

module.exports = {
  objectId,
  pagination,
  register,
  login,
  changePassword,
  mentorshipRequest,
  rejectMentorship,
  acceptMentorship,
  session,
  updateSession,
  resource,
  rating,
  skill
};
