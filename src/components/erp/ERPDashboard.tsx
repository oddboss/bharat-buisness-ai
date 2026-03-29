import React, { useState } from 'react';
import { LayoutDashboard, FileText, BarChart2, MessageCircle, Users, Package, ShoppingCart, BrainCircuit, UploadCloud, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountingLedger } from './AccountingLedger';
import { BIDashboard } from './BIDashboard';
import { WhatsAppAutomation } from './WhatsAppAutomation';
import { DemandForecasting } from './DemandForecasting';
import { DataUpload } from './DataUpload';
import { InventoryManagement } from './InventoryManagement';
import { CRMSystem } from './CRMSystem';
import { EmployeeManagement } from './EmployeeManagement';
import { AIInsights } from './AIInsights';

export function ERPDashboard() {
  const [activeTab, setActiveTab] = useState('bi-dashboard');

  const tabs = [
    { id: 'bi-dashboard', label: 'BI Dashboard', icon: BarChart2 },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'ingestion', label: 'Data Ingestion', icon: UploadCloud },
    { id: 'forecast', label: 'Demand Forecast', icon: BrainCircuit },
    { id: 'accounting', label: 'Accounting', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'CRM', icon: ShoppingCart },
    { id: 'hr', label: 'Employees', icon: Users },
    { id: 'whatsapp', label: 'Automations', icon: MessageCircle },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-gray-200">
      {/* Top Navigation for ERP */}
      <div className="flex-shrink-0 border-b border-white/10 bg-[#111111] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ERP & BI System</h1>
            <p className="text-xs text-gray-400">Integrated Business Management Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'bi-dashboard' && <BIDashboard />}
        {activeTab === 'ai-insights' && <AIInsights />}
        {activeTab === 'ingestion' && <DataUpload />}
        {activeTab === 'forecast' && <DemandForecasting />}
        {activeTab === 'accounting' && <AccountingLedger />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'sales' && <CRMSystem />}
        {activeTab === 'hr' && <EmployeeManagement />}
        {activeTab === 'whatsapp' && <WhatsAppAutomation />}
      </div>
    </div>
  );
}
