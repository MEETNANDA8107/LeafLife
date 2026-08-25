import { getCurrentWeather, getForecast, getLocationCoords } from './weather';
import { calculateIrrigation } from './irrigationEngine';
import { recommendCrops } from './cropRecommender';
import { loadData } from './dataLoader';
import { predictPrices } from './pricePrediction';

const INTENTS = [
  { keys: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'], intent: 'greeting' },
  { keys: ['weather', 'rain', 'temperature', 'forecast', 'storm', 'humidity', 'wind'], intent: 'weather' },
  { keys: ['irrigat', 'water', 'sprinkler', 'moisture'], intent: 'irrigation' },
  { keys: ['crop', 'recommend', 'grow', 'plant', 'suitable', 'sow', 'harvest'], intent: 'crop' },
  { keys: ['price', 'mandi', 'cost', 'sell', 'market', 'rate', 'worth'], intent: 'price' },
  { keys: ['demand', 'trend', 'export', 'import', 'trade'], intent: 'demand' },
  { keys: ['soil', 'fertilizer', 'nutrient', 'nitrogen', 'potassium', 'phosphorus'], intent: 'soil' },
  { keys: ['help', 'what can you', 'how to', 'guide'], intent: 'help' },
];

function detectIntent(message) {
  const msg = message.toLowerCase();
  for (const { keys, intent } of INTENTS) {
    if (keys.some(k => msg.includes(k))) return intent;
  }
  return 'unknown';
}

export class AgriChatbot {
  constructor() {
    this.cache = {};
  }

  async processMessage(message, userProfile) {
    const intent = detectIntent(message);
    const name = userProfile?.fullName?.split(' ')[0] || 'Farmer';

    try {
      switch (intent) {
        case 'greeting':
          return {
            text: `Namaste ${name}! 🙏 I'm LeafLife, your agricultural assistant. I can help you with:\n\n• Weather forecasts for your area\n• Crop recommendations based on your soil & weather\n• Irrigation scheduling advice\n• Market prices and demand trends\n• Soil and fertilizer guidance\n\nWhat would you like to know?`,
            suggestions: ['What\'s the weather today?', 'Which crop should I grow?', 'Should I irrigate today?', 'Show wheat prices']
          };

        case 'weather':
          return await this.handleWeather(userProfile, name);

        case 'irrigation':
          return await this.handleIrrigation(userProfile, name);

        case 'crop':
          return await this.handleCrop(userProfile, name);

        case 'price':
          return await this.handlePrice(message, userProfile, name);

        case 'demand':
          return await this.handleDemand(message, name);

        case 'soil':
          return await this.handleSoil(userProfile, name);

        case 'help':
          return {
            text: `Here's what I can help you with, ${name}:\n\n🌦️ **Weather**: Ask about forecast, rain probability, temperature\n🌾 **Crops**: Get recommendations based on your conditions\n💧 **Irrigation**: Know when and how long to irrigate\n💰 **Market**: Check mandi prices, demand trends\n🌱 **Soil**: Get fertilizer and soil management advice\n\nJust ask naturally, like "Should I irrigate today?" or "What's the wheat price?"`,
            suggestions: ['Weather forecast', 'Recommend a crop', 'Irrigation advice', 'Wheat price today']
          };

        default:
          return {
            text: `I understand you're asking about "${message}". While I'm still learning, I can definitely help with weather, crop recommendations, irrigation scheduling, and market prices. Try asking me something specific!`,
            suggestions: ['What\'s the weather?', 'Best crop for my soil?', 'Should I water today?', 'Market prices']
          };
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      return {
        text: `I'm sorry ${name}, I encountered an issue processing your request. Please try asking again or check the relevant section on the dashboard.`,
        suggestions: ['Try again', 'Help']
      };
    }
  }

  async handleWeather(profile, name) {
    const coords = getLocationCoords(profile?.state, profile?.district);
    const weather = await getCurrentWeather(coords.lat, coords.lng);
    const forecast = await getForecast(coords.lat, coords.lng, 7);

    const current = weather?.current;
    if (!current) {
      return { text: `I couldn't fetch weather data right now. Please check your internet connection.`, suggestions: ['Try again'] };
    }

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const precip = current.precipitation;

    let rainForecast = 'No significant rain expected';
    if (forecast?.daily?.precipitation_sum) {
      const rainDays = forecast.daily.precipitation_sum.filter(p => p > 1).length;
      if (rainDays > 3) rainForecast = `Rain expected on ${rainDays} of the next 7 days`;
      else if (rainDays > 0) rainForecast = `Light rain possible on ${rainDays} day(s) this week`;
    }

    return {
      text: `Here's the weather for your area, ${name}:\n\n🌡️ **Temperature**: ${temp}°C\n💧 **Humidity**: ${humidity}%\n🌧️ **Current Precipitation**: ${precip}mm\n\n📅 **7-Day Outlook**: ${rainForecast}\n\nThis information is useful for planning irrigation and field activities.`,
      suggestions: ['Should I irrigate?', 'Best crop for this weather?', '6-month forecast']
    };
  }

  async handleIrrigation(profile, name) {
    const coords = getLocationCoords(profile?.state, profile?.district);
    const weather = await getCurrentWeather(coords.lat, coords.lng);
    const forecast = await getForecast(coords.lat, coords.lng, 3);

    const cropType = profile?.currentCrops?.[0] || 'Wheat';
    const soilType = profile?.soilType || 'Loamy';

    const recentRainfall = weather?.current?.precipitation || 0;
    const upcomingRainProb = forecast?.daily?.precipitation_probability_max?.[0] || 0;
    const upcomingRainAmount = forecast?.daily?.precipitation_sum?.[0] || 0;
    const temp = weather?.current?.temperature_2m || 25;
    const humidity = weather?.current?.relative_humidity_2m || 60;

    const result = calculateIrrigation({
      cropType, soilType, recentRainfall,
      upcomingRainProb, upcomingRainAmount,
      temperature: temp, humidity, soilMoisture: 45
    });

    const duration = result.durationMinutes;

    if (duration <= 0) {
      return {
        text: `Good news, ${name}! 🌧️ You don't need to irrigate right now.\n\n**Reason**: ${result.reasoning}\n\nYour ${cropType} crop in ${soilType} soil has sufficient moisture. I'll let you know when irrigation is needed.`,
        suggestions: ['When should I irrigate next?', 'Weather forecast', 'Crop health']
      };
    }

    return {
      text: `💧 **Irrigation Recommendation for ${name}**:\n\n⏱️ **Run sprinklers for ${duration} minutes**\n\n📋 **Why?**\n${result.reasoning}\n\n🌱 Crop: ${cropType}\n🪨 Soil: ${soilType}\n🌧️ Recent rain: ${recentRainfall}mm\n☁️ Rain probability: ${upcomingRainProb}%`,
      suggestions: ['Start irrigation', 'Weather forecast', 'Change crop settings']
    };
  }

  async handleCrop(profile, name) {
    const coords = getLocationCoords(profile?.state, profile?.district);
    const weather = await getCurrentWeather(coords.lat, coords.lng);

    const temp = weather?.current?.temperature_2m || 25;
    const humidity = weather?.current?.relative_humidity_2m || 60;
    const rainfall = weather?.current?.precipitation || 100;

    const soilData = await loadData('crop_soil');
    const userSoil = profile?.soilType || 'Loamy';
    const soilMatch = soilData?.find(s => s.soilType === userSoil) || {};

    const result = await recommendCrops({
      temperature: temp, humidity, ph: soilMatch.ph || 6.5,
      rainfall: rainfall, N: soilMatch.nitrogen || 50,
      P: soilMatch.phosphorous || 30, K: soilMatch.potassium || 40
    });

    if (!result || result.length === 0) {
      return { text: `I couldn't generate recommendations right now. Please check the Weather & Crops page for detailed analysis.`, suggestions: ['Weather forecast'] };
    }

    const top3 = result.slice(0, 3);
    const cropList = top3.map((c, i) => `${i + 1}. **${c.crop}** (${c.matchPercent}% match) - ${c.reason}`).join('\n');

    return {
      text: `🌾 **Top Crop Recommendations for ${name}**:\n\n${cropList}\n\nThese are based on your soil type (${userSoil}), current temperature (${temp}°C), and humidity (${humidity}%).`,
      suggestions: ['Tell me more about ' + top3[0].crop, 'Irrigation for ' + top3[0].crop, 'Market price of ' + top3[0].crop]
    };
  }

  async handlePrice(message, profile, name) {
    const msg = message.toLowerCase();
    const crops = ['wheat', 'rice', 'tomato', 'cotton', 'maize', 'soybean', 'onion', 'potato', 'mustard'];
    let queryCrop = crops.find(c => msg.includes(c));
    if (!queryCrop) queryCrop = profile?.currentCrops?.[0]?.toLowerCase() || 'wheat';
    const cropName = queryCrop.charAt(0).toUpperCase() + queryCrop.slice(1);

    const jindPrices = await loadData('jind_mandi_prices');
    const commodityPrices = await loadData('commodity_prices');

    let priceInfo = '';
    const jindData = jindPrices?.[cropName] || jindPrices?.[cropName.toUpperCase()];
    if (jindData && jindData.length > 0) {
      const latest = jindData[jindData.length - 1];
      priceInfo = `📍 **Jind Mandi (Latest)**:\n  Min: ₹${latest.minPrice}/quintal\n  Max: ₹${latest.maxPrice}/quintal\n  Modal: ₹${latest.modalPrice}/quintal\n  Date: ${latest.date}`;
    }

    let nationalInfo = '';
    const commKey = Object.keys(commodityPrices || {}).find(k => k.toLowerCase().includes(queryCrop));
    if (commKey) {
      const data = commodityPrices[commKey];
      const latest = data[data.length - 1];
      nationalInfo = `\n\n🇮🇳 **National Average (${latest.market}, ${latest.state})**:\n  Modal: ₹${latest.modalPrice}/quintal\n  Date: ${latest.date}`;
    }

    if (!priceInfo && !nationalInfo) {
      return { text: `I don't have price data for ${cropName} at the moment. Check the Market Intelligence page for all available commodities.`, suggestions: ['Show wheat prices', 'Market trends'] };
    }

    return {
      text: `💰 **${cropName} Price Information**:\n\n${priceInfo}${nationalInfo}\n\nFor detailed price predictions and trends, visit the Market Intelligence page.`,
      suggestions: ['Price prediction for ' + cropName, 'Demand outlook', 'Should I sell now?']
    };
  }

  async handleDemand(message, name) {
    const exportData = await loadData('export_product_timeseries');
    const importData = await loadData('import_product_timeseries');

    const topExports = Object.entries(exportData || {})
      .map(([product, data]) => {
        if (data.length < 2) return null;
        const recent = data[data.length - 1];
        const previous = data[data.length - 2];
        const growth = previous.qty > 0 ? ((recent.qty - previous.qty) / previous.qty * 100) : 0;
        return { product, growth: growth.toFixed(1), latestQty: recent.qty, latestValue: recent.value };
      })
      .filter(Boolean)
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 5);

    const exportList = topExports.map((e, i) => `${i + 1}. **${e.product}**: ${e.growth > 0 ? '↑' : '↓'} ${e.growth}% growth`).join('\n');

    return {
      text: `📊 **Agricultural Trade Trends**, ${name}:\n\n**Top Growing Exports**:\n${exportList}\n\nExport growth indicates strong international demand. Products with rising exports may see higher domestic prices.\n\nVisit Market Intelligence for detailed analysis.`,
      suggestions: ['Wheat export trend', 'Rice demand', 'Price prediction']
    };
  }

  async handleSoil(profile, name) {
    const soilType = profile?.soilType || 'Loamy';
    const cropSoilData = await loadData('crop_soil');

    const soilRecords = cropSoilData?.filter(r => r.soilType === soilType) || [];
    const avgN = soilRecords.length > 0 ? (soilRecords.reduce((s, r) => s + r.nitrogen, 0) / soilRecords.length).toFixed(0) : 'N/A';
    const avgP = soilRecords.length > 0 ? (soilRecords.reduce((s, r) => s + r.phosphorous, 0) / soilRecords.length).toFixed(0) : 'N/A';
    const avgK = soilRecords.length > 0 ? (soilRecords.reduce((s, r) => s + r.potassium, 0) / soilRecords.length).toFixed(0) : 'N/A';

    const commonFertilizers = {};
    soilRecords.forEach(r => { if (r.fertilizer) commonFertilizers[r.fertilizer] = (commonFertilizers[r.fertilizer] || 0) + 1; });
    const topFertilizers = Object.entries(commonFertilizers).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f);

    const soilInfo = {
      Sandy: { desc: 'Light texture, drains quickly, low water retention', tips: 'Add organic matter to improve water retention. Frequent but light irrigation recommended.' },
      Loamy: { desc: 'Balanced texture, good drainage and retention', tips: 'Ideal for most crops. Maintain organic matter levels with regular composting.' },
      Black: { desc: 'Heavy clay content, high water retention', tips: 'Good for cotton and soybeans. Avoid over-watering. Ensure proper drainage.' },
      Red: { desc: 'Iron-rich, moderate drainage', tips: 'Benefits from regular fertilization. Good for millets, groundnuts, and pulses.' },
      Clayey: { desc: 'Very fine texture, poor drainage', tips: 'Raised beds help drainage. Add sand/organic matter. Avoid working when wet.' },
    };

    const info = soilInfo[soilType] || soilInfo.Loamy;

    return {
      text: `🌱 **Soil Analysis for ${name}**:\n\n🪨 **Soil Type**: ${soilType}\n📝 ${info.desc}\n\n**Average Nutrient Levels** (from dataset):\n  Nitrogen (N): ${avgN}\n  Phosphorous (P): ${avgP}\n  Potassium (K): ${avgK}\n\n🧪 **Recommended Fertilizers**: ${topFertilizers.join(', ') || 'Check with local advisor'}\n\n💡 **Tips**: ${info.tips}`,
      suggestions: ['Crop for my soil', 'Irrigation advice', 'Fertilizer schedule']
    };
  }
}
