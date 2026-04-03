const Analysis = require('../models/Analysis');
const { analyzeIngredients } = require('../ai/ingredientAnalyzer');
const { generateExplanation } = require('../ai/geminiService');

exports.analyzeIngredients = async (req, res) => {
  try {
    const { ingredients, productName } = req.body;
    const user = req.user;

    if (!user.quizCompleted || !user.skinType) {
      return res.status(400).json({
        message: 'Please complete the skin type quiz before analyzing ingredients.'
      });
    }

    if (!ingredients || ingredients.trim().length < 3) {
      return res.status(400).json({ message: 'Please provide a valid ingredient list.' });
    }

    // Run rule-based analysis
    const analysisResult = analyzeIngredients(ingredients, user.skinType);

    // Generate AI explanation
    const explanation = await generateExplanation(analysisResult, productName || '');

    // Save to database
    const analysis = await Analysis.create({
      userId: user._id,
      rawIngredients: ingredients,
      parsedIngredients: analysisResult.parsedIngredients,
      riskyIngredients: analysisResult.riskyIngredients,
      beneficialIngredients: analysisResult.beneficialIngredients,
      verdict: analysisResult.verdict,
      skinType: user.skinType,
      explanation,
      productName: productName || ''
    });

    res.json({
      analysisId: analysis._id,
      verdict: analysisResult.verdict,
      skinType: user.skinType,
      riskyIngredients: analysisResult.riskyIngredients,
      beneficialIngredients: analysisResult.beneficialIngredients,
      unknownIngredients: analysisResult.unknownIngredients,
      summary: analysisResult.summary,
      explanation
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ message: 'Server error during analysis.' });
  }
};
