const express = require('express');
const router = express.Router();
const { adminLogin, adminLogout } = require('../controllers/authController');
const { adminAuth } = require('../middleware/adminAuth');

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

// POST /api/auth/admin/logout (Protected to log which user is leaving)
router.post('/admin/logout', adminAuth, adminLogout);

module.exports = router;
