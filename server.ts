import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  defaultSiteConfig,
  defaultProjects,
  defaultClients,
  defaultServices
} from './src/data/initialData.js';
import {
  SiteConfig,
  Project,
  Client,
  Service,
  Inquiry,
  SecurityLog
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Local JSON Persistence Setup
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface StoreSchema {
  siteConfig: SiteConfig;
  projects: Project[];
  clients: Client[];
  services: Service[];
  inquiries: Inquiry[];
  securityLogs: SecurityLog[];
  adminPasswordHash: string; // HMAC/SHA256 hashed
  adminSalt: string;
}

// Default password setup
const defaultSalt = 'ngd_salt_2026_x890';
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

let store: StoreSchema = {
  siteConfig: defaultSiteConfig,
  projects: defaultProjects,
  clients: defaultClients,
  services: defaultServices,
  inquiries: [
    {
      id: 'inq-1',
      name: 'Sarah Jenkins',
      email: 'sjenkins@techcorp.com',
      company: 'TechCorp International',
      serviceRequested: 'Custom Enterprise LLM & RAG Architectures',
      message: 'Interested in implementing an air-gapped LLM solution for our enterprise legal documents.',
      status: 'new',
      date: '2026-07-28'
    }
  ],
  securityLogs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      event: 'System initialization & security firewall active',
      ip: '127.0.0.1',
      status: 'SUCCESS'
    }
  ],
  adminSalt: defaultSalt,
  adminPasswordHash: hashPassword('NeuralGrid2026!', defaultSalt)
};

// Load existing data if available
function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      store = { ...store, ...parsed };
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('Failed to read store file, using defaults', err);
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store file', err);
  }
}

loadStore();

// Session Management & Security
const activeSessions = new Map<string, { username: string; expiresAt: number }>();
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function addSecurityLog(event: string, ip: string, status: 'SUCCESS' | 'WARNING' | 'BLOCKED') {
  const newLog: SecurityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    event,
    ip,
    status
  };
  store.securityLogs.unshift(newLog);
  if (store.securityLogs.length > 50) {
    store.securityLogs = store.securityLogs.slice(0, 50);
  }
  saveStore();
}

function verifyAdminSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing session token.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }

  // Extend session on active request
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  (req as any).adminSession = session;
  next();
}

// Global Gemini AI Setup for public estimator tool
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Gemini client init failed:', e);
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// 1. Get Public Site Content
app.get('/api/public/site', (req, res) => {
  const publishedProjects = store.projects.filter((p) => p.published);
  res.json({
    siteConfig: store.siteConfig,
    projects: publishedProjects,
    clients: store.clients,
    services: store.services
  });
});

// 2. Submit Inquiry Form
app.post('/api/public/inquiry', (req, res) => {
  const { name, email, company, serviceRequested, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().slice(0, 100),
    company: String(company || '').trim().slice(0, 100),
    serviceRequested: String(serviceRequested || 'General Consultation').trim().slice(0, 100),
    message: String(message).trim().slice(0, 2000),
    status: 'new',
    date: new Date().toISOString().split('T')[0]
  };

  store.inquiries.unshift(newInquiry);
  saveStore();

  addSecurityLog(`Inquiry received from ${email} (${company || 'Individual'})`, req.ip || '127.0.0.1', 'SUCCESS');

  res.json({ success: true, message: 'Thank you for reaching out to Neural Grid Dynamics. Our enterprise team will respond within 24 hours.' });
});

