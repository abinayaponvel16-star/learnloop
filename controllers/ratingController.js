const service = require('../services/ratingService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

exports.create = asyncHandler(async (req, res) => {
  const rating = await service.createRating(req.user, req.body);
  success(res, 201, 'Rating submitted', { rating });
});

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listRatings(req.user, req.query);
  success(res, 200, 'Ratings fetched', { ratings: items }, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const rating = await service.getRatingById(req.params.id, req.user);
  success(res, 200, 'Rating fetched', { rating });
});
