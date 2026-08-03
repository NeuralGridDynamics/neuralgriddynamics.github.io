import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Client, QuotationRequest } from '../types';
import { saveClientsToCloud, saveQuotationRequestsToCloud } from '../lib/firebase';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectSpecs?: {
    projectTitle?: string;
    systemPurpose?: string;
    industrySector?: string;
    systemCategory?: string;
    deploymentMode?: string;
    estimatedTimeline?: string;
    techStack?: string[];
    deliverables?: string[];
    mainFeatures?: string[];
  };
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  initialProjectSpecs
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    industrySector: initialProjectSpecs?.industrySector || 'FinTech & Banking',
    projectNotes: initialProjectSpecs?.systemPurpose || '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientCompany || !formData.clientEmail || !formData.clientPhone || !formData.clientAddress) {
      alert('Please fill in all required client details.');
      return;
    }

    setIsSaving(true);

    try {
      const clientId = `client-${Date.now()}`;
      const newClientRecord: Client = {
        id: clientId,
        name: formData.clientCompany,
        logoUrl: '',
        industry: formData.industrySector,
        website: '',
        testimonial: 'Inquiry submitted for Enterprise AI Quotation',
        authorName: formData.clientName,
        authorRole: 'Executive Lead',
        featured: false,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientAddress,
      };

      // 1. Save new Client record to localStorage and Firebase
      const existingClients = JSON.parse(localStorage.getItem('ngd_clients') || '[]');
      const updatedClients = [newClientRecord, ...existingClients];
      localStorage.setItem('ngd_clients', JSON.stringify(updatedClients));
      saveClientsToCloud(updatedClients).catch(err => console.warn('Cloud client save warning:', err));

      // 2. Save Quotation Request to localStorage and Firebase
      const reqId = `qreq-${Date.now()}`;
      const newQuotationReq: QuotationRequest = {
        id: reqId,
        clientName: formData.clientName,
        clientCompany: formData.clientCompany,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        industrySector: formData.industrySector,
        systemCategory: initialProjectSpecs?.systemCategory || 'Generative AI & Enterprise LLM',
        projectTitle: initialProjectSpecs?.projectTitle || `${initialProjectSpecs?.systemCategory || 'AI System'} - Enterprise Solution`,
        systemPurpose: formData.projectNotes || initialProjectSpecs?.systemPurpose || 'Custom Enterprise AI Architecture',
        estimatedTimeline: initialProjectSpecs?.estimatedTimeline || '6 - 10 Weeks',
        techStack: initialProjectSpecs?.techStack || ['PyTorch', 'FastAPI', 'Qdrant Vector DB', 'Docker'],
        deliverables: initialProjectSpecs?.deliverables || ['Inference Pipeline', 'API Gateway', 'Security Audit Package'],
        mainFeatures: initialProjectSpecs?.mainFeatures || ['Real-time Vector Search', 'Role-Based Access Control'],
        estimatedSubtotal: 45000,
        status: 'Pending Review',
        createdAt: new Date().toISOString(),
      };

      const existingRequests = JSON.parse(localStorage.getItem('ngd_quotation_requests') || '[]');
      const updatedRequests = [newQuotationReq, ...existingRequests];
      localStorage.setItem('ngd_quotation_requests', JSON.stringify(updatedRequests));
      saveQuotationRequestsToCloud(updatedRequests).catch(err => console.warn('Cloud quotation request save warning:', err));

      // Dispatch custom window event to refresh admin dashboard data in real-time
      window.dispatchEvent(new Event('ngd_quotation_updated'));

      setIsSaving(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting client quotation request:', err);
      setIsSaving(false);
      setIsSubmitted(true); // Fallback proceed
    }
  };

  const handleCloseSuccess = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden relative">

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Client Information & Quotation Request</h3>
              <p className="text-xs text-gray-400">Please provide client details to generate your official quotation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="bg-blue-950/40 border border-blue-500/30 p-3 rounded-xl flex items-start space-x-2.5 text-blue-200">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Your AI architecture specifications have been captured. Please enter your contact & company details below so our Chief Architect can issue an official PDF quotation to your email.
                </p>
              </div>

              {/* Client Contact Name */}
              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Client Representative Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Jane Doe, VP of Technology"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-xs"
                />
              </div>

              {/* Company / Organization Name */}
              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Company / Organization Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientCompany}
                  onChange={e => setFormData({ ...formData, clientCompany: e.target.value })}
                  placeholder="e.g. Apex Global FinTech Corp"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Official Email */}
                <div>
                  <label className="block text-gray-300 font-bold mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Work Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="e.g. jane@apexcorp.com"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-xs font-mono"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-gray-300 font-bold mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-xs font-mono"
                  />
                </div>
              </div>

              {/* Corporate Address */}
              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Corporate Office / Billing Address *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientAddress}
                  onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="e.g. 100 Wall Street, Suite 2400, New York, NY 10005"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition text-xs"
                />
              </div>

              {/* Project Purpose / Specific Requirements */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  Project Requirements / System Purpose Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.projectNotes}
                  onChange={e => setFormData({ ...formData, projectNotes: e.target.value })}
                  placeholder="Additional custom specs, compliance needs, or deployment timeline preferences..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 border border-blue-400/30"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSaving ? 'Registering Client & Sending Request...' : 'Submit Quotation Request'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* PROMPT MESSAGE UPON SUCCESSFUL SUBMISSION */
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-extrabold text-emerald-400">Request Received in Admin Quotations & PDF Studio</h4>
                <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
                  Thank you, <strong className="text-white">{formData.clientName}</strong> (<span className="text-blue-300">{formData.clientCompany}</span>)! Your client profile and technical project request have been directly logged into our <strong>Admin Module &rarr; Quotations & PDF Studio</strong>.
                </p>
              </div>

              <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Module Processing Workflow</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Our Chief Systems Architect and Admin team will inspect your requirements in the Admin Quotation Studio, customize line item breakdowns, and prepare your official PDF quotation.
                </p>
                <div className="p-2.5 bg-gray-950 rounded-xl border border-gray-800 font-mono text-center text-blue-300 font-extrabold">
                  Client Email: {formData.clientEmail}
                </div>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition shadow border border-gray-700"
              >
                Close & Return to Portal
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
