const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Creating documents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        location_city VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    
    // Note: since an older 'events' table might exist, we might need to handle column differences.
    // Assuming we want to align it with the new schema, we might need to add missing columns.
    try {
        await client.query(`ALTER TABLE events ADD COLUMN date TIMESTAMP;`);
    } catch(e) {}
    try {
        await client.query(`ALTER TABLE events ADD COLUMN location_city VARCHAR(255);`);
    } catch(e) {}
    try {
        await client.query(`ALTER TABLE events ADD COLUMN is_active BOOLEAN DEFAULT TRUE;`);
    } catch(e) {}

    console.log('Creating event_rsvps table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        attendee_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        clinic_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Migration Phase 1 successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
