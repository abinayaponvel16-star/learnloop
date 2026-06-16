const service = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

exports.mentors = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listMentors(req.query);
  success(res, 200, 'Mentors fetched', { mentors: items }, meta);
});

exports.stats = asyncHandler(async (req, res) => {
  const stats = await service.publicStats();
  success(res, 200, 'Stats fetched', { stats });
});
