const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { adminAuth } = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const { storage } = require('../config/cloudinary');

// 🟢 Production Hardening: File Filter & Size Limit
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports images (JPEG, PNG, WEBP)"));
  }
});

// ── Core CRUD ─────────────────────────────────────────────────────────
router.get('/',          productController.getAllProducts);
router.get('/featured',  productController.getFeaturedProduct); // Must be ABOVE /:id
router.post('/',         adminAuth, upload.single('image'), productController.createProduct);
router.put('/:id',       adminAuth, upload.single('image'), productController.updateProduct);
router.delete('/:id',    adminAuth, productController.deleteProduct);

router.get('/:id',       productController.getProductById);

module.exports = router;