const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, productType, skinTypeCompatibility, description, buyLink, imageUrl } = req.body;

    if (!name || !productType || !skinTypeCompatibility || !description) {
      return res.status(400).json({ message: 'Name, type, skin compatibility, and description are required.' });
    }

    const product = await Product.create({
      name,
      productType,
      skinTypeCompatibility: Array.isArray(skinTypeCompatibility) ? skinTypeCompatibility : [skinTypeCompatibility],
      description,
      buyLink: buyLink || '',
      imageUrl: imageUrl || '',
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Product created successfully!', product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Error creating product.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, productType, skinTypeCompatibility, description, buyLink, imageUrl } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        productType,
        skinTypeCompatibility: Array.isArray(skinTypeCompatibility) ? skinTypeCompatibility : [skinTypeCompatibility],
        description,
        buyLink: buyLink || '',
        imageUrl: imageUrl || '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found.' });

    res.json({ message: 'Product updated!', product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product.' });
  }
};