// 3. AI Project Scope & Architecture Estimator
app.post('/api/public/ai-estimator', async (req, res) => {
  const { projectScope, industry, targetTech } = req.body;

  if (!projectScope) {
    return res.status(400).json({ success: false, message: 'Please describe your project requirements.' });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the Chief AI Architect at Neural Grid Dynamics, a top-tier AI software house like NetSol or Systems Ltd.
Analyze the following client project request and provide a structured JSON response:
Industry: ${industry || 'Technology'}
Required Tech: ${targetTech || 'AI & Cloud'}
Request: ${projectScope}

Return strictly valid JSON with this exact schema:
{
  "recommendedArchitecture": "string summary of model stack & deployment",
  "estimatedTimeline": "e.g. 6-10 Weeks",
  "recommendedStack": ["list of 4-6 specific modern tools/models like PyTorch, Llama-3, Ray, CUDA, FastAPI, etc."],
  "keyDeliverables": ["3-4 high level engineering deliverables"],
  "securityCompliance": "string summary of air-gapped or RBAC features"
}`
      });

      const text = response.text || '';
      const cleanJsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      return res.json({ success: true, estimation: parsed });
    } catch (err) {
      console.warn('Gemini estimation fallback triggered:', err);
    }
  }

  // High quality algorithmic fallback
  res.json({
    success: true,
    estimation: {
      recommendedArchitecture: `Custom ${targetTech || 'Multi-Agent Neural Grid'} with private RAG vector index & air-gapped security guardrails.`,
      estimatedTimeline: '8 - 12 Weeks',
      recommendedStack: ['PyTorch 2.3', 'FastAPI Microservices', 'Qdrant Vector Database', 'vLLM Inference Engine', 'Kubernetes Edge'],
      keyDeliverables: [
        'Production Fine-Tuned Model Weights & Quantized Pipeline',
        'Air-Gapped Enterprise REST & WebSocket API Suite',
        'Automated MLOps Retraining & Drift Monitoring Dashboard',
        'ISO 27001 & SOC-2 Compliance Audit Package'
      ],
      securityCompliance: 'Role-Based Access Control (RBAC), end-to-end TLS 1.3 encryption, and optional on-premise hardware deployment.'
    }
  });
});

// -------------------------------------------------------------
// SECURE ADMIN AUTH ROUTES
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const clientIp = req.ip || '127.0.0.1';
  const attempts = loginAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };

  // Check rate limiting / brute-force lockout
  if (attempts.lockedUntil > Date.now()) {
    const secondsRemaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    addSecurityLog(`Blocked brute-force login attempt from ${clientIp}`, clientIp, 'BLOCKED');
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Account locked for security. Try again in ${secondsRemaining} seconds.`
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  const cleanUsername = String(username).trim();
  const inputHash = hashPassword(String(password), store.adminSalt);

  const isUsernameValid = cleanUsername === 'admin';
  const isPasswordValid = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(store.adminPasswordHash));

  if (!isUsernameValid || !isPasswordValid) {
    attempts.count += 1;
    if (attempts.count >= 5) {
      attempts.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
      addSecurityLog(`IP ${clientIp} locked out due to 5 consecutive invalid login attempts.`, clientIp, 'BLOCKED');
    } else {
      addSecurityLog(`Failed admin login attempt for user '${cleanUsername}' from ${clientIp}`, clientIp, 'WARNING');
    }
    loginAttempts.set(clientIp, attempts);

    return res.status(401).json({
      success: false,
      message: 'Invalid administrative credentials. Access logged.'
    });
  }

  // Reset attempt counter on success
  loginAttempts.delete(clientIp);

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    username: cleanUsername,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
  };
  activeSessions.set(token, session);

  addSecurityLog(`Admin user '${cleanUsername}' authenticated successfully.`, clientIp, 'SUCCESS');

  res.json({
    success: true,
    token,
    username: cleanUsername,
    message: 'Administrative authentication granted.'
  });
});

// Verify Session
app.get('/api/admin/verify', verifyAdminSession, (req, res) => {
  const session = (req as any).adminSession;
  res.json({
    success: true,
    username: session.username,
    expiresAt: session.expiresAt
  });
});

// Admin Logout
app.post('/api/admin/logout', verifyAdminSession, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  addSecurityLog('Admin user logged out.', req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, message: 'Session terminated.' });
});

// Update Password
app.post('/api/admin/change-password', verifyAdminSession, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
  }

  const currentHash = hashPassword(String(currentPassword), store.adminSalt);
  if (!crypto.timingSafeEqual(Buffer.from(currentHash), Buffer.from(store.adminPasswordHash))) {
    return res.status(400).json({ success: false, message: 'Current password incorrect.' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  store.adminSalt = newSalt;
  store.adminPasswordHash = hashPassword(String(newPassword), newSalt);
  saveStore();

  addSecurityLog('Admin master password updated.', req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, message: 'Master password updated successfully.' });
});

// -------------------------------------------------------------
// PROTECTED ADMIN CRUD ROUTES
// -------------------------------------------------------------

// Admin Site Config Update
app.get('/api/admin/site', verifyAdminSession, (req, res) => {
  res.json(store.siteConfig);
});

app.put('/api/admin/site', verifyAdminSession, (req, res) => {
  store.siteConfig = { ...store.siteConfig, ...req.body };
  saveStore();
  addSecurityLog('Site settings & branding configuration updated', req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, siteConfig: store.siteConfig });
});

// Admin Projects CRUD
app.get('/api/admin/projects', verifyAdminSession, (req, res) => {
  res.json(store.projects);
});

