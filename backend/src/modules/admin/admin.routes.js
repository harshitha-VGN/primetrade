const router = require('express').Router();
const { param } = require('express-validator');
const validate = require('../../middleware/validate');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');
const ctrl = require('./admin.controller');

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

//  Platform stats 
// GET /api/v1/admin/stats
router.get('/stats', ctrl.getStats);

//  User management 
// GET /api/v1/admin/users?search=&role=&page=&limit=
router.get('/users', ctrl.getAllUsers);

// PATCH /api/v1/admin/users/:id/promote
router.patch(
  '/users/:id/promote',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validate,
  ctrl.promoteUser
);

// PATCH /api/v1/admin/users/:id/demote
router.patch(
  '/users/:id/demote',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validate,
  ctrl.demoteUser
);

// DELETE /api/v1/admin/users/:id
router.delete(
  '/users/:id',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validate,
  ctrl.deleteUser
);

//  Task management (admin view) 
// GET /api/v1/admin/tasks?search=&status=&userId=&page=&limit=
router.get('/tasks', ctrl.getAllTasks);

// DELETE /api/v1/admin/tasks/:id
router.delete(
  '/tasks/:id',
  [param('id').isMongoId().withMessage('Invalid task id')],
  validate,
  ctrl.deleteTask
);

module.exports = router;