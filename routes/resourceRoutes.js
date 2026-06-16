const express = require('express');
const controller = require('../controllers/resourceController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const validators = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), validators.resource, validate, controller.upload);
router.get('/', validators.pagination, validate, controller.list);
router.get('/:id', validators.objectId(), validate, controller.getById);
router.delete('/:id', validators.objectId(), validate, controller.remove);
router.patch('/:id/download', validators.objectId(), validate, controller.download);

module.exports = router;
