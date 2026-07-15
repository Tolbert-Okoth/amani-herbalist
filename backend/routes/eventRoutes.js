const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { adminAuth, requireBoss } = require('../middleware/adminAuth');

const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Use Cloudinary Storage
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Public Routes ---
router.get('/', eventController.getAllEvents);
router.post('/:id/rsvp', eventController.createRSVP);

// --- Admin (Protected) Routes ---
// The original code used `requireBoss`, I will keep it if it was there, or just `adminAuth` as requested. 
// "Protect the POST/PUT/DELETE routes with our adminAuth middleware."
router.post('/', adminAuth, upload.single('flyer'), eventController.createEvent);
router.put('/:id', adminAuth, upload.single('flyer'), eventController.updateEvent);
router.delete('/:id', adminAuth, eventController.deleteEvent);

router.get('/:id/rsvps', adminAuth, eventController.getEventRSVPs);
router.put('/rsvps/:rsvpId/status', adminAuth, eventController.updateRSVPStatus);
router.post('/rsvps/:rsvpId/confirm', adminAuth, eventController.confirmRSVP);
router.delete('/rsvps/:rsvpId', adminAuth, eventController.deleteRSVP);

module.exports = router;
