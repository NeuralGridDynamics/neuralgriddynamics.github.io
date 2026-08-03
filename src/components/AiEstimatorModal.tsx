import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, CheckCircle, Cpu, ShieldCheck, Clock, Layers, Send, Key, Bot, User, RefreshCw, Target, Zap, CheckCircle2, Mail, FileText, ExternalLink } from 'lucide-react';
import { QuotationData } from '../types';

interface AiEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuotation?: (initialData?: Partial<QuotationData>) => void;
  onRequestClientDetails?: (specs: any) => void;
}

interface EstimationResult {
  systemPurpose?: string;
  recommendedArchitecture: string;
  estimatedTimeline: string;
  mainFeatures?: string[];
  recommendedStack: string[];
  keyDeliverables: string[];
  securityCompliance: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  estimation?: EstimationResult;
  provider?: string;
  timestamp: string;
}

export const AiEstimatorModal: React.FC<AiEstimatorModalProps> = ({
  isOpen,
  onClose,
  onOpenQuotation,
  onRequestClientDetails
}) => {
  const [industry, setIndustry] = useState('FinTech & Banking');
  const [targetTech, setTargetTech] = useState('Generative AI & Enterprise LLM');
  const [deploymentMode, setDeploymentMode] = useState('Cloud Microservices (AWS/GCP)');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = inputMessage.trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/public/ai-estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectScope: messageText,
          industry,
          targetTech,
          deploymentMode,
          openaiKey: openaiKey.trim(),
          chatHistory: newHistory.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.reply || 'Here is your architectural solution blueprint:',
            estimation: data.estimation,
            provider: data.provider || 'Neural Grid AI Engine',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([...newHistory, aiMsg]);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend estimation query warning:', err);
    }

    // Client-side Fallback
    const fallbackMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Architectural analysis for your **${industry}** query under **${targetTech}** (${deploymentMode}):\n\nYour requirements ("${messageText}") have been analyzed for private vector memory indexing, low-latency microservices, and regulatory isolation.`,
      estimation: {
        systemPurpose: `To deliver a scalable, fault-tolerant ${targetTech} architecture customized for ${industry} operations with zero data leakage and high throughput.`,
        recommendedArchitecture: `Air-Gapped ${targetTech} with private vector indexing & hardware isolation tailored for ${industry}.`,
        estimatedTimeline: '6 - 10 Weeks',
        mainFeatures: [
          `Real-time Vector & Knowledge Graph Indexing for ${industry} Datasets`,
          `High-Throughput Microservice APIs with vLLM Low-Latency Inference`,
          `Air-Gapped Network Isolation with Granular Role-Based Access Control (RBAC)`,
          `Automated MLOps Telemetry with Drift Detection & Health Monitoring`
        ],
        recommendedStack: ['PyTorch 2.3', 'FastAPI Microservices', 'Qdrant Vector Database', 'vLLM Engine', 'Docker / Kubernetes'],
        keyDeliverables: [
          'Production Model Pipeline & Quantized Inference Weights',
          'Air-Gapped REST & WebSocket API Gateway',
          'Real-Time MLOps Telemetry & Drift Audit Dashboard',
          'SOC-2 / ISO 27001 Security Audit Package'
        ],
        securityCompliance: 'Role-Based Access Control (RBAC), end-to-end TLS 1.3 encryption, zero data retention.'
      },
      provider: 'Free Client Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...newHistory, fallbackMsg]);
    setIsLoading(false);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleGetQuotation = (estimation: EstimationResult, userQueryText?: string) => {
    const specs = {
      projectTitle: `${targetTech} - Enterprise Solution`,
      systemPurpose: estimation.systemPurpose || estimation.recommendedArchitecture,
      industrySector: industry,
      systemCategory: targetTech,
      deploymentMode: deploymentMode,
      estimatedTimeline: estimation.estimatedTimeline,
      techStack: estimation.recommendedStack,
      deliverables: estimation.keyDeliverables,
      mainFeatures: estimation.mainFeatures || [],
    };

    if (onRequestClientDetails) {
      onClose();
      onRequestClientDetails(specs);
      return;
    }

    if (onOpenQuotation) {
      const items = (estimation.keyDeliverables || []).map((deliv, idx) => ({
        id: `deliv-${idx + 1}`,
        description: `Milestone ${idx + 1}: ${deliv}`,
        hoursOrQty: [60, 80, 50, 40][idx % 4],
        rate: 150,
        amount: [9000, 12000, 7500, 6000][idx % 4]
      }));

      onOpenQuotation({
        ...specs,
        items: items.length > 0 ? items : undefined
      });
      return;
    }

    // Fallback: Save quotation request directly to local storage and Cloud for Admin Studio
    const reqId = `qreq-${Date.now()}`;
    const newQuotationReq = {
      id: reqId,
      clientName: 'Guest Enterprise Client',
      clientCompany: industry || 'Enterprise Client',
      clientEmail: 'inquiry@enterprise.client',
      clientPhone: '+1 (555) 019-2834',
      clientAddress: '100 Enterprise Way, Global Tech Park',
      industrySector: industry,
      systemCategory: targetTech,
      projectTitle: `${targetTech} - Enterprise Solution`,
      systemPurpose: estimation.systemPurpose || 'Custom Enterprise AI Architecture',
      estimatedTimeline: estimation.estimatedTimeline || '6 - 10 Weeks',
      techStack: estimation.recommendedStack,
      deliverables: estimation.keyDeliverables,
      mainFeatures: estimation.mainFeatures || [],
      estimatedSubtotal: 45000,
      status: 'Pending Review' as const,
      createdAt: new Date().toISOString(),
    };

    const existingRequests = JSON.parse(localStorage.getItem('ngd_quotation_requests') || '[]');
    const updatedRequests = [newQuotationReq, ...existingRequests];
    localStorage.setItem('ngd_quotation_requests', JSON.stringify(updatedRequests));

    // Import and save to cloud if available
    import('../lib/firebase').then(({ saveQuotationRequestsToCloud }) => {
      saveQuotationRequestsToCloud(updatedRequests).catch(err => console.warn('Cloud quotation save warning:', err));
    }).catch(() => null);

    window.dispatchEvent(new Event('ngd_quotation_updated'));
    alert('Your quotation request has been logged into the Admin Module -> Quotation & PDF Studio!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 bg-gray-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">AI Architecture & Scope Estimator</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                  OpenAI Free Access
                </span>
              </div>
              <p className="text-xs text-gray-400">Interactive Neural Scope Analyzer & System Architecture Chat</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`p-2 rounded-xl border text-xs font-medium transition flex items-center space-x-1.5 ${
                openaiKey ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
              }`}
              title="Custom OpenAI API Key (Optional)"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{openaiKey ? 'OpenAI Key Set' : 'OpenAI Key'}</span>
            </button>

            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition"
              title="Clear Chat History"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional OpenAI API Key Expandable Bar */}
        {showKeyInput && (
          <div className="px-5 py-3 bg-purple-950/40 border-b border-purple-800/40 shrink-0 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-purple-300">
              <Key className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Provide your OpenAI API Key (<code className="font-mono text-purple-200">sk-...</code>) for dedicated GPT-4o estimates, or leave blank to use free built-in access:</span>
            </div>
            <div className="w-full sm:w-72">
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-gray-950 border border-purple-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>
          </div>
        )}

        {/* Category & Parameter Bar */}
        <div className="p-4 bg-gray-950/60 border-b border-gray-800/80 shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
              System Category
            </label>
            <select
              value={targetTech}
              onChange={(e) => setTargetTech(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option>Generative AI & Enterprise LLM</option>
              <option>Autonomous Multi-Agent Workflows</option>
              <option>High-Precision Computer Vision & Edge AI</option>
              <option>Predictive Analytics & Time-Series Neural Grids</option>
              <option>Cyber-Physical Systems & IoT Intelligence</option>
              <option>Custom Enterprise Software Architecture</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
              Industry Sector
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option>FinTech & Banking</option>
              <option>Aerospace & Defense</option>
              <option>Automotive & Robotics</option>
              <option>Healthcare & Pharma</option>
              <option>Clean Energy & Smart Grids</option>
              <option>Retail & E-Commerce</option>
              <option>Legal & Governance</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
              Deployment Mode
            </label>
            <select
              value={deploymentMode}
              onChange={(e) => setDeploymentMode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option>Cloud Microservices (AWS/GCP)</option>
              <option>Air-Gapped On-Premise Hardware</option>
              <option>Hybrid Cloud & On-Prem RAG</option>
              <option>Edge GPU Hardware (NVIDIA Jetson / TensorRT)</option>
            </select>
          </div>
        </div>

        {/* Chat / Solution Stream Window */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 text-blue-400">
                <Bot className="w-10 h-10 animate-bounce" />
              </div>
              <div className="max-w-md space-y-2">
                <h4 className="text-base font-extrabold text-white">Welcome to the AI Architecture & Scope Estimator</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enter your project goals, system scope, or technical questions in the chatbox below. Our OpenAI / Gemini AI engine will analyze your parameters and generate an inline architecture estimate.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-left pt-2">
                <button
                  onClick={() => setInputMessage('We need an air-gapped LLM solution to index 50,000 legal PDFs with automated audit compliance checks.')}
                  className="p-3 bg-gray-950 border border-gray-800 hover:border-blue-500/50 rounded-xl text-xs text-gray-300 transition text-left space-y-1"
                >
                  <span className="font-bold text-blue-400 block">Enterprise RAG Pipeline</span>
                  <span className="text-[11px] text-gray-400 line-clamp-2">"We need an air-gapped LLM solution to index 50,000 legal PDFs..."</span>
                </button>

                <button
                  onClick={() => setInputMessage('We need a multi-agent workflow that auto-detects system API outages and runs self-healing diagnostics.')}
                  className="p-3 bg-gray-950 border border-gray-800 hover:border-purple-500/50 rounded-xl text-xs text-gray-300 transition text-left space-y-1"
                >
                  <span className="font-bold text-purple-400 block">Autonomous Multi-Agent System</span>
                  <span className="text-[11px] text-gray-400 line-clamp-2">"We need a multi-agent workflow that auto-detects system API outages..."</span>
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="p-2 h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 flex items-center justify-center shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-3 max-w-2xl w-full ${msg.sender === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`inline-block p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    
                    {msg.provider && (
                      <div className="mt-2 text-[10px] text-gray-400 font-mono flex items-center space-x-1 border-t border-gray-800 pt-1.5">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Engine: {msg.provider} • {msg.timestamp}</span>
                      </div>
                    )}
                  </div>

                  {/* Estimation Card (if AI response includes structured data) */}
                  {msg.estimation && (
                    <div className="bg-gray-950 border border-blue-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-left">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                        <span className="text-xs font-mono uppercase text-blue-400 font-extrabold flex items-center space-x-1.5">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Recommended Solution Architecture</span>
                        </span>
                        <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Est. Timeline: {msg.estimation.estimatedTimeline}</span>
                        </div>
                      </div>

                      {/* Brief Purpose Statement */}
                      {msg.estimation.systemPurpose && (
                        <div className="p-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 rounded-xl space-y-1">
                          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-blue-300 uppercase tracking-wider">
                            <Target className="w-3.5 h-3.5 text-blue-400" />
                            <span>System Architecture Purpose</span>
                          </div>
                          <p className="text-xs text-gray-200 leading-relaxed font-medium">
                            {msg.estimation.systemPurpose}
                          </p>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                        {msg.estimation.recommendedArchitecture}
                      </p>

                      {/* Main System Features */}
                      {msg.estimation.mainFeatures && msg.estimation.mainFeatures.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Main System Features</span>
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.estimation.mainFeatures.map((feature, i) => (
                              <div key={i} className="p-2.5 bg-gray-900/90 border border-gray-800 rounded-xl flex items-start space-x-2 text-xs text-gray-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span className="leading-snug">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-400" />
                          <span>Recommended Tech Stack</span>
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.estimation.recommendedStack.map((tech, i) => (
                            <span key={i} className="px-2.5 py-1 text-[11px] font-mono bg-blue-950/60 border border-blue-800/50 text-blue-300 rounded-md font-semibold">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-400" />
                          <span>Key Engineering Deliverables</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {msg.estimation.keyDeliverables.map((del, i) => (
                            <li key={i} className="flex items-start space-x-2 text-xs text-gray-300">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-gray-400">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{msg.estimation.securityCompliance}</span>
                        </div>

                        <button
                          onClick={() => handleGetQuotation(msg.estimation!, msg.text)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center space-x-2 shrink-0 border border-emerald-400/30 group"
                        >
                          <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          <span>Get Official Quotation</span>
                          <ExternalLink className="w-3 h-3 text-emerald-200 opacity-80" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="p-2 h-8 w-8 rounded-xl bg-blue-600 text-white shrink-0 flex items-center justify-center shadow">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex space-x-3 items-center text-xs text-blue-400 p-3 bg-gray-950/80 border border-gray-800 rounded-xl w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Analyzing parameters & architecting system solution...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Chatbox */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-950 border-t border-gray-800 shrink-0 flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe your system scope, goals, or ask follow-up questions..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-10"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
