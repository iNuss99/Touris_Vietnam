const express = require('express');
const router = express.Router();
const destinationsController = require('../controllers/destinations.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

router.get('/', destinationsController.getDestinations);
router.post('/', authMiddleware, requireRole('editor', 'super_admin'), destinationsController.createDestination);
router.put('/:id', authMiddleware, requireRole('editor', 'super_admin'), destinationsController.updateDestination);
router.delete('/:id', authMiddleware, requireRole('editor', 'super_admin'), destinationsController.deleteDestination);

module.exports = router;
