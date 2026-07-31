import React from 'react';
import { Service } from '../types';
import { Cpu, Bot, Eye, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';

interface SolutionsMatrixProps {
  services: Service[];
  onSelectService: (serviceTitle: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-6 h-6 text-blue-400" />,
  Bot: <Bot className="w-6 h-6 text-purple-400" />,
  Eye: <Eye className="w-6 h-6 text-emerald-400" />,
  TrendingUp: <TrendingUp className="w-6 h-6 text-indigo-400" />,
};

export const SolutionsMatrix: React.FC<SolutionsMatrixProps> = ({ services, onSelectService }) => {
  return (
    <section id="solutions" className="py-20 bg-gray-950 border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold px-3 py-1 bg-blue-950/60 border border-blue-500/20 rounded-full inline-block mb-3">
            Enterprise Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Engineered for Scale, Security & Autonomous Performance
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Neural Grid Dynamics provides full-lifecycle AI software engineering, from custom model pre-training and fine-tuning to high-throughput air-gapped deployments.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-900/60 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 sm:p-8 transition duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {iconMap[service.icon] || <Cpu className="w-6 h-6 text-blue-400" />}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {service.shortDesc}
                </p>

                <div className="space-y-2.5 mb-8">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectService(service.title)}
                className="w-full py-3 px-4 bg-gray-950 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-800 hover:border-blue-500 rounded-xl text-xs font-semibold transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>Inquire About This Solution</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
