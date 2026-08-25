import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getCurrentWeather, getForecast, weatherCodeToDescription, estimateSoilMoisture } from '../services/weather';
import { calculateIrrigation } from '../services/irrigationEngine';
import { recommendCrops } from '../services/cropRecommender';
import { predictPrices } from '../services/pricePrediction';
import { loadData } from '../services/dataLoader';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, locationCoords } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [irrigationData, setIrrigationData] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const lat = locationCoords?.lat || 20.5937;
        const lng = locationCoords?.lng || 78.9629;
        const crop = profile?.currentCrops?.[0] || 'Wheat';
        const soil = profile?.soilType || 'Loamy';

        // Fetch weather
        let currentTemp = 28, currentCondition = 'Sunny', currentIcon = 'light_mode',
          currentHumidity = 60, currentPrecip = 0;
        try {
          const w = await getCurrentWeather(lat, lng);
          if (w?.current) {
            currentTemp = Math.round(w.current.temperature_2m);
            currentHumidity = w.current.relative_humidity_2m;
            currentPrecip = w.current.precipitation || 0;
            const desc = weatherCodeToDescription(w.current.weather_code);
            currentCondition = desc.desc;
            currentIcon = desc.icon;
          }
        } catch (e) { console.warn('Weather fetch failed', e); }

        setWeatherData({ temp: currentTemp, condition: currentCondition, icon: currentIcon, humidity: currentHumidity, precip: currentPrecip });

        // Fetch 3-day forecast
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let fDays = [];
        try {
          const f = await getForecast(lat, lng, 3);
          if (f?.daily?.time) {
            fDays = f.daily.time.map((date, i) => {
              const d = new Date(date);
              const desc = weatherCodeToDescription(f.daily.weather_code[i]);
              return {
                day: dayNames[d.getDay()],
                temp: Math.round((f.daily.temperature_2m_max[i] + f.daily.temperature_2m_min[i]) / 2),
                icon: desc.icon,
                rainProb: f.daily.precipitation_probability_max?.[i] || 0,
                rainAmount: f.daily.precipitation_sum?.[i] || 0
              };
            });
          }
        } catch (e) { console.warn('Forecast fetch failed', e); }
        if (fDays.length === 0) {
          fDays = [
            { day: 'Mon', temp: currentTemp - 1, icon: 'light_mode', rainProb: 10, rainAmount: 0 },
            { day: 'Tue', temp: currentTemp, icon: 'cloud', rainProb: 30, rainAmount: 2 },
            { day: 'Wed', temp: currentTemp + 1, icon: 'light_mode', rainProb: 5, rainAmount: 0 }
          ];
        }
        setForecastData(fDays);

        // Estimate soil moisture from weather data
        const estMoisture = estimateSoilMoisture({
          recentRainfall: currentPrecip,
          temperature: currentTemp,
          humidity: currentHumidity,
          soilType: soil
        });

        // Irrigation
        const irrigResult = calculateIrrigation({
          cropType: crop, soilType: soil,
          recentRainfall: currentPrecip,
          upcomingRainProb: fDays[0]?.rainProb || 0,
          upcomingRainAmount: fDays[0]?.rainAmount || 0,
          temperature: currentTemp, humidity: currentHumidity,
          soilMoisture: estMoisture
        });
        setIrrigationData({
          duration: irrigResult.durationMinutes,
          time: '6 PM',
          rainStatus: fDays[0]?.rainProb > 50 ? 'Rain expected later' : 'No rain expected'
        });

        // Crop recommendation
        try {
          const recs = await recommendCrops({
            temperature: currentTemp, humidity: currentHumidity,
            ph: 6.5, rainfall: currentPrecip || 100,
            N: 50, P: 30, K: 40
          });
          if (recs && recs.length > 0) {
            setCropData({ name: recs[0].crop, recommendationText: recs[0].reason || recs[0].recommendationText });
          } else {
            setCropData({ name: crop, recommendationText: 'Optimal planting window is approaching for your soil type.' });
          }
        } catch (e) {
          setCropData({ name: crop, recommendationText: 'Optimal planting window is approaching for your soil type.' });
        }

        // Market data
        try {
          const jindPrices = await loadData('jind_mandi_prices');
          const commodityKeys = Object.keys(jindPrices || {});
          const targetKey = commodityKeys.find(k => k.toLowerCase().includes(crop.toLowerCase())) || commodityKeys[0];
          const priceHistory = (jindPrices?.[targetKey] || []).slice(-30);

          if (priceHistory.length > 2) {
            const historicalForPrediction = priceHistory.map(p => ({ date: p.date, price: p.modalPrice }));
            const prediction = predictPrices(historicalForPrediction);
            const recent6 = priceHistory.slice(-6).map(p => p.modalPrice);
            setMarketData({
              commodity: targetKey || crop,
              change: (prediction.changePercent > 0 ? '+' : '') + prediction.changePercent + '%',
              recommendation: prediction.direction === 'up' ? 'Hold stock, prices rising.' : prediction.direction === 'down' ? 'Consider selling soon.' : 'Market stable, hold position.',
              chartData: recent6
            });
          } else {
            setMarketData({ commodity: crop, change: '+2.4%', recommendation: 'Hold for another week, prices trending up.', chartData: [120, 125, 123, 130, 135, 142] });
          }
        } catch (e) {
          setMarketData({ commodity: crop, change: '+2.4%', recommendation: 'Hold for another week.', chartData: [120, 125, 123, 130, 135, 142] });
        }

        // Activity feed
        const newActivities = [];
        if (irrigResult.durationMinutes > 0) {
          newActivities.push({
            id: 1, icon: 'water_drop', iconColor: 'text-blue-600',
            title: 'Irrigation Recommended',
            time: 'Just now',
            description: `Schedule sprinklers for ${irrigResult.durationMinutes} mins based on soil moisture analysis.`
          });
        }
        newActivities.push({
          id: 2, icon: 'thermostat', iconColor: 'text-orange-500',
          title: 'Weather Update',
          time: '1 hour ago',
          description: `${currentCondition} at ${currentTemp}°C with ${currentHumidity}% humidity.`
        });
        newActivities.push({
          id: 3, icon: 'trending_up', iconColor: 'text-green-700',
          title: 'Market Alert',
          time: '3 hours ago',
          description: `Check latest mandi prices for your crops.`
        });
        setActivities(newActivities);

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locationCoords, profile]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const marketChartData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [{
      data: marketData?.chartData || [],
      backgroundColor: '#1b4332',
      borderRadius: 6,
      barPercentage: 0.6,
    }]
  };

  const marketChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-[48px] animate-pulse space-y-8 min-h-screen bg-[#f8f9fa]">
        <div className="h-14 bg-[#edeeef] w-1/3 rounded-xl" />
        <div className="h-5 bg-[#edeeef] w-1/4 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-[#edeeef] rounded-[16px]" />
          ))}
        </div>
        <div className="h-48 bg-[#edeeef] rounded-[24px] w-full max-w-3xl mt-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-[64px] text-[#ba1a1a] mb-4">error</span>
        <h2 className="text-[24px] font-semibold mb-2 text-[#191c1d]">Something went wrong</h2>
        <p className="mb-6 text-[#414844]">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-[#012d1d] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1b4332] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-[48px] bg-[#f8f9fa] min-h-screen font-['Inter'] text-[#191c1d]">
      {/* Header */}
      <header className="mb-10 fade-in">
        <h1 className="text-[32px] md:text-[48px] font-bold leading-tight tracking-tight">
          {getGreeting()}, {profile?.fullName || user?.fullName || 'Farmer'}.
        </h1>
        <p className="text-[18px] text-[#414844] mt-2">Here's your farm's outlook for today.</p>
      </header>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px] mb-12">

        {/* Card 1 - Local Weather */}
        <div className="relative group bg-[#edeeef] rounded-[16px] p-6 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#94ccff] opacity-20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 mb-5 text-[#414844]">
            <span className="text-[12px] font-semibold tracking-[0.05em]">LOCAL WEATHER</span>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-[#003f63] text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{weatherData?.icon || 'light_mode'}</span>
            </div>
            <div>
              <div className="text-[32px] font-bold leading-none">{weatherData?.temp}°C</div>
              <div className="text-[14px] text-[#414844] mt-1">{weatherData?.condition}</div>
            </div>
          </div>
          <div className="flex justify-between mt-auto pt-4 border-t border-[#c1c8c2]/40">
            {forecastData.slice(0, 3).map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[12px] font-semibold text-[#414844]">{day.day}</span>
                <span className="material-symbols-outlined text-[20px] text-[#012d1d]" style={{ fontVariationSettings: "'FILL' 1" }}>{day.icon}</span>
                <span className="text-[14px] font-medium">{day.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 - Irrigation Alert */}
        <Link to="/irrigation" className="relative group bg-[#012d1d] text-white rounded-[16px] p-6 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1b4332] opacity-60 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#fdcdbc]">ACTION NEEDED</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1b4332] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[#a5d0b9]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <h3 className="text-[20px] font-semibold">Irrigation Alert</h3>
          </div>
          <p className="text-[14px] text-[#a5d0b9] mb-6 flex-grow leading-relaxed">
            Sprinklers suggested for <strong className="text-white">{irrigationData?.duration} mins</strong> at {irrigationData?.time}. {irrigationData?.rainStatus}.
          </p>
          <div className="bg-[#c1ecd4] hover:bg-[#a5d0b9] text-[#012d1d] py-3 rounded-xl font-semibold transition-colors z-10 text-center text-[14px]">
            Activate Now
          </div>
        </Link>

        {/* Card 3 - Crop Suggestion */}
        <div className="relative group bg-[#edeeef] rounded-[16px] p-6 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white opacity-50 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center gap-2 mb-4 text-[#414844]">
            <span className="text-[12px] font-semibold tracking-[0.05em]">INTELLIGENCE</span>
            <span className="material-symbols-outlined text-[16px] text-[#012d1d]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <h3 className="text-[20px] font-semibold mb-4">Crop Suggestion</h3>
          <div className="border-l-4 border-[#012d1d] pl-4 py-2 mb-6 flex-grow bg-white/50 rounded-r-lg">
            <p className="text-[14px] font-semibold text-[#191c1d] mb-1">{cropData?.name}</p>
            <p className="text-[13px] text-[#414844] leading-relaxed">{cropData?.recommendationText}</p>
          </div>
          <Link to="/weather" className="text-[#012d1d] font-semibold text-[14px] flex items-center gap-1 hover:gap-2 transition-all mt-auto">
            View Yield Projections <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {/* Card 4 - Market Tip */}
        <Link to="/market" className="relative group bg-[#edeeef] rounded-[16px] p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer">
          <div className="flex items-center gap-2 mb-4 text-[#414844]">
            <span className="text-[12px] font-semibold tracking-[0.05em]">MARKET INSIGHT</span>
            <span className="material-symbols-outlined text-[16px] text-[#012d1d]">trending_up</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[20px] font-semibold">{marketData?.commodity}</h3>
            <span className={`px-3 py-1 rounded-lg text-[12px] font-bold ${
              marketData?.change?.startsWith('+') ? 'bg-[#012d1d] text-white' : 'bg-[#ffdad6] text-[#ba1a1a]'
            }`}>
              {marketData?.change}
            </span>
          </div>
          <p className="text-[13px] text-[#414844] mb-4 flex-grow leading-relaxed">{marketData?.recommendation}</p>
          <div className="h-16 w-full mt-auto">
            <Bar data={marketChartData} options={marketChartOptions} />
          </div>
        </Link>
      </div>

      {/* Activity Feed */}
      <section className="bg-white rounded-[24px] p-6 md:p-8 max-w-4xl shadow-sm border border-[#c1c8c2]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[24px] font-semibold text-[#191c1d]">Recent Activity & Alerts</h2>
          <button className="text-[#012d1d] font-semibold text-[14px] hover:underline flex items-center gap-1">
            View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
        <div className="space-y-5">
          {activities.map((item) => (
            <div key={item.id} className="flex gap-4 items-start group">
              <div className="w-11 h-11 rounded-full bg-[#edeeef] flex items-center justify-center flex-shrink-0 group-hover:bg-[#1b4332] group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div className="flex-grow pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-[15px]">{item.title}</h4>
                  <span className="text-[12px] text-[#414844] whitespace-nowrap ml-4">{item.time}</span>
                </div>
                <p className="text-[14px] text-[#414844] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
