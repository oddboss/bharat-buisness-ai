import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  MessageSquare,
  LayoutDashboard,
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function PersonalBusinessSpace({ setActivePage }: { setActivePage: (page: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate upload and analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisComplete(true);
        }, 1000);
      }
    }, 100);
  };

  const analysisModules = [
    { 
      id: 'dashboard', 
      name: 'Revenue Radar', 
      icon: LayoutDashboard, 
      color: 'text-blue-400', 
      status: 'Updated',
      insight: 'Detected 14% untapped revenue in regional distribution centers.'
    },
    { 
      id: 'business-space', 
      name: 'Profit & Cash Flow', 
      icon: BarChart3, 
      color: 'text-emerald-400', 
      status: 'Recalculated',
      insight: 'Cash runway extended by 22 days due to optimized vendor credit terms.'
    },
    { 
      id: 'gst-compliance', 
      name: 'GST & Compliance', 
      icon: ShieldCheck, 
      color: 'text-amber-400', 
      status: 'Reconciled',
      insight: '₹42,000 in unclaimed ITC identified from Q3 invoices.'
    },
    { 
      id: 'whatsapp-growth', 
      name: 'WhatsApp Growth', 
      icon: MessageSquare, 
      color: 'text-purple-400', 
      status: 'Strategy Ready',
      insight: '85 high-intent leads segmented for automated recovery campaign.'
    },
  ];

  return (
    <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-2"
      >
        <div className="flex items-center gap-3 text-blue-500 mb-1">
          <Database className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Personal Data Vault</span>
        </div>
        <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
          Personal <span className="text-blue-500 font-medium italic">Business Space</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium">Upload your Tally exports, bank statements, or GST reports to power your entire AI ecosystem.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-10 relative z-10">
        {/* Upload Section */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "lg:col-span-2 relative p-16 border-2 border-dashed rounded-[3rem] transition-all duration-500 cursor-pointer group overflow-hidden",
                isDragging ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "glass-card hover:border-blue-500/30",
                isAnalyzing && "pointer-events-none opacity-50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple 
                accept=".csv,.xlsx,.pdf,.xml"
              />
              
              <div className="flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                <div className={cn(
                  "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500",
                  isDragging ? "bg-blue-500 text-white scale-110 rotate-12" : "bg-white/5 text-gray-400 group-hover:scale-110 group-hover:-rotate-3"
                )}>
                  {isAnalyzing ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-light text-white tracking-tight">
                    {isAnalyzing ? "AI is analyzing your data..." : "Drop your business files here"}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">Supports Tally XML, GST Excel, Bank PDFs, and CSVs</p>
                </div>

                {isAnalyzing && (
                  <div className="w-full max-w-xs space-y-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{uploadProgress}% Processed</p>
                  </div>
                )}
              </div>

              {/* Decorative background elements inside upload zone */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full" />
                <div className="absolute bottom-10 right-10 w-40 h-40 border border-white/20 rounded-full" />
              </div>
            </motion.div>

            {/* Data Security Note */}
            <div className="lg:col-span-1 p-8 bg-white/[0.02] border border-white/10 rounded-[3rem] flex flex-col justify-center gap-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-3">
                <p className="text-xs text-blue-500 font-bold uppercase tracking-[0.2em]">Bank-Grade Security</p>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Your data is encrypted end-to-end. BharatMind AI never stores your raw financial files; we only extract the neural metadata required for analysis.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest pt-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ISO 27001 Compliant
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results Grid */}
          <AnimatePresence>
            {analysisComplete && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {analysisModules.map((module, i) => (
                  <div key={i} className="p-8 glass-card border-l-4 border-l-blue-500/50 group hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <module.icon className={cn("w-5 h-5", module.color)} />
                      </div>
                      <h4 className="text-lg font-medium text-white tracking-tight">{module.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium">
                      {module.insight}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">
                        {module.status}
                      </span>
                      <button 
                        onClick={() => setActivePage(module.id)}
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2 group/link"
                      >
                        Deep Dive
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploaded Files List */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && !analysisComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] px-4">Recently Uploaded</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="p-4 glass-card flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200 truncate max-w-[150px]">{file.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { title: "Tally Sync", desc: "Direct XML import from TallyPrime", icon: Database },
          { title: "GST Portal", desc: "Fetch GSTR-2A/2B automatically", icon: ShieldCheck },
          { title: "Bank Feed", desc: "Connect 20+ Indian banks via API", icon: BarChart3 },
          { title: "Manual Entry", desc: "Quick ledger input for small shops", icon: FileText },
        ].map((item, i) => (
          <div key={i} className="p-6 glass-card hover:bg-white/[0.05] transition-all group cursor-pointer">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
              <item.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
            </div>
            <h4 className="text-lg font-light text-white tracking-tight mb-1">{item.title}</h4>
            <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
