import { describe, it, expect, vi } from 'vitest';
import { AgriChatbot } from '../chatbot.js';

// Mock all downstream service modules so tests run without network/filesystem
vi.mock('../weather', () => ({
  getCurrentWeather: vi.fn(() =>
    Promise.resolve({
      current: {
        temperature_2m: 32,
        relative_humidity_2m: 55,
        precipitation: 0,
        weather_code: 0,
        wind_speed_10m: 8,
      },
    })
  ),
  getForecast: vi.fn(() =>
    Promise.resolve({
      daily: {
        temperature_2m_max: [34, 33, 35],
        temperature_2m_min: [22, 21, 23],
        precipitation_sum: [0, 2, 0],
        precipitation_probability_max: [10, 40, 5],
        weather_code: [0, 61, 0],
      },
    })
  ),
  getLocationCoords: vi.fn(() => ({ lat: 29.32, lng: 76.32 })),
}));

vi.mock('../irrigationEngine', () => ({
  calculateIrrigation: vi.fn(() => ({
    durationMinutes: 25,
    reasoning: 'Mocked reasoning',
    factors: [],
  })),
}));

vi.mock('../cropRecommender', () => ({
  recommendCrops: vi.fn(() =>
    Promise.resolve([
      { crop: 'Wheat', matchPercent: 92, reason: 'Good match' },
      { crop: 'Rice', matchPercent: 80, reason: 'Decent match' },
      { crop: 'Maize', matchPercent: 70, reason: 'Fair match' },
    ])
  ),
}));

vi.mock('../dataLoader', () => ({
  loadData: vi.fn((name) => {
    if (name === 'crop_soil') return Promise.resolve([]);
    if (name === 'jind_mandi_prices')
      return Promise.resolve({
        Wheat: [{ minPrice: 2000, maxPrice: 2500, modalPrice: 2200, date: '2026-01-01' }],
      });
    if (name === 'commodity_prices') return Promise.resolve({});
    if (name === 'export_product_timeseries')
      return Promise.resolve({
        'Basmati Rice': [
          { qty: 100, value: 500 },
          { qty: 120, value: 600 },
        ],
      });
    if (name === 'import_product_timeseries') return Promise.resolve({});
    return Promise.resolve(null);
  }),
}));

vi.mock('../pricePrediction', () => ({
  predictPrices: vi.fn(() => ({
    trend: 2,
    predictedPrices: [],
    confidence: 75,
    changePercent: '5.0',
    direction: 'up',
  })),
}));

const userProfile = {
  fullName: 'Ramesh Kumar',
  state: 'Haryana',
  district: 'Jind',
  soilType: 'Loamy',
  currentCrops: ['Wheat'],
};

describe('AgriChatbot — intent detection', () => {
  let bot;

  beforeEach(() => {
    bot = new AgriChatbot();
  });

  it('detects greeting intent', async () => {
    const res = await bot.processMessage('hello', userProfile);
    expect(res.text).toContain('Namaste');
    expect(res.text).toContain('Ramesh');
  });

  it('detects weather intent', async () => {
    const res = await bot.processMessage('what is the weather today?', userProfile);
    expect(res.text).toContain('Temperature');
    expect(res.text).toContain('Humidity');
  });

  it('detects irrigation intent', async () => {
    const res = await bot.processMessage('should I water my crops?', userProfile);
    expect(res.text).toContain('Irrigation');
  });

  it('detects crop recommendation intent', async () => {
    const res = await bot.processMessage('what crop should I grow?', userProfile);
    expect(res.text).toContain('Crop Recommendations');
    expect(res.text).toContain('Wheat');
  });

  it('detects price intent', async () => {
    const res = await bot.processMessage('what is the wheat price?', userProfile);
    expect(res.text).toContain('Price Information');
  });

  it('detects demand/trade intent', async () => {
    const res = await bot.processMessage('show me export trends', userProfile);
    expect(res.text).toContain('Trade Trends');
  });

  it('detects soil/fertilizer intent', async () => {
    const res = await bot.processMessage('tell me about my soil', userProfile);
    expect(res.text).toContain('Soil Analysis');
  });

  it('detects help intent', async () => {
    const res = await bot.processMessage('help me', userProfile);
    expect(res.text).toContain('help you with');
    expect(res.suggestions).toBeTruthy();
  });

  it('handles unknown intent with fallback', async () => {
    const res = await bot.processMessage('xyzzy abcdef', userProfile);
    expect(res.text).toContain('still learning');
    expect(res.suggestions).toBeTruthy();
  });

  it('uses first name from profile in greeting', async () => {
    const res = await bot.processMessage('hi', { fullName: 'Sita Devi' });
    expect(res.text).toContain('Sita');
  });

  it('uses "Farmer" as fallback name when no profile', async () => {
    const res = await bot.processMessage('hello', {});
    expect(res.text).toContain('Farmer');
  });
});

describe('AgriChatbot — suggestions', () => {
  let bot;

  beforeEach(() => {
    bot = new AgriChatbot();
  });

  it('greeting response includes suggestions array', async () => {
    const res = await bot.processMessage('hey', userProfile);
    expect(Array.isArray(res.suggestions)).toBe(true);
    expect(res.suggestions.length).toBeGreaterThan(0);
  });

  it('help response includes suggestions', async () => {
    const res = await bot.processMessage('how to use', userProfile);
    expect(res.suggestions.length).toBeGreaterThan(0);
  });
});
