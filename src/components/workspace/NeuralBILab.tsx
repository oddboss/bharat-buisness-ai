import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  PieChart, 
  Layout, 
  ArrowRight, 
  Loader2, 
  Plus, 
  History,
  Trash2,
  Download,
  Share2,
  ChevronRight,
  Database,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { useFirebase } from '../../contexts/FirebaseContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';
import { cn } from '../../lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DashboardData {
  id?: string;
  prompt: string;
  sql: string;
  kpis: { title: string; value: string; change: string }[];
  charts: {
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    xAxis: string;
    yAxis: string;
    data: any[];
  }[];
  table: any[];
  insights: string[];
  recommendations: string[];
  createdAt: any;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Neural BI Lab Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[40px] text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            {this.state.error?.message || "An unexpected error occurred in the BI Lab."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reload Lab</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function NeuralBILab() {
  const { db, user, organizationId } = useFirebase();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [dashboards, setDashboards] = useState<DashboardData[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState<number | null>(null);

  useEffect(() => {
    if (!db || !organizationId) return;

    const q = query(
      collection(db, 'organizations', organizationId, 'neural_dashboards'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DashboardData[];
      setDashboards(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'neural_dashboards');
    });

    return () => unsubscribe();
  }, [db, organizationId]);

  const generateDashboard = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationStep('Analyzing Schema...');
    setError(null);

    try {
      // 1. Get Schema from Backend (Start fetching immediately)
      const schemaPromise = fetch('/api/neural-bi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt, orgId: organizationId })
      });
      
      const schemaRes = await schemaPromise;
      
      if (!schemaRes.ok) {
        const errData = await schemaRes.json();
        throw new Error(errData.error || "Failed to fetch database schema");
      }

      const { schema } = await schemaRes.json();

      if (!schema) {
        throw new Error("No data available. Please upload business data.");
      }

      setGenerationStep('AI Engine Processing...');

      // 2. Use Gemini to generate SQL and Structure
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key is not configured. Please check your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are BharatMind Neural BI Lab. 
        Current Date: ${new Date().toLocaleDateString()}
        Generate a business dashboard/financial report for: "${targetPrompt}".
        
        Schema:
        ${schema}
        
        Rules:
        - Generate optimized SQLite SQL.
        - Use ₹ and Indian formatting.
        - For "Financial Report", join sales and expenses to calculate Gross/Net Profit and OpEx.
        - Return strictly JSON.
        - SQL must handle NULLs with COALESCE.
        
        Output Format:
        {
          "sql": "SELECT ...",
          "kpis": [{"title": "...", "value": "₹...", "change": "+...%"}],
          "charts": [{"type": "line|bar|pie|area", "title": "...", "xAxis": "...", "yAxis": "...", "data": []}],
          "table": [],
          "insights": ["...", "..."],
          "recommendations": ["...", "..."]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sql: { type: Type.STRING },
              kpis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    value: { type: Type.STRING },
                    change: { type: Type.STRING }
                  }
                }
              },
              charts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    xAxis: { type: Type.STRING },
                    yAxis: { type: Type.STRING },
                    data: { type: Type.ARRAY, items: { type: Type.OBJECT } }
                  }
                }
              },
              table: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sql", "kpis", "charts", "insights", "recommendations"]
          }
        }
      });

      const dashboardStructure = JSON.parse(response.text || '{}');
      
      if (!dashboardStructure.sql) {
        throw new Error("AI failed to generate a valid analysis structure.");
      }

      setGenerationStep('Executing Data Queries...');

      // 3. Execute SQL on Backend
      const executeRes = await fetch('/api/neural-bi/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: dashboardStructure.sql })
      });
      
      if (!executeRes.ok) {
        const errData = await executeRes.json();
        throw new Error(errData.error || "Failed to execute generated SQL");
      }

      const queryResults = await executeRes.json();

      if (queryResults.error) {
        throw new Error(queryResults.error);
      }

      const resultsArray = Array.isArray(queryResults) ? queryResults : [];

      // 4. Enrich Charts with real data if needed
      const finalDashboard: DashboardData = {
        ...dashboardStructure,
        table: resultsArray.slice(0, 50), // Show more in table
        createdAt: Timestamp.now(),
        prompt: targetPrompt
      };

      // If the query results are suitable for charts, update the first chart's data
      if (resultsArray.length > 0 && finalDashboard.charts?.length > 0) {
        finalDashboard.charts[0].data = resultsArray.slice(0, 15);
      }

      // 5. Save to Firestore
      if (db && organizationId) {
        await addDoc(collection(db, 'organizations', organizationId, 'neural_dashboards'), {
          ...finalDashboard,
          organizationId,
          userId: user?.uid
        });
      }

      setActiveDashboard(finalDashboard);
      setPrompt('');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!activeDashboard) return;
    
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BharatMind_Report_${activeDashboard.prompt.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Export error:', err);
    }
  };

  const deleteDashboard = async (id: string) => {
    if (!db || !organizationId) return;
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'neural_dashboards', id));
      if (activeDashboard?.id === id) setActiveDashboard(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `organizations/${organizationId}/neural_dashboards/${id}`);
    }
  };

  const updateChartConfig = (index: number, key: string, value: string) => {
    if (!activeDashboard) return;
    const newCharts = [...activeDashboard.charts];
    newCharts[index] = { ...newCharts[index], [key]: value };
    setActiveDashboard({ ...activeDashboard, charts: newCharts });
  };

  const renderChart = (chart: any) => {
    const chartData = (activeDashboard?.table && Array.isArray(activeDashboard.table) && activeDashboard.table.length > 0) 
      ? activeDashboard.table.slice(0, 20) 
      : (Array.isArray(chart.data) ? chart.data : []);

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey={chart.xAxis} stroke="#ffffff40" fontSize={10} />
              <YAxis stroke="#ffffff40" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey={chart.yAxis} stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey={chart.xAxis} stroke="#ffffff40" fontSize={10} />
              <YAxis stroke="#ffffff40" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey={chart.yAxis} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey={chart.xAxis} stroke="#ffffff40" fontSize={10} />
              <YAxis stroke="#ffffff40" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey={chart.yAxis} stroke="#10b981" fillOpacity={1} fill="url(#colorArea)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={chart.yAxis}
                nameKey={chart.xAxis}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Sparkles className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Neural BI Lab</h1>
            <p className="text-sm text-white/40">AI-Powered Business Intelligence Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Neural Engine Active</span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-emerald-500/10 transition-all duration-700" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-white">Describe your business question...</h2>
            <p className="text-sm text-white/40">Our AI will analyze your data and generate a custom dashboard in seconds.</p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateDashboard()}
                placeholder="e.g., Show top 5 products by profit this month"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/40 font-mono">ENTER</kbd>
              </div>
            </div>
            <button 
              onClick={() => generateDashboard()}
              disabled={isGenerating || !prompt.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Generate ⚡</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Financial Report",
              "Quarterly Profit & Loss",
              "Sales Analysis",
              "Marketing Dashboard",
              "Inventory Status"
            ].map((q, i) => (
              <button 
                key={i}
                onClick={() => generateDashboard(q)}
                className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-white/60">
              <History className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">History</span>
            </div>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">{dashboards.length}</span>
          </div>

          <div className="space-y-3">
            {dashboards.map((dash) => (
              <motion.div
                key={dash.id}
                onClick={() => setActiveDashboard(dash)}
                whileHover={{ x: 4 }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all group relative cursor-pointer",
                  activeDashboard?.id === dash.id 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-[#111111] border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "text-sm font-medium truncate pr-8",
                    activeDashboard?.id === dash.id ? "text-white" : "text-white/60"
                  )}>
                    {dash.prompt}
                  </span>
                  <span className="text-[10px] text-white/20">
                    {dash.createdAt?.toDate ? dash.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dash.id) deleteDashboard(dash.id);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/0 group-hover:text-white/20 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            {dashboards.length === 0 && !isGenerating && (
              <div className="text-center py-12 px-6 border border-dashed border-white/5 rounded-3xl">
                <Database className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-xs text-white/20">No dashboards generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard View */}
        <div className="lg:col-span-3 space-y-8 relative min-h-[600px]">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[40px] space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">{generationStep || 'Neural Engine Analyzing...'}</h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">
                    Processing your data, generating SQL, and building your custom dashboard.
                  </p>
                </div>
              </motion.div>
            )}

            {activeDashboard ? (
              <motion.div
                key={activeDashboard.id || 'new'}
                id="dashboard-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 p-4"
              >
                {/* Dashboard Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white tracking-tight">{activeDashboard.prompt}</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={exportToPDF}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-xs">Export PDF</span>
                    </button>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeDashboard.kpis.map((kpi, i) => (
                    <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-4">{kpi.title}</p>
                        <div className="flex items-end justify-between">
                          <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-lg",
                            kpi.change.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {kpi.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeDashboard.charts.map((chart, i) => (
                    <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-6 relative group/chart">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-bold text-white/60">{chart.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">{chart.xAxis} vs {chart.yAxis}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setIsConfiguring(isConfiguring === i ? null : i)}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              isConfiguring === i ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-white/40 hover:text-white"
                            )}
                          >
                            <Layout className="w-4 h-4" />
                          </button>
                          <div className="p-2 bg-white/5 rounded-lg">
                            {chart.type === 'line' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            {chart.type === 'bar' && <BarChart3 className="w-4 h-4 text-blue-500" />}
                            {chart.type === 'pie' && <PieChart className="w-4 h-4 text-orange-500" />}
                            {chart.type === 'area' && <Layout className="w-4 h-4 text-purple-500" />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isConfiguring === i && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl grid grid-cols-3 gap-4 mb-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Type</label>
                                <select 
                                  value={chart.type}
                                  onChange={(e) => updateChartConfig(i, 'type', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50"
                                >
                                  <option value="line">Line</option>
                                  <option value="bar">Bar</option>
                                  <option value="pie">Pie</option>
                                  <option value="area">Area</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">X-Axis</label>
                                <select 
                                  value={chart.xAxis}
                                  onChange={(e) => updateChartConfig(i, 'xAxis', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50"
                                >
                                  {activeDashboard.table?.length > 0 && Object.keys(activeDashboard.table[0] || {}).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Y-Axis</label>
                                <select 
                                  value={chart.yAxis}
                                  onChange={(e) => updateChartConfig(i, 'yAxis', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50"
                                >
                                  {activeDashboard.table?.length > 0 && Object.keys(activeDashboard.table[0] || {}).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="h-[300px] w-full">
                        {renderChart(chart)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="font-bold text-white">Neural Insights</h3>
                    </div>
                    <div className="space-y-4">
                      {activeDashboard.insights.map((insight, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-white/60 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111111] border border-white/5 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-white">Growth Recommendations</h3>
                    </div>
                    <div className="space-y-4">
                      {activeDashboard.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/20 transition-all">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-all" />
                          <p className="text-sm text-white/60 group-hover:text-white/80 transition-all">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white/60">Source Data Extract</h3>
                    <code className="text-[10px] text-white/20 font-mono bg-white/5 px-2 py-1 rounded">SQL: {activeDashboard.sql?.substring(0, 50)}...</code>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          {activeDashboard.table?.length > 0 && Object.keys(activeDashboard.table[0] || {}).map((key) => (
                            <th key={key} className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">{key.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeDashboard.table?.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.01] transition-all">
                            {Object.values(row || {}).map((value: any, j) => (
                              <td key={j} className="px-6 py-4 text-sm text-white/60">
                                {typeof value === 'number' && value > 1000 ? `₹${value.toLocaleString()}` : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-6 border border-dashed border-white/5 rounded-[40px]">
                <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
                  <Sparkles className="w-10 h-10 text-white/20" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-white">Ready to analyze your business?</h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Type a question above or choose a quick prompt to generate your first AI-powered business intelligence dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-white/5" />
                    ))}
                  </div>
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Used by 50+ Enterprises</span>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
