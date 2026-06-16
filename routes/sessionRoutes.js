const express = require('express');
const controller = require('../controllers/sessionController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.post('/', authorize('mentor', 'learner', 'admin'), validators.session, validate, controller.create);
router.get('/', authorize('mentor', 'learner', 'admin'), validators.pagination, validate, controller.list);
router.get('/:id', authorize('mentor', 'learner', 'admin'), validators.objectId(), validate, controller.getById);
router.put('/:id', authorize('mentor', 'learner', 'admin'), validators.objectId(), validators.updateSession, validate, controller.update);
router.put('/:id/start', authorize('mentor', 'learner', 'admin'), validators.objectId(), validate, controller.start);
router.put('/:id/end', authorize('mentor', 'learner', 'admin'), validators.objectId(), validate, controller.end);
router.put('/:id/complete', authorize('mentor', 'learner', 'admin'), validators.objectId(), validate, controller.complete);
router.put('/:id/cancel', authorize('mentor', 'learner', 'admin'), validators.objectId(), validate, controller.cancel);
router.delete('/:id', authorize('mentor', 'learner', 'admin'), validators.objectId(), validate, controller.remove);

module.exports = router;
