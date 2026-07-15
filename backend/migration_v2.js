const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addStatusReasonColumn() {
  try {
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_reason TEXT;');
    console.log('✅ status_reason column verified/added successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding column:', err.message);
    process.exit(1);
  }
}

addStatusReasonColumn();
