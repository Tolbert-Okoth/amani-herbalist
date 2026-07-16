const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { processCheckout } = require('../controllers/mpesaController');
const mpesaAuth = require('../middleware/mpesaAuth');
const { adminAuth } = require('../middleware/adminAuth');

// 1. Admin Management Routes (Require JWT verification)
router.get('/', adminAuth, orderController.getAllOrders);
router.get('/stats', adminAuth, orderController.getDashboardStats);
router.get('/:id', adminAuth, orderController.getOrderById);
router.put('/:id/status', adminAuth, orderController.updateOrderStatus);
router.delete('/:id', adminAuth, orderController.deleteOrder);

// 2. Checkout Route (Handles order creation for Manual Paybill Flow)
router.post('/checkout', processCheckout);

module.exports = router;