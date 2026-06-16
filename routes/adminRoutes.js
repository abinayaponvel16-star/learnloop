const express = require('express');
const controller = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', controller.dashboard);
router.get('/users', validators.pagination, validate, controller.users);
router.delete('/users/:id', validators.objectId(), validate, controller.deleteUser);
router.get('/sessions', validators.pagination, validate, controller.sessions);
router.get('/ratings', validators.pagination, validate, controller.ratings);
router.get('/resources', validators.pagination, validate, controller.resources);
router.get('/skills', validators.pagination, validate, controller.skills);
router.post('/skills', validators.skill, validate, controller.createSkill);
router.put('/skills/:id', validators.objectId(), validators.skill, validate, controller.updateSkill);

module.exports = router;
