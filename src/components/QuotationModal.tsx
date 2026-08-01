import React, { useState, useRef, useEffect } from 'react';
import {
  X, Download, Mail, Edit3, Eye, Plus, Trash2, CheckCircle2, ShieldCheck,
  FileText, Building2, User, Calendar, DollarSign, Sparkles, Key, Eraser,
  Printer, Check, ExternalLink, HelpCircle
} from 'lucide-react';
import { QuotationData, QuotationLineItem } from '../types';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<QuotationData>;
  onSaveQuotation?: (updatedData: QuotationData) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({ isOpen, onClose, initialData, onSaveQuotation }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // eSignature canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Form State
  const [quoteData, setQuoteData] = useState<QuotationData>(() => {
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const refNum = `NGD-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      quotationNumber: initialData?.quotationNumber || refNum,
      issueDate: initialData?.issueDate || today,
      validUntil: initialData?.validUntil || expiry,
      companyName: initialData?.companyName || 'Neural Grid Dynamics - Enterprise AI & Systems Ltd.',
      companyLogoUrl: initialData?.companyLogoUrl || '/logo.png',
      companyAddress: initialData?.companyAddress || 'Neural Grid Towers, Suite 1400, Tech Quarter, CA 94105',
      companyEmail: initialData?.companyEmail || 'arfanumail@gmail.com',
      companyPhone: initialData?.companyPhone || '+1 (800) 555-0199',
      companyTaxId: initialData?.companyTaxId || 'US-987654321-AI',
      clientName: initialData?.clientName || 'Enterprise Partner / Executive Lead',
      clientCompany: initialData?.clientCompany || 'Client Organization',
      clientEmail: initialData?.clientEmail || 'client@enterprise.com',
      clientAddress: initialData?.clientAddress || 'Corporate Headquarters, NY 10001',
      projectTitle: initialData?.projectTitle || 'Enterprise AI Solution Architecture & Development',
      systemPurpose: initialData?.systemPurpose || 'To deliver a scalable, fault-tolerant AI architecture with private vector indexing, high-throughput microservices, and air-gapped zero data retention.',
      industrySector: initialData?.industrySector || 'FinTech & Banking',
      systemCategory: initialData?.systemCategory || 'Generative AI & Enterprise LLM',
      deploymentMode: initialData?.deploymentMode || 'Hybrid Cloud & On-Premise Hardware',
      estimatedTimeline: initialData?.estimatedTimeline || '6 - 10 Weeks',
      items: initialData?.items && initialData.items.length > 0 ? initialData.items : [
        { id: '1', description: 'Phase 1: Architecture Design, System Blueprint & Model Pipeline Design', hoursOrQty: 80, rate: 150, amount: 12000 },
        { id: '2', description: 'Phase 2: High-Throughput Microservice APIs & Private Vector DB Indexing', hoursOrQty: 120, rate: 150, amount: 18000 },
        { id: '3', description: 'Phase 3: Air-Gapped Deployment, Security Hardening & Zero Data Retention Audit', hoursOrQty: 60, rate: 150, amount: 9000 },
        { id: '4', description: 'Phase 4: Real-Time MLOps Telemetry Dashboard & Quality Assurance', hoursOrQty: 40, rate: 150, amount: 6000 },
      ],
      subtotal: 45000,
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 45000,
      currency: 'USD ($)',
      techStack: initialData?.techStack || ['PyTorch 2.3', 'FastAPI', 'Qdrant Vector DB', 'vLLM Engine', 'Docker', 'Kubernetes'],
      deliverables: initialData?.deliverables || [
        'Production Fine-Tuned Model Weights & Inference Pipeline',
        'Air-Gapped REST & WebSocket API Gateway',
        'Real-Time MLOps Telemetry & Drift Audit Dashboard',
        'Full Security Audit Package & Operator Training Manual'
      ],
      mainFeatures: initialData?.mainFeatures || [
        'Real-time Vector & Knowledge Graph Indexing',
        'High-Throughput Microservice APIs with vLLM Low-Latency Inference',
        'Air-Gapped Network Isolation with Granular Role-Based Access Control (RBAC)',
        'Automated MLOps Telemetry with Drift Detection & Health Monitoring'
      ],
      termsAndConditions: initialData?.termsAndConditions || 'Quotation valid for 30 days from issuance. All intellectual property generated transfers upon final milestone sign-off. Air-gapped confidentiality agreement (NDA) guaranteed under SOC-2 compliance.',
      paymentTerms: initialData?.paymentTerms || '30% Upon Project Kick-Off & Architecture Approval | 40% Prototype & API Integration | 30% Final Production Sign-Off',
      signatoryName: initialData?.signatoryName || 'Mr. Muhammad Arfan',
      signatoryTitle: initialData?.signatoryTitle || 'Chief Systems Architect, Neural Grid Dynamics',
      signatureDataUrl: initialData?.signatureDataUrl || '',
      signatureDate: initialData?.signatureDate || today,
    };
  });

  // Synchronize state when initialData or modal visibility changes
  useEffect(() => {
    if (isOpen && initialData) {
      setQuoteData(prev => ({
        ...prev,
        ...initialData,
        items: initialData.items && initialData.items.length > 0 ? initialData.items : prev.items,
      }));
    }
  }, [isOpen, initialData]);

  const handleSaveEditedQuotation = () => {
    if (onSaveQuotation) {
      onSaveQuotation(quoteData);
    }
    setSaveNotification('Quotation details updated and saved successfully!');
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // Calculate totals whenever items or tax change
  useEffect(() => {
    const calculatedSubtotal = quoteData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const calculatedTax = (calculatedSubtotal * (Number(quoteData.taxRatePercent) || 0)) / 100;
    const calculatedTotal = calculatedSubtotal + calculatedTax;

    setQuoteData(prev => ({
      ...prev,
      subtotal: calculatedSubtotal,
      taxAmount: calculatedTax,
      totalAmount: calculatedTotal
    }));
  }, [quoteData.items, quoteData.taxRatePercent]);

  // Handle eSignature Drawing Canvas
  useEffect(() => {
    if (activeTab === 'edit' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setQuoteData(prev => ({ ...prev, signatureDataUrl: dataUrl }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setQuoteData(prev => ({ ...prev, signatureDataUrl: '' }));
  };

  // Line item helpers
  const handleItemChange = (id: string, field: keyof QuotationLineItem, value: any) => {
    setQuoteData(prev => {
      const updated = prev.items.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === 'hoursOrQty' || field === 'rate') {
            newItem.amount = (Number(newItem.hoursOrQty) || 0) * (Number(newItem.rate) || 0);
          } else if (field === 'amount') {
            const numericAmt = Number(value) || 0;
            newItem.amount = numericAmt;
            const h = Number(newItem.hoursOrQty) || 0;
            if (h > 0) {
              newItem.rate = Math.round((numericAmt / h) * 100) / 100;
            }
          }
          return newItem;
        }
        return item;
      });
      return { ...prev, items: updated };
    });
  };

  const addLineItem = () => {
    const newItem: QuotationLineItem = {
      id: `item-${Date.now()}`,
      description: 'New Engineering Milestone / Module',
      hoursOrQty: 20,
      rate: 150,
      amount: 3000
    };
    setQuoteData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeLineItem = (id: string) => {
    setQuoteData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  // Download PDF via html2pdf.js
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const element = document.getElementById('quotation-pdf-document');
    if (!element) {
      alert('Quotation document element not found.');
      setIsExporting(false);
      return;
    }

    try {
      // Dynamic import html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: `Official_Quotation_${quoteData.quotationNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.warn('html2pdf download fallback triggered, opening print dialog:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // Mailto Reply
  const handleMailReply = () => {
    const subject = encodeURIComponent(`Re: Official Quotation ${quoteData.quotationNumber} - ${quoteData.projectTitle}`);
    const body = encodeURIComponent(
      `Hello Neural Grid Dynamics Team,\n\n` +
      `Regarding Official Quotation Ref: ${quoteData.quotationNumber}\n` +
      `Project: ${quoteData.projectTitle}\n` +
      `Quotation Amount: $${quoteData.totalAmount.toLocaleString()} USD\n\n` +
      `I have reviewed the quotation document and would like to proceed with the next steps for formal agreement and kick-off.\n\n` +
      `Contact Name: ${quoteData.clientName}\n` +
      `Company: ${quoteData.clientCompany}\n\n` +
      `Best regards,`
    );

    window.open(`mailto:${quoteData.companyEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-5xl w-full h-[95vh] flex flex-col shadow-2xl overflow-hidden relative">

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-gray-800 bg-gray-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">Official Industry Quotation Studio</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
                  PDF & eSignature Ready
                </span>
              </div>
              <p className="text-xs text-gray-400">Software House Quotation Builder & PDF Document Exporter</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'preview' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document View</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'edit' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Quotation</span>
              </button>
            </div>

            <button
              onClick={handleSaveEditedQuotation}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 border border-blue-400/30"
              title="Save changes to quotation"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 border border-emerald-400/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handleMailReply}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 border border-purple-400/30"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reply Email</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-900">

          {/* TAB 1: OFFICIAL PDF PREVIEW DOCUMENT */}
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center">
              <div className="mb-4 text-xs text-gray-400 flex items-center justify-between w-full max-w-[800px] px-1">
                <span className="flex items-center space-x-1">
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Standard A4 Print Layout • Ready for Official Submission</span>
                </span>
                <button onClick={handlePrint} className="text-blue-400 hover:underline flex items-center space-x-1">
                  <span>Print via Browser</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* PRINTABLE A4 CONTAINER */}
              <div
                id="quotation-pdf-document"
                className="w-full max-w-[800px] bg-white text-gray-900 p-8 sm:p-10 rounded-xl shadow-2xl font-sans text-xs sm:text-sm border border-gray-200 select-text"
                style={{ minHeight: '1000px' }}
              >
                {/* PDF Header / Logo / Company Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-900 pb-6 mb-6 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      {quoteData.companyLogoUrl ? (
                        <img
                          src={quoteData.companyLogoUrl}
                          alt="Company Logo"
                          style={{ width: '120px', height: '80px' }}
                          className="object-contain rounded"
                        />
                      ) : (
                        <div className="p-2 bg-blue-900 text-white font-extrabold rounded-lg text-lg">NGD</div>
                      )}
                      <div>
                        <h1 className="text-base font-extrabold text-gray-900 tracking-tight leading-none">
                          {quoteData.companyName}
                        </h1>
                        <p className="text-[11px] text-gray-600 font-semibold mt-0.5">Enterprise AI Solutions & Software House</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-600 space-y-0.5 pt-1">
                      <p>{quoteData.companyAddress}</p>
                      <p>Email: <span className="font-semibold text-gray-900">{quoteData.companyEmail}</span> | Phone: {quoteData.companyPhone}</p>
                      <p>Tax / Reg ID: {quoteData.companyTaxId}</p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span className="inline-block px-3 py-1 bg-blue-900 text-white font-extrabold text-xs tracking-wider uppercase rounded mb-2">
                      OFFICIAL QUOTATION
                    </span>
                    <div className="text-xs font-mono font-bold text-gray-900">{quoteData.quotationNumber}</div>
                    <div className="text-[11px] text-gray-600 mt-1">
                      <p>Date Issued: <strong className="text-gray-900">{quoteData.issueDate}</strong></p>
                      <p>Valid Until: <strong className="text-gray-900">{quoteData.validUntil}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Client / Prepared For Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-1">Prepared For (Client):</h4>
                    <p className="text-sm font-extrabold text-gray-900">{quoteData.clientName}</p>
                    <p className="text-xs text-gray-800 font-semibold">{quoteData.clientCompany}</p>
                    <p className="text-xs text-gray-600">{quoteData.clientAddress}</p>
                    <p className="text-xs text-blue-800 font-mono mt-1">{quoteData.clientEmail}</p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-1">Project Specification:</h4>
                    <p className="text-xs font-extrabold text-gray-900">{quoteData.projectTitle}</p>
                    <p className="text-xs text-gray-700 mt-0.5">Industry: <strong className="text-gray-900">{quoteData.industrySector}</strong></p>
                    <p className="text-xs text-gray-700">Domain: <strong className="text-gray-900">{quoteData.systemCategory}</strong></p>
                    <p className="text-xs text-gray-700">Deployment: <strong className="text-gray-900">{quoteData.deploymentMode}</strong></p>
                  </div>
                </div>

                {/* System Purpose & Architecture Overview */}
                <div className="mb-6 space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider border-b border-gray-300 pb-1 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>Executive System Purpose & Architecture Scope</span>
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed bg-blue-50/60 p-3 rounded-lg border border-blue-100 font-medium">
                    {quoteData.systemPurpose}
                  </p>
                </div>

                {/* Main System Features */}
                {quoteData.mainFeatures && quoteData.mainFeatures.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <h3 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider border-b border-gray-300 pb-1">
                      Core Functional System Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quoteData.mainFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itemized Cost Breakdown Table */}
                <div className="mb-6">
                  <h3 className="text-xs font-extrabold uppercase text-gray-900 tracking-wider border-b border-gray-300 pb-2 mb-3">
                    Itemized Scope & Pricing Breakdown
                  </h3>
                  <table className="w-full text-left border-collapse border border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-gray-900 text-white font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-2.5 border border-gray-800 w-12 text-center">No</th>
                        <th className="p-2.5 border border-gray-800">Engineering Scope / Milestone Description</th>
                        <th className="p-2.5 border border-gray-800 w-20 text-center">Hours / Qty</th>
                        <th className="p-2.5 border border-gray-800 w-24 text-right">Rate ($)</th>
                        <th className="p-2.5 border border-gray-800 w-28 text-right">Total ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteData.items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2.5 border border-gray-300 text-center font-mono font-bold text-gray-700">{index + 1}</td>
                          <td className="p-2.5 border border-gray-300 font-medium text-gray-900">{item.description}</td>
                          <td className="p-2.5 border border-gray-300 text-center font-mono text-gray-700">{item.hoursOrQty}</td>
                          <td className="p-2.5 border border-gray-300 text-right font-mono text-gray-700">${item.rate.toLocaleString()}</td>
                          <td className="p-2.5 border border-gray-300 text-right font-mono font-bold text-gray-900">${item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Totals Box */}
                  <div className="flex justify-end mt-3">
                    <div className="w-full sm:w-72 bg-gray-50 p-3 rounded-lg border border-gray-300 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold">${quoteData.subtotal.toLocaleString()}</span>
                      </div>
                      {quoteData.taxRatePercent > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Tax / VAT ({quoteData.taxRatePercent}%):</span>
                          <span className="font-mono">${quoteData.taxAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1.5 border-t border-gray-300">
                        <span>Total Estimate:</span>
                        <span className="font-mono text-blue-900">${quoteData.totalAmount.toLocaleString()} {quoteData.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack & Deliverables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-extrabold text-gray-900 uppercase text-[11px] mb-2">Recommended Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {quoteData.techStack.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-900 font-mono text-[11px] font-bold rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-extrabold text-gray-900 uppercase text-[11px] mb-2">Key Engineering Deliverables</h4>
                    <ul className="space-y-1">
                      {quoteData.deliverables.map((del, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5 text-gray-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Terms & Conditions & Payment Schedule */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-6 text-xs space-y-2">
                  <div>
                    <h4 className="font-extrabold text-gray-900 uppercase text-[11px]">Payment Milestones & Schedule</h4>
                    <p className="text-gray-700 font-medium">{quoteData.paymentTerms}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 uppercase text-[11px]">Terms & Conditions</h4>
                    <p className="text-gray-600 text-[11px] leading-relaxed">{quoteData.termsAndConditions}</p>
                  </div>
                </div>

                {/* Digital eSignature & Authorization Block */}
                <div className="border-t-2 border-gray-900 pt-4 flex flex-col sm:flex-row justify-between items-end gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-1 text-emerald-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Digitally Authenticated Software House Quotation</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Neural Grid Security Verification Hash: <code className="font-mono text-gray-800 font-bold">0x9F42A7C...2026</code></p>
                    <p className="text-[11px] text-gray-500">For inquiries or email replies: <strong className="text-gray-900">{quoteData.companyEmail}</strong></p>
                  </div>

                  <div className="text-right space-y-1 min-w-[220px]">
                    <div className="border-b border-gray-400 pb-1 mb-1 min-h-[50px] flex items-center justify-end">
                      {quoteData.signatureDataUrl ? (
                        <img src={quoteData.signatureDataUrl} alt="eSignature" className="h-12 object-contain" />
                      ) : (
                        <span className="font-serif italic text-lg text-blue-950 font-bold px-2">{quoteData.signatoryName}</span>
                      )}
                    </div>
                    <p className="font-extrabold text-gray-900 text-xs">{quoteData.signatoryName}</p>
                    <p className="text-[11px] text-gray-600">{quoteData.signatoryTitle}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Date Signed: {quoteData.signatureDate}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE EDITING & eSIGNATURE STUDIO */}
          {activeTab === 'edit' && (
            <div className="max-w-4xl mx-auto space-y-6 text-xs text-gray-300">

              {/* Company & Client Header Setup */}
              <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-gray-800 pb-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Company Branding & Client Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-bold text-blue-400 uppercase text-[11px]">Provider / Software House</h5>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={quoteData.companyName}
                        onChange={e => setQuoteData({ ...quoteData, companyName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Logo URL (PNG/SVG)</label>
                      <input
                        type="text"
                        value={quoteData.companyLogoUrl}
                        onChange={e => setQuoteData({ ...quoteData, companyLogoUrl: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Contact Email</label>
                      <input
                        type="text"
                        value={quoteData.companyEmail}
                        onChange={e => setQuoteData({ ...quoteData, companyEmail: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Address & Tax ID</label>
                      <input
                        type="text"
                        value={quoteData.companyAddress}
                        onChange={e => setQuoteData({ ...quoteData, companyAddress: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white mb-2"
                      />
                      <input
                        type="text"
                        value={quoteData.companyTaxId}
                        onChange={e => setQuoteData({ ...quoteData, companyTaxId: e.target.value })}
                        placeholder="Tax Reg ID"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-purple-400 uppercase text-[11px]">Client / Recipient</h5>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Client Name / Representative</label>
                      <input
                        type="text"
                        value={quoteData.clientName}
                        onChange={e => setQuoteData({ ...quoteData, clientName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Client Organization / Company</label>
                      <input
                        type="text"
                        value={quoteData.clientCompany}
                        onChange={e => setQuoteData({ ...quoteData, clientCompany: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Client Email</label>
                      <input
                        type="text"
                        value={quoteData.clientEmail}
                        onChange={e => setQuoteData({ ...quoteData, clientEmail: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Quotation Ref #</label>
                        <input
                          type="text"
                          value={quoteData.quotationNumber}
                          onChange={e => setQuoteData({ ...quoteData, quotationNumber: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Valid Until Date</label>
                        <input
                          type="date"
                          value={quoteData.validUntil}
                          onChange={e => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Purpose & Features */}
              <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-gray-800 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Project Title, System Purpose & Category</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={quoteData.projectTitle}
                      onChange={e => setQuoteData({ ...quoteData, projectTitle: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">System Purpose & Executive Scope</label>
                    <textarea
                      rows={3}
                      value={quoteData.systemPurpose}
                      onChange={e => setQuoteData({ ...quoteData, systemPurpose: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Itemized Pricing Table Editor */}
              <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Itemized Engineering Scope & Pricing Table</span>
                  </h4>

                  <button
                    onClick={addLineItem}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {quoteData.items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-gray-900 border border-gray-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Item Description / Milestone {idx + 1}</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Hours / Qty</label>
                        <input
                          type="number"
                          value={item.hoursOrQty}
                          onChange={e => handleItemChange(item.id, 'hoursOrQty', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white text-xs text-center font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Rate ($/hr)</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={e => handleItemChange(item.id, 'rate', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white text-xs text-right font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-emerald-400 uppercase font-bold mb-1">Price ($)</label>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={e => handleItemChange(item.id, 'amount', e.target.value)}
                          className="w-full bg-gray-950 border border-emerald-500/50 rounded px-2.5 py-1.5 text-emerald-300 font-bold text-xs text-right font-mono focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-center items-center pt-2 sm:pt-4">
                        {quoteData.items.length > 1 && (
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded transition"
                            title="Remove Line Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-800 gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-400 font-semibold">Tax Rate (%):</label>
                    <input
                      type="number"
                      value={quoteData.taxRatePercent || 0}
                      onChange={e => setQuoteData({ ...quoteData, taxRatePercent: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-20 bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white font-mono text-center focus:border-blue-500 focus:outline-none"
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-gray-400 text-xs font-mono">
                      Subtotal: <strong className="text-white">${quoteData.subtotal.toLocaleString()}</strong>
                    </p>
                    {quoteData.taxRatePercent > 0 && (
                      <p className="text-gray-400 text-xs font-mono">
                        Tax ({quoteData.taxRatePercent}%): <strong className="text-white">${quoteData.taxAmount.toLocaleString()}</strong>
                      </p>
                    )}
                    <p className="text-emerald-400 text-sm font-mono font-extrabold">
                      Total Estimate: ${quoteData.totalAmount.toLocaleString()} USD
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital eSignature Studio */}
              <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Authorized eSignature & Signatory Studio</span>
                  </h4>

                  <button
                    onClick={clearSignature}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs flex items-center space-x-1"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear Signature</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Signatory Name</label>
                      <input
                        type="text"
                        value={quoteData.signatoryName}
                        onChange={e => setQuoteData({ ...quoteData, signatoryName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Signatory Title</label>
                      <input
                        type="text"
                        value={quoteData.signatoryTitle}
                        onChange={e => setQuoteData({ ...quoteData, signatoryTitle: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Draw Interactive eSignature below (Mouse or Touch):
                    </label>
                    <div className="border border-blue-500/40 rounded-xl bg-white overflow-hidden relative">
                      <canvas
                        ref={canvasRef}
                        width={380}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[110px] cursor-crosshair bg-white"
                      />
                      <span className="absolute bottom-1 right-2 text-[9px] text-gray-400 font-mono pointer-events-none">
                        eSignature Pad Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Notification Banner */}
              {saveNotification && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{saveNotification}</span>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSaveEditedQuotation}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 border border-emerald-400/30"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Save Quotation Changes</span>
                </button>

                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Printable Document</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
