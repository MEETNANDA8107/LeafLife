import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

// Normalize flat profile (from Signup) into the nested shape Settings needs
function normalizeProfile(p) {
  if (!p) return null;
  return {
    name: p.fullName || p.name || '',
    mobile: p.mobile || '',
    email: p.email || '',
    location: {
      state: p.state || p.location?.state || '',
      district: p.district || p.location?.district || '',
      village: p.village || p.location?.village || '',
      pin: p.pinCode || p.location?.pin || ''
    },
    farm: {
      area: p.farmArea || p.farm?.area || '',
      unit: p.areaUnit || p.farm?.unit || 'Acres',
      soilType: p.soilType || p.farm?.soilType || '',
      irrigationType: p.irrigationType || p.farm?.irrigationType || ''
    },
    crops: {
      current: p.currentCrops || p.crops?.current || [],
      season: p.cropSeason || p.crops?.season || '',
      sowingDate: p.sowingDate || p.crops?.sowingDate || ''
    },
    preferences: p.preferences || { language: 'English', currency: 'INR ₹', units: 'Metric' }
  };
}

// Flatten nested Settings shape back to the flat profile shape the rest of the app uses
function flattenProfile(nested) {
  return {
    fullName: nested.name,
    name: nested.name,
    mobile: nested.mobile,
    email: nested.email,
    state: nested.location?.state,
    district: nested.location?.district,
    village: nested.location?.village,
    pinCode: nested.location?.pin,
    farmArea: nested.farm?.area,
    areaUnit: nested.farm?.unit,
    soilType: nested.farm?.soilType,
    irrigationType: nested.farm?.irrigationType,
    currentCrops: nested.crops?.current || [],
    cropSeason: nested.crops?.season,
    sowingDate: nested.crops?.sowingDate,
    preferences: nested.preferences
  };
}

const CROP_LIST = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Tomato', 'Groundnut', 'Barley', 'Millets', 'Pulses', 'Mustard', 'Potato', 'Onion'];

