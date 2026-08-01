import React from 'react';
import { SiteConfig } from '../types';
import { ShieldCheck, Lock, Terminal, Globe } from 'lucide-react';

interface FooterProps {
  siteConfig: SiteConfig;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteConfig, onOpenAdminLogin }) => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            {(() => {
              const w = siteConfig.logoWidth || 120;
              const h = siteConfig.logoHeight || 80;
              const pos = siteConfig.logoPosition || 'left';

              let footerContainerClass = "flex items-center space-x-2.5";
              if (pos === 'right') {
                footerContainerClass = "flex items-center space-x-2.5 flex-row-reverse space-x-reverse";
              } else if (pos === 'top') {
                footerContainerClass = "flex flex-col items-start space-y-1.5";
              }

              return (
                <div className={footerContainerClass}>
                  {siteConfig.logoUrl ? (
                    <img 
                      src={siteConfig.logoUrl} 
                      alt={siteConfig.companyName} 
                      loading="eager"
                      style={{ width: `${w}px`, height: `${h}px` }}
                      className="rounded-lg object-contain bg-gray-900 border border-blue-500/30 flex-shrink-0" 
                    />
                  ) : (
                    <div 
                      style={{ width: `${w}px`, height: `${h}px` }}
                      className="rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                    >
                      NG
                    </div>
                  )}
                  <span className="font-bold text-white text-base">{siteConfig.companyName}</span>
                </div>
              );
            })()}
            <p className="text-gray-400 text-xs leading-relaxed">
              {siteConfig.tagline}
            </p>
            <div className="inline-flex items-center space-x-1.5 text-[11px] text-blue-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SOC-2 Type II Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Enterprise Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#solutions" className="hover:text-blue-400 transition">Custom LLMs & RAG</a></li>
              <li><a href="#solutions" className="hover:text-blue-400 transition">Autonomous AI Agents</a></li>
              <li><a href="#solutions" className="hover:text-blue-400 transition">Computer Vision Pipelines</a></li>
              <li><a href="#solutions" className="hover:text-blue-400 transition">Time-Series Predictive Models</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Company & Work</h4>
            <ul className="space-y-2">
              <li><a href="#projects" className="hover:text-blue-400 transition">Case Studies</a></li>
              <li><a href="#clients" className="hover:text-blue-400 transition">Global Clients</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition">Contact Architects</a></li>
              <li><button onClick={onOpenAdminLogin} className="hover:text-blue-400 transition text-left">Admin Portal</button></li>
            </ul>
          </div>

          {/* Governance & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Air-Gapped Security</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              All infrastructure and AI model training pipelines adhere to strict air-gapped container isolation protocols.
            </p>
            <div className="p-3 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-300">System Firewall</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                PROTECTED
              </span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} {siteConfig.companyName}. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-gray-400 transition">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 transition">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-gray-400 transition">Security Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
