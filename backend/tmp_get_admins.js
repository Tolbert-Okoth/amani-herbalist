const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'JesusSaves@400',
  host: 'localhost',
  port: 5432,
  database: 'amani_herbal_db',
});

async function getAdmins() {
  try {
    const res = await pool.query('SELECT * FROM admins');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

getAdmins();
