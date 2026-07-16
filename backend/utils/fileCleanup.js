const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

/**
 * Safely deletes an uploaded file from disk OR Cloudinary to prevent file orphan accumulation.
 * @param {string} fileUrl - The URL saved in the DB (e.g. "/uploads/xyz.jpg" or "https://res.cloudinary.com/...")
 */
const deleteUploadedFile = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // 1. Check if it's a Cloudinary URL
    if (fileUrl.includes('res.cloudinary.com')) {
      // Extract the public_id from the Cloudinary URL
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
      const urlParts = fileUrl.split('/');
      const filenameWithExtension = urlParts.pop(); // filename.jpg
      const folderName = urlParts.pop(); // folder
      
      const filename = filenameWithExtension.split('.')[0]; // filename
      const publicId = folderName === 'upload' ? filename : `${folderName}/${filename}`;

      console.log(`[File Cleanup] Deleting from Cloudinary: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
      return;
    }

    // 2. If it's a local file, delete it from disk
    const filename = path.basename(fileUrl);
    
    // Ensure we only try to delete files in the uploads directory
    if (!filename || filename === '.' || filename === '..') return;

    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code !== 'ENOENT') {
           console.error(`[File Cleanup Error] Failed to delete local file: ${filePath}`, err);
        }
      } else {
        console.log(`[File Cleanup] Successfully scrubbed orphaned file: ${filename}`);
      }
    });
  } catch (error) {
    console.error(`[File Cleanup Error] Exception during file deletion:`, error);
  }
};

module.exports = { deleteUploadedFile };
