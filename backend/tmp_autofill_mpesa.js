const { Pool } = require('pg');
const fetch = require('node-fetch');

const pool = new Pool({
  user: 'postgres',
  password: 'password', // Assumed standard dev DB password
  host: 'localhost',
  port: 5432,
  database: 'amanidb', // Typical db name, or we can just fetch it from .env. Let's assume amanidb.
});

async function watchAndFulfill() {
  console.log("Watching for new pending M-Pesa orders...");
  setInterval(async () => {
    try {
      // Find the most recent pending order
      const client = await pool.connect();
      const res = await client.query(`
        SELECT order_number, mpesa_receipt_number, checkout_request_id, amount 
        FROM orders 
        WHERE status = 'pending' AND checkout_request_id IS NOT NULL 
        ORDER BY created_at DESC LIMIT 1
      `);
      
      if (res.rows.length > 0) {
        const order = res.rows[0];
        console.log(`Found pending order: ${order.order_number}`);
        
        // Wait 5 seconds to simulate real-world delay, allowing frontend to poll
        setTimeout(async () => {
          console.log(`Simulating success callback for ${order.checkout_request_id}`);
          
          const payload = {
            Body: {
              stkCallback: {
                MerchantRequestID: "12345-Simulated",
                CheckoutRequestID: order.checkout_request_id,
                ResultCode: 0,
                ResultDesc: "The service request is processed successfully.",
                CallbackMetadata: {
                  Item: [
                    { Name: "Amount", Value: order.amount },
                    { Name: "MpesaReceiptNumber", Value: "OQW23XYZ" + Math.floor(Math.random()*1000) },
                    { Name: "PhoneNumber", Value: 254712345678 }
                  ]
                }
              }
            }
          };

          await fetch('http://localhost:5001/api/mpesa/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          console.log(`Callback sent for ${order.checkout_request_id}`);
        }, 5000);
      }
      client.release();
    } catch (e) {
      console.error(e);
    }
  }, 2000);
}

watchAndFulfill();
