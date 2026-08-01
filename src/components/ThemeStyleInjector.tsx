import React, { useEffect } from 'react';
import { SiteConfig } from '../types';

interface ThemeStyleInjectorProps {
  siteConfig: SiteConfig;
}

export const ThemeStyleInjector: React.FC<ThemeStyleInjectorProps> = ({ siteConfig }) => {
  useEffect(() => {
    const isLight = siteConfig.themeMode === 'light';
    const bg = siteConfig.backgroundColor || (isLight ? '#f8fafc' : '#030712');
    const text = siteConfig.textColor || (isLight ? '#0f172a' : '#f9fafb');
    const primary = siteConfig.primaryColor || '#3b82f6';
    const accent = siteConfig.accentColor || '#06b6d4';
    const cardBg = siteConfig.cardBgColor || (isLight ? '#ffffff' : '#0b1329');

    // Set CSS custom properties on document root
    const root = document.documentElement;
    root.style.setProperty('--site-bg', bg);
    root.style.setProperty('--site-text', text);
    root.style.setProperty('--site-primary', primary);
    root.style.setProperty('--site-accent', accent);
    root.style.setProperty('--site-card-bg', cardBg);

    if (isLight) {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }

    // Dynamic stylesheet element for global overrides
    let styleTag = document.getElementById('dynamic-theme-styles') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --site-bg: ${bg};
        --site-text: ${text};
        --site-primary: ${primary};
        --site-accent: ${accent};
        --site-card-bg: ${cardBg};
      }

      body {
        background-color: ${bg} !important;
        color: ${text} !important;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* Primary Brand Highlights */
      .text-blue-400,
      .text-blue-500,
      .text-blue-300 {
        color: ${primary} !important;
      }

      .bg-blue-600,
      .bg-blue-500 {
        background-color: ${primary} !important;
      }

      .border-blue-500,
      .border-blue-600,
      .border-blue-500\\/30,
      .border-blue-500\\/40 {
        border-color: ${primary} !important;
      }

      /* Secondary / Accent Highlights */
      .text-cyan-400,
      .text-cyan-300,
      .text-emerald-400 {
        color: ${accent} !important;
      }

      .bg-cyan-500,
      .bg-emerald-500 {
        background-color: ${accent} !important;
      }

      .border-cyan-500,
      .border-emerald-500 {
        border-color: ${accent} !important;
      }

      /* Canvas & Background overrides */
      .bg-gray-950,
      .bg-gray-950\\/90,
      .bg-gray-950\\/80,
      .bg-gray-950\\/60 {
        background-color: ${bg} !important;
      }

      /* Card & Panel Overrides */
      .bg-gray-900,
      .bg-gray-900\\/80,
      .bg-gray-900\\/90,
      .bg-gray-900\\/50 {
        background-color: ${cardBg} !important;
      }

      ${isLight ? `
        /* Light Theme Contrast Enhancements */
        .text-gray-400 {
          color: #64748b !important;
        }
        .text-gray-300 {
          color: #334155 !important;
        }
        .text-gray-200, .text-gray-100, .text-white {
          color: ${text} !important;
        }
        .border-gray-800, .border-gray-800\\/80 {
          border-color: #cbd5e1 !important;
        }
        .bg-gray-950\\/90 {
          background-color: ${bg}f0 !important;
        }
      ` : ''}
    `;
  }, [siteConfig]);

  return null;
};
