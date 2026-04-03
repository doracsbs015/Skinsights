//used hugging face instead of gemini

async function generateExplanation(analysisResult, productName = '') {
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.log('⚠️ HuggingFace API key missing, using fallback');
    return generateFallbackExplanation(analysisResult, productName);
  }

  const { verdict, skinType, riskyIngredients, beneficialIngredients, summary } = analysisResult;
  const productLabel = productName ? `the product "${productName}"` : 'this product';

  const riskyList = riskyIngredients.length > 0
    ? riskyIngredients.map(r => `- ${r.name}: ${r.reason}`).join('\n')
    : 'None identified';

  const benefitList = beneficialIngredients.slice(0, 5).length > 0
    ? beneficialIngredients.slice(0, 5).map(b => `- ${b.name}: ${b.benefit}`).join('\n')
    : 'None identified from database';

  const prompt = `You are a friendly, expert dermatologist and skincare advisor.

Analyze this skincare product and give a warm, clear explanation for a user with ${skinType} skin.

Product: ${productLabel}
Verdict: ${verdict}
Skin Type: ${skinType}
Risky Ingredients (${riskyIngredients.length}): ${riskyList}
Beneficial Ingredients (${beneficialIngredients.length}): ${benefitList}
Total ingredients analyzed: ${summary.total}

Write 3-4 paragraphs:
1. Friendly assessment of the verdict
2. Why risky ingredients are problematic for ${skinType} skin
3. What beneficial ingredients do
4. 2-3 practical tips for ${skinType} skin

Be warm, professional, jargon-free. No bullet points. Around 200-250 words.`;

  try {
    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-8B-Instruct:cerebras',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) throw new Error('Empty HuggingFace response');

    console.log('✅ HuggingFace used');
    return text.trim();

  } catch (err) {
    console.error('❌ HuggingFace failed:', err?.message || err);
    console.log('⚠️ Using fallback explanation');
    return generateFallbackExplanation(analysisResult, productName);
  }
}

function generateFallbackExplanation(analysisResult, productName = '') {
  const { verdict, skinType, riskyIngredients, beneficialIngredients } = analysisResult;
  const productLabel = productName || 'This product';

  const verdictMessages = {
    'Suitable': `Good news! ${productLabel} appears to be well-suited for your ${skinType} skin type.`,
    'Use with caution': `${productLabel} contains some ingredients that may be of concern for your ${skinType} skin.`,
    'Not suitable': `We recommend avoiding ${productLabel} as it contains several ingredients that are not ideal for ${skinType} skin.`
  };

  let explanation = verdictMessages[verdict] + ' ';

  if (riskyIngredients.length > 0) {
    const topRisky = riskyIngredients.slice(0, 3).map(r => r.name).join(', ');
    explanation += `The following ingredients may cause issues: ${topRisky}. `;
  }

  if (beneficialIngredients.length > 0) {
    const topBenefits = beneficialIngredients.slice(0, 3).map(b => b.name).join(', ');
    explanation += `On the positive side, this product contains beneficial ingredients like ${topBenefits}. `;
  }

  const tips = {
    Oily: 'For oily skin, look for non-comedogenic, oil-free, and lightweight formulas. Niacinamide and salicylic acid are your allies.',
    Dry: 'For dry skin, prioritize rich moisturizers with ceramides, hyaluronic acid, and avoid alcohol-based products.',
    Combination: 'For combination skin, use balancing products and consider zone-specific treatments for different areas.',
    Sensitive: 'For sensitive skin, always patch test new products, avoid fragrances, and opt for minimal-ingredient formulas.'
  };

  explanation += tips[skinType] || 'Always patch test new products and introduce them gradually into your routine.';

  return explanation;
}

module.exports = { generateExplanation };