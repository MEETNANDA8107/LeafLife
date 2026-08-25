import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as weatherService from '../services/weather.js';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [locationCoords, setLocationCoords] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile(user);
      if (user.state && user.district) {
        const fetchCoords = async () => {
          try {
            if (weatherService && weatherService.getLocationCoords) {
              const coords = await weatherService.getLocationCoords(user.state, user.district);
              setLocationCoords(coords);
            } else {
              // Dummy fallback
              setLocationCoords({ lat: 20.5937, lon: 78.9629 });
            }
          } catch (error) {
            console.error('Failed to get location coords', error);
          }
        };
        fetchCoords();
      }
    } else {
      setProfile(null);
      setLocationCoords(null);
    }
  }, [user]);

  const updateProfile = (fields) => {
    const newProfile = { ...profile, ...fields };
    setProfile(newProfile);
    localStorage.setItem('agrisathi_current_user', JSON.stringify(newProfile));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, locationCoords }}>
      {children}
    </UserContext.Provider>
  );
};
