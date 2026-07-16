const pool = require('../config/db');
const axios = require('axios');
const { sendOrderPendingEmail, sendOrderConfirmationEmail } = require('../utils/emailService');


// 🔵 Rigorous Phone Number Formatter for Safaricom 254... 🔵
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '254' + clean.slice(1);
  if (clean.startsWith('7')) clean = '254' + clean;
  if (clean.startsWith('1')) clean = '254' + clean; // Handle 01... numbers
  if (clean.length === 9) clean = '254' + clean;
  return clean;
};


// 🔵 Input Sanitizer: Cleans strings to prevent XSS/Injection 🔵
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim(); // Remove basic tags
};

// 1. UNIFIED CHECKOUT & STK PUSH (Hardened with Server-Side Recalculation)
exports.processCheckout = async (req, res) => {
  if (!req.body || !req.body.customer) {
    return res.status(400).json({ error: "Invalid payload. Please ensure frontend sends the structured order object." });
  }

  const { customer, delivery, payment, items, franchiseId, piiConsent } = req.body;
  
  if (piiConsent !== true) {
    return res.status(400).json({ error: "Data protection consent is required." });
  }

  // Sanitization
  customer.firstName = sanitizeString(customer.firstName);
  customer.lastName = sanitizeString(customer.lastName);
  customer.email = sanitizeString(customer.email);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 🟢 1. FETCH IMMUTABLE DATA & RECALCULATE (FINANCIAL HARDENING)
    const settingsRes = await client.query('SELECT * FROM settings WHERE id = 1');
    const settings = settingsRes.rows[0] || { home_delivery_fee: 500 };
    
    // Verify Franchise & Get Global/Franchise Rate
    // Start with the global B2B discount from settings as the baseline (stored as INT, e.g. 20 for 20%)
    const globalDiscountRate = (Number(settings.franchise_discount_rate) || 0) / 100;
    let discountRateServer = globalDiscountRate;
    let internalFranchiseId = null;
    if (franchiseId) {
      const fQuery = await client.query('SELECT id, discount_rate FROM franchises WHERE code = $1 AND is_active = true', [franchiseId.trim().toUpperCase()]);
      if (fQuery.rows.length > 0) {
        internalFranchiseId = fQuery.rows[0].id;
        // Franchise discount_rate is stored as decimal (e.g. 0.20 for 20%)
        const franchiseRate = Number(fQuery.rows[0].discount_rate);
        // Use whichever is higher: the franchise rate or the global rate
        discountRateServer = Math.max(franchiseRate, globalDiscountRate);
      }
    }

    let subtotalServer = 0;
    let discountAmountServer = 0;
    const itemsWithPrices = [];

    // Verify every item price & custom_discount against the Database
    for (const item of items) {
      const productRes = await client.query('SELECT name, price_kes, custom_discount, stock_quantity FROM products WHERE id = $1', [item.id]);
      if (productRes.rows.length === 0) throw new Error(`Product not found: ${item.name}`);
      
      const dbProduct = productRes.rows[0];
      const dbPrice = Number(dbProduct.price_kes);
      const qty = Math.max(1, Math.round(Number(item.quantity)));

      // 🔴 INVENTORY HARDENING: Assert Stock Ceiling 🔴
      if (Number(dbProduct.stock_quantity) < qty) {
        throw new Error(`Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock_quantity} remaining.`);
      }

      
      let finalItemRate = discountRateServer;
      if (dbProduct.custom_discount !== null && dbProduct.custom_discount !== undefined) {
        finalItemRate = Number(dbProduct.custom_discount) / 100;
      }

      const itemSubtotal = dbPrice * qty;
      const itemDiscount = itemSubtotal * finalItemRate;

      subtotalServer += itemSubtotal;
      discountAmountServer += itemDiscount;

      itemsWithPrices.push({ 
        ...item, 
        name: dbProduct.name, // 🟢 FIX: Use real DB name for email
        price_kes: dbPrice, 
        quantity: qty,
        final_item_rate: finalItemRate 
      });
    }

    const taxableAmountServer = subtotalServer - discountAmountServer;
    const taxAmountServer = 0; // VAT removed by user request
    const deliveryFeeServer = delivery.method === 'home' ? settings.home_delivery_fee : 0;
    const finalAmountServer = Math.round(taxableAmountServer + taxAmountServer + deliveryFeeServer);

    // 2. Safaricom STK Push Logic (DISABLED for Manual Paybill Flow)
    const orderNumber = 'FOHOW-' + Math.floor(100000 + Math.random() * 900000);
    let checkoutRequestID = `MANUAL-${Date.now()}`; // Just a placeholder for DB constraints if any
    let initialStatus = 'Pending Payment';

    // 3. Save Parent Order (Using validated server-side totals)
    const orderRes = await client.query(`
      INSERT INTO orders (
        order_number, customer_phone, total_amount, status, payment_method, 
        checkout_request_id, customer_name, customer_email, delivery_method, delivery_address,
        subtotal, discount_amount, tax_amount, franchise_id, customer_id_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id
    `, [
      orderNumber, customer.phone, finalAmountServer, initialStatus, payment.method,
      checkoutRequestID, `${customer.firstName} ${customer.lastName}`, customer.email,
      delivery.method, JSON.stringify(delivery.address), subtotalServer, discountAmountServer,
      taxAmountServer, internalFranchiseId, customer.idNumber
    ]);

    const orderId = orderRes.rows[0].id;

    // 4. Save Items and Deduct Stock
    for (const item of itemsWithPrices) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price_kes]
      );
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.id]
      );
    }

    await client.query('COMMIT');
    
    // 5. Trigger 'Order Received - Pending Payment' Email
    const fullOrderDetails = {
      order_number: orderNumber,
      id: orderId,
      customer_name: `${customer.firstName} ${customer.lastName}`,
      total_amount: finalAmountServer
    };
    await sendOrderPendingEmail(customer.email, fullOrderDetails, itemsWithPrices);
    res.status(200).json({ success: true, orderNumber });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Checkout Security Breach/Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to process order securely." });
  } finally {
    client.release();
  }
};

