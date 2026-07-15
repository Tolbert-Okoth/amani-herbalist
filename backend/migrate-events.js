const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Adding flyer_url column to events table...');
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS flyer_url VARCHAR(255);');
    console.log('Successfully added flyer_url column.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