export default function Settings() {
  const { profile, updateProfile } = useUser();
  const [activeSection, setActiveSection] = useState('account');
  const [editMode, setEditMode] = useState({});
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [formData, setFormData] = useState(() => {
    const normalized = normalizeProfile(profile);
    return normalized || {
      name: 'Farmer Name',
      mobile: '+91 9876543210',
      email: 'farmer@example.com',
      location: { state: '', district: '', village: '', pin: '' },
      farm: { area: '', unit: 'Acres', soilType: 'Loamy', irrigationType: 'Canal' },
      crops: { current: [], season: 'Rabi', sowingDate: '' },
      preferences: { language: 'English', currency: 'INR ₹', units: 'Metric' }
    };
  });

  const toggleEdit = (section) => {
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async (section) => {
    // Flatten the nested form data back to flat profile shape and update
    if (updateProfile) {
      const flatData = flattenProfile(formData);
      await updateProfile(flatData);
    }
    toggleEdit(section);
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && !Array.isArray(prev[section]) 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const removeCrop = (cropToRemove) => {
    setFormData(prev => ({
      ...prev,
      crops: {
        ...prev.crops,
        current: prev.crops.current.filter(c => c !== cropToRemove)
      }
    }));
  };

  const addCrop = (crop) => {
    setFormData(prev => ({
      ...prev,
      crops: {
        ...prev.crops,
        current: prev.crops.current.includes(crop) ? prev.crops.current : [...prev.crops.current, crop]
      }
    }));
    setShowCropPicker(false);
  };

  const navItems = [
    { id: 'account', label: 'Account', icon: 'person' },
    { id: 'location', label: 'Location', icon: 'location_on' },
    { id: 'farm', label: 'Farm Details', icon: 'agriculture' },
    { id: 'crops', label: 'Crops', icon: 'grass' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'preferences', label: 'Preferences', icon: 'settings_suggest' },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface px-[24px] py-[48px] md:px-[48px]">
      {/* Header */}
      <div className="mb-[40px]">
        <h1 className="text-[32px] font-semibold text-on-surface leading-tight font-['Inter']">Account Settings</h1>
        <p className="text-[16px] text-on-surface-variant mt-2 font-['Inter']">Manage your farm profile, security, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] relative">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3">
          <div className="sticky top-[40px] flex flex-col gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[16px] font-medium transition-colors text-left ${activeSection === item.id ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="lg:col-span-9 flex flex-col gap-[32px] pb-[100px]">
          
          {/* 1. Account Section */}
          <section id="account" className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant scroll-mt-[40px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface">Account Details</h2>
              {!editMode.account && (
                <button onClick={() => toggleEdit('account')} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-[14px] hover:bg-primary/20 transition-colors">Edit</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Full Name</label>
                {editMode.account ? (
                  <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', null, e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.name}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Mobile Number</label>
                {editMode.account ? (
                  <input type="text" value={formData.mobile || ''} onChange={(e) => handleChange('mobile', null, e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.mobile}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Email Address</label>
                {editMode.account ? (
                  <input type="email" value={formData.email || ''} onChange={(e) => handleChange('email', null, e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.email}</div>
                )}
              </div>
            </div>
            
            {editMode.account && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => toggleEdit('account')} className="text-on-surface-variant font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Cancel</button>
                <button onClick={() => handleSave('account')} className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-container shadow-sm">Save Changes</button>
              </div>
            )}
          </section>

          {/* 2. Location Section */}
          <section id="location" className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant scroll-mt-[40px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface">Location</h2>
              {!editMode.location && (
                <button onClick={() => toggleEdit('location')} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-[14px] hover:bg-primary/20 transition-colors">Edit</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">State</label>
                {editMode.location ? (
                  <input type="text" value={formData.location?.state || ''} onChange={(e) => handleChange('location', 'state', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.location?.state}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">District</label>
                {editMode.location ? (
                  <input type="text" value={formData.location?.district || ''} onChange={(e) => handleChange('location', 'district', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.location?.district}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Village/City</label>
                {editMode.location ? (
                  <input type="text" value={formData.location?.village || ''} onChange={(e) => handleChange('location', 'village', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.location?.village}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">PIN Code</label>
                {editMode.location ? (
                  <input type="text" value={formData.location?.pin || ''} onChange={(e) => handleChange('location', 'pin', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.location?.pin}</div>
                )}
              </div>
            </div>
            
            {editMode.location && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => toggleEdit('location')} className="text-on-surface-variant font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Cancel</button>
                <button onClick={() => handleSave('location')} className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-container shadow-sm">Save Changes</button>
              </div>
            )}
          </section>

          {/* 3. Farm Details */}
          <section id="farm" className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant scroll-mt-[40px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface">Farm Details</h2>
              {!editMode.farm && (
                <button onClick={() => toggleEdit('farm')} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-[14px] hover:bg-primary/20 transition-colors">Edit</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Farm Area</label>
                {editMode.farm ? (
                  <div className="flex gap-2">
                    <input type="number" value={formData.farm?.area || ''} onChange={(e) => handleChange('farm', 'area', e.target.value)} className="flex-1 bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                    <select value={formData.farm?.unit || 'Acres'} onChange={(e) => handleChange('farm', 'unit', e.target.value)} className="w-[100px] bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                      <option>Acres</option>
                      <option>Hectares</option>
                    </select>
                  </div>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.farm?.area} {formData.farm?.unit}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Soil Type</label>
                {editMode.farm ? (
                  <select value={formData.farm?.soilType || 'Loamy'} onChange={(e) => handleChange('farm', 'soilType', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                    <option>Sandy</option>
                    <option>Loamy</option>
                    <option>Black</option>
                    <option>Red</option>
                    <option>Clayey</option>
                  </select>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.farm?.soilType}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Irrigation Type</label>
                {editMode.farm ? (
                  <select value={formData.farm?.irrigationType || 'Canal'} onChange={(e) => handleChange('farm', 'irrigationType', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                    <option>Sprinkler</option>
                    <option>Drip</option>
                    <option>Canal</option>
                    <option>Rainfed</option>
                    <option>Well</option>
                    <option>Borewell</option>
                  </select>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.farm?.irrigationType}</div>
                )}
              </div>
            </div>
            
            {editMode.farm && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => toggleEdit('farm')} className="text-on-surface-variant font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Cancel</button>
                <button onClick={() => handleSave('farm')} className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-container shadow-sm">Save Changes</button>
              </div>
            )}
          </section>

          {/* 4. Crops */}
          <section id="crops" className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant scroll-mt-[40px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface">Crops</h2>
              {!editMode.crops && (
                <button onClick={() => toggleEdit('crops')} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-[14px] hover:bg-primary/20 transition-colors">Edit</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[14px] font-medium text-on-surface-variant mb-2">Current Crops</label>
                <div className="flex flex-wrap gap-2">
                  {formData.crops?.current?.map((crop, idx) => (
                    <div key={idx} className="bg-primary-container/20 text-primary px-4 py-1.5 rounded-full text-[14px] font-medium flex items-center gap-1">
                      {crop}
                      {editMode.crops && <span onClick={() => removeCrop(crop)} className="material-symbols-outlined text-[16px] cursor-pointer hover:text-error">close</span>}
                    </div>
                  ))}
                  {editMode.crops && (
                    <div className="relative">
                      <button onClick={() => setShowCropPicker(!showCropPicker)} className="border border-dashed border-primary text-primary px-4 py-1.5 rounded-full text-[14px] font-medium flex items-center gap-1 hover:bg-primary/5">
                        <span className="material-symbols-outlined text-[16px]">add</span> Add Crop
                      </button>
                      {showCropPicker && (
                        <div className="absolute top-full mt-2 left-0 bg-surface-container-lowest border border-outline-variant rounded-[12px] p-3 shadow-lg z-20 w-[280px] max-h-[200px] overflow-y-auto">
                          <div className="flex flex-wrap gap-1.5">
                            {CROP_LIST.filter(c => !formData.crops?.current?.includes(c)).map(crop => (
                              <button key={crop} onClick={() => addCrop(crop)} className="px-3 py-1 rounded-full border border-outline-variant text-[13px] font-medium text-on-surface hover:bg-primary/10 hover:border-primary transition-colors">{crop}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Season</label>
                {editMode.crops ? (
                  <select value={formData.crops?.season || 'Rabi'} onChange={(e) => handleChange('crops', 'season', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                    <option>Rabi</option>
                    <option>Kharif</option>
                    <option>Zaid</option>
                  </select>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.crops?.season}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Sowing Date</label>
                {editMode.crops ? (
                  <input type="date" value={formData.crops?.sowingDate || ''} onChange={(e) => handleChange('crops', 'sowingDate', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary" />
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.crops?.sowingDate}</div>
                )}
              </div>
            </div>
            
            {editMode.crops && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => toggleEdit('crops')} className="text-on-surface-variant font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Cancel</button>
                <button onClick={() => handleSave('crops')} className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-container shadow-sm">Save Changes</button>
              </div>
            )}
          </section>

          {/* 5. Security */}
          <section id="security" className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant scroll-mt-[40px]">
            <h2 className="text-[20px] font-semibold text-on-surface mb-6">Security</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center pb-6 border-b border-outline-variant">
                <div>
                  <div className="text-[16px] font-medium text-on-surface">Password</div>
                  <div className="text-[14px] text-on-surface-variant mt-1">Last updated 45 days ago</div>
                </div>
                <button onClick={() => alert('Password update requires re-authentication. This feature will be available with a backend integration.')} className="border border-outline-variant text-on-surface font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Update</button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[16px] font-medium text-on-surface">Two-Factor Authentication</div>
                  <div className="flex items-center gap-2 text-[14px] text-primary mt-1 font-medium">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Enabled
                  </div>
                </div>
                <button onClick={() => alert('Two-factor authentication management requires a backend service. This is a planned feature.')} className="border border-outline-variant text-on-surface font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Manage</button>
              </div>
            </div>
          </section>

          {/* 6. Preferences */}
          <section id="preferences" className="bg-surface-container-lowest rounded-[24px] p-[32px] shadow-sm border border-outline-variant scroll-mt-[40px]">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface">Preferences</h2>
              {!editMode.preferences && (
                <button onClick={() => toggleEdit('preferences')} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-[14px] hover:bg-primary/20 transition-colors">Edit</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Language</label>
                {editMode.preferences ? (
                  <select value={formData.preferences?.language || 'English'} onChange={(e) => handleChange('preferences', 'language', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Punjabi</option>
                  </select>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.preferences?.language}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Currency</label>
                {editMode.preferences ? (
                  <select value={formData.preferences?.currency || 'INR ₹'} onChange={(e) => handleChange('preferences', 'currency', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                    <option>INR ₹</option>
                    <option>USD $</option>
                  </select>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.preferences?.currency}</div>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-surface-variant mb-1">Units of Measure</label>
                {editMode.preferences ? (
                  <select value={formData.preferences?.units || 'Metric'} onChange={(e) => handleChange('preferences', 'units', e.target.value)} className="w-full bg-surface border border-outline rounded-[12px] px-4 py-2 text-on-surface focus:outline-primary">
                    <option>Metric</option>
                    <option>Imperial</option>
                  </select>
                ) : (
                  <div className="text-[16px] text-on-surface font-medium">{formData.preferences?.units}</div>
                )}
              </div>
            </div>
            
            {editMode.preferences && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => toggleEdit('preferences')} className="text-on-surface-variant font-medium px-4 py-2 rounded-lg hover:bg-surface-container">Cancel</button>
                <button onClick={() => handleSave('preferences')} className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-container shadow-sm">Save Changes</button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
