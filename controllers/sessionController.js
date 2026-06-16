const service = require('../services/sessionService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

exports.create = asyncHandler(async (req, res) => {
  const session = await service.createSession(req.user, req.body);
  success(res, 201, 'Session created', { session });
});

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listSessions(req.user, req.query);
  success(res, 200, 'Sessions fetched', { sessions: items }, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const session = await service.getSessionById(req.params.id, req.user);
  success(res, 200, 'Session fetched', { session });
});

exports.update = asyncHandler(async (req, res) => {
  const session = await service.updateSession(req.params.id, req.user, req.body);
  success(res, 200, 'Session updated', { session });
});

exports.start = asyncHandler(async (req, res) => {
  const session = await service.startSession(req.params.id, req.user);
  success(res, 200, 'Session started', { session });
});

exports.end = asyncHandler(async (req, res) => {
  const session = await service.endSession(req.params.id, req.user);
  success(res, 200, 'Session ended', { session });
});

exports.complete = asyncHandler(async (req, res) => {
  const session = await service.completeSession(req.params.id, req.user);
  success(res, 200, 'Session completed', { session });
});

exports.cancel = asyncHandler(async (req, res) => {
  const session = await service.cancelSession(req.params.id, req.user);
  success(res, 200, 'Session cancelled', { session });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.deleteSession(req.params.id, req.user);
  success(res, 200, 'Session deleted');
});
