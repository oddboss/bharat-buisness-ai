import React, { useState } from 'react';
import { Upload, RefreshCw, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CEOBriefPanel, 
  BusinessHealthScore, 
  RevenueChart, 
  CashFlowStatus, 
  AIInsightsFeed, 
  SimulationLab, 
  CompetitorDashboard, 
  AlertPanel, 
  RecommendationPanel,
  AIDecisionEngine,
  CompanyDataBrain
} from './pbs/components';

export function PersonalBusinessSpace() {
  const [hasData, setHasData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Loading states for lazy loading
  const [loadingStates, setLoadingStates] = useState({
    brief: true,
    health: true,
    revenue: true,
    insights: true,
    alerts: true,
    recommendations: true,
    competitors: true,
    simulation: true,
    actions: true,
    dataBrain: true
  });

  const [businessData, setBusinessData] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.pdf')) {
      setUploadError("Unable to process file. Please check format. Only CSV, XLSX, or PDF are supported.");
      return;
    }
    
    // Validate file size (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploadError('');
    setIsUploading(true);
    
    // Simulate backend processing
    setTimeout(() => {
      setIsUploading(false);
      setHasData(true);
      
      // Mock structured JSON from backend
      setBusinessData({
        revenue: 120000,
        expenses: 88000,
        profit: 32000,
        healthScore: 84,
        alerts: [
          { title: 'Mobile accessories stock low', message: '2 days left based on sales velocity.', severity: 'High' },
          { title: 'GST Filing Due', message: 'GSTR-1 filing deadline in 4 days.', severity: 'Medium' },
          { title: 'Outstanding Receivable', message: '₹45k pending from Customer A (>30 days).', severity: 'Medium' },
        ],
        recommendations: [
          { title: 'Reorder mobile accessories', impact: '+15% Revenue', confidence: 'High', action: 'Restock Now' },
          { title: 'Increase stock before weekend', impact: '+10% Sales', confidence: 'Medium', action: 'Update Inventory' },
          { title: 'Follow up on receivables', impact: '₹45k Cash Inflow', confidence: 'High', action: 'Send Reminder' },
        ],
        insights: [
          { text: '60% revenue from Electronics category', source: 'Sales Data', confidence: 'High' },
          { text: 'Sales peaked on weekends (Sat-Sun)', source: 'Tally Export', confidence: 'High' },
          { text: 'Transport costs increased 8% this month', source: 'Expense Data', confidence: 'Medium' },
          { text: 'Expected demand increase next week (+15%)', source: 'Market Trends', confidence: 'Medium' },
        ],
        actions: [
          'Reorder 100 units of mobile accessories',
          'Increase stock before weekend',
          'Follow up on Customer A outstanding'
        ]
      });

      // Simulate lazy loading of components
      setTimeout(() => setLoadingStates(prev => ({ ...prev, brief: false })), 500);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, health: false, revenue: false })), 1000);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, insights: false, simulation: false })), 1500);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, alerts: false, recommendations: false, competitors: false, actions: false, dataBrain: false })), 2000);
      
    }, 2000);
  };

  if (!hasData) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] flex flex-col items-center justify-center min-h-full relative">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BrainCircuit className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">BharatMind AI</h1>
          <p className="text-gray-400 text-sm">
            Upload your company data (Tally exports, Excel sheets, invoices, reports) to generate your personalized AI business command center.
          </p>
          
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
              {uploadError}
            </div>
          )}
          
          <label className="relative cursor-pointer bg-[#111111] hover:bg-[#1a1a1a] text-white px-6 py-8 rounded-2xl font-medium transition-colors flex flex-col items-center justify-center gap-4 w-full border border-white/10 hover:border-emerald-500/50 group">
            {isUploading ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-emerald-500">BharatMind AI is analyzing your data...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span>Upload Business Data / Tally Export</span>
                <span className="text-xs text-gray-500 font-normal">Supports .xlsx, .csv, .pdf (Max 10MB)</span>
              </>
            )}
            <input type="file" className="hidden" accept=".csv,.xlsx,.xls,.pdf" onChange={handleFileUpload} disabled={isUploading} />
          </label>

          <button 
            onClick={() => {
              const mockEvent = { target: { files: [new File([], "demo.csv", { type: "text/csv" })] } } as any;
              handleFileUpload(mockEvent);
            }}
            className="text-xs text-gray-500 hover:text-emerald-500 transition-colors font-medium uppercase tracking-widest"
          >
            Try with Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] text-gray-200 p-6 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-emerald-500" />
              BharatMind AI
            </h1>
            <p className="text-sm text-gray-400 mt-1">AI-Powered ERP Decision Engine</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#111111] px-3 py-1.5 rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-500">AI Active</span>
            </div>
          </div>
        </div>

        {/* Top Section: CEO Daily Brief */}
        <CEOBriefPanel data={businessData} isLoading={loadingStates.brief} />

        {/* Second Section: Business Health + Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <BusinessHealthScore score={businessData?.healthScore} isLoading={loadingStates.health} />
          </div>
          <div className="md:col-span-1">
            <RevenueChart isLoading={loadingStates.revenue} />
          </div>
          <div className="md:col-span-1">
            <CashFlowStatus isLoading={loadingStates.revenue} />
          </div>
        </div>

        {/* Third Section: AI Insights Feed and Simulation Lab */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AIInsightsFeed insights={businessData?.insights} isLoading={loadingStates.insights} />
          </div>
          <div className="lg:col-span-2">
            <SimulationLab isLoading={loadingStates.simulation} />
          </div>
        </div>

        {/* Fourth Section: Competitor War Room + Alerts + Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CompetitorDashboard isLoading={loadingStates.competitors} />
          <AlertPanel alerts={businessData?.alerts} isLoading={loadingStates.alerts} />
          <RecommendationPanel recommendations={businessData?.recommendations} isLoading={loadingStates.recommendations} />
        </div>

        {/* Fifth Section: AI Decision Engine + Company Data Brain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AIDecisionEngine actions={businessData?.actions} isLoading={loadingStates.actions} />
          <CompanyDataBrain isLoading={loadingStates.dataBrain} />
        </div>

      </div>
    </div>
  );
}
