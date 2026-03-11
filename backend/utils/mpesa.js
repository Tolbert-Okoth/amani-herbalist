const axios = require('axios');
require('dotenv').config();

// M-Pesa Credentials from .env
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_SHORTCODE; // e.g., 174379 for sandbox
const passkey = process.env.MPESA_PASSKEY;
// Base URL for sandbox or production
const baseURL = 'https://sandbox.safaricom.co.ke'; 

const mpesaAuth = async (req, res, next) => {
    try {
        const buffer = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const response = await axios.get(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${buffer}`,
            },
        });
        
        // Attach token to the request object so the next function can use it
        req.mpesaToken = response.data.access_token;
        next();
    } catch (error) {
        console.error("M-Pesa Auth Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to authenticate with M-Pesa" });
    }
};

const stkPush = async (req, res) => {
    // These would normally come from your frontend checkout form
    const { phone, amount, orderId } = req.body; 
    
    // Format phone number to 2547XXXXXXXX
    const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    try {
        const response = await axios.post(`${baseURL}/mpesa/stkpush/v1/processrequest`, {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline", // or CustomerBuyGoodsOnline
            Amount: amount,
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: `${process.env.CALLBACK_URL}/api/orders/mpesa-callback`, // Your deployed backend URL
            AccountReference: `Order ${orderId}`,
            TransactionDesc: "Amani Herbalists Payment"
        }, {
            headers: {
                Authorization: `Bearer ${req.mpesaToken}`
            }
        });

        res.status(200).json({ 
            message: "STK Push sent successfully. Please check your phone.",
            checkoutRequestID: response.data.CheckoutRequestID 
        });

    } catch (error) {
        console.error("STK Push Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to initiate M-Pesa payment" });
    }
};

module.exports = { mpesaAuth, stkPush };