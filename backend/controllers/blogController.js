const { Pool } = require('pg');
const { generateUniqueSlug } = require('../utils/slugify');
const { deleteUploadedFile } = require('../utils/fileCleanup');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get All Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching blogs' });
  }
};

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, is_published } = req.body;
    
    // 🟢 Production: Unique Slug
    const slug = await generateUniqueSlug(pool, 'blogs', title);
    
    const image_url = req.file ? req.file.path : null;
    const published = is_published === 'true' || is_published === true;

    const result = await pool.query(
      `INSERT INTO blogs (title, slug, excerpt, content, author, is_published, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, slug, excerpt, content, author || 'Fohow Eden Life', published, image_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Error creating blog' });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, author, is_published } = req.body;
    
    // Fetch existing
    const currentBlogResult = await pool.query('SELECT title, slug FROM blogs WHERE id = $1', [id]);
    if (currentBlogResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    const currentBlog = currentBlogResult.rows[0];

    let slug = currentBlog.slug;
    if (title && title !== currentBlog.title) {
      slug = await generateUniqueSlug(pool, 'blogs', title);
    }

    const published = is_published === 'true' || is_published === true;
    
    if (req.file) {
      // New image uploaded — get old image first so we can delete it
      const oldImageResult = await pool.query('SELECT image_url FROM blogs WHERE id = $1', [id]);
      const oldImageUrl = oldImageResult.rows[0]?.image_url;

      const image_url = req.file.path;
      await pool.query(
        `UPDATE blogs SET title=$1, slug=$2, excerpt=$3, content=$4, author=$5, is_published=$6, image_url=$7 WHERE id=$8`,
        [title, slug, excerpt, content, author, published, image_url, id]
      );
      
      // Clean up orphaned file
      if (oldImageUrl) deleteUploadedFile(oldImageUrl);
    } else {
      await pool.query(
        `UPDATE blogs SET title=$1, slug=$2, excerpt=$3, content=$4, author=$5, is_published=$6 WHERE id=$7`,
        [title, slug, excerpt, content, author, published, id]
      );
    }
    res.status(200).json({ success: true, message: 'Blog updated' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Error updating blog' });
  }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the image url first before deleting from DB
    const blogRes = await pool.query('SELECT image_url FROM blogs WHERE id = $1', [id]);
    const imageUrl = blogRes.rows[0]?.image_url;

    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
    
    // Clean up orphaned file
    if (imageUrl) deleteUploadedFile(imageUrl);
    
    res.status(200).json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting blog' });
  }
};