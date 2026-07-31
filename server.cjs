var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/data/initialData.ts
var defaultSiteConfig = {
  companyName: "Neural Grid Dynamics",
  tagline: "Enterprise AI Engineering & Autonomous Grid Intelligence",
  logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
  logoWidth: 30,
  logoHeight: 35,
  logoPosition: "left",
  heroHeadline: "Architecting Enterprise AI Systems & Autonomous Neural Networks",
  heroSubhead: "Neural Grid Dynamics delivers production-ready Generative AI platforms, bespoke Large Language Models, Computer Vision pipelines, and MLOps cloud infrastructure for world-leading enterprises.",
  contactEmail: "solutions@neuralgrid.ai",
  contactPhone: "+1 (888) 902-GRID",
  address: "750 Innovation Parkway, Suite 1200, San Jose, CA 95134",
  stats: {
    projectsCompleted: 142,
    enterpriseClients: 48,
    modelAccuracyRate: "99.85%",
    cloudUptime: "99.999%"
  },
  themeMode: "dark"
};
var defaultProjects = [
  {
    id: "proj-1",
    title: "Autonomous Multi-Agent FinTech Fraud Detection Grid",
    slug: "fintech-fraud-grid",
    clientName: "Global Capital Financial",
    category: "FinTech AI",
    description: "Real-time transaction analysis processing 80,000 requests/sec with neural anomaly detection and automated fraud mitigation.",
    fullCaseStudy: "We engineered a low-latency multi-agent neural architecture for Global Capital Financial. Utilizing custom transformer models deployed on edge servers, the platform screens international banking transactions in under 12 milliseconds with 99.94% precision, saving over $14.2M in quarterly fraud losses.",
    impactMetrics: "99.94% Accuracy \u2022 12ms Latency \u2022 $14.2M Quarterly Savings",
    technologies: ["PyTorch", "Kafka", "TensorRT", "FastAPI", "Kubernetes"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    featured: true,
    published: true,
    createdAt: "2026-03-15"
  },
  {
    id: "proj-2",
    title: "Enterprise On-Premise LLM & Knowledge Graph",
    slug: "enterprise-llm-knowledge-graph",
    clientName: "AeroDynamics Aerospace Corp",
    category: "Enterprise LLMs",
    description: "Air-gapped secure Generative AI search and automated technical compliance engine indexing 15 million engineering blueprints.",
    fullCaseStudy: "AeroDynamics required an entirely offline, air-gapped LLM solution to analyze complex CAD metadata, compliance manuals, and flight logs. Neural Grid Dynamics deployed a quantised 70B parameter MoE architecture with hybrid vector graph RAG, cutting engineering audit times by 75%.",
    impactMetrics: "75% Faster Audits \u2022 15M Documents Indexed \u2022 0% Data Leak Risk",
    technologies: ["Custom Llama-3 Fine-Tune", "Qdrant", "Neo4j", "vLLM", "Docker"],
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    featured: true,
    published: true,
    createdAt: "2026-04-02"
  },
  {
    id: "proj-3",
    title: "Industrial Quality Inspection Computer Vision Pipeline",
    slug: "industrial-vision-pipeline",
    clientName: "NetSol Auto Systems",
    category: "Computer Vision",
    description: "High-speed robotic assembly defect detection running on edge GPUs with microsecond shutter synchronization.",
    fullCaseStudy: "Engineered an end-to-end computer vision inspection framework for automated vehicle manufacturing lines. Deployed YOLOv8 custom models integrated with factory PLCs, capturing micro-surface flaws at 120 frames per second.",
    impactMetrics: "0.01mm Defect Resolution \u2022 120 FPS Edge Inference \u2022 98% Recall Rate",
    technologies: ["OpenCV", "CUDA", "TensorRT", "C++", "GStreamer"],
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
    featured: true,
    published: true,
    createdAt: "2026-05-10"
  },
  {
    id: "proj-4",
    title: "Predictive Energy Grid Orchestrator",
    slug: "predictive-energy-grid",
    clientName: "Systems Global Utilities",
    category: "Generative AI",
    description: "Deep reinforcement learning model optimizing renewable power distribution across regional smart electrical grids.",
    fullCaseStudy: "Partnered with Systems Global Utilities to forecast wind and solar power outputs while predicting demand spikes. The neural network adjusts grid transformers autonomously every 30 seconds.",
    impactMetrics: "18% Carbon Reduction \u2022 320MW Energy Saved \u2022 99.999% Reliability",
    technologies: ["Ray RLlib", "Python", "TimesScaleDB", "Go", "AWS SageMaker"],
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80",
    featured: false,
    published: true,
    createdAt: "2026-06-01"
  }
];
var defaultClients = [
  {
    id: "client-1",
    name: "Global Capital Financial",
    logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80",
    industry: "Banking & Financial Tech",
    website: "https://globalcapital.com",
    testimonial: "Neural Grid Dynamics deployed our AI fraud engine 3 months ahead of schedule. Their engineering rigor matches top tier defense contractors.",
    authorName: "David Sterling",
    authorRole: "Chief Information Security Officer",
    featured: true
  },
  {
    id: "client-2",
    name: "AeroDynamics Aerospace",
    logoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=200&auto=format&fit=crop&q=80",
    industry: "Defense & Aerospace",
    website: "https://aerodynamics-corp.com",
    testimonial: "The air-gapped LLM knowledge engine transformed how our 4,000 aerospace engineers retrieve critical telemetry data.",
    authorName: "Dr. Ellen Vance",
    authorRole: "VP of Engineering Systems",
    featured: true
  },
  {
    id: "client-3",
    name: "NetSol Auto Systems",
    logoUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&auto=format&fit=crop&q=80",
    industry: "Automotive & Robotics",
    website: "https://netsol-auto.com",
    testimonial: "Their edge computer vision solution reduced our assembly line component scrap rate by $3.8M in year one.",
    authorName: "Marcus Thorne",
    authorRole: "Global Operations Director",
    featured: true
  },
  {
    id: "client-4",
    name: "Systems Global Utilities",
    logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80",
    industry: "Clean Energy & Smart Grids",
    website: "https://systems-utilities.com",
    testimonial: "Reliable, highly scalable, and deep domain knowledge in time-series neural models. Neural Grid is our primary AI innovation partner.",
    authorName: "Sofia Al-Mansoor",
    authorRole: "Chief Innovation Officer",
    featured: true
  }
];
var defaultServices = [
  {
    id: "serv-1",
    title: "Custom Enterprise LLM & RAG Architectures",
    icon: "Cpu",
    shortDesc: "Fine-tuned private LLM models, vector embeddings, and hybrid knowledge graph RAG for enterprise datasets.",
    features: ["Fine-Tuning Llama 3 / Mistral / DeepSeek", "Air-Gapped Local Deployment", "Hybrid Graph + Vector Search", "Enterprise RBAC Data Controls"]
  },
  {
    id: "serv-2",
    title: "Autonomous Multi-Agent AI Workflows",
    icon: "Bot",
    shortDesc: "Multi-agent frameworks capable of planning, executing complex API actions, and auto-correcting code/workflows.",
    features: ["LangGraph & AutoGen Workflows", "Self-Healing API Pipelines", "Tool-Calling Security Sandboxes", "Human-in-the-loop Guardrails"]
  },
  {
    id: "serv-3",
    title: "High-Precision Computer Vision & Edge AI",
    icon: "Eye",
    shortDesc: "Microsecond latency vision models for industrial inspection, robotics, spatial mapping, and biometric security.",
    features: ["Real-Time Object Detection & Tracking", "Edge GPU Optimization (TensorRT)", "Micro-Defect Industrial Scanners", "Thermal & Multispectral Imaging"]
  },
  {
    id: "serv-4",
    title: "Predictive Analytics & Time-Series Neural Grids",
    icon: "TrendingUp",
    shortDesc: "Deep temporal forecasting for supply chains, financial risk modeling, energy grid loading, and preventative maintenance.",
    features: ["Transformer Time-Series Forecasting", "Real-time Streaming Anomaly Detection", "Algorithmic Risk Assessment", "Automated Retraining MLOps"]
  }
];

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var STORE_FILE = import_path.default.join(DATA_DIR, "store.json");
var defaultSalt = "ngd_salt_2026_x890";
function hashPassword(password, salt) {
  return import_crypto.default.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
}
var store = {
  siteConfig: defaultSiteConfig,
  projects: defaultProjects,
  clients: defaultClients,
  services: defaultServices,
  inquiries: [
    {
      id: "inq-1",
      name: "Sarah Jenkins",
      email: "sjenkins@techcorp.com",
      company: "TechCorp International",
      serviceRequested: "Custom Enterprise LLM & RAG Architectures",
      message: "Interested in implementing an air-gapped LLM solution for our enterprise legal documents.",
      status: "new",
      date: "2026-07-28"
    }
  ],
  securityLogs: [
    {
      id: "log-1",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      event: "System initialization & security firewall active",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  ],
  adminSalt: defaultSalt,
  adminPasswordHash: hashPassword("NeuralGrid2026!", defaultSalt)
};
function loadStore() {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (import_fs.default.existsSync(STORE_FILE)) {
      const raw = import_fs.default.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      store = { ...store, ...parsed };
    } else {
      saveStore();
    }
  } catch (err) {
    console.error("Failed to read store file, using defaults", err);
  }
}
function saveStore() {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    import_fs.default.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write store file", err);
  }
}
loadStore();
var activeSessions = /* @__PURE__ */ new Map();
var loginAttempts = /* @__PURE__ */ new Map();
function addSecurityLog(event, ip, status) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
function verifyAdminSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token." });
  }
  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
  }
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1e3;
  req.adminSession = session;
  next();
}
var aiClient = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Gemini client init failed:", e);
    }
  }
  return aiClient;
}
app.get("/api/public/site", (req, res) => {
  const publishedProjects = store.projects.filter((p) => p.published);
  res.json({
    siteConfig: store.siteConfig,
    projects: publishedProjects,
    clients: store.clients,
    services: store.services
  });
});
app.post("/api/public/inquiry", (req, res) => {
  const { name, email, company, serviceRequested, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required." });
  }
  const newInquiry = {
    id: `inq-${Date.now()}`,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().slice(0, 100),
    company: String(company || "").trim().slice(0, 100),
    serviceRequested: String(serviceRequested || "General Consultation").trim().slice(0, 100),
    message: String(message).trim().slice(0, 2e3),
    status: "new",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  store.inquiries.unshift(newInquiry);
  saveStore();
  addSecurityLog(`Inquiry received from ${email} (${company || "Individual"})`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, message: "Thank you for reaching out to Neural Grid Dynamics. Our enterprise team will respond within 24 hours." });
});
app.post("/api/public/ai-estimator", async (req, res) => {
  const { projectScope, industry, targetTech } = req.body;
  if (!projectScope) {
    return res.status(400).json({ success: false, message: "Please describe your project requirements." });
  }
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are the Chief AI Architect at Neural Grid Dynamics, a top-tier AI software house like NetSol or Systems Ltd.
Analyze the following client project request and provide a structured JSON response:
Industry: ${industry || "Technology"}
Required Tech: ${targetTech || "AI & Cloud"}
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
      const text = response.text || "";
      const cleanJsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJsonStr);
      return res.json({ success: true, estimation: parsed });
    } catch (err) {
      console.warn("Gemini estimation fallback triggered:", err);
    }
  }
  res.json({
    success: true,
    estimation: {
      recommendedArchitecture: `Custom ${targetTech || "Multi-Agent Neural Grid"} with private RAG vector index & air-gapped security guardrails.`,
      estimatedTimeline: "8 - 12 Weeks",
      recommendedStack: ["PyTorch 2.3", "FastAPI Microservices", "Qdrant Vector Database", "vLLM Inference Engine", "Kubernetes Edge"],
      keyDeliverables: [
        "Production Fine-Tuned Model Weights & Quantized Pipeline",
        "Air-Gapped Enterprise REST & WebSocket API Suite",
        "Automated MLOps Retraining & Drift Monitoring Dashboard",
        "ISO 27001 & SOC-2 Compliance Audit Package"
      ],
      securityCompliance: "Role-Based Access Control (RBAC), end-to-end TLS 1.3 encryption, and optional on-premise hardware deployment."
    }
  });
});
app.post("/api/admin/login", (req, res) => {
  const clientIp = req.ip || "127.0.0.1";
  const attempts = loginAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };
  if (attempts.lockedUntil > Date.now()) {
    const secondsRemaining = Math.ceil((attempts.lockedUntil - Date.now()) / 1e3);
    addSecurityLog(`Blocked brute-force login attempt from ${clientIp}`, clientIp, "BLOCKED");
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Account locked for security. Try again in ${secondsRemaining} seconds.`
    });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required." });
  }
  const cleanUsername = String(username).trim();
  const inputHash = hashPassword(String(password), store.adminSalt);
  const isUsernameValid = cleanUsername === "admin";
  const isPasswordValid = import_crypto.default.timingSafeEqual(Buffer.from(inputHash), Buffer.from(store.adminPasswordHash));
  if (!isUsernameValid || !isPasswordValid) {
    attempts.count += 1;
    if (attempts.count >= 5) {
      attempts.lockedUntil = Date.now() + 15 * 60 * 1e3;
      addSecurityLog(`IP ${clientIp} locked out due to 5 consecutive invalid login attempts.`, clientIp, "BLOCKED");
    } else {
      addSecurityLog(`Failed admin login attempt for user '${cleanUsername}' from ${clientIp}`, clientIp, "WARNING");
    }
    loginAttempts.set(clientIp, attempts);
    return res.status(401).json({
      success: false,
      message: "Invalid administrative credentials. Access logged."
    });
  }
  loginAttempts.delete(clientIp);
  const token = import_crypto.default.randomBytes(32).toString("hex");
  const session = {
    username: cleanUsername,
    expiresAt: Date.now() + 2 * 60 * 60 * 1e3
    // 2 hours
  };
  activeSessions.set(token, session);
  addSecurityLog(`Admin user '${cleanUsername}' authenticated successfully.`, clientIp, "SUCCESS");
  res.json({
    success: true,
    token,
    username: cleanUsername,
    message: "Administrative authentication granted."
  });
});
app.get("/api/admin/verify", verifyAdminSession, (req, res) => {
  const session = req.adminSession;
  res.json({
    success: true,
    username: session.username,
    expiresAt: session.expiresAt
  });
});
app.post("/api/admin/logout", verifyAdminSession, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    activeSessions.delete(token);
  }
  addSecurityLog("Admin user logged out.", req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, message: "Session terminated." });
});
app.post("/api/admin/change-password", verifyAdminSession, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
  }
  const currentHash = hashPassword(String(currentPassword), store.adminSalt);
  if (!import_crypto.default.timingSafeEqual(Buffer.from(currentHash), Buffer.from(store.adminPasswordHash))) {
    return res.status(400).json({ success: false, message: "Current password incorrect." });
  }
  const newSalt = import_crypto.default.randomBytes(16).toString("hex");
  store.adminSalt = newSalt;
  store.adminPasswordHash = hashPassword(String(newPassword), newSalt);
  saveStore();
  addSecurityLog("Admin master password updated.", req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, message: "Master password updated successfully." });
});
app.get("/api/admin/site", verifyAdminSession, (req, res) => {
  res.json(store.siteConfig);
});
app.put("/api/admin/site", verifyAdminSession, (req, res) => {
  store.siteConfig = { ...store.siteConfig, ...req.body };
  saveStore();
  addSecurityLog("Site settings & branding configuration updated", req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, siteConfig: store.siteConfig });
});
app.get("/api/admin/projects", verifyAdminSession, (req, res) => {
  res.json(store.projects);
});
app.post("/api/admin/projects", verifyAdminSession, (req, res) => {
  const proj = req.body;
  const newProj = {
    id: `proj-${Date.now()}`,
    title: proj.title || "New AI Solution",
    slug: (proj.title || "new-project").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    clientName: proj.clientName || "Enterprise Partner",
    category: proj.category || "Generative AI",
    description: proj.description || "",
    fullCaseStudy: proj.fullCaseStudy || "",
    impactMetrics: proj.impactMetrics || "",
    technologies: Array.isArray(proj.technologies) ? proj.technologies : ["Python", "AI"],
    imageUrl: proj.imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    featured: Boolean(proj.featured),
    published: proj.published !== false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  };
  store.projects.unshift(newProj);
  saveStore();
  addSecurityLog(`Created project '${newProj.title}'`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, project: newProj });
});
app.put("/api/admin/projects/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Project not found." });
  }
  store.projects[idx] = { ...store.projects[idx], ...req.body, id };
  saveStore();
  addSecurityLog(`Updated project '${store.projects[idx].title}'`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, project: store.projects[idx] });
});
app.delete("/api/admin/projects/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const initialLen = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);
  if (store.projects.length === initialLen) {
    return res.status(404).json({ success: false, message: "Project not found." });
  }
  saveStore();
  addSecurityLog(`Deleted project ID ${id}`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, message: "Project removed." });
});
app.get("/api/admin/clients", verifyAdminSession, (req, res) => {
  res.json(store.clients);
});
app.post("/api/admin/clients", verifyAdminSession, (req, res) => {
  const c = req.body;
  const newClient = {
    id: `client-${Date.now()}`,
    name: c.name || "New Enterprise Client",
    logoUrl: c.logoUrl || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
    industry: c.industry || "Technology",
    website: c.website || "#",
    testimonial: c.testimonial || "",
    authorName: c.authorName || "Executive Officer",
    authorRole: c.authorRole || "Director",
    featured: Boolean(c.featured)
  };
  store.clients.unshift(newClient);
  saveStore();
  addSecurityLog(`Added new client '${newClient.name}'`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, client: newClient });
});
app.put("/api/admin/clients/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const idx = store.clients.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Client not found." });
  }
  store.clients[idx] = { ...store.clients[idx], ...req.body, id };
  saveStore();
  addSecurityLog(`Updated client '${store.clients[idx].name}'`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, client: store.clients[idx] });
});
app.delete("/api/admin/clients/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  store.clients = store.clients.filter((c) => c.id !== id);
  saveStore();
  addSecurityLog(`Deleted client ID ${id}`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, message: "Client deleted." });
});
app.get("/api/admin/services", verifyAdminSession, (req, res) => {
  res.json(store.services);
});
app.post("/api/admin/services", verifyAdminSession, (req, res) => {
  const s = req.body;
  const newService = {
    id: `serv-${Date.now()}`,
    title: s.title || "New AI Service",
    icon: s.icon || "Cpu",
    shortDesc: s.shortDesc || "",
    features: Array.isArray(s.features) ? s.features : []
  };
  store.services.push(newService);
  saveStore();
  addSecurityLog(`Added service '${newService.title}'`, req.ip || "127.0.0.1", "SUCCESS");
  res.json({ success: true, service: newService });
});
app.put("/api/admin/services/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Service not found." });
  store.services[idx] = { ...store.services[idx], ...req.body, id };
  saveStore();
  res.json({ success: true, service: store.services[idx] });
});
app.delete("/api/admin/services/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  store.services = store.services.filter((s) => s.id !== id);
  saveStore();
  res.json({ success: true, message: "Service deleted." });
});
app.get("/api/admin/inquiries", verifyAdminSession, (req, res) => {
  res.json(store.inquiries);
});
app.put("/api/admin/inquiries/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const idx = store.inquiries.findIndex((i) => i.id === id);
  if (idx !== -1) {
    store.inquiries[idx].status = status;
    saveStore();
  }
  res.json({ success: true });
});
app.delete("/api/admin/inquiries/:id", verifyAdminSession, (req, res) => {
  const { id } = req.params;
  store.inquiries = store.inquiries.filter((i) => i.id !== id);
  saveStore();
  res.json({ success: true });
});
app.get("/api/admin/security-logs", verifyAdminSession, (req, res) => {
  res.json(store.securityLogs);
});
app.post("/api/admin/reset-data", verifyAdminSession, (req, res) => {
  store.siteConfig = defaultSiteConfig;
  store.projects = defaultProjects;
  store.clients = defaultClients;
  store.services = defaultServices;
  saveStore();
  addSecurityLog("Database reset to initial factory sample state", req.ip || "127.0.0.1", "WARNING");
  res.json({ success: true, message: "Data reset to defaults." });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
