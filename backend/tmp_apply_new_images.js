const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const imageMap = {
  // New automated/manual matches
  "Fohow_Nourish_Shower_Gel.jpg": 25,
  "Fohow_Mineral_Collateral_Body_Energy_Cream.jpg": 37,
  "Fohow_Facial_Gel.jpg": 32,
  "Fohow_Herbal_Massage_Oil.jpg": 35,
  "Fohow_Iontophoresis_Massager.jpg": 27,
  "Fohow_Meridian_Massager.jpg": 30,
  "Fohow_Plant_Based_Massage_Cream.jpg": 33, // Best guess for Massage Gel
  "Fohow_Yang_Sheng_H2_Cup.jpg": 34
};

async function applyImages() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const imagesDir = path.join(__dirname, 'images');

    // Ensure uploads dir exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    let updatedCount = 0;

    for (const [filename, productId] of Object.entries(imageMap)) {
      const srcPath = path.join(imagesDir, filename);
      const destPath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(srcPath)) {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
        
        // Update database
        const imageUrl = `/uploads/${filename}`;
        await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [imageUrl, productId]);
        updatedCount++;
        console.log(`Updated product ID ${productId} with image ${filename}`);
      } else {
        console.warn(`File not found: ${srcPath}`);
      }
    }

    console.log(`\nSuccessfully applied ${updatedCount} NEW images to products!`);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

applyImages();
