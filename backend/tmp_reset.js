const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({
  user: 'postgres',
  password: 'JesusSaves@400',
  host: 'localhost',
  port: 5432,
  database: 'amani_herbal_db',
});

async function reset() {
  try {
    const hash = await bcrypt.hash('***REDACTED***', 10);
    await pool.query("UPDATE admins SET password_hash = $1 WHERE username = 'timothy'", [hash]);
    
    // Also reset boss just in case
    const hashBoss = await bcrypt.hash('***REDACTED***', 10);
    await pool.query("UPDATE admins SET password_hash = $1 WHERE username = 'stalin'", [hashBoss]);
    
    console.log("Both admin passwords reset to: ***REDACTED***");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

reset();
