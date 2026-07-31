import React from 'react';
import { Client } from '../types';
import { Quote, Building, ExternalLink, ShieldCheck, Globe2 } from 'lucide-react';

interface ClientsShowcaseProps {
  clients: Client[];
}

export const ClientsShowcase: React.FC<ClientsShowcaseProps> = ({ clients }) => {
  return (
    <section id="clients" className="py-20 bg-gray-950 border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold px-3 py-1 bg-blue-950/60 border border-blue-500/20 rounded-full inline-block mb-3">
            Enterprise Partners & Clients
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Trusted by Global Market Leaders & Defense Contractors
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Neural Grid Dynamics delivers mission-critical AI solutions for top financial institutions, aerospace manufacturers, automotive innovators, and global software leaders.
          </p>
        </div>

        {/* Client Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-gray-900/40 border border-gray-800/80 hover:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center transition group hover:bg-gray-900/80"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-800/60 border border-gray-700/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform overflow-hidden">
                {client.logoUrl ? (
                  <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                {client.name}
              </h4>
              <span className="text-[11px] text-gray-500 font-medium">
                {client.industry}
              </span>
            </div>
          ))}
        </div>

        {/* Client Executive Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {clients.filter(c => c.testimonial).map((client) => (
            <div
              key={`test-${client.id}`}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between"
            >
              <Quote className="absolute top-4 right-4 w-12 h-12 text-gray-800/40 pointer-events-none" />
              
              <div className="relative z-10 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed italic mb-6">
                  "{client.testimonial}"
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-800/80">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-sm text-blue-300">
                  {client.authorName ? client.authorName.charAt(0) : 'E'}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">
                    {client.authorName}
                  </h5>
                  <p className="text-xs text-gray-400">
                    {client.authorRole} &bull; <span className="text-blue-400">{client.name}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Compliance & Trust Bar */}
        <div className="mt-16 bg-gradient-to-r from-blue-950/40 via-gray-900/60 to-purple-950/40 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <Globe2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Global Enterprise SLA Guaranteed</h4>
              <p className="text-xs text-gray-400">24/7 Dedicated AI Engineers, Air-Gapped Code Security, Zero Data Transmission Leaks.</p>
            </div>
          </div>
          <a
            href="#contact"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition whitespace-nowrap"
          >
            Become a Partner
          </a>
        </div>

      </div>
    </section>
  );
};
