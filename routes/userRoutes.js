const express = require('express');
const controller = require('../controllers/userController');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.get('/mentors', validators.pagination, validate, controller.mentors);
router.get('/stats', controller.stats);

module.exports = router;
