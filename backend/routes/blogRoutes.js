const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { adminAuth, requireBoss } = require('../middleware/adminAuth');
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

router.get('/', blogController.getAllBlogs);
router.post('/', adminAuth, requireBoss, upload.single('image'), blogController.createBlog);
router.put('/:id', adminAuth, requireBoss, upload.single('image'), blogController.updateBlog);
router.delete('/:id', adminAuth, requireBoss, blogController.deleteBlog);

module.exports = router;