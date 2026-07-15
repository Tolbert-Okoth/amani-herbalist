const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// GET all upcoming events
exports.getAllEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ success: false, error: 'Server error fetching events' });
  }
};

// POST a new event
exports.createEvent = async (req, res) => {
  const { title, date, location_city, description, is_active } = req.body;
  const flyer_url = req.file ? req.file.path : null;
  
  try {
    const active = is_active === undefined ? true : (is_active === 'true' || is_active === true);
    
    const result = await pool.query(
      `INSERT INTO events (title, date, location_city, description, is_active, flyer_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, date, location_city, description, active, flyer_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating event:', err.message);
    res.status(500).json({ success: false, error: 'Server error creating event' });
  }
};

// UPDATE an event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, date, location_city, description, is_active } = req.body;
  try {
    const active = is_active === undefined ? true : (is_active === 'true' || is_active === true);
    
    if (req.file) {
      const flyer_url = req.file.path;
      await pool.query(
        `UPDATE events 
         SET title=$1, date=$2, location_city=$3, description=$4, is_active=$5, flyer_url=$6
         WHERE id=$7`,
        [title, date, location_city, description, active, flyer_url, id]
      );
    } else {
      await pool.query(
        `UPDATE events 
         SET title=$1, date=$2, location_city=$3, description=$4, is_active=$5
         WHERE id=$6`,
        [title, date, location_city, description, active, id]
      );
    }
    res.status(200).json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error updating event:', err.message);
    res.status(500).json({ success: false, error: 'Server error updating event' });
  }
};

// DELETE an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ success: false, error: 'Server error deleting event' });
  }
};

// --- RSVPs ---

// GET RSVPs for a specific event
exports.getEventRSVPs = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM event_rsvps WHERE event_id = $1 ORDER BY created_at DESC', [id]);
    res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    console.error('Error fetching event RSVPs:', err.message);
    res.status(500).json({ success: false, error: 'Server error fetching RSVPs' });
  }
};

// POST RSVP to an event
exports.createRSVP = async (req, res) => {
  try {
    const { id } = req.params; // event_id
    const { attendee_name, phone_number, clinic_name, email_address, attendee_count } = req.body;
    
    // Ensure event exists and is active
    const eventCheck = await pool.query('SELECT is_active, title FROM events WHERE id = $1', [id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    if (!eventCheck.rows[0].is_active) {
      return res.status(400).json({ success: false, error: 'This event is no longer active' });
    }

    const count = parseInt(attendee_count) || 1;

    const result = await pool.query(
      `INSERT INTO event_rsvps (event_id, attendee_name, phone_number, clinic_name, email_address, attendee_count) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, attendee_name, phone_number, clinic_name, email_address, count]
    );
    
    // Fetch Event Title for the admin email
    const eventTitle = eventCheck.rows[0].title || 'Fohow Event';

    // Trigger Admin Email asynchronously with a catch block
    emailService.notifyAdminOfNewRSVP(result.rows[0], eventTitle).catch(err => {
      console.error("Failed to send admin RSVP notification:", err);
    });
    
    res.status(201).json({ success: true, data: result.rows[0], message: 'RSVP successful!' });
  } catch (err) {
    console.error('Error creating RSVP:', err.message);
    res.status(500).json({ success: false, error: 'Server error creating RSVP' });
  }
};

const emailService = require('../utils/emailService');

// UPDATE RSVP Status
exports.updateRSVPStatus = async (req, res) => {
  const { rsvpId } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE event_rsvps SET status = $1 WHERE id = $2', [status, rsvpId]);
    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error('Error updating RSVP status:', err.message);
    res.status(500).json({ success: false, error: 'Server error updating RSVP status' });
  }
};

// CONFIRM RSVP and SEND EMAIL
exports.confirmRSVP = async (req, res) => {
  const { rsvpId } = req.params;
  const { confirmed_time } = req.body;
  
  try {
    // Update DB
    const result = await pool.query(
      `UPDATE event_rsvps SET status = 'Confirmed', confirmed_time = $1 WHERE id = $2 RETURNING *`,
      [confirmed_time, rsvpId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'RSVP not found' });
    }

    const rsvp = result.rows[0];

    // Fetch Event Title
    const eventCheck = await pool.query('SELECT title FROM events WHERE id = $1', [rsvp.event_id]);
    const eventTitle = eventCheck.rows[0]?.title || 'Fohow Event';

    // Send Email (Fire and forget to avoid UI delay)
    emailService.sendClientRSVPConfirmation(rsvp.email_address, {
      attendee_name: rsvp.attendee_name,
      event_title: eventTitle,
      attendee_count: rsvp.attendee_count,
      confirmed_time: confirmed_time
    });

    res.status(200).json({ success: true, message: 'RSVP confirmed and email sent' });
  } catch (err) {
    console.error('Error confirming RSVP:', err.message);
    res.status(500).json({ success: false, error: 'Server error confirming RSVP' });
  }
};

// DELETE RSVP
exports.deleteRSVP = async (req, res) => {
  const { rsvpId } = req.params;
  try {
    await pool.query('DELETE FROM event_rsvps WHERE id = $1', [rsvpId]);
    res.status(200).json({ success: true, message: 'RSVP deleted successfully' });
  } catch (err) {
    console.error('Error deleting RSVP:', err.message);
    res.status(500).json({ success: false, error: 'Server error deleting RSVP' });
  }
};
