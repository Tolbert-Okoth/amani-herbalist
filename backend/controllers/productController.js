const pool = require('../config/db');
const { generateUniqueSlug } = require('../utils/slugify');
const { deleteUploadedFile } = require('../utils/fileCleanup');
// Fetch all products with their category names
exports.getAllProducts = async (req, res) => {
  try {
    // We use a JOIN here so the frontend gets the actual category text (e.g., "Bone Health") 
    // instead of just the category_id (e.g., "1")
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.slug, 
        p.price_kes, 
        p.category_id,
        p.description, 
        p.tcm_function_tag,
        p.image_url,
        p.full_description,
        p.ingredients_list,
        p.stock_quantity,
        p.custom_discount,
        p.is_featured,
        c.name AS category_name

      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC;
    `);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching products' });
  }
};

// --- GET SINGLE PRODUCT WITH CATEGORY JOIN ---
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ error: 'Server error fetching single product' });
  }
};

// --- GET FEATURED PRODUCT (For the Pop-up) ---
exports.getFeaturedProduct = async (req, res) => {
  try {
    const { category } = req.query;
    let query;
    let params = [];
    if (category && category !== 'All') {
      // First try to find featured in this category
      query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_featured = true AND c.name ILIKE $1
        ORDER BY p.id DESC LIMIT 1
      `;
      params = [category];
      const result = await pool.query(query, params);
      if (result.rows.length > 0) {
        return res.status(200).json({ success: true, data: result.rows[0] });
      }
    }
    // If no category match or 'All', get any featured
    query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true
      ORDER BY p.id DESC LIMIT 1
    `;
    const result = await pool.query(query);
    res.status(200).json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching featured product' });
  }
};

// --- ADD NEW PRODUCT (with Image Upload) ---
exports.createProduct = async (req, res) => {
  try {
    const { name, price_kes, category_id, description, full_description, ingredients_list, stock_quantity, is_featured, custom_discount } = req.body;
    
    // 🟢 Production: Unique Slug Generation
    const slug = await generateUniqueSlug(pool, 'products', name);
    
    const image_url = req.file ? req.file.path : null;
    const featured = is_featured === 'true' || is_featured === true;

    // If this new product is featured, un-feature all others in the SAME category
    if (featured && (category_id || 99)) {
      await pool.query('UPDATE products SET is_featured = false WHERE category_id = $1 AND is_featured = true', [category_id || 99]);
    }

    const result = await pool.query(
      `INSERT INTO products (name, slug, price_kes, category_id, description, full_description, ingredients_list, stock_quantity, image_url, is_featured, custom_discount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, slug, price_kes, category_id || 99, description || '', full_description || '', ingredients_list || '', stock_quantity || 0, image_url, featured, custom_discount || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Server Error adding product' });
  }
};

// --- UPDATE/EDIT PRODUCT (with optional Image Upload) ---
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price_kes, category_id, description, full_description, ingredients_list, stock_quantity, is_featured, custom_discount } = req.body;
    
    // Fetch existing product to compare name for slug update
    const currentProductResult = await pool.query('SELECT name, slug FROM products WHERE id = $1', [id]);
    const currentProduct = currentProductResult.rows[0];

    let slug = currentProduct.slug;
    if (name && name !== currentProduct.name) {
      slug = await generateUniqueSlug(pool, 'products', name);
    }

    const featured = is_featured === 'true' || is_featured === true;

    // EXCLUSIVE FEATURING: If this product is being featured, un-feature others in the SAME category
    if (featured && category_id) {
      await pool.query('UPDATE products SET is_featured = false WHERE category_id = $1 AND id != $2', [category_id, id]);
    }

    if (req.file) {
      // New image uploaded — get old image first so we can delete it
      const oldImageResult = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
      const oldImageUrl = oldImageResult.rows[0]?.image_url;

      const image_url = req.file.path;
      await pool.query(
        `UPDATE products SET name=$1, slug=$2, price_kes=$3, category_id=$4, description=$5, full_description=$6, ingredients_list=$7, stock_quantity=$8, image_url=$9, is_featured=$10, custom_discount=$11 WHERE id=$12`,
        [name, slug, price_kes, category_id, description || '', full_description || '', ingredients_list || '', stock_quantity || 0, image_url, featured, custom_discount === '' ? null : custom_discount, id]
      );
      
      // Clean up orphaned file
      if (oldImageUrl) deleteUploadedFile(oldImageUrl);

    } else {
      // No new image — keep existing image_url, update everything else
      await pool.query(
        `UPDATE products SET name=$1, slug=$2, price_kes=$3, category_id=$4, description=$5, full_description=$6, ingredients_list=$7, stock_quantity=$8, is_featured=$9, custom_discount=$10 WHERE id=$11`,
        [name, slug, price_kes, category_id, description || '', full_description || '', ingredients_list || '', stock_quantity || 0, featured, custom_discount === '' ? null : custom_discount, id]
      );
    }

    res.status(200).json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server Error updating product' });
  }
};

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the image url first before deleting from DB
    const productRes = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
    const imageUrl = productRes.rows[0]?.image_url;
    
    // Delete referencing order items first to avoid foreign key constraint violations
    await pool.query('DELETE FROM order_items WHERE product_id = $1', [id]);
    
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    // Clean up orphaned file
    if (imageUrl) deleteUploadedFile(imageUrl);
    
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server Error deleting product' });
  }
};