app.post('/api/admin/projects', verifyAdminSession, (req, res) => {
  const proj = req.body;
  const newProj: Project = {
    id: `proj-${Date.now()}`,
    title: proj.title || 'New AI Solution',
    slug: (proj.title || 'new-project').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    clientName: proj.clientName || 'Enterprise Partner',
    category: proj.category || 'Generative AI',
    description: proj.description || '',
    fullCaseStudy: proj.fullCaseStudy || '',
    impactMetrics: proj.impactMetrics || '',
    technologies: Array.isArray(proj.technologies) ? proj.technologies : ['Python', 'AI'],
    imageUrl: proj.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    featured: Boolean(proj.featured),
    published: proj.published !== false,
    createdAt: new Date().toISOString().split('T')[0]
  };

  store.projects.unshift(newProj);
  saveStore();
  addSecurityLog(`Created project '${newProj.title}'`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, project: newProj });
});

app.put('/api/admin/projects/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  store.projects[idx] = { ...store.projects[idx], ...req.body, id };
  saveStore();
  addSecurityLog(`Updated project '${store.projects[idx].title}'`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, project: store.projects[idx] });
});

app.delete('/api/admin/projects/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const initialLen = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);
  if (store.projects.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  saveStore();
  addSecurityLog(`Deleted project ID ${id}`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, message: 'Project removed.' });
});

// Admin Clients CRUD
app.get('/api/admin/clients', verifyAdminSession, (req, res) => {
  res.json(store.clients);
});

app.post('/api/admin/clients', verifyAdminSession, (req, res) => {
  const c = req.body;
  const newClient: Client = {
    id: `client-${Date.now()}`,
    name: c.name || 'New Enterprise Client',
    logoUrl: c.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    industry: c.industry || 'Technology',
    website: c.website || '#',
    testimonial: c.testimonial || '',
    authorName: c.authorName || 'Executive Officer',
    authorRole: c.authorRole || 'Director',
    featured: Boolean(c.featured)
  };

  store.clients.unshift(newClient);
  saveStore();
  addSecurityLog(`Added new client '${newClient.name}'`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, client: newClient });
});

app.put('/api/admin/clients/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const idx = store.clients.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Client not found.' });
  }

  store.clients[idx] = { ...store.clients[idx], ...req.body, id };
  saveStore();
  addSecurityLog(`Updated client '${store.clients[idx].name}'`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, client: store.clients[idx] });
});

app.delete('/api/admin/clients/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  store.clients = store.clients.filter((c) => c.id !== id);
  saveStore();
  addSecurityLog(`Deleted client ID ${id}`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, message: 'Client deleted.' });
});

// Admin Services CRUD
app.get('/api/admin/services', verifyAdminSession, (req, res) => {
  res.json(store.services);
});

app.post('/api/admin/services', verifyAdminSession, (req, res) => {
  const s = req.body;
  const newService: Service = {
    id: `serv-${Date.now()}`,
    title: s.title || 'New AI Service',
    icon: s.icon || 'Cpu',
    shortDesc: s.shortDesc || '',
    features: Array.isArray(s.features) ? s.features : []
  };

  store.services.push(newService);
  saveStore();
  addSecurityLog(`Added service '${newService.title}'`, req.ip || '127.0.0.1', 'SUCCESS');
  res.json({ success: true, service: newService });
});

app.put('/api/admin/services/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Service not found.' });

  store.services[idx] = { ...store.services[idx], ...req.body, id };
  saveStore();
  res.json({ success: true, service: store.services[idx] });
});

app.delete('/api/admin/services/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  store.services = store.services.filter((s) => s.id !== id);
  saveStore();
  res.json({ success: true, message: 'Service deleted.' });
});

// Admin Inquiries
app.get('/api/admin/inquiries', verifyAdminSession, (req, res) => {
  res.json(store.inquiries);
});

app.put('/api/admin/inquiries/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx !== -1) {
    store.inquiries[idx].status = status;
    saveStore();
  }
  res.json({ success: true });
});

app.delete('/api/admin/inquiries/:id', verifyAdminSession, (req, res) => {
  const { id } = req.params;
  store.inquiries = store.inquiries.filter((i) => i.id !== id);
  saveStore();
  res.json({ success: true });
});

// Security Logs Endpoint
app.get('/api/admin/security-logs', verifyAdminSession, (req, res) => {
  res.json(store.securityLogs);
});

// Reset Data to Defaults
app.post('/api/admin/reset-data', verifyAdminSession, (req, res) => {
  store.siteConfig = defaultSiteConfig;
  store.projects = defaultProjects;
  store.clients = defaultClients;
  store.services = defaultServices;
  saveStore();
  addSecurityLog('Database reset to initial factory sample state', req.ip || '127.0.0.1', 'WARNING');
  res.json({ success: true, message: 'Data reset to defaults.' });
});

// -------------------------------------------------------------
// VITE OR STATIC SERVER MIDDLEWARE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
