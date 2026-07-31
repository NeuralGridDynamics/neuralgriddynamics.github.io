export interface SiteStats {
  projectsCompleted: number;
  enterpriseClients: number;
  modelAccuracyRate: string;
  cloudUptime: string;
}

export interface SiteConfig {
  companyName: string;
  tagline: string;
  logoUrl: string;
  heroHeadline: string;
  heroSubhead: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  stats: SiteStats;
  themeMode: 'dark' | 'light';
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  category: 'Generative AI' | 'Computer Vision' | 'Enterprise LLMs' | 'Cloud & MLOps' | 'FinTech AI';
  description: string;
  fullCaseStudy: string;
  impactMetrics: string;
  technologies: string[];
  imageUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  logoUrl: string;
  industry: string;
  website: string;
  testimonial: string;
  authorName: string;
  authorRole: string;
  featured: boolean;
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  shortDesc: string;
  features: string[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  serviceRequested: string;
  message: string;
  status: 'new' | 'contacted' | 'archived';
  date: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'BLOCKED';
}

export interface PublicDataResponse {
  siteConfig: SiteConfig;
  projects: Project[];
  clients: Client[];
  services: Service[];
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  username?: string;
  message?: string;
}
