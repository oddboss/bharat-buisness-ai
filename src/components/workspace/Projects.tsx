import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Search, 
  Calendar, 
  User, 
  MessageSquare, 
  FileText,
  ChevronRight,
  Loader2,
  Trash2
} from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { db, collection, onSnapshot, setDoc, doc, deleteDoc, Timestamp, query, orderBy, handleFirestoreError, OperationType } from '../../firebase';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Project {
  id: string;
  title: string;
  client: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  deadline: string;
  tasks: Task[];
  description: string;
  linkedChats: number;
  documents: number;
  organizationId: string;
  createdAt: any;
  progress: number;
}

export function Projects() {
  const { organizationId } = useFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    status: 'Planning',
    progress: 0
  });

  useEffect(() => {
    if (!organizationId) return;

    const q = query(
      collection(db, 'organizations', organizationId, 'projects'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectData: Project[] = [];
      snapshot.forEach((doc) => {
        projectData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `organizations/${organizationId}/projects`);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const handleAddProject = async () => {
    if (newProject.title && organizationId) {
      const projectId = Date.now().toString();
      const path = `organizations/${organizationId}/projects/${projectId}`;
      
      try {
        const project: Project = {
          id: projectId,
          organizationId,
          title: newProject.title,
          client: newProject.client || 'Internal',
          status: newProject.status || 'Planning',
          deadline: newProject.deadline || '',
          description: newProject.description || '',
          tasks: [],
          linkedChats: 0,
          documents: 0,
          progress: 0,
          createdAt: Timestamp.now()
        };

        await setDoc(doc(db, 'organizations', organizationId, 'projects', projectId), project);
        setIsAdding(false);
        setNewProject({ status: 'Planning', progress: 0 });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!organizationId) return;
    const path = `organizations/${organizationId}/projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading Projects...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-white/40 mt-1">Track and manage your business initiatives.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search projects..."
              className="glass-input pl-10 h-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  project.status === 'Completed' ? 'bg-emerald-500/10' :
                  project.status === 'In Progress' ? 'bg-blue-500/10' :
                  'bg-white/5'
                }`}>
                  <Briefcase className={`w-5 h-5 ${
                    project.status === 'Completed' ? 'text-emerald-500' :
                    project.status === 'In Progress' ? 'text-blue-500' :
                    'text-white/40'
                  }`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{project.title}</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{project.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="text-white/20 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-white/40 leading-relaxed mb-6 line-clamp-2">
              {project.description}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  className={`h-full ${
                    project.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Calendar className="w-3.5 h-3.5" />
                <span>{project.deadline}</span>
              </div>
              <div className="flex items-center gap-4 justify-end">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{project.linkedChats}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{project.documents}</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
              <span>View Details</span>
              <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Project Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q1 Marketing Strategy"
                    className="glass-input"
                    value={newProject.title || ''}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Client</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Corp"
                    className="glass-input"
                    value={newProject.client || ''}
                    onChange={e => setNewProject({...newProject, client: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Deadline</label>
                  <input 
                    type="date" 
                    className="glass-input"
                    value={newProject.deadline || ''}
                    onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Description</label>
                  <textarea 
                    placeholder="Briefly describe the project goals..."
                    className="glass-input h-24 resize-none"
                    value={newProject.description || ''}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProject}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
