const express = require('express');
const router = express.Router();
const ceoController = require('../controllers/ceo.controller');

router.get('/stats', ceoController.getCeoStats);
router.post('/ai-summary', ceoController.getCeoAiSummary);

module.exports = router;
