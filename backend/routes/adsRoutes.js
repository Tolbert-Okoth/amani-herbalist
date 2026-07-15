const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/ads/track
router.post('/track', async (req, res) => {
  const { productId, event } = req.body;
  
  if (!productId || !['impression', 'click', 'conversion'].includes(event)) {
    return res.status(400).json({ error: "Invalid tracking data" });
  }

  try {
    await db.query(
      'INSERT INTO ad_analytics (product_id, event_type) VALUES ($1, $2)',
      [productId, event]
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Ad tracking error:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
});
// GET /api/ads/social-proof
router.get('/social-proof', async (req, res) => {
  try {
    // Fetch latest 5 successful orders
    const ordersRes = await db.query(`
      SELECT customer_name as name, delivery_address as location, 
      'just placed a wholesale order' as action, created_at, 'ShoppingBag' as icon, 'order' as type 
      FROM orders WHERE status != 'Cancelled' ORDER BY created_at DESC LIMIT 5
    `);
    
    // Fetch latest 5 approved franchises
    const franchisesRes = await db.query(`
      SELECT 'A New Partner' as name, 'Kenya' as location, 
      'activated a Wholesale Franchise ID' as action, created_at, 'ShieldCheck' as icon, 'franchise' as type 
      FROM franchises WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 5
    `);

    // Fetch latest 5 consultations
    const consultationsRes = await db.query(`
      SELECT fname as name, 'Kenya' as location, 
      'booked a clinical consultation' as action, created_at, 'Calendar' as icon, 'consultation' as type 
      FROM consultations ORDER BY created_at DESC LIMIT 5
    `);

    let combined = [...ordersRes.rows, ...franchisesRes.rows, ...consultationsRes.rows];

    // Obfuscate names and locations, format to match frontend spec
    combined = combined.map(item => {
      // Obfuscate name: "Tolbert Okoth" -> "Tolbert O."
      let safeName = item.name || 'A Customer';
      if (safeName.includes(' ')) {
        const parts = safeName.split(' ');
        safeName = parts[0] + ' ' + parts[parts.length-1].charAt(0).toUpperCase() + '.';
      }

      // Cleanup location (Handle both raw strings and parsed JSONB objects from DB)
      let safeLocation = 'Kenya';
      if (item.location) {
        if (typeof item.location === 'string') {
          safeLocation = item.location.includes(',') ? item.location.split(',')[0].trim() : item.location;
        } else if (typeof item.location === 'object') {
          safeLocation = item.location.county || item.location.town || 'Kenya';
        }
      }

      return {
        ...item,
        name: safeName,
        location: safeLocation
      };
    });

    // Sort globally by timestamp
    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.status(200).json({ success: true, data: combined });
  } catch (error) {
    console.error("Social proof fetch error:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

module.exports = router;