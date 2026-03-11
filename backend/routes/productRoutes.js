// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

// Connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });


// 1. Get all products (GET /api/products)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching products" });
  }
});

// 2. Get a single product (GET /api/products/:id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching single product" });
  }
});

// 3. Add a new product with an image (POST /api/products)
// Notice how we use upload.single('image') as middleware here!
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, slug, description, price_kes, tcm_function_tag, category_id } = req.body;
    
    let finalImageUrl = req.body.image_url || ''; 
    if (req.file) {
      // Assuming your backend runs on port 5000, we point to the uploads folder
      finalImageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    }

    const newProduct = await pool.query(
      `INSERT INTO products (name, slug, description, price_kes, tcm_function_tag, category_id, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, slug, description, price_kes, tcm_function_tag, category_id, finalImageUrl]
    );
    
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error("Error inserting product:", err.message);
    res.status(500).json({ error: "Server error while adding product" });
  }
});

// 4. Delete a product (DELETE /api/products/:id)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while deleting product" });
  }
});

// 5. Update a product (PUT /api/products/:id)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price_kes, tcm_function_tag, category_id } = req.body;
    
    // Default to the existing image URL unless a new file was uploaded
    let finalImageUrl = req.body.image_url || ''; 
    if (req.file) {
      finalImageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    }

    const updateQuery = `
      UPDATE products 
      SET name = $1, slug = $2, description = $3, price_kes = $4, tcm_function_tag = $5, category_id = $6, image_url = $7
      WHERE id = $8 RETURNING *
    `;
    
    const updatedProduct = await pool.query(updateQuery, [name, slug, description, price_kes, tcm_function_tag, category_id, finalImageUrl, id]);
    
    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ error: "Server error while updating product" });
  }
});

module.exports = router;