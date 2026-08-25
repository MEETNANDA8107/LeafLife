export function calculateIrrigation(params) {
  const { cropType, soilType, recentRainfall, upcomingRainProb, upcomingRainAmount, temperature, humidity, soilMoisture } = params;
  
  const cropNeeds = {
    Wheat: 4.5, Rice: 7, Maize: 5.5, Cotton: 6, Sugarcane: 7,
    Tomato: 4.5, Soybean: 5, Barley: 4, Groundnut: 5, Tobacco: 4,
    Millets: 3.5, Pulses: 3, default: 4.5
  };
  
  const soilFactors = {
    Sandy: 1.3, Loamy: 1.0, Black: 0.8, Red: 1.1, Clayey: 0.7, default: 1.0
  };
  
  const cropDailyNeed = cropNeeds[cropType] || cropNeeds.default;
  const soilFactor = soilFactors[soilType] || soilFactors.default;
  
  const targetMoisture = 75; // %
  const moistureDeficit = Math.max(0, targetMoisture - soilMoisture);
  
  // Simplified calculation
  const deficitAdjustment = moistureDeficit * soilFactor * 0.5; 
  const rainContribution = (upcomingRainProb / 100) * upcomingRainAmount * 0.7;
  
  const waterNeed = (cropDailyNeed * soilFactor) + deficitAdjustment - recentRainfall - rainContribution;
  
  const duration = Math.max(0, waterNeed * 6); // ~6 mins per mm
  
  return {
    durationMinutes: Math.round(duration),
    reasoning: `Calculated based on crop need of ${cropDailyNeed} mm/day, soil factor ${soilFactor}, and expected rainfall.`,
    factors: [
      { label: 'Crop Water Need', value: `${cropDailyNeed} mm/day`, icon: 'water_drop', tag: 'High' },
      { label: 'Soil Factor', value: soilFactor, icon: 'grass', tag: 'Medium' },
      { label: 'Moisture Deficit', value: `${moistureDeficit}%`, icon: 'opacity', tag: 'Variable' },
      { label: 'Rain Contribution', value: `${rainContribution.toFixed(2)} mm`, icon: 'rainy', tag: 'Variable' }
    ]
  };
}
