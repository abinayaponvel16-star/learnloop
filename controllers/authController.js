const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');
const { setAuthCookie } = require('../utils/token');

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  success(res, 201, 'Registered successfully', { user, token });
});

exports.login = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.username || req.body.email;
  const { user, token } = await authService.login(identifier, req.body.password);
  setAuthCookie(res, token);
  success(res, 200, 'Logged in successfully', { user, token });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  success(res, 200, 'Logged out successfully');
});

exports.me = asyncHandler(async (req, res) => {
  success(res, 200, 'Profile fetched', { user: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  success(res, 200, 'Profile updated', { user });
});

exports.updateAvatar = asyncHandler(async (req, res) => {
  const user = await authService.updateAvatar(req.user._id, req.file);
  success(res, 200, 'Avatar updated', { user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const token = await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  setAuthCookie(res, token);
  success(res, 200, 'Password changed successfully', { token });
});
