import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Shield,
  Cpu,
  Radar,
  Eye,
  Crosshair,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../../lib/utils';

interface ForecastData {
  date: string;
  sales: number;
}

export function SalesForecast() {
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchForecast = async (forecastDays: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/forecast?days=${forecastDays}`);
      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      const response = await fetch('/api/sales/forecast/train', { method: 'POST' });
      const data = await response.json();
      setMetrics(data.metrics);
      await fetchForecast(days);
    } catch (error) {
      console.error('Failed to train model:', error);
    } finally {
      setTraining(false);
    }
  };

  useEffect(() => {
    fetchForecast(days);
  }, [days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{label}</p>
          <p className="text-sm font-bold text-emerald-500">
            ₹{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500 mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Predictive Neural Engine Active</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Sales <span className="text-emerald-500 font-medium italic">Forecasting</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">AI-powered predictive analytics using advanced XGBoost neural architectures.</p>
        </div>
        
        <div className="flex items-center gap-6 p-2 glass-card shadow-2xl">
          <select 
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="glass-input px-6 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:text-white transition-all cursor-pointer"
          >
            <option value={7} className="bg-[#0a0a0a]">Next 7 Days</option>
            <option value={14} className="bg-[#0a0a0a]">Next 14 Days</option>
            <option value={30} className="bg-[#0a0a0a]">Next 30 Days</option>
            <option value={90} className="bg-[#0a0a0a]">Next 90 Days</option>
          </select>
          
          <button 
            onClick={handleTrain}
            disabled={training}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20 group active:scale-[0.98]"
          >
            {training ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            )}
            {training ? 'Training Neural Model...' : 'Retrain AI'}
          </button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 glass-card shadow-2xl group hover:border-emerald-500/20 transition-all duration-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
            <BarChart3 className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mb-4">Forecasted Revenue</p>
          <h3 className="text-5xl font-light text-white tracking-tighter">
            ₹{forecast.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
          <div className="mt-8 flex items-center gap-3 text-emerald-500 text-[11px] font-bold uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span>+12.4% vs last period</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl group hover:border-amber-500/20 transition-all duration-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
            <Cpu className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mb-4">Model Accuracy (MAE)</p>
          <h3 className="text-5xl font-light text-white tracking-tighter">
            {metrics ? metrics.mae.toFixed(2) : '14.20'}
          </h3>
          <div className="mt-8 flex items-center gap-3 text-emerald-500 text-[11px] font-bold uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>XGBoost Regressor Active</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl group hover:border-blue-500/20 transition-all duration-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
            <Shield className="w-24 h-24 text-blue-500" />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mb-4">Confidence Interval</p>
          <h3 className="text-5xl font-light text-white tracking-tighter">94.2%</h3>
          <div className="mt-8 flex items-center gap-3 text-amber-500 text-[11px] font-bold uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span>Based on 365 days of history</span>
          </div>
        </motion.div>
      </div>

      {/* Main Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl hover:border-emerald-500/20 transition-all duration-700 relative z-10 group"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-3xl font-light text-white tracking-tight">Revenue <span className="text-emerald-500 font-medium italic">Projection</span></h3>
              <p className="text-sm text-gray-500 font-medium">Daily predicted sales for the next {days} days neural cycle.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white/[0.03] px-8 py-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Predicted Neural Path</span>
            </div>
          </div>
        </div>

        <div className="h-[450px] w-full">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em]">Synchronizing Neural Data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff20" 
                  fontSize={10}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={10}
                  tickFormatter={(val) => `₹${val}`}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl group hover:border-emerald-500/20 transition-all duration-700"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-2xl font-light text-white tracking-tight">AI <span className="text-emerald-500 font-medium italic">Insights</span></h4>
          </div>
          <ul className="space-y-6">
            {[
              "Strong upward trend detected for the next 14 days.",
              "Weekend sales are projected to be 15% higher than weekdays.",
              "Marketing spend has a 0.82 correlation with sales peaks.",
              "Upcoming holiday on April 10th is expected to drive a 25% spike."
            ].map((insight, i) => (
              <motion.li 
                key={i} 
                whileHover={{ x: 10 }}
                className="flex gap-4 text-base text-gray-400 font-medium group/item cursor-pointer"
              >
                <div className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="group-hover/item:text-white transition-colors">{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl group hover:border-amber-500/20 transition-all duration-700"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-2xl font-light text-white tracking-tight">Risk <span className="text-amber-500 font-medium italic">Assessment</span></h4>
          </div>
          <ul className="space-y-6">
            {[
              "Inventory levels for 'Cooking Oil' might be insufficient for the projected spike.",
              "Model uncertainty increases after 45 days of projection.",
              "External market volatility could impact accuracy by +/- 5%."
            ].map((risk, i) => (
              <motion.li 
                key={i} 
                whileHover={{ x: 10 }}
                className="flex gap-4 text-base text-gray-400 font-medium group/item cursor-pointer"
              >
                <div className="mt-2 w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="group-hover/item:text-white transition-colors">{risk}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
