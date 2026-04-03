const User = require('../models/User');

// Skin type determination from quiz answers
// Each question has weighted answers contributing to scores for each skin type
const determineSkinType = (answers) => {
  const scores = { Oily: 0, Dry: 0, Combination: 0, Sensitive: 0 };

  const scoringMap = {
    // Q1: How does your skin feel a few hours after washing?
    q1: { a: 'Oily', b: 'Dry', c: 'Combination', d: 'Sensitive' },
    // Q2: How often does your skin look shiny?
    q2: { a: 'Oily', b: 'Combination', c: 'Dry', d: 'Dry' },
    // Q3: How does your skin react to new products?
    q3: { a: 'Sensitive', b: 'Sensitive', c: 'Dry', d: 'Oily' },
    // Q4: How large are your pores?
    q4: { a: 'Oily', b: 'Combination', c: 'Dry', d: 'Sensitive' },
    // Q5: Do you experience breakouts?
    q5: { a: 'Oily', b: 'Combination', c: 'Sensitive', d: 'Dry' },
    // Q6: How does your skin feel after cleansing?
    q6: { a: 'Dry', b: 'Sensitive', c: 'Oily', d: 'Combination' },
    // Q7: Do you experience flakiness or dry patches?
    q7: { a: 'Dry', b: 'Sensitive', c: 'Combination', d: 'Oily' },
    // Q8: How does your skin react to sun exposure?
    q8: { a: 'Sensitive', b: 'Dry', c: 'Oily', d: 'Combination' },
    // Q9: What is your skin texture like?
    q9: { a: 'Oily', b: 'Dry', c: 'Combination', d: 'Sensitive' },
    // Q10: How often do you need to blot excess oil?
    q10: { a: 'Oily', b: 'Combination', c: 'Dry', d: 'Dry' },
    // Q11: How does your skin react to alcohol-based products?
    q11: { a: 'Sensitive', b: 'Dry', c: 'Oily', d: 'Combination' },
    // Q12: Describe your T-zone (forehead, nose, chin)?
    q12: { a: 'Oily', b: 'Combination', c: 'Dry', d: 'Sensitive' },
    // Q13: How does your skin feel in cold/dry weather?
    q13: { a: 'Dry', b: 'Sensitive', c: 'Combination', d: 'Oily' },
    // Q14: How quickly does your makeup wear off?
    q14: { a: 'Oily', b: 'Combination', c: 'Dry', d: 'Sensitive' },
    // Q15: What best describes your skin's overall sensitivity?
    q15: { a: 'Sensitive', b: 'Dry', c: 'Combination', d: 'Oily' },
  };

  for (const [question, answer] of Object.entries(answers)) {
    if (scoringMap[question] && scoringMap[question][answer]) {
      scores[scoringMap[question][answer]] += 1;
    }
  }

  // Return the skin type with the highest score
  return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

exports.submitQuiz = async (req, res) => {
  try {
    const user = req.user;

    if (user.quizCompleted) {
      return res.status(400).json({ message: 'You have already completed the skin type quiz.', skinType: user.skinType });
    }

    const { answers } = req.body;
    if (!answers || Object.keys(answers).length < 15) {
      return res.status(400).json({ message: 'Please answer all 15 questions.' });
    }

    const skinType = determineSkinType(answers);

    user.skinType = skinType;
    user.quizCompleted = true;
    await user.save();

    res.json({
      message: 'Quiz completed!',
      skinType,
      description: getSkinTypeDescription(skinType)
    });
  } catch (err) {
    console.error('Quiz error:', err);
    res.status(500).json({ message: 'Server error submitting quiz.' });
  }
};

exports.getQuizStatus = async (req, res) => {
  res.json({
    quizCompleted: req.user.quizCompleted,
    skinType: req.user.skinType
  });
};

function getSkinTypeDescription(skinType) {
  const descriptions = {
    Oily: 'Your skin produces excess sebum, leading to a shiny appearance and enlarged pores. Focus on lightweight, non-comedogenic products and gentle cleansers.',
    Dry: 'Your skin lacks moisture and natural oils, which can cause flakiness and tightness. Look for rich, hydrating ingredients like hyaluronic acid and ceramides.',
    Combination: 'You have an oily T-zone with dry or normal cheeks. Use balancing products and consider zone-specific treatments.',
    Sensitive: 'Your skin is reactive and prone to redness and irritation. Opt for fragrance-free, gentle formulas and patch test new products.'
  };
  return descriptions[skinType] || '';
}
