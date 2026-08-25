import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const userName = user?.name || user?.fullName || 'Farmer';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'grid_view' },
    { name: 'Weather & Crops', path: '/weather', icon: 'potted_plant' },
    { name: 'Smart Irrigation', path: '/irrigation', icon: 'water_drop' },
    { name: 'Market Intelligence', path: '/market', icon: 'insights' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-primary transform transition-transform duration-300 ease-in-out
    md:translate-x-0 md:static flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-on-surface/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClasses}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 bg-primary border-b border-surface-container-highest/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="text-headline-md font-bold text-on-primary tracking-tight">LeafLife</span>
          </div>
          <button className="md:hidden text-on-primary/70 hover:text-on-primary" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-surface-container-highest/10 text-[#71F29B] font-bold' 
                  : 'text-on-primary/70 hover:bg-surface-container-highest/5 hover:text-on-primary font-medium'}
              `}
              end={item.path === '/'}
            >
              {({ isActive }) => (
                <>
                  <span 
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-body-lg">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-surface-container-highest/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-highest/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-md font-bold text-on-primary truncate">{userName}</p>
              <p className="text-label-sm text-on-primary/70">Farmer Profile</p>
            </div>
            <button 
              onClick={logout}
              className="text-on-primary/70 hover:text-[#FF897D] transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
