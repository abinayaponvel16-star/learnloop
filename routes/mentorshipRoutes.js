const express = require('express');
const controller = require('../controllers/mentorshipController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.post('/request', authorize('learner'), validators.mentorshipRequest, validate, controller.request);
router.get('/stream', authorize('mentor'), controller.stream);
router.get('/', validators.pagination, validate, controller.list);
router.get('/:id', validators.objectId(), validate, controller.getById);
router.put('/:id/accept', authorize('mentor'), validators.objectId(), validators.acceptMentorship, validate, controller.accept);
router.put('/:id/reject', authorize('mentor'), validators.objectId(), validators.rejectMentorship, validate, controller.reject);
router.put('/:id/complete', validators.objectId(), validate, controller.complete);

module.exports = router;
