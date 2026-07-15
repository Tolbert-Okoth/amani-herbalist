const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { adminAuth, requireBoss } = require('../middleware/adminAuth');

// 1. Lead Capture (Public)
router.post('/', leadController.createLead);

// 2. Lead Management (Admin Only)
router.get('/', adminAuth, requireBoss, leadController.getAllLeads);
router.put('/:id/status', adminAuth, requireBoss, leadController.updateLeadStatus);
router.delete('/:id', adminAuth, requireBoss, leadController.deleteLead);

module.exports = router;
