const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding email and attendee count to event_rsvps table...');
    
    // Add columns if they don't exist
    try {
        await client.query(`ALTER TABLE event_rsvps ADD COLUMN email_address VARCHAR(255);`);
    } catch(e) {}
    
    try {
        await client.query(`ALTER TABLE event_rsvps ADD COLUMN attendee_count INTEGER DEFAULT 1;`);
    } catch(e) {}

    await client.query('COMMIT');
    console.log('✅ Migration: Added RSVP additions successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
