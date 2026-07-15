const axios = require('axios');
require('dotenv').config();

// 🔵 Global variables to cache the token in memory 🔵
let accessToken = null;
let tokenExpiry = null;

const mpesaAuth = async (req, res, next) => {
  // 🟢 Skip if not M-Pesa
  if (req.body && req.body.payment && req.body.payment.method !== 'mpesa') {
    return next(); 
  }

  // Check if we have a valid cached token
  const now = new Date();
  if (accessToken && tokenExpiry && now < tokenExpiry) {
    console.log("🎟️  Using cached M-Pesa Access Token");
    req.token = accessToken;
    return next();
  }

  console.log("🔑 Generating new M-Pesa Access Token...");
  const isProd = process.env.MPESA_ENVIRONMENT === 'production';
  const baseUrl = isProd ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';
  
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const buffer = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      `https://${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${buffer}` } }
    );


    accessToken = response.data.access_token;
    // Set expiry to 50 mins from now (Safaricom tokens usually last 1 hour)
    tokenExpiry = new Date(now.getTime() + 50 * 60 * 1000);

    req.token = accessToken;
    next();
  } catch (error) {
    console.error("M-Pesa Auth Error:", error.response ? error.response.data : error.message);
    res.status(401).json({ error: "Failed to authenticate with M-Pesa" });
  }
};


module.exports = mpesaAuth;