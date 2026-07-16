const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logSecurityEvent } = require('../utils/securityLogger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '8h'; // Token valid for 8 hours

const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      logSecurityEvent('FAILED_LOGIN_USER_NOT_FOUND', { username, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      logSecurityEvent('FAILED_LOGIN_WRONG_PASSWORD', { username, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Update last login timestamp
    await pool.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    logSecurityEvent('SUCCESSFUL_LOGIN', { username: admin.username, role: admin.role, ip: req.ip });


    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 🟢 SECURE COOKIE IMPLEMENTATION (XSS Protection)
    res.cookie('fohow_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true on live server, false on localhost
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours (matches JWT expiration)
      path: '/'
    });

    return res.status(200).json({
      message: 'Login successful.',
      username: admin.username,
      role: admin.role,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

const adminLogout = async (req, res) => {
  // Extract username from req.admin (attached by the adminAuth middleware)
  const username = req.admin ? req.admin.username : 'unknown';
  
  logSecurityEvent('LOGOUT', { username, ip: req.ip });

  res.clearCookie('fohow_admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/'
  });

  return res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = { adminLogin, adminLogout };
