const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'security.log');

/**
 * Ensures the logs directory and security.log file exist.
 */
const initLogger = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }
};

/**
 * Logs security-related events with a timestamp.
 * @param {string} event - The event description.
 * @param {object} metadata - Optional metadata (IP, username, etc.)
 */
const logSecurityEvent = (event, metadata = {}) => {
  initLogger();
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ...metadata
  };
  
  const logString = JSON.stringify(logEntry) + '\n';
  
  fs.appendFile(LOG_FILE, logString, (err) => {
    if (err) console.error('❌ [SECURITY LOGGER] Failed to write log:', err);
  });
};

module.exports = { logSecurityEvent };
