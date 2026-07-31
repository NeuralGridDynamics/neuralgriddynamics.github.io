import React, { useEffect, useRef } from 'react';
import { SiteConfig } from '../types';
import { ShieldCheck, ArrowRight, Activity, Cpu, Zap, Lock, Globe } from 'lucide-react';

interface HeroProps {
  siteConfig: SiteConfig;
  onOpenEstimator: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ siteConfig, onOpenEstimator, onContactClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-tech neural grid canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const numParticles = Math.min(Math.floor((width * height) / 12000), 50);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - dist / 130})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-gray-950 border-b border-gray-800/80 pt-16 pb-20 lg:pt-24 lg:pb-28">
      {/* Animated canvas grid background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />

      {/* Radiant glow overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        {/* Security / Quality Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-8 backdrop-blur-sm shadow-inner">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Air-Gapped ISO 27001 & SOC-2 Compliant Enterprise Architecture</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          {siteConfig.heroHeadline}
        </h1>

        {/* Subhead Description */}
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-normal mb-10">
          {siteConfig.heroSubhead}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onContactClick}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-600/25 transition duration-200 flex items-center justify-center space-x-2 group"
          >
            <span>Request Enterprise Consultation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenEstimator}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Launch AI Estimator Engine</span>
          </button>
        </div>

        {/* Live Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto pt-8 border-t border-gray-800/80">
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
              {siteConfig.stats.projectsCompleted}+
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Production AI Deployments
            </div>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-blue-400 tracking-tight mb-1">
              {siteConfig.stats.enterpriseClients}
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Global Enterprise Clients
            </div>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight mb-1">
              {siteConfig.stats.modelAccuracyRate}
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Inference Model Precision
            </div>
          </div>

          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-xl p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-purple-400 tracking-tight mb-1">
              {siteConfig.stats.cloudUptime}
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              SLA Cloud Reliability
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
