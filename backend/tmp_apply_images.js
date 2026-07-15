const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const imageMap = {
  // Matched from script
  "Fohow_Xueqingfu.jpg": 2,
  "Fohow_Rooibos_Boss_Tea.jpg": 13,
  "Fohow_Aloe_Gel.jpg": 20,
  "Fohow_Toothpaste.jpg": 21,
  "Fohow_Salvia_Extract_Tablet.jpg": 4,
  "Fohow_Oral_Liquid.jpg": 6,
  "Fohow_Linchzhi.jpg": 8,
  "Fohow_Liuwei_Cha.jpg": 9,
  "Fohow_Gentle_Shampoo.jpg": 24,
  "Fohow_Sanbao_Oral_Liquid.jpg": 7,
  "Fohow_Haizao_Gai.jpg": 1,
  "Fohow_Guifei_Bao_Princess_Pearl.jpg": 45,
  
  // Manual match
  "Fohow_Gaoqian_High_Fiber_Nutrition_Tablets.jpg": 10,
  "Fohow_Garlic_Essence_Oil_Soft_Capsule.jpg": 3,
  "Fohow_Longlu_Capsule.jpg": 5,
  "Fohow_Meigui_Cream.jpg": 11,
  "Fohow_Moisturizing_Face_Mask.jpg": 31,
  "Fohow_Sanitary_Pad_Panty_Liner.jpg": 22,
  "Fohow_Sanqing_Oral_Liquid.jpg": 12
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
      // Use original filename or timestamp? The existing code uses timestamp but original filename is fine
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

    console.log(`\nSuccessfully applied ${updatedCount} images to products!`);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

applyImages();
