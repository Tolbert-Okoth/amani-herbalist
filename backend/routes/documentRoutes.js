const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const documentUpload = require('../middleware/documentUpload');
const { adminAuth } = require('../middleware/adminAuth');

// --- Public Routes ---
router.get('/', documentController.getAllDocuments);

// --- Admin (Protected) Routes ---
router.post('/', adminAuth, documentUpload.single('file'), documentController.createDocument);
router.put('/:id', adminAuth, documentUpload.single('file'), documentController.updateDocument);
router.delete('/:id', adminAuth, documentController.deleteDocument);

module.exports = router;
