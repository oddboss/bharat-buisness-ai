import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Zap, 
  Search, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Loader2,
  LayoutGrid,
  Activity,
  Database,
  Shield,
  Cpu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useFirebase } from '../../contexts/FirebaseContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit,
  doc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';
import { cn } from '../../lib/utils';

interface Project {
  id: string;
  title: string;
  status: string;
  createdAt: any;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: any;
}

interface FinancialRecord {
  month: string;
  revenue: number;
  profit: number;
}

interface InventoryItem {
  id: string;
  name: string;
  stock: string;
  status: 'critical' | 'warning' | 'normal';
}

export function Dashboard() {
  const { user, db, organizationId, organizationName } = useFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [financialData, setFinancialData] = useState<FinancialRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!db || !organizationId) return;

    const projectsPath = `organizations/${organizationId}/projects`;
    const docsPath = `organizations/${organizationId}/documents`;
    const financePath = `organizations/${organizationId}/financial_data`;
    const inventoryPath = `organizations/${organizationId}/inventory`;

    const projectsQuery = query(collection(db, projectsPath), orderBy('createdAt', 'desc'), limit(3));
    const docsQuery = query(collection(db, docsPath), orderBy('uploadedAt', 'desc'), limit(3));
    const financeQuery = query(collection(db, financePath), orderBy('year', 'asc'), orderBy('month', 'asc'), limit(6));
    const inventoryQuery = query(collection(db, inventoryPath), orderBy('updatedAt', 'desc'), limit(5));

    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, projectsPath));

    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Document[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, docsPath));

    const unsubFinance = onSnapshot(financeQuery, (snapshot) => {
      setFinancialData(snapshot.docs.map(doc => doc.data()) as FinancialRecord[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, financePath));

    const unsubInventory = onSnapshot(inventoryQuery, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
      setInventory(inventoryData);
      setLoading(false);
      
      if (snapshot.empty && projects.length === 0 && documents.length === 0 && !isSeeding) {
        seedDashboardData();
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, inventoryPath));

    return () => {
      unsubProjects();
      unsubDocs();
      unsubFinance();
      unsubInventory();
    };
  }, [db, organizationId]);

  const seedDashboardData = async () => {
    if (!db || !organizationId) return;
    setIsSeeding(true);
    try {
      const inventoryItems = [
        { name: 'Mobile Accessories', stock: 'Low', status: 'critical', updatedAt: serverTimestamp() },
        { name: 'Electronics Stock', stock: '12 units left', status: 'warning', updatedAt: serverTimestamp() },
        { name: 'General Ledger', stock: 'Normal', status: 'normal', updatedAt: serverTimestamp() },
      ];

      for (const item of inventoryItems) {
        const id = Math.random().toString(36).substring(7);
        await setDoc(doc(db, `organizations/${organizationId}/inventory`, id), {
          ...item,
          organizationId,
          id
        });
      }

      const demoProjects = [
        { title: 'Q1 Marketing Strategy', client: 'Acme Corp', status: 'In Progress', progress: 45, createdAt: serverTimestamp(), description: 'Strategic planning for Q1 marketing campaigns.' },
        { title: 'Inventory Audit', client: 'Internal', status: 'Planning', progress: 10, createdAt: serverTimestamp(), description: 'Annual inventory audit and reconciliation.' },
      ];
      for (const p of demoProjects) {
        const id = Math.random().toString(36).substring(7);
        await setDoc(doc(db, `organizations/${organizationId}/projects`, id), { ...p, id, organizationId });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `organizations/${organizationId}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const chartData = useMemo(() => {
    if (financialData.length > 0) return financialData;
    return [
      { month: 'Jan', revenue: 4000, profit: 2400 },
      { month: 'Feb', revenue: 3000, profit: 1398 },
      { month: 'Mar', revenue: 2000, profit: 9800 },
      { month: 'Apr', revenue: 2780, profit: 3908 },
      { month: 'May', revenue: 1890, profit: 4800 },
      { month: 'Jun', revenue: 2390, profit: 3800 },
    ];
  }, [financialData]);

  const totalRevenue = useMemo(() => {
    if (financialData.length === 0) return 420000;
    return financialData.reduce((sum, item) => sum + item.revenue, 0);
  }, [financialData]);

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

      {/* Revenue Radar Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-40" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">System Online • Revenue Radar Active</span>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Database className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">Source: Personal Space</span>
            </div>
          </div>
          <h1 className="text-6xl font-light tracking-tighter text-white leading-none">
            Revenue <span className="text-emerald-500 font-medium italic">Radar</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md font-medium">
            Real-time financial trajectory and inventory intelligence for <span className="text-gray-300">{organizationName}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-8 p-8 glass-card relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-2">Total Revenue</p>
            <p className="text-4xl font-light tracking-tight text-white">
              ₹{(totalRevenue / 100000).toFixed(1)}<span className="text-emerald-500 font-medium ml-1">L</span>
            </p>
          </div>
          <div className="relative z-10 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Zoned Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Main Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 p-10 glass-card relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-700 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-10">
            <div className="flex items-center gap-3 text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>+12.5% Growth</span>
            </div>
          </div>
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <LayoutGrid className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-light tracking-tight">Revenue <span className="font-medium text-emerald-500">Trajectory</span></h3>
            </div>
            <p className="text-sm text-gray-500 font-medium">AI-predicted path vs actual performance metrics</p>
          </div>

          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#ffffff10" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={20}
                  tick={{ fill: '#6b7280', fontWeight: 600, letterSpacing: '0.1em' }}
                />
                <YAxis 
                  stroke="#ffffff10" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value/1000}k`}
                  tick={{ fill: '#6b7280', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 5, 5, 0.95)', 
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '28px',
                    fontSize: '11px',
                    padding: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 700 }}
                  cursor={{ stroke: '#10b98140', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  strokeWidth={4}
                  animationDuration={3000}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#050505' }}
                  activeDot={{ r: 8, fill: '#10b981', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Side Intelligence Panel */}
        <div className="lg:col-span-4 space-y-8">
          {/* Inventory Radar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 glass-card relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Database className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em]">Inventory Radar</h3>
              </div>
              <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4 relative z-10">
              {inventory.map((alert, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 group/item hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-all duration-500 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200 group-hover/item:text-white transition-colors">{alert.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        alert.status === 'critical' ? 'bg-red-500' : 
                        alert.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'
                      )} />
                      Stock Level
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-4 py-2 rounded-xl border transition-all duration-500",
                    alert.status === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400 group-hover/item:bg-red-500/20' : 
                    alert.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 group-hover/item:bg-yellow-500/20' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover/item:bg-emerald-500/20'
                  )}>
                    {alert.stock}
                  </span>
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-white/[0.03] hover:bg-emerald-500 text-gray-400 hover:text-white border border-white/10 hover:border-emerald-500 rounded-2xl text-[11px] font-bold transition-all duration-500 uppercase tracking-[0.3em] shadow-lg hover:shadow-emerald-500/20 group/btn">
              <span className="flex items-center justify-center gap-2">
                <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                Initialize Inventory Audit
              </span>
            </button>
          </motion.div>

          {/* Quick Intelligence Actions */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FileText, label: 'Reports', color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
              { icon: Zap, label: 'Growth', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
              { icon: Search, label: 'Insights', color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/10' },
              { icon: Plus, label: 'Add Data', color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
            ].map((action, i) => (
              <motion.button 
                key={i} 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-8 glass-card flex flex-col items-center justify-center gap-4 group transition-all duration-500 shadow-xl",
                  action.bg,
                  action.border,
                  "hover:border-white/30"
                )}
              >
                <div className="relative">
                  <action.icon className={cn("w-8 h-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", action.color)} />
                  <div className={cn("absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500", action.color.replace('text', 'bg'))} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-[0.2em] transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Intelligence Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Recent Decisions (Projects) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl group hover:border-blue-500/20 transition-all duration-700"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-3xl font-light tracking-tight">Active <span className="font-medium text-blue-500">Decisions</span></h3>
            </div>
            <button className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors flex items-center gap-2 group/link">
              View All Archive
              <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
            </button>
          </div>
          
          <div className="space-y-5">
            {projects.map((project, i) => (
              <motion.div 
                key={project.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center justify-between p-7 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/[0.04] transition-all duration-500 group/item cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/5 group-hover/item:border-blue-500/30 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    <CheckCircle2 className="w-8 h-8 text-gray-700 group-hover/item:text-blue-500 transition-all duration-500 relative z-10" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-200 group-hover/item:text-white transition-colors">{project.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {project.status}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-gray-800" />
                      <span className="text-[11px] text-gray-600 uppercase tracking-widest font-bold">
                        {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover/item:border-blue-500/30 group-hover/item:bg-blue-500/10 transition-all duration-500">
                  <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover/item:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Wall (Documents) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl group hover:border-emerald-500/20 transition-all duration-700"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Cpu className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-light tracking-tight">Intelligence <span className="font-medium text-emerald-500">Wall</span></h3>
            </div>
            <button className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.2em] hover:text-emerald-400 transition-colors flex items-center gap-2 group/link">
              Neural Sync
              <Activity className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {documents.map((doc, i) => (
              <motion.div 
                key={doc.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="flex items-center gap-6 p-7 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-all duration-500 cursor-pointer group/item"
              >
                <div className="w-16 h-16 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/10 group-hover/item:bg-emerald-500/20 group-hover/item:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse opacity-0 group-hover/item:opacity-100" />
                  <FileText className="w-8 h-8 text-emerald-500 relative z-10" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-200 group-hover/item:text-white transition-colors">{doc.name}</h4>
                  <div className="flex items-center gap-5 mt-2">
                    <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {doc.type}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                    <span className="text-[11px] text-gray-600 uppercase tracking-widest font-bold">
                      {doc.uploadedAt?.toDate ? doc.uploadedAt.toDate().toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover/item:border-emerald-500/30 group-hover/item:bg-emerald-500/10 transition-all duration-500">
                  <ArrowDownRight className="w-5 h-5 text-gray-700 group-hover/item:text-white transition-colors rotate-[-45deg]" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
