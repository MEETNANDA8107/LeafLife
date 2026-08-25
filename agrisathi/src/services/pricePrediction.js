export function predictPrices(historicalPrices) {
  if (!historicalPrices || historicalPrices.length < 2) {
    return { trend: 0, predictedPrices: [], confidence: 0, changePercent: 0, direction: 'stable' };
  }

  const n = historicalPrices.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  historicalPrices.forEach((point, i) => {
    const x = i;
    const y = parseFloat(point.price);
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  let ssTot = 0, ssRes = 0;
  const meanY = sumY / n;
  historicalPrices.forEach((point, i) => {
    const x = i;
    const y = parseFloat(point.price);
    const f = slope * x + intercept;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - f, 2);
  });
  const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  const predictedPrices = [];
  const lastPrice = parseFloat(historicalPrices[n - 1].price);
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const predictedPrice = slope * (n - 1 + i) + intercept;
    predictedPrices.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(0, predictedPrice).toFixed(2)
    });
  }

  const futurePrice = parseFloat(predictedPrices[predictedPrices.length - 1].price);
  const changePercent = ((futurePrice - lastPrice) / lastPrice) * 100;
  
  let direction = 'stable';
  if (changePercent > 2) direction = 'up';
  else if (changePercent < -2) direction = 'down';

  return {
    trend: slope,
    predictedPrices,
    confidence: Math.round(rSquared * 100),
    changePercent: changePercent.toFixed(2),
    direction
  };
}
