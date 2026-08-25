import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agrisathi_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      let userData;
      if (authService && authService.login) {
        userData = await authService.login(identifier, password);
      } else {
        // Fallback for development if authService is not fully implemented
        userData = { id: 1, name: 'Farmer', identifier };
      }
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('agrisathi_current_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      let newUser;
      if (authService && authService.signup) {
        newUser = await authService.signup(userData);
      } else {
        newUser = { id: Date.now(), ...userData };
      }
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('agrisathi_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
