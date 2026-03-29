import { Bot, User, Search, FileText, Activity, CheckCircle2, ShieldAlert, LineChart, Network, Target, Languages, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { ResearchMessage } from './ResearchMessage';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ResearchProgress({ isComplete }: { isComplete?: boolean }) {
  const [activeAgent, setActiveAgent] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const agents = [
    { name: "Market Analyst Agent", role: "Analyzing industry trends & demand", icon: LineChart, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", output: "Evaluating market size and growth drivers..." },
    { name: "Risk Intelligence Agent", role: "Evaluating regulatory & financial risks", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", output: "Scanning macroeconomic exposure and threats..." },
    { name: "Strategy Consultant Agent", role: "Providing strategic recommendations", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", output: "Formulating competitive positioning models..." },
    { name: "Data Verification Agent", role: "Checking factual accuracy", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", output: "Validating sources and attaching citations..." }
  ];

  useEffect(() => {
    if (isComplete) {
      setActiveAgent(agents.length - 1);
      const timer = setTimeout(() => setIsCollapsed(true), 1000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setActiveAgent(s => (s < agents.length - 1 ? s + 1 : s));
    }, 2500);
    return () => clearInterval(interval);
  }, [isComplete]);

  if (isCollapsed) {
    return (
      <motion.div 
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-400">Intelligence Council Analysis Complete</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 w-full max-w-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="font-medium text-sm text-emerald-400 uppercase tracking-wider">AI Intelligence Council</span>
        </div>
        <span className="text-xs text-gray-500 font-mono">{activeAgent + 1} / {agents.length}</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {agents.map((agent, i) => {
          const isActive = i === activeAgent;
          const isDone = i < activeAgent || isComplete;
          const isPending = i > activeAgent && !isComplete;
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPending ? 0.4 : 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 items-center",
                isActive && !isComplete ? cn(agent.bg, agent.border) : "bg-[#222] border-white/5",
                isDone && "border-emerald-500/30 bg-emerald-500/5"
              )}
            >
              {(isActive && !isComplete) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              )}
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] shrink-0 border border-white/10 relative z-10">
                <agent.icon className={cn("w-5 h-5", isDone ? "text-emerald-500" : isActive ? agent.color : "text-gray-500")} />
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-sm font-semibold", isDone ? "text-gray-300" : isActive ? "text-white" : "text-gray-500")}>
                    {agent.name}
                  </span>
                  <span className={cn("text-[10px] uppercase tracking-wider font-medium", isActive && !isComplete ? agent.color : "text-gray-600")}>
                    {isDone ? "Complete" : isActive ? "Analyzing" : "Waiting"}
                  </span>
                </div>
                <span className={cn("block text-xs", isActive && !isComplete ? "text-gray-300" : "text-gray-600")}>
                  {isActive && !isComplete ? (
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ color: 'inherit' }} />
                      {agent.output}
                    </span>
                  ) : isDone ? (
                    "Analysis integrated into final report."
                  ) : (
                    agent.role
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TranslateDropdown({ onTranslate, isTranslating }: { onTranslate: (lang: string) => void, isTranslating?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Marathi', 'Gujarati'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className={cn(
          "p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all",
          isTranslating && "animate-pulse"
        )}
        title="Translate message"
      >
        {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a1c23] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => {
                onTranslate(lang);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatArea({ messages, isGenerating, onTranslateMessage }: { messages: Message[], isGenerating: boolean, onTranslateMessage?: (id: string, lang: string) => void }) {
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setShowProgress(true);
    } else {
      const timer = setTimeout(() => setShowProgress(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  const scrollRef = useEffect(() => {
    const container = document.querySelector('.scroll-smooth');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Filter out empty assistant messages that are just placeholders while generating
  const displayMessages = messages.filter(msg => msg.content.trim() !== '');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-8">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-emerald-500" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed group relative",
                msg.role === 'user'
                  ? "bg-[#2f2f2f] text-gray-100"
                  : "bg-transparent text-gray-300 w-full"
              )}
            >
              {msg.role === 'assistant' && onTranslateMessage && (
                <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TranslateDropdown 
                    onTranslate={(lang) => onTranslateMessage(msg.id, lang)} 
                    isTranslating={msg.isTranslating} 
                  />
                </div>
              )}
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ResearchMessage 
                  content={msg.content} 
                  isTranslating={msg.isTranslating}
                  onTranslate={onTranslateMessage ? (lang) => onTranslateMessage(msg.id, lang) : undefined} 
                />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        { (isGenerating || showProgress) && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
            <ResearchProgress isComplete={!isGenerating} />
          </div>
        )}
      </div>
    </div>
  );
}
