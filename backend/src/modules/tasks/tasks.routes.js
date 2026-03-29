const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../../middleware/validate');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');
const ctrl = require('./tasks.controller');

router.use(authenticate); // all task routes require login

router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  ctrl.create
);
router.get('/', ctrl.getMine);
router.get('/all', authorizeAdmin, ctrl.getAll); // admin only
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task id'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Status must be pending, in_progress, or completed'),
  ],
  validate,
  ctrl.update
);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid task id')], validate, ctrl.remove);

module.exports = router;