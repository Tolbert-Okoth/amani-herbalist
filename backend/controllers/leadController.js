const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Saves a new WhatsApp lead from the Exit-Intent Popup.
 */
exports.createLead = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'WhatsApp number is required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO leads (phone) VALUES ($1) RETURNING *',
      [phone]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving lead:', err.message);
    res.status(500).json({ error: 'Failed to save lead.' });
  }
};

/**
 * Fetches all WhatsApp leads.
 */
exports.getAllLeads = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching leads:', err.message);
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
};

/**
 * Updates the status of a lead.
 */
exports.updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query('UPDATE leads SET status = $1 WHERE id = $2', [status, id]);
    res.status(200).json({ success: true, message: 'Lead status updated.' });
  } catch (err) {
    console.error('Error updating lead status:', err.message);
    res.status(500).json({ error: 'Failed to update lead status.' });
  }
};

/**
 * Deletes a lead by ID.
 */
exports.deleteLead = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }
    res.status(200).json({ success: true, message: 'Lead deleted permanently.' });
  } catch (err) {
    console.error('Error deleting lead:', err.message);
    res.status(500).json({ error: 'Failed to delete lead.' });
  }
};
