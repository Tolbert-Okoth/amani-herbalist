async function analyze() {
  try {
    const form = new FormData();
    form.append('title', 'test ad');
    form.append('is_active', 'true');
    form.append('display_order', '0');
    form.append('flyer', new Blob(['fake image content'], { type: 'image/jpeg' }), 'test.jpg');
    const res = await fetch('https://amani-herbalist.onrender.com/api/regional-promos', {
      method: 'POST',
      headers: {
        'Origin': 'https://www.fohowedenlife.co.ke',
      },
      body: form
    });
    console.log('POST Status:', res.status);
    console.log('POST Headers:');
    res.headers.forEach((v, n) => console.log(n + ':', v));
    console.log('POST Body:', await res.text());
  } catch (e) {
    console.error('Fetch Error:', e.message);
  }
}
analyze();
