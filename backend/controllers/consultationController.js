const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const { notifyAdminOfNewConsultation, sendClientConsultationConfirmation } = require('../utils/emailService');



// --- SUBMIT A NEW REQUEST (Public) ---
exports.createConsultation = async (req, res) => {
  try {
    const { fname, lname, email, phone, type, concern } = req.body;

    const result = await pool.query(
      `INSERT INTO consultations (fname, lname, email, phone, type, concern)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fname, lname, email, phone || '', type, concern]
    );

    // 🚀 Email Alert to Admin (Stalin & Timothy)
    notifyAdminOfNewConsultation(result.rows[0]).catch(err => console.error("Admin Email Alert Error:", err));

    res.status(201).json({ success: true, data: result.rows[0] });


  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ success: false, message: 'Server error saving consultation' });
  }
};

// --- GET ALL REQUESTS (For Admin) ---
exports.getConsultations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM consultations ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching consultations' });
  }
};

// --- UPDATE STATUS (For Admin) ---
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE consultations SET status = $1 WHERE id = $2', [status, id]);
    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};
// --- CONFIRMATION & CLIENT NOTIFICATION (For Admin) ---
exports.confirmConsultation = async (req, res) => {
  const { id } = req.params;
  const { confirmed_time } = req.body;

  try {
    // 1. Update status in database
    const updated = await pool.query(
      `UPDATE consultations SET status = 'Confirmed', confirmed_time = $1 WHERE id = $2 RETURNING *`,
      [confirmed_time, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const booking = updated.rows[0];

    // 2. Email Confirmation to the Client
    if (booking.email) {
      sendClientConsultationConfirmation(booking.email, booking)
        .catch(err => console.error("Client Email Confirmation Error:", err));
    }

    res.status(200).json({ success: true, message: 'Client notified via Email' });

  } catch (err) {
    console.error('Error confirming consultation:', err);
    res.status(500).json({ success: false, message: 'Failed to confirm consultation' });
  }
};

// --- DELETE CONSULTATION ---
exports.deleteConsultation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM consultations WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    res.status(200).json({ success: true, message: 'Consultation deleted' });
  } catch (err) {
    console.error('Error deleting consultation:', err);
    res.status(500).json({ success: false, message: 'Failed to delete consultation' });
  }
};
