const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rawIngredients: {
    type: String,
    required: true
  },
  parsedIngredients: [String],
  riskyIngredients: [{
    name: String,
    reason: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  beneficialIngredients: [{
    name: String,
    benefit: String
  }],
  verdict: {
    type: String,
    enum: ['Suitable', 'Use with caution', 'Not suitable'],
    required: true
  },
  skinType: String,
  explanation: {
    type: String,
    default: ''
  },
  productName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
