const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrate = async () => {
  try {
    console.log('Adding excerpt column to documents table...');
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS excerpt TEXT;`);
    console.log('✅ Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    pool.end();
  }
};

migrate();
