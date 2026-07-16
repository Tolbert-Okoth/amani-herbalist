const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Ensure Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ Cloudinary credentials are missing from .env");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Hardcoded LIVE Render database URL so we don't accidentally touch the local one
const LIVE_DB_URL = 'postgresql://amani_herbal_live_db_user:ZnX6YGl5ZTY5vwN1BBkS2MBX2yyOrqNl@dpg-d9bve80k1i2s739q4v2g-a.oregon-postgres.render.com/amani_herbal_live_db';

const pool = new Pool({
  connectionString: LIVE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

const delay = ms => new Promise(res => setTimeout(res, ms));

async function uploadAndMigrate(table, idColumn, urlColumn, folderName, resourceType = 'image') {
  try {
    // Select all rows where the URL is a local path (starts with /uploads)
    const query = `SELECT ${idColumn}, ${urlColumn} FROM ${table} WHERE ${urlColumn} LIKE '/uploads/%'`;
    const { rows } = await pool.query(query);
    
    if (rows.length === 0) {
      console.log(`✅ No local files found for ${table} to migrate.`);
      return;
    }

    console.log(`\n⏳ Found ${rows.length} local files in '${table}'. Starting migration...`);

    for (let row of rows) {
      const localUrl = row[urlColumn]; // e.g. /uploads/1774722703466.jpg
      const id = row[idColumn];

      // Resolve the actual local file path
      const localFilePath = path.join(__dirname, '..', localUrl);

      if (fs.existsSync(localFilePath)) {
        console.log(`   Uploading: ${localUrl}...`);
        try {
          const result = await cloudinary.uploader.upload(localFilePath, { 
            folder: folderName,
            resource_type: resourceType
          });
          
          // Update the database with the secure_url
          await pool.query(`UPDATE ${table} SET ${urlColumn} = $1 WHERE ${idColumn} = $2`, [result.secure_url, id]);
          console.log(`   ✅ Success! DB Updated for ID: ${id}`);
          
          // 500ms delay to respect Cloudinary rate limits
          await delay(500); 
        } catch (uploadError) {
          console.error(`   ❌ Failed to upload ${localUrl}:`, uploadError.message);
        }
      } else {
        console.warn(`   ⚠️ Local file not found: ${localFilePath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error migrating ${table}:`, error.message);
  }
}

async function run() {
  console.log("========================================");
  console.log("🚀 STARTING BULK CLOUDINARY MIGRATION");
  console.log("========================================");
  
  // 1. Products
  await uploadAndMigrate('products', 'id', 'image_url', 'products');
  
  // 2. Categories
  await uploadAndMigrate('categories', 'id', 'image_url', 'categories');
  
  // 3. Regional Ads
  await uploadAndMigrate('regional_ads', 'id', 'flyer_url', 'ads');
  
  // 4. Regional Events
  await uploadAndMigrate('regional_events', 'id', 'flyer_url', 'events');
  
  // 5. Documents (PDFs, raw files)
  await uploadAndMigrate('documents', 'id', 'file_url', 'documents', 'auto');

  console.log("\n========================================");
  console.log("🎉 MIGRATION COMPLETE!");
  console.log("========================================");
  process.exit(0);
}

run();
