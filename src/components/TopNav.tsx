import { ChevronDown, Globe, Building2, PanelRightOpen, UserCircle, Search, Bell, Upload, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopNav({ toggleRightPanel, workspaceName = "Acme Corp Workspace" }: { toggleRightPanel: () => void, workspaceName?: string }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mode, setMode] = useState<'global' | 'business'>('business');

  return (
    <header className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 flex-shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">{workspaceName}</h2>
          <ChevronDown className="w-3 h-3 text-white/20" />
        </div>

        <div className="h-8 w-px bg-white/5" />

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setMode('global')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              mode === 'global' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Global AI</span>
          </button>
          <button 
            onClick={() => setMode('business')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              mode === 'business' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>BharatMind Space</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search workspace..."
            className="bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500/30 transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-white/40 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]" />
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5">
          <Upload className="w-3 h-3" />
          <span>Upload Data</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 p-px"
          >
            <div className="w-full h-full rounded-xl bg-[#050505] flex items-center justify-center overflow-hidden">
              <UserCircle className="w-6 h-6 text-white/40" />
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 mb-2">
                  <p className="text-xs font-bold text-white">Partha Sarathi</p>
                  <p className="text-[10px] text-white/40 mt-1">partha311@gmail.com</p>
                </div>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <UserCircle className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <PanelRightOpen className="w-4 h-4" />
                  <span>Workspace Settings</span>
                </button>
                <div className="h-px bg-white/5 my-2" />
                <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
