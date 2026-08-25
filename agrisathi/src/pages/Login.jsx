import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [tab, setTab] = useState('email'); // 'email' | 'mobile'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden animate-in fade-in duration-500">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#012d1d]/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#1b4332]/20 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="bg-surface-container-lowest w-full max-w-[480px] rounded-2xl shadow-xl z-10 border border-surface-container overflow-hidden flex flex-col">
        <div className="p-8 sm:p-10 flex-1">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
          </div>
          
          <h1 className="text-headline-lg font-bold text-center text-on-surface mb-2">Welcome Back</h1>
          <p className="text-body-md text-center text-on-surface/60 mb-8">Sign in to continue to LeafLife</p>

          {error && (
            <div className="mb-6 p-3 bg-[#FFDAD6] text-[#BA1A1A] rounded-lg text-body-md flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">error</span>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex p-1 bg-surface-container rounded-xl mb-8 relative">
            <button 
              className={`flex-1 py-2.5 text-label-md font-bold rounded-lg transition-colors z-10 ${tab === 'email' ? 'text-on-surface' : 'text-on-surface/60 hover:text-on-surface'}`}
              onClick={() => { setTab('email'); setIdentifier(''); }}
            >
              Email Address
            </button>
            <button 
              className={`flex-1 py-2.5 text-label-md font-bold rounded-lg transition-colors z-10 ${tab === 'mobile' ? 'text-on-surface' : 'text-on-surface/60 hover:text-on-surface'}`}
              onClick={() => { setTab('mobile'); setIdentifier(''); }}
            >
              Mobile Number
            </button>
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-lg shadow-sm transition-transform duration-300 ease-in-out`}
              style={{ transform: tab === 'mobile' ? 'translateX(100%)' : 'translateX(0)' }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === 'email' ? (
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/50">mail</span>
                  <input 
                    type="email" 
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email" 
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-surface-container rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-lg"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-label-md font-bold text-on-surface mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center px-4 bg-surface-container border border-surface-container rounded-lg text-body-lg font-medium text-on-surface">
                    +91
                  </div>
                  <input 
                    type="tel" 
                    required
                    pattern="[0-9]{10}"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number" 
                    className="flex-1 px-4 py-3 bg-surface-container-lowest border border-surface-container rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-lg"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-label-md font-bold text-on-surface">Password</label>
                <button type="button" className="text-label-md text-primary font-bold hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/50">lock</span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-surface-container rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-lg"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/50 hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded text-primary focus:ring-primary border-surface-container" />
              <label htmlFor="remember" className="text-body-md text-on-surface/80">Remember me</label>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-bold text-body-lg transition-colors mt-6 shadow-md"
            >
              Sign In
            </button>
          </form>
        </div>
        
        <div className="bg-surface-container py-5 text-center border-t border-surface-container">
          <p className="text-body-md text-on-surface/70">
            Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
