const Resource = require('../models/Resource');
const Session = require('../models/Session');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');
const { buildSearchFilter, addArrayFilter } = require('../utils/search');
const { createNotification } = require('./notificationService');
const { uploadToCloudinary, inferFileType } = require('./uploadService');

async function createResource(user, payload, file) {
  let fileUrl = payload.fileUrl;
  let fileName = payload.fileName;
  let fileSize = payload.fileSize || 0;
  let fileType = payload.fileType;
  let session = null;

  if (file) {
    const uploaded = await uploadToCloudinary(file.path);
    fileUrl = uploaded.secure_url;
    fileName = file.originalname;
    fileSize = file.size;
    fileType = inferFileType(file.mimetype, payload.fileType);
  }

  if (!fileUrl) throw new ApiError(400, 'A file upload or fileUrl is required');

  if (payload.sessionId) {
    session = await Session.findById(payload.sessionId);
    if (!session) throw new ApiError(404, 'Session not found');
    if (session.status !== 'completed') {
      throw new ApiError(400, 'Session resources can only be shared after the session is completed');
    }
    if (user.role !== 'admin' && ![session.mentor, session.learner].some((id) => String(id) === String(user._id))) {
      throw new ApiError(403, 'Only session participants can upload session resources');
    }
    if (!payload.visibility) payload.visibility = 'sessionOnly';
  }

  if (payload.visibility === 'sessionOnly' && !payload.sessionId) {
    throw new ApiError(400, 'sessionId is required for session-only resources');
  }

  const resource = await Resource.create({
    ...payload,
    uploadedBy: user._id,
    fileUrl,
    fileName,
    fileSize,
    fileType
  });

  await User.findByIdAndUpdate(user._id, { $inc: { resourcesShared: 1 } });

  if (session) {
    const recipient = String(session.mentor) === String(user._id) ? session.learner : session.mentor;
    await createNotification({
      recipient,
      sender: user._id,
      title: 'Session resource shared',
      message: `${user.name} shared a resource from the completed session ${session.topic}.`,
      type: 'resource_uploaded'
    });
  }

  return resource;
}

async function listResources(user, query) {
  const filter = buildSearchFilter(query, ['title', 'description', 'tags']);
  if (query.fileType) filter.fileType = query.fileType;
  if (query.visibility) filter.visibility = query.visibility;
  addArrayFilter(filter, 'tags', query.tags);

  if (user.role !== 'admin') {
    const accessibleSessions = await Session.find({
      $or: [{ mentor: user._id }, { learner: user._id }]
    }).distinct('_id');
    const accessFilter = {
      $or: [
        { visibility: 'public' },
        { uploadedBy: user._id },
        { sessionId: { $in: accessibleSessions } }
      ]
    };
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, accessFilter];
      delete filter.$or;
    } else {
      Object.assign(filter, accessFilter);
    }
  }

  return paginate(Resource, filter, query, {
    populate: [
      { path: 'uploadedBy', select: 'name avatar role' },
      { path: 'sessionId', select: 'topic scheduledTime status' }
    ]
  });
}

async function getResourceById(id, user) {
  const resource = await Resource.findById(id).populate([
    { path: 'uploadedBy', select: 'name avatar role' },
    { path: 'sessionId', select: 'topic scheduledTime status mentor learner' }
  ]);
  if (!resource) throw new ApiError(404, 'Resource not found');
  const isUploader = String(resource.uploadedBy._id) === String(user._id);
  const isSessionParticipant = resource.sessionId && [resource.sessionId.mentor, resource.sessionId.learner].some((id) => String(id) === String(user._id));
  if (user.role !== 'admin' && resource.visibility !== 'public' && !isUploader && !isSessionParticipant) {
    throw new ApiError(403, 'You cannot access this resource');
  }
  return resource;
}

async function deleteResource(id, user) {
  const filter = { _id: id };
  if (user.role !== 'admin') filter.uploadedBy = user._id;
  const resource = await Resource.findOneAndDelete(filter);
  if (!resource) throw new ApiError(404, 'Resource not found');
  return resource;
}

async function incrementDownload(id, user) {
  await getResourceById(id, user);
  return Resource.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
}

module.exports = { createResource, listResources, getResourceById, deleteResource, incrementDownload };
