const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { adminAuth, requireBoss } = require('../middleware/adminAuth');

// GET  /api/settings  — fetch current business settings (Publicly accessible)
router.get('/', getSettings);

// PUT  /api/settings  — update delivery fees / discount rate (Boss sensitive)
router.put('/', adminAuth, requireBoss, updateSettings);

module.exports = router;
