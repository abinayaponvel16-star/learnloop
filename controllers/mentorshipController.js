const service = require('../services/mentorshipService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const eventBus = require('../utils/eventBus');

exports.request = asyncHandler(async (req, res) => {
  const mentorship = await service.requestMentorship(req.user, req.body);
  success(res, 201, 'Mentorship requested', { mentorship });
});

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listMentorships(req.user, req.query);
  success(res, 200, 'Mentorships fetched', { mentorships: items }, meta);
});

exports.getById = asyncHandler(async (req, res) => {
  const mentorship = await service.getMentorshipById(req.params.id, req.user);
  success(res, 200, 'Mentorship fetched', { mentorship });
});

exports.accept = asyncHandler(async (req, res) => {
  const result = await service.acceptMentorship(req.params.id, req.user, req.body);
  success(res, 200, 'Mentorship accepted and session created', result);
});

exports.reject = asyncHandler(async (req, res) => {
  const mentorship = await service.rejectMentorship(req.params.id, req.user, req.body.rejectionReason);
  success(res, 200, 'Mentorship rejected', { mentorship });
});

exports.complete = asyncHandler(async (req, res) => {
  const mentorship = await service.completeMentorship(req.params.id, req.user);
  success(res, 200, 'Mentorship completed', { mentorship });
});

exports.stream = asyncHandler(async (req, res) => {
  // SSE stream for mentor to receive real-time mentorship requests
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const userId = req.user._id.toString();

  const send = (payload) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      // ignore
    }
  };

  const handler = (event) => {
    if (String(event.recipient) === userId) {
      send({ type: 'mentorship_request', mentorship: event.mentorship });
    }
  };

  eventBus.on('mentorship_request', handler);

  // send a ping every 20s to keep connection alive
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (err) {}
  }, 20000);

  req.on('close', () => {
    clearInterval(ping);
    eventBus.removeListener('mentorship_request', handler);
  });
});
