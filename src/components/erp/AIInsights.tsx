import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Zap, ShieldCheck, Send, Loader2, BarChart, PieChart, LineChart, Table, Volume2, Upload, FileSpreadsheet, Database, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as ReBarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';

import { MASTER_PROMPT } from '@/services/geminiService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

import { BusinessDashboard } from './BusinessDashboard';

interface AnalysisResult {
  sql?: string;
  insight?: string;
  report?: string;
  chart_type?: 'bar' | 'line' | 'pie' | 'table';
  x_axis?: string;
  y_axis?: string;
  metrics?: any;
  charts?: any[];
  tables?: any[];
  insights?: string[];
  problems?: string[];
  actions?: string[];
}

export function AIInsights() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadDomain, setUploadDomain] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const result = await res.json();
      setUploadSuccess(true);
      setUploadDomain(Object.keys(result.summary).filter(k => result.summary[k] > 0).join(', '));
      
      // Auto-trigger analysis for the uploaded data
      runAIAnalysis("Please analyze this newly uploaded data and provide a business growth report.", result.dataContext);
      
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload data. Please check the file format.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const runAIAnalysis = async (userQuery: string, dataContext?: any) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      let context = "";
      if (dataContext) {
        context = `Uploaded Data Context: ${JSON.stringify(dataContext)}`;
      } else {
        // Fetch context data for the AI if no direct dataContext provided
        const [invRes, custRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/customers')
        ]);
        
        const inventory = await invRes.json();
        const customers = await custRes.json();
        context = `Dataset Context (Sample):\nInventory: ${JSON.stringify(inventory.slice(0, 10))}\nCustomers: ${JSON.stringify(customers.slice(0, 10))}`;
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `User Question: ${userQuery}\n\n${context}`,
        config: {
          systemInstruction: MASTER_PROMPT,
          // If we have a dataContext, we want the full structured response
          // Otherwise, we might want the SQL-focused response (keeping it flexible)
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from AI');
      
      const parsed = JSON.parse(text);
      setResult(parsed);
      
      // If the AI returned SQL, execute it to get real data
      if (parsed.sql) {
        const queryRes = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql: parsed.sql, userQuery: userQuery })
        });

        if (queryRes.ok) {
          const queryData = await queryRes.json();
          setData(queryData.data || []);
          if (queryData.fixedSQL) {
            setResult(prev => prev ? { ...prev, sql: queryData.fixedSQL } : prev);
          }
        }
      }

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Analysis failed. Please try a different question or check your data.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      runAIAnalysis(query);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Analysis Trigger */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-32 h-32 text-emerald-500" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <Zap className="w-8 h-8 text-emerald-400" />
              SQL Copilot AI
            </h2>
            <p className="text-gray-400 mb-8 text-lg max-w-2xl">
              Users don't type queries anymore. They just speak to their business.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <form onSubmit={handleSubmit} className="flex-1 flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Show me top 5 products by revenue this month"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all pr-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isAnalyzing || !query.trim()}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl",
                    isAnalyzing || !query.trim()
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-105 active:scale-95"
                  )}
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Analyze
                </button>
              </form>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Top selling products",
                "Inventory value by category",
                "Customer spending trends",
                "Low stock alerts",
                "Sales by warehouse"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    runAIAnalysis(suggestion);
                  }}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-gray-400 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Ingestion Card */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database className="w-24 h-24 text-emerald-500" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            Live Data Engine
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Upload CSV/Excel to update your database in real-time.
          </p>

          <div className="space-y-4">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "w-full py-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2",
                isUploading 
                  ? "border-emerald-500/50 bg-emerald-500/5 cursor-not-allowed" 
                  : "border-white/10 hover:border-emerald-500/50 hover:bg-white/5"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-sm text-emerald-400 font-medium">Ingesting Data...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-sm text-emerald-400 font-medium">
                    {uploadDomain ? `${uploadDomain.toUpperCase()} Updated 🚀` : 'Data Uploaded!'}
                  </span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-8 h-8 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm text-gray-400">Click to upload CSV/Excel</span>
                </>
              )}
            </button>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                <span>System Status</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                SQL Copilot will automatically use new data for insights.
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-white">Analysis Error</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/5"></div>
          ))}
        </div>
      )}

      <div ref={scrollRef}>
        {result && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 1. Structured Growth Dashboard (If available) */}
            {result.metrics && (
              <div className="flex flex-col items-center">
                <BusinessDashboard data={result as any} />
              </div>
            )}

            {/* 2. Legacy SQL Insight (If available) */}
            {result.sql && data.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Business Insight */}
                  <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 p-8 rounded-3xl shadow-2xl shadow-emerald-500/5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-500/20 rounded-2xl">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">💡 Insight</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 text-lg leading-relaxed italic">
                        "{result.insight}"
                      </p>
                    </div>
                  </div>

                  {/* SQL Transparency */}
                  <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl relative group">
                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                      <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <BrainCircuit className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">🧠 Generated SQL</h3>
                    </div>
                    <div className="bg-black/60 rounded-2xl p-6 border border-white/5 font-mono relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                      <code className="text-sm text-emerald-400/90 break-all whitespace-pre-wrap">
                        {result.sql}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Brain Report */}
            {result.report && (
              <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Zap className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">BharatMind AI Brain Report</h3>
                    <p className="text-emerald-500/60 font-medium tracking-widest uppercase text-xs mt-1">Strategic Growth Analysis</p>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none prose-headings:text-emerald-400 prose-strong:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4">
                  <ReactMarkdown>{result.report}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Visualization */}
            <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white capitalize">{query}</h3>
                  <p className="text-sm text-gray-500 mt-1">Real-time data visualization from database</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  {result.chart_type === 'bar' && <BarChart className="w-6 h-6 text-emerald-500" />}
                  {result.chart_type === 'line' && <LineChart className="w-6 h-6 text-blue-500" />}
                  {result.chart_type === 'pie' && <PieChart className="w-6 h-6 text-orange-500" />}
                  {result.chart_type === 'table' && <Table className="w-6 h-6 text-gray-400" />}
                </div>
              </div>
              
              <div className="h-96 w-full">
                {result.chart_type === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey={result.x_axis} stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '12px' }}
                      />
                      <Bar dataKey={result.y_axis} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                )}

                {result.chart_type === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey={result.x_axis} stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '12px' }}
                      />
                      <Line type="monotone" dataKey={result.y_axis} stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                    </ReLineChart>
                  </ResponsiveContainer>
                )}

                {result.chart_type === 'pie' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey={result.y_axis}
                        nameKey={result.x_axis}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '12px' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                )}

                {result.chart_type === 'table' && (
                  <div className="overflow-auto max-h-full rounded-xl border border-white/5">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-gray-400 sticky top-0">
                        <tr>
                          {Object.keys(data[0]).map(key => (
                            <th key={key} className="px-4 py-3 font-medium capitalize">{key.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {data.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-3">{typeof val === 'number' ? val.toLocaleString() : String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
