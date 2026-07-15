const multer = require('multer');
const path = require('path');
const { storage } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedExts.join(', ')} are allowed.`), false);
  }
};

const documentUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB limit
});

module.exports = documentUpload;
