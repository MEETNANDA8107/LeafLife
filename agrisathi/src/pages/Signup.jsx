import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', email: '', password: '', confirmPassword: '',
    state: '', district: '', village: '', pinCode: '',
    farmArea: '', areaUnit: 'Acres', soilType: '', irrigationType: '',
    currentCrops: [], cropSeason: '', sowingDate: '', previousCrops: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [detecting, setDetecting] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
          const data = await rev.json();
          if (data.address) {
            setFormData(prev => ({
              ...prev,
              state: data.address.state || '',
              district: data.address.state_district || data.address.county || '',
              village: data.address.village || data.address.town || data.address.city || '',
              pinCode: data.address.postcode || ''
            }));
          }
        } catch {
          setError('Failed to detect location. Please enter manually.');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setError('Location permission denied. Please enter manually.');
        setDetecting(false);
      }
    );
  };

  const states = [
    'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 'Jharkhand', 
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const soilTypes = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
  const irrigationTypes = ['Sprinkler', 'Drip', 'Canal', 'Rainfed', 'Well', 'Borewell'];
  const cropList = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Tomato', 'Groundnut', 'Barley', 'Millets', 'Pulses', 'Mustard', 'Potato', 'Onion'];

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.fullName || !formData.mobile || !formData.password) {
        setError('Please fill all required fields');
        return;
      }
      if (formData.mobile.length !== 10) {
        setError('Mobile number must be 10 digits');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const toggleCrop = (crop, type) => {
    const list = formData[type];
    if (list.includes(crop)) {
      setFormData({ ...formData, [type]: list.filter(c => c !== crop) });
    } else {
      setFormData({ ...formData, [type]: [...list, crop] });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <div className="bg-surface-container-lowest w-full max-w-[560px] rounded-2xl shadow-xl z-10 border border-surface-container">
        
        {/* Progress Bar */}
        <div className="flex h-2 bg-surface-container rounded-t-2xl overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`flex-1 ${i <= step ? 'bg-primary' : ''} ${i < 5 ? 'border-r border-surface-container/20' : ''}`} />
          ))}
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-headline-md font-bold text-on-surface mb-2">Create Account</h1>
            <p className="text-body-md text-on-surface/60">Step {step} of 5: {
              ['Basic Info', 'Location', 'Farm Details', 'Crop Information', 'Review Details'][step-1]
            }</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#FFDAD6] text-[#BA1A1A] rounded-lg text-body-md flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">error</span>
              {error}
            </div>
          )}

          <div className="min-h-[360px]">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-1">Full Name *</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-1">Mobile Number *</label>
                  <div className="flex gap-2">
                    <div className="px-4 py-3 bg-surface-container rounded-lg flex items-center text-on-surface font-medium">+91</div>
                    <input type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="flex-1 px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="10-digit number" />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-1">Email Address (Optional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="Enter email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-1">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-1">Confirm *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/50"><span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <button onClick={detectLocation} disabled={detecting} className="w-full py-3 border-2 border-primary border-dashed rounded-lg text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors mb-2 disabled:opacity-50">
                  <span className={`material-symbols-outlined ${detecting ? 'animate-spin' : ''}`}>{detecting ? 'refresh' : 'my_location'}</span>
                  {detecting ? 'Detecting...' : 'Detect Location Automatically'}
                </button>
                <div className="text-center text-on-surface/50 text-label-sm font-bold my-2">OR ENTER MANUALLY</div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-1">State</label>
                  <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary appearance-none">
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-1">District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="Enter District" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-1">Village/City</label>
                    <input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="Village" />
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-1">PIN Code</label>
                    <input type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="PIN Code" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-1">Farm Area</label>
                  <div className="flex gap-2">
                    <input type="number" value={formData.farmArea} onChange={e => setFormData({...formData, farmArea: e.target.value})} className="flex-1 px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary" placeholder="Size" />
                    <select value={formData.areaUnit} onChange={e => setFormData({...formData, areaUnit: e.target.value})} className="px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary">
                      <option>Acres</option><option>Hectares</option><option>Bigha</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-2">Soil Type</label>
                  <div className="flex flex-wrap gap-2">
                    {soilTypes.map(soil => (
                      <button key={soil} onClick={() => setFormData({...formData, soilType: soil})} className={`px-4 py-2 rounded-full border text-label-md font-medium transition-colors ${formData.soilType === soil ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-container text-on-surface/70 hover:bg-surface-container'}`}>
                        {soil}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-2">Irrigation Type</label>
                  <div className="flex flex-wrap gap-2">
                    {irrigationTypes.map(irr => (
                      <button key={irr} onClick={() => setFormData({...formData, irrigationType: irr})} className={`px-4 py-2 rounded-full border text-label-md font-medium transition-colors ${formData.irrigationType === irr ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-container text-on-surface/70 hover:bg-surface-container'}`}>
                        {irr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-2">Current Crop(s)</label>
                  <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
                    {cropList.map(crop => (
                      <button key={crop} onClick={() => toggleCrop(crop, 'currentCrops')} className={`px-3 py-1.5 rounded-full border text-label-sm font-medium transition-colors ${formData.currentCrops.includes(crop) ? 'bg-[#71F29B] text-primary border-[#71F29B]' : 'bg-surface border-surface-container text-on-surface/70 hover:bg-surface-container'}`}>
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-1">Crop Season</label>
                    <select value={formData.cropSeason} onChange={e => setFormData({...formData, cropSeason: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary">
                      <option value="">Select</option><option>Kharif</option><option>Rabi</option><option>Zaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-1">Sowing Date</label>
                    <input type="date" value={formData.sowingDate} onChange={e => setFormData({...formData, sowingDate: e.target.value})} className="w-full px-4 py-3 bg-surface border border-surface-container rounded-lg outline-none focus:border-primary text-body-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface mb-2">Previous Crop(s) (Optional)</label>
                  <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto p-1">
                    {cropList.slice(0, 8).map(crop => (
                      <button key={crop} onClick={() => toggleCrop(crop, 'previousCrops')} className={`px-3 py-1.5 rounded-full border text-label-sm font-medium transition-colors ${formData.previousCrops.includes(crop) ? 'bg-surface-container text-on-surface border-on-surface/20' : 'bg-surface border-surface-container text-on-surface/70 hover:bg-surface-container'}`}>
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-in fade-in overflow-y-auto max-h-[400px] pr-2">
                <div className="bg-surface p-4 rounded-xl border border-surface-container relative">
                  <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-primary font-bold text-label-sm">Edit</button>
                  <h3 className="text-label-md font-bold text-on-surface/60 mb-2 uppercase">Basic Info</h3>
                  <p className="text-body-md font-bold">{formData.fullName}</p>
                  <p className="text-body-md text-on-surface/80">+91 {formData.mobile}</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-surface-container relative">
                  <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-primary font-bold text-label-sm">Edit</button>
                  <h3 className="text-label-md font-bold text-on-surface/60 mb-2 uppercase">Location</h3>
                  <p className="text-body-md">{[formData.village, formData.district, formData.state].filter(Boolean).join(', ')}</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-surface-container relative">
                  <button onClick={() => setStep(3)} className="absolute top-4 right-4 text-primary font-bold text-label-sm">Edit</button>
                  <h3 className="text-label-md font-bold text-on-surface/60 mb-2 uppercase">Farm Profile</h3>
                  <p className="text-body-md">{formData.farmArea} {formData.areaUnit} • {formData.soilType} Soil</p>
                  <p className="text-body-md text-on-surface/80">{formData.irrigationType} Irrigation</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-surface-container relative">
                  <button onClick={() => setStep(4)} className="absolute top-4 right-4 text-primary font-bold text-label-sm">Edit</button>
                  <h3 className="text-label-md font-bold text-on-surface/60 mb-2 uppercase">Crops</h3>
                  <p className="text-body-md font-bold text-primary">{formData.currentCrops.join(', ') || 'None selected'}</p>
                  <p className="text-body-md text-on-surface/80">{formData.cropSeason} Season</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8 pt-4 border-t border-surface-container">
            {step > 1 && (
              <button onClick={handleBack} className="px-6 py-3 border border-surface-container rounded-lg font-bold text-on-surface hover:bg-surface-container transition-colors">
                Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={handleNext} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-bold transition-colors shadow-md">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} className="flex-1 py-3 bg-[#71F29B] hover:bg-[#5cd481] text-primary rounded-lg font-bold transition-colors shadow-md">
                Create Account
              </button>
            )}
          </div>
          
          {step === 1 && (
            <div className="text-center mt-6">
              <p className="text-body-md text-on-surface/70">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Signup;
