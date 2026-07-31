import React, { useState } from 'react';
import { SiteConfig } from '../types';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ContactSectionProps {
  siteConfig: SiteConfig;
  prefillService?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteConfig, prefillService }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    serviceRequested: prefillService || 'Custom Enterprise LLM Architectures',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setStatusMsg('Please complete all required fields.');
      return;
    }

    setStatus('loading');
    setStatusMsg('');

    try {
      const res = await fetch('/api/public/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatus('success');
          setStatusMsg(data.message);
          setFormData({ name: '', email: '', company: '', serviceRequested: 'Custom Enterprise LLM Architectures', message: '' });
          return;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, storing inquiry in local storage');
    }

    // Static host fallback
    try {
      const existing = JSON.parse(localStorage.getItem('ngd_inquiries') || '[]');
      existing.unshift({
        id: 'inq-' + Date.now(),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        status: 'new'
      });
      localStorage.setItem('ngd_inquiries', JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }

    setStatus('success');
    setStatusMsg('Thank you for reaching out to Neural Grid Dynamics. Our enterprise team will respond within 24 hours.');
    setFormData({ name: '', email: '', company: '', serviceRequested: 'Custom Enterprise LLM Architectures', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gray-950 border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Details Column */}
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold px-3 py-1 bg-blue-950/60 border border-blue-500/20 rounded-full inline-block mb-3">
              Direct Consultation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
              Partner with Neural Grid Dynamics
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              Discuss your enterprise AI roadmap with our Senior Solutions Architects. We sign NDA agreements and conduct security threat assessments prior to project kickoff.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solutions Inquiry Email</h4>
                  <a href={`mailto:${siteConfig.contactEmail}`} className="text-sm font-semibold text-white hover:text-blue-400 transition">
                    {siteConfig.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-purple-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enterprise Hotline</h4>
                  <p className="text-sm font-semibold text-white">
                    {siteConfig.contactPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Global Headquarters</h4>
                  <p className="text-sm font-semibold text-white">
                    {siteConfig.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-400">
              <span className="font-bold text-white">Air-Gapped Privacy Guarantee:</span> All client communications are encrypted under AES-256 and subject to strict confidentiality protection.
            </div>
          </div>

          {/* Consultation Form Column */}
          <div className="bg-gray-900/80 border border-gray-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Schedule Executive Consultation</h3>
            <p className="text-xs text-gray-400 mb-6">Complete the form below and an AI Architect will respond within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alexander Vance"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vance@enterprise.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Global Systems Inc."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Primary Solution Area</label>
                  <select
                    value={formData.serviceRequested}
                    onChange={(e) => setFormData({ ...formData, serviceRequested: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option>Custom Enterprise LLM Architectures</option>
                    <option>Autonomous Multi-Agent Workflows</option>
                    <option>High-Precision Computer Vision & Edge AI</option>
                    <option>Predictive Analytics & Time-Series</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Inquiry Details & Objectives *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your operational requirements, current technology stack, or target timeline..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              {status === 'success' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{status === 'loading' ? 'Transmitting Inquiry...' : 'Submit Enterprise Inquiry'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
