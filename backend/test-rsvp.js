const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    // 1. Create a dummy event
    const eventRes = await pool.query(
      `INSERT INTO events (title, date, location_city, description, is_active, category, event_date, event_month, event_time, location) 
       VALUES ('Test Seminar', NOW(), 'Nairobi', 'Testing the RSVP system', true, 'Seminar', '2026-05-23', 'May', '10:00 AM', 'Nairobi') RETURNING id`
    );
    const eventId = eventRes.rows[0].id;
    console.log('✅ Created dummy event ID:', eventId);

    // 2. Add an RSVP with the new fields
    const rsvpRes = await pool.query(
      `INSERT INTO event_rsvps (event_id, attendee_name, phone_number, clinic_name, email_address, attendee_count) 
       VALUES ($1, 'Dr. Smith', '0700000000', 'Smith Clinic', 'smith@example.com', 3) RETURNING *`,
      [eventId]
    );
    console.log('✅ Created RSVP:', rsvpRes.rows[0]);

    // 3. Clean up
    await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
    console.log('✅ Cleaned up dummy event and its RSVPs (via ON DELETE CASCADE).');
  } catch (err) {
    console.error('❌ Error during testing:', err);
  } finally {
    pool.end();
  }
}
test();
