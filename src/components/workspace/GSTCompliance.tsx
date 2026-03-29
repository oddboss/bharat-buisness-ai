import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight,
  Info,
  Zap,
  Clock,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function GSTCompliance() {
  const complianceStats = [
    { label: "GST Liability (Current Month)", value: "₹4,52,800", status: "Pending", color: "text-amber-400" },
    { label: "Input Tax Credit (ITC)", value: "₹1,24,500", status: "Verified", color: "text-emerald-400" },
    { label: "Compliance Score", value: "98/100", status: "Excellent", color: "text-blue-400" },
  ];

  const upcomingDeadlines = [
    { form: "GSTR-1", date: "Apr 11, 2026", daysLeft: 14, status: "Upcoming" },
    { form: "GSTR-3B", date: "Apr 20, 2026", daysLeft: 23, status: "Upcoming" },
  ];

  const itcInsights = [
    { title: "Unclaimed ITC Detected", description: "₹12,400 in ITC from vendor 'Alpha Logistics' is unclaimed due to invoice mismatch.", action: "Reconcile Now" },
    { title: "HSN Code Mismatch", description: "3 items in your inventory have incorrect HSN codes for the 18% slab.", action: "Fix Codes" },
  ];

  return (
    <div className="p-8 space-y-10 bg-[#020617] min-h-screen text-white font-sans selection:bg-emerald-500/30">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Compliance Guard Active</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">GST & <span className="text-emerald-500">Compliance</span></h1>
          <p className="text-white/40 text-sm">Automated Tally-to-GST reconciliation and risk monitoring.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 glass-card hover:bg-white/[0.05] text-white/70 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export GSTR Data
          </button>
          <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
            Run Full Audit
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {complianceStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glass-card group hover:border-emerald-500/20 transition-all duration-500"
          >
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={cn("text-3xl font-bold tracking-tight", stat.color)}>{stat.value}</h3>
              <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md">{stat.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Compliance Insights */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white/20 uppercase tracking-[0.3em] px-2">AI Compliance Insights</h3>
          <div className="space-y-4">
            {itcInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 glass-card border-l-4 border-l-emerald-500/50 group hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h4 className="font-bold text-white tracking-tight">{insight.title}</h4>
                  </div>
                  <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    {insight.action}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filing Deadlines */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white/20 uppercase tracking-[0.3em] px-2">Filing Deadlines</h3>
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm">Upcoming Filings</span>
                </div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">April 2026</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {upcomingDeadlines.map((deadline, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                      <span className="text-[10px] font-bold text-white/40 uppercase leading-none mb-1">Days</span>
                      <span className="text-lg font-bold text-white leading-none">{deadline.daysLeft}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white tracking-tight">{deadline.form}</h4>
                      <p className="text-xs text-white/30">{deadline.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500/60" />
                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">{deadline.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <div className="flex items-center gap-3 text-white/40">
                <Info className="w-4 h-4" />
                <p className="text-[10px] font-medium leading-relaxed">
                  BharatMind AI automatically syncs with your Tally ERP every 4 hours to ensure your GST liability is calculated on the latest data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
