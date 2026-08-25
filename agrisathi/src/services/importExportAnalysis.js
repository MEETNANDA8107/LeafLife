export function analyzeExports(exportData) {
  if (!exportData || !exportData.length) return { topProducts: [], growth: 0, trend: 'stable' };

  // Find top products by quantity
  const productTotals = {};
  exportData.forEach(d => {
    const name = d.product || d.commodity || 'Unknown';
    productTotals[name] = (productTotals[name] || 0) + (d.qty || d.value || 0);
  });
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // Calculate growth from first to last entry
  const first = exportData[0];
  const last = exportData[exportData.length - 1];
  const firstVal = first.qty || first.value || 0;
  const lastVal = last.qty || last.value || 0;
  const growth = firstVal > 0 ? parseFloat(((lastVal - firstVal) / firstVal * 100).toFixed(1)) : 0;

  return {
    topProducts,
    growth,
    trend: growth > 1 ? 'upward' : growth < -1 ? 'downward' : 'stable'
  };
}

export function analyzeImports(importData) {
  if (!importData || !importData.length) return { topProducts: [], growth: 0, trend: 'stable' };

  const productTotals = {};
  importData.forEach(d => {
    const name = d.product || d.commodity || 'Unknown';
    productTotals[name] = (productTotals[name] || 0) + (d.qty || d.value || 0);
  });
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const first = importData[0];
  const last = importData[importData.length - 1];
  const firstVal = first.qty || first.value || 0;
  const lastVal = last.qty || last.value || 0;
  const growth = firstVal > 0 ? parseFloat(((lastVal - firstVal) / firstVal * 100).toFixed(1)) : 0;

  return {
    topProducts,
    growth,
    trend: growth > 1 ? 'upward' : growth < -1 ? 'downward' : 'stable'
  };
}

export function getTradeBalance(product, exportData, importData) {
  if (!exportData || !importData) {
    return { product, netPosition: 'Unknown', value: 0 };
  }

  const exportTotal = (Array.isArray(exportData) ? exportData : [])
    .reduce((sum, d) => sum + (d.value || d.qty || 0), 0);
  const importTotal = (Array.isArray(importData) ? importData : [])
    .reduce((sum, d) => sum + (d.value || d.qty || 0), 0);

  return {
    product,
    netPosition: exportTotal > importTotal ? 'Surplus' : exportTotal < importTotal ? 'Deficit' : 'Balanced',
    value: Math.abs(exportTotal - importTotal)
  };
}

