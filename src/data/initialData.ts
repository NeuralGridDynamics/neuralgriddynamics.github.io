import { SiteConfig, Project, Client, Service } from '../types';

export const defaultSiteConfig: SiteConfig = {
  companyName: 'Neural Grid Dynamics',
  tagline: 'Enterprise AI Engineering & Autonomous Grid Intelligence',
  logoUrl: '/logo.png',
  logoWidth: 120,
  logoHeight: 80,
  logoPosition: 'left',
  heroHeadline: 'Architecting Enterprise AI Systems & Autonomous Neural Networks',
  heroSubhead: 'Neural Grid Dynamics delivers production-ready Generative AI platforms, bespoke Large Language Models, Computer Vision pipelines, and MLOps cloud infrastructure for world-leading enterprises.',
  contactEmail: 'solutions@neuralgrid.ai',
  contactPhone: '+1 (888) 902-GRID',
  address: '750 Innovation Parkway, Suite 1200, San Jose, CA 95134',
  stats: {
    projectsCompleted: 142,
    enterpriseClients: 48,
    modelAccuracyRate: '99.85%',
    cloudUptime: '99.999%'
  },
  themeMode: 'dark',
  primaryColor: '#3b82f6',
  accentColor: '#06b6d4',
  backgroundColor: '#030712',
  textColor: '#f9fafb',
  cardBgColor: '#0b1329',
  headerBgColor: '#030712'
};

export const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Autonomous Multi-Agent FinTech Fraud Detection Grid',
    slug: 'fintech-fraud-grid',
    clientName: 'Global Capital Financial',
    category: 'FinTech AI',
    description: 'Real-time transaction analysis processing 80,000 requests/sec with neural anomaly detection and automated fraud mitigation.',
    fullCaseStudy: 'We engineered a low-latency multi-agent neural architecture for Global Capital Financial. Utilizing custom transformer models deployed on edge servers, the platform screens international banking transactions in under 12 milliseconds with 99.94% precision, saving over $14.2M in quarterly fraud losses.',
    impactMetrics: '99.94% Accuracy • 12ms Latency • $14.2M Quarterly Savings',
    technologies: ['PyTorch', 'Kafka', 'TensorRT', 'FastAPI', 'Kubernetes'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    featured: true,
    published: true,
    createdAt: '2026-03-15'
  },
  {
    id: 'proj-2',
    title: 'Enterprise On-Premise LLM & Knowledge Graph',
    slug: 'enterprise-llm-knowledge-graph',
    clientName: 'AeroDynamics Aerospace Corp',
    category: 'Enterprise LLMs',
    description: 'Air-gapped secure Generative AI search and automated technical compliance engine indexing 15 million engineering blueprints.',
    fullCaseStudy: 'AeroDynamics required an entirely offline, air-gapped LLM solution to analyze complex CAD metadata, compliance manuals, and flight logs. Neural Grid Dynamics deployed a quantised 70B parameter MoE architecture with hybrid vector graph RAG, cutting engineering audit times by 75%.',
    impactMetrics: '75% Faster Audits • 15M Documents Indexed • 0% Data Leak Risk',
    technologies: ['Custom Llama-3 Fine-Tune', 'Qdrant', 'Neo4j', 'vLLM', 'Docker'],
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    featured: true,
    published: true,
    createdAt: '2026-04-02'
  },
  {
    id: 'proj-3',
    title: 'Industrial Quality Inspection Computer Vision Pipeline',
    slug: 'industrial-vision-pipeline',
    clientName: 'NetSol Auto Systems',
    category: 'Computer Vision',
    description: 'High-speed robotic assembly defect detection running on edge GPUs with microsecond shutter synchronization.',
    fullCaseStudy: 'Engineered an end-to-end computer vision inspection framework for automated vehicle manufacturing lines. Deployed YOLOv8 custom models integrated with factory PLCs, capturing micro-surface flaws at 120 frames per second.',
    impactMetrics: '0.01mm Defect Resolution • 120 FPS Edge Inference • 98% Recall Rate',
    technologies: ['OpenCV', 'CUDA', 'TensorRT', 'C++', 'GStreamer'],
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    featured: true,
    published: true,
    createdAt: '2026-05-10'
  },
  {
    id: 'proj-4',
    title: 'Predictive Energy Grid Orchestrator',
    slug: 'predictive-energy-grid',
    clientName: 'Systems Global Utilities',
    category: 'Generative AI',
    description: 'Deep reinforcement learning model optimizing renewable power distribution across regional smart electrical grids.',
    fullCaseStudy: 'Partnered with Systems Global Utilities to forecast wind and solar power outputs while predicting demand spikes. The neural network adjusts grid transformers autonomously every 30 seconds.',
    impactMetrics: '18% Carbon Reduction • 320MW Energy Saved • 99.999% Reliability',
    technologies: ['Ray RLlib', 'Python', 'TimesScaleDB', 'Go', 'AWS SageMaker'],
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
    featured: false,
    published: true,
    createdAt: '2026-06-01'
  }
];

export const defaultClients: Client[] = [
  {
    id: 'client-1',
    name: 'Global Capital Financial',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80',
    industry: 'Banking & Financial Tech',
    website: 'https://globalcapital.com',
    testimonial: 'Neural Grid Dynamics deployed our AI fraud engine 3 months ahead of schedule. Their engineering rigor matches top tier defense contractors.',
    authorName: 'David Sterling',
    authorRole: 'Chief Information Security Officer',
    featured: true
  },
  {
    id: 'client-2',
    name: 'AeroDynamics Aerospace',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=200&auto=format&fit=crop&q=80',
    industry: 'Defense & Aerospace',
    website: 'https://aerodynamics-corp.com',
    testimonial: 'The air-gapped LLM knowledge engine transformed how our 4,000 aerospace engineers retrieve critical telemetry data.',
    authorName: 'Dr. Ellen Vance',
    authorRole: 'VP of Engineering Systems',
    featured: true
  },
  {
    id: 'client-3',
    name: 'NetSol Auto Systems',
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&auto=format&fit=crop&q=80',
    industry: 'Automotive & Robotics',
    website: 'https://netsol-auto.com',
    testimonial: 'Their edge computer vision solution reduced our assembly line component scrap rate by $3.8M in year one.',
    authorName: 'Marcus Thorne',
    authorRole: 'Global Operations Director',
    featured: true
  },
  {
    id: 'client-4',
    name: 'Systems Global Utilities',
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80',
    industry: 'Clean Energy & Smart Grids',
    website: 'https://systems-utilities.com',
    testimonial: 'Reliable, highly scalable, and deep domain knowledge in time-series neural models. Neural Grid is our primary AI innovation partner.',
    authorName: 'Sofia Al-Mansoor',
    authorRole: 'Chief Innovation Officer',
    featured: true
  }
];

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
