const express = require('express');
const router = express.Router();

// For now, if you haven't built the mpesa logic fully, 
// let's just put a dummy route so the server doesn't crash.
router.get('/test', (req, res) => {
    res.json({ message: "Order routes are working!" });
});

// THIS IS THE CRITICAL LINE:
module.exports = router;