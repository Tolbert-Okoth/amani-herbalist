const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Ensures the settings table exists with one default row
const ensureSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      home_delivery_fee INT DEFAULT 500,
      pickup_delivery_fee INT DEFAULT 200,
      franchise_discount_rate INT DEFAULT 20,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Insert the single settings row if it doesn't exist yet
  await pool.query(`
    INSERT INTO settings (id, home_delivery_fee, pickup_delivery_fee, franchise_discount_rate)
    VALUES (1, 500, 200, 20)
    ON CONFLICT (id) DO NOTHING;
  `);
};

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    await ensureSettingsTable();
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  const { home_delivery_fee, pickup_delivery_fee, franchise_discount_rate } = req.body;

  if (
    home_delivery_fee === undefined &&
    pickup_delivery_fee === undefined &&
    franchise_discount_rate === undefined
  ) {
    return res.status(400).json({ error: 'No valid fields provided.' });
  }

  try {
    await ensureSettingsTable();
    const result = await pool.query(
      `UPDATE settings
       SET
         home_delivery_fee       = COALESCE($1, home_delivery_fee),
         pickup_delivery_fee     = COALESCE($2, pickup_delivery_fee),
         franchise_discount_rate = COALESCE($3, franchise_discount_rate),
         updated_at              = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [home_delivery_fee ?? null, pickup_delivery_fee ?? null, franchise_discount_rate ?? null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};

module.exports = { getSettings, updateSettings };
