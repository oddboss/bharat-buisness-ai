import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Plus, Play, Settings, Trash2, Zap,
  Database, MessageSquare, Save, X,
  ChevronRight, Loader2, Sparkles, Send,
  User, Shield, Cpu, Terminal, Radio,
  Layers, Activity, Globe, Lock, Code
} from 'lucide-react';
import axios from 'axios';
import { runAgent } from '../../services/geminiService';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  instructions: string;
  status: 'active' | 'idle';
  capabilities: string[];
  dataAccess?: string[];
}

const PREBUILT_AGENTS: Agent[] = [
  {
    id: 'pb-1',
    name: 'Inventory Optimizer',
    role: 'Supply Chain Specialist',
    instructions: 'You are an expert in inventory management for Indian retail. Focus on minimizing stockouts and optimizing reorder levels.',
    status: 'active',
    capabilities: ['Stock Analysis', 'Reorder Prediction', 'Supplier Evaluation'],
    dataAccess: ['Inventory', 'Tally ERP']
  },
  {
    id: 'pb-2',
    name: 'Financial Auditor',
    role: 'Tax & Compliance Expert',
    instructions: 'You analyze business financials with a focus on GST compliance and cash flow health.',
    status: 'active',
    capabilities: ['GST Analysis', 'Cash Flow Forecasting', 'Expense Audit'],
    dataAccess: ['Financials', 'GST Portal', 'Tally ERP']
  },
  {
    id: 'pb-3',
    name: 'Growth Strategist',
    role: 'Marketing & Sales AI',
    instructions: 'You identify growth opportunities by analyzing customer behavior and market trends.',
    status: 'active',
    capabilities: ['Customer Segmentation', 'Campaign ROI', 'Market Trends'],
    dataAccess: ['CRM', 'Live Web']
  }
];

