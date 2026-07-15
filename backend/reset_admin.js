const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetPassword() {
  try {
    const hash = await bcrypt.hash('Boss#2026!', 10);
    await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [hash, 'stalin']);
    console.log('Password reset successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetPassword();
