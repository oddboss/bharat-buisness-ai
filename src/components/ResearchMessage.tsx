import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import { ChevronDown, ChevronUp, Search, FileText, Database, CheckCircle, ExternalLink, Link2, BookOpen, Target, Loader2, Presentation, Table, Activity, ShieldAlert, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { VisualAnalytics } from './VisualAnalytics';
import { ExportMenu } from './ExportMenu';
import { BusinessDashboard } from './erp/BusinessDashboard';

interface ResearchSections {
  summary: string | null;
  insights: string | null;
  risks: string | null;
  analysis: string | null;
  recommendation: string | null;
  sources: string | null;
  nextQuestions: string | null;
}

function parseResearchContent(content: string): ResearchSections {
  const sections: ResearchSections = {
    summary: null,
    insights: null,
    risks: null,
    analysis: null,
    recommendation: null,
    sources: null,
    nextQuestions: null,
  };

  const extractSection = (startHeading: string, nextHeadings: string[]) => {
    const startIdx = content.indexOf(startHeading);
    if (startIdx === -1) return null;

    let endIdx = content.length;
    for (const nextHeading of nextHeadings) {
      const idx = content.indexOf(nextHeading, startIdx + startHeading.length);
      if (idx !== -1 && idx < endIdx) {
        endIdx = idx;
      }
    }

    return content.slice(startIdx + startHeading.length, endIdx).trim();
  };

  // Final Answer Engine Sections
  sections.summary = extractSection('1. 🔥 Executive Summary', ['2. 📊 Key Insights', '3. ⚠️ Risks', '4. 📈 Market + Business Analysis', '5. 💡 Strategic Recommendation', '6. 🔗 Sources', '7. ➡️ Next Questions']);
  sections.insights = extractSection('2. 📊 Key Insights', ['3. ⚠️ Risks', '4. 📈 Market + Business Analysis', '5. 💡 Strategic Recommendation', '6. 🔗 Sources', '7. ➡️ Next Questions']);
  sections.risks = extractSection('3. ⚠️ Risks', ['4. 📈 Market + Business Analysis', '5. 💡 Strategic Recommendation', '6. 🔗 Sources', '7. ➡️ Next Questions']);
  sections.analysis = extractSection('4. 📈 Market + Business Analysis', ['5. 💡 Strategic Recommendation', '6. 🔗 Sources', '7. ➡️ Next Questions']);
  sections.recommendation = extractSection('5. 💡 Strategic Recommendation', ['6. 🔗 Sources', '7. ➡️ Next Questions']);
  sections.sources = extractSection('6. 🔗 Sources', ['7. ➡️ Next Questions']);
  sections.nextQuestions = extractSection('7. ➡️ Next Questions', []);

  return sections;
}

function ActionButtons({ content }: { content: string }) {
  const actions = [
    { id: 'ppt', label: 'Generate PPT', icon: Presentation, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { id: 'web', label: 'Build Website', icon: ExternalLink, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'report', label: 'Export Report', icon: FileText, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'excel', label: 'Create Excel Analysis', icon: Table, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
      {actions.map(action => (
        <button
          key={action.id}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95",
            action.color
          )}
          onClick={() => alert(`${action.label} initiated based on this intelligence.`)}
        >
          <action.icon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ResearchMessage({ content, isTranslating, onTranslate }: { content: string, isTranslating?: boolean, onTranslate?: (lang: string) => void }) {
  const dashboardData = useMemo(() => {
    try {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Basic validation to ensure it's our dashboard structure
        if (parsed.metrics || parsed.charts || parsed.insights) {
          return parsed;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [content]);

  const sections = parseResearchContent(content);
  
  // If we have dashboard data, render the dashboard
  if (dashboardData) {
    return (
      <div className="space-y-6 w-full max-w-4xl relative">
        {isTranslating && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="text-sm font-medium text-emerald-400 animate-pulse">Translating Intelligence...</span>
            </div>
          </div>
        )}
        <BusinessDashboard data={dashboardData} />
        <ExportMenu content={content} onTranslate={onTranslate} isTranslating={isTranslating} />
      </div>
    );
  }

  // If no structured sections are found, fallback to standard markdown
  if (!sections.summary && !sections.insights && !sections.recommendation) {
    return (
      <div className="space-y-6 w-full max-w-3xl relative">
        {isTranslating && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="text-sm font-medium text-emerald-400 animate-pulse">Translating Intelligence...</span>
            </div>
          </div>
        )}
        <VisualAnalytics content={content} />
        <div className="markdown-body">
          <Markdown>{content}</Markdown>
        </div>
        <ActionButtons content={content} />
        <ExportMenu content={content} onTranslate={onTranslate} />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-3xl relative pb-12">
      {isTranslating && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-sm font-medium text-emerald-400 animate-pulse">Translating Intelligence...</span>
          </div>
        </div>
      )}

      {/* 1. Executive Summary */}
      {sections.summary && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Executive Summary</span>
          </div>
          <p className="text-xl md:text-2xl font-medium text-white leading-tight tracking-tight">
            {sections.summary.replace(/^- /, '')}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Key Insights */}
        {sections.insights && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Key Insights</span>
            </div>
            <div className="space-y-3">
              {sections.insights.split('\n').filter(l => l.trim()).map((insight, i) => (
                <div key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-1.5 shrink-0" />
                  {insight.replace(/^- /, '')}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. Risks */}
        {sections.risks && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Critical Risks</span>
            </div>
            <div className="space-y-3">
              {sections.risks.split('\n').filter(l => l.trim()).map((risk, i) => (
                <div key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5 shrink-0" />
                  {risk.replace(/^- /, '')}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. Market + Business Analysis */}
      {sections.analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <LineChart className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Market & Business Analysis</span>
          </div>
          <VisualAnalytics content={sections.analysis} />
          <div className="markdown-body mt-6">
            <Markdown>{sections.analysis}</Markdown>
          </div>
        </motion.div>
      )}

      {/* 5. Strategic Recommendation */}
      {sections.recommendation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Strategic Recommendation</span>
          </div>
          <div className="text-lg font-medium text-amber-100 leading-relaxed">
            <Markdown>{sections.recommendation}</Markdown>
          </div>
        </motion.div>
      )}

      {/* 6. Sources */}
      {sections.sources && <SourcesSection content={sections.sources} />}

      {/* 7. Next Questions */}
      {sections.nextQuestions && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 block">Next Questions</span>
          <div className="flex flex-wrap gap-2">
            {sections.nextQuestions.split('\n').filter(l => l.trim()).map((q, i) => (
              <button 
                key={i}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                onClick={() => alert(`Searching: ${q}`)}
              >
                {q.replace(/^- /, '')}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <ExportMenu content={content} onTranslate={onTranslate} isTranslating={isTranslating} />
      <ActionButtons content={content} />
    </div>
  );
}

function ThinkingSection({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse steps from thinking content
  const steps = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).map(line => line.replace(/^[•-]\s*/, '').trim());

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1a1a1a]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="font-medium text-sm tracking-wide uppercase">Researching</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
              {idx === 0 ? <Search className="w-4 h-4 mt-0.5 text-blue-400" /> : 
               idx === 1 ? <Database className="w-4 h-4 mt-0.5 text-purple-400" /> :
               idx === 2 ? <FileText className="w-4 h-4 mt-0.5 text-amber-400" /> :
               <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400" />}
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesSection({ content }: { content: string }) {
  // Parse sources. Format is typically:
  // 1. Website name — Article Title
  // URL
  const sources: { name: string, title: string, url: string }[] = [];
  
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\./.test(line)) {
      // It's a source title line
      const parts = line.replace(/^\d+\.\s*/, '').split('—');
      const name = parts[0]?.trim() || 'Source';
      const title = parts.slice(1).join('—').trim() || name;
      
      // Look ahead for URL
      let url = '';
      if (i + 1 < lines.length && (lines[i+1].startsWith('http') || lines[i+1].startsWith('www'))) {
        url = lines[i+1];
        i++; // Skip the URL line
      }
      
      sources.push({ name, title, url });
    }
  }

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-wider px-1">
        <BookOpen className="w-4 h-4" />
        <span>Sources Discovered</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.map((source, idx) => (
          <a 
            key={idx} 
            href={source.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "block p-4 rounded-xl border border-white/10 bg-[#1e1e1e] hover:bg-[#252525] transition-all group",
              !source.url && "pointer-events-none"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-medium text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                {source.title}
              </div>
              {source.url && <ExternalLink className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-emerald-400" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-gray-300">
                {source.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{source.name}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function EvidenceSection({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const points = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).map(line => line.replace(/^[•-]\s*/, '').trim());

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#151515]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Evidence Extracted</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-2">
          {points.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 flex-shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CitationsSection({ content }: { content: string }) {
  const citations: { id: string, text: string, url: string }[] = [];
  
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\[(\d+)\]\s*(.*)/);
    if (match) {
      const id = match[1];
      const text = match[2];
      
      let url = '';
      if (i + 1 < lines.length && (lines[i+1].startsWith('http') || lines[i+1].startsWith('www'))) {
        url = lines[i+1];
        i++;
      }
      
      citations.push({ id, text, url });
    }
  }

  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
        <Link2 className="w-4 h-4" />
        <span>References</span>
      </div>
      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm">
            <span className="text-emerald-500/70 font-mono text-xs mt-0.5">[{citation.id}]</span>
            <div className="flex-1">
              <span className="text-gray-400">{citation.text}</span>
              {citation.url && (
                <a href={citation.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-emerald-400/70 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors">
                  <span className="truncate max-w-[200px] inline-block align-bottom">{citation.url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
