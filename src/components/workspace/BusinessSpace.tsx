import React, { useState, useEffect, useMemo } from 'react';
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Zap, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Loader2,
  FileText,
  Plus
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';

interface FinancialRecord {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export function BusinessSpace() {
  const { db, organizationId } = useFirebase();
  const [financialData, setFinancialData] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !organizationId) return;

    const financePath = `organizations/${organizationId}/financial_data`;
    const financeQuery = query(collection(db, financePath), orderBy('year', 'asc'), orderBy('month', 'asc'));

    const unsub = onSnapshot(financeQuery, (snapshot) => {
      setFinancialData(snapshot.docs.map(doc => doc.data()) as FinancialRecord[]);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, financePath));

    return () => unsub();
  }, [db, organizationId]);

  const metrics = useMemo(() => {
    if (financialData.length === 0) return {
      revenue: 1250000,
      expenses: 850000,
      profit: 400000,
      margin: 32
    };

    const latest = financialData[financialData.length - 1];
    return {
      revenue: latest.revenue,
      expenses: latest.expenses,
      profit: latest.profit,
      margin: Math.round((latest.profit / latest.revenue) * 100)
    };
  }, [financialData]);

  const cashFlowData = useMemo(() => {
    if (financialData.length > 0) return financialData;
    return [
      { month: 'Jan', revenue: 4000, expenses: 2400 },
      { month: 'Feb', revenue: 3000, expenses: 1398 },
      { month: 'Mar', revenue: 2000, expenses: 9800 },
      { month: 'Apr', revenue: 2780, expenses: 3908 },
      { month: 'May', revenue: 1890, expenses: 4800 },
      { month: 'Jun', revenue: 2390, expenses: 3800 },
    ];
  }, [financialData]);

  const expenseBreakdown = [
    { name: 'Operations', value: 400, color: '#10b981' },
    { name: 'Marketing', value: 300, color: '#3b82f6' },
    { name: 'Payroll', value: 300, color: '#8b5cf6' },
    { name: 'Infrastructure', value: 200, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#050505]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-emerald-500/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin absolute top-2 left-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500/30">
      {/* Profit + Cash Flow Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Financial Intelligence Active</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white">
            Profit <span className="text-emerald-500 font-medium">+ Cash Flow</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md">Deep-dive into your business's financial health and profitability engines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-[0.2em]">
            Export Ledger
          </button>
          <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            Sync Tally Data
          </button>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Revenue', value: `₹${(metrics.revenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-emerald-500', trend: '+12.5%' },
          { label: 'Total Expenses', value: `₹${(metrics.expenses / 100000).toFixed(1)}L`, icon: ArrowDownRight, color: 'text-red-500', trend: '-2.4%' },
          { label: 'Net Profit', value: `₹${(metrics.profit / 100000).toFixed(1)}L`, icon: Zap, color: 'text-blue-500', trend: '+18.2%' },
          { label: 'Profit Margin', value: `${metrics.margin}%`, icon: PieChart, color: 'text-purple-500', trend: '+5.1%' },
        ].map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 glass-card group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all`}>
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{m.trend}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">{m.label}</p>
            <h4 className="text-3xl font-light tracking-tight group-hover:scale-105 transition-transform origin-left duration-500">{m.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analysis Zoned Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cash Flow Analysis */}
        <div className="lg:col-span-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
          <div className="mb-10">
            <h3 className="text-2xl font-light tracking-tight">Cash Flow <span className="font-medium text-emerald-500">Analysis</span></h3>
            <p className="text-xs text-gray-500 mt-1">Monthly inflow vs outflow intelligence</p>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#ffffff20" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={15}
                  tick={{ fill: '#4b5563', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value/1000}k`}
                  tick={{ fill: '#4b5563', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 5, 5, 0.9)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    fontSize: '10px',
                    padding: '16px'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="lg:col-span-4 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl">
          <div className="mb-10">
            <h3 className="text-2xl font-light tracking-tight">Expense <span className="font-medium text-purple-500">Breakdown</span></h3>
            <p className="text-xs text-gray-500 mt-1">Where your capital is being deployed</p>
          </div>

          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-light tracking-tight">₹1.2M</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {expenseBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">₹{item.value}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligence Insights Section */}
      <div className="p-10 rounded-[3rem] bg-emerald-500/[0.02] border border-emerald-500/10 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10">
          <Zap className="w-12 h-12 text-emerald-500/20" />
        </div>
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center gap-3 text-emerald-500">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">AI Profit Optimization Insight</span>
          </div>
          <h3 className="text-3xl font-light tracking-tight leading-tight">
            Reducing <span className="text-emerald-500 font-medium">Operational Overhead</span> by 12% could increase your annual net profit by <span className="text-emerald-500 font-medium">₹4.2 Lakhs</span>.
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            BharatMind AI detected a pattern in your recurring subscription costs and cloud infrastructure spend. We recommend consolidating three redundant SaaS tools.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              Apply Optimization
            </button>
            <button className="px-8 py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-[0.2em]">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
