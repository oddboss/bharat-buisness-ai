import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, HardDrive, Link2, Plus, CheckCircle2, AlertCircle, RefreshCw, Server, Cloud, FileText, X, LineChart, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { connectorManager, ExcelConnector, DataConnector, BaseConnector } from '@/services/connectorService';

function AddApiModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (name: string, description: string, url: string, auth: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [auth, setAuth] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    onAdd(name, description, url, auth);
    setName('');
    setDescription('');
    setUrl('');
    setAuth('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Connect New API</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">API Name *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Custom CRM API"
              className="w-full glass-input px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Customer data endpoint"
              className="w-full glass-input px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Endpoint URL *</label>
            <input 
              type="url" 
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/v1/data"
              className="w-full glass-input px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Authentication (Bearer Token / API Key)</label>
            <input 
              type="password" 
              value={auth}
              onChange={(e) => setAuth(e.target.value)}
              placeholder="Enter token or key..."
              className="w-full glass-input px-3 py-2 text-sm"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Add Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DataConnectors() {
  const [connectors, setConnectors] = useState<DataConnector[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'file' | 'database' | 'api'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  useEffect(() => {
    setConnectors(connectorManager.getConnectors());

    // Automatic sync every 10 minutes
    const syncInterval = setInterval(() => {
      const currentConnectors = connectorManager.getConnectors();
      currentConnectors.forEach(async (connector) => {
        if (connector.status === 'connected') {
          try {
            await connector.sync();
            setConnectors([...connectorManager.getConnectors()]);
          } catch (error) {
            console.error(`Auto-sync failed for ${connector.name}`, error);
          }
        }
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  const filteredConnectors = connectors.filter(c => activeTab === 'all' || c.type === activeTab);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newConnector = new ExcelConnector(Date.now().toString(), file.name, 'Manual File Upload');
      await newConnector.parseFile(file);
      connectorManager.addConnector(newConnector);
      setConnectors(connectorManager.getConnectors());
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to parse Excel file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddApi = (name: string, description: string, url: string, auth: string) => {
    const newConnector = new BaseConnector(Date.now().toString(), name, 'api', description, 'disconnected');
    // In a real app, we would store the URL and Auth details in the connector or backend
    connectorManager.addConnector(newConnector);
    setConnectors(connectorManager.getConnectors());
  };

  const handleConnect = async (id: string) => {
    const connector = connectorManager.getConnector(id);
    if (!connector) return;

    setSyncingId(id);
    try {
      await connector.connect();
      setConnectors([...connectorManager.getConnectors()]);
    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSync = async (id: string) => {
    const connector = connectorManager.getConnector(id);
    if (!connector) return;

    setSyncingId(id);
    try {
      const result = await connector.sync();
      console.log(`Synced ${result.recordsProcessed} records. Status: ${result.connectionStatus}`);
      setConnectors([...connectorManager.getConnectors()]);
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setSyncingId(null);
    }
  };

  const getIcon = (type: string, name: string) => {
    if (type === 'file') return name.endsWith('.csv') ? FileText : FileSpreadsheet;
    if (type === 'database') return Database;
    if (name.includes('Tally')) return Server;
    if (name.includes('Google Analytics')) return LineChart;
    if (name.includes('LinkedIn Ads')) return Megaphone;
    return Cloud;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Data Sources</h1>
            <p className="text-white/40 mt-1 font-medium">Connect your business data to Bharat AI Operating System.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm">
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
              <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} disabled={isUploading} />
            </label>
            <button 
              onClick={() => setIsApiModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Connection</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-6">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'api', label: 'Apps & APIs' },
            { id: 'database', label: 'Databases' },
            { id: 'file', label: 'Files' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-semibold transition-all tracking-tight",
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnectors.map(connector => {
            const Icon = getIcon(connector.type, connector.name);
            const isSyncing = syncingId === connector.id || connector.status === 'syncing';
            return (
            <div key={connector.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group flex flex-col shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  connector.status === 'connected' && !isSyncing ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  isSyncing ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  connector.status === 'error' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-white/5 text-white/40 border-white/10"
                )}>
                  {connector.status === 'connected' && !isSyncing && <CheckCircle2 className="w-3 h-3" />}
                  {isSyncing && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {connector.status === 'error' && <AlertCircle className="w-3 h-3" />}
                  {connector.status === 'disconnected' && !isSyncing && <Link2 className="w-3 h-3" />}
                  <span>{isSyncing ? 'syncing' : connector.status}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{connector.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">{connector.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  {connector.lastSync ? `Synced: ${connector.lastSync}` : 'Never synced'}
                </div>
                {connector.status === 'connected' ? (
                  <div className="flex items-center gap-4">
                    <button 
                      className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      Config
                    </button>
                    <button 
                      onClick={() => handleSync(connector.id)}
                      disabled={isSyncing}
                      className="text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    >
                      {isSyncing ? 'Syncing' : 'Sync'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnect(connector.id)}
                    disabled={isSyncing}
                    className="text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? 'Connecting' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          )})}

          {/* Add New Card */}
          <button 
            onClick={() => setIsApiModalOpen(true)}
            className="bg-transparent border-2 border-dashed border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group min-h-[240px]"
          >
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
              <Plus className="w-7 h-7 text-white/20 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-widest">Add Source</h3>
            <p className="text-xs text-white/20 mt-1 font-medium">DB, API, or File</p>
          </button>
        </div>
      </div>
      
      <AddApiModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
        onAdd={handleAddApi} 
      />
    </div>
  );
}
