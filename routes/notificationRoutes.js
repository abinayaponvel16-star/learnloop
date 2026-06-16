const express = require('express');
const controller = require('../controllers/notificationController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.get('/', validators.pagination, validate, controller.list);
router.patch('/:id/read', validators.objectId(), validate, controller.markRead);

module.exports = router;
