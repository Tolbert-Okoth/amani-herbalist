const express = require('express');
const router = express.Router();

// 🟢 Update the import to use our new Unified Checkout controller
const { processCheckout, mpesaCallback, getOrderStatus } = require('../controllers/mpesaController');
const mpesaAuth = require('../middleware/mpesaAuth');

// POST /api/mpesa/stkpush 
// (This now handles saving the full order AND triggering M-Pesa)
router.post('/stkpush', mpesaAuth, processCheckout);

// GET /api/mpesa/status/:orderNumber (Frontend polls this)
router.get('/status/:orderNumber', getOrderStatus);

// POST /api/mpesa/callback (Safaricom hits this URL to confirm payment)
router.post('/callback', mpesaCallback);


module.exports = router;