const Product = require('../models/productModel');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, price_kes, tcm_function_tag, category_id } = req.body;
    
    // If a file was uploaded, create the URL pointing to your backend's upload folder
    let finalImageUrl = req.body.image_url || ''; 
    if (req.file) {
      // Assuming your backend runs on port 5000
      finalImageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const newProduct = await Product.create({
      name, slug, description, price_kes, tcm_function_tag, category_id, image_url: finalImageUrl
    });
    
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while adding product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.delete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while deleting product" });
  }
};