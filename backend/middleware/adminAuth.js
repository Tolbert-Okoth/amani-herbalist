const jwt = require('jsonwebtoken');
const path = require('path');

// Ensure environmental variables are loaded from the backend directory specifically
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Middleware to verify the Admin JWT token.
 * Expects the token in the Authorization header: Bearer <token>
 */
const adminAuth = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  // 🟢 1. Extract token from secure cookies
  const token = req.cookies?.fohow_admin_token;

  if (!JWT_SECRET) {
    console.error('❌ [AUTH ERROR] JWT_SECRET is missing from environment variables.');
    return res.status(500).json({ error: 'Internal server configuration error.' });
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if the role is a valid admin role (boss, manager, or admin)
    const validRoles = ['boss', 'manager', 'admin'];
    if (!validRoles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden. Authorized role required.' });
    }

    // Attach decoded info to request object
    req.admin = decoded;
    next();
  } catch (err) {
    // Distinguish between expired and invalid tokens for better debugging
    if (err.name === 'TokenExpiredError') {
      console.warn('⚠️ [AUTH] Expired token received.');
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    
    console.error(`❌ [AUTH ERROR] JWT Verification Failed on ${req.originalUrl}: ${err.message}`);
    const tip = "💡 Tip: This usually means your browser has an old token. Clear your Local Storage or Log Out/In again.";
    console.log(tip);
    return res.status(401).json({ error: 'Invalid authentication.', tip });
  }
};

/**
 * Granular Middleware: Only lets the Boss through
 */
const requireBoss = (req, res, next) => {
  if (req.admin && req.admin.role === 'boss') {
    next(); // Access granted
  } else {
    res.status(403).json({ error: "Access Denied: Boss clearance required." });
  }
};

module.exports = { adminAuth, requireBoss };
