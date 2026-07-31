import React from 'react';
import { SiteConfig } from '../types';
import { ShieldCheck, Lock, Sparkles, Terminal, LogOut, CheckCircle } from 'lucide-react';

interface NavbarProps {
  siteConfig: SiteConfig;
  currentView: 'public' | 'admin';
  setCurrentView: (view: 'public' | 'admin') => void;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenEstimator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteConfig,
  currentView,
  setCurrentView,
  isLoggedIn,
  onOpenLogin,
  onLogout,
  onOpenEstimator,
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        {(() => {
          const w = siteConfig.logoWidth || 30;
          const h = siteConfig.logoHeight || 35;
          const pos = siteConfig.logoPosition || 'left';

          let containerClass = "flex items-center space-x-3 text-left group focus:outline-none";
          if (pos === 'right') {
            containerClass = "flex items-center space-x-3 flex-row-reverse space-x-reverse text-left group focus:outline-none";
          } else if (pos === 'top') {
            containerClass = "flex flex-col items-start space-y-1 text-left group focus:outline-none";
          }

          return (
            <button 
              onClick={() => setCurrentView('public')} 
              className={containerClass}
            >
              {siteConfig.logoUrl ? (
                <img 
                  src={siteConfig.logoUrl} 
                  alt={siteConfig.companyName} 
                  style={{ width: `${w}px`, height: `${h}px` }}
                  className="rounded-lg object-contain bg-gray-900/60 p-0.5 border border-blue-500/30 group-hover:border-blue-400 transition flex-shrink-0" 
                />
              ) : (
                <div 
                  style={{ width: `${w}px`, height: `${h}px` }}
                  className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition flex-shrink-0"
                >
                  NG
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-extrabold text-white tracking-tight group-hover:text-blue-400 transition">
                    {siteConfig.companyName}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                    AI Enterprise
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 font-medium">
                  {siteConfig.tagline}
                </p>
              </div>
            </button>
          );
        })()}

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-300">
          <button 
            onClick={() => { setCurrentView('public'); setTimeout(() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
            className="hover:text-blue-400 transition"
          >
            Solutions
          </button>
          <button 
            onClick={() => { setCurrentView('public'); setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
            className="hover:text-blue-400 transition"
          >
            Case Studies
          </button>
          <button 
            onClick={() => { setCurrentView('public'); setTimeout(() => document.getElementById('clients')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
            className="hover:text-blue-400 transition"
          >
            Clients & Partners
          </button>
          <button 
            onClick={() => { setCurrentView('public'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
            className="hover:text-blue-400 transition"
          >
            Contact
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* AI Estimator Button */}
          <button
            onClick={onOpenEstimator}
            className="hidden sm:flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/40 text-blue-300 hover:text-white hover:border-blue-400 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>AI Solution Estimator</span>
          </button>

          {/* Admin Control Switcher / Button */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 bg-gray-900 border border-emerald-500/30 rounded-lg p-1">
              <button
                onClick={() => setCurrentView(currentView === 'admin' ? 'public' : 'admin')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  currentView === 'admin'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{currentView === 'admin' ? 'Admin Panel Active' : 'Switch to Admin'}</span>
              </button>
              <button
                onClick={onLogout}
                title="Logout from Admin"
                className="p-1.5 text-gray-400 hover:text-red-400 transition rounded"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/80 transition"
            >
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Admin Access</span>
            </button>
          )}

        </div>
      </div>
    </nav>
  );
};
