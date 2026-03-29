import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  ShieldAlert, 
  Zap, 
  Target, 
  TrendingDown, 
  Users, 
  BarChart3, 
  Globe, 
  AlertCircle,
  ChevronRight,
  Activity,
  Shield,
  Cpu,
  Radar,
  Eye,
  Crosshair
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function CompetitorMode() {
  const competitors = [
    { name: "Competitor Alpha", marketShare: "32%", strategy: "Aggressive Pricing", impact: "High" },
    { name: "Competitor Beta", marketShare: "18%", strategy: "Premium Branding", impact: "Medium" },
    { name: "Competitor Gamma", marketShare: "12%", strategy: "Social Commerce", impact: "Low" }
  ];

  const threats = [
    {
      title: "Pricing Pressure",
      description: "Competitor Alpha just dropped prices by 15% on key items.",
      action: "Optimize loyalty rewards to retain high-value customers.",
      severity: "High"
    },
    {
      title: "Market Expansion",
      description: "Competitor Beta is opening 5 new stores in your top-performing city.",
      action: "Launch local marketing campaign highlighting unique value.",
      severity: "Medium"
    },
    {
      title: "Product Innovation",
      description: "Competitor Gamma launched a new sustainable line.",
      action: "Accelerate your eco-friendly product development.",
      severity: "Low"
    }
  ];

  return (
    <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans selection:bg-red-500/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-red-500 mb-1">
            <Radar className="w-4 h-4 animate-spin-slow" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-red-400/80">Market Surveillance Active</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Competitor <span className="text-red-500 font-medium italic">Mode</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Simulating market dynamics and competitive strategy neural network.</p>
        </div>
        
        <div className="flex items-center gap-6 p-2 glass-card shadow-2xl">
          <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 group">
            <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Threat Level</span>
              <span className="text-sm font-bold text-red-500">Elevated Response</span>
            </div>
          </div>
          <button className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 group">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Simulate Response
            </span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {competitors.map((comp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 glass-card shadow-2xl group hover:border-red-500/20 transition-all duration-700 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Briefcase className="w-7 h-7 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white tracking-tight">{comp.name}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Market Share: {comp.marketShare}</p>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md",
                comp.impact === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                comp.impact === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              )}>
                {comp.impact} Impact
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 mb-6">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-2">Current Strategy</p>
              <p className="text-base text-gray-200 font-medium">{comp.strategy}</p>
            </div>

            <button className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl text-[11px] font-bold text-gray-500 hover:text-white transition-all duration-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2 group/btn">
              Analyze Weaknesses
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {/* Threat Intelligence */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-10 glass-card shadow-2xl hover:border-red-500/20 transition-all duration-700 group"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-3xl font-light text-white tracking-tight">Threat <span className="text-red-500 font-medium italic">Intelligence</span></h3>
              <p className="text-sm text-gray-500 font-medium">Real-time alerts and recommended strategic actions</p>
            </div>
          </div>

          <div className="space-y-6">
            {threats.map((threat, i) => (
              <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] group/threat hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-light text-white tracking-tight">{threat.title}</h4>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                    threat.severity === 'High' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                    threat.severity === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
                    'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                  )}>{threat.severity} Severity</span>
                </div>
                <p className="text-base text-gray-400 mb-8 leading-relaxed font-medium">{threat.description}</p>
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4 group-hover/threat:border-emerald-500/30 transition-colors duration-500">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-1">AI Counter-Action</p>
                    <p className="text-sm text-emerald-400 font-medium leading-relaxed">{threat.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Market Share Simulation */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-10 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl hover:border-blue-500/20 transition-all duration-700 group"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-3xl font-light text-white tracking-tight">Market <span className="text-blue-500 font-medium italic">Simulation</span></h3>
              <p className="text-sm text-gray-500 font-medium">Predicting neural market shift over next 6 months</p>
            </div>
          </div>

          <div className="space-y-10">
            {[
              { label: "Your Business", value: 38, color: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" },
              { label: "Competitor Alpha", value: 32, color: "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" },
              { label: "Competitor Beta", value: 18, color: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" },
              { label: "Others", value: 12, color: "bg-white/20" }
            ].map((item, i) => (
              <div key={i} className="space-y-4 group/bar">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em]">
                  <span className="text-gray-500 group-hover/bar:text-gray-300 transition-colors">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                    className={cn("h-full rounded-full relative overflow-hidden", item.color)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] relative overflow-hidden group/insight">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-emerald-500 shrink-0 mt-1 group-hover/insight:scale-110 transition-transform" />
              <p className="text-base text-gray-400 leading-relaxed font-medium italic">
                "Neural AI predicts a potential <span className="text-emerald-400 font-bold">4% market share gain</span> if Pricing Engine recommendations are implemented by Q3."
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
