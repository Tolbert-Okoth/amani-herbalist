const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

async function verifyFeatured() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query("SELECT id, name, is_featured FROM products WHERE is_featured = true");
    console.log("Featured Products:", res.rows);
    if (res.rows.length > 1) {
      console.error("ERROR: More than one featured product exists!");
    } else if (res.rows.length === 1) {
      console.log("SUCCESS: Exactly one featured product exists.");
    } else {
      console.log("NOTE: No products are currently featured.");
    }
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await pool.end();
  }
}

verifyFeatured();
