export async function getCurrentWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`;
  const response = await fetch(url);
  return response.json();
}

export async function getForecast(lat, lng, days = 16) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code&timezone=auto&forecast_days=${days}`;
  const response = await fetch(url);
  return response.json();
}

export async function getHistoricalWeather(lat, lng, startDate, endDate) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  const response = await fetch(url);
  return response.json();
}

export async function getSixMonthOutlook(lat, lng) {
  const forecast = await getForecast(lat, lng, 16);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const months = [];

  // Use the 16-day forecast to establish a baseline, then extrapolate
  const dailyTemps = forecast?.daily?.temperature_2m_max || [];
  const dailyPrecip = forecast?.daily?.precipitation_sum || [];
  const avgTemp = dailyTemps.length > 0 ? dailyTemps.reduce((s, v) => s + v, 0) / dailyTemps.length : 25;
  const avgPrecip = dailyPrecip.length > 0 ? dailyPrecip.reduce((s, v) => s + v, 0) / dailyPrecip.length : 2;

  // Seasonal temperature offsets for Indian subcontinent (rough monthly curve)
  const seasonalTempOffset = [-3, -1, 2, 5, 7, 4, 1, 0, 0, -1, -3, -4];

  for (let i = 0; i < 6; i++) {
    const monthIdx = (now.getMonth() + i) % 12;
    const baseOffset = seasonalTempOffset[monthIdx] - seasonalTempOffset[now.getMonth()];
    const temp = Math.round(avgTemp + baseOffset);
    // Monsoon months (Jun-Sep) get higher rainfall multiplier
    const monsoonFactor = (monthIdx >= 5 && monthIdx <= 8) ? 3.5 : (monthIdx >= 9 && monthIdx <= 10) ? 1.5 : 0.7;
    const rainfall = Math.round(avgPrecip * 30 * monsoonFactor);

    months.push({
      month: monthNames[monthIdx],
      avgTemp: temp,
      totalRainfall: rainfall,
      condition: rainfall > 150 ? 'Rainy' : rainfall > 80 ? 'Scattered Showers' : temp > 35 ? 'Hot & Dry' : 'Sunny'
    });
  }

  return { forecast, months };
}

/**
 * Estimate soil moisture percentage from weather conditions.
 * Uses a simplified water-balance model based on recent rainfall,
 * temperature, humidity, and soil type.
 */
export function estimateSoilMoisture({ recentRainfall = 0, temperature = 28, humidity = 60, soilType = 'Loamy' }) {
  // Base moisture from humidity
  let moisture = humidity * 0.4;

  // Rainfall contribution (each mm of rain adds ~2% up to a cap)
  moisture += Math.min(recentRainfall * 2, 30);

  // Evapotranspiration loss from temperature
  const etLoss = Math.max(0, (temperature - 20) * 0.8);
  moisture -= etLoss;

  // Soil retention factor
  const retentionFactors = { Sandy: 0.7, Loamy: 1.0, Black: 1.2, Red: 0.85, Clayey: 1.3 };
  moisture *= (retentionFactors[soilType] || 1.0);

  return Math.max(10, Math.min(95, Math.round(moisture)));
}

const LOCATION_CACHE = {};

export async function getLocationCoords(state, district) {
  const locations = {
    'Haryana_Jind': { lat: 29.32, lng: 76.32 },
    'Maharashtra_Pune': { lat: 18.52, lng: 73.86 },
    'Punjab_Ludhiana': { lat: 30.9, lng: 75.86 },
    'UP_Lucknow': { lat: 26.85, lng: 80.95 },
    'Karnataka_Bangalore': { lat: 12.97, lng: 77.59 },
    'Gujarat_Ahmedabad': { lat: 23.02, lng: 72.57 },
    'Rajasthan_Jaipur': { lat: 26.91, lng: 75.78 },
    'MP_Bhopal': { lat: 23.25, lng: 77.41 },
    'Bihar_Patna': { lat: 25.59, lng: 85.13 },
    'TamilNadu_Chennai': { lat: 13.08, lng: 80.27 },
    'AndhraPradesh_Hyderabad': { lat: 17.38, lng: 78.48 },
    'WestBengal_Kolkata': { lat: 22.57, lng: 88.36 },
    'Odisha_Bhubaneswar': { lat: 20.29, lng: 85.82 },
    'Kerala_Thiruvananthapuram': { lat: 8.52, lng: 76.93 },
    'Assam_Guwahati': { lat: 26.14, lng: 91.73 }
  };

  // Fast path: check hardcoded map
  const key = `${state}_${district}`;
  if (locations[key]) return locations[key];

  // Check cache
  if (LOCATION_CACHE[key]) return LOCATION_CACHE[key];

  // Fallback: geocode via Open-Meteo Geocoding API
  try {
    const query = encodeURIComponent(`${district} ${state} India`);
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const coords = { lat: data.results[0].latitude, lng: data.results[0].longitude };
      LOCATION_CACHE[key] = coords;
      return coords;
    }
  } catch (e) {
    console.warn('Geocoding fallback failed:', e);
  }

  // Ultimate fallback: center of India
  return { lat: 20.59, lng: 78.96 };
}

export function weatherCodeToDescription(code) {
  const mapping = {
    0: { desc: 'Clear sky', icon: 'clear_day' },
    1: { desc: 'Mainly clear', icon: 'partly_cloudy_day' },
    2: { desc: 'Partly cloudy', icon: 'partly_cloudy_day' },
    3: { desc: 'Overcast', icon: 'cloud' },
    45: { desc: 'Fog', icon: 'foggy' },
    48: { desc: 'Depositing rime fog', icon: 'foggy' },
    51: { desc: 'Light drizzle', icon: 'rainy' },
    53: { desc: 'Moderate drizzle', icon: 'rainy' },
    55: { desc: 'Dense drizzle', icon: 'rainy' },
    61: { desc: 'Slight rain', icon: 'rainy' },
    63: { desc: 'Moderate rain', icon: 'rainy' },
    65: { desc: 'Heavy rain', icon: 'rainy' },
    71: { desc: 'Slight snow', icon: 'cloudy_snowing' },
    73: { desc: 'Moderate snow', icon: 'cloudy_snowing' },
    75: { desc: 'Heavy snow', icon: 'cloudy_snowing' },
    95: { desc: 'Thunderstorm', icon: 'thunderstorm' },
    96: { desc: 'Thunderstorm with slight hail', icon: 'thunderstorm' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'thunderstorm' }
  };
  return mapping[code] || { desc: 'Unknown', icon: 'question_mark' };
}
