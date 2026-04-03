// routes/recommendations.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const skinType = req.user.skinType;
    const filter = skinType
      ? { skinTypeCompatibility: { $in: [skinType, 'All'] } }
      : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommendations.' });
  }
});

module.exports = router;
