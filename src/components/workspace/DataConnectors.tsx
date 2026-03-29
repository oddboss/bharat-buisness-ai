import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  FileSpreadsheet, 
  Globe, 
  Settings2,
  ChevronRight,
  Loader2,
  X,
  Upload,
  Cloud,
  Zap,
  Activity,
  Shield,
  Cpu,
  Radar,
  Sparkles,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '../../contexts/FirebaseContext';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';
import { connectTally, TallyConfig } from '../../services/connectors/tallyService';
import { connectGoogleSheets, SheetsConfig } from '../../services/connectors/sheetsService';
import { connectCustomAPI, APIConfig } from '../../services/connectors/apiService';
import { cn } from '../../lib/utils';

interface Connector {
  id: string;
  organizationId: string;
  type: 'tally' | 'sheets' | 'excel' | 'zoho' | 'quickbooks' | 'api';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSynced: any;
  config: any;
  insights?: string[];
}

const connectorTypes = [
  { id: 'tally', name: 'Tally ERP', icon: Database, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'sheets', name: 'Google Sheets', icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'excel', name: 'Excel / CSV', icon: Upload, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'zoho', name: 'Zoho Books', icon: Cloud, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'quickbooks', name: 'QuickBooks', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'api', name: 'REST API', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export function DataConnectors() {
  const { db, organizationId } = useFirebase();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form states
  const [tallyConfig, setTallyConfig] = useState<TallyConfig>({ serverUrl: 'http://localhost:9000', companyName: '' });
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>({ spreadsheetId: '', sheetName: '', mapping: { revenue: 'A', expenses: 'B', date: 'C' } });
  const [apiConfig, setApiConfig] = useState<APIConfig>({ apiUrl: '', headers: {}, mapping: {} });

  useEffect(() => {
    if (!db || !organizationId) return;

    const connectorsRef = collection(db, 'organizations', organizationId, 'data_connectors');
    const q = query(connectorsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Connector[];
      setConnectors(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `organizations/${organizationId}/data_connectors`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, organizationId]);

  const handleSync = async (connector: Connector) => {
    if (!db || !organizationId) return;
    setSyncingId(connector.id);
    
    try {
      const connectorRef = doc(db, 'organizations', organizationId, 'data_connectors', connector.id);
      await updateDoc(connectorRef, { status: 'syncing' });
      
      // Call backend sync API
      const response = await fetch(`/api/connectors/sync?orgId=${organizationId}&connectorId=${connector.id}&type=${connector.type}`);
      const data = await response.json();
      
      if (data.success) {
        await updateDoc(connectorRef, { 
          status: 'connected',
          lastSynced: serverTimestamp(),
          insights: data.insights || []
        });
      } else {
        await updateDoc(connectorRef, { status: 'error' });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `organizations/${organizationId}/data_connectors/${connector.id}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    if (!db || !organizationId) return;
    // Using a custom modal would be better, but for now keeping it simple or just removing confirm
    if (!window.confirm('Are you sure you want to disconnect this data source?')) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'data_connectors', connectorId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `organizations/${organizationId}/data_connectors/${connectorId}`);
    }
  };

  const handleConnect = async () => {
    if (!organizationId || !selectedType) return;
    setIsConnecting(true);

    try {
      if (selectedType === 'tally') {
        await connectTally(organizationId, tallyConfig);
      } else if (selectedType === 'sheets') {
        await connectGoogleSheets(organizationId, sheetsConfig);
      } else if (selectedType === 'api') {
        await connectCustomAPI(organizationId, apiConfig);
      } else {
        // Mock for others
        const connectorsRef = collection(db, 'organizations', organizationId, 'data_connectors');
        await addDoc(connectorsRef, {
          organizationId,
          type: selectedType,
          name: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Connection`,
          status: 'connected',
          lastSynced: serverTimestamp(),
          config: {}
        });
      }
      setShowAddModal(false);
      setSelectedType(null);
      setTestResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedType) return;
    setIsTesting(true);
    setTestResult(null);

    let config = {};
    if (selectedType === 'tally') config = tallyConfig;
    if (selectedType === 'sheets') config = sheetsConfig;
    if (selectedType === 'api') config = apiConfig;

    try {
      const response = await fetch('/api/connectors/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, config })
      });

      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network error: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#050505]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-emerald-500/20 rounded-full animate-ping" />
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin absolute top-2 left-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <Radar className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Neural Link System Active</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Data <span className="text-emerald-500 font-medium italic">Bridges</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md font-medium">Establish secure, high-frequency data pipelines between your external business nodes and BharatMind Intelligence.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20 group active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Initialize Bridge</span>
        </button>
      </motion.div>

      {/* Active Bridges */}
      <div className="space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Active Intelligence Bridges</h2>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10 text-[10px] text-emerald-500 font-bold tracking-widest">
            <Activity className="w-3 h-3 animate-pulse" />
            LIVE SYNC ACTIVE
          </div>
        </div>

        {connectors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {connectors.map((connector, i) => {
              const typeInfo = connectorTypes.find(t => t.id === connector.type);
              const Icon = typeInfo?.icon || Link2;
              
              return (
                <motion.div 
                  key={connector.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 glass-card group relative overflow-hidden"
                >
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-all duration-700" />

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 bg-white/[0.03] group-hover:border-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500", typeInfo?.color)}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border backdrop-blur-md",
                      connector.status === 'connected' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      connector.status === 'syncing' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {connector.status === 'syncing' ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", connector.status === 'connected' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
                      )}
                      <span>{connector.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8 relative z-10">
                    <h3 className="text-2xl font-light tracking-tight text-white group-hover:text-emerald-400 transition-colors duration-500">{connector.name}</h3>
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Last pulse: {connector.lastSynced?.toDate?.() ? connector.lastSynced.toDate().toLocaleString() : 'Pending initialization'}
                    </p>
                  </div>

                  {connector.insights && connector.insights.length > 0 && (
                    <div className="mb-8 space-y-3 relative z-10">
                      {connector.insights.slice(0, 2).map((insight: string, idx: number) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-4 text-[11px] text-gray-400 bg-white/[0.01] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/insight"
                        >
                          <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 group-hover/insight:scale-125 transition-transform" />
                          <span className="leading-relaxed font-medium">{insight}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 relative z-10">
                    <button 
                      onClick={() => handleSync(connector)}
                      disabled={syncingId === connector.id}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5 group/sync"
                    >
                      <RefreshCw className={cn("w-4 h-4 group-hover/sync:rotate-180 transition-transform duration-500", syncingId === connector.id && "animate-spin")} />
                      <span>Sync Node</span>
                    </button>
                    <button 
                      onClick={() => handleDisconnect(connector.id)}
                      className="p-4 bg-red-500/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition-all border border-red-500/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-24 rounded-[4rem] bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center text-center group hover:border-emerald-500/20 transition-colors duration-700"
          >
            <div className="w-32 h-32 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/5 group-hover:scale-110 transition-transform duration-500">
              <Link2 className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="text-3xl font-light tracking-tight text-white mb-4">No Intelligence Bridges Found</h3>
            <p className="text-gray-500 text-base max-w-sm mb-12 leading-relaxed font-medium">
              BharatMind is currently isolated. Connect your business nodes to begin high-frequency intelligence processing.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-12 py-5 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl uppercase text-[11px] tracking-[0.3em] flex items-center gap-3"
            >
              <Plus className="w-4 h-4" />
              Initialize First Bridge
            </button>
          </motion.div>
        )}
      </div>

      {/* Available Integrations */}
      <div className="space-y-8 pt-16 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Available Neural Protocols</h2>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Cpu className="w-3 h-3" />
            6 Protocols Ready
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {connectorTypes.map((type, i) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setSelectedType(type.id);
                setShowAddModal(true);
              }}
              className="flex items-center gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-[2rem] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all group text-left relative overflow-hidden"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 bg-white/[0.03] group-hover:scale-110 transition-transform duration-500", type.color)}>
                <type.icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-300 group-hover:text-white transition-colors">{type.name}</h3>
                <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold mt-1">Protocol v2.4</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add Connector Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-3xl overflow-hidden shadow-2xl relative border-white/20"
            >
              {/* Modal Background Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01] relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Plus className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-light tracking-tight text-white">
                      {selectedType ? `Initialize ${connectorTypes.find(t => t.id === selectedType)?.name}` : 'Select Node Protocol'}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Bridge Configuration Interface</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedType(null);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-gray-500 hover:text-white transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-12 max-h-[70vh] overflow-y-auto scrollbar-hide relative z-10">
                {!selectedType ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                    {connectorTypes.map((type, i) => (
                      <motion.button
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedType(type.id)}
                        className="flex flex-col items-center gap-6 p-10 glass-card hover:border-emerald-500/30 hover:bg-emerald-500/[0.05] transition-all group"
                      >
                        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner bg-white/[0.03] group-hover:scale-110 transition-transform duration-500", type.color)}>
                          <type.icon className="w-10 h-10" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-emerald-400 transition-colors tracking-[0.3em] uppercase">{type.name}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-10">
                    {selectedType === 'tally' && (
                      <div className="space-y-8">
                        <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-[2rem] flex items-start gap-5">
                          <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
                          <div>
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] block mb-2">Protocol Requirement</span>
                            <p className="text-sm text-orange-400/80 leading-relaxed font-medium">
                              Ensure Tally ERP is running and the XML API is enabled (default port 9000). BharatMind requires a stable local tunnel or static IP for high-frequency sync.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] ml-2">Node Server URL</label>
                          <input 
                            type="text" 
                            value={tallyConfig.serverUrl}
                            onChange={(e) => setTallyConfig({...tallyConfig, serverUrl: e.target.value})}
                            placeholder="http://localhost:9000"
                            className="w-full glass-input px-8 py-5 text-base font-mono"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] ml-2">Entity Identifier</label>
                          <input 
                            type="text" 
                            value={tallyConfig.companyName}
                            onChange={(e) => setTallyConfig({...tallyConfig, companyName: e.target.value})}
                            placeholder="e.g. Bharat Enterprises"
                            className="w-full glass-input px-8 py-5 text-base font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {selectedType === 'sheets' && (
                      <div className="space-y-10">
                        <button className="w-full flex items-center justify-center gap-5 p-8 bg-white text-black font-black rounded-3xl hover:bg-zinc-200 transition-all shadow-2xl uppercase text-[11px] tracking-[0.3em] group">
                          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          AUTHORIZE GOOGLE PROTOCOL
                        </button>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] ml-2">Spreadsheet ID</label>
                          <input 
                            type="text" 
                            value={sheetsConfig.spreadsheetId}
                            onChange={(e) => setSheetsConfig({...sheetsConfig, spreadsheetId: e.target.value})}
                            placeholder="Paste ID from URL"
                            className="w-full glass-input px-8 py-5 text-base font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                          {['revenue', 'expenses', 'date'].map((field) => (
                            <div key={field} className="space-y-4">
                              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] text-center block">{field}</label>
                              <input 
                                type="text" 
                                value={(sheetsConfig.mapping as any)[field]}
                                onChange={(e) => setSheetsConfig({...sheetsConfig, mapping: {...sheetsConfig.mapping, [field]: e.target.value}})}
                                className="w-full glass-input px-4 py-5 text-base text-center font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedType === 'api' && (
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] ml-2">Neural Endpoint URL</label>
                          <input 
                            type="text" 
                            value={apiConfig.apiUrl}
                            onChange={(e) => setApiConfig({...apiConfig, apiUrl: e.target.value})}
                            placeholder="https://api.yourbusiness.com/v1/stats"
                            className="w-full glass-input px-8 py-5 text-base font-mono"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] ml-2">Access Key (Header)</label>
                          <input 
                            type="password" 
                            placeholder="X-API-KEY"
                            className="w-full glass-input px-8 py-5 text-base font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {(selectedType === 'excel' || selectedType === 'zoho' || selectedType === 'quickbooks') && (
                      <div className="py-24 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-32 h-32 bg-emerald-500/5 rounded-[3rem] flex items-center justify-center border border-emerald-500/10 shadow-inner group hover:scale-110 transition-transform duration-500">
                          <Upload className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-light tracking-tight text-white">Node Ready for Initialization</h3>
                          <p className="text-gray-500 text-base max-w-xs mt-4 leading-relaxed font-medium">
                            The {selectedType} protocol is verified. Proceed to establish the neural bridge.
                          </p>
                        </div>
                      </div>
                    )}

                    {testResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-8 rounded-[2rem] flex items-center gap-6 border backdrop-blur-md",
                          testResult.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                        )}
                      >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", testResult.success ? "bg-emerald-500/10" : "bg-red-500/10")}>
                          {testResult.success ? (
                            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-7 h-7 text-red-500" />
                          )}
                        </div>
                        <p className={cn("text-sm font-bold uppercase tracking-[0.1em]", testResult.success ? "text-emerald-400" : "text-red-400")}>
                          {testResult.message}
                        </p>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-10">
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <button 
                          onClick={() => {
                            setSelectedType(null);
                            setTestResult(null);
                          }}
                          className="flex-1 sm:flex-none px-10 py-5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white font-bold rounded-2xl transition-all border border-white/5 uppercase text-[11px] tracking-widest"
                        >
                          Abort
                        </button>
                        <button 
                          onClick={handleTestConnection}
                          disabled={isTesting || isConnecting}
                          className="flex-1 sm:flex-none px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-4 border border-white/5 uppercase text-[11px] tracking-widest group/verify"
                        >
                          {isTesting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-5 h-5 group-hover/verify:rotate-180 transition-transform duration-500" />
                          )}
                          <span>{isTesting ? 'Verifying...' : 'Verify Node'}</span>
                        </button>
                      </div>
                      <button 
                        onClick={handleConnect}
                        disabled={isConnecting || (testResult !== null && !testResult.success)}
                        className="w-full sm:flex-1 px-10 py-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all flex items-center justify-center gap-4 shadow-2xl uppercase text-[11px] tracking-[0.3em] group/confirm"
                      >
                        {isConnecting ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Sparkles className="w-6 h-6 group-hover/confirm:rotate-12 transition-transform" />
                        )}
                        <span>{isConnecting ? 'Establishing...' : 'Confirm Bridge'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

