import React, { useState, useEffect } from 'react';
import { SiteConfig, Project, Client, Service, QuotationData } from './types';
import { ThemeStyleInjector } from './components/ThemeStyleInjector';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SolutionsMatrix } from './components/SolutionsMatrix';
import { ProjectsShowcase } from './components/ProjectsShowcase';
import { ClientsShowcase } from './components/ClientsShowcase';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AiEstimatorModal } from './components/AiEstimatorModal';
import { QuotationModal } from './components/QuotationModal';
import { ClientDetailsModal } from './components/ClientDetailsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { defaultSiteConfig, defaultProjects, defaultClients, defaultServices } from './data/initialData';
import {
  subscribeToSiteConfig,
  subscribeToProjects,
  subscribeToClients,
  subscribeToServices
} from './lib/firebase';

export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const savedSite = localStorage.getItem('ngd_site_config');
      if (savedSite) {
        const parsed = JSON.parse(savedSite);
        return {
          ...defaultSiteConfig,
          ...parsed,
          stats: {
            ...defaultSiteConfig.stats,
            ...(parsed.stats || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to parse cached siteConfig', e);
    }
    return defaultSiteConfig;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('ngd_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultProjects;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('ngd_clients');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultClients;
  });
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('ngd_services');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultServices;
  });

  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [clientDetailsSpecs, setClientDetailsSpecs] = useState<any>(null);
  const [quotationInitialData, setQuotationInitialData] = useState<Partial<QuotationData> | undefined>(undefined);
  const [prefillService, setPrefillService] = useState<string>('');

  const handleOpenQuotation = (initialData?: Partial<QuotationData>) => {
    setQuotationInitialData(initialData);
    setIsQuotationOpen(true);
  };

  // Subscribe to Cloud Firestore Realtime Updates (Sync across all devices & browsers)
  useEffect(() => {
    const unsubSite = subscribeToSiteConfig((cloudSite) => {
      if (cloudSite) {
        const merged: SiteConfig = {
          ...defaultSiteConfig,
          ...cloudSite,
          stats: {
            ...defaultSiteConfig.stats,
            ...(cloudSite.stats || {}),
          },
        };
        setSiteConfig(merged);
        try {
          localStorage.setItem('ngd_site_config', JSON.stringify(merged));
        } catch (e) {}
      }
    });

    const unsubProjects = subscribeToProjects((cloudProjects) => {
      if (cloudProjects && cloudProjects.length > 0) {
        setProjects(cloudProjects);
      }
    });

    const unsubClients = subscribeToClients((cloudClients) => {
      if (cloudClients && cloudClients.length > 0) {
        setClients(cloudClients);
      }
    });

    const unsubServices = subscribeToServices((cloudServices) => {
      if (cloudServices && cloudServices.length > 0) {
        setServices(cloudServices);
      }
    });

    return () => {
      unsubSite();
      unsubProjects();
      unsubClients();
      unsubServices();
    };
  }, []);

  // Fetch Public Site Data Fallback
  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public/site');
      if (res.ok) {
        const data = await res.json();
        if (data.siteConfig) {
          const merged: SiteConfig = {
            ...defaultSiteConfig,
            ...data.siteConfig,
            stats: {
              ...defaultSiteConfig.stats,
              ...(data.siteConfig.stats || {}),
            },
          };
          setSiteConfig(merged);
          try {
            localStorage.setItem('ngd_site_config', JSON.stringify(merged));
          } catch (e) {}
        }
        if (data.projects) setProjects(data.projects);
        if (data.clients) setClients(data.clients);
        if (data.services) setServices(data.services);
        return;
      }
    } catch (err) {
      // Offline / Static fallback
    }

    try {
      const savedSite = localStorage.getItem('ngd_site_config');
      const savedProjects = localStorage.getItem('ngd_projects');
      const savedClients = localStorage.getItem('ngd_clients');
      const savedServices = localStorage.getItem('ngd_services');

      if (savedSite) {
        try {
          const parsed = JSON.parse(savedSite);
          setSiteConfig({
            ...defaultSiteConfig,
            ...parsed,
            stats: {
              ...defaultSiteConfig.stats,
              ...(parsed.stats || {}),
            },
          });
        } catch (err) {
          console.warn('Failed to parse savedSite:', err);
        }
      }
      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedServices) setServices(JSON.parse(savedServices));
    } catch (e) {
      console.warn('Could not parse localStorage cache', e);
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
      <ThemeStyleInjector siteConfig={siteConfig} />
      
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
          onOpenQuotation={handleOpenQuotation}
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
        onRequestClientDetails={(specs) => {
          setClientDetailsSpecs(specs);
          setIsClientDetailsOpen(true);
        }}
        onOpenQuotation={isLoggedIn ? handleOpenQuotation : undefined}
      />

      {/* Client Contact & Quotation Request Details Form Modal */}
      <ClientDetailsModal
        isOpen={isClientDetailsOpen}
        onClose={() => setIsClientDetailsOpen(false)}
        initialProjectSpecs={clientDetailsSpecs}
      />

      {/* Official Industry Quotation PDF Studio Modal (Admin) */}
      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        initialData={quotationInitialData}
        siteConfig={siteConfig}
        onSaveQuotation={(savedData) => {
          setQuotationInitialData(savedData);
          localStorage.setItem('ngd_saved_quotation', JSON.stringify(savedData));
        }}
      />

    </div>
  );
}
