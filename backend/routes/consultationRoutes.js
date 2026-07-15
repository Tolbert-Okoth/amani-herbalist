const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { adminAuth, requireBoss } = require('../middleware/adminAuth');

router.post('/',              consultationController.createConsultation);

// --- Protected Routes (Boss Only) ---
router.get('/',               adminAuth, requireBoss, consultationController.getConsultations);
router.put('/:id/status',     adminAuth, requireBoss, consultationController.updateConsultationStatus);
router.post('/:id/confirm',   adminAuth, requireBoss, consultationController.confirmConsultation);
router.delete('/:id',         adminAuth, requireBoss, consultationController.deleteConsultation);

module.exports = router;
