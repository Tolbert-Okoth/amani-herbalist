const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create table for WhatsApp Leads
    console.log('Creating leads table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          phone VARCHAR(20) NOT NULL,
          source VARCHAR(50) DEFAULT 'Exit-Intent Popup',
          status VARCHAR(50) DEFAULT 'New',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create table for Franchise IDs
    console.log('Creating franchises table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS franchises (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          discount_rate DECIMAL(3,2) DEFAULT 0.20,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Seed some default franchises if they don't exist
    console.log('Seeding default franchises...');
    await client.query(`
      INSERT INTO franchises (code, discount_rate) 
      VALUES ('FOHOW-VIP', 0.25), ('EDEN-B2B', 0.20)
      ON CONFLICT (code) DO NOTHING
    `);

    // 4. Update existing Orders table
    console.log('Updating orders table columns...');
    // We check if the column exists before adding to avoid errors on re-run
    const columnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'franchise_id'
    `);

    if (columnsCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN franchise_id INTEGER REFERENCES franchises(id) ON DELETE SET NULL,
        ADD COLUMN subtotal DECIMAL(10,2),
        ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0
      `);
    }

    await client.query('COMMIT');
    console.log('✅ Migration successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
