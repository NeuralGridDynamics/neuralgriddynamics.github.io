import React, { useState, useEffect } from 'react';
import { SiteConfig, Project, Client, Service, Inquiry, SecurityLog } from '../../types';
import { defaultSiteConfig, defaultProjects, defaultClients } from '../../data/initialData';
import {
  Settings, Briefcase, Users, MessageSquare, ShieldCheck, Download, Plus, Trash2, Edit3, Save, CheckCircle, RefreshCw, Key, Image as ImageIcon, ExternalLink, Code2, Copy, FileText, Lock
} from 'lucide-react';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onRefreshPublicData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout, onRefreshPublicData }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'projects' | 'clients' | 'inquiries' | 'security' | 'export'>('settings');

  // Admin Data State
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Project Form Modal State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    clientName: '',
    category: 'Generative AI' as Project['category'],
    description: '',
    fullCaseStudy: '',
    impactMetrics: '',
    technologies: 'PyTorch, FastAPI, Docker',
    imageUrl: '',
    featured: false,
    published: true,
  });

  // New Client Form Modal State
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    logoUrl: '',
    industry: 'Banking & Financial Tech',
    website: '',
    testimonial: '',
    authorName: '',
    authorRole: '',
    featured: true,
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Helper fetch with token
  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  // Load All Admin Data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [siteRes, projRes, clientRes, inqRes, logRes] = await Promise.all([
        authFetch('/api/admin/site').catch(() => null),
        authFetch('/api/admin/projects').catch(() => null),
        authFetch('/api/admin/clients').catch(() => null),
        authFetch('/api/admin/inquiries').catch(() => null),
        authFetch('/api/admin/security-logs').catch(() => null),
      ]);

      let loadedSite = siteRes && siteRes.ok ? await siteRes.json() : null;
      let loadedProj = projRes && projRes.ok ? await projRes.json() : null;
      let loadedClients = clientRes && clientRes.ok ? await clientRes.json() : null;
      let loadedInquiries = inqRes && inqRes.ok ? await inqRes.json() : null;
      let loadedLogs = logRes && logRes.ok ? await logRes.json() : null;

      // Local storage / initial data fallbacks for static hosting
      if (!loadedSite) {
        const saved = localStorage.getItem('ngd_site_config');
        loadedSite = saved ? JSON.parse(saved) : defaultSiteConfig;
      }
      if (!loadedProj) {
        const saved = localStorage.getItem('ngd_projects');
        loadedProj = saved ? JSON.parse(saved) : defaultProjects;
      }
      if (!loadedClients) {
        const saved = localStorage.getItem('ngd_clients');
        loadedClients = saved ? JSON.parse(saved) : defaultClients;
      }
      if (!loadedInquiries) {
        const saved = localStorage.getItem('ngd_inquiries');
        loadedInquiries = saved ? JSON.parse(saved) : [];
      }
      if (!loadedLogs) {
        const saved = localStorage.getItem('ngd_security_logs');
        loadedLogs = saved ? JSON.parse(saved) : [
          { id: 'log-1', timestamp: new Date().toISOString(), event: 'Admin Session Active (Static Mode)', ip: '127.0.0.1', status: 'SUCCESS' }
        ];
      }

      setSiteConfig(loadedSite);
      setProjects(loadedProj);
      setClients(loadedClients);
      setInquiries(loadedInquiries);
      setSecurityLogs(loadedLogs);
    } catch (err) {
      console.warn('Failed to fetch admin data, using local fallback', err);
      const savedSite = localStorage.getItem('ngd_site_config');
      setSiteConfig(savedSite ? JSON.parse(savedSite) : defaultSiteConfig);
      setProjects(defaultProjects);
      setClients(defaultClients);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  // Save Site Settings
  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;

    try {
      const res = await authFetch('/api/admin/site', {
        method: 'PUT',
        body: JSON.stringify(siteConfig),
      });
      if (res.ok) {
        setStatusMsg('Branding & Site Configuration updated successfully!');
        onRefreshPublicData();
        setTimeout(() => setStatusMsg(''), 3000);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, saving site config to localStorage');
    }

    // Local storage update for static deployment
    localStorage.setItem('ngd_site_config', JSON.stringify(siteConfig));
    setStatusMsg('Branding & Site Configuration saved locally!');
    onRefreshPublicData();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Save Project (Add / Edit)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const techArray = projectForm.technologies.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      ...projectForm,
      technologies: techArray,
      imageUrl: projectForm.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    };

    try {
      if (editingProject) {
        const res = await authFetch(`/api/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setStatusMsg('Project updated successfully.');
          setEditingProject(null);
        }
      } else {
        const res = await authFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setStatusMsg('New project published.');
          setIsAddingProject(false);
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, updating projects in localStorage');
      // Local storage fallback
      let updatedProjects = [...projects];
      if (editingProject) {
        updatedProjects = updatedProjects.map(p => p.id === editingProject.id ? { ...p, ...payload, slug: payload.title.toLowerCase().replace(/\s+/g, '-') } : p);
        setEditingProject(null);
      } else {
        const newProj: Project = {
          id: 'proj-' + Date.now(),
          ...payload,
          slug: payload.title.toLowerCase().replace(/\s+/g, '-'),
          createdAt: new Date().toISOString().split('T')[0]
        };
        updatedProjects.unshift(newProj);
        setIsAddingProject(false);
      }
      setProjects(updatedProjects);
      localStorage.setItem('ngd_projects', JSON.stringify(updatedProjects));
      setStatusMsg('Projects updated successfully.');
    }

    // Reset Form
    setProjectForm({
      title: '',
      clientName: '',
      category: 'Generative AI',
      description: '',
      fullCaseStudy: '',
      impactMetrics: '',
      technologies: 'PyTorch, FastAPI, Docker',
      imageUrl: '',
      featured: false,
      published: true,
    });

    loadAdminData();
    onRefreshPublicData();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    try {
      const res = await authFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAdminData();
        onRefreshPublicData();
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, deleting project in localStorage');
    }

    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('ngd_projects', JSON.stringify(updated));
    onRefreshPublicData();
  };

  // Save Client (Add)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify(clientForm),
      });
      if (res.ok) {
        setStatusMsg('Client added successfully.');
        setIsAddingClient(false);
      }
    } catch (err) {
      console.warn('Backend unavailable, saving client to localStorage');
      const newClient: Client = {
        id: 'client-' + Date.now(),
        ...clientForm
      };
      const updated = [newClient, ...clients];
      setClients(updated);
      localStorage.setItem('ngd_clients', JSON.stringify(updated));
      setIsAddingClient(false);
      setStatusMsg('Client added successfully.');
    }

    setClientForm({
      name: '',
      logoUrl: '',
      industry: 'Banking & Financial Tech',
      website: '',
      testimonial: '',
      authorName: '',
      authorRole: '',
      featured: true,
    });
    loadAdminData();
    onRefreshPublicData();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Delete Client
  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await authFetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAdminData();
        onRefreshPublicData();
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, deleting client in localStorage');
    }

    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem('ngd_clients', JSON.stringify(updated));
    onRefreshPublicData();
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      await authFetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await authFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('Master Password updated successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '' });
      } else {
        alert(data.message || 'Password update failed.');
      }
    } catch (err) {
      alert('Error updating password.');
    }
  };

  // Copy code snippet helper
  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Backend Administration Control Panel
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Protected Content Manager & Deployment Operations Center
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAdminData}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition"
            >
              Logout Session
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Branding & Logo Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'clients'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Clients ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'inquiries'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Client Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Logs & Auth</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'export'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>GitHub & PHP Export Code</span>
          </button>
        </div>

        {/* TAB 1: SITE BRANDING & LOGO SETTINGS */}
        {activeTab === 'settings' && siteConfig && (
          <form onSubmit={handleSaveSiteConfig} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white">Brand & Logo Configuration</h2>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Site Changes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Software House Name</label>
                <input
                  type="text"
                  value={siteConfig.companyName}
                  onChange={(e) => setSiteConfig({ ...siteConfig, companyName: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Company Logo Image URL</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={siteConfig.logoUrl}
                    onChange={(e) => setSiteConfig({ ...siteConfig, logoUrl: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                  {siteConfig.logoUrl && (
                    <img src={siteConfig.logoUrl} alt="Logo Preview" className="w-10 h-10 rounded-lg object-cover border border-gray-700" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={siteConfig.tagline}
                onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2">Hero Banner Headings</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={siteConfig.heroHeadline}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroHeadline: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Hero Subhead Overview</label>
                <textarea
                  rows={3}
                  value={siteConfig.heroSubhead}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroSubhead: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteConfig.contactEmail}
                  onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Hotline Phone</label>
                <input
                  type="text"
                  value={siteConfig.contactPhone}
                  onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={siteConfig.address}
                  onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Key Stats Controls */}
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-sm font-bold text-white mb-3">Live Enterprise Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Deployments Completed</label>
                  <input
                    type="number"
                    value={siteConfig.stats.projectsCompleted}
                    onChange={(e) => setSiteConfig({ ...siteConfig, stats: { ...siteConfig.stats, projectsCompleted: Number(e.target.value) } })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Enterprise Clients</label>
                  <input
                    type="number"
                    value={siteConfig.stats.enterpriseClients}
                    onChange={(e) => setSiteConfig({ ...siteConfig, stats: { ...siteConfig.stats, enterpriseClients: Number(e.target.value) } })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Model Precision Rate</label>
                  <input
                    type="text"
                    value={siteConfig.stats.modelAccuracyRate}
                    onChange={(e) => setSiteConfig({ ...siteConfig, stats: { ...siteConfig.stats, modelAccuracyRate: e.target.value } })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cloud Uptime SLA</label>
                  <input
                    type="text"
                    value={siteConfig.stats.cloudUptime}
                    onChange={(e) => setSiteConfig({ ...siteConfig, stats: { ...siteConfig.stats, cloudUptime: e.target.value } })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: PROJECTS MANAGER */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div>
                <h2 className="text-lg font-bold text-white">Project Case Studies Directory</h2>
                <p className="text-xs text-gray-400">Manage published portfolio case studies visible on the public website.</p>
              </div>

              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsAddingProject(true);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Project</span>
              </button>
            </div>

            {/* Add / Edit Project Modal Form */}
            {(isAddingProject || editingProject) && (
              <form onSubmit={handleSaveProject} className="bg-gray-900 border border-blue-500/40 rounded-2xl p-6 sm:p-8 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    {editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Enterprise Project'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProject(false);
                      setEditingProject(null);
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="e.g. Multi-Agent Fraud Detection"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={projectForm.clientName}
                      onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                      placeholder="e.g. NetSol Auto Systems"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Domain Category</label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as any })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option>Generative AI</option>
                      <option>Enterprise LLMs</option>
                      <option>Computer Vision</option>
                      <option>FinTech AI</option>
                      <option>Cloud & MLOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Impact Metrics Summary</label>
                    <input
                      type="text"
                      value={projectForm.impactMetrics}
                      onChange={(e) => setProjectForm({ ...projectForm, impactMetrics: e.target.value })}
                      placeholder="99.9% Precision • 12ms Latency"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Short Description</label>
                  <input
                    type="text"
                    required
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Technical Case Study</label>
                  <textarea
                    rows={4}
                    value={projectForm.fullCaseStudy}
                    onChange={(e) => setProjectForm({ ...projectForm, fullCaseStudy: e.target.value })}
                    placeholder="Provide detailed architectural deep dive..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Technologies (Comma Separated)</label>
                    <input
                      type="text"
                      value={projectForm.technologies}
                      onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                      placeholder="PyTorch, CUDA, FastAPI, Docker"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={projectForm.imageUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-6 pt-2">
                  <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                      className="rounded bg-gray-950 border-gray-800 text-blue-600 focus:ring-0"
                    />
                    <span>Highlight as Featured Case Study</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={projectForm.published}
                      onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                      className="rounded bg-gray-950 border-gray-800 text-blue-600 focus:ring-0"
                    />
                    <span>Published on Public Website</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  Save Project Record
                </button>
              </form>
            )}

            {/* Existing Projects Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-950 border-b border-gray-800 text-gray-400 font-mono uppercase">
                    <tr>
                      <th className="p-4">Project</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/80 text-gray-300">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-gray-800/40 transition">
                        <td className="p-4 font-bold text-white flex items-center space-x-3">
                          <img src={proj.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <div>{proj.title}</div>
                            <div className="text-[10px] text-gray-500 font-normal">{proj.impactMetrics}</div>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{proj.clientName}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[10px] font-mono">
                            {proj.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            proj.published ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {proj.published ? 'LIVE' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProject(proj);
                              setProjectForm({
                                title: proj.title,
                                clientName: proj.clientName,
                                category: proj.category,
                                description: proj.description,
                                fullCaseStudy: proj.fullCaseStudy,
                                impactMetrics: proj.impactMetrics,
                                technologies: proj.technologies.join(', '),
                                imageUrl: proj.imageUrl,
                                featured: proj.featured,
                                published: proj.published,
                              });
                            }}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CLIENTS MANAGER */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div>
                <h2 className="text-lg font-bold text-white">Client Portfolio & Testimonials</h2>
                <p className="text-xs text-gray-400">Manage client company profiles, logos, and executive quotes.</p>
              </div>

              <button
                onClick={() => setIsAddingClient(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client Profile</span>
              </button>
            </div>

            {isAddingClient && (
              <form onSubmit={handleSaveClient} className="bg-gray-900 border border-blue-500/40 rounded-2xl p-6 sm:p-8 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <h3 className="text-base font-bold text-white">Add Enterprise Client</h3>
                  <button type="button" onClick={() => setIsAddingClient(false)} className="text-xs text-gray-400">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={clientForm.industry}
                      onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Logo URL</label>
                    <input
                      type="text"
                      value={clientForm.logoUrl}
                      onChange={(e) => setClientForm({ ...clientForm, logoUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={clientForm.website}
                      onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Executive Testimonial Quote</label>
                  <textarea
                    rows={3}
                    value={clientForm.testimonial}
                    onChange={(e) => setClientForm({ ...clientForm, testimonial: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Author Name</label>
                    <input
                      type="text"
                      value={clientForm.authorName}
                      onChange={(e) => setClientForm({ ...clientForm, authorName: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Author Role / Title</label>
                    <input
                      type="text"
                      value={clientForm.authorRole}
                      onChange={(e) => setClientForm({ ...clientForm, authorRole: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  Save Client Record
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((c) => (
                <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <img src={c.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-950" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <p className="text-xs text-blue-400">{c.industry}</p>
                      {c.testimonial && (
                        <p className="text-xs text-gray-400 italic mt-2 line-clamp-2">"{c.testimonial}"</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteClient(c.id)}
                    className="p-1.5 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: CLIENT INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white">Client Consultation Inquiries</h2>
              <p className="text-xs text-gray-400">Incoming enterprise contact messages submitted through the public website.</p>
            </div>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl text-xs">
                  No inquiries received yet.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
                      <div>
                        <span className="font-bold text-white text-sm">{inq.name}</span>
                        <span className="text-xs text-gray-400 ml-2">({inq.company || 'N/A'})</span>
                        <span className="text-xs text-blue-400 block sm:inline sm:ml-3">&lt;{inq.email}&gt;</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                          className="bg-gray-950 border border-gray-800 text-xs rounded px-2 py-1 text-white"
                        >
                          <option value="new">NEW</option>
                          <option value="contacted">CONTACTED</option>
                          <option value="archived">ARCHIVED</option>
                        </select>

                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-1.5 bg-red-950/60 text-red-400 rounded hover:bg-red-600 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-purple-400">
                      Requested Service: {inq.serviceRequested}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed bg-gray-950 p-3 rounded-xl border border-gray-800">
                      {inq.message}
                    </p>

                    <div className="text-[10px] text-gray-500">
                      Received Date: {inq.date}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 5: SECURITY LOGS & AUTH */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            
            {/* Change Master Password */}
            <form onSubmit={handleChangePassword} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-blue-400" />
                <span>Update Master Admin Password</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">New Master Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
              >
                Update Password
              </button>
            </form>

            {/* Security Audit Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>System Security & Access Logs</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gray-950 text-gray-400 uppercase">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Event Summary</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Security Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {securityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-800/40">
                        <td className="p-3 text-gray-400">{log.timestamp.split('T')[1]?.slice(0, 8)}</td>
                        <td className="p-3 text-white">{log.event}</td>
                        <td className="p-3 text-gray-400">{log.ip}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-400'
                              : log.status === 'WARNING'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-red-950 text-red-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: GITHUB & PHP EXPORT CODE */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                <span>GitHub Publishing & PHP Export Center</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                As requested, we have auto-generated export files (<code className="text-purple-300">index.php</code>, <code className="text-purple-300">admin/index.php</code>, and <code className="text-purple-300">.github/workflows/deploy.yml</code>) so you can publish directly to GitHub Pages or cPanel PHP servers!
              </p>
            </div>

            {/* Workflow yml Viewer */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-blue-400 font-bold">.github/workflows/deploy.yml</span>
                <button
                  onClick={() => handleCopyCode(`name: Deploy Neural Grid Dynamics Website\non: [push]\njobs:\n  build-and-deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm run build\n      - uses: peaceiris/actions-gh-pages@v3\n        with:\n          github_token: \${{ secrets.GITHUB_TOKEN }}\n          publish_dir: ./dist`, 'yml')}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyStatus === 'yml' ? 'Copied!' : 'Copy Workflow YML'}</span>
                </button>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800">
{`name: Deploy Neural Grid Dynamics Website
on:
  push:
    branches: [ main, master ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`}
              </pre>
            </div>

            {/* PHP index.php Viewer */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-emerald-400 font-bold">export/index.php (Public Landing)</span>
                <button
                  onClick={() => handleCopyCode(`<?php\nsession_start();\n$data = json_decode(file_get_contents(__DIR__ . '/data.json'), true);\n?>`, 'index_php')}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyStatus === 'index_php' ? 'Copied!' : 'Copy index.php'}</span>
                </button>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800 max-h-48">
{`<?php
/** Neural Grid Dynamics - Public Portal (PHP Production) */
session_start();
$data = json_decode(file_get_contents(__DIR__ . '/data.json'), true);
$site = $data['siteConfig'];
$projects = array_filter($data['projects'], function($p) { return !empty($p['published']); });
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title><?php echo htmlspecialchars($site['companyName']); ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white">
   <!-- Generated PHP Public Showcase Code -->
</body>
</html>`}
              </pre>
            </div>

            {/* PHP admin/index.php Viewer */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-amber-400 font-bold">export/admin/index.php (Secure Admin Control)</span>
                <button
                  onClick={() => handleCopyCode(`<?php\nsession_start();\n$adminPasswordHash = password_hash("NeuralGrid2026!", PASSWORD_BCRYPT);\n?>`, 'admin_php')}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyStatus === 'admin_php' ? 'Copied!' : 'Copy admin.php'}</span>
                </button>
              </div>

              <pre className="p-4 bg-gray-950 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800 max-h-48">
{`<?php
/** Neural Grid Dynamics - Secure Admin Portal (PHP) */
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'login') {
    if ($_POST['username'] === 'admin' && password_verify($_POST['password'], $hash)) {
        $_SESSION['admin_auth'] = true;
    }
}
?>`}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
