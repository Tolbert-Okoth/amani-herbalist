async function test() {
  const req = await fetch('http://localhost:5001/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'stalin', password: '***REDACTED***' })
  });
  console.log(req.status, await req.json());
}
test();
