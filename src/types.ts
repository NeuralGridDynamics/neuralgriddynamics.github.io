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
  logoWidth?: number;
  logoHeight?: number;
  logoPosition?: 'left' | 'right' | 'top';
  heroHeadline: string;
  heroSubhead: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  stats: SiteStats;
  themeMode: 'dark' | 'light' | 'custom';
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  cardBgColor?: string;
  headerBgColor?: string;
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
  email?: string;
  phone?: string;
  address?: string;
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

export interface QuotationLineItem {
  id: string;
  description: string;
  hoursOrQty: number;
  rate: number;
  amount: number;
}

export interface QuotationData {
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  companyName: string;
  companyLogoUrl: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyTaxId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress: string;
  projectTitle: string;
  systemPurpose: string;
  industrySector: string;
  systemCategory: string;
  deploymentMode: string;
  estimatedTimeline: string;
  items: QuotationLineItem[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  techStack: string[];
  deliverables: string[];
  mainFeatures: string[];
  termsAndConditions: string;
  paymentTerms: string;
  signatoryName: string;
  signatoryTitle: string;
  signatureDataUrl?: string;
  signatureDate: string;
}

export interface QuotationRequest {
  id: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  industrySector: string;
  systemCategory: string;
  projectTitle: string;
  systemPurpose: string;
  estimatedTimeline: string;
  techStack: string[];
  deliverables: string[];
  mainFeatures: string[];
  estimatedSubtotal: number;
  status: 'Pending Review' | 'Quotation Prepared' | 'Approved & Emailed';
  createdAt: string;
  quotationData?: QuotationData;
}

export interface TransactionRecord {
  id: string;
  quotationId?: string;
  clientCompany: string;
  clientEmail: string;
  amount: number;
  currency: string;
  paymentMethod: 'Bank Transfer' | 'Stripe Credit' | 'Escrow Wire' | 'Crypto USDT';
  paymentStatus: 'Completed' | 'Pending' | 'In Escrow' | 'Failed';
  milestoneName: string;
  transactionDate: string;
  notes?: string;
}

export interface AdminUserRights {
  id: string;
  uid: string;
  email: string;
  role: 'SuperAdmin' | 'SalesManager' | 'SystemAuditor' | 'DatabaseOperator';
  permissions: Array<'read_all' | 'write_all' | 'manage_quotations' | 'manage_transactions' | 'manage_admins' | 'export_db'>;
  grantedBy: string;
  createdAt: string;
}

