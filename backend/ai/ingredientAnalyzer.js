const ingredientDB = require('../data/ingredients.json');

// Clean and parse raw ingredient text
function parseIngredients(rawText) {
  return rawText
    .toLowerCase()
    .replace(/[*•·\[\]()]/g, '')
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0 && i.length < 100);
}

// Normalize ingredient name for matching

function normalize(str) {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function findIngredientMatch(ingredient) {
  const normalized = normalize(ingredient);
  const db = ingredientDB.ingredients;

  // Exact match first
  if (db[normalized]) return { key: normalized, data: db[normalized] };

  // Partial match — ingredient name contains a known key
  for (const key of Object.keys(db)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { key, data: db[key] };
    }
  }

  return null;
}


function analyzeIngredients(rawIngredients, skinType) {
  const parsed = parseIngredients(rawIngredients);
  const riskyIngredients = [];
  const beneficialIngredients = [];
  const unknownIngredients = [];
  const skinTypeRisks = ingredientDB.skinTypeRisks[skinType] || [];

  for (const ingredient of parsed) {
    const match = findIngredientMatch(ingredient);

    if (!match) {
      unknownIngredients.push(ingredient);
      continue;
    }

    const { data } = match;

    if (!data.safe) {
      // potentially harmful
      const isSkinTypeRisk = skinTypeRisks.some(risk =>
        ingredient.includes(risk) || risk.includes(ingredient)
      );

      riskyIngredients.push({
        name: ingredient,
        reason: data.reason,
        severity: data.severity || 'medium',
        relevantToSkinType: isSkinTypeRisk
      });
    } else if (data.benefit) {
      // Check if it has a skin-type specific caution
      const hasSpecificCaution = skinTypeRisks.some(risk =>
        ingredient.includes(risk) || risk.includes(normalize(ingredient))
      );

      if (hasSpecificCaution) {
        riskyIngredients.push({
          name: ingredient,
          reason: `This ingredient may not be suitable for ${skinType} skin`,
          severity: 'low',
          relevantToSkinType: true
        });
      } else {
        beneficialIngredients.push({
          name: ingredient,
          benefit: data.benefit,
          caution: data.caution || null
        });
      }
    }
  }

  // Count risky and determine verdict
  const riskyCount = riskyIngredients.length;
  let verdict;
  if (riskyCount === 0) {
    verdict = 'Suitable';
  } else if (riskyCount <= 2) {
    verdict = 'Use with caution';
  } else {
    verdict = 'Not suitable';
  }

  return {
    parsedIngredients: parsed,
    riskyIngredients,
    beneficialIngredients,
    unknownIngredients,
    verdict,
    skinType,
    summary: {
      total: parsed.length,
      risky: riskyCount,
      beneficial: beneficialIngredients.length,
      unknown: unknownIngredients.length
    }
  };
}

module.exports = { analyzeIngredients, parseIngredients };
