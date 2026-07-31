import React, { useState } from 'react';
import { Project } from '../types';
import { ArrowUpRight, CheckCircle2, Layers, X, Building2, Tag, Calendar } from 'lucide-react';

interface ProjectsShowcaseProps {
  projects: Project[];
}

export const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const categories = ['All', 'FinTech AI', 'Enterprise LLMs', 'Computer Vision', 'Generative AI'];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="py-20 bg-gray-950 border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold px-3 py-1 bg-blue-950/60 border border-blue-500/20 rounded-full inline-block mb-3">
              Case Studies & Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Verified Production Deployments
            </h2>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">
              Explore how Neural Grid Dynamics solves mission-critical enterprise engineering challenges across high-stakes industries.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveModalProject(project)}
              className="group cursor-pointer bg-gray-900/60 border border-gray-800 hover:border-blue-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
            >
              <div>
                {/* Project Image Banner */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-950">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-blue-600/90 text-white rounded shadow-md backdrop-blur-sm">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-purple-600/90 text-white rounded shadow-md backdrop-blur-sm">
                        Featured Case Study
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Client: {project.clientName}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-3">
                    {project.title}
                  </h3>

                  <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Impact Metric Banner */}
                  {project.impactMetrics && (
                    <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 text-xs font-mono text-blue-300 mb-4 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{project.impactMetrics}</span>
                    </div>
                  )}

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-mono bg-gray-950 border border-gray-800 text-gray-400 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-gray-950 border border-gray-800 text-gray-500 rounded">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 border-t border-gray-800/80 bg-gray-950/40 flex justify-between items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                <span>View Full Technical Architecture</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Case Study Detail Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header Image */}
            <div className="relative h-64 bg-gray-950 overflow-hidden">
              <img
                src={activeModalProject.imageUrl}
                alt={activeModalProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              
              <button
                onClick={() => setActiveModalProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-gray-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white rounded mb-2 inline-block">
                  {activeModalProject.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalProject.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-400 border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Client: {activeModalProject.clientName}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Deployed: {activeModalProject.createdAt}</span>
                </div>
              </div>

              {/* Impact Banner */}
              <div className="bg-blue-950/50 border border-blue-800/60 rounded-xl p-4">
                <h4 className="text-xs font-mono uppercase text-blue-400 font-bold mb-1">
                  Verified Return On Investment & Performance Impact
                </h4>
                <p className="text-base font-bold text-white font-mono">
                  {activeModalProject.impactMetrics}
                </p>
              </div>

              {/* Case Study Full Text */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
                  Project Deep-Dive & Architecture Overview
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {activeModalProject.fullCaseStudy || activeModalProject.description}
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
                  Core Technologies & Frameworks Deployed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalProject.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-950 border border-gray-800 rounded-lg text-xs font-mono text-blue-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition"
                >
                  Close Case Study
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
