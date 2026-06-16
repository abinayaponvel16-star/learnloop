const service = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

exports.dashboard = asyncHandler(async (req, res) => {
  const dashboard = await service.dashboard();
  success(res, 200, 'Dashboard fetched', dashboard);
});

exports.users = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listUsers(req.query);
  success(res, 200, 'Users fetched', { users: items }, meta);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await service.deleteUser(req.params.id);
  success(res, 200, 'User deactivated', { user });
});

exports.sessions = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdminSessions(req.query);
  success(res, 200, 'Sessions fetched', { sessions: items }, meta);
});

exports.ratings = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdminRatings(req.query);
  success(res, 200, 'Ratings fetched', { ratings: items }, meta);
});

exports.resources = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listAdminResources(req.query);
  success(res, 200, 'Resources fetched', { resources: items }, meta);
});

exports.skills = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listSkills(req.query);
  success(res, 200, 'Skills fetched', { skills: items }, meta);
});

exports.createSkill = asyncHandler(async (req, res) => {
  const skill = await service.upsertSkill(null, req.body);
  success(res, 201, 'Skill created', { skill });
});

exports.updateSkill = asyncHandler(async (req, res) => {
  const skill = await service.upsertSkill(req.params.id, req.body);
  success(res, 200, 'Skill updated', { skill });
});
