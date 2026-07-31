import React, { useState, useEffect } from 'react';
import { SiteConfig, Project, Client, Service } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SolutionsMatrix } from './components/SolutionsMatrix';
import { ProjectsShowcase } from './components/ProjectsShowcase';
import { ClientsShowcase } from './components/ClientsShowcase';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AiEstimatorModal } from './components/AiEstimatorModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { defaultSiteConfig, defaultProjects, defaultClients, defaultServices } from './data/initialData';

export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [clients, setClients] = useState<Client[]>(defaultClients);
  const [services, setServices] = useState<Service[]>(defaultServices);

  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [prefillService, setPrefillService] = useState<string>('');

  // Fetch Public Site Data
  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public/site');
      if (res.ok) {
        const data = await res.json();
        if (data.siteConfig) setSiteConfig(data.siteConfig);
        if (data.projects) setProjects(data.projects);
        if (data.clients) setClients(data.clients);
        if (data.services) setServices(data.services);
        return;
      }
    } catch (err) {
      console.warn('Using local site config fallback for static hosting');
    }

    // Local storage fallback for GitHub Pages static site
    try {
      const savedSite = localStorage.getItem('ngd_site_config');
      const savedProjects = localStorage.getItem('ngd_projects');
      const savedClients = localStorage.getItem('ngd_clients');
      const savedServices = localStorage.getItem('ngd_services');

      if (savedSite) setSiteConfig(JSON.parse(savedSite));
      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedServices) setServices(JSON.parse(savedServices));
    } catch (e) {
      console.warn('Could not parse localStorage cache, using default initial data', e);
    }
  };

  // Verify Session Token from localStorage on mount
  useEffect(() => {
    fetchPublicData();

    const savedToken = localStorage.getItem('ngd_admin_token');
    if (savedToken) {
      if (savedToken.startsWith('static_admin_token_')) {
        setIsLoggedIn(true);
        setAdminToken(savedToken);
      } else {
        fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Server unreachable');
          })
          .then((data) => {
            if (data.success) {
              setIsLoggedIn(true);
              setAdminToken(savedToken);
            } else {
              localStorage.removeItem('ngd_admin_token');
            }
          })
          .catch(() => {
            // Keep session active on static sites
            setIsLoggedIn(true);
            setAdminToken(savedToken);
          });
      }
    }
  }, []);

  const handleLoginSuccess = (token: string, username: string) => {
    setIsLoggedIn(true);
    setAdminToken(token);
    localStorage.setItem('ngd_admin_token', token);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch (err) {
        console.error(err);
      }
    }
    setIsLoggedIn(false);
    setAdminToken('');
    localStorage.removeItem('ngd_admin_token');
    setCurrentView('public');
  };

  const handleSelectService = (title: string) => {
    setPrefillService(title);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        siteConfig={siteConfig}
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'admin' && !isLoggedIn) {
            setIsLoginModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenEstimator={() => setIsEstimatorOpen(true)}
      />

      {/* VIEW SWITCHING LOGIC */}
      {currentView === 'admin' && isLoggedIn ? (
        <AdminDashboard
          token={adminToken}
          onLogout={handleLogout}
          onRefreshPublicData={fetchPublicData}
        />
      ) : (
        <main>
          {/* Hero Banner Section */}
          <Hero
            siteConfig={siteConfig}
            onOpenEstimator={() => setIsEstimatorOpen(true)}
            onContactClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          />

          {/* AI Solutions & Architecture Matrix */}
          <SolutionsMatrix
            services={services}
            onSelectService={handleSelectService}
          />

          {/* Case Studies & Portfolio Projects */}
          <ProjectsShowcase
            projects={projects}
          />

          {/* Global Enterprise Clients & Partners */}
          <ClientsShowcase
            clients={clients}
          />

          {/* Contact & Consultation Request */}
          <ContactSection
            siteConfig={siteConfig}
            prefillService={prefillService}
          />

          {/* Enterprise Footer */}
          <Footer
            siteConfig={siteConfig}
            onOpenAdminLogin={() => setIsLoginModalOpen(true)}
          />
        </main>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* AI Estimator Tool Modal */}
      <AiEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
      />

    </div>
  );
}
