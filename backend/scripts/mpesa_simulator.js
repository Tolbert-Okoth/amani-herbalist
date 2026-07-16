const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function monitorAndSimulate() {
  console.log("🚀 M-Pesa Callback Simulator Started...");
  console.log("Watching for 'Pending Payment' orders every 3 seconds...");

  setInterval(async () => {
    try {
      const result = await pool.query(
        "SELECT order_number, checkout_request_id FROM orders WHERE status = 'Pending Payment'"
      );

      for (const order of result.rows) {
        if (!order.checkout_request_id) continue;
        
        console.log(`\n📦 Found Pending Order: ${order.order_number}`);
        console.log(`Simulating Safaricom Success Callback for RequestID: ${order.checkout_request_id}...`);

        const payload = {
          Body: {
            stkCallback: {
              MerchantRequestID: "29115-34620561-1",
              CheckoutRequestID: order.checkout_request_id,
              ResultCode: 0,
              ResultDesc: "The service request is processed successfully.",
              CallbackMetadata: {
                Item: [
                  { Name: "Amount", Value: 6300 },
                  { Name: "MpesaReceiptNumber", Value: "TEST" + Math.floor(Math.random() * 1000000) },
                  { Name: "TransactionDate", Value: 20260401183000 },
                  { Name: "PhoneNumber", Value: 254700000000 }
                ]
              }
            }
          }
        };

        try {
          await axios.post('http://localhost:5001/api/mpesa/callback', payload);
          console.log(`✅ Successfully simulated callback for ${order.order_number}`);
        } catch (postErr) {
          console.error(`❌ Failed to send simulated callback:`, postErr.message);
        }
      }
    } catch (err) {
      console.error("Database query error:", err.message);
    }
  }, 3000);
}

monitorAndSimulate();
