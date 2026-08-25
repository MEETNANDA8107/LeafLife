import { getCropRecommendationData } from './dataLoader.js';

export async function recommendCrops(params) {
  const { temperature, humidity, ph, rainfall, N, P, K } = params;
  const data = await getCropRecommendationData();
  
  if (!data || !data.length) {
    return [];
  }
  
  // Normalization boundaries (approximated for KNN scaling)
  const bounds = {
    N: { min: 0, max: 140 },
    P: { min: 5, max: 145 },
    K: { min: 5, max: 205 },
    temperature: { min: 8, max: 44 },
    humidity: { min: 14, max: 100 },
    ph: { min: 3.5, max: 9.9 },
    rainfall: { min: 20, max: 298 }
  };

  const normalize = (val, min, max) => (val - min) / (max - min);

  const inputFeatures = [
    normalize(N, bounds.N.min, bounds.N.max),
    normalize(P, bounds.P.min, bounds.P.max),
    normalize(K, bounds.K.min, bounds.K.max),
    normalize(temperature, bounds.temperature.min, bounds.temperature.max),
    normalize(humidity, bounds.humidity.min, bounds.humidity.max),
    normalize(ph, bounds.ph.min, bounds.ph.max),
    normalize(rainfall, bounds.rainfall.min, bounds.rainfall.max)
  ];

  const distances = data.map(point => {
    const ptFeatures = [
      normalize(point.N, bounds.N.min, bounds.N.max),
      normalize(point.P, bounds.P.min, bounds.P.max),
      normalize(point.K, bounds.K.min, bounds.K.max),
      normalize(point.temperature, bounds.temperature.min, bounds.temperature.max),
      normalize(point.humidity, bounds.humidity.min, bounds.humidity.max),
      normalize(point.ph, bounds.ph.min, bounds.ph.max),
      normalize(point.rainfall, bounds.rainfall.min, bounds.rainfall.max)
    ];
    
    let sumSq = 0;
    for (let i = 0; i < 7; i++) {
      sumSq += Math.pow(inputFeatures[i] - ptFeatures[i], 2);
    }
    return { crop: point.crop, distance: Math.sqrt(sumSq), original: point };
  });

  distances.sort((a, b) => a.distance - b.distance);
  
  const K_VAL = 5;
  const nearest = distances.slice(0, K_VAL);
  
  const votes = {};
  nearest.forEach(n => {
    if (!votes[n.crop]) votes[n.crop] = { count: 0, sumDist: 0 };
    votes[n.crop].count += 1;
    votes[n.crop].sumDist += n.distance;
  });

  const results = Object.keys(votes).map(crop => {
    const v = votes[crop];
    const matchPercentage = (v.count / K_VAL) * 100 * (1 - (v.sumDist / (v.count * Math.sqrt(7))));
    const pct = Math.max(10, Math.min(99, Math.round(matchPercentage)));
    return {
      crop,
      name: crop,
      matchPercentage: pct,
      matchPercent: pct,
      match: pct,
      reason: `Well-suited for your soil and climate conditions with ${pct}% compatibility. Optimal NPK and weather match.`,
      reasoning: `Suitable for NPK levels and expected weather. Optimal match.`,
      recommendationText: `Recommended based on soil nutrients, temperature, and rainfall analysis.`,
      yield: pct > 80 ? 'High' : pct > 60 ? 'Medium' : 'Low',
      risk: pct > 80 ? 'Low' : pct > 60 ? 'Medium' : 'High',
      estYield: pct > 80 ? '~4.5 tons/ha (est.)' : pct > 60 ? '~3.2 tons/ha (est.)' : '~2.1 tons/ha (est.)',
      riskLevel: pct > 80 ? 'Low' : pct > 60 ? 'Medium' : 'High'
    };
  });
  
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  return results.slice(0, 5);
}
