import { describe, it, expect } from 'vitest';
import { calculateIrrigation } from '../irrigationEngine.js';

const baseParams = {
  cropType: 'Wheat',
  soilType: 'Loamy',
  recentRainfall: 0,
  upcomingRainProb: 0,
  upcomingRainAmount: 0,
  temperature: 30,
  humidity: 50,
  soilMoisture: 45,
};

describe('calculateIrrigation', () => {
  it('returns a positive duration for standard dry conditions', () => {
    const result = calculateIrrigation(baseParams);
    expect(result.durationMinutes).toBeGreaterThan(0);
    expect(result.reasoning).toBeTruthy();
  });

  it('returns factors array with exactly 4 entries', () => {
    const result = calculateIrrigation(baseParams);
    expect(result.factors).toHaveLength(4);
    result.factors.forEach((f) => {
      expect(f).toHaveProperty('label');
      expect(f).toHaveProperty('value');
      expect(f).toHaveProperty('icon');
      expect(f).toHaveProperty('tag');
    });
  });

  it('increases duration for Sandy soil (high soilFactor)', () => {
    const loamy = calculateIrrigation({ ...baseParams, soilType: 'Loamy' });
    const sandy = calculateIrrigation({ ...baseParams, soilType: 'Sandy' });
    expect(sandy.durationMinutes).toBeGreaterThan(loamy.durationMinutes);
  });

  it('decreases duration for Clayey soil (low soilFactor)', () => {
    const loamy = calculateIrrigation({ ...baseParams, soilType: 'Loamy' });
    const clayey = calculateIrrigation({ ...baseParams, soilType: 'Clayey' });
    expect(clayey.durationMinutes).toBeLessThan(loamy.durationMinutes);
  });

  it('returns 0 duration when heavy recent rainfall covers the need', () => {
    const result = calculateIrrigation({ ...baseParams, recentRainfall: 50 });
    expect(result.durationMinutes).toBe(0);
  });

  it('reduces duration when high upcoming rain probability', () => {
    const dry = calculateIrrigation({ ...baseParams });
    const rainy = calculateIrrigation({
      ...baseParams,
      upcomingRainProb: 90,
      upcomingRainAmount: 15,
    });
    expect(rainy.durationMinutes).toBeLessThan(dry.durationMinutes);
  });

  it('uses default crop need for unknown crop', () => {
    const result = calculateIrrigation({ ...baseParams, cropType: 'UnknownCrop' });
    expect(result.durationMinutes).toBeGreaterThanOrEqual(0);
    // Default crop need is 4.5 same as Wheat, so result should be similar
    const wheat = calculateIrrigation(baseParams);
    expect(result.durationMinutes).toBe(wheat.durationMinutes);
  });

  it('uses default soil factor for unknown soil type', () => {
    const result = calculateIrrigation({ ...baseParams, soilType: 'UnknownSoil' });
    const loamy = calculateIrrigation({ ...baseParams, soilType: 'Loamy' });
    // Default soilFactor is 1.0, same as Loamy
    expect(result.durationMinutes).toBe(loamy.durationMinutes);
  });

  it('handles high soil moisture (above target) by reducing deficit', () => {
    const lowMoisture = calculateIrrigation({ ...baseParams, soilMoisture: 30 });
    const highMoisture = calculateIrrigation({ ...baseParams, soilMoisture: 80 });
    // targetMoisture=75, so soilMoisture=80 => moistureDeficit=0
    expect(highMoisture.durationMinutes).toBeLessThan(lowMoisture.durationMinutes);
  });

  it('calculates correctly for Rice crop (high water need)', () => {
    const rice = calculateIrrigation({ ...baseParams, cropType: 'Rice' });
    const wheat = calculateIrrigation({ ...baseParams, cropType: 'Wheat' });
    expect(rice.durationMinutes).toBeGreaterThan(wheat.durationMinutes);
  });
});
