const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- GET ALL ADS ---
exports.getAllAds = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM regional_ads ORDER BY display_order ASC, created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ success: false, message: 'Server error fetching ads' });
  }
};

// --- CREATE AD ---
exports.createAd = async (req, res) => {
  try {
    const { title, is_active, display_order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Flyer image is required' });
    }

    const flyerUrl = req.file.path;

    const result = await pool.query(
      `INSERT INTO regional_ads (title, flyer_url, is_active, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title || 'Untitled Ad', flyerUrl, is_active !== 'false', parseInt(display_order) || 0]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ success: false, message: 'Server error creating ad' });
  }
};

// --- UPDATE AD STATUS ---
exports.updateAdStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE regional_ads SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating ad status:', err);
    res.status(500).json({ success: false, message: 'Server error updating ad' });
  }
};

// --- DELETE AD ---
exports.deleteAd = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get flyer_url to delete file
    const adCheck = await pool.query('SELECT flyer_url FROM regional_ads WHERE id = $1', [id]);
    
    if (adCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    const flyerUrl = adCheck.rows[0].flyer_url;

    // 2. Delete from DB
    await pool.query('DELETE FROM regional_ads WHERE id = $1', [id]);

    // 3. Delete file from FS
    if (flyerUrl) {
      const filePath = path.join(__dirname, '..', flyerUrl);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Failed to delete flyer file:', err);
      });
    }

    res.status(200).json({ success: true, message: 'Ad deleted successfully' });
  } catch (err) {
    console.error('Error deleting ad:', err);
    res.status(500).json({ success: false, message: 'Server error deleting ad' });
  }
};
