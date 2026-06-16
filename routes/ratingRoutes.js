const express = require('express');
const controller = require('../controllers/ratingController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.post('/', validators.rating, validate, controller.create);
router.get('/', validators.pagination, validate, controller.list);
router.get('/:id', validators.objectId(), validate, controller.getById);

module.exports = router;
