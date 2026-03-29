import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Layout, 
  FileText, 
  Mail, 
  Briefcase, 
  Search, 
  Zap, 
  Copy, 
  ChevronRight, 
  Star,
  Clock,
  Filter,
  MoreVertical,
  Code,
  FileSpreadsheet,
  Loader2,
  Database
} from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  orderBy 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'Proposal' | 'Email' | 'Financial' | 'Contract' | 'AI Prompt';
  usageCount: number;
  lastUsed: string;
  iconName: string;
  color: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

export function Templates() {
  const { db, organizationId } = useFirebase();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!db || !organizationId) return;

    const path = `organizations/${organizationId}/templates`;
    const q = query(collection(db, path), orderBy('usageCount', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Template[];
      setTemplates(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, organizationId]);

  const seedTemplates = async () => {
    if (!db || !organizationId) return;
    setIsSeeding(true);
    
    const demoTemplates = [
      {
        title: 'Investor Pitch Deck',
        description: 'Standard 10-slide pitch deck template for seed funding.',
        category: 'Proposal',
        usageCount: 24,
        lastUsed: '2 days ago',
        iconName: 'Layout',
        color: 'bg-blue-500/10 text-blue-400'
      },
      {
        title: 'B2B Sales Outreach',
        description: 'High-conversion cold email sequence for enterprise clients.',
        category: 'Email',
        usageCount: 156,
        lastUsed: '1 hour ago',
        iconName: 'Mail',
        color: 'bg-emerald-500/10 text-emerald-400'
      },
      {
        title: 'Financial Model (SaaS)',
        description: 'Comprehensive Excel model for tracking MRR, Churn, and CAC.',
        category: 'Financial',
        usageCount: 42,
        lastUsed: '1 week ago',
        iconName: 'FileSpreadsheet',
        color: 'bg-amber-500/10 text-amber-400'
      },
      {
        title: 'Market Analysis Prompt',
        description: 'Advanced AI prompt for deep-dive competitor research.',
        category: 'AI Prompt',
        usageCount: 89,
        lastUsed: '3 hours ago',
        iconName: 'Zap',
        color: 'bg-purple-500/10 text-purple-400'
      }
    ];

    try {
      for (const item of demoTemplates) {
        const id = Math.random().toString(36).substring(7);
        await setDoc(doc(db, `organizations/${organizationId}/templates`, id), {
          ...item,
          id,
          organizationId
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `organizations/${organizationId}/templates`);
    } finally {
      setIsSeeding(false);
    }
  };

  const categories = ['All', 'Proposal', 'Email', 'Financial', 'Contract', 'AI Prompt'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Templates</h1>
          <p className="text-white/40 mt-1">Ready-to-use business assets and AI frameworks.</p>
        </div>
        <div className="flex items-center gap-4">
          {templates.length === 0 && (
            <button 
              onClick={seedTemplates}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>Seed Templates</span>
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20">
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
              activeCategory === cat 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates
          .filter(t => activeCategory === 'All' || t.category === activeCategory)
          .map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group glass-card p-6 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-white/20 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${template.color}`}>
                  {iconMap[template.iconName] || <Layout className="w-5 h-5" />}
                </div>
                <div className="flex-1 pr-8">
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">{template.title}</h3>
                  <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">{template.category}</span>
                </div>
              </div>

              <p className="text-sm text-white/40 leading-relaxed mb-8 h-10 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/20 uppercase tracking-widest font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{template.lastUsed}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/20 uppercase tracking-widest font-bold">
                    <Zap className="w-3 h-3" />
                    <span>{template.usageCount} uses</span>
                  </div>
                </div>
                <button className="p-2 bg-white/5 hover:bg-emerald-500/20 text-white/20 hover:text-emerald-400 rounded-lg transition-all">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-dashed border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-white/20 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white/20" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Add New Template</h3>
            <p className="text-xs text-white/20 mt-1">Create a custom business framework.</p>
          </div>
        </motion.div>
      </div>

      <div className="glass-card p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">AI Prompt Engineering</h3>
            <p className="text-sm text-white/40 mt-1">Learn how to build powerful business prompts for BharatMind.</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
          <span>View Guide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
