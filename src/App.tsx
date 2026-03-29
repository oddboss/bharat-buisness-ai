import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { Dashboard } from './components/workspace/Dashboard';
import { BusinessSpace } from './components/workspace/BusinessSpace';
import { SalesForecast } from './components/workspace/SalesForecast';
import { GrowthEngine } from './components/workspace/GrowthEngine';
import { CompetitorMode } from './components/workspace/CompetitorMode';
import { GSTCompliance } from './components/workspace/GSTCompliance';
import { WhatsAppGrowth } from './components/workspace/WhatsAppGrowth';
import { PersonalBusinessSpace } from './components/workspace/PersonalBusinessSpace';
import { AgentBuilder } from './components/workspace/AgentBuilder';
import { DataConnectors } from './components/workspace/DataConnectors';
import { NeuralBILab } from './components/workspace/NeuralBILab';
import { FloatingAssistant } from './components/FloatingAssistant';
import { VoiceOrb } from './components/VoiceOrb';
import { Message } from './types';
import { generateBusinessInsightStream } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ChevronDown, LogIn, Building2, ShieldCheck } from 'lucide-react';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';

function AppContent() {
  const { user, loading, login, organizationName, isLoggingIn } = useFirebase();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activePage, setActivePage] = useState('copilot');
  const [tier, setTier] = useState('advanced');
  
  // Voice System States
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const [moduleMessages, setModuleMessages] = useState<Record<string, Message[]>>({
    'copilot': [{ id: '1', role: 'assistant', content: 'BharatMind AI is online. I have access to your Tally data and business context. What decision do you want to make today?' }],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const messages = moduleMessages['copilot'] || [];

  const handleSendMessage = async (content: string, dataContext?: any) => {
    if (!content.trim()) return;
    
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content };
    const assistantMessageId = (Date.now() + 1).toString();
    
    setModuleMessages(prev => ({
      ...prev,
      ['copilot']: [...(prev['copilot'] || []), newUserMessage, { id: assistantMessageId, role: 'assistant', content: '' }]
    }));
    
    setIsGenerating(true);
    setIsProcessing(true);

    try {
      await generateBusinessInsightStream(content, activePage, tier, (chunkText) => {
        setIsProcessing(false);
        setIsExecuting(true);
        setModuleMessages(prev => {
          const currentMessages = prev['copilot'] || [];
          const updatedMessages = currentMessages.map(msg => {
            if (msg.id === assistantMessageId) {
              return { ...msg, content: msg.content + chunkText };
            }
            return msg;
          });
          return { ...prev, ['copilot']: updatedMessages };
        });
      }, dataContext);
    } catch (error: any) {
      let errorMessage = 'Error: Unable to connect to the intelligence engine.';
      if (error.message) errorMessage = error.message;

      setModuleMessages(prev => {
        const currentMessages = prev['copilot'] || [];
        const updatedMessages = currentMessages.map(msg => {
          if (msg.id === assistantMessageId) {
            return { ...msg, content: errorMessage };
          }
          return msg;
        });
        return { ...prev, ['copilot']: updatedMessages };
      });
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
      setIsExecuting(false);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'personal-space':
        return <PersonalBusinessSpace setActivePage={setActivePage} />;
      case 'business-space':
        return <BusinessSpace />;
      case 'sales-forecast':
        return <SalesForecast />;
      case 'growth-engine':
        return <GrowthEngine />;
      case 'competitor-mode':
        return <CompetitorMode />;
      case 'gst-compliance':
        return <GSTCompliance />;
      case 'whatsapp-growth':
        return <WhatsAppGrowth />;
      case 'agent-builder':
        return <AgentBuilder />;
      case 'data-connectors':
        return <DataConnectors />;
      case 'neural-bi':
        return <NeuralBILab />;
      case 'copilot':
        return (
          <div className="flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-4 right-4 z-30">
              <button 
                onClick={() => setModuleMessages(prev => ({ ...prev, copilot: [] }))}
                className="px-3 py-1.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-lg text-xs transition-all"
              >
                Clear Chat
              </button>
            </div>
            <ChatArea messages={messages} isGenerating={isGenerating} />
            <InputArea 
              onSendMessage={handleSendMessage} 
              isGenerating={isGenerating} 
              tier={tier}
              setTier={setTier}
            />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-emerald-500 font-bold tracking-widest animate-pulse">BHARATMIND AI INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex bg-[#020617] overflow-hidden font-sans">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 bg-gradient-to-br from-emerald-900/20 to-transparent border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <Building2 className="text-black w-7 h-7" />
              </div>
              <span className="text-3xl font-bold tracking-tighter text-white">BharatMind AI</span>
            </div>
            
            <h1 className="text-7xl font-bold text-white leading-[0.9] mb-8 tracking-tighter">
              India's Personal<br />
              <span className="text-emerald-500">Business OS.</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-md leading-relaxed">
              The AI COO + Growth Hacker + BI Engine for modern Indian enterprises. Tally integrated, data-driven, and action-oriented.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 relative z-10">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <ShieldCheck className="text-emerald-500 w-5 h-5" />
              </div>
              <h3 className="text-white font-bold tracking-tight">Enterprise Security</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Bank-grade encryption and multi-tenant isolation for your sensitive data.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <Zap className="text-emerald-500 w-5 h-5" />
              </div>
              <h3 className="text-white font-bold tracking-tight">AI-First Workflow</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Context-aware copilot that understands your business profiles and goals.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
          
          <div className="w-full max-w-sm relative z-10">
            <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Building2 className="text-black w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">BharatMind AI</span>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-zinc-400 font-medium">Sign in to access your intelligent workspace</p>
            </div>

            <button
              onClick={login}
              disabled={isLoggingIn}
              className={`w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)] ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              )}
              {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-xs text-zinc-500 leading-relaxed text-center">
                By continuing, you agree to our <span className="text-emerald-500 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-emerald-500 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <VoiceOrb 
        isListening={isListening} 
        isProcessing={isProcessing} 
        isExecuting={isExecuting} 
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        <TopNav 
          workspaceName={organizationName || "My Workspace"}
          toggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)} 
        />
        
        <div className={cn(
          "flex-1 relative",
          activePage !== 'copilot' && "overflow-y-auto scrollbar-hide"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: AI Copilot (Context Aware) */}
      <AnimatePresence>
        {isRightPanelOpen && activePage !== 'copilot' && (
          <motion.aside 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col relative z-30"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">AI Copilot</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Context Aware</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRightPanelOpen(false)}
                className="p-2 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <p className="text-xs text-emerald-400/80 leading-relaxed">
                  "I'm currently monitoring your <strong>{organizationName || "Workspace"}</strong> workspace. Your revenue is up 12% this week. Would you like a detailed report?"
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Suggested Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Generate Q4 Report',
                    'Analyze Competitors',
                    'Draft Sales Email',
                    'Review Project Timeline'
                  ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSendMessage(action)}
                      className="w-full text-left p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white/60 hover:text-white hover:border-white/10 transition-all flex items-center justify-between group"
                    >
                      <span>{action}</span>
                      <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Recent Intelligence</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-[10px] text-white/40 mb-1">Market Trend</p>
                    <p className="text-xs text-white/80">Competitor X just launched a new pricing model. Analyzing impact...</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-[10px] text-white/40 mb-1">Operational Alert</p>
                    <p className="text-xs text-white/80">Inventory for SKU-402 is low. Suggested reorder: 500 units.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Ask Copilot anything..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) {
                        handleSendMessage(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all pr-10"
                />
                <button 
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value.trim()) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <FloatingAssistant setActivePage={setActivePage} />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
