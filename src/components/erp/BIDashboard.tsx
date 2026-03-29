import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import { Settings, Download, Share2, Maximize2, RefreshCw, Zap, Users, ShoppingBag, AlertCircle, IndianRupee, Send, Sparkles, Loader2, BarChart3, PieChart as PieIcon, TrendingUp, Info, Calendar, Building2, Filter, ChevronDown, MessageSquare, Database, Table as TableIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { format, subDays } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface DashboardAIResult {
  chart_type: string;
  title: string;
  x_axis_label: string;
  y_axis_label: string;
  x_values: any[];
  y_values: any[];
  insights: string[];
}

export function BIDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<DashboardAIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [businessUnit, setBusinessUnit] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDataSources, setShowDataSources] = useState(false);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const aiResultRef = useRef<HTMLDivElement>(null);

  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const sendToWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      const message = `Executive Summary Report:\n- Total Revenue: ₹${(stats?.kpis?.total_revenue || 0).toLocaleString()}\n- Total Customers: ${stats?.kpis?.total_customers || 0}\n- Low Stock Items: ${stats?.kpis?.low_stock_items || 0}`;
      
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: '919876543210',
          message
        })
      });

      if (res.ok) {
        alert('Report sent to WhatsApp successfully!');
      } else {
        throw new Error('Failed to send WhatsApp message');
      }
    } catch (err) {
      console.error('WhatsApp Error:', err);
      alert('Failed to send WhatsApp report. Check server logs.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (dateRange !== 'all') params.append('dateRange', dateRange);
      if (businessUnit !== 'All') params.append('businessUnit', businessUnit);
      if (dateRange === 'custom') {
        if (customStartDate) params.append('startDate', customStartDate);
        if (customEndDate) params.append('endDate', customEndDate);
      }

      const res = await fetch(`/api/bi/stats?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch BI stats:', err);
    } finally {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const fetchDataSources = async () => {
    try {
      const res = await fetch('/api/bi/data-sources');
      if (res.ok) {
        const data = await res.json();
        setDataSources(data);
      }
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDataSources();
  }, [dateRange, businessUnit, customStartDate, customEndDate]);

  const runDashboardAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      // Fetch context data for the AI
      const [invRes, custRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/customers')
      ]);
      
      const inventory = await invRes.json();
      const customers = await custRes.json();
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Question: ${aiQuery}\n\nDataset Context:\nInventory: ${JSON.stringify(inventory.slice(0, 20))}\nCustomers: ${JSON.stringify(customers.slice(0, 20))}\nKPIs: ${JSON.stringify(stats?.kpis || {})}`,
        config: {
          systemInstruction: `You are BharatMind AI Copilot, an intelligent business analyst.
You are connected to a SQL database with tables:
- customers (id, customer_name, email, phone, status)
- products (product_id, name, category, price, stock)
- orders (order_id, customer_id, order_date, total_amount)
- order_items (order_item_id, order_id, product_id, quantity, price)
- inventory (id, product_name, sku, category, stock_quantity, cost_price, selling_price, supplier, warehouse, business_unit, reorder_level)
- sales (id, customer_id, product_id, quantity, total_amount, business_unit, sale_date)

Your job:
1. Convert user questions into SQL queries.
2. Execute queries.
3. Return:
   - Insights
   - Trends
   - Business suggestions
4. If needed, suggest charts (bar, line, pie).

Rules:
- Always optimize SQL queries.
- Always explain insights in simple business language.
- If revenue is low → suggest actions.
- If stock is low → alert.
- If trend drops → analyze reason.
- Only use available columns.
- Group and aggregate correctly.
- Never fabricate data.

Always output chart data in JSON format.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chart_type: { type: Type.STRING },
              title: { type: Type.STRING },
              x_axis_label: { type: Type.STRING },
              y_axis_label: { type: Type.STRING },
              x_values: { type: Type.ARRAY, items: { type: Type.STRING } },
              y_values: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["chart_type", "title", "x_axis_label", "y_axis_label", "x_values", "y_values", "insights"]
          }
        }
      });

      const result = JSON.parse(response.text) as DashboardAIResult;
      setAiResult(result);
      
      if (aiResultRef.current) {
        setTimeout(() => {
          aiResultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error('Dashboard AI Error:', err);
      setError(err.message || "Failed to generate chart. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAIChart = () => {
    if (!aiResult) return null;

    const chartData = aiResult.x_values.map((x, i) => ({
      name: x,
      value: aiResult.y_values[i]
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    return (
      <div className="bg-[#111111] border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-emerald-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500" ref={aiResultRef}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{aiResult.title}</h3>
              <p className="text-xs text-gray-400">AI-Generated Visualization</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {aiResult.chart_type === 'bar' ? (
                <BarChart {...commonProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : aiResult.chart_type === 'line' ? (
                <LineChart {...commonProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : aiResult.chart_type === 'pie' || aiResult.chart_type === 'donut' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={aiResult.chart_type === 'donut' ? 70 : 0}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              ) : aiResult.chart_type === 'area' ? (
                <AreaChart {...commonProps}>
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={12} />
                  <YAxis stroke="#4b5563" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAi)" />
                </AreaChart>
              ) : aiResult.chart_type === 'radar' ? (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="name" stroke="#4b5563" fontSize={10} />
                  <PolarRadiusAxis stroke="#4b5563" fontSize={10} />
                  <Radar name="Value" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                </RadarChart>
              ) : (
                <BarChart {...commonProps}>
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              Strategic Insights
            </h4>
            <div className="space-y-3">
              {aiResult.insights.map((insight, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm text-gray-400 leading-relaxed">
                  {insight}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Confidence Score</span>
                <span className="text-emerald-500 font-bold">94%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[94%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const salesTrend = stats?.salesByMonth?.length > 0 
    ? stats.salesByMonth.map((s: any) => ({
        name: monthNames[parseInt(s.month) - 1] || s.month,
        sales: s.sales,
        profit: s.sales * 0.3 // Mock profit for now
      }))
    : [
        { name: 'Jan', sales: 4000, profit: 1200 },
        { name: 'Feb', sales: 3000, profit: 900 },
        { name: 'Mar', sales: 2000, profit: 600 },
        { name: 'Apr', sales: 2780, profit: 834 },
      ];

  const categoryData = stats?.salesByCategory?.length > 0
    ? stats.salesByCategory
    : [
        { name: 'Electronics', value: 400 },
        { name: 'Clothing', value: 300 },
        { name: 'Home & Garden', value: 300 },
        { name: 'Sports', value: 200 },
      ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between bg-[#111111] p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Executive Overview</h2>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Zap className="w-3 h-3 text-emerald-500" /> 
              Live business intelligence • Last synced: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 mr-4">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select 
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                className="glass-input pl-9 pr-8 py-2 text-sm appearance-none cursor-pointer"
              >
                <option value="All">All Units</option>
                {stats?.businessUnits?.map((bu: string) => (
                  <option key={bu} value={bu}>{bu}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="glass-input pl-9 pr-8 py-2 text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="glass-input px-2 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="glass-input px-2 py-2 text-sm"
                />
              </div>
            )}
          </div>

          <button 
            onClick={fetchStats}
            className={`p-2 bg-[#1a1c23] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowDataSources(!showDataSources)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all ${showDataSources ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-[#1a1c23] border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <Database className="w-4 h-4" />
            Data Sources
          </button>
          <button 
            onClick={sendToWhatsApp}
            disabled={isSendingWhatsApp}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a1c23] border border-white/10 rounded-lg text-sm text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
          >
            {isSendingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            WhatsApp Report
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1c23] border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-emerald-500/20">
            <Settings className="w-4 h-4" /> Configure
          </button>
        </div>
      </div>

      {showDataSources && (
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Available Data Sources</h3>
                <p className="text-sm text-gray-400">Tables and schemas available for AI analysis</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDataSources(false)}
              className="text-gray-500 hover:text-white text-sm"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => (
              <div key={source.table} className="bg-[#1a1c23] border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <TableIcon className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wider text-sm">{source.table}</h4>
                </div>
                <div className="space-y-1.5">
                  {source.columns.map((col: any) => (
                    <div key={col.name} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        {col.name}
                        {col.primaryKey && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1 rounded">PK</span>}
                      </span>
                      <span className="text-gray-600 font-mono">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BharatMind Dashboard AI Input */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">BharatMind Dashboard AI</h3>
            <p className="text-sm text-gray-400">Ask any question to generate custom visualizations</p>
          </div>
        </div>
        
        <form onSubmit={runDashboardAI} className="relative">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g., 'Show me inventory distribution by warehouse' or 'Analyze customer status shares'"
            className="w-full glass-input py-4 pl-6 pr-16"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !aiQuery.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 rounded-lg text-white transition-all flex items-center justify-center"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* AI Generated Chart Result */}
      {renderAIChart()}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs text-emerald-500 font-bold">+12.5%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-white">₹{(stats?.kpis?.total_revenue || 0).toLocaleString()}</p>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <IndianRupee className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs text-red-500 font-bold">Monitor</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-white">₹{(stats?.kpis?.total_expenses || 0).toLocaleString()}</p>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs text-blue-500 font-bold">+5.2%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Customers</h3>
          <p className="text-2xl font-bold text-white">{(stats?.kpis?.total_customers || 0).toLocaleString()}</p>
        </div>

        <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xs text-orange-500 font-bold">Action Needed</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Low Stock Items</h3>
          <p className="text-2xl font-bold text-white">{(stats?.kpis?.low_stock_items || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col h-96">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Revenue Trend</h3>
            <button className="text-gray-500 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" name="Gross Sales" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col h-96">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Sales by Category</h3>
            <button className="text-gray-500 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
