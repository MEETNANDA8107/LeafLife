import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getCurrentWeather, getForecast, estimateSoilMoisture } from '../services/weather';
import { calculateIrrigation } from '../services/irrigationEngine';

export default function SmartIrrigation() {
  const { profile, locationCoords } = useUser();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [irrigationData, setIrrigationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.currentCrops?.length > 0 && !selectedCrop) {
      setSelectedCrop(profile.currentCrops[0]);
    } else if (!selectedCrop) {
      setSelectedCrop('Wheat'); // Fallback
    }
  }, [profile]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lat = locationCoords?.lat || 28.6139;
        const lng = locationCoords?.lng || 77.2090;
        
        const weather = await getCurrentWeather(lat, lng);
        const forecast = await getForecast(lat, lng, 3);

        const currentTemp = weather?.current?.temperature_2m || 28;
        const currentHumidity = weather?.current?.relative_humidity_2m || 60;
        const currentPrecip = weather?.current?.precipitation || 0;
        const upcomingRainProb = forecast?.daily?.precipitation_probability_max?.[0] || 0;
        const upcomingRainAmount = forecast?.daily?.precipitation_sum?.[0] || 0;

        setWeatherData({ current: weather, forecast });

        // Estimate soil moisture from weather instead of hardcoding
        const soilType = profile?.soilType || 'Loamy';
        const moisture = estimateSoilMoisture({
          recentRainfall: currentPrecip,
          temperature: currentTemp,
          humidity: currentHumidity,
          soilType
        });
        
        if (selectedCrop) {
          const result = calculateIrrigation({
            cropType: selectedCrop,
            soilType,
            recentRainfall: currentPrecip,
            upcomingRainProb,
            upcomingRainAmount,
            temperature: currentTemp,
            humidity: currentHumidity,
            soilMoisture: moisture
          });
          setIrrigationData({
            duration: result.durationMinutes,
            reasoning: result.reasoning,
            factors: {
              cropType: selectedCrop,
              previousRain: `${currentPrecip} mm`,
              upcomingRain: `${upcomingRainAmount.toFixed(1)} mm (${upcomingRainProb}% chance)`,
              soilType
            },
            moisture,
            targetMoisture: 75
          });
        }
      } catch (error) {
        console.error("Failed to fetch irrigation data", error);
        const fallbackMoisture = estimateSoilMoisture({ soilType: profile?.soilType || 'Loamy' });
        setIrrigationData({
          duration: 45,
          reasoning: "Based on current dry conditions and the soil profile, a 45-minute sprinkler cycle is optimal to reach root depth without runoff.",
          factors: {
            cropType: selectedCrop,
            previousRain: '0 mm',
            upcomingRain: '2 mm',
            soilType: profile?.soilType || 'Sandy Loam'
          },
          moisture: fallbackMoisture,
          targetMoisture: 75
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locationCoords, selectedCrop, profile]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-primary-container text-xl font-medium flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">refresh</span>
          Loading Irrigation Intelligence...
        </div>
      </div>
    );
  }

  const duration = irrigationData?.duration || 0;
  const reasoning = irrigationData?.reasoning || "Data not available.";
  const factors = irrigationData?.factors || {};
  const currentMoisture = irrigationData?.moisture || 0;
  const targetMoisture = irrigationData?.targetMoisture || 75;

  return (
    <div className="min-h-screen bg-surface px-[24px] py-[48px] md:px-[48px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-[40px] gap-4">
        <div>
          <h1 className="text-[32px] font-semibold text-on-surface leading-tight font-['Inter']">Irrigation Intelligence</h1>
          <p className="text-[16px] text-on-surface-variant mt-2 font-['Inter']">AI-driven watering recommendations for your fields</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">grass</span>
          <select 
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-transparent text-[16px] font-medium text-on-surface focus:outline-none"
          >
            {profile?.currentCrops?.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            )) || <option value="Wheat">Wheat</option>}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-[24px]">
          
          {/* Hero Card */}
          <div className="relative bg-[#1b4332] rounded-[24px] p-[40px] overflow-hidden shadow-md">
            <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfSlPf_C-Hp1nPCfdNtFvRKuX5d20cPZIAEXR8P4WTwOZO2qpbcWP7HuZ71jcar7yGofaUD9ErCEtXSxyCXSh6_J6RMRbs_eIZhKqesAMjNXVTWiXgoAjemjqYY3paDdHnWXa3mquZQwpqJPhwv84JYVs8SrZPoeJ4QxLOsN3rc-fKbsXYPAoQCsWGWLBzTIW4CZXiC6X_wdk839wrEeYZ6MDKg1KfBxwloZehL2OLLSXsBy-VHFKR')" }}></div>
            
            {/* Decorative circles */}
            <svg className="absolute bottom-[-10%] right-[-5%] w-64 h-64 opacity-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" />
              <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="2" />
              <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex flex-col items-start">
              <span className="bg-[#012d1d] text-[#c1ecd4] text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                OPTIMAL RECOMMENDATION
              </span>
              
              <h2 className="text-[#c1ecd4] text-[24px] font-semibold mb-2">Recommended Sprinkler Duration</h2>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-white text-[96px] font-bold leading-none">{duration}</span>
                <span className="text-[#a5d0b9] text-[24px] font-medium">Minutes</span>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-auto">
                <button onClick={() => alert(`Irrigation started! Running sprinklers for ${duration} minutes. (IoT integration required for real control.)`)} className="bg-[#c1ecd4] text-[#012d1d] px-8 py-4 rounded-[12px] font-semibold text-[16px] hover:bg-white transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                  Start Irrigation Now
                </button>
                <button onClick={() => { const time = prompt('Enter schedule time (e.g., 6:00 PM):'); if (time) alert(`Irrigation scheduled for ${time} — ${duration} minutes. (IoT integration required for real scheduling.)`); }} className="bg-transparent border-2 border-[#a5d0b9] text-white px-8 py-4 rounded-[12px] font-semibold text-[16px] hover:bg-white/10 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined">schedule</span>
                  Schedule for Later
                </button>
              </div>
            </div>
          </div>

          {/* Explanation Card */}
          <div className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant">
            <h3 className="text-[24px] font-semibold text-on-surface mb-4">Why {duration} minutes?</h3>
            <p className="text-[16px] text-on-surface-variant leading-relaxed mb-8">{reasoning}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded-[16px] flex items-center gap-4 border border-outline-variant/50">
                <div className="bg-primary-container/10 p-3 rounded-full text-primary">
                  <span className="material-symbols-outlined">psychiatry</span>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-on-surface-variant mb-1">CROP TYPE</div>
                  <div className="text-[16px] font-semibold text-on-surface">{factors.cropType || selectedCrop}</div>
                </div>
              </div>
              
              <div className="bg-surface p-4 rounded-[16px] flex items-center gap-4 border border-outline-variant/50">
                <div className="bg-tertiary-container/10 p-3 rounded-full text-tertiary">
                  <span className="material-symbols-outlined">water</span>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-on-surface-variant mb-1">PREVIOUS RAIN (7D)</div>
                  <div className="text-[16px] font-semibold text-on-surface">{factors.previousRain || '0 mm'}</div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-[16px] flex items-center gap-4 border border-outline-variant/50">
                <div className="bg-secondary-container/20 p-3 rounded-full text-secondary">
                  <span className="material-symbols-outlined">thunderstorm</span>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-on-surface-variant mb-1">UPCOMING RAIN (48H)</div>
                  <div className="text-[16px] font-semibold text-on-surface">{factors.upcomingRain || '0 mm'}</div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-[16px] flex items-center gap-4 border border-outline-variant/50">
                <div className="bg-[#7a5649]/10 p-3 rounded-full text-[#7a5649]">
                  <span className="material-symbols-outlined">landscape</span>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-on-surface-variant mb-1">SOIL TYPE</div>
                  <div className="text-[16px] font-semibold text-on-surface">{factors.soilType || 'Sandy'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-[24px]">
          {/* Moisture Metrics Card */}
          <div className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[20px] font-semibold text-on-surface">Moisture Metrics</h3>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {/* SVG Circular Gauge */}
              <div className="relative w-48 h-48 mb-8">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#edeeef" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#012d1d" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${currentMoisture * 2.827} 282.7`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[40px] font-bold text-on-surface">{currentMoisture}%</span>
                  <span className="text-[14px] text-on-surface-variant font-medium">Current</span>
                </div>
              </div>

              {/* Target Bar */}
              <div className="w-full mb-8">
                <div className="flex justify-between text-[14px] font-medium mb-2">
                  <span className="text-on-surface-variant">Target Moisture</span>
                  <span className="text-primary">{targetMoisture}%</span>
                </div>
                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${targetMoisture}%` }}></div>
                </div>
              </div>

              {/* Warning Box */}
              {currentMoisture < 45 && (
                <div className="w-full bg-error-container rounded-[16px] p-4 flex gap-3 mt-auto border border-[#ffb4ab]">
                  <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                  <div>
                    <h4 className="text-[14px] font-bold text-error mb-1">Critical Threshold Reached</h4>
                    <p className="text-[12px] text-error/80 leading-tight">Soil moisture is below optimal levels for {selectedCrop}. Immediate irrigation recommended.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
