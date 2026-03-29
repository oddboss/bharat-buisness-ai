import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, TrendingUp, BarChart3, Activity,
  Play, RefreshCw, ShieldCheck, MessageSquare,
  AlertTriangle, CheckCircle2, ArrowRight,
  Cpu, Globe, Lock, Terminal, Radio,
  Layers, Database, Search, Settings,
  Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell,
  RadialBarChart, RadialBar
} from 'recharts';
import { analyzeData } from '../../services/geminiService';
import { cn } from '../../lib/utils';

// Mock data for charts
const revenueData = [
  { name: 'Mon', revenue: 45000, profit: 12000 },
  { name: 'Tue', revenue: 52000, profit: 15000 },
  { name: 'Wed', revenue: 48000, profit: 13000 },
  { name: 'Thu', revenue: 61000, profit: 18000 },
  { name: 'Fri', revenue: 55000, profit: 16000 },
  { name: 'Sat', revenue: 72000, profit: 22000 },
  { name: 'Sun', revenue: 68000, profit: 20000 },
];

const healthData = [
  { name: 'Health', value: 84, fill: '#10b981' },
];

export const CommandCenter: React.FC = () => {
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSystem, setActiveSystem] = useState('core');
  const [logs, setLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchIntelligence();
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] System check: ${['Revenue Radar active', 'Growth Engine optimized', 'Competitor threats scanned', 'Cash flow reconciled'][Math.floor(Math.random() * 4)]}`;
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      setIsScanning(true);
      // Simulate data context
      const mockContext = { revenue: 1200000, expenses: 800000, inventory: { low: ['Product A', 'Product B'] } };
      const data = await analyzeData('Provide a full system status report', mockContext);
      setIntelligence(data);
    } catch (err) {
      console.error('Failed to fetch intelligence', err);
      // Fallback
      setIntelligence({
        metrics: [
          { name: "Revenue", value: "₹12.4L", trend: "+14%", isPositive: true },
          { name: "Net Profit", value: "₹4.2L", trend: "+8%", isPositive: true },
          { name: "Cash Flow", value: "₹8.1L", trend: "-2%", isPositive: false }
        ],
        insights: ["Revenue peaked at 4 PM yesterday", "Inventory turnover increased by 12%"],
        actions: ["Optimize logistics for Zone B", "Restock high-demand electronics"]
      });
    } finally {
      setLoading(false);
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] orb-animation" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] orb-animation" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[100px] orb-animation" style={{ animationDelay: '-1s' }} />
      </div>

      {/* System Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 transition-all duration-500 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20">
              <Cpu className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-500/30 rounded-[2.5rem] blur-xl"
            />
            {isScanning && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] z-20"
              />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">Neural Core Active</span>
              </div>
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">v2.8.4-stable</span>
            </div>
            <h1 className="text-6xl font-light tracking-tighter text-white leading-none">
              AI <span className="text-emerald-500 font-medium">Command</span>
            </h1>
            <p className="text-gray-500 text-sm font-light tracking-wide max-w-md">
              Self-evolving business intelligence engine monitoring real-time operational vectors.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="hidden xl:flex flex-col items-end gap-2">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Processing Load</span>
              <span className="text-[10px] font-mono text-emerald-500">42.8%</span>
            </div>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                animate={{ width: ['30%', '55%', '40%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              />
            </div>
          </div>
          
          <button 
            onClick={fetchIntelligence}
            disabled={loading}
            className="group relative px-10 py-5 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/50 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="relative flex items-center gap-4">
              <RefreshCw className={cn("w-5 h-5 transition-transform duration-700", loading && "animate-spin")} />
              <span className="uppercase text-[11px] tracking-[0.25em]">Sync Intelligence</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Logs & Nodes */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <Terminal className="w-4 h-4 text-emerald-500" /> System Logs
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" />
            </div>
            <div className="space-y-4 h-[240px] overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div 
                    key={log + i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-[10px] font-mono text-emerald-500/50 leading-relaxed border-l-2 border-emerald-500/10 pl-4 hover:text-emerald-400 hover:border-emerald-500/40 transition-all cursor-default"
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Radio className="w-4 h-4 text-blue-500" /> Active Nodes
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Revenue Radar', status: 'Online', color: 'bg-emerald-500', icon: Search },
                { name: 'Growth Engine', status: 'Optimizing', color: 'bg-blue-500', icon: TrendingUp },
                { name: 'Competitor Mode', status: 'Scanning', color: 'bg-amber-500', icon: Globe },
                { name: 'Tally Sync', status: 'Idle', color: 'bg-white/20', icon: Database },
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <node.icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{node.status}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", node.color)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Intelligence Brief */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 pointer-events-none group-hover:scale-110">
              <Globe className="w-80 h-80 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-light tracking-tight text-white">Executive Intelligence</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Autonomous Operational Synthesis</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Multi-Source Analysis</span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-4">
                        <div className="h-2 bg-white/5 rounded-full w-1/2 animate-pulse" />
                        <div className="h-10 bg-white/5 rounded-2xl w-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-3 gap-8">
                    {intelligence?.metrics?.map((m: any, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-2 group/metric"
                      >
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-3 group-hover/metric:text-emerald-500 transition-colors">{m.name}</p>
                        <p className="text-4xl font-light tracking-tighter text-white font-mono">{m.value}</p>
                        <div className={cn(
                          "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mt-2",
                          m.isPositive ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          <div className={cn("p-1 rounded-md", m.isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                            {m.isPositive ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          </div>
                          {m.trend}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.4em] whitespace-nowrap">Core Insights</p>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {intelligence?.insights?.map((insight: string, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-start gap-5 p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group"
                        >
                          <div className="w-10 h-10 bg-emerald-500/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-all duration-500 group-hover:rotate-12">
                            <Zap className="w-5 h-5 text-emerald-500" />
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed font-light group-hover:text-gray-200 transition-colors">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-10">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-light tracking-tight text-white">Revenue Trajectory</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live performance vs AI prediction</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Actual</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Projected</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    tick={{ fill: '#666', fontWeight: 'bold', letterSpacing: '0.1em' }}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dx={-10}
                    tick={{ fill: '#666', fontWeight: 'bold' }}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 10, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      borderRadius: '24px', 
                      backdropFilter: 'blur(24px)',
                      padding: '16px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#10b981', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.2em' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#050505' }}
                    activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Health & Actions */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-10 flex flex-col items-center text-center group">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-12">Business Health Index</p>
            <div className="relative w-56 h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" 
                  barSize={16} data={healthData} startAngle={90} endAngle={450}
                >
                  <RadialBar 
                    background={{ fill: 'rgba(255,255,255,0.03)' }} 
                    dataKey="value" 
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-light tracking-tighter text-white font-mono"
                >
                  84
                </motion.span>
                <div className="flex items-center gap-1 text-emerald-500 mt-2">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">+2.4%</span>
                </div>
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10%] border border-emerald-500/10 rounded-full border-dashed pointer-events-none"
              />
            </div>
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Optimal Performance</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] leading-relaxed font-medium max-w-[200px]">
                Operational efficiency is within target parameters.
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-500" /> Critical Actions
              </h3>
              <div className="px-2 py-1 bg-amber-500/10 rounded text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                Priority
              </div>
            </div>
            <div className="space-y-4">
              {intelligence?.actions?.map((action: string, i: number) => (
                <motion.button 
                  key={i} 
                  whileHover={{ x: 5 }}
                  className="w-full p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
                >
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-light leading-snug">{action}</span>
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
