import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DATASETS = path.resolve(ROOT, '..', 'datasets');
const IMPEXP = path.resolve(ROOT, '..', 'imp-exp_api', 'Dataset Agro Export Import India Kaggle');
const OUT = path.resolve(ROOT, 'public', 'data');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += c; }
  }
  result.push(current);
  return result;
}

function readCSV(filePath) {
  console.log(`  Reading: ${path.relative(ROOT, filePath)}`);
  const text = fs.readFileSync(filePath, 'utf-8');
  return parseCSV(text);
}

function writeJSON(filename, data) {
  const fp = path.join(OUT, filename);
  fs.writeFileSync(fp, JSON.stringify(data));
  const size = (fs.statSync(fp).size / 1024).toFixed(1);
  console.log(`  ✓ Written: ${filename} (${size} KB, ${Array.isArray(data) ? data.length + ' records' : 'object'})`);
}

// 1. Crop Recommendation Dataset
console.log('\n[1/9] Crop Recommendation Dataset...');
const cropRec = readCSV(path.join(DATASETS, 'Crop Recommendation Dataset', 'Crop_Recommendation.csv'));
const cropRecClean = cropRec.map(r => ({
  N: +r.Nitrogen, P: +r.Phosphorus, K: +r.Potassium,
  temperature: +r.Temperature, humidity: +r.Humidity,
  ph: +r.pH_Value, rainfall: +r.Rainfall, crop: r.Crop
}));
writeJSON('crop_recommendation.json', cropRecClean);

// 2. Crop and Soil Dataset
console.log('\n[2/9] Crop and Soil Dataset...');
const cropSoil = readCSV(path.join(DATASETS, 'Crop and Soil Dataset', 'data_core.csv'));
const cropSoilClean = cropSoil.map(r => ({
  temperature: +r.Temparature, humidity: +r.Humidity, moisture: +r.Moisture,
  soilType: r['Soil Type'], cropType: r['Crop Type'],
  nitrogen: +r.Nitrogen, potassium: +r.Potassium, phosphorous: +r.Phosphorous,
  fertilizer: r['Fertilizer Name']
}));
writeJSON('crop_soil.json', cropSoilClean);

// 3. Jind District Mandi Prices
console.log('\n[3/9] Jind District Mandi Prices...');
const jind = readCSV(path.join(DATASETS, 'Agro Price Insights Jind District Mandi Data, India - Haryana', 'JIND_Variety-wise Daily Market Prices Data of Commodity.csv'));
const jindClean = jind.map(r => ({
  state: r.State, district: r.District, market: r.Market,
  commodity: r.Commodity, variety: r.Variety, grade: r.Grade,
  date: r.Arrival_Date,
  minPrice: +r.Min_Price, maxPrice: +r.Max_Price, modalPrice: +r.Modal_Price,
  code: r.Commodity_Code
})).sort((a, b) => {
  const da = a.date.split('/').reverse().join('-');
  const db = b.date.split('/').reverse().join('-');
  return da.localeCompare(db);
});
const jindByCommodity = {};
jindClean.forEach(r => {
  if (!jindByCommodity[r.commodity]) jindByCommodity[r.commodity] = [];
  jindByCommodity[r.commodity].push(r);
});
writeJSON('jind_mandi_prices.json', jindByCommodity);

// 4. Daily Wholesale Commodity Prices
console.log('\n[4/9] Daily Wholesale Commodity Prices...');
const wholesale = readCSV(path.join(DATASETS, 'Daily Wholesale Commodity Prices - India Mandis', 'commodity_price.csv'));
const wholesaleClean = wholesale.map(r => ({
  state: r.State, district: r.District, market: r.Market,
  commodity: r.Commodity, variety: r.Variety, grade: r.Grade,
  date: r.Arrival_Date,
  minPrice: +(r['Min_x0020_Price'] || r.Min_Price || 0),
  maxPrice: +(r['Max_x0020_Price'] || r.Max_Price || 0),
  modalPrice: +(r['Modal_x0020_Price'] || r.Modal_Price || 0)
}));
const wholesaleByCommodity = {};
wholesaleClean.forEach(r => {
  if (!wholesaleByCommodity[r.commodity]) wholesaleByCommodity[r.commodity] = [];
  wholesaleByCommodity[r.commodity].push(r);
});
writeJSON('commodity_prices.json', wholesaleByCommodity);

// 5. Crop Health - summarize only (212K rows is too big)
console.log('\n[5/9] Crop Health & Environmental Stress (summarizing 212K rows)...');
const healthFile = path.join(DATASETS, 'Crop Health and Environmental Stress Dataset', 'agriculture_dataset.csv');
const healthText = fs.readFileSync(healthFile, 'utf-8');
const healthLines = healthText.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim());
const healthHeaders = parseCSVLine(healthLines[0]);
const cropTypeIdx = healthHeaders.indexOf('Crop_Type');
const stressIdx = healthHeaders.indexOf('Crop_Stress_Indicator');
const yieldIdx = healthHeaders.indexOf('Expected_Yield');
const healthLabelIdx = healthHeaders.indexOf('Crop_Health_Label');
const tempIdx = healthHeaders.indexOf('Temperature');
const humIdx = healthHeaders.indexOf('Humidity');
const rainIdx = healthHeaders.indexOf('Rainfall');
const soilMoistIdx = healthHeaders.indexOf('Soil_Moisture');
const soilPhIdx = healthHeaders.indexOf('Soil_pH');

