export function analyzeDemand(params) {
  const { product, marketData, exportData, importData, priceDirection } = params;
  
  let score = 50; // base score
  const factors = [];

  // Average Demand Index (Simulated from marketData)
  let demandIndexImpact = 0;
  if (marketData && marketData.demand_index) {
    demandIndexImpact = (marketData.demand_index - 50) * 0.3; // 30% weight
    score += demandIndexImpact;
    factors.push({ name: 'Demand Index', impact: demandIndexImpact > 0 ? 'Positive' : 'Negative', description: `Market demand index is ${marketData.demand_index}` });
  }

  // Export Growth (Simulated)
  let exportImpact = 0;
  if (exportData && exportData.growth) {
    exportImpact = exportData.growth * 0.25; // 25% weight
    score += exportImpact;
    factors.push({ name: 'Export Trends', impact: exportImpact > 0 ? 'Positive' : 'Negative', description: `Export growth at ${exportData.growth}%` });
  }

  // Price Trend
  let priceImpact = 0;
  if (priceDirection === 'up') priceImpact = 10;
  else if (priceDirection === 'down') priceImpact = -10;
  score += priceImpact; // 20% weight approx
  factors.push({ name: 'Price Trend', impact: priceDirection === 'up' ? 'Positive' : (priceDirection === 'down' ? 'Negative' : 'Neutral'), description: `Prices are trending ${priceDirection}` });

  // Default missing weights
  
  let outlook = 'Medium';
  if (score > 65) outlook = 'High';
  else if (score < 35) outlook = 'Low';

  return {
    outlook,
    confidence: Math.min(100, Math.max(0, Math.round(score))),
    factors
  };
}
