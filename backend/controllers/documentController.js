const pool = require('../config/db');
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
      // delete old file if necessary (skipping for now to avoid side-effects if someone's downloading it, or implement fs.unlink)
      if (existingDoc.file_url) {
        const fileName = path.basename(existingDoc.file_url);
        const filePath = path.join(__dirname, '..', 'uploads', 'documents', fileName);
        fs.unlink(filePath, (err) => { if (err) console.error('Failed to delete old file:', err); });
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
    
    // Delete file from disk
    if (fileUrl) {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(__dirname, '..', 'uploads', 'documents', fileName);
      
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file from disk: ${filePath}`, err);
          // Don't throw error to client since DB record is deleted
        }
      });
    }
    
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ success: false, error: 'Server error deleting document' });
  }
};
