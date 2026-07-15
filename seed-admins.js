/**
 * Run this once to create the admins table and seed the two admin users.
 * Usage: node seed-admins.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const admins = [
  { username: 'stalin',  password: 'G7$kL9!vQ2#rX8@p' },
  { username: 'timothy', password: 'Z!4mT@8w#K2qL7$y' },
];

async function seed() {
  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            SERIAL PRIMARY KEY,
        username      VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        last_login    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ admins table ready.');

    // 2. Insert users
    for (const admin of admins) {
      const hash = await bcrypt.hash(admin.password, 12);
      await pool.query(
        `INSERT INTO admins (username, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [admin.username, hash]
      );
      console.log(`✅ Admin "${admin.username}" seeded.`);
    }

    console.log('\n🎉 Done! Both admins are ready. Login at /admin/login');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();
