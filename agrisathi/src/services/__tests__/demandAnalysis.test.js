import { describe, it, expect } from 'vitest';
import { analyzeDemand } from '../demandAnalysis.js';

describe('analyzeDemand', () => {
  it('returns High outlook for strong demand and exports', () => {
    const result = analyzeDemand({
      product: 'Wheat',
      marketData: { demand_index: 85 },
      exportData: { growth: 30 },
      importData: {},
      priceDirection: 'up',
    });
    expect(result.outlook).toBe('High');
    expect(result.confidence).toBeGreaterThan(65);
  });

  it('returns Low outlook for poor demand and falling prices', () => {
    const result = analyzeDemand({
      product: 'Wheat',
      marketData: { demand_index: 10 },
      exportData: { growth: -20 },
      importData: {},
      priceDirection: 'down',
    });
    expect(result.outlook).toBe('Low');
    expect(result.confidence).toBeLessThan(35);
  });

  it('returns Medium outlook for baseline/neutral conditions', () => {
    const result = analyzeDemand({
      product: 'Rice',
      marketData: { demand_index: 50 },
      exportData: { growth: 0 },
      importData: {},
      priceDirection: 'stable',
    });
    expect(result.outlook).toBe('Medium');
  });

  it('handles missing marketData gracefully', () => {
    const result = analyzeDemand({
      product: 'Cotton',
      marketData: null,
      exportData: { growth: 10 },
      importData: {},
      priceDirection: 'up',
    });
    // Should still compute without crashing
    expect(result).toHaveProperty('outlook');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('factors');
  });

  it('handles missing exportData gracefully', () => {
    const result = analyzeDemand({
      product: 'Soybean',
      marketData: { demand_index: 60 },
      exportData: null,
      importData: {},
      priceDirection: 'stable',
    });
    expect(result).toHaveProperty('outlook');
  });

  it('price direction up adds positive impact', () => {
    const up = analyzeDemand({
      product: 'Wheat',
      marketData: { demand_index: 50 },
      exportData: { growth: 0 },
      priceDirection: 'up',
    });
    const down = analyzeDemand({
      product: 'Wheat',
      marketData: { demand_index: 50 },
      exportData: { growth: 0 },
      priceDirection: 'down',
    });
    expect(up.confidence).toBeGreaterThan(down.confidence);
  });

  it('factors array always includes Price Trend', () => {
    const result = analyzeDemand({
      product: 'Test',
      priceDirection: 'up',
    });
    const priceFactor = result.factors.find((f) => f.name === 'Price Trend');
    expect(priceFactor).toBeDefined();
    expect(priceFactor.impact).toBe('Positive');
  });

  it('confidence is clamped between 0 and 100', () => {
    const veryHigh = analyzeDemand({
      product: 'X',
      marketData: { demand_index: 200 },
      exportData: { growth: 200 },
      priceDirection: 'up',
    });
    expect(veryHigh.confidence).toBeLessThanOrEqual(100);
    expect(veryHigh.confidence).toBeGreaterThanOrEqual(0);
  });
});
