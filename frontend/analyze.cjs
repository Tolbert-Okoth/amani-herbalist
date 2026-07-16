const FormData = require('form-data');
async function analyze() {
  try {
    const form = new FormData();
    form.append('title', 'test ad');
    form.append('is_active', 'true');
    form.append('display_order', '0');
    form.append('flyer', Buffer.from('fake image content'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    const res = await fetch('https://amani-herbalist.onrender.com/api/regional-ads', {
      method: 'POST',
      headers: {
        'Origin': 'https://www.fohowedenlife.co.ke',
      },
      body: form
    });
    console.log('POST Status:', res.status);
    console.log('POST Body:', await res.text());
  } catch (e) {
    console.error('Fetch Error:', e.message);
  }
}
analyze();
