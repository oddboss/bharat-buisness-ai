import { 
  LayoutDashboard, 
  Briefcase, 
  UserCircle, 
  FileText, 
  Layout, 
  BarChart3, 
  Settings, 
  X, 
  Bot, 
  Sparkles,
  Zap,
  Loader2,
  Link2,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase';

const navItems = [
  { icon: Database, label: 'Personal Business Space', id: 'personal-space' },
  { icon: Sparkles, label: 'AI Command Center', id: 'copilot' },
  { icon: BarChart3, label: 'Neural BI Lab', id: 'neural-bi' },
  { icon: TrendingUp, label: 'Sales Forecast', id: 'sales-forecast' },
  { icon: Zap, label: 'Growth Engine', id: 'growth-engine' },
  { icon: Briefcase, label: 'Competitor Mode', id: 'competitor-mode' },
  { icon: Link2, label: 'Data Connectors', id: 'data-connectors' },
  { icon: Bot, label: 'Agent Builder', id: 'agent-builder' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export function Sidebar({ activePage, setActivePage }: { activePage: string, setActivePage: (page: string) => void }) {
  const { db, user, organizationName, organizationId } = useFirebase();
  const [openSettings, setOpenSettings] = useState(false);
  const [newOrgName, setNewOrgName] = useState(organizationName || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organizationName) {
      setNewOrgName(organizationName);
    }
  }, [organizationName]);

  const handleSaveSettings = async () => {
    if (!db || !organizationId || !newOrgName.trim()) return;
    
    setIsSaving(true);
    try {
      const orgRef = doc(db, 'organizations', organizationId);
      await updateDoc(orgRef, {
        name: newOrgName.trim()
      });
      setOpenSettings(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `organizations/${organizationId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  return (
    <div className="w-[280px] bg-[#020617] flex-shrink-0 flex flex-col h-full border-r border-white/5 relative">
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-lg tracking-tight text-white leading-none">BharatMind AI</span>
          <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mt-1">AI-Powered ERP</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        <div className="space-y-1.5">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Workspace</p>
          </div>
          {navItems.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => setActivePage(item.id)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden",
                activePage === item.id 
                  ? "bg-white/[0.05] text-white font-medium border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
              )}
            >
              {activePage === item.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-r-full shadow-[0_0_10px_#10b981]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                "w-4.5 h-4.5 transition-all duration-300", 
                activePage === item.id ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "group-hover:text-white/60 group-hover:scale-110"
              )} />
              <span className="tracking-wide">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="space-y-1">
          {bottomItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'settings') setOpenSettings(true);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm text-white/30 hover:text-white/70 hover:bg-white/[0.02] transition-all duration-300 group hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            >
              <item.icon className="w-4.5 h-4.5 transition-all group-hover:text-white/60 group-hover:scale-110" />
              <span className="tracking-wide">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-white truncate">{user?.displayName || 'User'}</span>
            <span className="text-[10px] text-white/30 truncate">{organizationName || 'Workspace'}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Settings</h2>
                <button onClick={() => setOpenSettings(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Workspace Name</label>
                  <input 
                    type="text" 
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                  <select className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors mt-4 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