export const AgentBuilder: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    role: '',
    instructions: '',
    dataAccess: ['Financials', 'Inventory']
  });
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [runInput, setRunInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      const customAgents = res.data.map((a: any) => ({
        ...a,
        capabilities: a.capabilities || ['General Analysis', 'Data Access']
      }));
      setAgents([...PREBUILT_AGENTS, ...customAgents]);
    } catch (err) {
      console.error('Failed to fetch agents', err);
      setAgents(PREBUILT_AGENTS);
    }
  };

  const handleCreateAgent = async () => {
    try {
      if (!newAgent.name || !newAgent.role) return;
      await axios.post('/api/agents/create', { agent: newAgent });
      setIsCreating(false);
      fetchAgents();
      setNewAgent({ name: '', role: '', instructions: '', dataAccess: ['Financials', 'Inventory'] });
    } catch (err) {
      console.error('Failed to create agent', err);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (id.startsWith('pb-')) return;
    try {
      await axios.delete(`/api/agents/${id}`);
      setSelectedAgent(null);
      fetchAgents();
    } catch (err) {
      console.error('Failed to delete agent', err);
    }
  };

  const handleRunAgent = async (overrideInput?: string) => {
    const inputToUse = overrideInput || runInput;
    if (!selectedAgent || !inputToUse.trim()) return;
    
    const userMsg: Message = {
      role: 'user',
      content: inputToUse,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    if (!overrideInput) setRunInput('');
    setIsRunning(true);

    try {
      const res = await axios.post('/api/agents/run', { 
        agentId: selectedAgent.id, 
        input: inputToUse 
      });
      const { context, agent } = res.data;
      const output = await runAgent(agent, inputToUse, context);
      
      const agentMsg: Message = {
        role: 'agent',
        content: output,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Failed to run agent', err);
      setChatHistory(prev => [...prev, {
        role: 'agent',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] orb-animation" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] orb-animation" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center border border-blue-500/20 transition-all duration-500 group-hover:border-blue-500/40 group-hover:bg-blue-500/20">
              <Cpu className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500/30 rounded-[2.5rem] blur-xl"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">Neural Network Architect</span>
              </div>
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">v4.2.0-stable</span>
            </div>
            <h1 className="text-6xl font-light tracking-tighter text-white leading-none">
              Intelligence <span className="text-blue-500 font-medium">Architect</span>
            </h1>
            <p className="text-gray-500 text-sm font-light tracking-wide max-w-md">
              Design and deploy specialized intelligence nodes to automate complex business logic.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="group relative flex items-center gap-4 px-10 py-5 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-500/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
          <span className="relative z-10 uppercase text-[11px] tracking-[0.25em]">Initialize Node</span>
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Node Registry */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <Terminal className="w-4 h-4 text-blue-500" /> Node Registry
              </h2>
              <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tight">{agents.length} Online</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
              {agents.map((agent) => (
                <motion.div
                  key={agent.id}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setIsCreating(false);
                    setChatHistory([]);
                  }}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-all duration-500 group relative overflow-hidden",
                    selectedAgent?.id === agent.id 
                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]" 
                    : "glass-card border-white/5 hover:bg-white/[0.05] hover:border-white/20"
                  )}
                >
                  {selectedAgent?.id === agent.id && (
                    <motion.div 
                      layoutId="active-node-glow"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"
                    />
                  )}
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-500",
                      selectedAgent?.id === agent.id ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "bg-white/5 group-hover:bg-white/10"
                    )}>
                      <Bot className={cn("w-5 h-5", selectedAgent?.id === agent.id ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className={cn(
                        "font-medium truncate text-sm transition-colors",
                        selectedAgent?.id === agent.id ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                      )}>
                        {agent.name}
                      </h3>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-1">{agent.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-4 h-4 text-blue-500" />
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Security Protocol</h3>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-light">
              All intelligence nodes operate within isolated neural sandboxes. Data access is strictly governed by cryptographic tokens.
            </p>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Latency</span>
              <span className="text-[10px] text-emerald-500 font-mono font-bold">14ms</span>
            </div>
          </div>
        </div>

        {/* Center: Configuration / Details */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {isCreating ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-card p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                  <Code className="w-64 h-64 text-white" />
                </div>

                <div className="flex justify-between items-center mb-12 relative z-10">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-light tracking-tight flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <Cpu className="w-6 h-6 text-blue-500" />
                      </div>
                      Initialize <span className="font-medium text-blue-500">Node</span>
                    </h2>
                    <p className="text-xs text-gray-500 font-light tracking-wide">Define the core logic and access parameters for the new intelligence entity.</p>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="p-3 hover:bg-white/5 rounded-full transition-all text-gray-500 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] ml-1">Node Identity</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Inventory Manager"
                        className="glass-input"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] ml-1">Specialization</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Supply Chain Specialist"
                        className="glass-input"
                        value={newAgent.role}
                        onChange={(e) => setNewAgent({...newAgent, role: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] ml-1">Logic Directives</label>
                    <textarea 
                      rows={6}
                      placeholder="Define how this node should interpret data and make decisions..."
                      className="glass-input h-auto resize-none"
                      value={newAgent.instructions}
                      onChange={(e) => setNewAgent({...newAgent, instructions: e.target.value})}
                    />
                  </div>

                  <div className="space-y-5">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] ml-1">Data Bridge Permissions</label>
                    <div className="flex flex-wrap gap-3">
                      {['Financials', 'Inventory', 'CRM', 'Live Web', 'GST Portal', 'Tally ERP'].map((data) => {
                        const isSelected = newAgent.dataAccess.includes(data);
                        return (
                          <button 
                            key={data}
                            onClick={() => {
                              if (isSelected) {
                                setNewAgent({ ...newAgent, dataAccess: newAgent.dataAccess.filter(d => d !== data) });
                              } else {
                                setNewAgent({ ...newAgent, dataAccess: [...newAgent.dataAccess, data] });
                              }
                            }}
                            className={cn(
                              "px-5 py-2.5 rounded-xl border transition-all duration-500 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest",
                              isSelected 
                              ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                              : "border-white/5 bg-white/[0.02] text-gray-600 hover:border-white/20 hover:text-gray-400"
                            )}
                          >
                            <Database className="w-3.5 h-3.5" />
                            {data}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={handleCreateAgent}
                    className="group w-full py-6 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl font-bold transition-all duration-700 flex items-center justify-center gap-4 shadow-2xl overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Save className="w-6 h-6 relative z-10" />
                    <span className="relative z-10 uppercase tracking-[0.2em] text-xs">Deploy Intelligence Node</span>
                  </button>
                </div>
              </motion.div>
            ) : selectedAgent ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="glass-card p-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 pointer-events-none group-hover:scale-110">
                    <Bot className="w-80 h-80 text-white" />
                  </div>

                  <div className="flex items-center gap-8 mb-12 relative z-10">
                    <div className="p-6 bg-blue-500 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.3)] group-hover:rotate-6 transition-transform duration-500">
                      <Bot className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-light tracking-tight text-white">{selectedAgent.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px]">{selectedAgent.role}</span>
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                        <span className="text-gray-600 text-[10px] font-mono font-bold uppercase tracking-widest">ID: {selectedAgent.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10 mb-12 relative z-10">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-1">Logic Directives</h4>
                      <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 text-sm text-gray-400 leading-relaxed font-light italic relative">
                        <div className="absolute top-4 left-4 text-4xl text-white/5 font-serif">"</div>
                        {selectedAgent.instructions}
                        <div className="absolute bottom-4 right-4 text-4xl text-white/5 font-serif">"</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-1">Capabilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.capabilities.map((cap, i) => (
                            <span key={i} className="px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[9px] text-blue-400 font-bold uppercase tracking-widest">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] ml-1">Data Bridges</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.dataAccess?.map((data, i) => (
                            <span key={i} className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]" />
                              {data}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 relative z-10">
                    <button className="flex-1 py-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn">
                      <Settings className="w-4 h-4 text-gray-500 group-hover/btn:rotate-90 transition-transform duration-500" />
                      Reconfigure Node
                    </button>
                    <button 
                      onClick={() => handleDeleteAgent(selectedAgent.id)}
                      disabled={selectedAgent.id.startsWith('pb-')}
                      className="px-8 py-5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500 rounded-2xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Status', value: 'Active', color: 'emerald', icon: Zap },
                    { label: 'Compute', value: '1.2k ops', color: 'blue', icon: Cpu },
                    { label: 'Uptime', value: '99.99%', color: 'purple', icon: Shield }
                  ].map((stat) => (
                    <div key={stat.label} className={cn(
                      "p-6 glass-card transition-all duration-500 hover:scale-105",
                      `bg-${stat.color}-500/[0.02] border-${stat.color}-500/10`
                    )}>
                      <div className={cn(
                        "text-[9px] font-bold uppercase tracking-[0.3em] mb-3 flex items-center gap-2",
                        `text-${stat.color}-500`
                      )}>
                        <stat.icon className="w-3.5 h-3.5" />
                        {stat.label}
                      </div>
                      <div className="text-xl font-light tracking-tight text-white font-mono">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01] group">
                <div className="p-12 bg-blue-500/5 rounded-[3rem] mb-10 relative">
                  <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <Bot className="w-24 h-24 text-blue-500/30 relative z-10 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute -top-3 -right-3 p-4 bg-blue-500 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:rotate-12 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-light tracking-tight text-white mb-4">Select a <span className="text-blue-500 font-medium">Node</span></h2>
                <p className="text-gray-500 max-w-xs text-sm leading-relaxed font-light tracking-wide">
                  Choose an existing intelligence node from the registry or initialize a new one to begin autonomous execution.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live Execution Console */}
        <div className="lg:col-span-4">
          <div className="flex flex-col h-[calc(100vh-220px)]">
            {selectedAgent ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full glass-card overflow-hidden shadow-2xl"
              >
                {/* Console Header */}
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Execution Console</h3>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-mono font-bold text-gray-600 uppercase tracking-widest">v4.2.0-stable</div>
                </div>

                {/* Quick Simulations */}
                <div className="p-8 bg-white/[0.01] border-b border-white/5">
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-6 ml-1">Scenario Simulation</div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Stockout', icon: Zap, prompt: 'Simulate a sudden stockout of our top-selling item and recommend immediate actions.' },
                      { label: 'GST Audit', icon: Shield, prompt: 'Run a simulated GST audit on last month\'s vouchers and identify potential red flags.' },
                      { label: 'Daily Sync', icon: Database, prompt: 'Simulate a daily Tally sync and provide a summary of new entries.' },
                      { label: 'Alert Test', icon: MessageSquare, prompt: 'Simulate a critical inventory alert and draft a WhatsApp notification for the manager.' }
                    ].map((sim) => (
                      <button
                        key={sim.label}
                        onClick={() => handleRunAgent(sim.prompt)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-500 group text-left"
                      >
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-blue-500/20 transition-all">
                          <sim.icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-widest">{sim.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Console Output */}
                <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <div className="relative mb-6">
                        <Cpu className="w-16 h-16 text-gray-500" />
                        <motion.div 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"
                        />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Console Idle</p>
                      <p className="text-[9px] mt-3 text-gray-500 uppercase tracking-widest">Awaiting neural input vectors...</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-5", msg.role === 'user' ? "flex-row-reverse" : "")}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl transition-all duration-500",
                        msg.role === 'agent' ? "bg-blue-600 shadow-blue-600/30" : "bg-white/5 border border-white/10"
                      )}>
                        {msg.role === 'agent' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className={cn(
                        "max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed font-light shadow-xl",
                        msg.role === 'agent' 
                        ? "bg-blue-500/[0.03] border border-blue-500/10 text-gray-300" 
                        : "bg-white/[0.03] border border-white/10 text-white"
                      )}>
                        {msg.content}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">{msg.timestamp}</span>
                          {msg.role === 'agent' && <Sparkles className="w-3 h-3 text-blue-500/40" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isRunning && (
                    <div className="flex gap-5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                      <div className="p-6 rounded-[2rem] bg-blue-500/[0.03] border border-blue-500/10">
                        <div className="flex gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Console Input */}
                <div className="p-8 bg-white/[0.02] border-t border-white/5">
                  <div className="relative flex items-center gap-4">
                    <div className="absolute left-5 text-blue-500/50">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Input neural command..."
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-16 outline-none focus:border-blue-500/50 focus:bg-blue-500/[0.02] transition-all text-white text-xs font-light tracking-wide placeholder:text-gray-700"
                      value={runInput}
                      onChange={(e) => setRunInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRunAgent()}
                    />
                    <button 
                      onClick={() => handleRunAgent()}
                      disabled={isRunning || !runInput.trim()}
                      className="absolute right-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-20 shadow-2xl shadow-blue-600/30 group"
                    >
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-16 border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] opacity-30">
                <div className="p-10 bg-white/5 rounded-full mb-8">
                  <Play className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Console Offline</p>
                <p className="text-[9px] mt-3 text-gray-600 uppercase tracking-widest">Select a node to initialize neural console.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
