const service = require('../services/resourceService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

exports.upload = asyncHandler(async (req, res) => {
  const resource = await service.createResource(req.user, req.body, req.file);
  success(res, 201, 'Resource uploaded', { resource });
});

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listResources(req.user, req.query);
  success(res, 200, 'Resources fetched', { resources: items }, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const resource = await service.getResourceById(req.params.id, req.user);
  success(res, 200, 'Resource fetched', { resource });
});

exports.remove = asyncHandler(async (req, res) => {
  const resource = await service.deleteResource(req.params.id, req.user);
  success(res, 200, 'Resource deleted', { resource });
});

exports.download = asyncHandler(async (req, res) => {
  const resource = await service.incrementDownload(req.params.id, req.user);
  success(res, 200, 'Download counted', { resource });
});
