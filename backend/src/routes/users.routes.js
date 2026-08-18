const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { validateCreateUser, validateUserRole, validateUserStatus } = require('../middlewares/validation.middleware');

router.use(authMiddleware, requireRole('super_admin'));

router.get('/', usersController.getUsers);
router.post('/', validateCreateUser, usersController.createUser);
router.put('/:id', usersController.updateUser);
router.put('/:id/role', validateUserRole, usersController.updateUserRole);
router.put('/:id/status', validateUserStatus, usersController.updateUserStatus);
router.post('/:id/reset-password', usersController.resetUserPassword);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
