import { describe, it, expect } from 'vitest';
import { predictPrices } from '../pricePrediction.js';

// Helper: create an array of { price } objects with a linear trend
function linearPrices(start, step, count) {
  return Array.from({ length: count }, (_, i) => ({
    price: (start + step * i).toFixed(2),
  }));
}

describe('predictPrices', () => {
  it('returns defaults when fewer than 2 data points', () => {
    const result = predictPrices([{ price: '100' }]);
    expect(result.trend).toBe(0);
    expect(result.predictedPrices).toEqual([]);
    expect(result.confidence).toBe(0);
    expect(result.changePercent).toBe(0);
    expect(result.direction).toBe('stable');
  });

  it('returns defaults for null input', () => {
    const result = predictPrices(null);
    expect(result.direction).toBe('stable');
    expect(result.predictedPrices).toEqual([]);
  });

  it('detects upward trend for rising prices', () => {
    const data = linearPrices(100, 10, 10); // 100, 110, 120, ...
    const result = predictPrices(data);
    expect(result.direction).toBe('up');
    expect(parseFloat(result.changePercent)).toBeGreaterThan(2);
    expect(result.trend).toBeGreaterThan(0);
  });

  it('detects downward trend for falling prices', () => {
    const data = linearPrices(200, -10, 10); // 200, 190, 180, ...
    const result = predictPrices(data);
    expect(result.direction).toBe('down');
    expect(parseFloat(result.changePercent)).toBeLessThan(-2);
    expect(result.trend).toBeLessThan(0);
  });

  it('detects stable for flat prices', () => {
    const data = linearPrices(100, 0, 10); // all 100
    const result = predictPrices(data);
    expect(result.direction).toBe('stable');
    expect(parseFloat(result.changePercent)).toBe(0);
  });

  it('always predicts exactly 7 future prices', () => {
    const data = linearPrices(50, 5, 5);
    const result = predictPrices(data);
    expect(result.predictedPrices).toHaveLength(7);
  });

  it('predicted prices have valid date and positive price', () => {
    const data = linearPrices(50, 5, 5);
    const result = predictPrices(data);
    result.predictedPrices.forEach((p) => {
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parseFloat(p.price)).toBeGreaterThanOrEqual(0);
    });
  });

  it('returns 100% confidence for a perfectly linear dataset', () => {
    const data = linearPrices(10, 10, 10);
    const result = predictPrices(data);
    expect(result.confidence).toBe(100);
  });

  it('returns lower confidence for noisy data', () => {
    const data = [
      { price: '100' },
      { price: '200' },
      { price: '50' },
      { price: '300' },
      { price: '10' },
    ];
    const result = predictPrices(data);
    expect(result.confidence).toBeLessThan(100);
  });

  it('handles 2-point dataset (minimum viable)', () => {
    const data = [{ price: '100' }, { price: '120' }];
    const result = predictPrices(data);
    expect(result.predictedPrices).toHaveLength(7);
    expect(result.trend).toBeGreaterThan(0);
  });
});
