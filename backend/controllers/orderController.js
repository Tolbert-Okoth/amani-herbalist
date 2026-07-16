const pool = require('../config/db');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

// --- GET ALL ORDERS (Upgraded for visual dashboard) ---
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id, o.order_number, o.customer_phone, o.customer_name, o.customer_id_number, o.total_amount, o.status, 
        o.payment_method, o.mpesa_receipt, o.created_at, o.franchise_id, o.delivery_method, o.delivery_address,
        COUNT(oi.id) as items_count,
        (SELECT string_agg(p.name, ', ') 
         FROM order_items oi_inner 
         JOIN products p ON oi_inner.product_id = p.id 
         WHERE oi_inner.order_id = o.id) AS product_names
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

// --- UPDATE ORDER STATUS ---
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionCode } = req.body;
    
    let updateQuery = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
    let queryParams = [status, id];

    if (transactionCode) {
      updateQuery = 'UPDATE orders SET status = $1, mpesa_receipt = $2 WHERE id = $3 RETURNING *';
      queryParams = [status, transactionCode, id];
    }

    const result = await pool.query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedOrder = result.rows[0];

    // Trigger confirmation email if marked as Paid
    if (status === 'Paid' && updatedOrder.customer_email) {
      const itemsRes = await pool.query(`
        SELECT oi.quantity, oi.price_at_time as price_kes, p.name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [id]);
      
      await sendOrderConfirmationEmail(updatedOrder.customer_email, updatedOrder, itemsRes.rows);
    } else if (['Processing', 'Shipped', 'Delivered'].includes(status) && updatedOrder.customer_email) {
      // Send standard status update email for post-payment statuses
      await sendOrderStatusUpdateEmail(updatedOrder.customer_email, updatedOrder, status);
    }

    res.status(200).json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// --- GET DASHBOARD STATS (For the Admin Overview) ---
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue (Only counting successful/completed orders)
    const revenueRes = await pool.query(`SELECT SUM(total_amount) AS total FROM orders WHERE status != 'Cancelled'`);
    const totalRevenue = parseFloat(revenueRes.rows[0].total || 0);

    // 2. Active Orders (Processing or Shipped)
    const activeRes = await pool.query(`SELECT COUNT(*) AS count FROM orders WHERE status IN ('Processing', 'Shipped')`);
    const activeOrders = parseInt(activeRes.rows[0].count || 0);

    // 3. Total Products in Catalog
    const productsRes = await pool.query(`SELECT COUNT(*) AS count FROM products`);
    const totalProducts = parseInt(productsRes.rows[0].count || 0);

    // 4. Recent Orders (Top 5 for the dashboard table)
    const recentRes = await pool.query(`
      SELECT order_number, customer_phone, total_amount, status, created_at 
      FROM orders 
      ORDER BY created_at DESC LIMIT 5
    `);

    // 5. Revenue Trend (Last 7 Days)
    const revenueTrendRes = await pool.query(`
      SELECT 
        TO_CHAR(date_series, 'Dy') AS name,
        COALESCE(SUM(o.total_amount), 0)::float AS revenue
      FROM (
        SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS date_series
      ) d
      LEFT JOIN orders o ON DATE(o.created_at) = d.date_series AND o.status != 'Cancelled'
      GROUP BY d.date_series
      ORDER BY d.date_series ASC;
    `);

    // 6. Top Products (By Units Sold)
    const topProductsRes = await pool.query(`
      SELECT p.name, SUM(oi.quantity)::int AS sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
      GROUP BY p.name
      ORDER BY sales DESC
      LIMIT 5
    `);

    // 7. Low Stock Alerts
    const lowStockRes = await pool.query(`
      SELECT name, stock_quantity AS stock
      FROM products
      WHERE stock_quantity < 10
      ORDER BY stock_quantity ASC
      LIMIT 5
    `);

    // 8. M-Pesa Success Rate
    const mpesaStatsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Paid') AS successful,
        COUNT(*) AS total
      FROM orders
      WHERE payment_method = 'mpesa'
    `);
    
    const mpesaStats = mpesaStatsRes.rows[0];
    const mpesaSuccess = mpesaStats.total > 0 
      ? Math.round((parseInt(mpesaStats.successful) / parseInt(mpesaStats.total)) * 100) 
      : 100;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        activeOrders,
        totalProducts,
        recentOrders: recentRes.rows,
        revenueTrend: revenueTrendRes.rows,
        topProducts: topProductsRes.rows,
        lowStock: lowStockRes.rows,
        mpesaSuccess
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// --- GET SINGLE ORDER WITH ITEMS (For the View Details Modal) ---
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get the main order info
    const orderRes = await pool.query(\`SELECT id, order_number, customer_phone, customer_name, customer_email, total_amount, status, payment_method, mpesa_receipt, created_at, franchise_id, customer_id_number, delivery_method, delivery_address, subtotal, discount_amount, tax_amount FROM orders WHERE id = $1\`, [id]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 2. Get the items inside the order, joined with actual product names
    const itemsRes = await pool.query(\`
      SELECT 
        oi.quantity, 
        oi.price_at_time, 
        p.name, 
        p.category_id
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    \`, [id]);

    // 3. Combine and send to React
    res.status(200).json({
      success: true,
      data: { ...orderRes.rows[0], items: itemsRes.rows }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order details' });
  }
};

// --- DELETE ORDER (Boss Only) ---
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete order items first (foreign key constraint)
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
};