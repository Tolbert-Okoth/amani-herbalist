const pool = require('../config/db');
const { deleteUploadedFile } = require('../utils/fileCleanup');
exports.getAllDocuments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents ORDER BY uploaded_at DESC');
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('Error fetching documents:', err.message);
    res.status(500).json({ success: false, error: 'Server error fetching documents' });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { title, excerpt, is_published } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a document file' });
    }
    
    const file_url = req.file.path;
    const published = is_published === 'false' ? false : true;
    
    const result = await pool.query(
      `INSERT INTO documents (title, excerpt, file_url, is_published) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title || req.file.originalname, excerpt || '', file_url, published]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating document:', err.message);
    res.status(500).json({ success: false, error: 'Server error creating document' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, is_published } = req.body;
    
    // Check if doc exists
    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (docResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    const existingDoc = docResult.rows[0];
    let file_url = existingDoc.file_url;
    
    if (req.file) {
      file_url = req.file.path;
      if (existingDoc.file_url) {
        deleteUploadedFile(existingDoc.file_url);
      }
    }
    
    const published = is_published !== undefined ? (is_published === 'true' || is_published === true) : existingDoc.is_published;
    
    const result = await pool.query(
      `UPDATE documents SET title = $1, excerpt = $2, file_url = $3, is_published = $4 WHERE id = $5 RETURNING *`,
      [title || existingDoc.title, excerpt || existingDoc.excerpt || '', file_url, published, id]
    );
    
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating document:', err.message);
    res.status(500).json({ success: false, error: 'Server error updating document' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the document to get the file path
    const docResult = await pool.query('SELECT file_url FROM documents WHERE id = $1', [id]);
    
    if (docResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    const fileUrl = docResult.rows[0].file_url;
    
    // Delete from database
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    
    // Delete file from disk/Cloudinary
    if (fileUrl) {
      deleteUploadedFile(fileUrl);
    }
    
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ success: false, error: 'Server error deleting document' });
  }
};

// --- DOWNLOAD PROXY (streams from Cloudinary with proper headers) ---
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const docResult = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (docResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    const doc = docResult.rows[0];
    let fileUrl = doc.file_url;
    if (!fileUrl) {
      return res.status(404).json({ success: false, error: 'No file attached to this document' });
    }
    
    // Make sure it's a full URL
    if (!fileUrl.startsWith('http')) {
      fileUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;
    }
    
    // Determine file extension and MIME type
    const path = require('path');
    const urlPath = new URL(fileUrl).pathname;
    let ext = path.extname(urlPath).toLowerCase() || '.ppt';
    
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
    };
    
    const contentType = mimeMap[ext] || 'application/octet-stream';
    const safeName = doc.title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
    const filename = `${safeName}${ext}`;
    
    // Fetch the file from Cloudinary
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.error(`[Download Proxy] Cloudinary responded ${response.status} for ${fileUrl}`);
      return res.status(502).json({ success: false, error: 'Failed to fetch file from storage' });
    }
    
    // Stream it to the client as a proper download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb(response.body);
    nodeStream.pipe(res);
    
  } catch (err) {
    console.error('Error proxying document download:', err.message);
    res.status(500).json({ success: false, error: 'Server error downloading document' });
  }
};
