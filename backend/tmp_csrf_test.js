async function testCSRF() {
  // Test POST without Authorization header
  const req = await fetch('http://localhost:5001/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ home_delivery_fee: 1000 })
  });
  console.log('CSRF Check Status (Missing Token):', req.status); // Expecting 401 or 403
}
testCSRF();
