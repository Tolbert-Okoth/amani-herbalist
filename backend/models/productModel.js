const db = require('../config/db');

const Product = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  },
  getById: async (id) => {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  },
  create: async (productData) => {
    const { name, slug, description, price_kes, tcm_function_tag, category_id, image_url } = productData;
    const result = await db.query(
      `INSERT INTO products (name, slug, description, price_kes, tcm_function_tag, category_id, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, slug, description, price_kes, tcm_function_tag, category_id, image_url]
    );
    return result.rows[0];
  },
  delete: async (id) => {
    await db.query('DELETE FROM products WHERE id = $1', [id]);
  }
};

module.exports = Product;