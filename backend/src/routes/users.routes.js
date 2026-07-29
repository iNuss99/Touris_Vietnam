const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

router.use(authMiddleware, requireRole('super_admin'));

router.get('/', usersController.getUsers);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.put('/:id/role', usersController.updateUserRole);
router.put('/:id/status', usersController.updateUserStatus);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
