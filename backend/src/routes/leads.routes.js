const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

router.post('/', leadsController.createLead);
router.get('/', authMiddleware, requireRole('sales', 'super_admin'), leadsController.getLeads);
router.put('/:id/status', authMiddleware, requireRole('sales', 'super_admin'), leadsController.updateLeadStatus);

module.exports = router;
