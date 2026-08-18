const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authMiddleware, requireRole, checkLeadOwnership } = require('../middlewares/auth.middleware');
const { validateCreateLead, validateLeadStatus } = require('../middlewares/validation.middleware');

router.post('/', validateCreateLead, leadsController.createLead);
router.get('/', authMiddleware, requireRole('sales', 'super_admin', 'editor', 'viewer'), leadsController.getLeads);
router.put('/:id/status', authMiddleware, requireRole('sales', 'super_admin'), checkLeadOwnership, validateLeadStatus, leadsController.updateLeadStatus);
router.patch('/:id/status', authMiddleware, requireRole('sales', 'super_admin'), checkLeadOwnership, validateLeadStatus, leadsController.updateLeadStatus);

// Editor status change proposals
router.post('/:id/flag', authMiddleware, requireRole('editor'), leadsController.createLeadFlag);
router.get('/flags', authMiddleware, requireRole('super_admin', 'sales', 'editor'), leadsController.getLeadFlags);

module.exports = router;
