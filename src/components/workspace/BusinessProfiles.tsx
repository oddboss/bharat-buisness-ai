import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  UserCircle, 
  Building2, 
  MapPin, 
  Target, 
  Wallet, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  Briefcase,
  Loader2,
  Shield,
  Globe,
  Zap,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { db, collection, onSnapshot, setDoc, doc, deleteDoc, Timestamp, query, orderBy, handleFirestoreError, OperationType } from '../../firebase';
import { cn } from '../../lib/utils';

interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  location: string;
  targetCustomers: string;
  revenueModel: string;
  description: string;
  isDefault: boolean;
  organizationId: string;
  createdAt: any;
}

export function BusinessProfiles() {
  const { organizationId } = useFirebase();
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<BusinessProfile>>({});

  useEffect(() => {
    if (!organizationId) return;

    const q = query(
      collection(db, 'organizations', organizationId, 'business_profiles'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profileData: BusinessProfile[] = [];
      snapshot.forEach((doc) => {
        profileData.push({ id: doc.id, ...doc.data() } as BusinessProfile);
      });
      setProfiles(profileData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `organizations/${organizationId}/business_profiles`);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const handleAddProfile = async () => {
    if (newProfile.name && organizationId) {
      const profileId = Date.now().toString();
      const path = `organizations/${organizationId}/business_profiles/${profileId}`;
      
      try {
        const profile: BusinessProfile = {
          id: profileId,
          organizationId,
          name: newProfile.name,
          industry: newProfile.industry || '',
          location: newProfile.location || '',
          targetCustomers: newProfile.targetCustomers || '',
          revenueModel: newProfile.revenueModel || '',
          description: newProfile.description || '',
          isDefault: profiles.length === 0,
          createdAt: Timestamp.now()
        };

        await setDoc(doc(db, 'organizations', organizationId, 'business_profiles', profileId), profile);
        setIsAdding(false);
        setNewProfile({});
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!organizationId) return;
    const path = `organizations/${organizationId}/business_profiles/${profileId}`;
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'business_profiles', profileId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleSetDefault = async (profileId: string) => {
    if (!organizationId) return;
    
    try {
      // This should ideally be a batch operation
      for (const profile of profiles) {
        await setDoc(doc(db, 'organizations', organizationId, 'business_profiles', profile.id), {
          ...profile,
          isDefault: profile.id === profileId
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `organizations/${organizationId}/business_profiles`);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading Profiles...</p>
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

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500 mb-1">
            <Globe className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Identity Management</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Business <span className="text-emerald-500 font-medium italic">Entities</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Manage your business identities for context-aware neural intelligence.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20 group active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Initialize Profile</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {profiles.map((profile, i) => (
          <motion.div 
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 glass-card transition-all duration-500 relative group overflow-hidden border",
              profile.isDefault 
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-500/10' 
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
            )}
          >
            {profile.isDefault && (
              <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] rounded-bl-3xl border-l border-b border-emerald-500/30 backdrop-blur-md">
                Primary Context
              </div>
            )}
            
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Building2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white tracking-tight group-hover:text-emerald-400 transition-colors duration-500">{profile.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] mt-1">{profile.industry}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 text-sm text-gray-400 font-medium group/item">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-emerald-500/10 transition-colors">
                  <MapPin className="w-4 h-4 text-gray-600 group-hover/item:text-emerald-500" />
                </div>
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 font-medium group/item">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-emerald-500/10 transition-colors">
                  <Target className="w-4 h-4 text-gray-600 group-hover/item:text-emerald-500" />
                </div>
                <span>Target: {profile.targetCustomers}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 font-medium group/item">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-emerald-500/10 transition-colors">
                  <Wallet className="w-4 h-4 text-gray-600 group-hover/item:text-emerald-500" />
                </div>
                <span>Model: {profile.revenueModel}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mt-6 line-clamp-3 font-medium italic">
                "{profile.description}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-10 pt-8 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <button className="p-3 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDeleteProfile(profile.id)}
                className="p-3 bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              {!profile.isDefault && (
                <button 
                  onClick={() => handleSetDefault(profile.id)}
                  className="px-6 py-3 bg-emerald-500/10 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20"
                >
                  Set Primary
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Modal Background Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="space-y-1">
                  <h2 className="text-4xl font-light text-white tracking-tighter">Initialize <span className="text-emerald-500 font-medium italic">Entity</span></h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">New Neural Context Profile</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-3 bg-white/5 text-gray-500 hover:text-white rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Neural Dynamics Corp"
                    className="glass-input"
                    value={newProfile.name || ''}
                    onChange={e => setNewProfile({...newProfile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AI & Robotics"
                    className="glass-input"
                    value={newProfile.industry || ''}
                    onChange={e => setNewProfile({...newProfile, industry: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Neo-Mumbai, IN"
                    className="glass-input"
                    value={newProfile.location || ''}
                    onChange={e => setNewProfile({...newProfile, location: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Target Customers</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Enterprise SaaS"
                    className="glass-input"
                    value={newProfile.targetCustomers || ''}
                    onChange={e => setNewProfile({...newProfile, targetCustomers: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Revenue Model</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Usage-based"
                    className="glass-input"
                    value={newProfile.revenueModel || ''}
                    onChange={e => setNewProfile({...newProfile, revenueModel: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Vision Statement</label>
                  <textarea 
                    placeholder="Briefly describe your business vision..."
                    className="glass-input h-32 resize-none"
                    value={newProfile.description || ''}
                    onChange={e => setNewProfile({...newProfile, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-6 relative z-10">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
                >
                  Abort
                </button>
                <button 
                  onClick={handleAddProfile}
                  className="px-12 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-lg shadow-emerald-500/20 group active:scale-[0.98] flex items-center gap-3"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Create Entity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
