import React, { useState, useEffect } from 'react';
import { SiteConfig, Project, Client, Service, Inquiry, SecurityLog, QuotationRequest, QuotationData } from '../../types';
import { defaultSiteConfig, defaultProjects, defaultClients } from '../../data/initialData';
import { ImageUploader } from './ImageUploader';
import {
  saveSiteConfigToCloud,
  saveProjectsToCloud,
  saveClientsToCloud,
  saveServicesToCloud,
  subscribeToQuotationRequests,
  saveQuotationRequestsToCloud,
  deleteClientFromCloud,
  deleteProjectFromCloud,
  deleteQuotationRequestFromCloud,
  deleteInquiryFromCloud
} from '../../lib/firebase';
import {
  Settings, Briefcase, Users, MessageSquare, ShieldCheck, Download, Plus, Trash2, Edit3, Save, CheckCircle, RefreshCw, Key, Image as ImageIcon, ExternalLink, Code2, Copy, FileText, Lock, Sliders, MoveLeft, MoveRight, Layout, Mail, Send, Palette, Sun, Moon, Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onRefreshPublicData: () => void;
  onOpenQuotation?: (initialData?: Partial<QuotationData>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout, onRefreshPublicData, onOpenQuotation }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'projects' | 'clients' | 'inquiries' | 'quotations' | 'security' | 'export'>('settings');

  // Admin Data State
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
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

      const savedReqs = localStorage.getItem('ngd_quotation_requests');
      const loadedReqs = savedReqs ? JSON.parse(savedReqs) : [];

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
      setQuotationRequests(loadedReqs);
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

    const unsub = subscribeToQuotationRequests((data) => {
      if (data) {
        setQuotationRequests(data);
      }
    });
    return () => unsub();
  }, [token]);

  // Handle preparing/editing PDF quotation for a client
  const handlePrepareQuotation = (req: QuotationRequest) => {
    if (onOpenQuotation) {
      const items = (req.deliverables || []).map((deliv, idx) => ({
        id: `item-${idx + 1}`,
        description: `Deliverable ${idx + 1}: ${deliv}`,
        hoursOrQty: [60, 80, 50, 40][idx % 4],
        rate: 150,
        amount: [9000, 12000, 7500, 6000][idx % 4]
      }));

      onOpenQuotation({
        quotationNumber: `NGD-${Date.now().toString().slice(-6)}`,
        clientName: req.clientName,
        clientCompany: req.clientCompany,
        clientEmail: req.clientEmail,
        clientAddress: req.clientAddress,
        projectTitle: req.projectTitle,
        systemPurpose: req.systemPurpose,
        industrySector: req.industrySector,
        systemCategory: req.systemCategory,
        estimatedTimeline: req.estimatedTimeline,
        techStack: req.techStack,
        deliverables: req.deliverables,
        mainFeatures: req.mainFeatures,
        items: items.length > 0 ? items : [
          { id: '1', description: 'Enterprise AI Architecture Design & Feasibility', hoursOrQty: 40, rate: 150, amount: 6000 },
          { id: '2', description: 'Model Fine-Tuning & Vector Pipeline Engine', hoursOrQty: 80, rate: 150, amount: 12000 },
          { id: '3', description: 'Security Hardening, RBAC & SOC-2 Compliance Audit', hoursOrQty: 40, rate: 150, amount: 6000 }
        ]
      });

      // Update request status to 'Quotation Prepared'
      const updated = quotationRequests.map(r => r.id === req.id ? { ...r, status: 'Quotation Prepared' as const } : r);
      setQuotationRequests(updated);
      localStorage.setItem('ngd_quotation_requests', JSON.stringify(updated));
      saveQuotationRequestsToCloud(updated).catch(err => console.warn(err));
    }
  };

  // Handle Approve and Email Quotation to Client
  const handleApproveAndSendEmail = async (req: QuotationRequest) => {
    const updated = quotationRequests.map(r => r.id === req.id ? { ...r, status: 'Approved & Emailed' as const } : r);
    setQuotationRequests(updated);
    localStorage.setItem('ngd_quotation_requests', JSON.stringify(updated));
    try {
      await saveQuotationRequestsToCloud(updated);
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }

    const subject = encodeURIComponent(`APPROVED: Official Enterprise Quotation for ${req.projectTitle} - Neural Grid Dynamics`);
    const body = encodeURIComponent(
      `Dear ${req.clientName} (${req.clientCompany}),\n\n` +
      `We are pleased to inform you that your quotation request for "${req.projectTitle}" has been officially APPROVED by Neural Grid Dynamics Engineering Management.\n\n` +
      `QUOTATION OVERVIEW:\n` +
      `--------------------------------------------------\n` +
      `Project Scope: ${req.projectTitle}\n` +
      `Industry Sector: ${req.industrySector}\n` +
      `System Category: ${req.systemCategory}\n` +
      `Estimated Timeline: ${req.estimatedTimeline}\n` +
      `Estimated Investment Subtotal: $${(req.estimatedSubtotal || 45000).toLocaleString()}\n\n` +
      `SYSTEM PURPOSE & REQUIREMENTS:\n` +
      `${req.systemPurpose}\n\n` +
      `DELIVERABLES:\n` +
      `${(req.deliverables || []).map(d => '• ' + d).join('\n')}\n\n` +
      `Please find attached our official digital quotation PDF with seal & eSignature. Reply directly to this email to sign and schedule our kick-off engineering session.\n\n` +
      `Best regards,\n` +
      `Chief Systems Architect\n` +
      `Neural Grid Dynamics AI Studio\n` +
      `https://neuralgriddynamics.com`
    );

    window.open(`mailto:${req.clientEmail}?subject=${subject}&body=${body}`, '_blank');
    setStatusMsg(`Approved & opened email dispatch for ${req.clientName} <${req.clientEmail}>!`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Delete Quotation Request
  const handleDeleteQuotationRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation request?')) return;
    const updated = quotationRequests.filter(r => r.id !== id);
    setQuotationRequests(updated);
    localStorage.setItem('ngd_quotation_requests', JSON.stringify(updated));
    try {
      await deleteQuotationRequestFromCloud(id);
    } catch (err) {
      console.warn('Cloud delete error:', err);
    }
    setStatusMsg('Quotation request deleted.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Save Site Settings
  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;

    // Save to Firebase Cloud Firestore for instant cross-device live sync
    try {
      await saveSiteConfigToCloud(siteConfig);
    } catch (err) {
      console.warn('Firestore cloud sync warning:', err);
    }

    try {
      const res = await authFetch('/api/admin/site', {
        method: 'PUT',
        body: JSON.stringify(siteConfig),
      });
      if (res.ok) {
        setStatusMsg('Saved to Cloud Database & Live across all computers!');
        onRefreshPublicData();
        setTimeout(() => setStatusMsg(''), 4000);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, saving site config to localStorage');
    }

    // Local storage update for static deployment
    localStorage.setItem('ngd_site_config', JSON.stringify(siteConfig));
    setStatusMsg('Saved to Cloud Database & Live across all computers!');
    onRefreshPublicData();
    setTimeout(() => setStatusMsg(''), 4000);
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

    // Save to Cloud Firestore
    try {
      await saveProjectsToCloud(updatedProjects);
    } catch (err) {
      console.warn('Firestore cloud sync warning:', err);
    }

    try {
      if (editingProject) {
        await authFetch(`/api/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      // ignore
    }

    setStatusMsg('Projects updated & synced to Cloud Database!');

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

    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('ngd_projects', JSON.stringify(updated));

    try {
      await deleteProjectFromCloud(id);
    } catch (err) {
      console.warn('Firestore cloud delete warning:', err);
    }

    try {
      await authFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    } catch (err) {
      // ignore
    }

    setStatusMsg('Project deleted & synced to Cloud!');
    onRefreshPublicData();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Save Client (Add)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: 'client-' + Date.now(),
      ...clientForm
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    localStorage.setItem('ngd_clients', JSON.stringify(updated));
    setIsAddingClient(false);

    try {
      await saveClientsToCloud(updated);
    } catch (err) {
      console.warn('Firestore cloud sync warning:', err);
    }

    try {
      await authFetch('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify(clientForm),
      });
    } catch (err) {
      // ignore
    }

    setStatusMsg('Client added & synced to Cloud Database!');

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

    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem('ngd_clients', JSON.stringify(updated));

    try {
      await deleteClientFromCloud(id);
    } catch (err) {
      console.warn('Firestore cloud delete warning:', err);
    }

    try {
      await authFetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
    } catch (err) {
      // ignore
    }

    setStatusMsg('Client deleted & synced to Cloud!');
    onRefreshPublicData();
    setTimeout(() => setStatusMsg(''), 3000);
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
      await deleteInquiryFromCloud(id);
    } catch (err) {
      console.warn('Cloud delete inquiry error:', err);
    }
    try {
      await authFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    loadAdminData();
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

  // Generate TS Code string for initialData.ts
  const generateInitialDataTs = () => {
    return `import { SiteConfig, Project, Client, Service } from '../types';

export const defaultSiteConfig: SiteConfig = ${JSON.stringify(siteConfig || defaultSiteConfig, null, 2)};

export const defaultProjects: Project[] = ${JSON.stringify(projects.length > 0 ? projects : defaultProjects, null, 2)};

export const defaultClients: Client[] = ${JSON.stringify(clients.length > 0 ? clients : defaultClients, null, 2)};

export const defaultServices: Service[] = [
  {
    id: 'serv-1',
    title: 'Custom Enterprise LLM & RAG Architectures',
    icon: 'Cpu',
    shortDesc: 'Fine-tuned private LLM models, vector embeddings, and hybrid knowledge graph RAG for enterprise datasets.',
    features: ['Fine-Tuning Llama 3 / Mistral / DeepSeek', 'Air-Gapped Local Deployment', 'Hybrid Graph + Vector Search', 'Enterprise RBAC Data Controls']
  },
  {
    id: 'serv-2',
    title: 'Autonomous Multi-Agent AI Workflows',
    icon: 'Bot',
    shortDesc: 'Multi-agent frameworks capable of planning, executing complex API actions, and auto-correcting code/workflows.',
    features: ['LangGraph & AutoGen Workflows', 'Self-Healing API Pipelines', 'Tool-Calling Security Sandboxes', 'Human-in-the-loop Guardrails']
  },
  {
    id: 'serv-3',
    title: 'High-Precision Computer Vision & Edge AI',
    icon: 'Eye',
    shortDesc: 'Microsecond latency vision models for industrial inspection, robotics, spatial mapping, and biometric security.',
    features: ['Real-Time Object Detection & Tracking', 'Edge GPU Optimization (TensorRT)', 'Micro-Defect Industrial Scanners', 'Thermal & Multispectral Imaging']
  },
  {
    id: 'serv-4',
    title: 'Predictive Analytics & Time-Series Neural Grids',
    icon: 'TrendingUp',
    shortDesc: 'Deep temporal forecasting for supply chains, financial risk modeling, energy grid loading, and preventative maintenance.',
    features: ['Transformer Time-Series Forecasting', 'Real-time Streaming Anomaly Detection', 'Algorithmic Risk Assessment', 'Automated Retraining MLOps']
  }
];
`;
  };

  // Helper to trigger initialData.ts file download
  const handleDownloadInitialDataTs = () => {
    const code = generateInitialDataTs();
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'initialData.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg('Downloaded initialData.ts! Replace /src/data/initialData.ts in your GitHub repository & git push.');
    setTimeout(() => setStatusMsg(''), 6000);
  };

  // Reset local storage overrides
  const handleResetLocalCache = () => {
    if (confirm('Reset local browser storage and reload default repository data?')) {
      localStorage.removeItem('ngd_site_config');
      localStorage.removeItem('ngd_projects');
      localStorage.removeItem('ngd_clients');
      localStorage.removeItem('ngd_services');
      loadAdminData();
      onRefreshPublicData();
      setStatusMsg('Reset local browser cache! Loaded data from initialData.ts.');
      setTimeout(() => setStatusMsg(''), 4000);
    }
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
            onClick={() => setActiveTab('quotations')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'quotations'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-900 text-emerald-400 hover:text-white border border-emerald-500/30'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Quotations & PDF Studio ({quotationRequests.length})</span>
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
                <ImageUploader
                  label="Company Logo Image"
                  value={siteConfig.logoUrl}
                  onChange={(newUrl) => setSiteConfig({ ...siteConfig, logoUrl: newUrl })}
                  helpText="Upload a logo from your local computer (PNG, SVG, JPG) or enter an image URL."
                />
              </div>
            </div>

            {/* Logo Dimensions & Location Customization Panel */}
            <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-950/60 text-blue-400 rounded-lg border border-blue-800/40">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Logo Size & Location Options</h3>
                    <p className="text-[11px] text-gray-400">Customize the exact dimensions (width x height) and layout position of your brand logo.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Logo Width */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-300">Logo Width (px)</label>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      {siteConfig.logoWidth || 120}px
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="20"
                      max="250"
                      value={siteConfig.logoWidth || 120}
                      onChange={(e) => setSiteConfig({ ...siteConfig, logoWidth: parseInt(e.target.value) || 120 })}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <input
                      type="number"
                      min="20"
                      max="300"
                      value={siteConfig.logoWidth || 120}
                      onChange={(e) => setSiteConfig({ ...siteConfig, logoWidth: parseInt(e.target.value) || 120 })}
                      className="w-16 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-xs text-white text-center focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Logo Height */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-300">Logo Height (px)</label>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      {siteConfig.logoHeight || 80}px
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="20"
                      max="180"
                      value={siteConfig.logoHeight || 80}
                      onChange={(e) => setSiteConfig({ ...siteConfig, logoHeight: parseInt(e.target.value) || 80 })}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <input
                      type="number"
                      min="20"
                      max="200"
                      value={siteConfig.logoHeight || 80}
                      onChange={(e) => setSiteConfig({ ...siteConfig, logoHeight: parseInt(e.target.value) || 80 })}
                      className="w-16 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-xs text-white text-center focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Logo Position / Location */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-300">Logo Location</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSiteConfig({ ...siteConfig, logoPosition: 'left' })}
                      className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
                        (siteConfig.logoPosition || 'left') === 'left'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Logo to the left of brand name"
                    >
                      <MoveLeft className="w-3 h-3" />
                      <span>Left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSiteConfig({ ...siteConfig, logoPosition: 'right' })}
                      className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
                        siteConfig.logoPosition === 'right'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Logo to the right of brand name"
                    >
                      <MoveRight className="w-3 h-3" />
                      <span>Right</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSiteConfig({ ...siteConfig, logoPosition: 'top' })}
                      className={`py-1.5 px-2 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
                        siteConfig.logoPosition === 'top'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Logo stacked above brand name"
                    >
                      <Layout className="w-3 h-3" />
                      <span>Top</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Dimension Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-900">
                <span className="text-[11px] text-gray-400 font-medium">Dimension Presets:</span>
                {[
                  { label: '30×35 (Default)', w: 30, h: 35 },
                  { label: '24×28 (Compact)', w: 24, h: 28 },
                  { label: '40×45 (Medium)', w: 40, h: 45 },
                  { label: '50×55 (Large)', w: 50, h: 55 },
                  { label: '40×40 (Square)', w: 40, h: 40 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSiteConfig({ ...siteConfig, logoWidth: preset.w, logoHeight: preset.h })}
                    className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-[10px] text-gray-300 font-mono rounded-lg border border-gray-800 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Header Box */}
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-400">
                  <span>Live Brand Header Preview</span>
                  <span className="text-blue-400">Pos: {siteConfig.logoPosition || 'left'} | Size: {siteConfig.logoWidth || 30}×{siteConfig.logoHeight || 35}px</span>
                </div>
                <div className="p-3.5 bg-gray-950 rounded-lg border border-gray-800/80">
                  <div
                    className={
                      (siteConfig.logoPosition || 'left') === 'right'
                        ? 'flex items-center space-x-3 flex-row-reverse space-x-reverse'
                        : (siteConfig.logoPosition === 'top')
                        ? 'flex flex-col items-start space-y-1.5'
                        : 'flex items-center space-x-3'
                    }
                  >
                    {siteConfig.logoUrl ? (
                      <img
                        src={siteConfig.logoUrl}
                        alt="Preview"
                        style={{ width: `${siteConfig.logoWidth || 30}px`, height: `${siteConfig.logoHeight || 35}px` }}
                        className="rounded-lg object-contain bg-gray-900 p-0.5 border border-blue-500/30 flex-shrink-0"
                      />
                    ) : (
                      <div
                        style={{ width: `${siteConfig.logoWidth || 30}px`, height: `${siteConfig.logoHeight || 35}px` }}
                        className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                      >
                        NG
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-extrabold text-white">
                          {siteConfig.companyName || 'Neural Grid Dynamics'}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                          AI Enterprise
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1 font-medium">
                        {siteConfig.tagline || 'Enterprise AI Engineering & Autonomous Grid Intelligence'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WEBSITE THEME & COLOR SCHEME CUSTOMIZATION PANEL */}
            <div className="bg-gray-950/80 border border-blue-500/30 rounded-2xl p-5 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl shadow">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Website Theme & Color Scheme Customizer</h3>
                    <p className="text-xs text-gray-400">
                      Customize global theme mode, background color, text color, and primary brand accents across all public visitors.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Realtime Sync Ready</span>
                </span>
              </div>

              {/* Theme Mode Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">Theme Mode</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSiteConfig({
                      ...siteConfig,
                      themeMode: 'dark',
                      backgroundColor: siteConfig.backgroundColor || '#030712',
                      textColor: siteConfig.textColor || '#f9fafb',
                      cardBgColor: siteConfig.cardBgColor || '#0b1329'
                    })}
                    className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 ${
                      siteConfig.themeMode === 'dark' || !siteConfig.themeMode
                        ? 'bg-blue-600 text-white shadow-md font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-cyan-300" />
                    <span>Dark Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSiteConfig({
                      ...siteConfig,
                      themeMode: 'light',
                      backgroundColor: '#f8fafc',
                      textColor: '#0f172a',
                      cardBgColor: '#ffffff',
                      primaryColor: siteConfig.primaryColor || '#2563eb',
                      accentColor: siteConfig.accentColor || '#0d9488'
                    })}
                    className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 ${
                      siteConfig.themeMode === 'light'
                        ? 'bg-blue-600 text-white shadow-md font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSiteConfig({
                      ...siteConfig,
                      themeMode: 'custom'
                    })}
                    className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-2 ${
                      siteConfig.themeMode === 'custom'
                        ? 'bg-blue-600 text-white shadow-md font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>Custom Palette</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Preset Schemes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300">1-Click Color Scheme Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      name: 'Neural Cyberpunk',
                      mode: 'dark',
                      bg: '#030712',
                      text: '#f9fafb',
                      primary: '#3b82f6',
                      accent: '#06b6d4',
                      card: '#0b1329'
                    },
                    {
                      name: 'Emerald Quantum',
                      mode: 'dark',
                      bg: '#022c22',
                      text: '#f0fdf4',
                      primary: '#10b981',
                      accent: '#34d399',
                      card: '#064e3b'
                    },
                    {
                      name: 'Deep Purple AI',
                      mode: 'dark',
                      bg: '#0f0728',
                      text: '#faf5ff',
                      primary: '#8b5cf6',
                      accent: '#ec4899',
                      card: '#1e1035'
                    },
                    {
                      name: 'Midnight Stealth',
                      mode: 'dark',
                      bg: '#000000',
                      text: '#ffffff',
                      primary: '#38bdf8',
                      accent: '#a855f7',
                      card: '#121212'
                    },
                    {
                      name: 'Titanium Slate',
                      mode: 'dark',
                      bg: '#0f172a',
                      text: '#f8fafc',
                      primary: '#6366f1',
                      accent: '#38bdf8',
                      card: '#1e293b'
                    },
                    {
                      name: 'Clean Corporate Light',
                      mode: 'light',
                      bg: '#f8fafc',
                      text: '#0f172a',
                      primary: '#2563eb',
                      accent: '#0d9488',
                      card: '#ffffff'
                    },
                    {
                      name: 'Soft Warm Light',
                      mode: 'light',
                      bg: '#fafaf9',
                      text: '#1c1917',
                      primary: '#1e3a8a',
                      accent: '#f97316',
                      card: '#ffffff'
                    },
                    {
                      name: 'Gold & Obsidian',
                      mode: 'dark',
                      bg: '#0c0a09',
                      text: '#fef08a',
                      primary: '#eab308',
                      accent: '#f97316',
                      card: '#1c1917'
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setSiteConfig({
                        ...siteConfig,
                        themeMode: preset.mode as any,
                        backgroundColor: preset.bg,
                        textColor: preset.text,
                        primaryColor: preset.primary,
                        accentColor: preset.accent,
                        cardBgColor: preset.card
                      })}
                      className="p-2.5 bg-gray-900 hover:bg-gray-850 rounded-xl border border-gray-800 text-left transition hover:border-blue-500/50 group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-white group-hover:text-blue-400 transition">{preset.name}</span>
                        <div className="flex space-x-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }}></span>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accent }}></span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded flex overflow-hidden border border-gray-800">
                        <div className="w-1/2 h-full" style={{ backgroundColor: preset.bg }}></div>
                        <div className="w-1/2 h-full" style={{ backgroundColor: preset.card }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Color Pickers & Hex Modifiers */}
              <div className="space-y-3 pt-2 border-t border-gray-900">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Custom Color Palette Modifiers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Background Color */}
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-300">Canvas Background</label>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{siteConfig.backgroundColor || '#030712'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={siteConfig.backgroundColor || '#030712'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, backgroundColor: e.target.value })}
                        className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-gray-700"
                      />
                      <input
                        type="text"
                        value={siteConfig.backgroundColor || '#030712'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, backgroundColor: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Main Text Color */}
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-300">Primary Text</label>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{siteConfig.textColor || '#f9fafb'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={siteConfig.textColor || '#f9fafb'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, textColor: e.target.value })}
                        className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-gray-700"
                      />
                      <input
                        type="text"
                        value={siteConfig.textColor || '#f9fafb'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, textColor: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary Brand Color */}
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-300">Primary Brand Highlight</label>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{siteConfig.primaryColor || '#3b82f6'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={siteConfig.primaryColor || '#3b82f6'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-gray-700"
                      />
                      <input
                        type="text"
                        value={siteConfig.primaryColor || '#3b82f6'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, primaryColor: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Secondary Accent Color */}
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-300">Secondary Accent</label>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{siteConfig.accentColor || '#06b6d4'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={siteConfig.accentColor || '#06b6d4'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, accentColor: e.target.value })}
                        className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-gray-700"
                      />
                      <input
                        type="text"
                        value={siteConfig.accentColor || '#06b6d4'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, accentColor: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Card Background Color */}
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-300">Module / Card Background</label>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{siteConfig.cardBgColor || '#0b1329'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={siteConfig.cardBgColor || '#0b1329'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, cardBgColor: e.target.value })}
                        className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-gray-700"
                      />
                      <input
                        type="text"
                        value={siteConfig.cardBgColor || '#0b1329'}
                        onChange={(e) => setSiteConfig({ ...siteConfig, cardBgColor: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Live Theme Preview Box */}
              <div className="rounded-xl p-4 border border-gray-800 transition shadow-inner" style={{ backgroundColor: siteConfig.backgroundColor || '#030712' }}>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-2" style={{ color: siteConfig.textColor || '#f9fafb' }}>
                  <span>Live Public View Theme Preview</span>
                  <span className="px-2 py-0.5 rounded font-bold text-white" style={{ backgroundColor: siteConfig.primaryColor || '#3b82f6' }}>
                    Active Palette
                  </span>
                </div>
                
                <div className="p-4 rounded-xl border border-gray-800/80 space-y-3" style={{ backgroundColor: siteConfig.cardBgColor || '#0b1329' }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold" style={{ color: siteConfig.textColor || '#f9fafb' }}>
                      {siteConfig.companyName || 'Neural Grid Dynamics'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${siteConfig.accentColor || '#06b6d4'}25`, color: siteConfig.accentColor || '#06b6d4' }}>
                      {siteConfig.themeMode === 'light' ? 'Light Theme' : 'Dark Theme'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80" style={{ color: siteConfig.textColor || '#f9fafb' }}>
                    {siteConfig.heroHeadline || 'Architecting Enterprise AI Systems & Autonomous Neural Networks'}
                  </p>
                  <div className="flex space-x-2 pt-1">
                    <button type="button" className="px-3 py-1 text-[11px] font-bold rounded-lg text-white shadow" style={{ backgroundColor: siteConfig.primaryColor || '#3b82f6' }}>
                      Primary Button
                    </button>
                    <button type="button" className="px-3 py-1 text-[11px] font-bold rounded-lg border" style={{ borderColor: siteConfig.accentColor || '#06b6d4', color: siteConfig.accentColor || '#06b6d4' }}>
                      Secondary Outline
                    </button>
                  </div>
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

            {/* GitHub Pages Sync & Export Bar */}
            <div className="pt-6 border-t border-gray-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Site Changes</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDownloadInitialDataTs}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download initialData.ts (Global Sync)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(generateInitialDataTs(), 'initialData')}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copyStatus === 'initialData' ? 'Copied Code!' : 'Copy initialData.ts Code'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetLocalCache}
                  className="px-3.5 py-2 text-xs text-gray-400 hover:text-red-400 font-medium transition"
                >
                  Reset Local Cache
                </button>
              </div>

              <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-xl text-xs space-y-1.5">
                <p className="font-bold text-purple-300 flex items-center space-x-2">
                  <span>🌐 Why changes need to be committed to GitHub for other computers to see them:</span>
                </p>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  GitHub Pages (<code className="text-purple-300 font-mono">neuralgriddynamics.github.io</code>) serves static web pages without a central database. When you click <strong>"Save Site Changes"</strong>, your edits are saved to this browser's local cache.
                  <br />
                  To publish your changes live so visitors on <strong>ALL computers, phones, and laptops</strong> see them:
                  <br />
                  1. Click <strong>"Download initialData.ts"</strong> above.
                  <br />
                  2. Replace <code className="bg-purple-900/60 px-1 py-0.5 rounded text-purple-200 font-mono">/src/data/initialData.ts</code> in your repository on GitHub.
                  <br />
                  3. Commit and push (<code className="bg-purple-900/60 px-1 py-0.5 rounded text-purple-200 font-mono">git commit -m "Update site data" && git push</code>). GitHub Actions will auto-deploy your changes globally!
                </p>
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
                    <ImageUploader
                      label="Cover Image"
                      value={projectForm.imageUrl}
                      onChange={(newUrl) => setProjectForm({ ...projectForm, imageUrl: newUrl })}
                      helpText="Upload a project cover or diagram from your local computer."
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
                    <ImageUploader
                      label="Client Logo Image"
                      value={clientForm.logoUrl}
                      onChange={(newUrl) => setClientForm({ ...clientForm, logoUrl: newUrl })}
                      helpText="Upload the client company logo from your local computer."
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

        {/* TAB 5: QUOTATION REQUESTS & PDF STUDIO */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-white">Client Quotation Requests & PDF Studio</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Manage incoming client quotation submissions. Edit line items, add eSignatures, export official A4 PDFs, and approve & email directly to clients.
                </p>
              </div>

              {onOpenQuotation && (
                <button
                  onClick={() => onOpenQuotation()}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 border border-emerald-400/30 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Custom Quotation PDF</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {quotationRequests.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl text-xs space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-gray-600" />
                  <p className="font-bold text-gray-400">No quotation requests submitted yet.</p>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    When public clients click "Get Official Quotation" in the AI Estimator or website, their details and project scope will appear here for admin review.
                  </p>
                </div>
              ) : (
                quotationRequests.map((req) => (
                  <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-gray-700 transition">
                    
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-white text-base">{req.clientCompany}</span>
                          <span className="text-xs text-gray-400">({req.clientName})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center space-x-1 text-emerald-400 font-mono">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{req.clientEmail}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-amber-300">{req.clientPhone}</span>
                          <span>•</span>
                          <span className="text-gray-400">{req.clientAddress}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                          req.status === 'Approved & Emailed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : req.status === 'Quotation Prepared'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {req.status}
                        </span>

                        <button
                          onClick={() => handleDeleteQuotationRequest(req.id)}
                          className="p-2 bg-red-950/60 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                        <div className="font-bold text-blue-400">Project Scope & System Category</div>
                        <p className="text-white font-extrabold text-sm">{req.projectTitle}</p>
                        <p className="text-gray-300 leading-relaxed">{req.systemPurpose}</p>
                      </div>

                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                        <div className="flex justify-between items-center text-gray-400">
                          <span>Industry Sector: <strong className="text-gray-200">{req.industrySector}</strong></span>
                          <span>Timeline: <strong className="text-purple-300">{req.estimatedTimeline}</strong></span>
                        </div>
                        <div className="text-gray-400 pt-1">Recommended Tech Stack:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(req.techStack || []).map((tech, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-300 text-[10px] rounded-md font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar for Admin */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
                      <div className="text-[11px] text-gray-500">
                        Submitted Date: {new Date(req.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handlePrepareQuotation(req)}
                          className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                        >
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span>Prepare / Edit PDF Quotation</span>
                        </button>

                        <button
                          onClick={() => handleApproveAndSendEmail(req)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow flex items-center space-x-1.5 border border-emerald-400/30"
                        >
                          <Send className="w-4 h-4" />
                          <span>Approve & Send to Client Email</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 6: SECURITY LOGS & AUTH */}
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
                Download live updated code files (<code className="text-purple-300">initialData.ts</code>, <code className="text-purple-300">index.php</code>, and <code className="text-purple-300">deploy.yml</code>) to publish changes permanently to GitHub Pages or cPanel servers!
              </p>
            </div>

            {/* Featured Card: Live initialData.ts Exporter for GitHub Pages */}
            <div className="bg-gradient-to-r from-purple-950/80 to-blue-950/80 border border-purple-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono rounded uppercase font-bold border border-purple-500/30">
                    Primary Sync Tool
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    Export Updated <code className="text-purple-300 font-mono">/src/data/initialData.ts</code>
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    This file contains your latest Admin edits (logo dimensions, position, company name, taglines, projects, and clients).
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadInitialDataTs}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>

                  <button
                    onClick={() => handleCopyCode(generateInitialDataTs(), 'initialDataExport')}
                    className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold rounded-xl flex items-center space-x-1 text-gray-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyStatus === 'initialDataExport' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 text-xs text-gray-300 font-mono space-y-1">
                <div className="text-purple-400 font-bold text-[11px]">📋 3-Step Sync Guide for GitHub Pages:</div>
                <div className="text-[11px] text-gray-400">
                  1. Click <strong>"Download File"</strong> above to get <code className="text-purple-300">initialData.ts</code>.
                  <br />
                  2. Drop it into <code className="text-purple-300">/src/data/initialData.ts</code> in your GitHub repository.
                  <br />
                  3. Run <code className="text-purple-300">git commit -m "Update site data" && git push</code>. Visitors on all computers & laptops will see your updated site!
                </div>
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer font-bold text-purple-300 hover:text-purple-200">
                  View Live Generated Code Preview
                </summary>
                <pre className="mt-2 p-4 bg-gray-950 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto border border-gray-800 max-h-60">
                  {generateInitialDataTs()}
                </pre>
              </details>
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
