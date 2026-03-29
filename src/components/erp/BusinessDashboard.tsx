import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  AlertCircle, 
  Lightbulb,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  x: string[];
  y: number[];
}

interface DashboardData {
  metrics: {
    revenue: number;
    profit: number;
    orders: number;
    growth: number;
  };
  charts: ChartData[];
  tables: {
    title: string;
    headers: string[];
    rows: any[][];
  }[];
  insights: string[];
  problems: string[];
  actions: string[];
  report?: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function BusinessDashboard({ data }: { data: DashboardData }) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: formatCurrency(data.metrics.revenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Est. Profit', value: formatCurrency(data.metrics.profit), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Orders', value: (data.metrics.orders || 0).toLocaleString(), icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Growth', value: `${data.metrics.growth}%`, icon: data.metrics.growth >= 0 ? TrendingUp : TrendingDown, color: data.metrics.growth >= 0 ? 'text-emerald-400' : 'text-red-400', bg: data.metrics.growth >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
        ].map((m, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", m.bg)}>
              <m.icon className={cn("w-4 h-4", m.color)} />
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{m.label}</p>
            <p className="text-xl font-bold text-white mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* 2. Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.charts.map((chart, i) => {
          const chartData = chart.x.map((label, idx) => ({
            name: label,
            value: chart.y[idx]
          }));

          return (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                {chart.type === 'line' ? <LineChartIcon className="w-4 h-4 text-blue-400" /> : 
                 chart.type === 'bar' ? <BarChart3 className="w-4 h-4 text-emerald-400" /> : 
                 <PieChartIcon className="w-4 h-4 text-purple-400" />}
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{chart.title}</h3>
              </div>
              
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  ) : chart.type === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Tables */}
      {data.tables && data.tables.length > 0 && (
        <div className="space-y-6">
          {data.tables.map((table, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{table.title}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      {table.headers.map((h, idx) => (
                        <th key={idx} className="px-6 py-3 text-zinc-500 font-medium border-b border-white/5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-6 py-4 text-zinc-300">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Insights & Growth Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Key Insights</span>
          </div>
          <ul className="space-y-3">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Problems */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Critical Problems</span>
          </div>
          <ul className="space-y-3">
            {data.problems.map((prob, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 shrink-0" />
                {prob}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Growth Actions */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">Growth Action Plan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.actions.map((action, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/[0.05] transition-all group">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AI Brain Report (Full Markdown) */}
      {data.report && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BarChart3 className="text-black w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Brain Report</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">Comprehensive Growth Strategy</p>
            </div>
          </div>
          
          <div className="prose prose-invert prose-emerald max-w-none">
            <ReactMarkdown>{data.report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
