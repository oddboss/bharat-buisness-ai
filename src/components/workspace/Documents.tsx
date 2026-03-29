import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Upload, 
  Search, 
  MoreVertical, 
  Trash2, 
  Download, 
  Eye, 
  File, 
  FileSpreadsheet, 
  FileCode,
  Zap,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Activity,
  Shield,
  Cpu,
  Radar,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Clock
} from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';
import { cn } from '../../lib/utils';

interface Document {
  id: string;
  organizationId: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'csv';
  size: string;
  uploadedAt: any;
  status: 'ready' | 'analyzing' | 'error';
  insights?: string[];
  url: string;
}

export function Documents() {
  const { db, organizationId } = useFirebase();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!db || !organizationId) return;

    const path = `organizations/${organizationId}/documents`;
    const q = query(collection(db, path), orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      setDocuments(docsData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      setError('Failed to load documents');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, organizationId]);

  const handleUpload = async () => {
    if (!db || !organizationId) return;
    
    setIsUploading(true);
    const docId = Date.now().toString();
    const path = `organizations/${organizationId}/documents`;
    
    try {
      const newDoc: Partial<Document> = {
        id: docId,
        organizationId,
        name: 'New Business Proposal.docx',
        type: 'doc',
        size: '850 KB',
        uploadedAt: serverTimestamp(),
        status: 'analyzing',
        url: 'https://example.com/placeholder-doc.docx' // Placeholder URL
      };

      await setDoc(doc(db, path, docId), newDoc);
      
      // Simulate AI analysis completion after a delay
      setTimeout(async () => {
        try {
          await setDoc(doc(db, path, docId), {
            id: docId,
            status: 'ready',
            insights: [
              'Proposal structure is professional.', 
              'Budget section needs more detail.', 
              'Timeline is realistic.'
            ]
          }, { merge: true });
        } catch (err) {
          console.error('Failed to update analysis status:', err);
        }
      }, 5000);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${path}/${docId}`);
      setError('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !organizationId) return;
    
    const path = `organizations/${organizationId}/documents`;
    try {
      if (selectedDoc?.id === id) setSelectedDoc(null);
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
      setError('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
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
            <Shield className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Secure Document Vault</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white leading-none">
            Neural <span className="text-emerald-500 font-medium italic">Vault</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Store and analyze your business files with advanced neural intelligence.</p>
        </div>
        
        <div className="flex items-center gap-6 p-2 glass-card shadow-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search neural vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-12 pr-6 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:text-white transition-all w-64"
            />
          </div>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20 group active:scale-[0.98]"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-400 text-sm font-medium relative z-10"
        >
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Dismiss</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {filteredDocs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-24 rounded-[4rem] border border-dashed border-white/10 bg-white/[0.01] text-center space-y-6 group hover:border-emerald-500/20 transition-colors duration-700"
            >
              <div className="w-24 h-24 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-12 h-12 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-light text-gray-400 tracking-tight">Vault is Empty</h3>
                <p className="text-sm text-gray-600 mt-2 font-medium">Upload your first file to initialize neural analysis.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredDocs.map((doc, i) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={cn(
                    "p-6 glass-card transition-all duration-500 cursor-pointer group relative overflow-hidden",
                    selectedDoc?.id === doc.id 
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-500/10' 
                      : 'hover:border-white/20 hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border",
                        doc.type === 'pdf' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        doc.type === 'xls' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      )}>
                        {doc.type === 'pdf' ? <FileText className="w-8 h-8" /> :
                         doc.type === 'xls' ? <FileSpreadsheet className="w-8 h-8" /> :
                         <File className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className={cn(
                          "text-xl font-light tracking-tight transition-colors duration-500",
                          selectedDoc?.id === doc.id ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'
                        )}>{doc.name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">{doc.type}</span>
                          <span className="text-gray-700">•</span>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">{doc.size}</span>
                          <span className="text-gray-700">•</span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">
                            <Clock className="w-3 h-3" />
                            {doc.uploadedAt?.toDate ? doc.uploadedAt.toDate().toLocaleDateString() : 'Just now'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {doc.status === 'analyzing' ? (
                        <div className="flex items-center gap-3 px-5 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-blue-500/20 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Analyzing</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Neural Ready</span>
                        </div>
                      )}
                      <button 
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {selectedDoc ? (
              <motion.div 
                key={selectedDoc.id}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl hover:border-emerald-500/20 transition-all duration-700 sticky top-8"
              >
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Zap className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-light text-white tracking-tight">Neural <span className="text-emerald-500 font-medium italic">Insights</span></h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">Automated Intelligence Extraction</p>
                  </div>
                </div>

                {selectedDoc.status === 'analyzing' ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                      <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-base text-gray-400 font-medium leading-relaxed">BharatMind is extracting neural intelligence from your document...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {selectedDoc.insights?.map((insight, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-4 p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 group/insight"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover/insight:scale-125 transition-transform" />
                          <p className="text-base text-gray-300 group-hover/insight:text-white leading-relaxed font-medium transition-colors">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="pt-10 space-y-4">
                      <button className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 group/ask">
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Ask AI about this doc
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <a 
                          href={selectedDoc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </a>
                        <a 
                          href={selectedDoc.url} 
                          download
                          className="py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[600px] bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem] p-12 flex flex-col items-center justify-center text-center space-y-8 group hover:border-white/20 transition-colors duration-700"
              >
                <div className="w-24 h-24 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Radar className="w-12 h-12 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-gray-500 uppercase tracking-[0.4em]">No Selection</h3>
                  <p className="text-sm text-gray-600 mt-4 font-medium leading-relaxed max-w-[200px] mx-auto">Select a document to initialize neural insights and analysis.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
