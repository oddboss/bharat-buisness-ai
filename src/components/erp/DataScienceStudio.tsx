import React, { useState, useRef } from 'react';
import { 
  BrainCircuit, 
  Zap, 
  Loader2, 
  Send, 
  Database, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Table as TableIcon, 
  Activity, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Microscope,
  Code2,
  Terminal,
  Layers,
  Box,
  FileJson,
  FlaskConical,
  ClipboardList,
  ShieldAlert,
  Lightbulb,
  ArrowRightCircle,
  Cpu,
  History,
  Binary,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { analyzeData, fixSQL } from '@/services/geminiService';
import { ChartRenderer } from './ChartRenderer';
import { Maximize2, Minimize2, Settings2 } from 'lucide-react';

interface DSResult {
  status: string;
  mode: string;
  sql: string;
  python_code: string;
  data_processing: string;
  chartType?: string;
  chartConfig?: {
    type: string;
    xKey: string;
    yKey: string;
  };
  chartData?: Array<{x: any, y: any}>;
  charts: Array<{
    type: string;
    title: string;
    x: string;
    y: string;
  }>;
  insights: string;
  anomalies: string;
  report?: string;
  prediction: {
    model: string;
    output?: string;
    values?: Array<{x: any, y: any}>;
    confidence: string;
  };
  recommendations: string;
  data: any[];
  python?: any;
}

const DataScienceStudio: React.FC = () => {
  const [query, setQuery] = useState('Analyze revenue trends from uploaded data, detect anomalies, and predict next 5 days sales');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visuals' | 'sql' | 'python' | 'data'>('visuals');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fullScreen, setFullScreen] = useState(false);
  const [customChartType, setCustomChartType] = useState<string>('');
  const [customXKey, setCustomXKey] = useState<string>('');
  const [customYKey, setCustomYKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recharts Auto-Config
  const chartConfig = {
    line: {
      dataKey: "y",
      strokeWidth: 2
    },
    xAxis: {
      dataKey: "x"
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const runAnalysis = async () => {
    if (!query.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // 0. Fetch Schema Context
      let schemaContext = "";
      try {
        const schemaRes = await fetch('/api/ds-schema');
        if (schemaRes.ok) {
          const schemaData = await schemaRes.json();
          if (schemaData.exists) {
            schemaContext = schemaData.columns.map((c: any) => `${c.name} (${c.type})`).join(", ");
          }
        }
      } catch (e) {
        console.warn("Could not fetch schema context", e);
      }

      // 1. Call Gemini from Frontend
      const aiOutput = await analyzeData(query, schemaContext);
      console.log("🤖 AI Output:", aiOutput);

      // 2. Execute SQL/Python on Backend
      let executionRes = await fetch('/api/ds-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sql: aiOutput.sql,
          python_code: aiOutput.python_code
        })
      });

      // 3. Handle SQL Errors with Auto-Fix
      if (!executionRes.ok && aiOutput.sql) {
        const errData = await executionRes.json();
        console.log("🔧 SQL failed, attempting auto-fix:", errData.error);
        
        const fixedQuery = await fixSQL(aiOutput.sql, errData.error, query, schemaContext);
        console.log("✅ Fixed SQL:", fixedQuery);
        aiOutput.sql = fixedQuery;

        executionRes = await fetch('/api/ds-execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sql: fixedQuery,
            python_code: aiOutput.python_code
          })
        });
      }

      if (!executionRes.ok) {
        const text = await executionRes.text();
        throw new Error(`Execution failed: ${text.slice(0, 100)}`);
      }

      const executionData = await executionRes.json();
      console.log("📊 Execution Result:", executionData);

      // 4. Merge results
      const finalResult = {
        ...aiOutput,
        data: executionData.data || [],
        python: executionData.python
      };

      // Auto-map SQL results to chartData if chartData is missing or empty
      if (finalResult.data.length > 0 && (!finalResult.chartData || finalResult.chartData.length === 0)) {
        finalResult.chartData = finalResult.data.map((row: any) => ({
          x: Object.values(row)[0],
          y: Object.values(row)[1]
        }));
      }

      setResult(finalResult);
      setCustomChartType(finalResult.chartConfig?.type || finalResult.chartType || 'line');
      setCustomXKey(finalResult.chartConfig?.xKey || 'x');
      setCustomYKey(finalResult.chartConfig?.yKey || 'y');
    } catch (err: any) {
      console.error('DS Analysis Error:', err);
      setError(err.message || 'Something went wrong during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Microscope className="w-10 h-10 text-emerald-500" />
            BharatMind <span className="text-emerald-500/50">Data Science Studio</span>
          </h1>
          <p className="text-gray-500 mt-2">Advanced EDA, Statistical Modeling, and Predictive Insights</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.xlsx,.xls"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border",
              uploadStatus === 'success' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" :
              uploadStatus === 'error' ? "bg-red-500/10 border-red-500/50 text-red-500" :
              "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            {uploadStatus === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             uploadStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
             <UploadCloud className="w-4 h-4" />}
            {uploadStatus === 'uploading' ? 'Uploading...' : 
             uploadStatus === 'success' ? 'Data Ingested' :
             uploadStatus === 'error' ? 'Upload Failed' : 'Upload Dataset'}
          </button>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-mono text-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI ENGINE ACTIVE
          </div>
        </div>
      </div>

      {/* Notebook Input */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="mt-4">
              <Terminal className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your analysis (e.g., 'Analyze sales trends and predict next month's revenue using a regression model')"
                className="w-full bg-transparent border-none text-xl text-white placeholder-gray-700 focus:ring-0 resize-none min-h-[120px]"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" /> SQL ENGINE</span>
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> EDA MODE</span>
                  <span className="flex items-center gap-1"><Box className="w-3 h-3" /> ML PREDICT</span>
                </div>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !query.trim()}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                    isAnalyzing || !query.trim()
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  )}
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  Run Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Insights & EDA */}
          <div className="lg:col-span-1 space-y-6">
            {/* Insights Card */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                AI Insights
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed italic">
                "{result.insights}"
              </p>
              <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Anomalies Detected</h4>
                <p className="text-xs text-gray-400">{result.anomalies}</p>
              </div>
            </div>

            {/* Model Prediction */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                AI Prediction
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Model Used</span>
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-400">
                    {result.prediction.model}
                  </span>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Forecasted Values</h4>
                  {result.prediction.values && result.prediction.values.length > 0 ? (
                    <div className="space-y-2">
                      {result.prediction.values.slice(0, 5).map((val, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">{val.x}</span>
                          <span className="text-white font-mono">{typeof val.y === 'number' ? val.y.toLocaleString() : val.y}</span>
                        </div>
                      ))}
                      {result.prediction.values.length > 5 && (
                        <div className="text-[10px] text-gray-600 text-center pt-1 italic">
                          + {result.prediction.values.length - 5} more values
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300">{result.prediction.output || 'No specific values predicted.'}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Confidence</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    result.prediction.confidence === 'High' ? "bg-emerald-500/10 text-emerald-500" :
                    result.prediction.confidence === 'Medium' ? "bg-blue-500/10 text-blue-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {result.prediction.confidence}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Recommendations
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {result.recommendations}
              </p>
            </div>
          </div>

          {/* Right Column: Visuals & Data */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl w-fit overflow-x-auto max-w-full">
              {[
                { id: 'visuals', label: 'Visuals', icon: BarChart3 },
                { id: 'data', label: 'Data Preview', icon: TableIcon },
                { id: 'python', label: 'Python', icon: Terminal },
                { id: 'sql', label: 'SQL', icon: Code2 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-emerald-600 text-white shadow-lg" 
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className={cn(
              "bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 min-h-[500px]",
              fullScreen && "fullscreen"
            )}>
              {fullScreen && (
                <button 
                  onClick={() => setFullScreen(false)}
                  className="fixed top-8 right-8 z-[10000] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                >
                  <Minimize2 className="w-6 h-6" />
                </button>
              )}

              {activeTab === 'visuals' && (
                <div className="space-y-8">
                  {/* Chart Customizer */}
                  <div className="flex flex-wrap items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Chart Engine</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] text-gray-600 uppercase">Type</label>
                      <select 
                        value={customChartType}
                        onChange={(e) => setCustomChartType(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {["line", "bar", "pie", "scatter", "area", "radar", "heatmap", "treemap", "funnel", "gauge", "candlestick", "boxplot", "parallel", "sankey", "graph", "sunburst"].map(t => (
                          <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-[10px] text-gray-600 uppercase">X-Axis</label>
                      <select 
                        value={customXKey}
                        onChange={(e) => setCustomXKey(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {result.data.length > 0 && Object.keys(result.data[0]).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                        <option value="x">Default (x)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-[10px] text-gray-600 uppercase">Y-Axis</label>
                      <select 
                        value={customYKey}
                        onChange={(e) => setCustomYKey(e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {result.data.length > 0 && Object.keys(result.data[0]).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                        <option value="y">Default (y)</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => setFullScreen(true)}
                      className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="h-[500px] w-full bg-black/40 border border-white/5 p-8 rounded-3xl relative">
                    <ChartRenderer 
                      type={customChartType}
                      data={result.data.length > 0 ? result.data : (result.chartData || [])}
                      config={{
                        xKey: customXKey,
                        yKey: customYKey,
                        title: query
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-sm font-bold text-emerald-500 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Data Processing Steps
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{result.data_processing}</p>
                  </div>
                  
                  {/* Data Preview Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-gray-500 uppercase tracking-widest">
                        <tr>
                          {result.data.length > 0 && Object.keys(result.data[0]).map(k => (
                            <th key={k} className="px-4 py-3 font-bold">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {result.data.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            {Object.values(row).map((v: any, j) => (
                              <td key={j} className="px-4 py-3 text-gray-300">{String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'python' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="text-xl font-bold">Python Execution Engine</h3>
                        <p className="text-sm text-gray-500">Isolated code execution for complex statistical tasks</p>
                      </div>
                    </div>
                    {result.python && (
                      <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500 uppercase">
                        Execution Success
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Generated Code</h4>
                      <pre className="p-6 bg-black rounded-2xl border border-white/10 text-blue-400 font-mono text-xs overflow-x-auto">
                        {result.python_code}
                      </pre>
                    </div>

                    {result.python && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Execution Output</h4>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(result.python.result || {}).map(([k, v]: [string, any]) => (
                              <div key={k} className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-[10px] text-gray-500 uppercase block mb-1">{k.replace(/_/g, ' ')}</span>
                                <span className="text-sm font-mono text-white">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-500">
                            <Activity className="w-3 h-3" />
                            {result.python.message}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'sql' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-500" />
                      Generated SQL
                    </h3>
                    <button className="text-xs text-emerald-500 hover:underline">Copy Query</button>
                  </div>
                  <pre className="p-6 bg-black rounded-2xl border border-white/10 text-emerald-500 font-mono text-sm overflow-x-auto">
                    {result.sql}
                  </pre>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Query executed successfully against the production database.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Layers className="w-12 h-12 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-400">Ready for Deep Analysis</h2>
          <p className="text-gray-600 max-w-md mt-2">
            Enter a query above to start exploratory data analysis, build statistical models, and uncover hidden patterns.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataScienceStudio;
