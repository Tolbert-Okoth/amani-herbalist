/**
 * RBAC Database Upgrade Script
 * Adds 'role' column and sets initial roles.
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upgrade() {
  try {
    console.log('--- Starting RBAC Upgrade ---');

    // 1. Check if column exists (optional but safe)
    // 2. Add the role column (defaults to manager)
    await pool.query(`
      ALTER TABLE admins 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'manager';
    `);
    console.log('✅ role column added (or already exists).');

    // 3. Upgrade 'stalin' to 'boss'
    const result = await pool.query(`
      UPDATE admins 
      SET role = 'boss' 
      WHERE username = 'stalin'
      RETURNING username, role;
    `);

    if (result.rowCount > 0) {
      console.log(`✅ User "${result.rows[0].username}" upgraded to role: "${result.rows[0].role}".`);
    } else {
      console.log('⚠️ User "stalin" not found. No one was upgraded to "boss".');
    }

    console.log('--- RBAC Upgrade Complete ---');
  } catch (err) {
    console.error('❌ Upgrade error:', err.message);
  } finally {
    await pool.end();
  }
}

upgrade();
