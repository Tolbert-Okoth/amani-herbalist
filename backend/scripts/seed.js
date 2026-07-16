const { Pool } = require('pg');
const xlsx = require('xlsx');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  console.log('Reading Excel file...');

  try {
    const workbook = xlsx.readFile('products.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { range: 1 });

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN'); 
      console.log('Syncing categories with PostgreSQL...');

      // 1. CREATE DYNAMIC CATEGORY MAP
      const actualCategoryMap = {};
      const uniqueCategories = [...new Set(rawData.map(row => row['TCM Category']).filter(Boolean))];

      for (const catName of uniqueCategories) {
        let catRes = await client.query('SELECT id FROM categories WHERE name = $1', [catName]);
        
        if (catRes.rows.length === 0) {
          console.log(`Creating new category: ${catName}`);
          catRes = await client.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING id', 
            [catName]
          );
        }
        actualCategoryMap[catName] = catRes.rows[0].id;
      }

      // 2. WIPE OLD DATA TO PREVENT DUPLICATES
      console.log('Categories synced! Wiping old products to load fresh data...');
      await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');

      let insertedCount = 0;

      // 3. INSERT PRODUCTS WITH ALL NEW COLUMNS
      for (const row of rawData) {
        if (!row['Product Name']) continue;

        const rawPrice = String(row['Price (KES)']);
        const cleanPrice = parseInt(rawPrice.replace(/,/g, ''), 10);
        
        const descriptionText = row['Brief Product Info'] || 'No description provided.';
        const slug = row['Product Name'].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Grab the new columns from the Excel file
        const fullDescription = row['Full Description'] || descriptionText;
        const ingredientsList = row['Ingredients List'] || '';
        const stockQuantity = parseInt(row['Initial Stock Quantity'], 10) || 0;

        const rawCategory = row['TCM Category'];
        const realCategoryId = actualCategoryMap[rawCategory]; 

        const queryText = `
          INSERT INTO products (
            name, slug, price_kes, category_id, description, tcm_function_tag, 
            full_description, ingredients_list, stock_quantity
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const queryValues = [
          row['Product Name'], 
          slug, 
          cleanPrice, 
          realCategoryId, 
          descriptionText, 
          rawCategory,
          fullDescription,
          ingredientsList,
          stockQuantity
        ];
        
        await client.query(queryText, queryValues);
        insertedCount++;
      }

      await client.query('COMMIT'); 
      console.log(`✅ SUCCESS! ${insertedCount} products completely re-seeded with Full Descriptions and Inventory!`);
    } catch (dbError) {
      await client.query('ROLLBACK'); 
      console.error('❌ Error inserting into database:', dbError);
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error reading the Excel file:', error.message);
  } finally {
    pool.end();
  }
}

seedDatabase();