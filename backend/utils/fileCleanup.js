const fs = require('fs');
const path = require('path');

/**
 * Safely deletes an uploaded file from the disk to prevent file orphan accumulation.
 * @param {string} fileUrl - The URL/path saved in the DB (e.g. "/uploads/1709849202029.jpg")
 */
const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // Extract just the filename to prevent path traversal attempts
    const filename = path.basename(fileUrl);
    
    // Ensure we only try to delete files in the uploads directory
    if (!filename || filename === '.' || filename === '..') return;

    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.unlink(filePath, (err) => {
      if (err) {
        // Ignore ENOENT (file doesn't exist), log other errors
        if (err.code !== 'ENOENT') {
           console.error(`[File Cleanup Error] Failed to delete orphaned file: ${filePath}`, err);
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
