const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/token');
const { uploadToCloudinary } = require('./uploadService');

async function register(payload) {
  const existing = await User.findOne({
    $or: [{ email: payload.email }, { username: payload.username }]
  });
  if (existing?.email === payload.email) throw new ApiError(409, 'Email is already registered');
  if (existing?.username === payload.username) throw new ApiError(409, 'Username is already taken');

  const user = await User.create(payload);
  const token = signToken(user._id);
  return { user, token };
}

async function login(identifier, password) {
  const loginValue = String(identifier || '').trim();
  const emailValue = loginValue.toLowerCase();
  const user = await User.findOne({
    $or: [{ email: emailValue }, { username: loginValue }]
  }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account is inactive');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  user.password = undefined;
  return { user, token };
}

async function updateProfile(userId, payload) {
  const blocked = ['password', 'role', 'averageRating', 'totalRatings', 'sessionsCompleted', 'resourcesShared', 'isVerified', 'isActive'];
  blocked.forEach((field) => delete payload[field]);

  if (payload.username || payload.email) {
    const conflictFilters = [];
    if (payload.username) conflictFilters.push({ username: String(payload.username).trim() });
    if (payload.email) conflictFilters.push({ email: String(payload.email).trim().toLowerCase() });
    const existing = await User.findOne({ _id: { $ne: userId }, $or: conflictFilters });
    if (existing?.username === String(payload.username || '').trim()) throw new ApiError(409, 'Username is already taken');
    if (existing?.email === String(payload.email || '').trim().toLowerCase()) throw new ApiError(409, 'Email is already registered');
  }

  const updateData = {};
  const allowedArrayFields = new Set(['skillsToLearn', 'skillsToTeach', 'languages', 'availability']);
  const allowedEmptyStringFields = new Set(['avatar', 'coverImage', 'bio', 'education', 'college', 'department']);

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed || allowedEmptyStringFields.has(key)) updateData[key] = trimmed;
      return;
    }

    if (Array.isArray(value)) {
      if (allowedArrayFields.has(key)) {
        updateData[key] = value
          .map((item) => (typeof item === 'string' ? item.trim() : item))
          .filter((item) => item !== undefined && item !== null && item !== '');
      }
      return;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      updateData[key] = value;
      return;
    }

    if (typeof value === 'object' && Object.keys(value).length > 0) {
      updateData[key] = value;
    }
  });

  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  });
}

async function updateAvatar(userId, file) {
  if (!file) throw new ApiError(400, 'Avatar image is required');
  const uploaded = await uploadToCloudinary(file.path, 'learnloop/avatars');
  return User.findByIdAndUpdate(
    userId,
    { avatar: uploaded.secure_url },
    { new: true, runValidators: true }
  );
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  return signToken(user._id);
}

module.exports = { register, login, updateProfile, updateAvatar, changePassword };
