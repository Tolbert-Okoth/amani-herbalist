const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { adminAuth } = require('../middleware/adminAuth');

const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Public Routes ---
router.get('/', adController.getAllAds);

// --- Admin (Protected) Routes ---
router.post('/', adminAuth, (req, res, next) => {
  upload.single('flyer')(req, res, (err) => {
    if (err) {
      console.error('[Ad Flyer Upload Error]', err);
      return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
    }
    next();
  });
}, adController.createAd);
router.put('/:id/status', adminAuth, adController.updateAdStatus);
router.delete('/:id', adminAuth, adController.deleteAd);

module.exports = router;
