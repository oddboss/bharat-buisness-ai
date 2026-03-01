import { X, TrendingUp, AlertTriangle, Activity, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Q1', revenue: 4000, competitor: 2400 },
  { name: 'Q2', revenue: 3000, competitor: 1398 },
  { name: 'Q3', revenue: 2000, competitor: 9800 },
  { name: 'Q4', revenue: 2780, competitor: 3908 },
  { name: 'Q1', revenue: 1890, competitor: 4800 },
  { name: 'Q2', revenue: 2390, competitor: 3800 },
  { name: 'Q3', revenue: 3490, competitor: 4300 },
];

export function RightPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-[320px] bg-[#171717] border-l border-white/5 flex flex-col h-full flex-shrink-0">
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
        <span className="font-semibold text-sm tracking-wide text-gray-200">Intelligence Dashboard</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Health Score */}
        <div className="bg-[#212121] rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Business Health</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">84</span>
            <span className="text-sm text-emerald-500 font-medium mb-1">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[84%] rounded-full" />
          </div>
        </div>

        {/* Key KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#212121] rounded-xl p-3 border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Gross Margin</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold text-white">42.8%</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            </div>
          </div>
          <div className="bg-[#212121] rounded-xl p-3 border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Burn Rate</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold text-white">$45k</span>
              <ArrowDownRight className="w-3 h-3 text-red-500" />
            </div>
          </div>
        </div>

        {/* Quick Graph */}
        <div className="bg-[#212121] rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue vs Competitor</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="competitor" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Indicator */}
        <div className="bg-[#212121] rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Assessment</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Inventory Turnover</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Market Share Erosion</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Cash Flow</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Low</span>
            </div>
          </div>
        </div>

        {/* Strategic Position */}
        <div className="bg-[#212121] rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Strategic Position</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <span className="block text-sm font-medium text-white">Challenger</span>
              <span className="block text-xs text-gray-400 mt-0.5">High growth, medium share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
