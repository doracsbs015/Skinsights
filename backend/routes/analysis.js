// routes/analysis.js
const express = require('express');
const router = express.Router();
const { analyzeIngredients } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');
router.post('/', protect, analyzeIngredients);
module.exports = router;
