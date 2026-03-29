import { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { io } from 'socket.io-client';
import { TaskCalendar } from './TaskCalendar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const revenueData = [
  { name: 'Jan', revenue: 4000, competitor: 2400 },
  { name: 'Feb', revenue: 3000, competitor: 1398 },
  { name: 'Mar', revenue: 2000, competitor: 9800 },
  { name: 'Apr', revenue: 2780, competitor: 3908 },
  { name: 'May', revenue: 1890, competitor: 4800 },
  { name: 'Jun', revenue: 2390, competitor: 3800 },
  { name: 'Jul', revenue: 3490, competitor: 4300 },
];

const marginData = [
  { name: 'Q1', margin: 38 },
  { name: 'Q2', margin: 42 },
  { name: 'Q3', margin: 41 },
  { name: 'Q4', margin: 45 },
];

export function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    setData({
      revenueGrowth: "+24.5%",
      revenueStatus: "strong",
      profitMargin: "18.2%",
      profitStatus: "strong",
      marketShare: "32%",
      marketStatus: "moderate",
      debtRatio: "1.2x",
      debtStatus: "risk",
      risk: {
        inventory: "Medium",
        marketShare: "High",
        cashFlow: "Low"
      }
    });

    // Connect to WebSocket for real-time updates
    const socket = io();

    socket.on('kpi_update', (newData) => {
      setData((prev: any) => ({
        ...prev,
        ...newData
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-emerald-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'strong') return 'text-emerald-500 bg-emerald-500';
    if (status === 'moderate') return 'text-amber-500 bg-amber-500';
    if (status === 'risk') return 'text-red-500 bg-red-500';
    return 'text-gray-500 bg-gray-500';
  };

  const getStatusTextColor = (status: string) => {
    if (status === 'strong') return 'text-emerald-500';
    if (status === 'moderate') return 'text-amber-500';
    if (status === 'risk') return 'text-red-500';
    return 'text-gray-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'strong') return 'Strong';
    if (status === 'moderate') return 'Moderate';
    if (status === 'risk') return 'High Risk';
    return 'Unknown';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#020617]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Business Intelligence</h1>
            <p className="text-white/40 font-medium tracking-wide uppercase text-xs">Bharat OS • Real-time Analysis</p>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-1.5">
            {['Overview', 'Financials', 'Operations', 'Risk'].map((tab) => (
              <button
                key={tab}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                  tab === 'Overview' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Top Insights - Decision First */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl p-6 transition-all duration-500"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Growth Insight</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Revenue is growing, but CAC is rising.</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">Your CAC has increased by 18% this month, primarily due to higher competition in digital ad auctions.</p>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Bharat Decision</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-400 font-medium">Shift 20% of ad budget to retention.</p>
                <button className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500">
                  Execute
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-2xl p-6 transition-all duration-500"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Risk Alert</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Inventory stock-out risk for Top 3 SKUs.</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">Current sales velocity suggests you will run out of stock in 4 days, while lead time is 7 days.</p>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Bharat Decision</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-amber-400 font-medium">Initiate emergency restock today.</p>
                <button className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-amber-500/20 hover:border-amber-500">
                  Execute
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Growth */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Revenue Growth</span>
              <TrendingUp className={`w-4 h-4 ${getStatusTextColor(data.revenueStatus)}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{data.revenueGrowth}</span>
              <span className="text-xs text-emerald-500 font-medium">+₹12.4L</span>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[75%]" />
            </div>
          </div>

          {/* Profit Margin */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Profit Margin</span>
              <Target className={`w-4 h-4 ${getStatusTextColor(data.profitStatus)}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{data.profitMargin}</span>
              <span className="text-xs text-emerald-500 font-medium">Target 20%</span>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[91%]" />
            </div>
          </div>

          {/* Market Share */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Market Share</span>
              <Activity className={`w-4 h-4 ${getStatusTextColor(data.marketStatus)}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{data.marketShare}</span>
              <span className="text-xs text-amber-500 font-medium">+2% YoY</span>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[45%]" />
            </div>
          </div>

          {/* Debt Ratio */}
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Debt Ratio</span>
              <AlertTriangle className={`w-4 h-4 ${getStatusTextColor(data.debtStatus)}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{data.debtRatio}</span>
              <span className="text-xs text-red-500 font-medium">High</span>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-[80%]" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Revenue vs Competitor</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-white/40 uppercase font-bold">BharatMind</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-white/40 uppercase font-bold">Industry Avg</span>
                </div>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="competitor" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Profit Margin Trend</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Target className="w-3 h-3 text-purple-500" />
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="margin" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Risk Assessment</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-sm text-white/60">Inventory Turnover</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">{data.risk.inventory}</span>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-sm text-white/60">Market Share Erosion</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest">{data.risk.marketShare}</span>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-sm text-white/60">Cash Flow</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">{data.risk.cashFlow}</span>
            </div>
          </div>
        </div>

        {/* Task Calendar */}
        <TaskCalendar />

      </div>
    </div>
  );
}