// 🔵 Safaricom M-Pesa Error Code Mapping 🔵
const MPESA_ERROR_MESSAGES = {
  "1": "Insufficient funds in your M-Pesa account. Please top up or check your Fuliza limit.",
  "1032": "Transaction was cancelled by the user.",
  "1037": "Safaricom timeout. Please ensure your phone is on and try again, or update your M-Pesa menu.",
  "2001": "Incorrect M-Pesa PIN entered. Please try again.",
  "1001": "Another M-Pesa transaction is already in progress on your phone. Please wait a minute.",
  "1025": "M-Pesa system error (Invalid parameters). Please contact support.",
  "9999": "M-Pesa internal system error. Please try again later.",
  "generic": "M-Pesa payment failed. Please check your phone or try again."
};

// --- AUTH ---

// 2. M-PESA CALLBACK (Remains mostly the same!)
exports.mpesaCallback = async (req, res) => {
  console.log("------- M-PESA CALLBACK RECEIVED -------");

  // 🟢 ACKNOWLEDGE IMMEDIATELY (Safaricom requirement: < 2 seconds)
  res.status(200).send({ ResultCode: 0, ResultDesc: "Accepted" });

  if (!req.body || !req.body.Body || !req.body.Body.stkCallback) {
    console.error("Invalid callback payload received:", req.body);
    return; // Already sent 200, so we just stop processing
  }

  const callbackData = req.body.Body.stkCallback;
  const checkoutRequestID = callbackData.CheckoutRequestID;
  const resultCode = callbackData.ResultCode;


  try {
    if (resultCode === 0) {
      // PAYMENT SUCCESSFUL
      const meta = callbackData.CallbackMetadata.Item;
      const mpesaReceipt = meta.find(item => item.Name === 'MpesaReceiptNumber').Value;

      // Update to 'Paid'
      const updatedOrderRes = await pool.query(
        `UPDATE orders SET status = 'Paid', mpesa_receipt = $1 WHERE checkout_request_id = $2 RETURNING *`,
        [mpesaReceipt, checkoutRequestID]
      );
      
      console.log(`✅ Order paid! M-Pesa receipt: ${mpesaReceipt}`);

      // 🔵 AUTOMATION HANDSHAKE: Send Email/PDF ONLY NOW! 🔵
      if (updatedOrderRes.rows.length > 0) {
        const orderDoc = updatedOrderRes.rows[0];
        // 🟢 FIX: JOIN with products to get actual names for the invoice/email
        const itemsRes = await pool.query(`
          SELECT oi.*, p.name 
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [orderDoc.id]);
        
        const mappedItems = itemsRes.rows.map(row => ({
          name: row.name, 
          quantity: row.quantity,
          price_kes: row.price_at_time
        }));

        sendOrderConfirmationEmail(orderDoc.customer_email, orderDoc, mappedItems)
          .catch(err => console.error("Delayed Email Handshake Failed:", err));
      }


    } else {
      // PAYMENT FAILED OR CANCELLED
      const mappedError = MPESA_ERROR_MESSAGES[resultCode.toString()] || MPESA_ERROR_MESSAGES["generic"];
      
      const cancelledOrderRes = await pool.query(
        `UPDATE orders SET status = 'Cancelled', status_reason = $1 WHERE checkout_request_id = $2 RETURNING id`,
        [mappedError, checkoutRequestID]
      );
      
      // 🔵 INVENTORY FIX: Restock the items if M-Pesa fails! 🔵
      if (cancelledOrderRes.rows.length > 0) {
        const orderId = cancelledOrderRes.rows[0].id;
        const failedItemsRes = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
        
        for (const item of failedItemsRes.rows) {
          await pool.query(
            `UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }

      console.log(`❌ Order failed/cancelled. Reason: ${mappedError}. Stock Restored!`);
    }
  } catch (dbError) {
    console.error("Error updating DB during M-Pesa callback:", dbError);
  }
};

// 3. POLLING ENDPOINT: Allows frontend to check status
exports.getOrderStatus = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const result = await pool.query(
      'SELECT status, mpesa_receipt, status_reason FROM orders WHERE order_number = $1',
      [orderNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Polling failed" });
  }
};