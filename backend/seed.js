// backend/seed.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding Amani Herbalists Database...");

    // 1. Force drop old tables to ensure we get the updated schema
    await pool.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
    `);
    
    console.log("🧹 Cleared old database schema...");

    // 2. Create Tables with the correct columns
    await pool.query(`
      CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          tcm_function VARCHAR(100),
          description TEXT,
          image_url TEXT
      );

      CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          category_id INT REFERENCES categories(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT NOT NULL,
          benefits TEXT,
          usage_instructions TEXT,
          ingredients TEXT,
          price_kes DECIMAL(10, 2) NOT NULL,
          stock_quantity INT DEFAULT 0,
          is_featured BOOLEAN DEFAULT false,
          image_url TEXT,
          tcm_function_tag VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Insert Categories
    const catRes = await pool.query(`
      INSERT INTO categories (name, tcm_function) 
      VALUES 
      ('Herbal Supplements', 'Nourish'),
      ('Wellness Devices', 'Regulate'),
      ('Skincare', 'Detox')
      RETURNING id, name;
    `);

    const categories = catRes.rows;
    console.log("✅ Categories built!");

    // 4. Insert Products
    await pool.query(`
      INSERT INTO products (category_id, name, slug, description, price_kes, stock_quantity, tcm_function_tag, image_url) 
      VALUES 
      ($1, 'Cordyceps Oral Liquid', 'cordyceps-liquid', 'A premium liquid extract designed to boost lung capacity, enhance stamina, and nourish the kidneys. Perfect for combating fatigue.', 6500.00, 50, 'Nourish', 'https://images.unsplash.com/photo-1608681284705-72863e414c2c?w=500&q=80'),
      
      ($2, 'Thermal Meridian Massage Belt', 'thermal-belt', 'Utilizes far-infrared technology to warm the meridians, ease lower back tension, and regulate Qi flow through the abdominal region.', 12500.00, 15, 'Regulate', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80'),
      
      ($1, 'Reishi Mushroom Capsules', 'reishi-capsules', 'Known as the mushroom of immortality. Calms the spirit, improves sleep quality, and provides powerful immune system support.', 4200.00, 100, 'Balance', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'),
      
      ($3, 'Aloe & Ginseng Detox Soap', 'ginseng-soap', 'A purifying bar that clears heat and toxins from the skin while leaving it deeply moisturized. Great for sensitive skin profiles.', 1200.00, 200, 'Detox', 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500&q=80')
    `, [categories[0].id, categories[1].id, categories[2].id]);

    console.log("✅ Products stocked!");
    console.log("🎉 Database seeding complete!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    pool.end();
  }
};

seedDatabase();