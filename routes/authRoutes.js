const express = require('express');
const controller = require('../controllers/authController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.post('/register', validators.register, validate, controller.register);
router.post('/login', validators.login, validate, controller.login);
router.post('/logout', controller.logout);
router.get('/me', protect, controller.me);
router.put('/profile', protect, controller.updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), controller.updateAvatar);
router.put('/change-password', protect, validators.changePassword, validate, controller.changePassword);

module.exports = router;
