const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchiseController');
const { adminAuth, requireBoss } = require('../middleware/adminAuth');

// 1. Franchise Validation (Public)
router.get('/validate/:code', franchiseController.validateFranchise);

// 2. Franchise Management (Admin Only)
router.get('/', adminAuth, requireBoss, franchiseController.getAllFranchises);
router.post('/', adminAuth, requireBoss, franchiseController.createFranchise);
router.put('/:id', adminAuth, requireBoss, franchiseController.updateFranchise);
router.delete('/:id', adminAuth, requireBoss, franchiseController.deleteFranchise);

module.exports = router;
