import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WeatherCrops from './pages/WeatherCrops';
import SmartIrrigation from './pages/SmartIrrigation';
import MarketIntelligence from './pages/MarketIntelligence';
import Settings from './pages/Settings';
import ChatWidget from './components/chatbot/ChatWidget';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-surface"><div className="animate-pulse font-bold text-primary">Loading LeafLife...</div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/weather" element={<WeatherCrops />} />
                  <Route path="/irrigation" element={<SmartIrrigation />} />
                  <Route path="/market" element={<MarketIntelligence />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AppLayout>
              <ChatWidget />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
