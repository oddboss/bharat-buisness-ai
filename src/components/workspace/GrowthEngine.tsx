import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Instagram, 
  Users, 
  BarChart3,
  ChevronRight,
  Activity,
  Rocket,
  Globe,
  Cpu,
  Shield,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function GrowthEngine() {
  const strategies = [
    {
      title: "Marketing Intelligence",
      icon: Instagram,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      items: [
        { label: "Target Audience", value: "Ages 25-40, Tier 1 Cities, Tech-savvy" },
        { label: "Ad Strategy", value: "Meta Advantage+ with dynamic creative" },
        { label: "Content Idea", value: "Behind-the-scenes production reels" }
      ]
    },
    {
      title: "Product Intelligence",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      items: [
        { label: "Scale Candidate", value: "Premium Leather Handbags (SKU-402)" },
        { label: "New Idea", value: "Eco-friendly travel accessories line" },
        { label: "Cross-sell", value: "Matching wallets for top-selling totes" }
      ]
    },
    {
      title: "Location Intelligence",
      icon: MapPin,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      items: [
        { label: "Expansion City", value: "Bangalore (High demand density)" },
        { label: "Store Format", value: "Experience Center (Koramangala)" },
        { label: "Local Trend", value: "Sustainable fashion preference" }
      ]
    },
    {
      title: "Pricing Engine",
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      items: [
        { label: "Optimization", value: "Increase SKU-105 price by 8%" },
        { label: "Bundle Offer", value: "3-pack essentials (Save 15%)" },
        { label: "Dynamic Pricing", value: "Weekend surge pricing for top items" }
      ]
    }
  ];

  return (
    <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500 mb-1">
            <Rocket className="w-4 h-4 animate-bounce" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Growth Engine Initialized</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Growth <span className="text-emerald-500 font-medium italic">Engine</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">AI-driven strategies to scale your business neural network.</p>
        </div>
        
        <div className="flex items-center gap-6 p-2 glass-card shadow-2xl">
          <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 group">
            <TrendingUp className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Predicted Growth</span>
              <span className="text-sm font-bold text-emerald-500">+24% Neural Scale</span>
            </div>
          </div>
          <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 group">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Execute All Actions
            </span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {strategies.map((strategy, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 glass-card shadow-2xl group hover:border-emerald-500/20 transition-all duration-700 relative overflow-hidden"
          >
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-20 transition-opacity duration-700",
              strategy.color.replace('text', 'bg')
            )} />
            
            <div className="flex items-center gap-6 mb-10 relative z-10">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border",
                strategy.bg,
                strategy.color.replace('text', 'border').replace('500', '500/20')
              )}>
                <strategy.icon className={cn("w-8 h-8", strategy.color)} />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white tracking-tight">{strategy.title}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Strategic Intelligence Node</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              {strategy.items.map((item, j) => (
                <motion.div 
                  key={j} 
                  whileHover={{ x: 10 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                  <p className="text-base text-gray-200 group-hover/item:text-white font-medium transition-colors">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl text-[11px] font-bold text-gray-500 hover:text-white transition-all duration-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2 group/btn">
              View Detailed Analysis
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Growth Simulation Chart Placeholder */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl hover:border-emerald-500/20 transition-all duration-700 relative z-10 group"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
              <BarChart3 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-3xl font-light text-white tracking-tight">Growth <span className="text-emerald-500 font-medium italic">Simulation</span></h3>
              <p className="text-sm text-gray-500 font-medium">Visualizing neural impact of AI recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-white/[0.03] px-8 py-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Optimized Path</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white/20 rounded-full" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Trajectory</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full flex items-end justify-between gap-6 px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
              <div className="w-full relative flex items-end justify-center gap-2 h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${40 + Math.random() * 60}%` }}
                  transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                  className="w-full bg-emerald-500/20 rounded-t-xl group-hover/bar:bg-emerald-500/40 transition-colors duration-500 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent" />
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${20 + Math.random() * 40}%` }}
                  transition={{ duration: 1.5, delay: i * 0.05 + 0.2, ease: "easeOut" }}
                  className="w-full bg-white/5 rounded-t-xl group-hover/bar:bg-white/10 transition-colors duration-500"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-600 group-hover/bar:text-gray-400 uppercase tracking-widest transition-colors">M{i + 1}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