const healthSummary = {};
for (let i = 1; i < healthLines.length; i++) {
  const vals = parseCSVLine(healthLines[i]);
  const crop = vals[cropTypeIdx];
  if (!crop) continue;
  if (!healthSummary[crop]) {
    healthSummary[crop] = { count: 0, stress: 0, yield: 0, healthy: 0, unhealthy: 0,
      temp: 0, humidity: 0, rainfall: 0, soilMoisture: 0, soilPh: 0 };
  }
  const s = healthSummary[crop];
  s.count++;
  s.stress += +(vals[stressIdx] || 0);
  s.yield += +(vals[yieldIdx] || 0);
  s.temp += +(vals[tempIdx] || 0);
  s.humidity += +(vals[humIdx] || 0);
  s.rainfall += +(vals[rainIdx] || 0);
  s.soilMoisture += +(vals[soilMoistIdx] || 0);
  s.soilPh += +(vals[soilPhIdx] || 0);
  if (+vals[healthLabelIdx] === 1) s.healthy++; else s.unhealthy++;
}
const healthResult = Object.entries(healthSummary).map(([crop, s]) => ({
  crop, count: s.count,
  avgStress: +(s.stress / s.count).toFixed(2),
  avgYield: +(s.yield / s.count).toFixed(2),
  healthRate: +((s.healthy / s.count) * 100).toFixed(1),
  avgTemp: +(s.temp / s.count).toFixed(1),
  avgHumidity: +(s.humidity / s.count).toFixed(1),
  avgRainfall: +(s.rainfall / s.count).toFixed(1),
  avgSoilMoisture: +(s.soilMoisture / s.count).toFixed(1),
  avgSoilPh: +(s.soilPh / s.count).toFixed(2)
}));
writeJSON('crop_health_summary.json', healthResult);

// 6. Market Research
console.log('\n[6/9] Market Research Dataset...');
const market = readCSV(path.join(DATASETS, 'AI for Sustainable Agriculture Dataset', 'market_researcher_dataset.csv'));
const marketClean = market.map(r => ({
  id: +r.Market_ID, product: r.Product,
  price: +r.Market_Price_per_ton, demandIndex: +r.Demand_Index,
  supplyIndex: +r.Supply_Index, competitorPrice: +r.Competitor_Price_per_ton,
  economicIndicator: +r.Economic_Indicator, weatherImpact: +r.Weather_Impact_Score,
  seasonalFactor: r.Seasonal_Factor, consumerTrend: +r.Consumer_Trend_Index
}));
writeJSON('market_research.json', marketClean);

// 7. Farmer Advisor
console.log('\n[7/9] Farmer Advisor Dataset...');
const farmer = readCSV(path.join(DATASETS, 'AI for Sustainable Agriculture Dataset', 'farmer_advisor_dataset.csv'));
const farmerClean = farmer.map(r => ({
  id: +r.Farm_ID, soilPh: +r.Soil_pH, soilMoisture: +r.Soil_Moisture,
  temperature: +r.Temperature_C, rainfall: +r.Rainfall_mm,
  cropType: r.Crop_Type, fertilizer: +r.Fertilizer_Usage_kg,
  pesticide: +r.Pesticide_Usage_kg, yield: +r.Crop_Yield_ton,
  sustainability: +r.Sustainability_Score
}));
writeJSON('farmer_advisor.json', farmerClean);

// 8. Export Product Time Series
console.log('\n[8/9] Export Product Time Series...');
const exportTSDir = path.join(IMPEXP, 'Export', 'Product-Wise-Time-Series');
const exportTS = {};
if (fs.existsSync(exportTSDir)) {
  fs.readdirSync(exportTSDir).filter(f => f.endsWith('.csv')).forEach(f => {
    const product = f.replace('.csv', '');
    const data = readCSV(path.join(exportTSDir, f));
    exportTS[product] = data.map(r => ({
      year: r.Year, qty: +r['Qty(MT)'] || 0, value: +r['Rs(Crore)'] || 0,
      shareQty: +r['% Share(Qty)'] || 0, shareValue: +r['% Share(Rs)'] || 0
    }));
  });
}
writeJSON('export_product_timeseries.json', exportTS);

// 9. Import Product Time Series
console.log('\n[9/9] Import Product Time Series...');
const importTSDir = path.join(IMPEXP, 'Import', 'Product-Wise-Time-Series');
const importTS = {};
if (fs.existsSync(importTSDir)) {
  fs.readdirSync(importTSDir).filter(f => f.endsWith('.csv')).forEach(f => {
    const product = f.replace('.csv', '');
    const data = readCSV(path.join(importTSDir, f));
    importTS[product] = data.map(r => ({
      year: r.Year, qty: +r['Qty(MT)'] || 0, value: +r['Rs(Crore)'] || 0,
      shareQty: +r['% Share(Qty)'] || 0, shareValue: +r['% Share(Rs)'] || 0
    }));
  });
}
writeJSON('import_product_timeseries.json', importTS);

console.log('\n✅ All datasets preprocessed successfully!\n');
