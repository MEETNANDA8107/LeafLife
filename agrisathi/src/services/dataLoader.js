const cache = new Map();

export async function loadData(name) {
  if (cache.has(name)) {
    return cache.get(name);
  }
  try {
    const response = await fetch(`/data/${name}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load data for ${name}`);
    }
    const data = await response.json();
    cache.set(name, data);
    return data;
  } catch (error) {
    console.error(`Error loading data ${name}:`, error);
    return null;
  }
}

export async function getCropRecommendationData() { return loadData('crop_recommendation'); }
export async function getCropSoilData() { return loadData('crop_soil'); }
export async function getJindMandiPrices() { return loadData('jind_mandi_prices'); }
export async function getCommodityPrices() { return loadData('commodity_prices'); }
export async function getCropHealthSummary() { return loadData('crop_health_summary'); }
export async function getMarketResearch() { return loadData('market_research'); }
export async function getFarmerAdvisor() { return loadData('farmer_advisor'); }
export async function getExportTimeSeries() { return loadData('export_product_timeseries'); }
export async function getImportTimeSeries() { return loadData('import_product_timeseries'); }
