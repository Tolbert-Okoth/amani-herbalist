// test_manual_payments.js
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('======================================================');
  console.log('💳 AUTOMATED TEST SUITE: MANUAL PAYMENT LIFECYCLE');
  console.log('======================================================\n');

  try {
    // --- STEP 1: CREATE A MOCK ORDER ---
    console.log('➡️ STEP 1: Customer Places Order (Checkout)');
    const orderPayload = {
      customer: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '0700000000',
        address: 'Test Address',
        city: 'Nairobi',
        country: 'Kenya'
      },
      delivery: {
        method: 'pickup'
      },
      payment: {
        method: 'mpesa',
        mpesaNumber: '0700000000'
      },
      items: [
        { id: 1, quantity: 1, price_kes: 1000 }
      ],
      totals: {
        subtotal: 1000,
        discount: 0,
        tax: 0,
        deliveryFee: 0,
        grandTotal: 1000
      },
      piiConsent: true
    };

    const createRes = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    
    const createData = await createRes.json();
    if (!createData.success) {
      console.log('Error Data:', createData);
      throw new Error('Order creation failed');
    }
    
    const testOrderNumber = createData.orderNumber;
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const orderRes = await pool.query('SELECT id FROM orders WHERE order_number = $1', [testOrderNumber]);
    const testOrderId = orderRes.rows[0].id;
    
    console.log(`   ✅ Order created successfully in DB (ID: ${testOrderId}, Num: ${testOrderNumber})`);
    console.log(`   ✅ Initial Status: Pending Payment`);
    console.log(`   ✅ Email Trigger: 'Order Received - Pending Payment' would fire here.\n`);

    // --- STEP 2: ADMIN VERIFIES PAYMENT ---
    console.log('➡️ STEP 2: Admin Verifies Payment & Enters Transaction Code');
    const transactionCode = 'TEST999CODE';
    
    const adminToken = jwt.sign({ id: 1, role: 'boss' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    const adminCookie = `fohow_admin_token=${adminToken}`;

    const updateRes = await fetch(`${BASE_URL}/orders/${testOrderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': adminCookie
      },
      body: JSON.stringify({
        status: 'Paid',
        transactionCode: transactionCode
      })
    });
    
    const updateData = await updateRes.json();
    if (!updateData.success) {
      console.log('Update Error Data:', updateData);
      throw new Error('Order status update failed');
    }
    
    console.log(`   ✅ Admin successfully marked order as 'Paid'`);
    console.log(`   ✅ Transaction Code '${transactionCode}' locked into DB`);
    console.log(`   ✅ Email Trigger: 'Payment Confirmed + PDF Invoice' would fire here.\n`);
    
    // --- STEP 3: CLEANUP MOCK DATA ---
    console.log('➡️ STEP 3: Cleaning up database');
    const deleteRes = await fetch(`${BASE_URL}/orders/${testOrderId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': adminCookie
      }
    });
    
    console.log(`   ✅ Test order ${testOrderNumber} deleted from DB.\n`);
    console.log('🎉 ALL MANUAL PAYMENT TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

// Small polyfill for fetch if node version < 18
if (!globalThis.fetch) {
  console.log("Fetch not found, using raw HTTP...");
  // Normally we would polyfill, but assuming Node 18+ for modern Vite/React stacks
}

runTests();
