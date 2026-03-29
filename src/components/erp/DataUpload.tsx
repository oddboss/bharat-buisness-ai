import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Database, BarChart3, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadStatus {
  step: 'idle' | 'uploading' | 'parsing' | 'classifying' | 'activating' | 'success' | 'error';
  message: string;
}

export function DataUpload() {
  const [status, setStatus] = useState<UploadStatus>({ step: 'idle', message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileUpload = async (file: File) => {
    setStatus({ step: 'uploading', message: `Uploading ${file.name}...` });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      setStatus({ step: 'parsing', message: 'Extracting structured data...' });
      await new Promise(r => setTimeout(r, 800));
      
      setStatus({ step: 'classifying', message: `AI detected ${result.domain} domain...` });
      await new Promise(r => setTimeout(r, 800));
      
      setStatus({ step: 'activating', message: 'Populating ERP modules & training AI...' });
      await new Promise(r => setTimeout(r, 1000));
      
      setStatus({ step: 'success', message: `System Activated! ${result.rowsProcessed} records processed.` });
      
      setPreviewData(result.preview);

      // Refresh data in other components if needed
      // In a real app, we might use a global state or event emitter
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ step: 'error', message: 'Failed to process document.' });
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#111111] p-6 rounded-xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-2">Upload Business Data</h2>
        <p className="text-sm text-gray-400 mb-6">Drop your Excel, CSV, or PDF reports to activate the ERP system instantly.</p>

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center text-center cursor-pointer",
            isDragging ? "border-purple-500 bg-purple-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]",
            status.step !== 'idle' && status.step !== 'success' && status.step !== 'error' ? "pointer-events-none opacity-50" : ""
          )}
        >
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".csv,.xlsx,.xls,.pdf"
          />
          
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            {status.step === 'idle' && <Upload className="w-8 h-8 text-gray-400" />}
            {status.step === 'success' && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
            {status.step === 'error' && <AlertCircle className="w-8 h-8 text-red-500" />}
            {['uploading', 'parsing', 'classifying', 'activating'].includes(status.step) && (
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            )}
          </div>

          <h3 className="text-lg font-medium text-white mb-1">
            {status.step === 'idle' ? 'Drag & drop business files' : status.message}
          </h3>
          <p className="text-sm text-gray-500">
            {status.step === 'idle' ? 'Supports .xlsx, .csv, and PDF invoices' : 'Please wait while we process your data'}
          </p>
        </div>
      </div>

      {status.step === 'success' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-emerald-500/70 font-medium uppercase tracking-wider">Database</p>
              <p className="text-sm text-white font-semibold">1,240 Rows Inserted</p>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-blue-500/70 font-medium uppercase tracking-wider">Analytics</p>
              <p className="text-sm text-white font-semibold">12 Charts Generated</p>
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-purple-500/70 font-medium uppercase tracking-wider">AI Training</p>
              <p className="text-sm text-white font-semibold">Forecast Model Ready</p>
            </div>
          </div>
        </div>
      )}

      {previewData && previewData.length > 0 && (
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden animate-in fade-in duration-700">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Data Ingestion Preview</h3>
            <span className="text-xs text-gray-500">Detected Domain: {status.message.includes('inventory') ? 'Inventory' : status.message.includes('crm') ? 'CRM' : 'Business Data'}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/5">
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="px-4 py-3 font-medium capitalize">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-300 divide-y divide-white/5">
                {previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="px-4 py-3">
                        {typeof value === 'number' && (key => key.toLowerCase().includes('price') || key.toLowerCase().includes('spent') || key.toLowerCase().includes('revenue'))(Object.keys(row)[j])
                          ? `₹${value.toLocaleString()}`
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
