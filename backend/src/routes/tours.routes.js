const express = require('express');
const router = express.Router();
const toursController = require('../controllers/tours.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

router.get('/', toursController.getTours);
router.post('/', authMiddleware, requireRole('editor', 'super_admin'), toursController.createTour);
router.put('/:id', authMiddleware, requireRole('editor', 'super_admin'), toursController.updateTour);
router.delete('/:id', authMiddleware, requireRole('editor', 'super_admin'), toursController.deleteTour);

module.exports = router;
