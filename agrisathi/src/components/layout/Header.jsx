import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const userName = user?.name || user?.fullName || 'Farmer';
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, icon: 'water_drop', text: 'Irrigation recommended for your wheat field', time: 'Just now', unread: true },
    { id: 2, icon: 'thermostat', text: 'Temperature alert: 38°C expected tomorrow', time: '1h ago', unread: true },
    { id: 3, icon: 'trending_up', text: 'Wheat prices up +3.2% this week', time: '3h ago', unread: false },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-surface/80 backdrop-blur-xl border-b border-surface-container z-30 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-2 max-w-md w-full focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
          <span className="material-symbols-outlined text-on-surface/60 mr-2 text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search crops, weather, market prices..." 
            className="bg-transparent border-none outline-none w-full text-body-md text-on-surface placeholder:text-on-surface/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Search Icon */}
        <button className="sm:hidden p-2 text-on-surface hover:bg-surface-container rounded-full">
          <span className="material-symbols-outlined">search</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#BA1A1A] rounded-full border border-surface"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-[340px] bg-surface-container-lowest border border-outline-variant rounded-[16px] shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                  <h3 className="text-[16px] font-semibold text-on-surface">Notifications</h3>
                  <span className="text-[12px] text-primary font-medium cursor-pointer hover:underline" onClick={() => setShowNotifications(false)}>Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex gap-3 p-4 border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors cursor-pointer ${n.unread ? 'bg-primary/5' : ''}`}>
                      <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-primary">{n.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-on-surface leading-snug">{n.text}</p>
                        <p className="text-[11px] text-on-surface-variant mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Snippet */}
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-surface-container">
          <div className="flex flex-col items-end">
            <span className="text-label-md font-bold text-on-surface">{userName}</span>
            <span className="text-label-sm text-on-surface/60">Farmer</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-base cursor-pointer hover:opacity-90 transition-opacity">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

