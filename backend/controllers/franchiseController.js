const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Validates a franchise code for B2B discounts.
 */
exports.validateFranchise = async (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ valid: false, error: 'Franchise code is required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, discount_rate FROM franchises WHERE code = $1 AND is_active = TRUE',
      [code.toUpperCase()]
    );

    if (result.rows.length > 0) {
      res.json({ valid: true, franchise: result.rows[0] });
    } else {
      res.status(404).json({ valid: false, error: 'Invalid or inactive Franchise ID.' });
    }
  } catch (err) {
    console.error('Error validating franchise:', err.message);
    res.status(500).json({ valid: false, error: 'Failed to validate franchise.' });
  }
};

/**
 * Fetches all franchises (Admin Only).
 */
exports.getAllFranchises = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM franchises ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching franchises:', err.message);
    res.status(500).json({ error: 'Failed to fetch franchises.' });
  }
};

/**
 * Creates a new franchise code (Admin Only).
 */
exports.createFranchise = async (req, res) => {
  const { code, discount_rate } = req.body;

  if (!code || discount_rate === undefined) {
    return res.status(400).json({ error: 'Code and discount rate are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO franchises (code, discount_rate) VALUES ($1, $2) RETURNING *',
      [code.toUpperCase(), discount_rate]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating franchise:', err.message);
    res.status(500).json({ error: 'Failed to create franchise. Code might already exist.' });
  }
};

/**
 * Updates a franchise (status and/or discount_rate) — Admin Only.
 */
exports.updateFranchise = async (req, res) => {
  const { id } = req.params;
  const { is_active, discount_rate } = req.body;

  try {
    // Build dynamic SET clause to handle partial updates
    const updates = [];
    const values = [];
    let idx = 1;

    if (is_active !== undefined) {
      updates.push(`is_active = $${idx++}`);
      values.push(is_active);
    }
    if (discount_rate !== undefined) {
      updates.push(`discount_rate = $${idx++}`);
      values.push(discount_rate);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    values.push(id);
    await pool.query(
      `UPDATE franchises SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );
    res.status(200).json({ success: true, message: 'Franchise updated.' });
  } catch (err) {
    console.error('Error updating franchise:', err.message);
    res.status(500).json({ error: 'Failed to update franchise.' });
  }
};

/**
 * Deletes a franchise code permanently (Admin Only).
 */
exports.deleteFranchise = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM franchises WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Franchise not found.' });
    }
    res.status(200).json({ success: true, message: 'Franchise deleted.' });
  } catch (err) {
    console.error('Error deleting franchise:', err.message);
    res.status(500).json({ error: 'Failed to delete franchise.' });
  }
};
