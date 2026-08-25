import { describe, it, expect, vi, beforeEach } from 'vitest';
import { estimateSoilMoisture, weatherCodeToDescription } from '../weather.js';

// We can't test getCurrentWeather/getForecast without network,
// so we focus on the pure functions. Network-dependent functions
// are tested via chatbot integration tests with mocks.

// getLocationCoords uses a module-level LOCATION_CACHE and fetch,
// so we test the hardcoded lookup path and fallback.

describe('weatherCodeToDescription', () => {
  it('returns description for clear sky (code 0)', () => {
    const result = weatherCodeToDescription(0);
    expect(result.desc).toBe('Clear sky');
    expect(result.icon).toBe('clear_day');
  });

  it('returns description for moderate rain (code 63)', () => {
    const result = weatherCodeToDescription(63);
    expect(result.desc).toBe('Moderate rain');
    expect(result.icon).toBe('rainy');
  });

  it('returns description for thunderstorm (code 95)', () => {
    const result = weatherCodeToDescription(95);
    expect(result.desc).toBe('Thunderstorm');
    expect(result.icon).toBe('thunderstorm');
  });

  it('returns Unknown for unmapped code', () => {
    const result = weatherCodeToDescription(999);
    expect(result.desc).toBe('Unknown');
    expect(result.icon).toBe('question_mark');
  });

  it('handles all defined codes without errors', () => {
    const knownCodes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 61, 63, 65, 71, 73, 75, 95, 96, 99];
    knownCodes.forEach((code) => {
      const result = weatherCodeToDescription(code);
      expect(result.desc).toBeTruthy();
      expect(result.icon).toBeTruthy();
    });
  });
});

describe('estimateSoilMoisture', () => {
  it('returns a value between 10 and 95', () => {
    const result = estimateSoilMoisture({
      recentRainfall: 5,
      temperature: 30,
      humidity: 60,
      soilType: 'Loamy',
    });
    expect(result).toBeGreaterThanOrEqual(10);
    expect(result).toBeLessThanOrEqual(95);
  });

  it('increases with higher rainfall', () => {
    const dry = estimateSoilMoisture({ recentRainfall: 0, temperature: 30, humidity: 50, soilType: 'Loamy' });
    const wet = estimateSoilMoisture({ recentRainfall: 20, temperature: 30, humidity: 50, soilType: 'Loamy' });
    expect(wet).toBeGreaterThan(dry);
  });

  it('decreases with higher temperature (evapotranspiration)', () => {
    const cool = estimateSoilMoisture({ recentRainfall: 5, temperature: 20, humidity: 60, soilType: 'Loamy' });
    const hot = estimateSoilMoisture({ recentRainfall: 5, temperature: 40, humidity: 60, soilType: 'Loamy' });
    expect(hot).toBeLessThan(cool);
  });

  it('Clayey soil retains more moisture than Sandy', () => {
    const sandy = estimateSoilMoisture({ recentRainfall: 5, temperature: 28, humidity: 60, soilType: 'Sandy' });
    const clayey = estimateSoilMoisture({ recentRainfall: 5, temperature: 28, humidity: 60, soilType: 'Clayey' });
    expect(clayey).toBeGreaterThan(sandy);
  });

  it('uses default retention for unknown soil type', () => {
    const known = estimateSoilMoisture({ recentRainfall: 5, temperature: 28, humidity: 60, soilType: 'Loamy' });
    const unknown = estimateSoilMoisture({ recentRainfall: 5, temperature: 28, humidity: 60, soilType: 'Martian' });
    // Loamy factor is 1.0, default is also 1.0
    expect(unknown).toBe(known);
  });

  it('clamps to minimum 10 even with extreme evapotranspiration', () => {
    const result = estimateSoilMoisture({
      recentRainfall: 0,
      temperature: 50,
      humidity: 5,
      soilType: 'Sandy',
    });
    expect(result).toBeGreaterThanOrEqual(10);
  });

  it('clamps to maximum 95 even with extreme rainfall and humidity', () => {
    const result = estimateSoilMoisture({
      recentRainfall: 100,
      temperature: 15,
      humidity: 100,
      soilType: 'Clayey',
    });
    expect(result).toBeLessThanOrEqual(95);
  });

  it('uses defaults when no params are provided', () => {
    const result = estimateSoilMoisture({});
    expect(result).toBeGreaterThanOrEqual(10);
    expect(result).toBeLessThanOrEqual(95);
  });
});

describe('getLocationCoords', () => {
  // We need to import dynamically because the module does network calls at top level
  let getLocationCoords;

  beforeEach(async () => {
    // Mock fetch for geocoding fallback
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      })
    );
    // Import fresh to avoid cache issues
    const mod = await import('../weather.js');
    getLocationCoords = mod.getLocationCoords;
  });

  it('returns hardcoded coords for known state/district', async () => {
    const coords = await getLocationCoords('Haryana', 'Jind');
    expect(coords.lat).toBe(29.32);
    expect(coords.lng).toBe(76.32);
  });

  it('returns hardcoded coords for Maharashtra Pune', async () => {
    const coords = await getLocationCoords('Maharashtra', 'Pune');
    expect(coords.lat).toBe(18.52);
    expect(coords.lng).toBe(73.86);
  });

  it('returns fallback coords for completely unknown location', async () => {
    const coords = await getLocationCoords('Unknown', 'Nowhere');
    // Fallback: center of India
    expect(coords.lat).toBe(20.59);
    expect(coords.lng).toBe(78.96);
  });
});
