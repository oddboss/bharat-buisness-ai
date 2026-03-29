import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Filter, 
  Download, 
  Zap, 
  ChevronRight,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Loader2,
  AlertCircle,
  Database,
  Activity,
  Target,
  Globe,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell, 
  Pie 
} from 'recharts';
import { useFirebase } from '../../contexts/FirebaseContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';
import { cn } from '../../lib/utils';

interface FinancialRecord {
  id: string;
  month: string;
  revenue: number;
  profit: number;
  year: number;
}

const categoryData = [
  { name: 'Silk Saree', value: 45, color: '#10b981' },
  { name: 'Cotton Blend', value: 30, color: '#3b82f6' },
  { name: 'Ready-to-wear', value: 15, color: '#f59e0b' },
  { name: 'Accessories', value: 10, color: '#8b5cf6' },
];

export function Analytics() {
  const { db, organizationId } = useFirebase();
  const [timeRange, setTimeRange] = useState('7D');
  const [financialData, setFinancialData] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!db || !organizationId) return;

    const path = `organizations/${organizationId}/financial_data`;
    const q = query(collection(db, path), orderBy('year', 'asc'), orderBy('month', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancialRecord[];
      setFinancialData(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      setError('Failed to load analytics data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, organizationId]);

  const seedDemoData = async () => {
    if (!db || !organizationId) return;
    setIsSeeding(true);
    
    const demoData = [
      { month: 'Jan', revenue: 45000, profit: 12000, year: 2024 },
      { month: 'Feb', revenue: 52000, profit: 15000, year: 2024 },
      { month: 'Mar', revenue: 48000, profit: 11000, year: 2024 },
      { month: 'Apr', revenue: 61000, profit: 18000, year: 2024 },
      { month: 'May', revenue: 55000, profit: 14000, year: 2024 },
      { month: 'Jun', revenue: 67000, profit: 22000, year: 2024 },
      { month: 'Jul', revenue: 72000, profit: 25000, year: 2024 },
    ];

    try {
      for (const item of demoData) {
        const id = `${organizationId}_${item.year}_${item.month}`;
        const path = `organizations/${organizationId}/financial_data`;
        await setDoc(doc(db, path, id), {
          ...item,
          id,
          organizationId
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `organizations/${organizationId}/financial_data`);
      setError('Failed to seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const chartData = useMemo(() => {
    if (financialData.length > 0) return financialData;
    return [
      { month: 'No Data', revenue: 0, profit: 0 }
    ];
  }, [financialData]);

  const totalRevenue = useMemo(() => {
    return financialData.reduce((sum, item) => sum + item.revenue, 0);
  }, [financialData]);

  const avgProfit = useMemo(() => {
    if (financialData.length === 0) return 0;
    return financialData.reduce((sum, item) => sum + item.profit, 0) / financialData.length;
  }, [financialData]);

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `₹${totalRevenue.toLocaleString('en-IN')}`, 
      change: '+12.5%', 
      isPositive: true, 
      icon: <DollarSign className="w-5 h-5" />,
      color: 'emerald'
    },
    { 
      label: 'Active Customers', 
      value: '1,284', 
      change: '+8.2%', 
      isPositive: true, 
      icon: <Users className="w-5 h-5" />,
      color: 'blue'
    },
    { 
      label: 'Avg. Profit', 
      value: `₹${Math.round(avgProfit).toLocaleString('en-IN')}`, 
      change: '-2.4%', 
      isPositive: false, 
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'amber'
    },
    { 
      label: 'Conversion Rate', 
      value: '4.2%', 
      change: '+1.1%', 
      isPositive: true, 
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500 mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Intelligence Engine Active</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Business <span className="text-emerald-500 font-medium italic">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Real-time business intelligence and growth insights.</p>
        </div>
        
        <div className="flex items-center gap-4 glass-card p-2 shadow-2xl">
          {financialData.length === 0 && (
            <button 
              onClick={seedDemoData}
              disabled={isSeeding}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 group"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              <span>Seed Demo Data</span>
            </button>
          )}
          <div className="flex bg-white/5 border border-white/5 rounded-xl p-1">
            {['7D', '1M', '3M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                  timeRange === range 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm backdrop-blur-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Dismiss</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 group relative overflow-hidden shadow-2xl"
          >
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-20 transition-opacity duration-700",
              stat.color === 'emerald' ? 'bg-emerald-500' :
              stat.color === 'blue' ? 'bg-blue-500' :
              stat.color === 'amber' ? 'bg-amber-500' : 'bg-purple-500'
            )} />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                stat.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              )}>
                {stat.icon}
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md",
                stat.isPositive 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              )}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em] relative z-10">{stat.label}</h3>
            <p className="text-4xl font-light text-white mt-2 tracking-tighter relative z-10">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl hover:border-emerald-500/20 transition-all duration-700 group"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                <LineChartIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white tracking-tight">Revenue vs <span className="text-emerald-500 font-medium italic">Profit</span></h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mt-1">Real-time Performance Matrix</p>
              </div>
            </div>
            <div className="flex items-center gap-6 bg-white/[0.03] px-6 py-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Revenue</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Profit</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  dy={15}
                  tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold', letterSpacing: '0.1em' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `₹${value/1000}k`}
                  tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 5, 5, 0.95)', 
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    fontSize: '11px',
                    padding: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ fontWeight: 700 }}
                  cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={3000}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#050505' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  animationDuration={3000}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#050505' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl hover:border-purple-500/20 transition-all duration-700 group"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
              <PieChartIcon className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-2xl font-light text-white tracking-tight">Sales <span className="text-purple-500 font-medium italic">Distribution</span></h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mt-1">Product Category Mix</p>
            </div>
          </div>

          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={2500}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 5, 5, 0.95)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-4xl font-light text-white tracking-tighter">100<span className="text-purple-500 font-medium">%</span></p>
              <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-bold mt-1">Total Mix</p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {categoryData.map((cat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all group/item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-gray-400 group-hover/item:text-white transition-colors font-medium">{cat.name}</span>
                </div>
                <span className="text-xs text-white font-bold bg-white/5 px-3 py-1 rounded-lg">{cat.value}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-700 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
            <Zap className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-3xl font-light text-white tracking-tight">AI Growth <span className="text-emerald-500 font-medium italic">Prediction</span></h3>
            <p className="text-gray-400 mt-2 max-w-xl text-base font-medium">BharatMind predicts a <span className="text-emerald-400 font-bold">15% revenue increase</span> next month based on current neural patterns and market trends.</p>
          </div>
        </div>
        
        <button className="relative z-10 px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.3)] group/btn">
          <span>View Detailed Forecast</span>
          <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
